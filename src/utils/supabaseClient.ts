import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { OfficialSchoolUnit, SurveyFormData, SchoolSubmissionRecord } from '../types/questionnaire';
import { generateCSVString, generateTextSummary } from './helpers';

// Retrieve Supabase credentials from client-side or window globals
function getSupabaseConfig(): { url: string; key: string } | null {
  const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};
  const url =
    (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
    (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) ||
    metaEnv.VITE_SUPABASE_URL ||
    metaEnv.SUPABASE_URL ||
    '';

  const key =
    (typeof process !== 'undefined' && process.env?.SUPABASE_ANON_KEY) ||
    (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) ||
    metaEnv.VITE_SUPABASE_ANON_KEY ||
    metaEnv.SUPABASE_ANON_KEY ||
    '';

  if (url && key) {
    return { url, key };
  }
  return null;
}

let supabaseInstance: SupabaseClient | null = null;
let schoolSessionToken = '';

export function clearSchoolSession(): void {
  schoolSessionToken = '';
}

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;
  const config = getSupabaseConfig();
  if (config) {
    try {
      supabaseInstance = createClient(config.url, config.key);
      return supabaseInstance;
    } catch (err) {
      console.warn('Failed to initialize Supabase client directly:', err);
    }
  }
  return null;
}

export interface ValidateSchoolResponse {
  success: boolean;
  error?: string;
  isCompleted?: boolean;
  isMasterAccess?: boolean;
  authToken?: string;
  unit?: OfficialSchoolUnit;
  submissionInfo?: {
    protocolNumber?: string;
    submissionDate?: string;
    respondentName?: string;
  };
}

export async function changeSchoolPassword(params: {
  schoolId: string;
  login: string;
  currentPassword: string;
  newPassword: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/supabase/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${schoolSessionToken}` },
      body: JSON.stringify(params),
    });
    const data = await res.json().catch(() => null);
    if (data?.success && data?.authToken) schoolSessionToken = data.authToken;
    return data || { success: false, error: 'Resposta inválida do serviço de autenticação.' };
  } catch (err) {
    console.warn('Password change route is not reachable:', err);
    return { success: false, error: 'Não foi possível alterar a senha. Verifique a conexão e tente novamente.' };
  }
}

/**
 * Validate school credentials exclusively through the protected backend route.
 */
export async function validateSchoolViaSupabase(params: {
  schoolId: string;
  login: string;
  senha: string;
  sector?: string;
}): Promise<ValidateSchoolResponse> {
  const cleanLogin = params.login.trim();
  const cleanSenha = params.senha.trim();

  // Try via backend API route first (which has access to server secrets and proxies to Supabase)
  try {
    const res = await fetch('/api/supabase/validate-school', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        schoolId: params.schoolId,
        login: cleanLogin,
        senha: cleanSenha,
        sector: params.sector,
      }),
    });

    const data = await res.json().catch(() => null);
    if (!res.ok) {
      return {
        success: false,
        error: data?.error || 'O serviço de autenticação está temporariamente indisponível.',
      };
    }
    if (data?.success && data?.authToken) schoolSessionToken = data.authToken;
    return data || { success: false, error: 'Resposta inválida do serviço de autenticação.' };
  } catch (err) {
    console.warn('Backend authentication route is not reachable:', err);
    return {
      success: false,
      error: 'Não foi possível validar o acesso. Verifique a conexão e tente novamente.',
    };
  }
}

const storageEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};
export const STORAGE_BUCKET_NAME = storageEnv.VITE_SUPABASE_STORAGE_BUCKET || 'GT-SME RICO';
export const STORAGE_FOLDER_NAME = (storageEnv.VITE_SUPABASE_STORAGE_FOLDER || 'protocolos').replace(/^\/+|\/+$/g, '');

/**
 * Sanitiza o caminho do arquivo para o Supabase Storage
 * 1. Remove qualquer barra no início da string (leading slash)
 * 2. Remove o nome do bucket caso venha duplicado/prefixado
 * 3. Normaliza barras duplas internas e espaços
 */
export function sanitizeStoragePath(filePath: string): string {
  if (!filePath) return `arquivo_${Date.now()}.json`;

  // 1. Remove espaços e qualquer barra no início (leading slashes)
  let cleanPath = filePath.trim().replace(/^\/+/, '');

  // 2. Remove prefixo do bucket se vier concatenado no caminho
  if (cleanPath.startsWith(`${STORAGE_BUCKET_NAME}/`)) {
    cleanPath = cleanPath.substring(STORAGE_BUCKET_NAME.length + 1).replace(/^\/+/, '');
  }

  // 3. Normaliza barras duplas internas
  cleanPath = cleanPath.replace(/\/+/g, '/');

  // 4. Garante novamente remoção de qualquer barra residual no início
  return cleanPath.replace(/^\/+/, '');
}

function withStorageFolder(filePath: string): string {
  const cleanPath = sanitizeStoragePath(filePath);
  return STORAGE_FOLDER_NAME && !cleanPath.startsWith(`${STORAGE_FOLDER_NAME}/`)
    ? `${STORAGE_FOLDER_NAME}/${cleanPath}`
    : cleanPath;
}

/**
 * Função genérica e sanitizada de upload para o Supabase Storage (suporta .json, .csv, .txt e Blobs)
 */
export async function uploadFileToSupabaseStorage(
  filePath: string,
  content: Blob | string,
  mimeType: string = 'application/json'
): Promise<{ success: boolean; path?: string; error?: string; status?: number | string }> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      console.warn('[Supabase Storage] Cliente Supabase não inicializado ou credenciais ausentes.');
      return { success: false, error: 'Cliente Supabase não configurado' };
    }

    // 1. Sanitização do caminho (filePath)
    const cleanPath = sanitizeStoragePath(filePath);

    // 2. Criação do Blob com o MIME type adequado
    const fileBlob =
      typeof content === 'string'
        ? new Blob([content], { type: mimeType })
        : content;

    // 3. Estrutura da chamada ao bucket isolado sem o nome do bucket no caminho
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET_NAME)
      .upload(cleanPath, fileBlob, {
        contentType: mimeType,
        upsert: true,
      });

    // 4. Tratamento e logs detalhados de erro
    if (error) {
      const errStatus = (error as any).status || (error as any).statusCode || 'N/A';
      console.error(`[Supabase Storage Error] Falha ao gravar '${cleanPath}' no bucket '${STORAGE_BUCKET_NAME}':`, {
        message: error.message,
        status: errStatus,
        cleanPath,
        error,
      });
      return { success: false, error: error.message, status: errStatus };
    }

    console.log(`[Supabase Storage] Arquivo gravado com sucesso no bucket '${STORAGE_BUCKET_NAME}': ${data?.path || cleanPath}`);
    return { success: true, path: data?.path || cleanPath };
  } catch (err: any) {
    const errStatus = err?.status || err?.statusCode || 500;
    console.error(`[Supabase Storage Exception] Erro inesperado durante upload no bucket '${STORAGE_BUCKET_NAME}':`, {
      message: err?.message || String(err),
      status: errStatus,
      err,
    });
    return { success: false, error: err?.message || 'Erro inesperado no upload', status: errStatus };
  }
}

function getReportFileBaseName(formData: Partial<SurveyFormData>): string {
  const simplify = (value: string, maxWords?: number) => {
    const words = value
      .replace(/^Ã‚/, 'A')
      .replace(/^Â/, 'A')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-zA-Z0-9\s.-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\bngelo\b/gi, 'Angelo')
      .split(' ')
      .filter((word) => !['da', 'das', 'de', 'do', 'dos', 'e', 'dr', 'dra', 'prof', 'profa', 'professor', 'professora', 'em', 'emei', 'emef'].includes(word.toLowerCase().replace(/\.$/, '')));
    return (maxWords ? words.slice(0, maxWords) : words).join(' ');
  };
  const school = simplify(String(formData.schoolName || 'Unidade Escolar'), 2) || 'Unidade Escolar';
  const respondentWords = simplify(String(formData.directorName || 'Respondente')).split(' ').filter(Boolean);
  const respondent = respondentWords.length > 1
    ? `${respondentWords[0]} ${respondentWords.slice(1).map((word) => word.charAt(0)).join('.')}`
    : respondentWords[0] || 'Respondente';
  return `${school} - ${respondent}`;
}

/**
 * Upload de relatório em formato CSV para o bucket 'GT-SME RICO'
 */
export async function uploadCsvReportToSupabaseStorage(
  formData: SurveyFormData,
  protocolNumber?: string
): Promise<{ success: boolean; path?: string; error?: string; status?: number | string }> {
  const cleanPath = withStorageFolder(`${getReportFileBaseName(formData)}.csv`);
  const csvText = generateCSVString(formData);

  return await uploadFileToSupabaseStorage(cleanPath, csvText, 'text/csv;charset=utf-8;');
}

/**
 * Upload de parecer técnico em formato TXT para o bucket 'GT-SME RICO'
 */
export async function uploadTxtReportToSupabaseStorage(
  formData: SurveyFormData,
  protocolNumber?: string
): Promise<{ success: boolean; path?: string; error?: string; status?: number | string }> {
  const cleanPath = withStorageFolder(`${getReportFileBaseName(formData)}.txt`);
  const txtText = generateTextSummary(formData);

  return await uploadFileToSupabaseStorage(cleanPath, txtText, 'text/plain;charset=utf-8;');
}

/**
 * Realiza o upload dos artefatos CSV e TXT no fallback direto do navegador.
 * O endpoint do servidor também envia o PDF.
 */
export async function uploadAllSurveyArtifactsToStorage(
  payloadData: any,
  formData: SurveyFormData
): Promise<{
  csvResult: { success: boolean; path?: string; error?: string };
  txtResult: { success: boolean; path?: string; error?: string };
}> {
  const [csvResult, txtResult] = await Promise.all([
    uploadCsvReportToSupabaseStorage(formData),
    uploadTxtReportToSupabaseStorage(formData),
  ]);

  return { csvResult, txtResult };
}

/**
 * Submit final answers to Supabase (and update school status to CONCLUIDO)
 */
export async function submitSurveyToSupabase(payload: {
  formData: SurveyFormData;
  startTime: string;
  endTime: string;
  elapsedSeconds: number;
  elapsedTimeFormatted: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/supabase/submit-survey', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${schoolSessionToken}` },
      body: JSON.stringify(payload),
    });

    const data = await res.json().catch(() => null);
    if (res.ok && data?.success) {
      console.log('[Supabase API] Envio confirmado via rota backend');
      return { success: true };
    }
    return { success: false, error: data?.error || 'Falha ao gravar o relatório no Supabase Storage.' };
  } catch (err) {
    console.warn('[Supabase API] Backend submission route unavailable:', err);
  }

  return { success: false, error: 'Não foi possível confirmar o envio pelo servidor. Tente novamente.' };

  // Direct Supabase write and Storage upload
  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const f = payload.formData;
      // 1. INSERT in respostas_questionario
      const { error: insertErr } = await supabase.from('respostas_questionario').insert([
        {
          id: f.id || 'srv_' + Date.now(),
          unidade_id: f.schoolId,
          nome_escola: f.schoolName,
          setor: f.schoolSector,
          oferta: f.sphere,
          responsavel_nome: f.directorName,
          responsavel_cargo: f.respondentRole === 'PROFESSOR_CO_RESPONSAVEL' ? 'Professor Co-Responsável' : 'Diretor',
          responsavel_email: f.directorEmail,
          responsavel_telefone: f.directorPhone,
          horario_inicio: payload.startTime,
          horario_termino: payload.endTime,
          tempo_decorrido_segundos: payload.elapsedSeconds,
          tempo_decorrido_formatado: payload.elapsedTimeFormatted,
          protocolo: f.protocolNumber,
          respostas_json: f,
          data_envio: new Date().toISOString(),
        },
      ]);

      if (insertErr) {
        console.error('[Supabase DB Error] Falha ao inserir em respostas_questionario:', {
          message: insertErr.message,
          status: (insertErr as any).code || 'N/A',
        });
      }

      // 2. UPDATE in unidades_escolares status = 'CONCLUIDO'
      const { error: updateErr } = await supabase
        .from('unidades_escolares')
        .update({
          status: 'CONCLUIDO',
          responsavel_nome: f.directorName,
          responsavel_cargo: f.respondentRole === 'PROFESSOR_CO_RESPONSAVEL' ? 'Professor Co-Responsável' : 'Diretor',
          protocolo: f.protocolNumber,
          tempo_decorrido: payload.elapsedTimeFormatted,
          updated_at: new Date().toISOString(),
        })
        .eq('id', f.schoolId);

      if (updateErr) {
        console.error('[Supabase DB Error] Falha ao atualizar unidades_escolares:', {
          message: updateErr.message,
          status: (updateErr as any).code || 'N/A',
        });
      }

      // 3. Direct Storage fallback. The server endpoint is responsible for the PDF.
      const [csvResult, txtResult] = await Promise.all([
        uploadCsvReportToSupabaseStorage(f),
        uploadTxtReportToSupabaseStorage(f),
      ]);
      if (!csvResult.success && !txtResult.success) {
        return { success: false, error: csvResult.error || txtResult.error || 'Falha ao enviar os relatórios.' };
      }

      return { success: true };
    } catch (e: any) {
      console.error('[Supabase Direct Submit Exception]:', e);
    }
  }

  return { success: true };
}

/**
 * Upload a sample/baseline test diagnostic report to verify Supabase Storage bucket 'GT-SME RICO'
 */
export async function uploadTestDiagnosticReportToStorage(): Promise<{
  success: boolean;
  path?: string;
  error?: string;
}> {
  const testData = {
    protocolNumber: `PIND-TESTE-GT-${Date.now()}`,
    schoolId: 'ESC-TESTE-00',
    schoolName: 'UNIDADE TESTE GABINETE GT - SME PINDAMONHANGABA',
    sector: 'GABINETE_SME',
    offer: 'FUNDAMENTAL',
    directorName: 'Equipe de Avaliação Diagnóstica GT',
    respondentRole: 'Gestão SME',
    submissionDate: new Date().toISOString(),
    status: 'CONCLUIDO',
    diagnosticoInfo: {
      titulo: 'Relatório de Verificação e Homologação do Supabase Storage',
      bucket: STORAGE_BUCKET_NAME,
      dataVerificacao: new Date().toLocaleString('pt-BR'),
      sistema: 'Diagnóstico Pedagógico e Administrativo 2026',
      secretaria: 'Secretaria Municipal de Educação de Pindamonhangaba',
    },
    resumoExecutivo: 'Arquivo de homologação de gravação direta no Supabase Storage.',
  };

  const res = await fetch('/api/supabase/upload-single-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ formData: testData }),
  });
  const result = await res.json();
  return {
    success: result.success === true,
    path: result.result?.files?.find((file: { type: string }) => file.type === 'Official PDF Report')?.path,
    error: result.error || result.result?.error,
  };
}

/**
 * Diagnostic helper to check Supabase Storage health & stored files in 'GT-SME RICO'
 */
export async function fetchSupabaseStorageStatus(): Promise<{
  configured: boolean;
  message?: string;
  activeBucket?: string;
  buckets?: any[];
  rootFiles?: any[];
  protocolosFiles?: any[];
  totalFilesFound?: number;
  database?: {
    unidadesEscolaresCount: number;
    respostasQuestionarioCount: number;
  };
  error?: string;
}> {
  try {
    const res = await fetch('/api/supabase/storage-status');
    if (res.ok) {
      const data = await res.json();
      if (data && data.configured) {
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend storage status endpoint unreachable, trying client-side check:', err);
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      const { data: buckets, error: bErr } = await supabase.storage.listBuckets();
      if (bErr) {
        console.error('[Supabase Storage listBuckets Error]:', {
          message: bErr.message,
          status: (bErr as any).status || 'N/A',
        });
      }

      const { data: rootFiles, error: rErr } = await supabase.storage.from(STORAGE_BUCKET_NAME).list('', {
        limit: 100,
        sortBy: { column: 'name', order: 'asc' },
      });
      if (rErr) {
        console.error(`[Supabase Storage list files Error in '${STORAGE_BUCKET_NAME}']:`, {
          message: rErr.message,
          status: (rErr as any).status || 'N/A',
        });
      }

      // Query database table counts
      let unidadesCount = 0;
      let respostasCount = 0;
      try {
        const { count: uCount } = await supabase.from('unidades_escolares').select('*', { count: 'exact', head: true });
        unidadesCount = uCount || 0;
        const { count: rCount } = await supabase.from('respostas_questionario').select('*', { count: 'exact', head: true });
        respostasCount = rCount || 0;
      } catch (cntErr) {
        console.warn('Could not query counts from client:', cntErr);
      }

      const files = Array.isArray(rootFiles) ? rootFiles : [];

      return {
        configured: true,
        activeBucket: STORAGE_BUCKET_NAME,
        buckets: buckets || [],
        rootFiles: files,
        protocolosFiles: [],
        totalFilesFound: files.length,
        database: {
          unidadesEscolaresCount: unidadesCount,
          respostasQuestionarioCount: respostasCount,
        },
      };
    } catch (e: any) {
      console.error('[Supabase Storage Status Exception]:', e);
      return {
        configured: true,
        activeBucket: STORAGE_BUCKET_NAME,
        error: e.message || 'Erro ao consultar Storage diretamente',
      };
    }
  }

  return {
    configured: false,
    message: 'Supabase não inicializado ou sem credenciais.',
  };
}

/**
 * Synchronize all completed survey records to Supabase Storage 'GT-SME RICO'
 */
export async function syncSubmissionsToStorage(
  submissionsList: SchoolSubmissionRecord[]
): Promise<{ success: boolean; count?: number; results?: any[]; error?: string }> {
  const syncResults: any[] = [];
  let successfulUploads = 0;

  // 1. Tenta sincronização via endpoint do servidor Express
  try {
    const res = await fetch('/api/supabase/sync-all-to-storage', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submissions: submissionsList }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.success && (data.count || 0) > 0) {
        return data;
      }
    }
  } catch (err: any) {
    console.warn('[Supabase Storage] Backend sync-all indisponível, executando sincronização direta pelo cliente front-end:', err);
  }

  // 2. Sincronização direta front-end via Supabase SDK para o bucket 'GT-SME RICO'
  try {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return {
        success: false,
        error: 'Cliente Supabase não configurado no navegador.',
      };
    }

    let itemsToProcess = [...submissionsList];

    // Se a lista do cliente estiver vazia, tenta buscar respostas salvas no banco Supabase
    if (itemsToProcess.length === 0) {
      const { data: dbRows, error: dbErr } = await supabase.from('respostas_questionario').select('*');
      if (!dbErr && Array.isArray(dbRows) && dbRows.length > 0) {
        for (const row of dbRows) {
          if (row.respostas_json) {
            itemsToProcess.push({
              id: row.id || `srv_${row.unidade_id}`,
              schoolId: row.unidade_id,
              schoolName: row.nome_escola,
              protocolNumber: row.protocolo,
              sector: row.setor,
              offer: row.oferta,
              respondentName: row.responsavel_nome,
              respondentRole: row.responsavel_cargo,
              respondentEmail: row.responsavel_email || '',
              respondentPhone: row.responsavel_telefone || '',
              submissionDate: row.data_envio,
              status: 'CONCLUÍDO',
              startTime: row.horario_inicio,
              endTime: row.horario_termino,
              elapsedSeconds: row.tempo_decorrido_segundos,
              elapsedTimeFormatted: row.tempo_decorrido_formatado,
              formData: row.respostas_json,
            });
          }
        }
      }
    }

    // Se ainda assim não houver respostas registradas, gera um relatório de homologação no bucket
    if (itemsToProcess.length === 0) {
      const testRes = await uploadTestDiagnosticReportToStorage();
      if (testRes.success) {
        return {
          success: true,
          count: 1,
          results: [
            {
              schoolId: 'HOMOLOGACAO',
              schoolName: 'Relatório de Homologação SME GT',
              protocol: 'PIND-HOMOLOGACAO',
              success: true,
              path: testRes.path,
            },
          ],
        };
      }
    }

    for (const sub of itemsToProcess) {
      const form = sub.formData || (sub as any);
      if (form && (form.schoolName || form.protocolNumber)) {
        const payloadData = {
          protocolNumber: form.protocolNumber || sub.protocolNumber,
          schoolId: form.schoolId || sub.schoolId,
          schoolName: form.schoolName || sub.schoolName,
          sector: form.schoolSector || sub.sector,
          offer: form.sphere || sub.offer,
          directorName: form.directorName || sub.respondentName,
          respondentRole: form.respondentRole || sub.respondentRole,
          submissionDate: sub.submissionDate || new Date().toISOString(),
          startTime: sub.startTime || form.startTime,
          endTime: sub.endTime || form.endTime,
          elapsedSeconds: sub.elapsedSeconds || form.elapsedSeconds,
          elapsedTimeFormatted: sub.elapsedTimeFormatted || form.elapsedTimeFormatted,
          formData: form,
        };

        const [csvResult, txtResult] = await Promise.all([
          uploadCsvReportToSupabaseStorage(form),
          uploadTxtReportToSupabaseStorage(form),
        ]);
        const uploadRes = csvResult.success ? csvResult : txtResult;

        syncResults.push({
          schoolId: form.schoolId || sub.schoolId,
          schoolName: form.schoolName || sub.schoolName,
          protocol: form.protocolNumber || sub.protocolNumber,
          success: uploadRes.success,
          path: uploadRes.path,
          error: uploadRes.error,
        });

        if (uploadRes.success) {
          successfulUploads++;
        }
      }
    }

    return {
      success: successfulUploads > 0 || itemsToProcess.length === 0,
      count: successfulUploads,
      results: syncResults,
      error: successfulUploads === 0 && itemsToProcess.length > 0
        ? "Falha ao sincronizar relatórios no bucket 'GT-SME RICO'"
        : undefined,
    };
  } catch (syncErr: any) {
    console.error('[Supabase Storage Sync Exception]:', {
      message: syncErr?.message || String(syncErr),
      status: syncErr?.status || 500,
      syncErr,
    });
    return {
      success: false,
      count: successfulUploads,
      results: syncResults,
      error: syncErr?.message || 'Erro inesperado na sincronização com Supabase Storage',
    };
  }
}

/**
 * Delete responses from respostas_questionario and reset status to PENDENTE in unidades_escolares
 */
export async function deleteAndReopenSchoolInSupabase(
  schoolId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/supabase/admin/reset-unit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ schoolId }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success) {
        return { success: true };
      }
    }
  } catch (err) {
    console.warn('Backend proxy delete/reset error, attempting direct client write:', err);
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    try {
      // 1. DELETE FROM respostas_questionario WHERE unidade_id = schoolId
      const { error: delErr } = await supabase
        .from('respostas_questionario')
        .delete()
        .eq('unidade_id', schoolId);
      if (delErr) {
        console.warn('Direct delete error in respostas_questionario:', delErr);
      }

      // 2. UPDATE unidades_escolares SET status = 'PENDENTE' WHERE id = schoolId
      const { error: updErr } = await supabase
        .from('unidades_escolares')
        .update({
          status: 'PENDENTE',
          responsavel_nome: null,
          responsavel_cargo: null,
          protocolo: null,
          tempo_decorrido: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', schoolId);
      if (updErr) {
        console.warn('Direct update error in unidades_escolares:', updErr);
      }

      return { success: true };
    } catch (e: any) {
      console.warn('Direct Supabase reset error:', e);
    }
  }

  return { success: true };
}
