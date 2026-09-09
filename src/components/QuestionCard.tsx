import React, { useState } from 'react';
import {
  QuestionStep,
  SurveyFormData,
  EducationSphere,
  RespondentRole,
  Ei18StaffData,
  Ei17Data,
  Ef02ClassDistribution,
} from '../types/questionnaire';
import { isStepAnswered, isStepSuppressed } from '../data/steps';
import {
  SECTORS_LIST,
  SCHOOLS_BY_SECTOR,
  ALL_SCHOOLS,
  SchoolItem,
  getOfficialNeighborhoodForSchool,
} from '../data/schoolsData';
import {
  School,
  Building2,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ArrowLeft,
  FastForward,
  BookOpen,
  Utensils,
  Sun,
  Bus,
  Check,
  Info,
  ChevronRight,
  Sparkles,
  UserCheck,
  Phone,
  Mail,
  Briefcase,
  Layers,
  Search,
  ListFilter,
  MapPin,
  GraduationCap,
  ShieldCheck,
  HeartHandshake,
  ClipboardList,
  Award,
  Users,
} from 'lucide-react';

interface QuestionCardProps {
  step: QuestionStep;
  stepIndex: number;
  totalSteps: number;
  formData: SurveyFormData;
  allSteps: QuestionStep[];
  onChange: (updated: Partial<SurveyFormData>) => void;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  onJumpToStep: (stepId: string) => void;
  onOpenPanel: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  step,
  stepIndex,
  totalSteps,
  formData,
  allSteps,
  onChange,
  onNext,
  onPrev,
  onSkip,
  onJumpToStep,
  onOpenPanel,
}) => {
  const [quickJumpCode, setQuickJumpCode] = useState('');
  const [jumpError, setJumpError] = useState<string | null>(null);
  const [schoolSearchQuery, setSchoolSearchQuery] = useState('');
  const [isManualSchoolInput, setIsManualSchoolInput] = useState(false);

  const isAnswered = isStepAnswered(step.id, formData);

  const handleQuickJump = (e: React.FormEvent) => {
    e.preventDefault();
    setJumpError(null);
    const cleaned = quickJumpCode.trim().toUpperCase().replace(/\s+/g, '-');
    if (!cleaned) return;

    // Search by stepCode, id or key
    const target = allSteps.find(
      (s) =>
        s.stepCode.toUpperCase() === cleaned ||
        s.id.toUpperCase() === cleaned ||
        (s.key && s.key.toUpperCase() === cleaned) ||
        (s.key && s.key.toUpperCase().replace('-', '_') === cleaned.replace('-', '_')) ||
        s.stepCode.toUpperCase().replace('-', '') === cleaned.replace('-', '')
    );

    if (target) {
      onJumpToStep(target.id);
      setQuickJumpCode('');
    } else {
      setJumpError(`Código "${quickJumpCode}" não encontrado nas questões ativas.`);
    }
  };

  // Helper toggle for array fields
  const toggleArrayItem = (field: keyof SurveyFormData, item: string, maxItems = 99) => {
    const list: string[] = (formData[field] as string[]) || [];
    if (list.includes(item)) {
      onChange({ [field]: list.filter((i) => i !== item) } as Partial<SurveyFormData>);
    } else {
      if (list.length < maxItems) {
        onChange({ [field]: [...list, item] } as Partial<SurveyFormData>);
      }
    }
  };

  const handleWaitingListChange = (value: number | undefined) => {
    onChange(
      value === 0
        ? {
            ei_03_waitingListCount: 0,
            ei_04_avgWaitTime: 'Não há tempo de espera (Sem lista de espera)',
            ei_05_reasonsNoSlot: ['Não se aplica (Sem lista de espera)'],
            ei_06_highestDemandShift: 'Não se aplica (Sem lista de espera)',
          }
        : {
            ei_03_waitingListCount: value,
            ei_04_avgWaitTime: undefined,
            ei_05_reasonsNoSlot: [],
            ei_06_highestDemandShift: undefined,
          }
    );
  };

  return (
    <div className="bento-card p-6 sm:p-8 flex flex-col justify-between min-h-[620px] h-full shadow-xs">
      {/* Top Header & Status Indicator */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="bento-badge bg-blue-50 text-blue-700 border border-blue-100 font-mono text-xs">
              [Etapa {stepIndex + 1} de {totalSteps} - {step.shortLabel}]
            </span>

            {/* Answered / Pending Indicator */}
            {isAnswered ? (
              <span className="bento-badge bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                [Respondida]
              </span>
            ) : (
              <span className="bento-badge bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold">
                <Clock className="w-3 h-3 text-amber-600" />
                [Pendente]
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenPanel}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition"
              title="Abrir Painel de Todas as Questões"
            >
              <ListFilter className="w-3.5 h-3.5" />
              <span>Painel / Menu</span>
            </button>
            {step.key && (
              <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                key: {step.key}
              </span>
            )}
            <span className="text-xs font-mono font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
              {step.stepCode}
            </span>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
          {step.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 leading-relaxed">
          {step.description}
        </p>

        {/* Prompt Card */}
        <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
            <School className="w-4 h-4" />
          </div>
          <div className="text-xs text-slate-700 leading-relaxed">
            <strong className="text-slate-900 block font-semibold mb-0.5">
              Secretaria Municipal de Educação:
            </strong>
            &ldquo;{step.directorPrompt}&rdquo;
          </div>
        </div>
      </div>

      {/* Main Question Inputs */}
      <div className="my-6 flex-1">
        {/* ================= ETAPA 0: IDENTIFICAÇÃO DO USUÁRIO ================= */}
        {step.id === 'ETAPA_0_IDENTIFICACAO' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  1. Nome Completo do Respondente <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.directorName}
                  onChange={(e) => onChange({ directorName: e.target.value })}
                  placeholder="Ex: Ana Paula de Castro"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-blue-600" />
                  2. Cargo / Função na Escola (OBRIGATÓRIO) <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onChange({ respondentRole: 'DIRETOR' })}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition text-left flex items-center justify-between ${
                      formData.respondentRole === 'DIRETOR'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>[1] Diretor(a)</span>
                    {formData.respondentRole === 'DIRETOR' && <Check className="w-4 h-4 text-blue-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => onChange({ respondentRole: 'PROFESSOR_CO_RESPONSAVEL' })}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition text-left flex items-center justify-between ${
                      formData.respondentRole === 'PROFESSOR_CO_RESPONSAVEL'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span>[2] Prof. Co-Responsável</span>
                    {formData.respondentRole === 'PROFESSOR_CO_RESPONSAVEL' && (
                      <Check className="w-4 h-4 text-blue-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  3. E-mail de Contato <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.directorEmail}
                  onChange={(e) => onChange({ directorEmail: e.target.value })}
                  placeholder="Ex: escola@pindamonhangaba.sp.gov.br"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  4. Telefone / WhatsApp <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.directorPhone}
                  onChange={(e) => onChange({ directorPhone: e.target.value })}
                  placeholder="Ex: (12) 99123-4567"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= ETAPA 1: DADOS DA UNIDADE E TRIAGEM ================= */}
        {step.id === 'ETAPA_1_TRIAGEM' && (
          <div className="space-y-6">
            {/* 1. Pré-Opção: Setor da Unidade Escolar */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  1. Setor da Unidade Escolar (Pré-Opção de Agrupamento) <span className="text-rose-500">*</span>
                </label>
                {formData.schoolSector && (
                  <button
                    type="button"
                    onClick={() => onChange({ schoolSector: '' })}
                    className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 underline cursor-pointer"
                  >
                    Ver Todos os Setores
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-500 mb-3">
                Selecione o setor da escola para filtrar e carregar a relação oficial das unidades:
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                {SECTORS_LIST.map((sector) => {
                  const isSelected = formData.schoolSector === sector;
                  const count = SCHOOLS_BY_SECTOR[sector]?.length || 0;
                  return (
                    <button
                      key={sector}
                      type="button"
                      onClick={() => {
                        onChange({ schoolSector: sector });
                        setIsManualSchoolInput(false);
                      }}
                      className={`p-2.5 rounded-xl border text-center transition flex flex-col items-center justify-center cursor-pointer ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600 text-white font-bold shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:border-slate-300 font-semibold'
                      }`}
                    >
                      <span className="text-xs">{sector}</span>
                      <span
                        className={`text-[10px] mt-0.5 px-1.5 py-0.2 rounded-md ${
                          isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {count} escolas
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Nome da Unidade Escolar */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <School className="w-3.5 h-3.5 text-blue-600" />
                  2. Nome da Unidade Escolar <span className="text-rose-500">*</span>
                  {formData.schoolSector && (
                    <span className="ml-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Filtrado: {formData.schoolSector}
                    </span>
                  )}
                </label>
                <button
                  type="button"
                  onClick={() => setIsManualSchoolInput(!isManualSchoolInput)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline cursor-pointer"
                >
                  {isManualSchoolInput ? 'Selecionar da Lista' : 'Digitar Manualmente'}
                </button>
              </div>

              {isManualSchoolInput ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={formData.schoolName}
                    onChange={(e) => onChange({ schoolName: e.target.value })}
                    placeholder="Digite o nome completo da Unidade Escolar"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm bg-white"
                  />
                  <span className="text-[11px] text-slate-500 block">
                    Modo de digitação livre ativo. Se preferir, clique em &ldquo;Selecionar da Lista&rdquo; para escolher entre as escolas catalogadas por setor.
                  </span>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {/* Search Bar for Schools */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={schoolSearchQuery}
                      onChange={(e) => setSchoolSearchQuery(e.target.value)}
                      placeholder={
                        formData.schoolSector
                          ? `Buscar escola no ${formData.schoolSector}...`
                          : 'Buscar escola por nome ou bairro...'
                      }
                      className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* List of Schools */}
                  {(() => {
                    const currentSectorSchools = formData.schoolSector
                      ? SCHOOLS_BY_SECTOR[formData.schoolSector] || []
                      : ALL_SCHOOLS;

                    const filteredSchools = currentSectorSchools.filter((school) => {
                      if (!schoolSearchQuery.trim()) return true;
                      const q = schoolSearchQuery.toLowerCase();
                      return (
                        school.name.toLowerCase().includes(q) ||
                        school.neighborhood.toLowerCase().includes(q) ||
                        school.sector.toLowerCase().includes(q) ||
                        (school.directorRef && school.directorRef.toLowerCase().includes(q))
                      );
                    });

                    if (filteredSchools.length === 0) {
                      return (
                        <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-center text-xs text-slate-500">
                          Nenhuma escola encontrada com o termo &ldquo;{schoolSearchQuery}&rdquo;.
                          <button
                            type="button"
                            onClick={() => {
                              setIsManualSchoolInput(true);
                              onChange({ schoolName: schoolSearchQuery });
                            }}
                            className="block mx-auto mt-2 text-blue-600 font-bold underline"
                          >
                            Usar &ldquo;{schoolSearchQuery}&rdquo; como nome digitado
                          </button>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                        {filteredSchools.map((school) => {
                          const isSelected =
                            formData.schoolName.trim().toUpperCase() ===
                            school.name.trim().toUpperCase();

                          return (
                            <div
                              key={`${school.sector}-${school.name}`}
                              onClick={() => {
                                onChange({
                                  schoolName: school.name,
                                  schoolSector: school.sector,
                                  neighborhoodCoverage: school.neighborhood,
                                });
                              }}
                              className={`p-3 rounded-xl border text-left cursor-pointer transition flex items-start justify-between gap-2 ${
                                isSelected
                                  ? 'border-blue-600 bg-blue-50/80 shadow-xs ring-1 ring-blue-500/20'
                                  : 'border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300'
                              }`}
                            >
                              <div className="min-w-0 flex-1">
                                <div className="font-bold text-xs text-slate-900 leading-snug">
                                  {school.name}
                                </div>
                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                  <span className="text-[10px] text-slate-600 font-medium bg-slate-100 px-1.5 py-0.5 rounded">
                                    {school.neighborhood}
                                  </span>
                                  {school.directorRef && (
                                    <span className="text-[10px] text-slate-400">
                                      • {school.directorRef}
                                    </span>
                                  )}
                                  {!formData.schoolSector && (
                                    <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
                                      {school.sector}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div
                                className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                                  isSelected
                                    ? 'border-blue-600 bg-blue-600 text-white'
                                    : 'border-slate-300'
                                }`}
                              >
                                {isSelected && <Check className="w-3 h-3 text-white stroke-[3]" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {formData.schoolName && (
                    <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-800 p-2.5 rounded-xl border border-emerald-200 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Unidade Selecionada: <strong>{formData.schoolName}</strong>
                        {formData.schoolSector ? ` (${formData.schoolSector})` : ''}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. Território / Bairro(s) de Abrangência */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-blue-600" />
                  3. Território / Bairro(s) de Abrangência <span className="text-rose-500">*</span>
                </label>

                {(() => {
                  const officialBairro = getOfficialNeighborhoodForSchool(
                    formData.schoolName || formData.schoolId || ''
                  );
                  if (officialBairro && formData.neighborhoodCoverage !== officialBairro) {
                    return (
                      <button
                        type="button"
                        onClick={() => onChange({ neighborhoodCoverage: officialBairro })}
                        className="text-[11px] font-bold text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200 transition flex items-center gap-1 cursor-pointer"
                        title="Restaurar bairro oficial registrado no município"
                      >
                        <span>Restaurar Bairro Oficial: <strong>{officialBairro}</strong></span>
                      </button>
                    );
                  }
                  if (officialBairro) {
                    return (
                      <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Registro Municipal: <strong>{officialBairro}</strong></span>
                      </span>
                    );
                  }
                  return null;
                })()}
              </div>

              <div className="mt-2">
                <input
                  type="text"
                  value={formData.neighborhoodCoverage}
                  onChange={(e) => onChange({ neighborhoodCoverage: e.target.value })}
                  placeholder="Ex: Alto do Cardoso, Crispim, Moreira César, etc."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm bg-white shadow-2xs"
                />
              </div>

              <div className="mt-2 flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed">
                <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Pré-preenchimento automático ativo:</strong> O bairro é inserido a partir dos registros oficiais da Prefeitura para a escola selecionada. <strong>O campo permanece totalmente disponível e desbloqueado</strong> caso deseje alterar a grafia, especificar loteamentos ou adicionar outros territórios atendidos pela unidade.
                </span>
              </div>
            </div>

            {/* 4. Selecione a(s) Etapa(s) de Ensino Ofertada(s) nesta Unidade */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                4. Selecione a(s) Etapa(s) de Ensino Ofertada(s) nesta Unidade:
              </label>
              <div className="space-y-2.5">
                {[
                  {
                    id: 'EI',
                    label: '[EI] Apenas Educação Infantil',
                    desc: 'Creche e/ou Pré-escola. Ativa o Módulo EI (27 questões).',
                  },
                  {
                    id: 'EF',
                    label: '[EF] Apenas Ensino Fundamental I (Anos Iniciais)',
                    desc: '1º ao 5º ano. Ativa o Módulo EF (28 questões).',
                  },
                  {
                    id: 'AMBOS',
                    label: '[AMBOS] Ambas as Esferas (Educação Infantil + Ensino Fundamental I)',
                    desc: 'Unidade integrada que oferta EI e Anos iniciais do EF. Ativa ambos os módulos.',
                  },
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onChange({ sphere: item.id as EducationSphere })}
                    className={`p-3.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      formData.sphere === item.id
                        ? 'border-blue-600 bg-blue-50/60 shadow-xs ring-1 ring-blue-500/20'
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          formData.sphere === item.id
                            ? 'border-blue-600 bg-blue-600 text-white'
                            : 'border-slate-300'
                        }`}
                      >
                        {formData.sphere === item.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <div className="font-bold text-xs text-slate-900">{item.label}</div>
                        <div className="text-[11px] text-slate-500">{item.desc}</div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================= ETAPA 2 (TODOS OS CENÁRIOS): VISITAS DE SUPERVISÃO E APOIO ================= */}
        {step.id === 'ETAPA_2_VISITAS_SUPERVISAO' && (() => {
          const currentVisits = formData['VISITAS_SUPERVISAO'] || formData.supervisionVisitsData || {
            grebs: { dias: undefined, meses: undefined, anual: undefined },
            gt: { dias: undefined, meses: undefined, anual: undefined },
            supervisoras_estado: { dias: undefined, meses: undefined, anual: undefined },
          };

          const handleVisitChange = (
            entity: 'grebs' | 'gt' | 'supervisoras_estado',
            field: 'dias' | 'meses' | 'anual',
            value: number | undefined
          ) => {
            const updated = {
              grebs: { ...(currentVisits.grebs || {}) },
              gt: { ...(currentVisits.gt || {}) },
              supervisoras_estado: { ...(currentVisits.supervisoras_estado || {}) },
            };
            updated[entity] = {
              ...updated[entity],
              [field]: value,
            };

            onChange({
              'VISITAS_SUPERVISAO': updated,
              supervisionVisitsData: updated,
            });
          };

          const entities = [
            {
              key: 'grebs' as const,
              title: "GREB's (Gerências Regionais de Educação Básica)",
              desc: 'Equipes técnicas e pedagógicas de apoio regional',
              icon: Building2,
            },
            {
              key: 'gt' as const,
              title: 'Grupo de Trabalho (GT)',
              desc: 'Comissões técnicas e grupos temáticos de acompanhamento pedagógico',
              icon: Users,
            },
            {
              key: 'supervisoras_estado' as const,
              title: 'Supervisoras de Ensino do Estado',
              desc: 'Supervisão institucional e acompanhamento de conformidade da rede estadual',
              icon: GraduationCap,
            },
          ];

          return (
            <div className="space-y-6">
              <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl text-slate-800">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 border border-blue-200/80">
                    <Info className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Instruções de Preenchimento da Frequência
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Informe para cada equipe a frequência com que a sua unidade escolar recebe visitas técnicas. Você pode preencher a periodicidade em <strong>dias</strong> (ex: a cada 15 dias), em <strong>meses</strong> (ex: a cada 2 meses ou 1x ao mês) e/ou o total <strong>anual</strong> (ex: 6 vezes ao ano).
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {entities.map((item) => {
                  const Icon = item.icon;
                  const data = currentVisits[item.key] || {};
                  const isFilled =
                    typeof data.dias === 'number' ||
                    typeof data.meses === 'number' ||
                    typeof data.anual === 'number';

                  return (
                    <div
                      key={item.key}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                        isFilled
                          ? 'border-blue-200 bg-white shadow-xs ring-1 ring-blue-500/10'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                            <Icon className="w-5 h-5 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                            <p className="text-[11px] text-slate-500">{item.desc}</p>
                          </div>
                        </div>

                        {isFilled && (
                          <span className="self-start sm:self-auto inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                            <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                            <span>Preenchido</span>
                          </span>
                        )}
                      </div>

                      {/* Quadro de Inserção Numérica: Dias, Meses ou Anual */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* 1. Em Dias */}
                        <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200">
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            A cada quantos dias?
                          </label>
                          <span className="text-[10px] text-slate-500 block mb-2">Periodicidade em dias</span>
                          <div className="relative">
                            <input
                              type="number"
                              min={0}
                              value={data.dias !== undefined ? data.dias : ''}
                              onChange={(e) =>
                                handleVisitChange(
                                  item.key,
                                  'dias',
                                  e.target.value === '' ? undefined : parseInt(e.target.value, 10) || 0
                                )
                              }
                              onFocus={(e) => e.target.select()}
                              placeholder="Ex: 15"
                              className="w-full px-3 py-2 pr-12 rounded-lg border border-slate-300 font-extrabold text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                              dias
                            </span>
                          </div>
                        </div>

                        {/* 2. Em Meses */}
                        <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200">
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            A cada quantos meses?
                          </label>
                          <span className="text-[10px] text-slate-500 block mb-2">Periodicidade em meses</span>
                          <div className="relative">
                            <input
                              type="number"
                              min={0}
                              value={data.meses !== undefined ? data.meses : ''}
                              onChange={(e) =>
                                handleVisitChange(
                                  item.key,
                                  'meses',
                                  e.target.value === '' ? undefined : parseInt(e.target.value, 10) || 0
                                )
                              }
                              onFocus={(e) => e.target.select()}
                              placeholder="Ex: 1"
                              className="w-full px-3 py-2 pr-14 rounded-lg border border-slate-300 font-extrabold text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                              meses
                            </span>
                          </div>
                        </div>

                        {/* 3. Anual */}
                        <div className="p-3 bg-slate-50/90 rounded-xl border border-slate-200">
                          <label className="block text-xs font-bold text-slate-700 mb-1">
                            Frequência Anual
                          </label>
                          <span className="text-[10px] text-slate-500 block mb-2">Vezes no ano letivo</span>
                          <div className="relative">
                            <input
                              type="number"
                              min={0}
                              value={data.anual !== undefined ? data.anual : ''}
                              onChange={(e) =>
                                handleVisitChange(
                                  item.key,
                                  'anual',
                                  e.target.value === '' ? undefined : parseInt(e.target.value, 10) || 0
                                )
                              }
                              onFocus={(e) => e.target.select()}
                              placeholder="Ex: 10"
                              className="w-full px-3 py-2 pr-16 rounded-lg border border-slate-300 font-extrabold text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 pointer-events-none">
                              vezes/ano
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* ================= QUESTÃO UNIVERSAL UNI-01: VIABILIDADE E DIRETRIZ DE OFERTA INTEGRAL ================= */}
        {step.id === 'UNI_01' && (() => {
          const currentUniData = formData['ed-integral'] || formData['UNI-01'] || formData.uni_01_data || formData.ed_integral || {
            diretriz_escolhida: undefined,
            detalhes: {
              acao_continuidade: undefined,
              qtd_salas_ajuste: undefined,
              regime_planejado: undefined,
              qtd_salas_implementacao: undefined,
              qtd_salas_ampliacao: undefined,
              observacao_comunidade: '',
            },
          };

          const diretriz = currentUniData.diretriz_escolhida || formData.uni_01_diretriz;
          const detalhes = currentUniData.detalhes || {};

          const updateUni = (newDiretriz?: 'CONTINUIDADE' | 'IMPLEMENTACAO' | 'AMPLIACAO', newDetalhes?: Partial<typeof detalhes>) => {
            const updatedData = {
              diretriz_escolhida: newDiretriz !== undefined ? newDiretriz : diretriz,
              detalhes: {
                ...detalhes,
                ...(newDetalhes || {}),
              },
            };
            onChange({
              uni_01_diretriz: updatedData.diretriz_escolhida,
              uni_01_data: updatedData,
              'UNI-01': updatedData,
              'ed-integral': updatedData,
              ed_integral: updatedData,
              edIntegral: updatedData,
            });
          };

          return (
            <div className="space-y-6">
              {/* Instrução Oficial SME */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50/60 p-4 rounded-2xl border border-blue-200/80">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block mb-0.5">
                      Diretriz SME • Diagnóstico de Oferta Integral
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      Considerando a estrutura física atual, o interesse da comunidade escolar e a viabilidade operacional, selecione a diretriz pretendida para o Ensino Integral nesta unidade.
                    </p>
                  </div>
                </div>
              </div>

              {/* TELA A: SELEÇÃO DA DIRETRIZ PRINCIPAL */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
                  1. Selecione a Diretriz Pretendida para a Unidade Escolar:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    {
                      id: 'CONTINUIDADE' as const,
                      title: '1. CONTINUIDADE',
                      desc: 'Para unidades que já ofertam Ensino Integral e pretendem manter a modalidade.',
                      badge: 'Manutenção / Ajuste',
                    },
                    {
                      id: 'IMPLEMENTACAO' as const,
                      title: '2. IMPLEMENTAÇÃO',
                      desc: 'Para unidades que não possuem Ensino Integral e pretendem iniciar a oferta.',
                      badge: 'Nova Oferta',
                    },
                    {
                      id: 'AMPLIACAO' as const,
                      title: '3. AMPLIAÇÃO',
                      desc: 'Para unidades que já possuem Ensino Integral e pretendem expandir o atendimento.',
                      badge: 'Expansão de Vagas',
                    },
                  ].map((option) => {
                    const isSelected = diretriz === option.id;
                    return (
                      <div
                        key={option.id}
                        onClick={() => updateUni(option.id)}
                        className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between text-left ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-2 ring-blue-500/20'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                isSelected
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-100 text-slate-600 border border-slate-200'
                              }`}
                            >
                              {option.badge}
                            </span>
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                isSelected ? 'border-blue-600 bg-blue-600' : 'border-slate-300'
                              }`}
                            >
                              {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                            </div>
                          </div>
                          <h4 className="font-bold text-sm text-slate-900 mb-1">{option.title}</h4>
                          <p className="text-xs text-slate-600 leading-relaxed">{option.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TELA B: LÓGICA CONDICIONAL DINÂMICA */}
              {diretriz && (
                <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-5">
                  <div className="flex items-center gap-2 pb-3 border-b border-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      2. Detalhamento Operacional: Diretriz [{diretriz}]
                    </h4>
                  </div>

                  {/* CASO 1: CONTINUIDADE */}
                  {diretriz === 'CONTINUIDADE' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2">
                          Direcionamento das Salas em Oferta:
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          {[
                            { id: 'MANTER', label: 'Manter quantidade atual de salas' },
                            { id: 'AUMENTAR', label: 'Aumentar a oferta de salas' },
                            { id: 'DIMINUIR', label: 'Diminuir a oferta de salas' },
                          ].map((act) => {
                            const isActSelected = detalhes.acao_continuidade === act.id;
                            return (
                              <button
                                key={act.id}
                                type="button"
                                onClick={() =>
                                  updateUni(undefined, {
                                    acao_continuidade: act.id as any,
                                    qtd_salas_ajuste: act.id === 'MANTER' ? 0 : detalhes.qtd_salas_ajuste,
                                  })
                                }
                                className={`p-3 rounded-xl border text-xs font-medium text-left transition flex items-center justify-between ${
                                  isActSelected
                                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-2xs'
                                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <span>{act.label}</span>
                                <div
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                                    isActSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                                  }`}
                                >
                                  {isActSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Quantidade de Salas para Ajuste se Aumentar ou Diminuir */}
                      {(detalhes.acao_continuidade === 'AUMENTAR' || detalhes.acao_continuidade === 'DIMINUIR') && (
                        <div className="p-4 bg-white rounded-xl border border-blue-200/80 shadow-2xs space-y-2">
                          <label className="block text-xs font-bold text-slate-800">
                            Informe a quantidade de salas a serem {detalhes.acao_continuidade === 'AUMENTAR' ? 'adicionadas' : 'reduzidas'}:
                          </label>
                          <div className="relative max-w-xs">
                            <input
                              type="number"
                              min={1}
                              value={detalhes.qtd_salas_ajuste !== undefined ? detalhes.qtd_salas_ajuste : ''}
                              onChange={(e) =>
                                updateUni(undefined, {
                                  qtd_salas_ajuste: e.target.value === '' ? undefined : parseInt(e.target.value, 10) || 0,
                                })
                              }
                              placeholder="Ex: 2"
                              className="w-full px-3.5 py-2.5 pr-14 rounded-xl border border-slate-300 text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                            />
                            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                              salas
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* CASO 2: IMPLEMENTAÇÃO */}
                  {diretriz === 'IMPLEMENTACAO' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-2">
                          Regime de Turno Planejado:
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {[
                            { id: 'INTEGRAL', label: 'Tempo Integral (Jornada Completa)' },
                            { id: 'PARCIAL', label: 'Tempo Parcial (Turno Específico)' },
                          ].map((reg) => {
                            const isRegSelected = detalhes.regime_planejado === reg.id;
                            return (
                              <button
                                key={reg.id}
                                type="button"
                                onClick={() =>
                                  updateUni(undefined, {
                                    regime_planejado: reg.id as any,
                                  })
                                }
                                className={`p-3 rounded-xl border text-xs font-medium text-left transition flex items-center justify-between ${
                                  isRegSelected
                                    ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold shadow-2xs'
                                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                                }`}
                              >
                                <span>{reg.label}</span>
                                <div
                                  className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ml-2 ${
                                    isRegSelected ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                                  }`}
                                >
                                  {isRegSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="p-4 bg-white rounded-xl border border-blue-200/80 shadow-2xs space-y-2">
                        <label className="block text-xs font-bold text-slate-800">
                          Qual a quantidade de salas planejadas para esta implementação?
                        </label>
                        <div className="relative max-w-xs">
                          <input
                            type="number"
                            min={1}
                            value={detalhes.qtd_salas_implementacao !== undefined ? detalhes.qtd_salas_implementacao : ''}
                            onChange={(e) =>
                              updateUni(undefined, {
                                qtd_salas_implementacao: e.target.value === '' ? undefined : parseInt(e.target.value, 10) || 0,
                              })
                            }
                            placeholder="Ex: 3"
                            className="w-full px-3.5 py-2.5 pr-14 rounded-xl border border-slate-300 text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                          />
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                            salas
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CASO 3: AMPLIAÇÃO */}
                  {diretriz === 'AMPLIACAO' && (
                    <div className="space-y-4">
                      <div className="p-4 bg-white rounded-xl border border-blue-200/80 shadow-2xs space-y-2">
                        <label className="block text-xs font-bold text-slate-800">
                          Informe a quantidade de salas adicionais que se pretende ampliar:
                        </label>
                        <div className="relative max-w-xs">
                          <input
                            type="number"
                            min={1}
                            value={detalhes.qtd_salas_ampliacao !== undefined ? detalhes.qtd_salas_ampliacao : ''}
                            onChange={(e) =>
                              updateUni(undefined, {
                                qtd_salas_ampliacao: e.target.value === '' ? undefined : parseInt(e.target.value, 10) || 0,
                              })
                            }
                            placeholder="Ex: 4"
                            className="w-full px-3.5 py-2.5 pr-14 rounded-xl border border-slate-300 text-slate-900 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                          />
                          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 pointer-events-none">
                            salas adicionais
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* CAMPO TRANSVERSAL (Exibido para todas as opções) */}
                  <div className="pt-2 border-t border-slate-200">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Observações sobre a anuência da comunidade ou aspectos físicos/operacionais <span className="text-slate-400 font-normal">(Opcional)</span>:
                    </label>
                    <textarea
                      rows={3}
                      value={detalhes.observacao_comunidade || ''}
                      onChange={(e) =>
                        updateUni(undefined, {
                          observacao_comunidade: e.target.value,
                        })
                      }
                      placeholder="Descreva detalhes sobre a receptividade das famílias, demanda territorial, necessidades de adaptação predial ou parecer da equipe gestora..."
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white leading-relaxed shadow-2xs"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* ================= EI-01 ================= */}
        {step.id === 'EI_01' && (
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Número total de crianças matriculadas na Educação Infantil:
            </label>
            <input
              type="number"
              min={0}
              value={
                formData.ei_01_totalEnrolled !== undefined
                  ? formData.ei_01_totalEnrolled
                  : formData.ei_15_totalEnrolled !== undefined
                  ? formData.ei_15_totalEnrolled
                  : ''
              }
              onChange={(e) => {
                const val = e.target.value === '' ? undefined : parseInt(e.target.value, 10) || 0;
                onChange({ ei_01_totalEnrolled: val, ei_15_totalEnrolled: val });
              }}
              onFocus={(e) => e.target.select()}
              placeholder="0"
              className="w-full max-w-xs px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-lg font-bold bg-white text-center"
            />
          </div>
        )}

        {/* ================= EI-02 ================= */}
        {step.id === 'EI_02' && (
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Número de vagas atualmente ocupadas por turno:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 block mb-1">Manhã</span>
                <input
                  type="number"
                  min={0}
                  value={formData.ei_02_occupiedMorning !== undefined ? formData.ei_02_occupiedMorning : ''}
                  onChange={(e) =>
                    onChange({ ei_02_occupiedMorning: e.target.value === '' ? undefined : parseInt(e.target.value, 10) || 0 })
                  }
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  className="w-full py-2 px-3 rounded-lg border border-slate-300 font-bold text-center text-slate-900 bg-white"
                />
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 block mb-1">Tarde</span>
                <input
                  type="number"
                  min={0}
                  value={formData.ei_02_occupiedAfternoon !== undefined ? formData.ei_02_occupiedAfternoon : ''}
                  onChange={(e) =>
                    onChange({ ei_02_occupiedAfternoon: e.target.value === '' ? undefined : parseInt(e.target.value, 10) || 0 })
                  }
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  className="w-full py-2 px-3 rounded-lg border border-slate-300 font-bold text-center text-slate-900 bg-white"
                />
              </div>
              <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200">
                <span className="text-xs font-bold text-blue-900 block mb-1">Integral</span>
                <input
                  type="number"
                  min={0}
                  value={formData.ei_02_occupiedIntegral !== undefined ? formData.ei_02_occupiedIntegral : ''}
                  onChange={(e) =>
                    onChange({ ei_02_occupiedIntegral: e.target.value === '' ? undefined : parseInt(e.target.value, 10) || 0 })
                  }
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  className="w-full py-2 px-3 rounded-lg border border-blue-300 font-bold text-center text-blue-700 bg-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* ================= EI-03 ================= */}
        {step.id === 'EI_03' && (
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Quantas crianças encontram-se atualmente em lista de espera?
            </label>
            <input
              type="number"
              min={0}
              value={formData.ei_03_waitingListCount !== undefined ? formData.ei_03_waitingListCount : ''}
              onChange={(e) =>
                handleWaitingListChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10) || 0)
              }
              onFocus={(e) => e.target.select()}
              placeholder="0"
              className="w-full max-w-xs px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-lg font-bold bg-white text-center"
            />
          </div>
        )}

        {/* ================= EI-04 ================= */}
        {step.id === 'EI_04' && (
          <div className="space-y-4">
            {formData.ei_03_waitingListCount === 0 ? (
              <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-2xl text-emerald-900 space-y-3">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                      Etapa Suprimida / Preenchida Automaticamente
                    </h4>
                    <p className="text-xs text-emerald-700 mt-1 leading-relaxed">
                      No item anterior <strong>EI-03</strong> foi informado que <strong>não há crianças em lista de espera (0 alunos)</strong>. Portanto, o tempo médio de espera foi definido automaticamente como <strong>&ldquo;Não há tempo de espera&rdquo;</strong>.
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-800 bg-white px-2.5 py-1 rounded-lg border border-emerald-200">
                    Status: Não há tempo de espera
                  </span>
                  <button
                    type="button"
                    onClick={onNext}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                  >
                    <span>Avançar para EI-05</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Qual o tempo médio de espera das crianças na lista?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    'Não há tempo de espera',
                    'Até 3 meses',
                    '4 a 6 meses',
                    '7 a 12 meses',
                    'Mais de 12 meses',
                    'Não há controle',
                  ].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => onChange({ ei_04_avgWaitTime: opt })}
                      className={`p-3 rounded-xl border text-left text-xs font-bold transition flex items-center justify-between ${
                        formData.ei_04_avgWaitTime === opt
                          ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500/20'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{opt}</span>
                      {formData.ei_04_avgWaitTime === opt && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ================= EI-05 ================= */}
        {step.id === 'EI_05' && (
          <div className="space-y-4">
            {formData.ei_03_waitingListCount === 0 ? (
              <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-2xl text-emerald-900 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Etapa Suprimida / Preenchida Automaticamente
                </h4>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Como o item <strong>EI-03</strong> foi respondido com zero, não há ausência de vaga a justificar. A resposta foi registrada como <strong>Não se aplica (Sem lista de espera)</strong>.
                </p>
                <button type="button" onClick={onNext} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer">
                  <span>Avançar para EI-06</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Principais motivos relatados para a não obtenção de vaga:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {['Falta de vaga', 'Distância/acesso', 'Horário incompatível', 'Outro'].map((m) => {
                const isChecked = (formData.ei_05_reasonsNoSlot || []).includes(m);
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => toggleArrayItem('ei_05_reasonsNoSlot', m)}
                    className={`p-3 rounded-xl border text-left text-xs transition flex items-center gap-2.5 ${
                      isChecked
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                        isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3" />}
                    </div>
                    <span>{m}</span>
                  </button>
                );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ================= EI-06 ================= */}
        {step.id === 'EI_06' && (
          <div className="space-y-4">
            {formData.ei_03_waitingListCount === 0 ? (
              <div className="p-4 bg-emerald-50/90 border border-emerald-200 rounded-2xl text-emerald-900 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                  Etapa Suprimida / Preenchida Automaticamente
                </h4>
                <p className="text-xs text-emerald-700 leading-relaxed">
                  Como não há fila no item <strong>EI-03</strong>, não existe turno de maior procura a registrar. A resposta foi definida como <strong>Não se aplica (Sem lista de espera)</strong>.
                </p>
                <button type="button" onClick={onNext} className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer">
                  <span>Avançar para EI-07</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Turno de maior procura entre as famílias em lista de espera:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {['Parcial Manhã', 'Parcial Tarde', 'Integral', 'Equilibrado'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => onChange({ ei_06_highestDemandShift: t })}
                  className={`p-3 rounded-xl border text-center text-xs font-bold transition ${
                    formData.ei_06_highestDemandShift === t
                      ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {t}
                </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        {/* ================= EI-07 ================= */}
        {step.id === 'EI_07' && (
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Há solicitações de famílias para troca de período (turno)?
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {[
                'Sim, com frequência',
                'Sim, ocasionalmente',
                'Não há solicitação',
                'Não sabe',
              ].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChange({ ei_07_shiftChangeRequests: opt })}
                  className={`p-3 rounded-xl border text-left text-xs font-bold transition flex items-center justify-between ${
                    formData.ei_07_shiftChangeRequests === opt
                      ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{opt}</span>
                  {formData.ei_07_shiftChangeRequests === opt && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ================= EI-08 ================= */}
        {step.id === 'EI_08' && (
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Caso haja solicitações de troca, qual o número estimado de crianças aguardando?
            </label>
            <input
              type="number"
              min={0}
              value={formData.ei_08_shiftChangeWaitingCount !== undefined ? formData.ei_08_shiftChangeWaitingCount : ''}
              onChange={(e) =>
                onChange({ ei_08_shiftChangeWaitingCount: e.target.value === '' ? undefined : parseInt(e.target.value, 10) || 0 })
              }
              onFocus={(e) => e.target.select()}
              placeholder="0"
              className="w-full max-w-xs px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-lg font-bold bg-white text-center"
            />
          </div>
        )}

        {/* ================= EI-09 ================= */}
        {step.id === 'EI_09' && (
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Principal motivo relatado para troca e período/época do ano com maior procura:
            </label>
            <textarea
              rows={3}
              value={formData.ei_09_shiftChangeReasonAndPeak || ''}
              onChange={(e) => onChange({ ei_09_shiftChangeReasonAndPeak: e.target.value })}
              placeholder="Ex: Trabalho dos pais no comércio e indústria; maior volume de pedidos nos meses de janeiro/fevereiro e julho."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        )}

        {/* ================= EI-10 ================= */}
        {step.id === 'EI_10' && (
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              A unidade possui capacidade física e estrutural para ampliar o número de vagas ofertadas?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {['Sim, plenamente', 'Sim, parcialmente', 'Não', 'Não sabe'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => onChange({ ei_10_expansionCapacity: opt })}
                  className={`p-3 rounded-xl border text-center text-xs font-bold transition ${
                    formData.ei_10_expansionCapacity === opt
                      ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ================= EI-11 ================= */}
        {step.id === 'EI_11' && (
          <div className="space-y-4">
            {formData.ei_10_expansionCapacity === 'Não' ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 space-y-3">
                <div className="flex items-start gap-2.5">
                  <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Etapa Suprimida / Dispensada
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      No item <strong>EI-10</strong> foi informado que a unidade escolar <strong>não possui capacidade física e estrutural para ampliação de vagas (&ldquo;Não&rdquo;)</strong>. A estimativa de vagas adicionais foi definida como <strong>0 vagas adicionais</strong>.
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    Status: 0 vagas adicionais (Sem capacidade física)
                  </span>
                  <button
                    type="button"
                    onClick={onNext}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                  >
                    <span>Avançar para EI-12 / EI-13</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Caso haja capacidade, qual o número estimado de vagas adicionais possíveis?
                </label>
                <input
                  type="number"
                  min={0}
                  value={formData.ei_11_additionalSlotsEstimated !== undefined ? formData.ei_11_additionalSlotsEstimated : ''}
                  onChange={(e) =>
                    onChange({ ei_11_additionalSlotsEstimated: e.target.value === '' ? undefined : parseInt(e.target.value, 10) || 0 })
                  }
                  onFocus={(e) => e.target.select()}
                  placeholder="0"
                  className="w-full max-w-xs px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-lg font-bold bg-white text-center"
                />
              </>
            )}
          </div>
        )}

        {/* ================= EI-12 ================= */}
        {step.id === 'EI_12' && (
          <div className="space-y-4">
            {formData.ei_10_expansionCapacity === 'Não' ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 space-y-3">
                <div className="flex items-start gap-2.5">
                  <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Etapa Suprimida / Dispensada
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Como não há capacidade física para ampliação de vagas na unidade (conforme informado no item <strong>EI-10</strong>), o levantamento de recursos necessários foi dispensado.
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    Status: Não se aplica (Sem ampliação prevista)
                  </span>
                  <button
                    type="button"
                    onClick={onNext}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                  >
                    <span>Avançar para EI-13</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Quais recursos seriam necessários para viabilizar a ampliação?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    'Obras/Reforma',
                    'Pessoal',
                    'Mobiliário/Equipamentos',
                    'Transporte',
                    'Alimentação',
                    'Não se aplica (Sem ampliação prevista)',
                    'Outro',
                  ].map((r) => {
                    const isChecked = (formData.ei_12_resourcesNeeded || []).includes(r);
                    return (
                      <button
                        key={r}
                        type="button"
                        onClick={() => toggleArrayItem('ei_12_resourcesNeeded', r)}
                        className={`p-3 rounded-xl border text-left text-xs transition flex items-center gap-2.5 ${
                          isChecked
                            ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                            isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3" />}
                        </div>
                        <span>{r}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* ================= EI-17: Crianças em Tempo Integral vs. Parcial ================= */}
        {step.id === 'EI_17' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Coluna 1: Tempo Integral */}
              <div className="p-5 bg-gradient-to-b from-blue-50/70 to-blue-50/30 rounded-2xl border border-blue-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-blue-200/70 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                    <h3 className="text-sm font-bold text-blue-950 uppercase tracking-wide">
                      Tempo Integral
                    </h3>
                  </div>
                  <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md">
                    Jornada Estendida
                  </span>
                </div>

                {/* Campo 1: Matriculados em Tempo Integral */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    1. Matriculados em Tempo Integral <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Total de alunos atualmente matriculados no regime integral:
                  </p>
                  <input
                    type="number"
                    min={0}
                    value={formData.ei_17_integralCount !== undefined ? formData.ei_17_integralCount : ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? undefined : parseInt(e.target.value, 10) || 0;
                      const cap = formData.ei_17_integralCapacity ?? 0;
                      const partCount = formData.ei_17_partialCount ?? 0;
                      const partCap = formData.ei_17_partialCapacity ?? 0;
                      onChange({
                        ei_17_integralCount: val,
                        'EI-17': {
                          integral: { matriculados: val ?? 0, capacidade: cap },
                          parcial: { matriculados: partCount, capacidade: partCap },
                        },
                      });
                    }}
                    onFocus={(e) => e.target.select()}
                    placeholder="0"
                    className="w-full py-2.5 px-3.5 text-center sm:text-left rounded-xl border border-blue-300 font-extrabold text-lg text-blue-900 bg-white shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Campo 2: Capacidade em Tempo Integral */}
                <div className="space-y-1.5 pt-2 border-t border-blue-100">
                  <label className="block text-xs font-bold text-slate-800">
                    2. Qual a capacidade de alunos para o Tempo Integral? <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Capacidade máxima total projetada/autorizada para tempo integral:
                  </p>
                  <input
                    type="number"
                    min={0}
                    value={formData.ei_17_integralCapacity !== undefined ? formData.ei_17_integralCapacity : ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? undefined : parseInt(e.target.value, 10) || 0;
                      const count = formData.ei_17_integralCount ?? 0;
                      const partCount = formData.ei_17_partialCount ?? 0;
                      const partCap = formData.ei_17_partialCapacity ?? 0;
                      onChange({
                        ei_17_integralCapacity: val,
                        'EI-17': {
                          integral: { matriculados: count, capacidade: val ?? 0 },
                          parcial: { matriculados: partCount, capacidade: partCap },
                        },
                      });
                    }}
                    onFocus={(e) => e.target.select()}
                    placeholder="0"
                    className="w-full py-2.5 px-3.5 text-center sm:text-left rounded-xl border border-blue-300 font-extrabold text-lg text-blue-900 bg-white shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Coluna 2: Tempo Parcial */}
              <div className="p-5 bg-gradient-to-b from-slate-50 to-slate-100/60 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                      Tempo Parcial
                    </h3>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded-md">
                    Manhã ou Tarde
                  </span>
                </div>

                {/* Campo 1: Matriculados em Tempo Parcial */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-800">
                    1. Matriculados em Tempo Parcial <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Total de alunos atualmente matriculados no regime parcial:
                  </p>
                  <input
                    type="number"
                    min={0}
                    value={formData.ei_17_partialCount !== undefined ? formData.ei_17_partialCount : ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? undefined : parseInt(e.target.value, 10) || 0;
                      const intCount = formData.ei_17_integralCount ?? 0;
                      const intCap = formData.ei_17_integralCapacity ?? 0;
                      const partCap = formData.ei_17_partialCapacity ?? 0;
                      onChange({
                        ei_17_partialCount: val,
                        'EI-17': {
                          integral: { matriculados: intCount, capacidade: intCap },
                          parcial: { matriculados: val ?? 0, capacidade: partCap },
                        },
                      });
                    }}
                    onFocus={(e) => e.target.select()}
                    placeholder="0"
                    className="w-full py-2.5 px-3.5 text-center sm:text-left rounded-xl border border-slate-300 font-extrabold text-lg text-slate-900 bg-white shadow-2xs focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>

                {/* Campo 2: Capacidade em Tempo Parcial */}
                <div className="space-y-1.5 pt-2 border-t border-slate-200">
                  <label className="block text-xs font-bold text-slate-800">
                    2. Qual a capacidade de alunos para o Tempo Parcial? <span className="text-rose-500">*</span>
                  </label>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Capacidade máxima total projetada/autorizada para tempo parcial:
                  </p>
                  <input
                    type="number"
                    min={0}
                    value={formData.ei_17_partialCapacity !== undefined ? formData.ei_17_partialCapacity : ''}
                    onChange={(e) => {
                      const val = e.target.value === '' ? undefined : parseInt(e.target.value, 10) || 0;
                      const intCount = formData.ei_17_integralCount ?? 0;
                      const intCap = formData.ei_17_integralCapacity ?? 0;
                      const partCount = formData.ei_17_partialCount ?? 0;
                      onChange({
                        ei_17_partialCapacity: val,
                        'EI-17': {
                          integral: { matriculados: intCount, capacidade: intCap },
                          parcial: { matriculados: partCount, capacidade: val ?? 0 },
                        },
                      });
                    }}
                    onFocus={(e) => e.target.select()}
                    placeholder="0"
                    className="w-full py-2.5 px-3.5 text-center sm:text-left rounded-xl border border-slate-300 font-extrabold text-lg text-slate-900 bg-white shadow-2xs focus:outline-none focus:ring-2 focus:ring-slate-500"
                  />
                </div>
              </div>
            </div>

            {/* Quadro Consolidado de Atendimento */}
            {((formData.ei_17_integralCount !== undefined || formData.ei_17_partialCount !== undefined) ||
              (formData.ei_17_integralCapacity !== undefined || formData.ei_17_partialCapacity !== undefined)) && (
              <div className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-slate-500 text-[11px] font-semibold block">Total Matriculados:</span>
                    <span className="text-base font-extrabold text-slate-900">
                      {(formData.ei_17_integralCount || 0) + (formData.ei_17_partialCount || 0)} alunos
                    </span>
                  </div>
                  <div className="border-l border-slate-200 pl-6">
                    <span className="text-slate-500 text-[11px] font-semibold block">Capacidade Total:</span>
                    <span className="text-base font-extrabold text-blue-700">
                      {(formData.ei_17_integralCapacity || 0) + (formData.ei_17_partialCapacity || 0)} vagas
                    </span>
                  </div>
                </div>

                {((formData.ei_17_integralCapacity || 0) + (formData.ei_17_partialCapacity || 0)) > 0 && (
                  <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Taxa de Ocupação da Capacidade
                    </span>
                    <span className="font-extrabold text-slate-800">
                      {(
                        (((formData.ei_17_integralCount || 0) + (formData.ei_17_partialCount || 0)) /
                          ((formData.ei_17_integralCapacity || 0) + (formData.ei_17_partialCapacity || 0))) *
                        100
                      ).toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ================= EI-18: Dimensionamento do Quadro de Profissionais ================= */}
        {step.id === 'EI_18' && (() => {
          const staffRoles: {
            key: keyof Ei18StaffData;
            label: string;
            subtitle: string;
            icon: React.ComponentType<{ className?: string }>;
          }[] = [
            {
              key: 'professores',
              label: 'Professores',
              subtitle: 'Docência e Regência de Classe',
              icon: GraduationCap,
            },
            {
              key: 'professores_especialistas',
              label: 'Professores Especialistas',
              subtitle: 'Artes e Ed. Física Escolar',
              icon: Sparkles,
            },
            {
              key: 'asgs',
              label: "ASG's",
              subtitle: 'Auxiliares de Serviços Gerais',
              icon: ShieldCheck,
            },
            {
              key: 'adis',
              label: "ADI's",
              subtitle: 'Auxiliares de Desenvolvimento Infantil',
              icon: HeartHandshake,
            },
            {
              key: 'aoe',
              label: 'AOE',
              subtitle: 'Agentes de Organização Escolar',
              icon: ClipboardList,
            },
            {
              key: 'estagiarios',
              label: 'Estagiários(as)',
              subtitle: 'Apoio e Inclusão Escolar',
              icon: Award,
            },
            {
              key: 'milclean',
              label: 'Milclean',
              subtitle: 'Equipe Terceirizada de Limpeza e Apoio',
              icon: Users,
            },
          ];

          const currentStaff: Ei18StaffData = formData['EI-18'] || formData.ei_18_staffData || {
            professores: { atual: 0, necessidade: 0 },
            professores_especialistas: { atual: 0, necessidade: 0 },
            asgs: { atual: 0, necessidade: 0 },
            adis: { atual: 0, necessidade: 0 },
            aoe: { atual: 0, necessidade: 0 },
            estagiarios: { atual: 0, necessidade: 0 },
            milclean: { atual: 0, necessidade: 0 },
          };

          const handleStaffChange = (roleKey: keyof Ei18StaffData, field: 'atual' | 'necessidade', value: number) => {
            const updatedStaff: Ei18StaffData = {
              professores: { ...(currentStaff.professores || { atual: 0, necessidade: 0 }) },
              professores_especialistas: { ...(currentStaff.professores_especialistas || { atual: 0, necessidade: 0 }) },
              asgs: { ...(currentStaff.asgs || { atual: 0, necessidade: 0 }) },
              adis: { ...(currentStaff.adis || { atual: 0, necessidade: 0 }) },
              aoe: { ...(currentStaff.aoe || { atual: 0, necessidade: 0 }) },
              estagiarios: { ...(currentStaff.estagiarios || { atual: 0, necessidade: 0 }) },
              milclean: { ...(currentStaff.milclean || { atual: 0, necessidade: 0 }) },
            };

            updatedStaff[roleKey] = {
              ...updatedStaff[roleKey],
              [field]: Math.max(0, value),
            };

            const summaryLines = [
              `Professores: ${updatedStaff.professores.atual} atuais (+${updatedStaff.professores.necessidade} necessários)`,
              `Especialistas: ${updatedStaff.professores_especialistas.atual} atuais (+${updatedStaff.professores_especialistas.necessidade} necessários)`,
              `ASGs: ${updatedStaff.asgs.atual} atuais (+${updatedStaff.asgs.necessidade} necessários)`,
              `ADIs: ${updatedStaff.adis.atual} atuais (+${updatedStaff.adis.necessidade} necessários)`,
              `AOE: ${updatedStaff.aoe.atual} atuais (+${updatedStaff.aoe.necessidade} necessários)`,
              `Estagiários: ${updatedStaff.estagiarios.atual} atuais (+${updatedStaff.estagiarios.necessidade} necessários)`,
              `Milclean: ${updatedStaff.milclean.atual} atuais (+${updatedStaff.milclean.necessidade} necessários)`,
            ].join(' | ');

            if (formData.sphere === 'AMBOS') {
              onChange({
                'EI-18': updatedStaff,
                ei_18_staffData: updatedStaff,
                ei_18_staffBreakdown: summaryLines,
                ef_18_staffBreakdown: summaryLines,
              });
            } else {
              onChange({
                'EI-18': updatedStaff,
                ei_18_staffData: updatedStaff,
                ei_18_staffBreakdown: summaryLines,
              });
            }
          };

          const totalAtual = Object.values(currentStaff).reduce((acc, item) => acc + (item?.atual || 0), 0);
          const totalNecessidade = Object.values(currentStaff).reduce((acc, item) => acc + (item?.necessidade || 0), 0);

          return (
            <div className="space-y-4">
              {formData.sphere === 'AMBOS' && (
                <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block">Quadro Unificado da Unidade (EI + Anos iniciais do EF):</span>
                    <span className="text-blue-800 text-[11px] leading-relaxed">
                      Como a unidade atende Educação Infantil e Ensino Fundamental I no mesmo espaço, informe o quadro geral de profissionais. Os dados serão integrados para ambas as etapas.
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-3.5">
                {staffRoles.map((role) => {
                  const Icon = role.icon;
                  const itemData = currentStaff[role.key] || { atual: 0, necessidade: 0 };
                  return (
                    <div
                      key={role.key}
                      className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200/60">
                            <Icon className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{role.label}</h4>
                            <p className="text-[11px] text-slate-500">{role.subtitle}</p>
                          </div>
                        </div>

                        {(itemData.atual > 0 || itemData.necessidade > 0) && (
                          <div className="flex items-center gap-1.5 self-start sm:self-auto text-[10px] font-bold">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                              Atual: {itemData.atual}
                            </span>
                            {itemData.necessidade > 0 && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                                +{itemData.necessidade} necessários
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                        {/* Card Esquerdo: Quantidade Atual */}
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700">
                              Quantidade Atual
                            </label>
                            <span className="text-[10px] text-slate-500">Em exercício hoje</span>
                          </div>
                          <input
                            type="number"
                            min={0}
                            value={itemData.atual !== undefined ? itemData.atual : ''}
                            onChange={(e) =>
                              handleStaffChange(
                                role.key,
                                'atual',
                                e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0
                              )
                            }
                            onFocus={(e) => e.target.select()}
                            placeholder="0"
                            className="w-20 py-2 text-center rounded-lg border border-slate-300 font-extrabold text-base text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                          />
                        </div>

                        {/* Card Direito: Quantos funcionários necessitaria? */}
                        <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/80 flex items-center justify-between gap-3">
                          <div>
                            <label className="block text-xs font-bold text-amber-950">
                              Quantos funcionários necessitaria?
                            </label>
                            <span className="text-[10px] text-amber-800">Necessidade adicional</span>
                          </div>
                          <input
                            type="number"
                            min={0}
                            value={itemData.necessidade !== undefined ? itemData.necessidade : ''}
                            onChange={(e) =>
                              handleStaffChange(
                                role.key,
                                'necessidade',
                                e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0
                              )
                            }
                            onFocus={(e) => e.target.select()}
                            placeholder="0"
                            className="w-20 py-2 text-center rounded-lg border border-amber-300 font-extrabold text-base text-amber-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Barra Consolidada de Totais */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total do Quadro Atual</span>
                    <span className="text-lg font-extrabold text-white">{totalAtual} profissionais</span>
                  </div>
                  <div className="border-l border-slate-700 pl-6">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block">Total Necessidade Adicional</span>
                    <span className="text-lg font-extrabold text-amber-300">+{totalNecessidade} profissionais</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 hidden sm:inline-block">
                  Dimensionamento EI-18
                </span>
              </div>
            </div>
          );
        })()}

        {step.id === 'EI_19' && (
          <div className="space-y-3">
            {formData.sphere === 'AMBOS' && (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>
                  A classificação territorial selecionada aqui será replicada automaticamente para o Ensino Fundamental I.
                </span>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {['Urbano', 'Rural', 'Periurbano', 'Misto'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    if (formData.sphere === 'AMBOS') {
                      onChange({ ei_19_territoryType: t, ef_04_territoryType: t });
                    } else {
                      onChange({ ei_19_territoryType: t });
                    }
                  }}
                  className={`p-3 rounded-xl border text-center text-xs font-bold transition ${
                    formData.ei_19_territoryType === t
                      ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        )}

        {step.id === 'EI_20' && (
          <div className="space-y-3">
            {formData.sphere === 'AMBOS' && (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-600 flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>
                  A avaliação socioeconômica informada aqui será replicada automaticamente para o Ensino Fundamental I.
                </span>
              </div>
            )}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {['Favoráveis', 'Mistas', 'Vulneráveis', 'Não sabe'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    if (formData.sphere === 'AMBOS') {
                      onChange({ ei_20_socioeconomicProfile: p, ef_05_socioeconomicProfile: p });
                    } else {
                      onChange({ ei_20_socioeconomicProfile: p });
                    }
                  }}
                  className={`p-3 rounded-xl border text-center text-xs font-bold transition ${
                    formData.ei_20_socioeconomicProfile === p
                      ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500/20'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {step.id === 'EI_21' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              'Transporte e locomoção',
              'Horário de trabalho dos responsáveis',
              'Problemas de saúde na família',
              'Condições climáticas / chuvas',
              'Vulnerabilidade social extrema',
            ].map((d) => {
              const isChecked = (formData.ei_21_retentionDifficulties || []).includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleArrayItem('ei_21_retentionDifficulties', d, 3)}
                  className={`p-3 rounded-xl border text-left text-xs transition flex items-center gap-2.5 ${
                    isChecked
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                      isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3" />}
                  </div>
                  <span>{d}</span>
                </button>
              );
            })}
          </div>
        )}

        {step.id === 'EI_22' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {['Sim, plenamente', 'Parcialmente', 'Não', 'Não sabe'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange({ ei_22_infraAdequacy: opt })}
                className={`p-3 rounded-xl border text-center text-xs font-bold transition ${
                  formData.ei_22_infraAdequacy === opt
                    ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {step.id === 'EI_23' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {[
              'Parque',
              'Sala de Leitura',
              'Cantinho da Leitura',
              'Refeitório',
              'Berçário',
              'AEE',
              'Acessibilidade',
            ].map((sp) => {
              const isChecked = (formData.ei_23_availableSpaces || []).includes(sp);
              return (
                <button
                  key={sp}
                  type="button"
                  onClick={() => toggleArrayItem('ei_23_availableSpaces', sp)}
                  className={`p-3 rounded-xl border text-left text-xs transition flex items-center gap-2.5 ${
                    isChecked
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                      isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3" />}
                  </div>
                  <span>{sp}</span>
                </button>
              );
            })}
          </div>
        )}

        {step.id === 'EI_24' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {['Sistemática', 'Pontual', 'Não', 'Não sabe'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange({ ei_24_territoryArticulation: opt })}
                className={`p-3 rounded-xl border text-center text-xs font-bold transition ${
                  formData.ei_24_territoryArticulation === opt
                    ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {step.id === 'EI_25' && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {['Muito boa', 'Boa', 'Regular', 'Ruim', 'Muito ruim'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange({ ei_25_familyRelationship: opt })}
                className={`p-3 rounded-xl border text-center text-xs font-bold transition ${
                  formData.ei_25_familyRelationship === opt
                    ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {step.id === 'EI_26' && (
          <div className="grid grid-cols-3 gap-2.5">
            {['Sim', 'Parcialmente', 'Não'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange({ ei_26_considersTerritoryPlanning: opt })}
                className={`p-3 rounded-xl border text-center text-xs font-bold transition ${
                  formData.ei_26_considersTerritoryPlanning === opt
                    ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {step.id === 'EI_27' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              'Ampliação de vagas em tempo integral',
              'Melhoria dos espaços internos',
              'Construção de novos espaços',
              'Formação continuada',
              'Melhoria de espaços externos',
              'Reforço de equipe de apoio',
              'Recursos e materiais pedagógicos',
            ].map((asp) => {
              const isChecked = (formData.ei_27_focusAspects || []).includes(asp);
              return (
                <button
                  key={asp}
                  type="button"
                  onClick={() => toggleArrayItem('ei_27_focusAspects', asp, 3)}
                  className={`p-3 rounded-xl border text-left text-xs transition flex items-center gap-2.5 ${
                    isChecked
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                      isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3" />}
                  </div>
                  <span>{asp}</span>
                </button>
              );
            })}
          </div>
        )}

        {step.id === 'EI_28' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {['Excelente', 'Boa', 'Regular', 'Crítico'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange({ ei_28_overallQuality: opt })}
                className={`p-3 rounded-xl border text-center text-xs font-bold transition ${
                  formData.ei_28_overallQuality === opt
                    ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {/* ================= MÓDULO EF (EF-01 a EF-28) ================= */}
        {step.id === 'EF_01' && (
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Número total de matrículas ativas nos Anos iniciais do EF:
            </label>
            <input
              type="number"
              min={0}
              value={formData.ef_01_totalEnrolled !== undefined ? formData.ef_01_totalEnrolled : ''}
              onChange={(e) =>
                onChange({ ef_01_totalEnrolled: e.target.value === '' ? undefined : parseInt(e.target.value, 10) || 0 })
              }
              onFocus={(e) => e.target.select()}
              placeholder="0"
              className="w-full max-w-xs px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-lg font-bold bg-white text-center"
            />
          </div>
        )}

        {step.id === 'EF_02' && (
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Número de turmas por ano e turno:
            </label>
            <p className="text-xs text-slate-500">Informe zero quando não houver turma em determinado ano ou turno.</p>
            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <div className="min-w-[620px]">
                <div className="grid grid-cols-[1.2fr_repeat(3,1fr)] bg-slate-100 text-[11px] font-bold text-slate-700">
                  <span className="p-3">Ano</span>
                  <span className="p-3 text-center">Manhã</span>
                  <span className="p-3 text-center">Tarde</span>
                  <span className="p-3 text-center">Integral</span>
                </div>
                {(['1', '2', '3', '4', '5', 'EJA'] as const).map((year) => {
                  const classData = formData.ef_02_classesByYear?.[year] || { manha: 0, tarde: 0, integral: 0 };
                  const updateClassData = (shift: keyof Ef02ClassDistribution, value: number) => {
                    const classesByYear = {
                      ...(formData.ef_02_classesByYear || {}),
                      [year]: { ...classData, [shift]: Math.max(0, value) },
                    } as NonNullable<SurveyFormData['ef_02_classesByYear']>;
                    const summary = (['1', '2', '3', '4', '5', 'EJA'] as const)
                      .map((item) => {
                        const row = classesByYear[item] || { manha: 0, tarde: 0, integral: 0 };
                        return item === 'EJA'
                          ? `EJA - Noturno: ${row.manha} manhã, ${row.tarde} tarde, ${row.integral} integral`
                          : `${item}º ano: ${row.manha} manhã, ${row.tarde} tarde, ${row.integral} integral`;
                      })
                      .join(' | ');
                    onChange({ ef_02_classesByYear: classesByYear, ef_02_classesBreakdown: summary });
                  };

                  return (
                    <div key={year} className="grid grid-cols-[1.2fr_repeat(3,1fr)] border-t border-slate-200 items-center">
                      <span className="p-3 text-sm font-bold text-slate-800">{year === 'EJA' ? 'EJA - NOTURNO' : `${year}º ANO`}</span>
                      {(['manha', 'tarde', 'integral'] as const).map((shift) => (
                        <div key={shift} className="p-2">
                          <input
                            type="number"
                            min={0}
                            value={classData[shift]}
                            onChange={(e) => updateClassData(shift, parseInt(e.target.value, 10) || 0)}
                            onFocus={(e) => e.target.select()}
                            className="w-full py-2 text-center rounded-lg border border-slate-300 font-bold text-slate-900 bg-white"
                          />
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {step.id === 'EF_03' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700 block mb-1">Manhã</span>
              <input
                type="number"
                min={0}
                value={formData.ef_03_enrolledMorning !== undefined ? formData.ef_03_enrolledMorning : ''}
                onChange={(e) =>
                  onChange({ ef_03_enrolledMorning: e.target.value === '' ? undefined : parseInt(e.target.value, 10) || 0 })
                }
                onFocus={(e) => e.target.select()}
                placeholder="0"
                className="w-full py-2 text-center rounded-lg border font-bold text-slate-900 bg-white"
              />
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-700 block mb-1">Tarde</span>
              <input
                type="number"
                min={0}
                value={formData.ef_03_enrolledAfternoon !== undefined ? formData.ef_03_enrolledAfternoon : ''}
                onChange={(e) =>
                  onChange({ ef_03_enrolledAfternoon: e.target.value === '' ? undefined : parseInt(e.target.value, 10) || 0 })
                }
                onFocus={(e) => e.target.select()}
                placeholder="0"
                className="w-full py-2 text-center rounded-lg border font-bold text-slate-900 bg-white"
              />
            </div>
            <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-200">
              <span className="text-xs font-bold text-blue-900 block mb-1">Integral</span>
              <input
                type="number"
                min={0}
                value={formData.ef_03_enrolledIntegral !== undefined ? formData.ef_03_enrolledIntegral : ''}
                onChange={(e) =>
                  onChange({ ef_03_enrolledIntegral: e.target.value === '' ? undefined : parseInt(e.target.value, 10) || 0 })
                }
                onFocus={(e) => e.target.select()}
                placeholder="0"
                className="w-full py-2 text-center rounded-lg border font-bold text-blue-700 bg-white"
              />
            </div>
          </div>
        )}

        {step.id === 'EF_04' && (
          <div className="space-y-4">
            {formData.sphere === 'AMBOS' ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 space-y-3">
                <div className="flex items-start gap-2.5">
                  <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Classificação Territorial Integrada (Replicada de EI-19)
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Como a unidade escolar atende tanto a Educação Infantil quanto o Ensino Fundamental I no mesmo endereço e território, a classificação geográfica informada na etapa <strong>EI-19</strong> (<strong>{formData.ei_19_territoryType || 'Urbano'}</strong>) foi registrada e replicada automaticamente para o Fundamental I.
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                    Classificação: {formData.ef_04_territoryType || formData.ei_19_territoryType || 'Urbano'} (Replicado)
                  </span>
                  <button
                    type="button"
                    onClick={onNext}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                  >
                    <span>Avançar para EF-05</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {['Urbano', 'Rural', 'Periurbano', 'Misto'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => onChange({ ef_04_territoryType: t })}
                    className={`p-3 rounded-xl border text-center text-xs font-bold transition ${
                      formData.ef_04_territoryType === t
                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step.id === 'EF_05' && (
          <div className="space-y-4">
            {formData.sphere === 'AMBOS' ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 space-y-3">
                <div className="flex items-start gap-2.5">
                  <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                      Condições Socioeconômicas Integradas (Replicada de EI-20)
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Como os alunos da Educação Infantil e dos Anos Iniciais participam da mesma comunidade e território escolar, a avaliação das condições socioeconômicas informada em <strong>EI-20</strong> (<strong>{formData.ei_20_socioeconomicProfile || 'Mistas'}</strong>) foi replicada automaticamente para o relatório do Fundamental I.
                    </p>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                    Perfil: {formData.ef_05_socioeconomicProfile || formData.ei_20_socioeconomicProfile || 'Mistas'} (Replicado)
                  </span>
                  <button
                    type="button"
                    onClick={onNext}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                  >
                    <span>Avançar para EF-06</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {['Favoráveis', 'Mistas', 'Vulneráveis', 'Não sabe'].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => onChange({ ef_05_socioeconomicProfile: p })}
                    className={`p-3 rounded-xl border text-center text-xs font-bold transition ${
                      formData.ef_05_socioeconomicProfile === p
                        ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500/20'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {step.id === 'EF_06' && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {['Até 25%', '26 a 50%', '51 a 75%', 'Acima de 75%', 'Não sabe'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange({ ef_06_ppiProportion: opt })}
                className={`p-3 rounded-xl border text-center text-xs font-bold transition ${
                  formData.ef_06_ppiProportion === opt
                    ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {step.id === 'EF_07' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              'Acompanhamento das tarefas em casa',
              'Conciliação com rotina familiar',
              'Dificuldades socioeconômicas',
              'Transporte e locomoção',
              'Acesso a internet e recursos digitais',
            ].map((d) => {
              const isChecked = (formData.ef_07_retentionDifficulties || []).includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleArrayItem('ef_07_retentionDifficulties', d, 3)}
                  className={`p-3 rounded-xl border text-left text-xs transition flex items-center gap-2.5 ${
                    isChecked
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                      isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3" />}
                  </div>
                  <span>{d}</span>
                </button>
              );
            })}
          </div>
        )}

        {step.id === 'EF_08' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {['Sim, frequência', 'Ocasionalmente', 'Não', 'Não sabe'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange({ ef_08_shiftChangeRequests: opt })}
                className={`p-3 rounded-xl border text-center text-xs font-bold transition ${
                  formData.ef_08_shiftChangeRequests === opt
                    ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {step.id === 'EF_09' && (
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Quantidade estimada aguardando troca e principais motivos:
            </label>
            <textarea
              rows={3}
              value={formData.ef_09_shiftChangeWaitingCountAndReasons || ''}
              onChange={(e) => onChange({ ef_09_shiftChangeWaitingCountAndReasons: e.target.value })}
              placeholder="Ex: Cerca de 20 estudantes; motivos de trabalho dos responsáveis e preferência pela jornada integral."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-900 text-xs bg-white focus:outline-none"
            />
          </div>
        )}

        {step.id === 'EF_10' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-800 block mb-1">Transferências RECEBIDAS</span>
              <input
                type="number"
                min={0}
                value={formData.ef_10_transfersReceived !== undefined ? formData.ef_10_transfersReceived : ''}
                onChange={(e) =>
                  onChange({ ef_10_transfersReceived: e.target.value === '' ? undefined : parseInt(e.target.value, 10) || 0 })
                }
                onFocus={(e) => e.target.select()}
                placeholder="0"
                className="w-full py-2 text-center rounded-lg border font-bold text-slate-900 bg-white"
              />
            </div>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-xs font-bold text-slate-800 block mb-1">Transferências EXPEDIDAS</span>
              <input
                type="number"
                min={0}
                value={formData.ef_10_transfersIssued !== undefined ? formData.ef_10_transfersIssued : ''}
                onChange={(e) =>
                  onChange({ ef_10_transfersIssued: e.target.value === '' ? undefined : parseInt(e.target.value, 10) || 0 })
                }
                onFocus={(e) => e.target.select()}
                placeholder="0"
                className="w-full py-2 text-center rounded-lg border font-bold text-slate-900 bg-white"
              />
            </div>
          </div>
        )}

        {step.id === 'EF_11' && (
          <div className="space-y-4">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Número de estudantes que abandonaram a escola no último ano letivo concluído:
            </label>
            <input
              type="number"
              min={0}
              value={formData.ef_11_dropoutCount !== undefined ? formData.ef_11_dropoutCount : ''}
              onChange={(e) =>
                onChange({ ef_11_dropoutCount: e.target.value === '' ? undefined : parseInt(e.target.value, 10) || 0 })
              }
              onFocus={(e) => e.target.select()}
              placeholder="0"
              className="w-full max-w-xs px-4 py-3 rounded-xl border border-slate-200 text-slate-900 text-lg font-bold bg-white text-center"
            />
          </div>
        )}

        {step.id === 'EF_13' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              'Não houve abandonos / Nenhum caso registrado',
              'Mudança de endereço/município',
              'Dificuldades de transporte',
              'Vulnerabilidade familiar e social',
              'Desmotivação e infrequência crônica',
              'Trabalho infantil / cuidados domésticos',
              'Outro motivo',
            ].map((m) => {
              const isChecked = (formData.ef_13_dropoutReasons || []).includes(m);
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => toggleArrayItem('ef_13_dropoutReasons', m, 3)}
                  className={`p-3 rounded-xl border text-left text-xs transition flex items-center gap-2.5 ${
                    isChecked
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                      isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3" />}
                  </div>
                  <span>{m}</span>
                </button>
              );
            })}
          </div>
        )}

        {step.id === 'EF_14' && (
          <div className="grid grid-cols-3 gap-2.5">
            {['Sistematicamente', 'Pontualmente', 'Periódicamente', 'Não'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange({ ef_14_activeSearchStrategy: opt })}
                className={`p-3 rounded-xl border text-center text-xs font-bold transition ${
                  formData.ef_14_activeSearchStrategy === opt
                    ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {step.id === 'EF_15' && (
          <div className="grid grid-cols-3 gap-2.5">
            {['Sim, formalizado', 'Em implantação', 'Não'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange({ ef_15_individualizedTracking: opt })}
                className={`p-3 rounded-xl border text-center text-xs font-bold transition ${
                  formData.ef_15_individualizedTracking === opt
                    ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {step.id === 'EF_16' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {['Sim, plenamente', 'Parcialmente', 'Não', 'Não sabe'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange({ ef_16_infraAdequacy: opt })}
                className={`p-3 rounded-xl border text-center text-xs font-bold transition ${
                  formData.ef_16_infraAdequacy === opt
                    ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {step.id === 'EF_17' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {[
              'Sala de Leitura',
              'Cantinho da Leitura',
              'Informática',
              'Playground',
              'Pátio',
              'Quadra sem cobertura',
              'Quadra Coberta',
              'Refeitório',
              'AEE',
              'Acessibilidade',
            ].map((sp) => {
              const isChecked = (formData.ef_17_availableSpaces || []).includes(sp);
              return (
                <button
                  key={sp}
                  type="button"
                  onClick={() => toggleArrayItem('ef_17_availableSpaces', sp)}
                  className={`p-3 rounded-xl border text-left text-xs transition flex items-center gap-2.5 ${
                    isChecked
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                      isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3" />}
                  </div>
                  <span>{sp}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* ================= EF-18 ================= */}
        {step.id === 'EF_18' && (() => {
          const staffRoles = [
            {
              key: 'professores' as const,
              label: 'Professores',
              subtitle: 'Docência e Regência de Classe',
              icon: GraduationCap,
            },
            {
              key: 'professores_especialistas' as const,
              label: 'Professores Especialistas',
              subtitle: 'Artes e Ed. Física Escolar',
              icon: Sparkles,
            },
            {
              key: 'asgs' as const,
              label: "ASG's",
              subtitle: 'Auxiliares de Serviços Gerais',
              icon: ShieldCheck,
            },
            {
              key: 'adis' as const,
              label: "ADI's",
              subtitle: 'Auxiliares de Desenvolvimento Infantil',
              icon: HeartHandshake,
            },
            {
              key: 'aoe' as const,
              label: 'AOE',
              subtitle: 'Agentes de Organização Escolar',
              icon: ClipboardList,
            },
            {
              key: 'estagiarios' as const,
              label: 'Estagiários(as)',
              subtitle: 'Apoio e Inclusão Escolar',
              icon: Award,
            },
            {
              key: 'milclean' as const,
              label: 'Milclean',
              subtitle: 'Equipe Terceirizada de Limpeza e Apoio',
              icon: Users,
            },
          ];

          const currentStaff: Ei18StaffData = formData.sphere === 'AMBOS'
            ? (formData['EI-18'] || formData.ei_18_staffData || {
              professores: { atual: 0, necessidade: 0 },
              professores_especialistas: { atual: 0, necessidade: 0 },
              asgs: { atual: 0, necessidade: 0 },
              adis: { atual: 0, necessidade: 0 },
              aoe: { atual: 0, necessidade: 0 },
              estagiarios: { atual: 0, necessidade: 0 },
              milclean: { atual: 0, necessidade: 0 },
            })
            : (formData['EF-18'] || formData.ef_18_staffData || {
            professores: { atual: 0, necessidade: 0 },
            professores_especialistas: { atual: 0, necessidade: 0 },
            asgs: { atual: 0, necessidade: 0 },
            adis: { atual: 0, necessidade: 0 },
            aoe: { atual: 0, necessidade: 0 },
            estagiarios: { atual: 0, necessidade: 0 },
            milclean: { atual: 0, necessidade: 0 },
            });

          const handleStaffChange = (roleKey: keyof Ei18StaffData, field: 'atual' | 'necessidade', value: number) => {
            const updatedStaff: Ei18StaffData = {
              professores: { ...(currentStaff.professores || { atual: 0, necessidade: 0 }) },
              professores_especialistas: { ...(currentStaff.professores_especialistas || { atual: 0, necessidade: 0 }) },
              asgs: { ...(currentStaff.asgs || { atual: 0, necessidade: 0 }) },
              adis: { ...(currentStaff.adis || { atual: 0, necessidade: 0 }) },
              aoe: { ...(currentStaff.aoe || { atual: 0, necessidade: 0 }) },
              estagiarios: { ...(currentStaff.estagiarios || { atual: 0, necessidade: 0 }) },
              milclean: { ...(currentStaff.milclean || { atual: 0, necessidade: 0 }) },
            };

            updatedStaff[roleKey] = {
              ...updatedStaff[roleKey],
              [field]: Math.max(0, value),
            };

            const summaryLines = [
              `Professores: ${updatedStaff.professores.atual} atuais (+${updatedStaff.professores.necessidade} necessários)`,
              `Especialistas: ${updatedStaff.professores_especialistas.atual} atuais (+${updatedStaff.professores_especialistas.necessidade} necessários)`,
              `ASGs: ${updatedStaff.asgs.atual} atuais (+${updatedStaff.asgs.necessidade} necessários)`,
              `ADIs: ${updatedStaff.adis.atual} atuais (+${updatedStaff.adis.necessidade} necessários)`,
              `AOE: ${updatedStaff.aoe.atual} atuais (+${updatedStaff.aoe.necessidade} necessários)`,
              `Estagiários: ${updatedStaff.estagiarios.atual} atuais (+${updatedStaff.estagiarios.necessidade} necessários)`,
              `Milclean: ${updatedStaff.milclean.atual} atuais (+${updatedStaff.milclean.necessidade} necessários)`,
            ].join(' | ');

            if (formData.sphere === 'AMBOS') {
              onChange({
                'EF-18': updatedStaff,
                ef_18_staffData: updatedStaff,
                ef_18_staffBreakdown: summaryLines,
                'EI-18': updatedStaff,
                ei_18_staffData: updatedStaff,
                ei_18_staffBreakdown: summaryLines,
              });
            } else {
              onChange({
                'EF-18': updatedStaff,
                ef_18_staffData: updatedStaff,
                ef_18_staffBreakdown: summaryLines,
              });
            }
          };

          const totalAtual = Object.values(currentStaff).reduce((acc, item) => acc + (item?.atual || 0), 0);
          const totalNecessidade = Object.values(currentStaff).reduce((acc, item) => acc + (item?.necessidade || 0), 0);

          if (formData.sphere === 'AMBOS') {
            return (
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 space-y-3">
                  <div className="flex items-start gap-2.5">
                    <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                        Quadro de Profissionais Unificado (Integrado de EI-18)
                      </h4>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        Como a unidade escolar é a mesma, o quantitativo geral de profissionais e dimensionamento registrado no item <strong>EI-18</strong> foi integrado e replicado automaticamente para o relatório do Ensino Fundamental I.
                      </p>
                    </div>
                  </div>

                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Resumo do Quadro Registrado na Unidade:
                      </span>
                      <span className="font-extrabold text-blue-700">
                        {totalAtual} em exercício • +{totalNecessidade} necessários
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-700">
                      <div>Professores: <strong>{currentStaff.professores?.atual || 0} (+{currentStaff.professores?.necessidade || 0})</strong></div>
                      <div>Especialistas: <strong>{currentStaff.professores_especialistas?.atual || 0} (+{currentStaff.professores_especialistas?.necessidade || 0})</strong></div>
                      <div>ASG's: <strong>{currentStaff.asgs?.atual || 0} (+{currentStaff.asgs?.necessidade || 0})</strong></div>
                      <div>ADI's: <strong>{currentStaff.adis?.atual || 0} (+{currentStaff.adis?.necessidade || 0})</strong></div>
                      <div>AOE: <strong>{currentStaff.aoe?.atual || 0} (+{currentStaff.aoe?.necessidade || 0})</strong></div>
                      <div>Estagiários: <strong>{currentStaff.estagiarios?.atual || 0} (+{currentStaff.estagiarios?.necessidade || 0})</strong></div>
                      <div>Milclean: <strong>{currentStaff.milclean?.atual || 0} (+{currentStaff.milclean?.necessidade || 0})</strong></div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                      Status: Integrado com sucesso no relatório oficial
                    </span>
                    <button
                      type="button"
                      onClick={onNext}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                    >
                      <span>Avançar para EF-20</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          }

          return (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3.5">
                {staffRoles.map((role) => {
                  const Icon = role.icon;
                  const itemData = currentStaff[role.key] || { atual: 0, necessidade: 0 };
                  return (
                    <div
                      key={role.key}
                      className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-2xs hover:border-slate-300 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200/60">
                            <Icon className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{role.label}</h4>
                            <p className="text-[11px] text-slate-500">{role.subtitle}</p>
                          </div>
                        </div>

                        {(itemData.atual > 0 || itemData.necessidade > 0) && (
                          <div className="flex items-center gap-1.5 self-start sm:self-auto text-[10px] font-bold">
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                              Atual: {itemData.atual}
                            </span>
                            {itemData.necessidade > 0 && (
                              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200">
                                +{itemData.necessidade} necessários
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                        {/* Card Esquerdo: Quantidade Atual */}
                        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                          <div>
                            <label className="block text-xs font-bold text-slate-700">
                              Quantidade Atual
                            </label>
                            <span className="text-[10px] text-slate-500">Em exercício hoje</span>
                          </div>
                          <input
                            type="number"
                            min={0}
                            value={itemData.atual !== undefined ? itemData.atual : ''}
                            onChange={(e) =>
                              handleStaffChange(
                                role.key,
                                'atual',
                                e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0
                              )
                            }
                            onFocus={(e) => e.target.select()}
                            placeholder="0"
                            className="w-20 py-2 text-center rounded-lg border border-slate-300 font-extrabold text-base text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                          />
                        </div>

                        {/* Card Direito: Quantos funcionários necessitaria? */}
                        <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200/80 flex items-center justify-between gap-3">
                          <div>
                            <label className="block text-xs font-bold text-amber-950">
                              Quantos funcionários necessitaria?
                            </label>
                            <span className="text-[10px] text-amber-800">Necessidade adicional</span>
                          </div>
                          <input
                            type="number"
                            min={0}
                            value={itemData.necessidade !== undefined ? itemData.necessidade : ''}
                            onChange={(e) =>
                              handleStaffChange(
                                role.key,
                                'necessidade',
                                e.target.value === '' ? 0 : parseInt(e.target.value, 10) || 0
                              )
                            }
                            onFocus={(e) => e.target.select()}
                            placeholder="0"
                            className="w-20 py-2 text-center rounded-lg border border-amber-300 font-extrabold text-base text-amber-900 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Barra Consolidada de Totais */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Total do Quadro Atual</span>
                    <span className="text-lg font-extrabold text-white">{totalAtual} profissionais</span>
                  </div>
                  <div className="border-l border-slate-700 pl-6">
                    <span className="text-[10px] uppercase font-bold text-amber-400 block">Total Necessidade Adicional</span>
                    <span className="text-lg font-extrabold text-amber-300">+{totalNecessidade} profissionais</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-slate-300 bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-700 hidden sm:inline-block">
                  Dimensionamento EF-18
                </span>
              </div>
            </div>
          );
        })()}

        {step.id === 'EF_20' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {['Sistemática', 'Pontual', 'Não', 'Não sabe'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange({ ef_20_territoryArticulation: opt })}
                className={`p-3 rounded-xl border text-center text-xs font-bold transition ${
                  formData.ef_20_territoryArticulation === opt
                    ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {step.id === 'EF_21' && (
          <div className="grid grid-cols-3 gap-2.5">
            {['Sim', 'Não', 'Não aplicável'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange({ ef_21_participatesSaeb: opt })}
                className={`p-3 rounded-xl border text-center text-xs font-bold transition ${
                  formData.ef_21_participatesSaeb === opt
                    ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {step.id === 'EF_21_IDEB' && formData.ef_21_participatesSaeb === 'Sim' && (
          <div className="grid grid-cols-2 gap-2.5">
            {['SIM', 'NÃO'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange({ ef_21_idebIndexGenerated: opt })}
                className={`p-3 rounded-xl border text-center text-xs font-bold transition ${
                  formData.ef_21_idebIndexGenerated === opt
                    ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {step.id === 'EF_22' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {['Melhora consistente', 'Estável', 'Retração', 'Sem dados'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange({ ef_22_performanceEvolution: opt })}
                className={`p-3 rounded-xl border text-center text-xs font-bold transition ${
                  formData.ef_22_performanceEvolution === opt
                    ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {step.id === 'EF_23' && (
          <div className="grid grid-cols-3 gap-2.5">
            {['SIM', 'Não'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange({ ef_23_learningSupport: opt })}
                className={`p-3 rounded-xl border text-center text-xs font-bold transition ${
                  formData.ef_23_learningSupport === opt
                    ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {step.id === 'EF_25' && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {['Muito boa', 'Boa', 'Regular', 'Ruim', 'Muito ruim'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange({ ef_25_familyRelationship: opt })}
                className={`p-3 rounded-xl border text-center text-xs font-bold transition ${
                  formData.ef_25_familyRelationship === opt
                    ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {step.id === 'EF_26' && (
          <div className="grid grid-cols-3 gap-2.5">
            {['Sim', 'Parcialmente', 'Não'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange({ ef_26_considersTerritoryPlanning: opt })}
                className={`p-3 rounded-xl border text-center text-xs font-bold transition ${
                  formData.ef_26_considersTerritoryPlanning === opt
                    ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {step.id === 'EF_27' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {[
              'Educação Integral ampliada',
              'Recuperação e reforço em Matemática',
              'Recursos tecnológicos',
              'Formação e apoio pedagógico',
              'Melhorias de infraestrutura predial',
            ].map((asp) => {
              const isChecked = (formData.ef_27_focusAspects || []).includes(asp);
              return (
                <button
                  key={asp}
                  type="button"
                  onClick={() => toggleArrayItem('ef_27_focusAspects', asp, 3)}
                  className={`p-3 rounded-xl border text-left text-xs transition flex items-center gap-2.5 ${
                    isChecked
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                      : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                      isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                    }`}
                  >
                    {isChecked && <Check className="w-3 h-3" />}
                  </div>
                  <span>{asp}</span>
                </button>
              );
            })}
          </div>
        )}

        {step.id === 'EF_28' && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {['Excelente', 'Boa', 'Regular', 'Crítico'].map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => onChange({ ef_28_overallQuality: opt })}
                className={`p-3 rounded-xl border text-center text-xs font-bold transition ${
                  formData.ef_28_overallQuality === opt
                    ? 'border-blue-600 bg-blue-50 text-blue-900 ring-1 ring-blue-500/20'
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Jump Input Form */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleQuickJump} className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-44">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={quickJumpCode}
              onChange={(e) => setQuickJumpCode(e.target.value)}
              placeholder="Ir p/ ex: EF-10, EI-03..."
              className="w-full pl-8 pr-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-mono bg-slate-50 focus:bg-white focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition"
          >
            Ir
          </button>
          {jumpError && <span className="text-[10px] text-rose-500 font-bold">{jumpError}</span>}
        </form>

        {/* Navigation Action Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {stepIndex > 0 && (
            <button
              type="button"
              onClick={onPrev}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition"
            >
              Voltar
            </button>
          )}

          {/* Pular Questão Button (Mantém pendente) */}
          <button
            type="button"
            onClick={onSkip}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition"
            title="Pular questão mantendo como pendente"
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>Pular</span>
          </button>

          {/* Registrar e Avançar */}
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
          >
            <span>{stepIndex === totalSteps - 2 ? 'Relatório Final' : 'Avançar'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
