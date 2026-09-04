import {
  SurveyFormData,
} from '../types/questionnaire';

export const LABELS = {
  sphere: {
    EI: 'Apenas Educação Infantil (EI)',
    EF: 'Apenas Ensino Fundamental I (EF I)',
    AMBOS: 'Ambas as Etapas (EI + EF I)',
  },
  role: {
    DIRETOR: 'Diretor(a)',
    PROFESSOR_CO_RESPONSAVEL: 'Professor(a) Co-Responsável',
  },
};

export function exportToJSON(data: SurveyFormData) {
  const uniData = data['ed-integral'] || data['UNI-01'] || data.uni_01_data || data.ed_integral || {
    diretriz_escolhida: data.uni_01_diretriz,
    detalhes: {
      acao_continuidade: undefined,
      qtd_salas_ajuste: undefined,
      regime_planejado: undefined,
      qtd_salas_implementacao: undefined,
      qtd_salas_ampliacao: undefined,
      observacao_comunidade: '',
    },
  };

  const structuredData = {
    ...data,
    'ETAPA_2_VISITAS_SUPERVISAO': data.supervisionVisitsData || {
      grebs: { dias: 0, meses: 0, anual: 0 },
      gt: { dias: 0, meses: 0, anual: 0 },
      supervisoras: { dias: 0, meses: 0, anual: 0 },
    },
    'UNI-01': {
      diretriz_escolhida: uniData.diretriz_escolhida,
      detalhes: {
        ...(uniData.detalhes || {}),
      },
    },
    'ed-integral': {
      diretriz_escolhida: uniData.diretriz_escolhida,
      detalhes: {
        ...(uniData.detalhes || {}),
      },
    },
    ed_integral: {
      diretriz_escolhida: uniData.diretriz_escolhida,
      detalhes: {
        ...(uniData.detalhes || {}),
      },
    },
    'EI-17': data['EI-17'] || {
      integral: {
        matriculados: data.ei_17_integralCount ?? 0,
        capacidade: data.ei_17_integralCapacity ?? 0,
      },
      parcial: {
        matriculados: data.ei_17_partialCount ?? 0,
        capacidade: data.ei_17_partialCapacity ?? 0,
      },
    },
    'EI-18': data['EI-18'] || data.ei_18_staffData || {
      professores: { atual: 0, necessidade: 0 },
      professores_especialistas: { atual: 0, necessidade: 0 },
      asgs: { atual: 0, necessidade: 0 },
      adis: { atual: 0, necessidade: 0 },
      aoe: { atual: 0, necessidade: 0 },
      estagiarios: { atual: 0, necessidade: 0 },
      milclean: { atual: 0, necessidade: 0 },
    },
    'EF-18': data['EF-18'] || data.ef_18_staffData || data['EI-18'] || data.ei_18_staffData || {
      professores: { atual: 0, necessidade: 0 },
      professores_especialistas: { atual: 0, necessidade: 0 },
      asgs: { atual: 0, necessidade: 0 },
      adis: { atual: 0, necessidade: 0 },
      aoe: { atual: 0, necessidade: 0 },
      estagiarios: { atual: 0, necessidade: 0 },
      milclean: { atual: 0, necessidade: 0 },
    },
  };
  const blob = new Blob([JSON.stringify(structuredData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `diagnostico_pindamonhangaba_${data.schoolName?.replace(/\s+/g, '_') || 'escola'}_${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToCSV(data: SurveyFormData) {
  const csvContent = generateCSVString(data);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `diagnostico_pindamonhangaba_${data.schoolName?.replace(/\s+/g, '_') || 'escola'}_${Date.now()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function generateTextSummary(data: SurveyFormData): string {
  const sphereLabel = LABELS.sphere[data.sphere] || data.sphere;
  const roleLabel = data.respondentRole === 'PROFESSOR_CO_RESPONSAVEL' ? 'Professor(a) Co-Responsável' : 'Diretor(a)';
  const dateStr = data.updatedAt ? new Date(data.updatedAt).toLocaleString('pt-BR') : new Date().toLocaleString('pt-BR');

  const staffData = data['EI-18'] || data.ei_18_staffData;
  const staffDetailed = staffData
    ? [
        `  * Professores: ${staffData.professores?.atual ?? 0} atuais (+${staffData.professores?.necessidade ?? 0} necessários)`,
        `  * Prof. Especialistas (Arte/Ed.Física): ${staffData.professores_especialistas?.atual ?? 0} atuais (+${staffData.professores_especialistas?.necessidade ?? 0} necessários)`,
        `  * ASG's (Aux. Serviços Gerais): ${staffData.asgs?.atual ?? 0} atuais (+${staffData.asgs?.necessidade ?? 0} necessários)`,
        `  * ADI's (Aux. Desenv. Infantil): ${staffData.adis?.atual ?? 0} atuais (+${staffData.adis?.necessidade ?? 0} necessários)`,
        `  * AOE (Agentes de Org. Escolar): ${staffData.aoe?.atual ?? 0} atuais (+${staffData.aoe?.necessidade ?? 0} necessários)`,
        `  * Estagiários(as): ${staffData.estagiarios?.atual ?? 0} atuais (+${staffData.estagiarios?.necessidade ?? 0} necessários)`,
        `  * Milclean (Terceirizados): ${staffData.milclean?.atual ?? 0} atuais (+${staffData.milclean?.necessidade ?? 0} necessários)`,
      ].join('\n')
    : `  * ${data.ei_18_staffBreakdown || 'N/D'}`;

  const efStaff = (data['EF-18'] || data.ef_18_staffData || (data.sphere === 'AMBOS' ? (data['EI-18'] || data.ei_18_staffData) : undefined));
  const efStaffDetailed = efStaff
    ? [
        `  * Professores: ${efStaff.professores?.atual ?? 0} atuais (+${efStaff.professores?.necessidade ?? 0} necessários)`,
        `  * Prof. Especialistas (Arte/Ed.Física): ${efStaff.professores_especialistas?.atual ?? 0} atuais (+${efStaff.professores_especialistas?.necessidade ?? 0} necessários)`,
        `  * ASG's (Aux. Serviços Gerais): ${efStaff.asgs?.atual ?? 0} atuais (+${efStaff.asgs?.necessidade ?? 0} necessários)`,
        `  * ADI's (Aux. Desenv. Infantil): ${efStaff.adis?.atual ?? 0} atuais (+${efStaff.adis?.necessidade ?? 0} necessários)`,
        `  * AOE (Agentes de Org. Escolar): ${efStaff.aoe?.atual ?? 0} atuais (+${efStaff.aoe?.necessidade ?? 0} necessários)`,
        `  * Estagiários(as): ${efStaff.estagiarios?.atual ?? 0} atuais (+${efStaff.estagiarios?.necessidade ?? 0} necessários)`,
        `  * Milclean (Terceirizados): ${efStaff.milclean?.atual ?? 0} atuais (+${efStaff.milclean?.necessidade ?? 0} necessários)`,
      ].join('\n')
    : `  * ${data.ef_18_staffBreakdown || data.ei_18_staffBreakdown || 'N/D'}`;

  const visits = data.supervisionVisitsData || {
    grebs: { dias: 0, meses: 0, anual: 0 },
    gt: { dias: 0, meses: 0, anual: 0 },
    supervisoras_estado: { dias: 0, meses: 0, anual: 0 },
  };
  const supervItem = visits.supervisoras_estado || visits.supervisoras || { dias: 0, meses: 0, anual: 0 };

  return `================================================================================
PREFEITURA MUNICIPAL DE PINDAMONHANGABA
SECRETARIA MUNICIPAL DE EDUCAÇÃO
RELATÓRIO TÉCNICO HOMOLOGADO - QUESTIONÁRIO DIAGNÓSTICO MUNICIPAL
================================================================================

1. DADOS DE PROTOCOLO E HOMOLOGAÇÃO
--------------------------------------------------------------------------------
Número de Protocolo     : ${data.protocolNumber || 'N/A'}
Data e Hora de Envio    : ${dateStr}
Tempo de Preenchimento  : ${data.elapsedTimeFormatted || 'N/A'} (${data.startTime || 'Início'} às ${data.endTime || 'Término'})
Status no Sistema       : CONCLUÍDO / HOMOLOGADO

2. IDENTIFICAÇÃO DA UNIDADE ESCOLAR
--------------------------------------------------------------------------------
Unidade Escolar         : ${data.schoolName || 'Escola Municipal'} (Código: ${data.schoolId || 'N/A'})
Setor Municipal         : ${data.schoolSector || 'Não informado'}
Bairros de Abrangência  : ${data.neighborhoodCoverage || 'Pindamonhangaba'}
Etapas Ofertadas        : ${sphereLabel}

3. RESPONSÁVEL PELO PREENCHIMENTO & SUPERVISÃO
--------------------------------------------------------------------------------
Nome do Responsável     : ${data.directorName || 'Não informado'}
Cargo / Função          : ${roleLabel}
E-mail Institucional    : ${data.directorEmail || 'Não informado'}
Telefone de Contato     : ${data.directorPhone || 'Não informado'}
Frequência de Visitas Recebidas:
  * GREB's                     : ${visits.grebs?.dias ?? 0} dias / ${visits.grebs?.meses ?? 0} meses / ${visits.grebs?.anual ?? 0} anual
  * Grupo de Trabalho (GT)     : ${visits.gt?.dias ?? 0} dias / ${visits.gt?.meses ?? 0} meses / ${visits.gt?.anual ?? 0} anual
  * Supervisoras de Ensino (SP): ${supervItem?.dias ?? 0} dias / ${supervItem?.meses ?? 0} meses / ${supervItem?.anual ?? 0} anual

4. PLANEJAMENTO E VIABILIDADE DE OFERTA INTEGRAL (UNI-01)
--------------------------------------------------------------------------------
${(() => {
  const uni = data['UNI-01'] || data.uni_01_data;
  const diretriz = uni?.diretriz_escolhida || data.uni_01_diretriz || 'Não informado';
  const det = uni?.detalhes || {};
  let detStr = '';
  if (diretriz === 'CONTINUIDADE') {
    detStr = `Ação: ${det.acao_continuidade || 'N/D'} | Ajuste de Salas: ${det.qtd_salas_ajuste ?? 0}`;
  } else if (diretriz === 'IMPLEMENTACAO') {
    detStr = `Regime Planejado: ${det.regime_planejado || 'N/D'} | Salas Planejadas: ${det.qtd_salas_implementacao ?? 0}`;
  } else if (diretriz === 'AMPLIACAO') {
    detStr = `Salas Adicionais para Ampliação: ${det.qtd_salas_ampliacao ?? 0}`;
  }
  return `Diretriz Pretendida: ${diretriz}
${detStr}
Observações da Comunidade / Infraestrutura: ${det.observacao_comunidade || 'Nenhuma observação registrada.'}`;
})()}

5. SÍNTESE DAS RESPOSTAS - EDUCAÇÃO INFANTIL (EI)
--------------------------------------------------------------------------------
${data.sphere === 'EI' || data.sphere === 'AMBOS' ? `
- Total Geral de Crianças Matriculadas (EI-01): ${data.ei_01_totalEnrolled ?? data.ei_15_totalEnrolled ?? 'N/D'}
- Turmas por Etapa e Turno (EI-02): ${data.ei_02_classesBreakdown || 'N/D'}
- Matrículas e Capacidades por Regime (EI-14):
  * Tempo Integral: ${data.ei_17_integralCount ?? 0} matriculados / Capacidade máx: ${data.ei_17_integralCapacity ?? 0} vagas
  * Tempo Parcial : ${data.ei_17_partialCount ?? 0} matriculados / Capacidade máx: ${data.ei_17_partialCapacity ?? 0} vagas
  * Total Geral   : ${(data.ei_17_integralCount || 0) + (data.ei_17_partialCount || 0)} matriculados / Capacidade total: ${(data.ei_17_integralCapacity || 0) + (data.ei_17_partialCapacity || 0)} vagas
- Matrículas Ocupadas por Turno (EI-03): ${data.ei_02_occupiedMorning ?? 0} / ${data.ei_02_occupiedAfternoon ?? 0} / ${data.ei_02_occupiedIntegral ?? 0}
- Fila de Espera por Vagas (EI-04): ${data.ei_03_waitingListCount ?? 0} crianças (Tempo médio (EI-05): ${data.ei_04_avgWaitTime ?? 'N/D'})
- Motivos de Falta de Vaga (EI-06): ${data.ei_05_reasonsNoSlot?.join(', ') || 'N/D'}
- Turno com Maior Demanda (EI-07): ${data.ei_06_highestDemandShift ?? 'N/D'}
- Solicitações de Troca de Período (EI-08): ${data.ei_07_shiftChangeRequests ?? 'N/D'} (Qtd. EI-09: ${data.ei_08_shiftChangeWaitingCount ?? 0})
- Possibilidade de Ampliação de Vagas (EI-11): ${data.ei_10_expansionCapacity ?? 'N/D'} (Estimativa EI-12: ${data.ei_11_additionalSlotsEstimated ?? 0} vagas)
- Recursos Prioritários Necessários (EI-13): ${data.ei_12_resourcesNeeded?.join(', ') || 'N/D'}
- Dimensionamento do Quadro de Profissionais (EI-15):
${staffDetailed}
- Território Predominante (EI-16): ${data.ei_19_territoryType ?? 'N/D'}
- Condição Socioeconômica Predominante (EI-17): ${data.ei_20_socioeconomicProfile ?? 'N/D'}
- Adequação da Infraestrutura (EI-19): ${data.ei_22_infraAdequacy ?? 'N/D'}
- Espaços Disponíveis na Unidade (EI-20): ${data.ei_23_availableSpaces?.join(', ') || 'N/D'}
- Articulação com Rede de Proteção (EI-21): ${data.ei_24_territoryArticulation ?? 'N/D'}
- Relação Escola-Família (EI-22): ${data.ei_25_familyRelationship ?? 'N/D'}
- Autoavaliação da Qualidade Geral (EI-25): ${data.ei_28_overallQuality ?? 'N/D'}
` : 'Não aplicável para esta unidade (Unidade exclusiva de Ensino Fundamental).'}

5. SÍNTESE DAS RESPOSTAS - ENSINO FUNDAMENTAL I (EF I)
--------------------------------------------------------------------------------
${data.sphere === 'EF' || data.sphere === 'AMBOS' ? `
- Total de Matrículas Atendidas: ${data.ef_01_totalEnrolled ?? 'N/D'}
- Turmas por Ano Escolar: ${data.ef_02_classesBreakdown || 'N/D'}
- Matrículas por Turno (Manhã / Tarde / Integral): ${data.ef_03_enrolledMorning ?? 0} / ${data.ef_03_enrolledAfternoon ?? 0} / ${data.ef_03_enrolledIntegral ?? 0}
- Território Predominante: ${data.sphere === 'AMBOS' ? `${data.ef_04_territoryType || data.ei_19_territoryType} (Integrado EI-19)` : (data.ef_04_territoryType ?? 'N/D')}
- Condição Socioeconômica Predominante: ${data.sphere === 'AMBOS' ? `${data.ef_05_socioeconomicProfile || data.ei_20_socioeconomicProfile} (Integrado EI-20)` : (data.ef_05_socioeconomicProfile ?? 'N/D')}
- Proporção Estimada de Alunos PPIs: ${data.ef_06_ppiProportion ?? 'N/D'}
- Fatores de Dificuldade de Permanência: ${data.ef_07_retentionDifficulties?.join(', ') || 'Nenhum'}
- Solicitações de Troca de Turno: ${data.ef_08_shiftChangeRequests ?? 'N/D'} (${data.ef_09_shiftChangeWaitingCountAndReasons || 'Sem observações'})
- Transferências Anuais (Recebidas / Expedidas): ${data.ef_10_transfersReceived ?? 0} recebidas / ${data.ef_10_transfersIssued ?? 0} expedidas
- Casos de Abandono/Evasão Registrados: ${data.ef_11_dropoutCount ?? 0}
- Motivos Principais de Abandono/Evasão: ${data.ef_13_dropoutReasons?.join(', ') || 'Nenhum'}
- Estratégias de Busca Ativa Escolar: ${data.ef_14_activeSearchStrategy || 'N/D'}
- Acompanhamento Individualizado de Risco: ${data.ef_15_individualizedTracking ?? 'N/D'}
- Adequação da Infraestrutura: ${data.ef_16_infraAdequacy ?? 'N/D'}
- Espaços Disponíveis na Unidade: ${data.ef_17_availableSpaces?.join(', ') || 'N/D'}
- Dimensionamento do Quadro de Profissionais (EF-18):
${efStaffDetailed}
- Articulação com Rede de Apoio: ${data.ef_20_territoryArticulation ?? 'N/D'}
- Participação em Avaliações Externas (SAEB/SARESP): ${data.ef_21_participatesSaeb ?? 'N/D'}
- Resultados geraram Índice do IDEB?: ${data.ef_21_participatesSaeb === 'Sim' ? (data.ef_21_idebIndexGenerated ?? 'N/D') : 'Não se aplica'}
- Evolução do Desempenho dos Estudantes: ${data.ef_22_performanceEvolution ?? 'N/D'}
- Ações de Reforço / Recomposição das Aprendizagens: ${data.ef_23_learningSupport ?? 'N/D'}
- Relação Escola-Família: ${data.ef_25_familyRelationship ?? 'N/D'}
- Autoavaliação da Qualidade Geral da Oferta: ${data.ef_28_overallQuality ?? 'N/D'}
` : 'Não aplicável para esta unidade (Unidade exclusiva de Educação Infantil).'}

================================================================================
Documento gerado automaticamente pelo Sistema de Coleta Diagnóstica Municipal.
Assinatura Digital autenticada pelo Protocolo Oficial: ${data.protocolNumber}
================================================================================`;
}

export function generateCSVString(data: SurveyFormData): string {
  const staff = data['EI-18'] || data.ei_18_staffData;
  const efStaff = data['EF-18'] || data.ef_18_staffData || (data.sphere === 'AMBOS' ? staff : undefined);
  const visits = data.supervisionVisitsData || {
    grebs: { dias: 0, meses: 0, anual: 0 },
    gt: { dias: 0, meses: 0, anual: 0 },
    supervisoras_estado: { dias: 0, meses: 0, anual: 0 },
  };
  const supervItemCsv = visits.supervisoras_estado || visits.supervisoras || { dias: 0, meses: 0, anual: 0 };

  const flatData: Record<string, any> = {
    Protocolo: data.protocolNumber,
    Data_Hora: data.updatedAt || data.createdAt,
    Municipio: data.municipality,
    Status: data.status,

    // Identificação
    Respondente_Nome: data.directorName,
    Respondente_Cargo: data.respondentRole === 'DIRETOR' ? 'Diretor' : 'Professor Co-Responsável',
    Respondente_Email: data.directorEmail,
    Respondente_Telefone: data.directorPhone,

    // Unidade & Triagem
    Escola_Setor: data.schoolSector || '',
    Escola_Nome: data.schoolName,
    Territorio_Bairros_Abrangencia: data.neighborhoodCoverage,
    Etapas_Ofertadas: data.sphere,

    // Visitas Frequência (Global)
    Visitas_GREBS_Dias: visits.grebs?.dias ?? '',
    Visitas_GREBS_Meses: visits.grebs?.meses ?? '',
    Visitas_GREBS_Anual: visits.grebs?.anual ?? '',
    Visitas_GT_Dias: visits.gt?.dias ?? '',
    Visitas_GT_Meses: visits.gt?.meses ?? '',
    Visitas_GT_Anual: visits.gt?.anual ?? '',
    Visitas_Supervisoras_Dias: supervItemCsv?.dias ?? '',
    Visitas_Supervisoras_Meses: supervItemCsv?.meses ?? '',
    Visitas_Supervisoras_Anual: supervItemCsv?.anual ?? '',

    // UNI-01 / ed-integral: Viabilidade e Diretriz Integral (Universal)
    Chave_ed_integral: (data['ed-integral'] || data['UNI-01'] || data.uni_01_data)?.diretriz_escolhida || data.uni_01_diretriz || '',
    UNI_01_Diretriz_Escolhida: (data['ed-integral'] || data['UNI-01'] || data.uni_01_data)?.diretriz_escolhida || data.uni_01_diretriz || '',
    UNI_01_Acao_Continuidade: (data['ed-integral'] || data['UNI-01'] || data.uni_01_data)?.detalhes?.acao_continuidade || '',
    UNI_01_Qtd_Salas_Ajuste: (data['ed-integral'] || data['UNI-01'] || data.uni_01_data)?.detalhes?.qtd_salas_ajuste ?? '',
    UNI_01_Regime_Planejado: (data['ed-integral'] || data['UNI-01'] || data.uni_01_data)?.detalhes?.regime_planejado || '',
    UNI_01_Qtd_Salas_Implementacao: (data['ed-integral'] || data['UNI-01'] || data.uni_01_data)?.detalhes?.qtd_salas_implementacao ?? '',
    UNI_01_Qtd_Salas_Ampliacao: (data['ed-integral'] || data['UNI-01'] || data.uni_01_data)?.detalhes?.qtd_salas_ampliacao ?? '',
    UNI_01_Observacao_Comunidade: (data['ed-integral'] || data['UNI-01'] || data.uni_01_data)?.detalhes?.observacao_comunidade || '',

    // EI (se aplicável)
    EI_01_Total_Matriculados: data.ei_01_totalEnrolled ?? data.ei_15_totalEnrolled ?? '',
    EI_02_Turmas_Por_Etapa: data.ei_02_classesBreakdown ?? '',
    EI_18_Matriculas_Integral: data.ei_17_integralCount ?? '',
    EI_18_Capacidade_Integral: data.ei_17_integralCapacity ?? '',
    EI_18_Matriculas_Parcial: data.ei_17_partialCount ?? '',
    EI_18_Capacidade_Parcial: data.ei_17_partialCapacity ?? '',
    EI_18_Total_Matriculados: (data.ei_17_integralCount || 0) + (data.ei_17_partialCount || 0),
    EI_18_Capacidade_Total: (data.ei_17_integralCapacity || 0) + (data.ei_17_partialCapacity || 0),
    EI_03_Ocupadas_Manha: data.ei_02_occupiedMorning ?? '',
    EI_03_Ocupadas_Tarde: data.ei_02_occupiedAfternoon ?? '',
    EI_03_Ocupadas_Integral: data.ei_02_occupiedIntegral ?? '',
    EI_03_Fila_Espera: data.ei_03_waitingListCount ?? '',
    EI_04_Tempo_Medio_Espera: data.ei_04_avgWaitTime ?? '',
    EI_05_Motivos_Sem_Vaga: data.ei_05_reasonsNoSlot?.join('; ') ?? '',
    EI_06_Turno_Mais_Procurado: data.ei_06_highestDemandShift ?? '',
    EI_07_Solicitacoes_Troca: data.ei_07_shiftChangeRequests ?? '',
    EI_08_Qtd_Aguardando_Troca: data.ei_08_shiftChangeWaitingCount ?? '',
    EI_09_Motivo_Epoca_Troca: data.ei_09_shiftChangeReasonAndPeak ?? '',
    EI_10_Capacidade_Ampliacao: data.ei_10_expansionCapacity ?? '',
    EI_11_Vagas_Adicionais_Possiveis: data.ei_11_additionalSlotsEstimated ?? '',
    EI_12_Recursos_Necessarios: data.ei_12_resourcesNeeded?.join('; ') ?? '',
    EI_18_Professores_Atual: staff?.professores?.atual ?? '',
    EI_18_Professores_Necessidade: staff?.professores?.necessidade ?? '',
    EI_18_Especialistas_Atual: staff?.professores_especialistas?.atual ?? '',
    EI_18_Especialistas_Necessidade: staff?.professores_especialistas?.necessidade ?? '',
    EI_18_ASGs_Atual: staff?.asgs?.atual ?? '',
    EI_18_ASGs_Necessidade: staff?.asgs?.necessidade ?? '',
    EI_18_ADIs_Atual: staff?.adis?.atual ?? '',
    EI_18_ADIs_Necessidade: staff?.adis?.necessidade ?? '',
    EI_18_AOE_Atual: staff?.aoe?.atual ?? '',
    EI_18_AOE_Necessidade: staff?.aoe?.necessidade ?? '',
    EI_18_Estagiarios_Atual: staff?.estagiarios?.atual ?? '',
    EI_18_Estagiarios_Necessidade: staff?.estagiarios?.necessidade ?? '',
    EI_18_Milclean_Atual: staff?.milclean?.atual ?? '',
    EI_18_Milclean_Necessidade: staff?.milclean?.necessidade ?? '',
    EI_18_Quadro_Resumo: data.ei_18_staffBreakdown ?? '',
    EI_19_Territorio_Predominante: data.ei_19_territoryType ?? '',
    EI_20_Socioeconomico_Familias: data.ei_20_socioeconomicProfile ?? '',
    EI_21_Dificuldades_Permanencia: data.ei_21_retentionDifficulties?.join('; ') ?? '',
    EI_22_Adequacao_Infraestrutura: data.ei_22_infraAdequacy ?? '',
    EI_23_Espacos_Disponiveis: data.ei_23_availableSpaces?.join('; ') ?? '',
    EI_24_Articulacao_Rede: data.ei_24_territoryArticulation ?? '',
    EI_25_Relacao_Familias: data.ei_25_familyRelationship ?? '',
    EI_26_Planejamento_Territorio: data.ei_26_considersTerritoryPlanning ?? '',
    EI_27_Aspectos_Prioritarios: data.ei_27_focusAspects?.join('; ') ?? '',
    EI_28_Qualidade_Geral: data.ei_28_overallQuality ?? '',

    // EF (se aplicável)
    EF_01_Total_Matriculas: data.ef_01_totalEnrolled ?? '',
    EF_02_Turmas_Por_Ano: data.ef_02_classesBreakdown ?? '',
    EF_03_Matriculas_Manha: data.ef_03_enrolledMorning ?? '',
    EF_03_Matriculas_Tarde: data.ef_03_enrolledAfternoon ?? '',
    EF_03_Matriculas_Integral: data.ef_03_enrolledIntegral ?? '',
    EF_04_Territorio_Predominante:
      data.sphere === 'AMBOS' ? (data.ef_04_territoryType || data.ei_19_territoryType || '') : (data.ef_04_territoryType ?? ''),
    EF_05_Socioeconomico_Familias:
      data.sphere === 'AMBOS' ? (data.ef_05_socioeconomicProfile || data.ei_20_socioeconomicProfile || '') : (data.ef_05_socioeconomicProfile ?? ''),
    EF_06_Proporcao_PPIs: data.ef_06_ppiProportion ?? '',
    EF_07_Dificuldades_Permanencia: data.ef_07_retentionDifficulties?.join('; ') ?? '',
    EF_08_Solicitacoes_Troca: data.ef_08_shiftChangeRequests ?? '',
    EF_09_Qtd_Motivos_Troca: data.ef_09_shiftChangeWaitingCountAndReasons ?? '',
    EF_10_Transferencias_Recebidas: data.ef_10_transfersReceived ?? '',
    EF_10_Transferencias_Expedidas: data.ef_10_transfersIssued ?? '',
    EF_11_Abandono_Escolar: data.ef_11_dropoutCount ?? '',
    EF_13_Motivos_Abandono_Evasao: data.ef_13_dropoutReasons?.join('; ') ?? '',
    EF_14_Busca_Ativa_Escolar: data.ef_14_activeSearchStrategy ?? '',
    EF_15_Acompanhamento_Risco_Evasao: data.ef_15_individualizedTracking ?? '',
    EF_16_Adequacao_Infraestrutura: data.ef_16_infraAdequacy ?? '',
    EF_17_Espacos_Disponiveis: data.ef_17_availableSpaces?.join('; ') ?? '',
    EF_18_Professores_Atual: efStaff?.professores?.atual ?? '',
    EF_18_Professores_Necessidade: efStaff?.professores?.necessidade ?? '',
    EF_18_Especialistas_Atual: efStaff?.professores_especialistas?.atual ?? '',
    EF_18_Especialistas_Necessidade: efStaff?.professores_especialistas?.necessidade ?? '',
    EF_18_ASGs_Atual: efStaff?.asgs?.atual ?? '',
    EF_18_ASGs_Necessidade: efStaff?.asgs?.necessidade ?? '',
    EF_18_ADIs_Atual: efStaff?.adis?.atual ?? '',
    EF_18_ADIs_Necessidade: efStaff?.adis?.necessidade ?? '',
    EF_18_AOE_Atual: efStaff?.aoe?.atual ?? '',
    EF_18_AOE_Necessidade: efStaff?.aoe?.necessidade ?? '',
    EF_18_Estagiarios_Atual: efStaff?.estagiarios?.atual ?? '',
    EF_18_Estagiarios_Necessidade: efStaff?.estagiarios?.necessidade ?? '',
    EF_18_Milclean_Atual: efStaff?.milclean?.atual ?? '',
    EF_18_Milclean_Necessidade: efStaff?.milclean?.necessidade ?? '',
    EF_18_Quadro_Resumo: data.ef_18_staffBreakdown ?? (data.sphere === 'AMBOS' ? (data.ei_18_staffBreakdown ?? '') : ''),
    EF_20_Articulacao_Rede: data.ef_20_territoryArticulation ?? '',
    EF_21_Participa_Saeb: data.ef_21_participatesSaeb ?? '',
    EF_21_IDEB: data.ef_21_participatesSaeb === 'Sim' ? data.ef_21_idebIndexGenerated ?? '' : 'Não se aplica',
    EF_22_Evolucao_Desempenho: data.ef_22_performanceEvolution ?? '',
    EF_23_Reforco_Escolar: data.ef_23_learningSupport ?? '',
    EF_25_Relacao_Familias: data.ef_25_familyRelationship ?? '',
    EF_26_Planejamento_Comunidade: data.ef_26_considersTerritoryPlanning ?? '',
    EF_27_Aspectos_Prioritarios: data.ef_27_focusAspects?.join('; ') ?? '',
    EF_28_Qualidade_Geral: data.ef_28_overallQuality ?? '',
  };

  const headers = Object.keys(flatData);
  const values = Object.values(flatData).map((val) => `"${String(val ?? '').replace(/"/g, '""')}"`);

  return '\uFEFF' + headers.join(';') + '\n' + values.join(';');
}
