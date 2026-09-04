import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI } from "@google/genai";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import PDFDocument from "pdfkit";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import {
  OFFICIAL_SCHOOL_UNITS,
  findSchoolById,
  findSchoolByLogin,
  validateSchoolCredentials,
  normalizeText,
} from "./src/data/schoolsData.ts";
import {
  generateCSVString,
  generateTextSummary,
} from "./src/utils/helpers.ts";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Supabase client helper
let supabase: SupabaseClient | null = null;
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

const PRIMARY_BUCKET = process.env.SUPABASE_STORAGE_BUCKET?.trim() || "GT-SME RICO";
const REPORTS_FOLDER = (process.env.SUPABASE_STORAGE_FOLDER?.trim() || "protocolos").replace(/^\/+|\/+$/g, "");
const FALLBACK_BUCKETS = [PRIMARY_BUCKET, "GT-SME RICO", "relatorios_diagnostico", "relatorios", "diagnosticos", "respostas_questionario", "protocolos", "public", "storage"];

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
    success: uploadedFiles.length > 0,
    bucket,
    files: uploadedFiles,
    error: uploadedFiles.length === 0 ? uploadErrors.join("; ") || "Nenhum artefato foi gravado no Supabase Storage." : undefined,
  };
}

export function createApp() {
  const app = express();

  app.use(express.json({ limit: "15mb" }));

  // Supabase: Validate School Unit & Login
  app.post("/api/supabase/validate-school", async (req, res) => {
    try {
      const { schoolId, login, senha, sector } = req.body;
      const cleanLogin = (login || "").trim();
      const cleanSenha = (senha || "").trim();

      // Check credentials using our official normalized validator first
      const val = validateSchoolCredentials(schoolId, cleanLogin, cleanSenha);
      const targetUnit = val.unit || findSchoolByLogin(cleanLogin) || findSchoolById(schoolId);

      const db = getSupabase();
      if (db && targetUnit) {
        // Query status in Supabase table
        const { data, error } = await db
          .from("unidades_escolares")
          .select("id, nome_escola, oferta, status, setor")
          .or(`id.eq.${targetUnit.id},login.ilike.${cleanLogin}`)
          .maybeSingle();

        if (!error && data) {
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

      if (val.success && val.unit) {
        return res.json({
          success: true,
          unit: {
            id: val.unit.id,
            name: val.unit.name,
            offer: val.unit.offer,
            sector: val.unit.sector || sector,
            login: val.unit.login,
          },
        });
      }

      return res.json({
        success: false,
        error: val.error || "Login ou Senha incorretos para o setor selecionado. Tente novamente.",
      });
    } catch (e: any) {
      console.error("Supabase validation error:", e);
      const val = validateSchoolCredentials(req.body?.schoolId, req.body?.login || "", req.body?.senha || "");
      if (val.success && val.unit) {
        return res.json({ success: true, unit: val.unit });
      }
      return res.json({ success: false, error: val.error || "Erro de validação. Tente novamente." });
    }
  });

  // Supabase: Register Definite Submission
  app.post("/api/supabase/submit-survey", async (req, res) => {
    try {
      const { formData, startTime, endTime, elapsedSeconds, elapsedTimeFormatted } = req.body;
      const db = getSupabase();

      if (db && formData) {
        // Normalize replicated fields for AMBOS offer
        if (formData.sphere === 'AMBOS') {
          formData.ef_04_territoryType = formData.ef_04_territoryType || formData.ei_19_territoryType || 'Urbano';
          formData.ef_05_socioeconomicProfile = formData.ef_05_socioeconomicProfile || formData.ei_20_socioeconomicProfile || 'Mistas';
          formData.ef_18_staffBreakdown = formData.ef_18_staffBreakdown || formData.ei_18_staffBreakdown || '';
        }

        // 1. INSERT in respostas_questionario
        const { error: insertErr } = await db.from("respostas_questionario").insert([
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
        ]);

        if (insertErr) {
          console.warn("Supabase insert notice in respostas_questionario:", insertErr);
        }

        // 2. UPDATE in unidades_escolares status = 'CONCLUIDO'
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

        let storagePath: string | null = null;
        let storageUrl: string | null = null;

        // 3. Supabase Storage upload for JSON, CSV and TXT official reports
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

        return res.json({
          success: storageResult?.success === true,
          error: storageResult?.success ? undefined : storageResult?.error || "Falha ao gravar o relatório no Supabase Storage.",
          storage: storageResult,
          storageBucket: storageResult?.bucket,
          filesUploaded: storageResult?.files || [],
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

  // Healthcheck endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  return app;
}

async function startServer() {
  const app = createApp();
  const PORT = 3000;

  // Vite integration for local development and local production preview.
  // On Vercel, the static site is served from dist and the API is served by api/[...path].ts.
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
  });
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

if (!process.env.VERCEL) {
  startServer();
}
