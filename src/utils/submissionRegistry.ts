import {
  SchoolSubmissionRecord,
  SurveyFormData,
  OfficialSchoolUnit,
} from '../types/questionnaire';
import { OFFICIAL_SCHOOL_UNITS } from '../data/schoolsData';

const SUBMISSIONS_STORAGE_KEY = 'pinda_diagnostico_submissions_registry_v1';
const ADMIN_SESSION_STORAGE_KEY = 'pinda_diagnostico_admin_session_v1';

export function getSchoolSubmissions(): Record<string, SchoolSubmissionRecord> {
  try {
    const raw = localStorage.getItem(SUBMISSIONS_STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error('Error loading submissions registry', e);
  }
  return {};
}

export function saveSchoolSubmission(record: SchoolSubmissionRecord): void {
  try {
    const registry = getSchoolSubmissions();
    registry[record.schoolId] = record;
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(registry));
  } catch (e) {
    console.error('Error saving submission to registry', e);
  }
}

export function isSchoolSubmitted(schoolId: string): boolean {
  const registry = getSchoolSubmissions();
  return !!registry[schoolId] && registry[schoolId].status === 'CONCLUÍDO';
}

export function getSubmissionForSchool(
  schoolId: string
): SchoolSubmissionRecord | undefined {
  const registry = getSchoolSubmissions();
  return registry[schoolId];
}

export function deleteOrResetSubmission(schoolId: string): void {
  try {
    const registry = getSchoolSubmissions();
    delete registry[schoolId];
    localStorage.setItem(SUBMISSIONS_STORAGE_KEY, JSON.stringify(registry));
  } catch (e) {
    console.error('Error resetting submission', e);
  }
}

export function getAdminSession(): boolean {
  try {
    return localStorage.getItem(ADMIN_SESSION_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setAdminSession(active: boolean): void {
  try {
    if (active) {
      localStorage.setItem(ADMIN_SESSION_STORAGE_KEY, 'true');
    } else {
      localStorage.removeItem(ADMIN_SESSION_STORAGE_KEY);
    }
  } catch (e) {
    console.error('Error updating admin session', e);
  }
}

// Utility to calculate average elapsed time across all completed submissions
export function calculateAverageElapsedTime(
  records: SchoolSubmissionRecord[]
): string {
  const completed = records.filter(
    (r) => r.status === 'CONCLUÍDO' && r.elapsedSeconds && r.elapsedSeconds > 0
  );
  if (completed.length === 0) return '0 min 00 seg';

  const totalSeconds = completed.reduce((acc, r) => acc + (r.elapsedSeconds || 0), 0);
  const avgSec = Math.round(totalSeconds / completed.length);

  const mins = Math.floor(avgSec / 60);
  const secs = avgSec % 60;
  return `${mins} min ${secs.toString().padStart(2, '0')} seg`;
}

// Format duration helper
export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;

  if (hours > 0) {
    return `${hours}h ${remainingMins}m ${secs}s`;
  }
  return `${mins} min ${secs.toString().padStart(2, '0')} seg`;
}

// Format duration to digital timer string (HH:MM:SS)
export function formatTimerHHMMSS(seconds: number): string {
  if (!seconds || seconds <= 0) return '00:00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, '0')}:${mins
    .toString()
    .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Export All Submissions to Full CSV
export function exportSubmissionsToCsv(
  submissions: Record<string, SchoolSubmissionRecord>
): void {
  const completedRecords = Object.values(submissions).filter(
    (s) => s.status === 'CONCLUÍDO'
  );

  if (completedRecords.length === 0) {
    alert('Aviso: Não há diagnósticos concluídos para exportar até o momento.');
    return;
  }

  // Headers
  const baseHeaders = [
    'ID_ESCOLA',
    'NOME_UNIDADE',
    'SETOR',
    'OFERTA',
    'CARGO_RESPONSAVEL',
    'NOME_RESPONSAVEL',
    'EMAIL_RESPONSAVEL',
    'TELEFONE_RESPONSAVEL',
    'HORARIO_INICIO',
    'HORARIO_TERMINO',
    'TEMPO_DECORRIDO',
    'DATA_HORA_ENVIO',
    'NUMERO_PROTOCOLO',
    'STATUS',
    'TERRITORIO_BAIRROS',
    'EI_01_CAPACIDADE_TOTAL',
    'EI_03_FILA_ESPERA',
    'EI_04_TEMPO_MEDIO_ESPERA',
    'EI_06_TURNO_MAIOR_PROCURA',
    'EI_10_CAPACIDADE_EXPANSAO',
    'EI_15_TOTAL_MATRICULADOS',
    'EI_19_TIPO_TERRITORIO',
    'EI_25_RELACAO_FAMILIAS',
    'EI_28_AVALIACAO_GLOBAL',
    'EF_01_TOTAL_MATRICULADOS',
    'EF_04_TIPO_TERRITORIO',
    'EF_06_PPI_PROPORCAO',
    'EF_10_TRANSF_RECEBIDAS',
    'EF_10_TRANSF_EXPEDIDAS',
    'EF_11_EVASAO_ABANDONO',
    'EF_14_BUSCA_ATIVA',
    'EF_21_PARTICIPA_SAEB',
    'EF_25_RELACAO_FAMILIAS',
    'EF_28_AVALIACAO_GLOBAL',
    'CONSIDERACOES_FINAIS',
  ];

  const rows = completedRecords.map((r) => {
    const f = r.formData;
    return [
      r.schoolId,
      `"${(r.schoolName || '').replace(/"/g, '""')}"`,
      `"${(r.sector || f.schoolSector || '').replace(/"/g, '""')}"`,
      r.offer,
      r.respondentRole === 'PROFESSOR_CO_RESPONSAVEL'
        ? 'Professor Co-Responsável'
        : 'Diretor',
      `"${(r.respondentName || '').replace(/"/g, '""')}"`,
      `"${(r.respondentEmail || '').replace(/"/g, '""')}"`,
      `"${(r.respondentPhone || '').replace(/"/g, '""')}"`,
      r.startTime || '',
      r.endTime || '',
      `"${r.elapsedTimeFormatted || ''}"`,
      `"${r.submissionDate || ''}"`,
      r.protocolNumber,
      r.status,
      `"${(f.neighborhoodCoverage || '').replace(/"/g, '""')}"`,
      f.ei_01_totalCapacity ?? '',
      f.ei_03_waitingListCount ?? '',
      `"${(f.ei_04_avgWaitTime || '').replace(/"/g, '""')}"`,
      `"${(f.ei_06_highestDemandShift || '').replace(/"/g, '""')}"`,
      `"${(f.ei_10_expansionCapacity || '').replace(/"/g, '""')}"`,
      f.ei_15_totalEnrolled ?? '',
      `"${(f.ei_19_territoryType || '').replace(/"/g, '""')}"`,
      `"${(f.ei_25_familyRelationship || '').replace(/"/g, '""')}"`,
      `"${(f.ei_28_overallQuality || '').replace(/"/g, '""')}"`,
      f.ef_01_totalEnrolled ?? '',
      `"${(f.ef_04_territoryType || '').replace(/"/g, '""')}"`,
      `"${(f.ef_06_ppiProportion || '').replace(/"/g, '""')}"`,
      f.ef_10_transfersReceived ?? '',
      f.ef_10_transfersIssued ?? '',
      f.ef_11_dropoutCount ?? '',
      `"${(f.ef_14_activeSearchStrategy || '').replace(/"/g, '""')}"`,
      `"${(f.ef_21_participatesSaeb || '').replace(/"/g, '""')}"`,
      `"${(f.ef_25_familyRelationship || '').replace(/"/g, '""')}"`,
      `"${(f.ef_28_overallQuality || '').replace(/"/g, '""')}"`,
      `"${(f.finalRemarks || '').replace(/"/g, '""')}"`,
    ].join(';');
  });

  const csvContent =
    '\uFEFF' + [baseHeaders.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `PINDA_DIAGNOSTICO_COMPLETO_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Export Tracking Matrix to CSV
export function exportTrackingMatrixCsv(
  submissions: Record<string, SchoolSubmissionRecord>
): void {
  const headers = [
    'ID',
    'UNIDADE_ESCOLAR',
    'SETOR',
    'OFERTA',
    'STATUS',
    'CARGO_RESPONSAVEL',
    'NOME_RESPONSAVEL',
    'TEMPO_DECORRIDO',
    'HORARIO_INICIO',
    'HORARIO_TERMINO',
    'DATA_HORA_ENVIO',
    'PROTOCOLO',
  ];

  const rows = OFFICIAL_SCHOOL_UNITS.map((unit) => {
    const sub = submissions[unit.id];
    const isDone = sub && sub.status === 'CONCLUÍDO';

    return [
      unit.id,
      `"${unit.name.replace(/"/g, '""')}"`,
      `"${(unit.sector || '').replace(/"/g, '""')}"`,
      unit.offer,
      isDone ? 'CONCLUÍDO' : 'PENDENTE',
      isDone
        ? sub.respondentRole === 'PROFESSOR_CO_RESPONSAVEL'
          ? 'Professor Co-Responsável'
          : 'Diretor'
        : '-',
      isDone ? `"${(sub.respondentName || '').replace(/"/g, '""')}"` : '-',
      isDone ? `"${sub.elapsedTimeFormatted || ''}"` : '-',
      isDone ? sub.startTime || '-' : '-',
      isDone ? sub.endTime || '-' : '-',
      isDone ? `"${sub.submissionDate || '-'}"` : '-',
      isDone ? sub.protocolNumber : '-',
    ].join(';');
  });

  const csvContent =
    '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute(
    'download',
    `PINDA_MATRIZ_ACOMPANHAMENTO_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
