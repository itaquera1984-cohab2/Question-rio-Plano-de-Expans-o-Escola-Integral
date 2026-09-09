import express from "express";
import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { GoogleGenAI } from "@google/genai";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import PDFDocument from "pdfkit";
import dotenv from "dotenv";
import {
  OFFICIAL_SCHOOL_UNITS,
  findSchoolById,
  findSchoolByLogin,
  validateSchoolCredentials,
  normalizeText,
} from "./src/data/schoolsData";
import {
  generateCSVString,
  generateTextSummary,
} from "./src/utils/helpers";
import { generateQuestionnairePdfBuffer } from "./src/utils/pdfQuestionnaireGenerator";

dotenv.config();

// Supabase client helper
let supabase: SupabaseClient | null = null;
let authSupabase: SupabaseClient | null = null;
function getSupabase(): SupabaseClient | null {
  if (supabase) return supabase;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.SUPABASE_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY;

  if (url && key) {
    try {
      supabase = createClient(url, key);
      return supabase;
    } catch (e) {
      console.warn("Could not initialize Supabase on server:", e);
    }
  }
  return null;
}

function getAuthSupabase(): SupabaseClient | null {
  if (authSupabase) return authSupabase;
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceRoleKey) return null;
  try {
    authSupabase = createClient(url, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    return authSupabase;
  } catch (error) {
    console.warn("Could not initialize protected Supabase authentication client:", error);
    return null;
  }
}

const PRIMARY_BUCKET = process.env.SUPABASE_STORAGE_BUCKET?.trim() || "GT-SME RICO";
const REPORTS_FOLDER = (process.env.SUPABASE_STORAGE_FOLDER?.trim() || "protocolos").replace(/^\/+|\/+$/g, "");
const FALLBACK_BUCKETS = [PRIMARY_BUCKET, "GT-SME RICO", "relatorios_diagnostico", "relatorios", "diagnosticos", "respostas_questionario", "protocolos", "public", "storage"];

function constantTimeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer);
}

function validateAdminCredentials(login: string, password: string): boolean {
  const expectedLogin = process.env.ADMIN_LOGIN?.trim() || "";
  const expectedPassword = process.env.ADMIN_PASSWORD || "";
  if (!expectedLogin || !expectedPassword) return false;
  return constantTimeEqual(normalizeText(login), normalizeText(expectedLogin)) &&
    constantTimeEqual(password, expectedPassword);
}

function hashSchoolPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const derivedKey = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${derivedKey}`;
}

function verifySchoolPassword(password: string, storedHash: string): boolean {
  try {
    const [algorithm, salt, expectedHex] = storedHash.split("$");
    if (algorithm !== "scrypt" || !salt || !expectedHex) return false;
    const actual = scryptSync(password, salt, 64);
    const expected = Buffer.from(expectedHex, "hex");
    return actual.length === expected.length && timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

function getNewPasswordError(password: string): string | null {
  if (password.length < 10) return "A nova senha deve ter pelo menos 10 caracteres.";
  if (!/[a-z]/.test(password)) return "A nova senha deve conter uma letra minúscula.";
  if (!/[A-Z]/.test(password)) return "A nova senha deve conter uma letra maiúscula.";
  if (!/\d/.test(password)) return "A nova senha deve conter um número.";
  if (!/[^A-Za-z0-9]/.test(password)) return "A nova senha deve conter um caractere especial.";
  return null;
}

async function sendEmailThroughResend(params: {
  subject: string;
  html: string;
  attachments?: Array<{ filename: string; content: string }>;
  idempotencyKey: string;
}): Promise<{ success: boolean; id?: string; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.REPORT_EMAIL_TO?.trim();
  const from = process.env.REPORT_EMAIL_FROM?.trim();
  if (!apiKey || !to || !from) {
    return { success: false, error: "Envio por e-mail não configurado no servidor." };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": params.idempotencyKey.slice(0, 256),
      },
      body: JSON.stringify({
        from,
        to: [to],
        subject: params.subject,
        html: params.html,
        attachments: params.attachments,
      }),
    });
    const result = await response.json().catch(() => null) as { id?: string; message?: string } | null;
    if (!response.ok || !result?.id) {
      return { success: false, error: result?.message || `Falha no provedor de e-mail (HTTP ${response.status}).` };
    }
    return { success: true, id: result.id };
  } catch (error: any) {
    return { success: false, error: error?.message || "Não foi possível acessar o provedor de e-mail." };
  }
}

async function emailSchoolReport(formData: any): Promise<{ success: boolean; id?: string; error?: string }> {
  const csvContent = generateCSVString(formData);
  const txtContent = generateTextSummary(formData);
  const pdfContent = await generatePdfBuffer(txtContent);
  const fileBaseName = getReportFileBaseName(formData);
  const schoolName = String(formData.schoolName || "Unidade Escolar");
  const protocol = String(formData.protocolNumber || "sem-protocolo");

  return sendEmailThroughResend({
    subject: `Diagnóstico de Educação Integral — ${schoolName} — ${protocol}`,
    idempotencyKey: `relatorio-${formData.id || protocol}`,
    html: `<h2>Relatório final do Diagnóstico da Política de Educação Integral</h2><p><strong>Unidade:</strong> ${schoolName.replace(/[<>&]/g, "")}</p><p><strong>Protocolo:</strong> ${protocol.replace(/[<>&]/g, "")}</p><p>Os relatórios oficiais seguem anexos nos formatos PDF, CSV e TXT.</p>`,
    attachments: [
      { filename: `${fileBaseName}.pdf`, content: pdfContent.toString("base64") },
      { filename: `${fileBaseName}.csv`, content: Buffer.from(csvContent, "utf8").toString("base64") },
      { filename: `${fileBaseName}.txt`, content: Buffer.from(txtContent, "utf8").toString("base64") },
    ],
  });
}

function getSessionSecret(): string {
  return process.env.SESSION_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

function createSchoolSessionToken(schoolId: string, isMasterAccess: boolean): string {
  const secret = getSessionSecret();
  if (!secret) throw new Error("SESSION_SECRET or SUPABASE_SERVICE_ROLE_KEY is required");
  const payload = Buffer.from(JSON.stringify({ schoolId, isMasterAccess, exp: Date.now() + 8 * 60 * 60 * 1000 })).toString("base64url");
  const signature = createHmac("sha256", secret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function readSchoolSession(req: express.Request): { schoolId: string; isMasterAccess: boolean } | null {
  try {
    const token = String(req.headers.authorization || "").replace(/^Bearer\s+/i, "");
    const [payload, suppliedSignature] = token.split(".");
    const secret = getSessionSecret();
    if (!payload || !suppliedSignature || !secret) return null;
    const expectedSignature = createHmac("sha256", secret).update(payload).digest("base64url");
    if (!constantTimeEqual(suppliedSignature, expectedSignature)) return null;
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!parsed.schoolId || !parsed.exp || parsed.exp < Date.now()) return null;
    return { schoolId: String(parsed.schoolId), isMasterAccess: Boolean(parsed.isMasterAccess) };
  } catch {
    return null;
  }
}

/**
 * Ensures a valid Supabase Storage bucket is available or created
 */
async function getOrEnsureStorageBucket(db: SupabaseClient): Promise<string> {
  try {
    const { data: buckets, error: listErr } = await db.storage.listBuckets();
    if (!listErr && Array.isArray(buckets)) {
      const foundPrimary = buckets.find((b) => b.name === PRIMARY_BUCKET || b.id === PRIMARY_BUCKET);
      if (foundPrimary) {
        return foundPrimary.name;
      }

      // Check if any fallback bucket exists
      for (const fallback of FALLBACK_BUCKETS) {
        const foundFallback = buckets.find((b) => b.name === fallback || b.id === fallback);
        if (foundFallback) {
          return foundFallback.name;
        }
      }
    }

    // Try creating the primary bucket if it doesn't exist
    const { data: newBucket, error: createErr } = await db.storage.createBucket(PRIMARY_BUCKET, {
      public: true,
      fileSizeLimit: 10485760, // 10MB
    });

    if (!createErr && newBucket) {
      console.log(`Supabase Storage bucket '${PRIMARY_BUCKET}' created successfully.`);
      return PRIMARY_BUCKET;
    }
  } catch (err) {
    console.warn("Could not list or create storage bucket automatically:", err);
  }

  return PRIMARY_BUCKET;
}

function sanitizeStoragePath(filePath: string): string {
  if (!filePath) return `arquivo_${Date.now()}.json`;
  let clean = filePath.trim().replace(/^\/+/, '');
  if (clean.startsWith(`${PRIMARY_BUCKET}/`)) {
    clean = clean.substring(PRIMARY_BUCKET.length + 1).replace(/^\/+/, '');
  }
  clean = clean.replace(/\/+/g, '/');
  return clean.replace(/^\/+/, '');
}

function simplifyFileNamePart(value: string, maxWords?: number): string {
  const withoutAccents = value
    .replace(/^Ã‚/, 'A')
    .replace(/^Â/, 'A')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s.-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\bngelo\b/gi, 'Angelo');
  const ignored = new Set(['da', 'das', 'de', 'do', 'dos', 'e', 'dr', 'dra', 'prof', 'profa', 'professor', 'professora', 'em', 'emei', 'emef']);
  const words = withoutAccents.split(' ').filter((word) => !ignored.has(word.toLowerCase().replace(/\.$/, '')));
  return (maxWords ? words.slice(0, maxWords) : words).join(' ');
}

function getReportFileBaseName(formData: any): string {
  const school = simplifyFileNamePart(String(formData.schoolName || 'Unidade Escolar'), 2) || 'Unidade Escolar';
  const respondentWords = simplifyFileNamePart(String(formData.directorName || 'Respondente')).split(' ').filter(Boolean);
  const respondent = respondentWords.length > 1
    ? `${respondentWords[0]} ${respondentWords.slice(1).map((word) => word.charAt(0)).join('.')}`
    : respondentWords[0] || 'Respondente';
  return `${school} - ${respondent}`;
}

function generatePdfBuffer(text: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const document = new PDFDocument({
      size: "A4",
      margins: { top: 48, bottom: 48, left: 48, right: 48 },
      bufferPages: true,
      info: { Title: "Relatório Técnico Homologado", Author: "Secretaria Municipal de Educação" },
    });
    const chunks: Buffer[] = [];

    document.on("data", (chunk: Buffer) => chunks.push(chunk));
    document.on("end", () => resolve(Buffer.concat(chunks)));
    document.on("error", reject);

    document.font("Helvetica").fontSize(9).fillColor("#1f2937");
    for (const line of text.split("\n")) {
      document.text(line.replace(/\r$/, ""), { width: 496, lineGap: 2 });
    }
    document.end();
  });
}

/**
 * Uploads CSV, TXT and PDF reports to Supabase Storage
 */
async function uploadAllReportArtifacts(
  db: SupabaseClient,
  formData: any,
  meta: { startTime?: string; endTime?: string; elapsedSeconds?: number; elapsedTimeFormatted?: string }
): Promise<{
  success: boolean;
  bucket: string;
  files: Array<{ name: string; path: string; publicUrl?: string; type: string }>;
  error?: string;
}> {
  const bucket = await getOrEnsureStorageBucket(db);
  const fileBaseName = getReportFileBaseName(formData);

  const csvContent = generateCSVString(formData);
  const txtContent = generateTextSummary(formData);
  const pdfContent = await generatePdfBuffer(txtContent);

  const uploadedFiles: Array<{ name: string; path: string; publicUrl?: string; type: string }> = [];
  const uploadErrors: string[] = [];

  const filesToUpload = [
    {
      fileName: `${fileBaseName}.csv`,
      uploadPath: sanitizeStoragePath(`${REPORTS_FOLDER}/${fileBaseName}.csv`),
      content: Buffer.from(csvContent, 'utf-8'),
      contentType: 'text/csv;charset=utf-8;',
      type: 'CSV Spreadsheet',
    },
    {
      fileName: `${fileBaseName}.txt`,
      uploadPath: sanitizeStoragePath(`${REPORTS_FOLDER}/${fileBaseName}.txt`),
      content: Buffer.from(txtContent, 'utf-8'),
      contentType: 'text/plain;charset=utf-8;',
      type: 'Official Text Summary',
    },
    {
      fileName: `${fileBaseName}.pdf`,
      uploadPath: sanitizeStoragePath(`${REPORTS_FOLDER}/${fileBaseName}.pdf`),
      content: pdfContent,
      contentType: 'application/pdf',
      type: 'Official PDF Report',
    },
  ];

  for (const item of filesToUpload) {
    try {
      const { data: uploadData, error: uploadErr } = await db.storage
        .from(bucket)
        .upload(item.uploadPath, item.content, {
          contentType: item.contentType,
          upsert: true,
        });

      if (!uploadErr && uploadData) {
        const { data: publicUrlData } = db.storage.from(bucket).getPublicUrl(uploadData.path || item.uploadPath);
        uploadedFiles.push({
          name: item.fileName,
          path: uploadData.path || item.uploadPath,
          publicUrl: publicUrlData?.publicUrl,
          type: item.type,
        });
      } else if (uploadErr) {
        uploadErrors.push(`${item.uploadPath}: ${uploadErr.message}`);
        console.warn(`[Supabase Storage] Upload error for ${item.uploadPath} in bucket '${bucket}':`, uploadErr.message);
      }
    } catch (e: any) {
      uploadErrors.push(`${item.uploadPath}: ${e?.message || String(e)}`);
      console.warn(`[Supabase Storage] Exception uploading ${item.uploadPath} to '${bucket}':`, e?.message || e);
    }
  }

  return {
    success: uploadedFiles.length === filesToUpload.length,
    bucket,
    files: uploadedFiles,
    error: uploadedFiles.length === filesToUpload.length
      ? undefined
      : uploadErrors.join("; ") || "Nem todos os artefatos foram gravados no Supabase Storage.",
  };
}

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "15mb" }));

  app.post("/api/admin/validate", (req, res) => {
    const login = String(req.body?.login || "");
    const password = String(req.body?.password || "");
    if (!validateAdminCredentials(login, password)) {
      return res.status(401).json({ success: false, error: "Credenciais administrativas inválidas." });
    }
    return res.json({ success: true });
  });

  app.post("/api/admin/test-email", async (req, res) => {
    const login = String(req.body?.login || "");
    const password = String(req.body?.password || "");
    if (!validateAdminCredentials(login, password)) {
      return res.status(401).json({ success: false, error: "Credenciais administrativas inválidas." });
    }
    const result = await sendEmailThroughResend({
      subject: "Teste de integração — Diagnóstico da Educação Integral",
      idempotencyKey: `teste-email-${Date.now()}`,
      html: "<h2>Teste de envio concluído</h2><p>Esta mensagem confirma a integração de e-mail do sistema de Diagnóstico da Política de Educação Integral da Rede Municipal de Pindamonhangaba.</p>",
    });
    return res.status(result.success ? 200 : 503).json(result);
  });

  // Supabase: Validate School Unit & Login
  app.post("/api/supabase/validate-school", async (req, res) => {
    try {
      const { schoolId, login, senha, sector } = req.body;
      const cleanLogin = (login || "").trim();
      const cleanSenha = String(senha || "");
      const selectedUnit = findSchoolById(String(schoolId || ""));
      const isMasterAccess = validateAdminCredentials(cleanLogin, cleanSenha);
      const targetUnit = isMasterAccess ? selectedUnit : selectedUnit || findSchoolByLogin(cleanLogin);

      if (!targetUnit || (!isMasterAccess && normalizeText(targetUnit.login) !== normalizeText(cleanLogin))) {
        return res.status(401).json({ success: false, error: "Login ou senha incorretos para a unidade selecionada." });
      }

      const db = getAuthSupabase();
      if (!db && !isMasterAccess) {
        return res.status(503).json({ success: false, error: "O serviço de autenticação está temporariamente indisponível." });
      }

      let unitRecord: { status?: string; senha_hash?: string | null } | null = null;
      if (db) {
        const { data, error } = await db
          .from("unidades_escolares")
          .select("id, nome_escola, oferta, status, setor, senha_hash")
          .eq("id", targetUnit.id)
          .maybeSingle();

        if (error) {
          console.error("School authentication query failed:", error.message);
          return res.status(503).json({ success: false, error: "Não foi possível consultar as credenciais da unidade. Verifique a configuração do Supabase." });
        }
        unitRecord = data;

        const validSchoolPassword = data?.senha_hash
          ? verifySchoolPassword(cleanSenha, data.senha_hash)
          : validateSchoolCredentials(targetUnit.id, cleanLogin, cleanSenha).success;
        if (!isMasterAccess && !validSchoolPassword) {
          return res.status(401).json({ success: false, error: "Login ou senha incorretos para a unidade selecionada." });
        }

        if (!isMasterAccess && data) {
          if (data.status === "CONCLUIDO" || data.status === "CONCLUÍDO") {
            return res.json({
              success: false,
              isCompleted: true,
              unit: {
                id: targetUnit.id,
                name: targetUnit.name,
                offer: targetUnit.offer,
                sector: targetUnit.sector || sector,
                login: targetUnit.login,
              },
              error: `Atenção: A unidade ${targetUnit.name} já enviou as respostas deste questionário. Para alterações de dados enviados, entre em contato com o Gabinete GT SME para solicitar a liberação de refazimento.`,
            });
          }
        }
      }

      return res.json({
        success: true,
        isMasterAccess,
        authToken: createSchoolSessionToken(targetUnit.id, isMasterAccess),
        unit: {
          id: targetUnit.id,
          name: targetUnit.name,
          offer: targetUnit.offer,
          sector: targetUnit.sector || sector,
          login: targetUnit.login,
        },
      });
    } catch (e: any) {
      console.error("Supabase validation error:", e);
      return res.status(500).json({ success: false, error: "Erro de validação. Tente novamente." });
    }
  });

  app.post("/api/supabase/change-password", async (req, res) => {
    try {
      const schoolId = String(req.body?.schoolId || "");
      const login = String(req.body?.login || "").trim();
      const currentPassword = String(req.body?.currentPassword || "");
      const newPassword = String(req.body?.newPassword || "");
      const targetUnit = findSchoolById(schoolId);
      const session = readSchoolSession(req);

      if (!session || session.isMasterAccess || session.schoolId !== schoolId || !targetUnit || normalizeText(targetUnit.login) !== normalizeText(login)) {
        return res.status(401).json({ success: false, error: "Unidade ou login inválido." });
      }
      const passwordError = getNewPasswordError(newPassword);
      if (passwordError) return res.status(400).json({ success: false, error: passwordError });
      if (constantTimeEqual(currentPassword, newPassword)) {
        return res.status(400).json({ success: false, error: "A nova senha deve ser diferente da senha atual." });
      }

      const db = getAuthSupabase();
      if (!db) return res.status(503).json({ success: false, error: "O serviço de autenticação está indisponível." });
      const { data, error } = await db.from("unidades_escolares").select("id, senha_hash").eq("id", targetUnit.id).maybeSingle();
      if (error || !data) {
        console.error("Password lookup failed:", error?.message);
        return res.status(503).json({ success: false, error: "Não foi possível consultar a credencial da unidade." });
      }

      const currentIsValid = data.senha_hash
        ? verifySchoolPassword(currentPassword, data.senha_hash)
        : validateSchoolCredentials(targetUnit.id, login, currentPassword).success;
      if (!currentIsValid) return res.status(401).json({ success: false, error: "A senha atual está incorreta." });

      const { error: updateError } = await db
        .from("unidades_escolares")
        .update({ senha_hash: hashSchoolPassword(newPassword), senha_alterada_em: new Date().toISOString() })
        .eq("id", targetUnit.id);
      if (updateError) {
        console.error("Password update failed:", updateError.message);
        return res.status(503).json({ success: false, error: "Não foi possível salvar a nova senha." });
      }
      return res.json({ success: true });
    } catch (e) {
      console.error("Password change error:", e);
      return res.status(500).json({ success: false, error: "Erro ao alterar a senha. Tente novamente." });
    }
  });

  // Supabase: Register Definite Submission
  app.post("/api/supabase/submit-survey", async (req, res) => {
    try {
      const { formData, startTime, endTime, elapsedSeconds, elapsedTimeFormatted } = req.body;
      const session = readSchoolSession(req);
      if (!session || !formData?.schoolId || session.schoolId !== String(formData.schoolId)) {
        return res.status(401).json({ success: false, error: "Sessão inválida ou incompatível com a unidade informada." });
      }
      const db = getAuthSupabase();

      if (db && formData) {
        // Normalize replicated fields for AMBOS offer
        if (formData.sphere === 'AMBOS') {
          formData.ef_04_territoryType = formData.ef_04_territoryType || formData.ei_19_territoryType || 'Urbano';
          formData.ef_05_socioeconomicProfile = formData.ef_05_socioeconomicProfile || formData.ei_20_socioeconomicProfile || 'Mistas';
          formData.ef_18_staffBreakdown = formData.ef_18_staffBreakdown || formData.ei_18_staffBreakdown || '';
        }

        // 1. INSERT in respostas_questionario
        const { error: insertErr } = await db.from("respostas_questionario").upsert([
          {
            id: formData.id || "srv_" + Date.now(),
            unidade_id: formData.schoolId,
            nome_escola: formData.schoolName,
            setor: formData.schoolSector,
            oferta: formData.sphere,
            responsavel_nome: formData.directorName,
            responsavel_cargo:
              formData.respondentRole === "PROFESSOR_CO_RESPONSAVEL"
                ? "Professor Co-Responsável"
                : "Diretor",
            responsavel_email: formData.directorEmail,
            responsavel_telefone: formData.directorPhone,
            horario_inicio: startTime,
            horario_termino: endTime,
            tempo_decorrido_segundos: elapsedSeconds,
            tempo_decorrido_formatado: elapsedTimeFormatted,
            protocolo: formData.protocolNumber,
            respostas_json: formData,
            data_envio: new Date().toISOString(),
          },
        ], { onConflict: "id" });

        if (insertErr) {
          console.error("Supabase insert failed in respostas_questionario:", insertErr);
          return res.status(503).json({ success: false, error: "Não foi possível registrar as respostas no banco de dados." });
        }

        // 2. Upload all official report artifacts before locking the questionnaire.
        let storageResult: any = null;
        try {
          storageResult = await uploadAllReportArtifacts(db, formData, {
            startTime,
            endTime,
            elapsedSeconds,
            elapsedTimeFormatted,
          });
        } catch (storageErr) {
          console.warn("Storage upload notice:", storageErr);
        }

        if (!storageResult?.success) {
          return res.status(503).json({
            success: false,
            error: storageResult?.error || "Falha ao gravar todos os relatórios no Supabase Storage.",
            storage: storageResult,
            filesUploaded: storageResult?.files || [],
          });
        }

        const emailResult = await emailSchoolReport(formData);
        if (!emailResult.success) {
          console.error("Report e-mail delivery failed:", emailResult.error);
          return res.status(503).json({
            success: false,
            error: `Os arquivos foram salvos no Supabase Storage, mas o envio por e-mail falhou: ${emailResult.error}`,
            storage: storageResult,
            filesUploaded: storageResult.files || [],
            email: emailResult,
          });
        }

        // 3. Lock the unit only after database, Storage and e-mail delivery succeed.
        const { error: updateErr } = await db
          .from("unidades_escolares")
          .update({
            status: "CONCLUIDO",
            responsavel_nome: formData.directorName,
            responsavel_cargo:
              formData.respondentRole === "PROFESSOR_CO_RESPONSAVEL"
                ? "Professor Co-Responsável"
                : "Diretor",
            protocolo: formData.protocolNumber,
            tempo_decorrido: elapsedTimeFormatted,
            updated_at: new Date().toISOString(),
          })
          .eq("id", formData.schoolId);
        if (updateErr) {
          console.error("School completion status update failed:", updateErr);
          return res.status(503).json({ success: false, error: "Os relatórios foram enviados, mas não foi possível concluir o protocolo da unidade." });
        }

        return res.json({
          success: true,
          storage: storageResult,
          storageBucket: storageResult?.bucket,
          filesUploaded: storageResult?.files || [],
          email: emailResult,
        });
      }

      return res.json({
        success: false,
        error: "Supabase não conectado ou credenciais não configuradas no servidor.",
      });
    } catch (e: any) {
      console.error("Submit survey server error:", e);
      return res.status(500).json({ success: false, error: e.message || "Falha ao enviar o questionário." });
    }
  });

  // Supabase Storage Diagnostic & Bucket Status Endpoint
  app.get("/api/supabase/storage-status", async (_req, res) => {
    try {
      const db = getSupabase();
      if (!db) {
        return res.json({
          configured: false,
          message: "Credenciais do Supabase não configuradas no ambiente do servidor.",
          buckets: [],
          files: [],
        });
      }

      // Check available buckets
      let bucketsList: any[] = [];
      try {
        const { data: buckets, error: bErr } = await db.storage.listBuckets();
        if (!bErr && Array.isArray(buckets)) {
          bucketsList = buckets;
        }
      } catch (err) {
        console.warn("Error listing storage buckets:", err);
      }

      const activeBucket = await getOrEnsureStorageBucket(db);

      // List files in the active bucket
      let filesList: any[] = [];
      let protocolosFiles: any[] = [];
      try {
        const { data: rootFiles, error: rErr } = await db.storage.from(activeBucket).list("", { limit: 100 });
        if (!rErr && Array.isArray(rootFiles)) {
          filesList = rootFiles;
        }

        const { data: protoFiles, error: pErr } = await db.storage.from(activeBucket).list("protocolos", { limit: 100 });
        if (!pErr && Array.isArray(protoFiles)) {
          protocolosFiles = protoFiles;
        }
      } catch (err) {
        console.warn("Error listing bucket files:", err);
      }

      // Query database table counts
      let unidadesCount = 0;
      let respostasCount = 0;
      try {
        const { count: uCount } = await db.from("unidades_escolares").select("*", { count: "exact", head: true });
        unidadesCount = uCount || 0;
        const { count: rCount } = await db.from("respostas_questionario").select("*", { count: "exact", head: true });
        respostasCount = rCount || 0;
      } catch (err) {
        console.warn("Error checking tables:", err);
      }

      return res.json({
        configured: true,
        activeBucket,
        buckets: bucketsList,
        rootFiles: filesList,
        protocolosFiles: protocolosFiles,
        totalFilesFound: filesList.length + protocolosFiles.length,
        database: {
          unidadesEscolaresCount: unidadesCount,
          respostasQuestionarioCount: respostasCount,
        },
      });
    } catch (e: any) {
      console.error("Storage status check error:", e);
      return res.status(500).json({ error: e.message });
    }
  });

  // Supabase: Sync all survey submissions (or received list) to Storage
  app.post("/api/supabase/sync-all-to-storage", async (req, res) => {
    try {
      const db = getSupabase();
      if (!db) {
        return res.json({ success: false, error: "Supabase não conectado" });
      }

      const clientSubmissions: any[] = req.body?.submissions || [];
      const syncResults: any[] = [];

      // If client sent local submissions list, sync each
      if (Array.isArray(clientSubmissions) && clientSubmissions.length > 0) {
        for (const sub of clientSubmissions) {
          const form = sub.formData || sub;
          if (form && form.schoolName) {
            const meta = {
              startTime: sub.startTime || form.startTime,
              endTime: sub.endTime || form.endTime,
              elapsedSeconds: sub.elapsedSeconds || form.elapsedSeconds,
              elapsedTimeFormatted: sub.elapsedTimeFormatted || form.elapsedTimeFormatted,
            };
            const uploadRes = await uploadAllReportArtifacts(db, form, meta);
            syncResults.push({
              schoolId: form.schoolId,
              schoolName: form.schoolName,
              protocol: form.protocolNumber,
              upload: uploadRes,
            });
          }
        }
      } else {
        // Query database respostas_questionario to sync
        const { data: dbRows, error: rErr } = await db.from("respostas_questionario").select("*");
        if (!rErr && Array.isArray(dbRows)) {
          for (const row of dbRows) {
            const form = row.respostas_json;
            if (form) {
              const meta = {
                startTime: row.horario_inicio,
                endTime: row.horario_termino,
                elapsedSeconds: row.tempo_decorrido_segundos,
                elapsedTimeFormatted: row.tempo_decorrido_formatado,
              };
              const uploadRes = await uploadAllReportArtifacts(db, form, meta);
              syncResults.push({
                schoolId: row.unidade_id,
                schoolName: row.nome_escola,
                protocol: row.protocolo,
                upload: uploadRes,
              });
            }
          }
        }
      }

      const successfulSyncs = syncResults.filter((result) => result.upload?.success).length;
      return res.json({
        success: successfulSyncs > 0 || syncResults.length === 0,
        count: successfulSyncs,
        results: syncResults,
        error: successfulSyncs === 0 && syncResults.length > 0
          ? "Nenhum relatório foi gravado no Supabase Storage."
          : undefined,
      });
    } catch (e: any) {
      console.error("Sync all to storage error:", e);
      return res.status(500).json({ success: false, error: e.message });
    }
  });

  // Supabase: Upload single survey report to Storage
  app.post("/api/supabase/upload-single-report", async (req, res) => {
    try {
      const { formData, startTime, endTime, elapsedSeconds, elapsedTimeFormatted } = req.body;
      const db = getSupabase();
      if (!db || !formData) {
        return res.json({ success: false, error: "Supabase não conectado ou formulário ausente" });
      }

      const uploadRes = await uploadAllReportArtifacts(db, formData, {
        startTime,
        endTime,
        elapsedSeconds,
        elapsedTimeFormatted,
      });

      return res.json({
        success: uploadRes.success,
        error: uploadRes.success ? undefined : uploadRes.error || "Falha ao gravar o relatório no Supabase Storage.",
        result: uploadRes,
      });
    } catch (e: any) {
      console.error("Upload single report error:", e);
      return res.status(500).json({ success: false, error: e.message });
    }
  });

  // Supabase: Admin Delete responses & Reset Unit to PENDENTE
  app.post("/api/supabase/admin/reset-unit", async (req, res) => {
    try {
      const { schoolId } = req.body;
      const db = getSupabase();
      if (db && schoolId) {
        // 1. DELETE in respostas_questionario
        const { error: delErr } = await db
          .from("respostas_questionario")
          .delete()
          .eq("unidade_id", schoolId);
        if (delErr) {
          console.warn("Supabase delete notice in respostas_questionario:", delErr);
        }

        // 2. UPDATE in unidades_escolares status = 'PENDENTE'
        const { error: updErr } = await db
          .from("unidades_escolares")
          .update({
            status: "PENDENTE",
            responsavel_nome: null,
            responsavel_cargo: null,
            protocolo: null,
            tempo_decorrido: null,
            updated_at: new Date().toISOString(),
          })
          .eq("id", schoolId);
        if (updErr) {
          console.warn("Supabase update notice in unidades_escolares:", updErr);
        }
      }
      return res.json({ success: true });
    } catch (e) {
      console.error("Admin reset unit error:", e);
      return res.json({ success: true, localOnly: true });
    }
  });

  // API: AI Diagnostic Synthesis & Feedback for School Expansion
  app.post("/api/ai/analyze", async (req, res) => {
    try {
      const { surveyData } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.json({
          success: true,
          isFallback: true,
          summary: generateHeuristicAnalysis(surveyData),
        });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
Você é um especialista em Planejamento Educacional e Políticas Públicas de Educação Integral no Brasil.
Analise os seguintes dados diagnósticos coletados pelo Diretor Escolar para o Plano de Expansão da Educação Integral:

DADOS DA ESCOLA:
${JSON.stringify(surveyData, null, 2)}

Por favor, elabore um Parecer Técnico-Executivo estruturado e objetivo em português com:
1. Síntese do Perfil e Grau de Vulnerabilidade do Território
2. Avaliação de Viabilidade da Expansão e Principais Gargalos Estruturais
3. Análise da Demanda Reprimida e Transição de Turnos
4. Recomendações Prioritárias para a Secretaria de Educação (Obras, Pessoal, Transporte, Merenda)
5. Índice de Prontidão estimado para Educação Integral (Alto, Médio ou Baixo com justificativa).
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });

      return res.json({
        success: true,
        isFallback: false,
        analysisText: response.text,
      });
    } catch (error: any) {
      console.error("Gemini API error:", error);
      return res.json({
        success: true,
        isFallback: true,
        summary: generateHeuristicAnalysis(req.body?.surveyData),
      });
    }
  });

  // API: Smart clarification / answer validation assistant
  app.post("/api/ai/validate-clarity", async (req, res) => {
    try {
      const { questionId, questionTitle, answer } = req.body;
      if (!answer || answer.trim().length < 3) {
        return res.json({ isValid: false, reason: "A resposta está muito curta ou vazia." });
      }

      if (!process.env.GEMINI_API_KEY) {
        // Quick local heuristics
        if (answer.trim().length < 5 && isNaN(Number(answer))) {
          return res.json({
            isValid: false,
            feedback: "A resposta parece muito sucinta. Por favor, detalhe um pouco mais para subsidiar o planejamento municipal.",
          });
        }
        return res.json({ isValid: true });
      }

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `
Avalie se a seguinte resposta fornecida por um Diretor Escolar à pergunta "${questionTitle}" é suficientemente clara e informativa para um diagnóstico de expansão da Educação Integral.
Resposta do diretor: "${answer}"

Responda em formato JSON rigoroso:
{
  "isSufficient": boolean,
  "politeFeedback": string (se não for suficiente, dê uma sugestão gentil e respeitosa de como enriquecer a resposta)
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: { responseMimeType: "application/json" },
      });

      const parsed = JSON.parse(response.text || "{}");
      return res.json({
        isValid: parsed.isSufficient ?? true,
        feedback: parsed.politeFeedback || null,
      });
    } catch (error) {
      return res.json({ isValid: true });
    }
  });

  // API: Export complete questionnaire PDF (Gerais, EI, EF)
  const servePdfHandler = async (_req: any, res: any) => {
    try {
      const pdfBuffer = await generateQuestionnairePdfBuffer();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'attachment; filename="Questionario_Educacao_Integral_Questoes.pdf"');
      return res.send(pdfBuffer);
    } catch (error: any) {
      console.error("PDF generation endpoint error:", error);
      return res.status(500).json({ error: "Falha ao gerar PDF do questionário." });
    }
  };

  app.get("/api/pdf/questionnaire", servePdfHandler);
  app.get("/Questionario_Educacao_Integral_Questoes.pdf", servePdfHandler);

  // Healthcheck endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  return app;
}

function generateHeuristicAnalysis(data: any): string {
  if (!data) return "Dados diagnósticos insuficientes para geração de síntese automática.";

  const escola = data.schoolName || "Unidade Escolar";
  const inep = data.inepCode ? `(INEP: ${data.inepCode})` : "";
  const territorio = data.territoryType || "Não informado";
  const vulnerabilidade = data.vulnerabilityLevel || "Não informada";
  const carencias = Array.isArray(data.missingPublicEquipments)
    ? data.missingPublicEquipments.join(", ")
    : "Não informadas";
  const condicaoPredio = data.buildingCondition || "Em análise";
  const demandas = Array.isArray(data.priorityDemands) ? data.priorityDemands.join(", ") : "N/D";

  let eiText = "";
  if (data.sphere === "EI" || data.sphere === "BOTH") {
    eiText = `
- **Educação Infantil (EI)**:
  * Matrículas: ${data.ei_partialEnrollment || 0} (Parcial) | ${data.ei_integralEnrollment || 0} (Integral)
  * Demanda Reprimida: ${data.ei_waitingListCount || 0} crianças na fila (Tempo médio: ${data.ei_avgWaitMonths || 0} meses)
  * Trocas de período aguardando: ${data.ei_shiftChangeWaitingCount || 0} (Frequência: ${data.ei_shiftChangeFrequency || "N/D"})
  * Principais motivos de troca: ${Array.isArray(data.ei_shiftChangeReasons) ? data.ei_shiftChangeReasons.join(", ") : "N/D"}`;
  }

  let efText = "";
  if (data.sphere === "EF1" || data.sphere === "BOTH") {
    efText = `
- **Ensino Fundamental I (EF I)**:
  * Matrículas: ${data.ef_partialEnrollment || 0} (Parcial) | ${data.ef_integralEnrollment || 0} (Integral)
  * Estudantes PPIs estimados: ${data.ef_ppiProportion || "Não informado"}
  * Trocas de período aguardando: ${data.ef_shiftChangeWaitingCount || 0} (Frequência: ${data.ef_shiftChangeFrequency || "N/D"})
  * Coordenação Pedagógica Própria: ${data.ef_hasPedagogicalCoordination ? "Sim" : "Não"}
  * Equipe escolar: ${data.ef_staffSummary || "Quadro registrado no sistema"}`;
  }

  return `
### PARECER TÉCNICO-EXECUTIVO PRELIMINAR

**1. Síntese do Perfil e Vulnerabilidade:**
A unidade **${escola}** ${inep} situa-se em território **${territorio}**, atendendo a uma comunidade com nível de vulnerabilidade socioeconômica **${vulnerabilidade}**. Há carência relevante de equipamentos públicos no entorno (${carencias}), o que ressalta a função protetiva e transformadora da expansão da jornada integral.

**2. Condições Estruturais e Prontidão:**
O prédio escolar foi avaliado como **${condicaoPredio}**. As prioridades estruturais e de gestão indicadas para a viabilidade do plano incluem: **${demandas}**.

**3. Indicadores de Atendimento e Demanda:**
${eiText}
${efText}

**4. Recomendações Estratégicas para a Secretaria de Educação:**
1. **Infraestrutura**: Priorizar adequações de refeitório, pátio coberto e sanitários para suportar a permanência de até 7 a 9 horas diárias.
2. **Equipe e Gestão**: Fortalecer a contratação de monitores/educadores e assegurar a carga horária de coordenação pedagógica dedicada à Educação Integral.
3. **Equidade Social**: Articular com a rede de Assistência Social e Transporte Escolar para priorizar crianças em fila de espera do território.
`;
}
