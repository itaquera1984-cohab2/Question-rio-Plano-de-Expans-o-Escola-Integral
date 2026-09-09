export type EducationSphere = 'EI' | 'EF' | 'AMBOS';

export type RespondentRole = 'DIRETOR' | 'PROFESSOR_CO_RESPONSAVEL';

export interface OfficialSchoolUnit {
  id: string; // e.g. "01", "02", ..., "37"
  name: string; // e.g. "EM Ângelo Paz"
  offer: EducationSphere; // "EF" | "EI" | "AMBOS"
  login: string; // e.g. "Angelo"
  sector?: string; // e.g. "Setor 5"
  neighborhood?: string; // e.g. "Jardim América"
}

export interface SchoolSubmissionRecord {
  id: string; // Submission ID
  schoolId: string; // "01" to "37"
  schoolName: string;
  offer: EducationSphere;
  sector?: string;
  respondentName: string;
  respondentRole: RespondentRole;
  respondentEmail: string;
  respondentPhone: string;
  startTime: string; // "08:30:15"
  startTimestamp?: number;
  endTime: string; // "08:52:40"
  endTimestamp?: number;
  elapsedTimeFormatted: string; // "22 min 25 seg"
  elapsedSeconds: number;
  submissionDate: string; // "25/08/2026 08:52:40"
  protocolNumber: string;
  status: 'CONCLUÍDO' | 'PENDENTE';
  formData: SurveyFormData;
}

export interface QuestionStep {
  id: string;
  stepCode: string; // e.g. "ETAPA_0", "ETAPA_1", "EI-01", "EF-10"
  key?: string; // System key identifier e.g. "ed-integral"
  blockId: string; // e.g. "TRIAGEM", "EI_BLOCO_1", "EI_BLOCO_2", "EF_BLOCO_1", "EF_BLOCO_2", "EF_BLOCO_3", "EF_BLOCO_4", "EF_BLOCO_5", "CONCLUSAO"
  blockLabel: string;
  title: string;
  shortLabel: string;
  directorPrompt: string;
  description: string;
  module: 'TRIAGEM' | 'EI' | 'EF' | 'CONCLUSAO';
  appliesTo: ('EI' | 'EF' | 'AMBOS' | 'ALL')[];
}

export interface Ei17ItemData {
  matriculados: number;
  capacidade: number;
}

export interface Ei17Data {
  integral: Ei17ItemData;
  parcial: Ei17ItemData;
}

export interface StaffItemData {
  atual: number;
  necessidade: number;
}

export interface Ei18StaffData {
  professores: StaffItemData;
  professores_especialistas: StaffItemData;
  asgs: StaffItemData;
  adis: StaffItemData;
  aoe: StaffItemData;
  estagiarios: StaffItemData;
  milclean: StaffItemData;
}

export interface Ef02ClassDistribution {
  manha: number;
  tarde: number;
  integral: number;
}

export interface VisitFrequencyItem {
  dias?: number;
  meses?: number;
  anual?: number;
  observacao?: string;
}

export interface SupervisionVisitsData {
  grebs: VisitFrequencyItem;
  gt: VisitFrequencyItem;
  supervisoras_estado?: VisitFrequencyItem;
  supervisoras?: VisitFrequencyItem;
}

export interface Uni01Details {
  // Se CONTINUIDADE:
  acao_continuidade?: 'MANTER' | 'AUMENTAR' | 'DIMINUIR';
  qtd_salas_ajuste?: number;

  // Se IMPLEMENTACAO:
  regime_planejado?: 'INTEGRAL' | 'PARCIAL';
  qtd_salas_implementacao?: number;

  // Se AMPLIACAO:
  qtd_salas_ampliacao?: number;

  // Observação geral transversal:
  observacao_comunidade?: string;
}

export interface Uni01Data {
  diretriz_escolhida?: 'CONTINUIDADE' | 'IMPLEMENTACAO' | 'AMPLIACAO';
  detalhes?: Uni01Details;
}

export interface SurveyFormData {
  // Protocol & Metadata
  id: string;
  protocolNumber: string;
  createdAt: string;
  updatedAt: string;
  municipality: string;
  status: 'DRAFT' | 'CONFIRMED' | 'SENT';

  // ================= TEMPO E REGISTRO DE SESSÃO =================
  schoolId?: string; // ID da Escola oficial ("01" a "37")
  schoolLogin?: string; // Login institucional da unidade autenticada
  startTime?: string; // Horário de Início (HH:MM:SS)
  startTimestamp?: number; // Epoch ms do início
  endTime?: string; // Horário de Término (HH:MM:SS)
  endTimestamp?: number; // Epoch ms do término
  elapsedTimeFormatted?: string; // Tempo Decorrido (ex: "18 min 42 seg")
  elapsedSeconds?: number; // Total em segundos

  // ================= ETAPA 0: IDENTIFICAÇÃO DO USUÁRIO =================
  directorName: string; // Nome completo do respondente
  respondentRole: RespondentRole; // [1] Diretor | [2] Professor Co-Responsável
  directorEmail: string; // E-mail de contato
  directorPhone: string; // Telefone / WhatsApp

  // ================= ETAPA 1: DADOS DA UNIDADE E TRIAGEM =================
  schoolSector?: string; // Setor 1 | Setor 4 | Setor 5 | Setor 7 | Setor 9 | Setor 10 | etc.
  schoolName: string; // Nome da Unidade Escolar
  neighborhoodCoverage: string; // Território / Bairro(s) de abrangência
  sphere: EducationSphere; // [EI] | [EF] | [AMBOS]

  // ================= ETAPA 2 (FUNDAMENTAL/TODOS OS NÍVEIS): VISITAS DE SUPERVISÃO E APOIO =================
  supervisionVisitsData?: SupervisionVisitsData;
  'VISITAS_SUPERVISAO'?: SupervisionVisitsData;

  // ================= ETAPA 3 / QUESTÃO UNIVERSAL: VIABILIDADE DE OFERTA INTEGRAL (UNI-01 / ed-integral) =================
  uni_01_diretriz?: 'CONTINUIDADE' | 'IMPLEMENTACAO' | 'AMPLIACAO';
  uni_01_data?: Uni01Data;
  'UNI-01'?: Uni01Data;
  'ed-integral'?: Uni01Data;
  ed_integral?: Uni01Data;
  edIntegral?: Uni01Data;

  // ================= MÓDULO EI: EDUCAÇÃO INFANTIL =================
  // Nova EI-01 (antiga EI-15): Total de Matrículas
  ei_01_totalEnrolled?: number;
  ei_15_totalEnrolled?: number; // Retrocompatibilidade

  // Bloco 1: Demanda Reprimida
  ei_01_totalCapacity?: number; // Deprecated
  ei_02_occupiedMorning?: number;
  ei_02_occupiedAfternoon?: number;
  ei_02_occupiedIntegral?: number;
  ei_03_waitingListCount?: number;
  ei_04_avgWaitTime?: string; // Até 3 meses | 4 a 6 meses | 7 a 12 meses | Mais de 12 meses | Não há controle
  ei_05_reasonsNoSlot?: string[]; // Falta de vaga | Distância/acesso | Horário incompatível | Outro
  ei_05_otherReason?: string;
  ei_06_highestDemandShift?: string; // Parcial Manhã | Parcial Tarde | Integral | Equilibrado
  ei_07_shiftChangeRequests?: string; // Sim, com frequência | Sim, ocasionalmente | Não há solicitação | Não sabe
  ei_08_shiftChangeWaitingCount?: number;
  ei_09_shiftChangeReasonAndPeak?: string;
  ei_10_expansionCapacity?: string; // Sim, plenamente | Sim, parcialmente | Não | Não sabe
  ei_11_additionalSlotsEstimated?: number;
  ei_12_resourcesNeeded?: string[]; // Obras/Reforma | Pessoal | Mobiliário/Equipamentos | Transporte | Alimentação | Outro
  ei_13_publicEquipmentsGaps?: string;
  ei_13_details?: string;
  ei_14_prioritizationCriteria?: string[];

  // Bloco 2: Perfil e Funcionamento da Unidade em Operação (EI)
  ei_16_totalClasses?: number;
  ei_16_classesMorning?: number;
  ei_16_classesAfternoon?: number;
  ei_16_classesIntegral?: number;
  ei_16_avgStudentsPerClass?: number;
  ei_16_groupsAndAvgClassSize?: string;
  ei_17_integralCount?: number;
  ei_17_integralCapacity?: number;
  ei_17_partialCount?: number;
  ei_17_partialCapacity?: number;
  'EI-17'?: Ei17Data;

  ei_18_staffBreakdown?: string;
  ei_18_staffData?: Ei18StaffData;
  'EI-18'?: Ei18StaffData;

  ei_19_territoryType?: string; // Urbano | Rural | Periurbano | Misto
  ei_20_socioeconomicProfile?: string; // Favoráveis | Mistas | Vulneráveis | Não sabe
  ei_21_retentionDifficulties?: string[]; // até 3
  ei_22_infraAdequacy?: string; // Sim, plenamente | Parcialmente | Não | Não sabe
  ei_23_availableSpaces?: string[]; // Parque, Sala de Leitura, Cantinho da Leitura, Refeitório, Berçário, AEE, Acessibilidade
  ei_24_territoryArticulation?: string; // Sistemática | Pontual | Não | Não sabe
  ei_25_familyRelationship?: string; // Muito boa | Boa | Regular | Ruim | Muito ruim
  ei_26_considersTerritoryPlanning?: string; // Sim | Parcialmente | Não
  ei_27_focusAspects?: string[]; // até 3
  ei_28_overallQuality?: string; // Excelente | Boa | Regular | Frágil

  // ================= MÓDULO EF: ENSINO FUNDAMENTAL I (EF-01 a EF-28) =================
  // Bloco 1: Perfil dos Estudantes Matriculados
  ef_01_totalEnrolled?: number;
  ef_02_classesBreakdown?: string;
  ef_02_classesByYear?: Record<'1' | '2' | '3' | '4' | '5' | 'EJA', Ef02ClassDistribution>;
  ef_03_enrolledMorning?: number;
  ef_03_enrolledAfternoon?: number;
  ef_03_enrolledIntegral?: number;
  ef_04_territoryType?: string; // Urbano | Rural | Periurbano | Misto
  ef_05_socioeconomicProfile?: string; // Favoráveis | Mistas | Vulneráveis | Não sabe
  ef_06_ppiProportion?: string; // Até 25% | 26 a 50% | 51 a 75% | Acima de 75% | Não sabe
  ef_07_retentionDifficulties?: string[]; // até 3
  ef_08_shiftChangeRequests?: string; // Sim, frequência | Ocasionalmente | Não | Não sabe
  ef_09_shiftChangeWaitingCountAndReasons?: string;

  // Bloco 2: Frequência, Transferências e Evasão
  ef_10_transfersReceived?: number;
  ef_10_transfersIssued?: number;
  ef_11_dropoutCount?: number;
  ef_13_dropoutReasons?: string[]; // até 3
  ef_14_activeSearchStrategy?: string; // Sistematicamente | Pontualmente | Não
  ef_15_individualizedTracking?: string; // Sim, formalizado | Em implantação | Não

  // Bloco 3: Infraestrutura e Funcionamento Institucional
  ef_16_infraAdequacy?: string; // Sim, plenamente | Parcialmente | Não | Não sabe
  ef_17_availableSpaces?: string[]; // Sala de Leitura, Cantinho da Leitura, Informática, Quadra, Refeitório, AEE, Acessibilidade
  ef_18_staffBreakdown?: string;
  ef_18_staffData?: Ei18StaffData;
  'EF-18'?: Ei18StaffData;
  ef_19_pedagogicalCoordination?: string; // Deprecated / Excluída
  ef_20_territoryArticulation?: string; // Sistemática | Pontual | Não | Não sabe

  // Bloco 4: Aprendizagem e Indicadores Pedagógicos
  ef_21_participatesSaeb?: string; // Sim | Não | Não aplicável
  ef_21_idebIndexGenerated?: string; // Sim | Não
  ef_22_performanceEvolution?: string; // Melhora consistente | Estável | Retração | Sem dados
  ef_23_learningSupport?: string; // Sistemático | Pontual | Não

  // Bloco 5: Relação com as Famílias e Avaliação Institucional
  ef_25_familyRelationship?: string; // Muito boa | Boa | Regular | Ruim | Muito ruim
  ef_26_considersTerritoryPlanning?: string; // Sim | Parcialmente | Não
  ef_27_focusAspects?: string[]; // até 3
  ef_28_overallQuality?: string; // Excelente | Boa | Regular | Frágil

  // Final remarks and storage metadata
  finalRemarks?: string;
  supabaseStorageUrl?: string;
  supabaseStoragePath?: string;
}
