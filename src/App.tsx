import React, { useState, useEffect, useMemo } from 'react';
import { SurveyFormData, EducationSphere, OfficialSchoolUnit, RespondentRole } from './types/questionnaire';
import {
  INITIAL_FORM_DATA,
  getApplicableSteps,
  generateProtocol,
  isStepAnswered,
} from './data/steps';
import { Header } from './components/Header';
import { QuestionCard } from './components/QuestionCard';
import { ReviewSummary } from './components/ReviewSummary';
import { ProtocolCertificate } from './components/ProtocolCertificate';
import { AiSynthesisModal } from './components/AiSynthesisModal';
import { HelpModal } from './components/HelpModal';
import { QuestionsPanelModal } from './components/QuestionsPanelModal';
import { AuthLoginScreen } from './components/AuthLoginScreen';
import { AdminDashboardModal } from './components/AdminDashboardModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import {
  saveSchoolSubmission,
} from './utils/submissionRegistry';
import { clearSchoolSession, submitSurveyToSupabase } from './utils/supabaseClient';
import { motion, AnimatePresence } from 'motion/react';
import {
  GraduationCap,
  Building2,
  Check,
  Sparkles,
  HelpCircle,
  FolderDown,
  Layers,
  ChevronRight,
  Clock,
  CheckCircle2,
  Activity,
  MapPin,
  School,
  FileCheck,
  ListFilter,
  FastForward,
  UserCheck,
  Search,
  LogOut,
} from 'lucide-react';

const LEGACY_SURVEY_STORAGE_KEYS = [
  'pinda_diagnostico_active_survey_v3',
  'pinda_diagnostico_saved_surveys_v3',
];

function createFreshSurvey(): SurveyFormData {
  return {
    ...structuredClone(INITIAL_FORM_DATA),
    id: 'pinda_srv_' + Date.now(),
    protocolNumber: generateProtocol(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export default function App() {
  // Every browser load starts unauthenticated with a clean questionnaire.
  const [formData, setFormData] = useState<SurveyFormData>(createFreshSurvey);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMasterAccess, setIsMasterAccess] = useState(false);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // UI Modals & Drawers
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  // Dynamic Applicable Steps based on selected sphere (EI, EF, AMBOS)
  const applicableSteps = useMemo(() => {
    return getApplicableSteps(formData.sphere);
  }, [formData.sphere]);

  // Keep step index within valid bounds
  useEffect(() => {
    if (currentStepIndex >= applicableSteps.length) {
      setCurrentStepIndex(Math.max(0, applicableSteps.length - 1));
    }
  }, [applicableSteps.length, currentStepIndex]);

  // Remove obsolete global caches that could expose one school's answers to another login.
  useEffect(() => {
    try {
      LEGACY_SURVEY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    } catch (e) {
      console.warn('Não foi possível limpar os caches legados do questionário.', e);
    }
  }, []);

  const updateFormData = (updated: Partial<SurveyFormData>) => {
    setFormData((prev) => {
      const merged = {
        ...prev,
        ...updated,
        updatedAt: new Date().toISOString(),
      };

      // Automatic replication for combined units (EI + EF I)
      if (merged.sphere === 'AMBOS') {
        if (updated.ei_19_territoryType && !updated.ef_04_territoryType) {
          merged.ef_04_territoryType = updated.ei_19_territoryType;
        } else if (!merged.ef_04_territoryType && merged.ei_19_territoryType) {
          merged.ef_04_territoryType = merged.ei_19_territoryType;
        }

        if (updated.ei_20_socioeconomicProfile && !updated.ef_05_socioeconomicProfile) {
          merged.ef_05_socioeconomicProfile = updated.ei_20_socioeconomicProfile;
        } else if (!merged.ef_05_socioeconomicProfile && merged.ei_20_socioeconomicProfile) {
          merged.ef_05_socioeconomicProfile = merged.ei_20_socioeconomicProfile;
        }

        if (updated.ei_18_staffBreakdown && !updated.ef_18_staffBreakdown) {
          merged.ef_18_staffBreakdown = updated.ei_18_staffBreakdown;
        } else if (!merged.ef_18_staffBreakdown && merged.ei_18_staffBreakdown) {
          merged.ef_18_staffBreakdown = merged.ei_18_staffBreakdown;
        }
      }

      return merged;
    });
  };

  const handleLoginSuccess = (payload: {
    unit: OfficialSchoolUnit;
    role: RespondentRole;
    respondentName: string;
    respondentEmail: string;
    respondentPhone: string;
    startTime: string;
    startTimestamp: number;
    isMasterAccess?: boolean;
  }) => {
    // A successful login always receives a clean questionnaire for its own unit.
    const updatedData: SurveyFormData = {
      ...createFreshSurvey(),
      updatedAt: new Date().toISOString(),
      schoolId: payload.unit.id,
      schoolLogin: payload.unit.login,
      schoolName: payload.unit.name,
      schoolSector: payload.unit.sector,
      neighborhoodCoverage: payload.unit.neighborhood || '',
      sphere: payload.unit.offer,
      directorName: payload.respondentName,
      directorEmail: payload.respondentEmail,
      directorPhone: payload.respondentPhone,
      respondentRole: payload.role,
      startTime: payload.startTime,
      startTimestamp: payload.startTimestamp,
      status: 'DRAFT',
    };

    setFormData(updatedData);
    setIsAuthenticated(true);
    setIsMasterAccess(Boolean(payload.isMasterAccess));
    setCurrentStepIndex(0);
  };

  const handleLogout = () => {
    clearSchoolSession();
    setIsAuthenticated(false);
    setIsMasterAccess(false);
    setIsPasswordModalOpen(false);
    handleNewSurvey();
  };

  const handleNext = () => {
    if (currentStepIndex < applicableSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSkip = () => {
    // Find next unanswered step after current
    const nextPendingIdx = applicableSteps.findIndex(
      (s, idx) => idx > currentStepIndex && !isStepAnswered(s.id, formData)
    );

    if (nextPendingIdx !== -1) {
      setCurrentStepIndex(nextPendingIdx);
    } else if (currentStepIndex < applicableSteps.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
    } else {
      // If reached the end, check from beginning
      const firstPendingIdx = applicableSteps.findIndex(
        (s) => !isStepAnswered(s.id, formData)
      );
      if (firstPendingIdx !== -1) {
        setCurrentStepIndex(firstPendingIdx);
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleJumpToStep = (stepId: string) => {
    const idx = applicableSteps.findIndex((s) => s.id === stepId);
    if (idx !== -1) {
      setCurrentStepIndex(idx);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleFinalSubmit = async (signatureName: string): Promise<{ success: boolean; error?: string }> => {
    const unansweredSteps = applicableSteps.filter(
      (step) => step.id !== 'CONCLUSAO_RESUMO' && !isStepAnswered(step.id, formData)
    );
    if (unansweredSteps.length > 0) {
      return {
        success: false,
        error: `Ainda existem ${unansweredSteps.length} questão(ões) pendente(s). Complete todas as respostas antes do envio definitivo.`,
      };
    }

    const now = new Date();
    const submissionEndTime = now.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const submissionEndTimestamp = now.getTime();
    const totalSecs = Math.max(
      1,
      Math.round((submissionEndTimestamp - (formData.startTimestamp || (submissionEndTimestamp - 15 * 60 * 1000))) / 1000)
    );
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    const finalElapsedFormatted = `${m} min ${s.toString().padStart(2, '0')} seg`;

    const finalSphere = formData.sphere;
    const finalEf04 = finalSphere === 'AMBOS' ? (formData.ef_04_territoryType || formData.ei_19_territoryType || 'Urbano') : formData.ef_04_territoryType;
    const finalEf05 = finalSphere === 'AMBOS' ? (formData.ef_05_socioeconomicProfile || formData.ei_20_socioeconomicProfile || 'Mistas') : formData.ef_05_socioeconomicProfile;
    const finalEf18 = finalSphere === 'AMBOS' ? (formData.ef_18_staffBreakdown || formData.ei_18_staffBreakdown || '') : formData.ef_18_staffBreakdown;

    const confirmedData: SurveyFormData = {
      ...formData,
      directorName: signatureName.trim(),
      ef_04_territoryType: finalEf04,
      ef_05_socioeconomicProfile: finalEf05,
      ef_18_staffBreakdown: finalEf18,
      status: 'CONFIRMED',
      endTime: submissionEndTime,
      endTimestamp: submissionEndTimestamp,
      elapsedSeconds: totalSecs,
      elapsedTimeFormatted: finalElapsedFormatted,
      updatedAt: now.toISOString(),
    };

    const submissionResult = await submitSurveyToSupabase({
      formData: confirmedData,
      startTime: confirmedData.startTime || '08:00:00',
      endTime: submissionEndTime,
      elapsedSeconds: totalSecs,
      elapsedTimeFormatted: finalElapsedFormatted,
    });
    if (!submissionResult.success) {
      return { success: false, error: submissionResult.error || 'Não foi possível enviar o relatório ao Supabase Storage.' };
    }

    updateFormData(confirmedData);

    // Save official record into submissions registry & Supabase
    saveSchoolSubmission({
      id: confirmedData.id || 'pinda_sub_' + Date.now(),
      schoolId: confirmedData.schoolId || '01',
      schoolName: confirmedData.schoolName || 'Escola Municipal',
      sector: confirmedData.schoolSector || 'Setor 1',
      offer: confirmedData.sphere,
      status: 'CONCLUÍDO',
      respondentName: confirmedData.directorName || 'Respondente',
      respondentRole: confirmedData.respondentRole || 'DIRETOR',
      respondentEmail: confirmedData.directorEmail || '',
      respondentPhone: confirmedData.directorPhone || '',
      startTime: confirmedData.startTime || '08:00:00',
      startTimestamp: confirmedData.startTimestamp || (submissionEndTimestamp - totalSecs * 1000),
      endTime: submissionEndTime,
      endTimestamp: submissionEndTimestamp,
      elapsedSeconds: totalSecs,
      elapsedTimeFormatted: finalElapsedFormatted,
      submissionDate: now.toLocaleDateString('pt-BR') + ' ' + submissionEndTime,
      protocolNumber: confirmedData.protocolNumber,
      formData: confirmedData,
    });

    return { success: true };
  };

  const handleNewSurvey = () => {
    clearSchoolSession();
    setFormData(createFreshSurvey());
    setIsAuthenticated(false);
    setIsMasterAccess(false);
    setIsPasswordModalOpen(false);
    setCurrentStepIndex(0);
  };

  const currentStep = applicableSteps[currentStepIndex] || applicableSteps[0];
  const isConclusionStep = currentStep?.id === 'CONCLUSAO_RESUMO';
  const isConfirmed = formData.status === 'CONFIRMED' && isConclusionStep;

  // Calculate stats - hook placed unconditionally at top level
  const answeredStepsCount = useMemo(() => {
    return applicableSteps.filter((s) => isStepAnswered(s.id, formData)).length;
  }, [applicableSteps, formData]);

  const pendingStepsCount = Math.max(0, applicableSteps.length - answeredStepsCount);

  const progressPercent = Math.round(
    ((answeredStepsCount) / (applicableSteps.length || 1)) * 100
  );

  // If user is not authenticated and haven't confirmed yet, show Tela 0 (AuthLoginScreen)
  if (!isAuthenticated && formData.status !== 'CONFIRMED') {
    return (
      <>
        <AuthLoginScreen
          onLoginSuccess={handleLoginSuccess}
          onOpenAdmin={() => setIsAdminModalOpen(true)}
          onOpenHelp={() => setIsHelpModalOpen(true)}
        />

        <AdminDashboardModal
          isOpen={isAdminModalOpen}
          onClose={() => setIsAdminModalOpen(false)}
        />

        <HelpModal
          isOpen={isHelpModalOpen}
          onClose={() => setIsHelpModalOpen(false)}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-[#1e293b] flex flex-col font-sans antialiased">
      {/* Bento Top Header */}
      <Header
        currentStepIndex={currentStepIndex}
        totalSteps={applicableSteps.length}
        currentBlockLabel={currentStep?.blockLabel || 'Diagnóstico Municipal'}
        sphere={formData.sphere}
        schoolSector={formData.schoolSector}
        schoolName={formData.schoolName}
        neighborhoodCoverage={formData.neighborhoodCoverage}
        directorName={formData.directorName}
        respondentRole={formData.respondentRole}
        protocolNumber={formData.protocolNumber}
        onReset={handleNewSurvey}
        onOpenAiHelper={() => setIsAiModalOpen(true)}
        onOpenHelpModal={() => setIsHelpModalOpen(true)}
        onOpenPanel={() => setIsPanelOpen(true)}
        onOpenAdmin={() => setIsAdminModalOpen(true)}
        onOpenChangePassword={!isMasterAccess ? () => setIsPasswordModalOpen(true) : undefined}
      />

      <ChangePasswordModal
        isOpen={isPasswordModalOpen}
        schoolId={formData.schoolId || ''}
        schoolLogin={formData.schoolLogin || ''}
        schoolName={formData.schoolName || 'Unidade Escolar'}
        onClose={() => setIsPasswordModalOpen(false)}
      />

      {/* Bento Main Layout: Sidebar + Content Grid */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        {/* Left Bento Sidebar Navigation */}
        <aside className="w-full lg:w-72 shrink-0 flex flex-col gap-4">
          <div className="bento-card p-5 bg-white flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Navegação do Diagnóstico
                </span>
                <span className="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                  {currentStepIndex + 1}/{applicableSteps.length}
                </span>
              </div>

              {/* Quick Actions in Sidebar */}
              <div className="flex gap-2 mb-3">
                <button
                  type="button"
                  onClick={() => setIsPanelOpen(true)}
                  className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold transition flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                >
                  <ListFilter className="w-3.5 h-3.5" />
                  <span>Painel Geral</span>
                </button>

                {pendingStepsCount > 0 && (
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="py-1.5 px-2 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    title="Pular para a próxima questão pendente"
                  >
                    <FastForward className="w-3.5 h-3.5" />
                    <span>Pular</span>
                  </button>
                )}
              </div>

              {/* Step Flow List */}
              <nav className="space-y-1 max-h-[440px] overflow-y-auto pr-1">
                {applicableSteps.map((s, idx) => {
                  const isCurrent = idx === currentStepIndex;
                  const isAnswered = isStepAnswered(s.id, formData);

                  return (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => handleJumpToStep(s.id)}
                      className={`w-full text-left p-2 rounded-xl text-xs flex items-center gap-2.5 transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-[10px] font-mono font-bold ${
                          isCurrent
                            ? 'bg-white text-blue-600 shadow-2xs'
                            : isAnswered
                            ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                            : 'bg-slate-100 text-slate-500 border border-slate-200'
                        }`}
                      >
                        {isAnswered ? <Check className="w-3 h-3 text-emerald-700" /> : idx + 1}
                      </div>

                      <div className="truncate flex-1 min-w-0">
                        <span className={`block truncate text-xs ${isCurrent ? 'text-white' : 'text-slate-800'}`}>
                          <strong
                            className={`font-mono text-[10.5px] px-1 py-0.2 rounded mr-1.5 inline-block ${
                              isCurrent
                                ? 'bg-white/20 text-white'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {s.stepCode}
                          </strong>
                          <span className={isCurrent ? 'font-semibold' : 'font-medium'}>{s.title}</span>
                        </span>
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Suporte, Admin e Troca de Sessão */}
            <div className="mt-4 pt-4 border-t border-slate-100 space-y-2">
              <button
                type="button"
                onClick={() => setIsHelpModalOpen(true)}
                className="w-full py-2 px-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>Guia & Orientações</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-1.5 px-3 rounded-xl text-slate-500 font-bold text-[11px] hover:text-rose-600 hover:bg-rose-50 transition flex items-center justify-center gap-1 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Trocar Unidade / Sair</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Right Content Area: Dynamic Bento Grid */}
        <main className="flex-1 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            {isConfirmed ? (
              <motion.div
                key="certificate"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <ProtocolCertificate
                  formData={formData}
                  onNewSurvey={handleNewSurvey}
                  onOpenAiHelper={() => setIsAiModalOpen(true)}
                  onBackToEdit={() => updateFormData({ status: 'DRAFT' })}
                />
              </motion.div>
            ) : isConclusionStep ? (
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
              >
                <ReviewSummary
                  formData={formData}
                  onChange={updateFormData}
                  onJumpToStep={handleJumpToStep}
                  onFinalSubmit={handleFinalSubmit}
                  onOpenAiHelper={() => setIsAiModalOpen(true)}
                />
              </motion.div>
            ) : (
              <motion.div
                key={currentStep?.id || 'step'}
                initial={{ opacity: 0, x: 15 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -15 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                {/* 3-Column Bento Grid Container */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Primary Bento Card (Large - 8 Cols) */}
                  <div className="lg:col-span-8 flex flex-col">
                    <QuestionCard
                      step={currentStep}
                      stepIndex={currentStepIndex}
                      totalSteps={applicableSteps.length}
                      formData={formData}
                      onChange={updateFormData}
                      onNext={handleNext}
                      onPrev={handlePrev}
                      onSkip={handleSkip}
                      onJumpToStep={handleJumpToStep}
                      onOpenPanel={() => setIsPanelOpen(true)}
                    />
                  </div>

                  {/* Side Bento Cards (4 Cols) */}
                  <div className="lg:col-span-4 flex flex-col gap-6">
                    {/* Bento Card 1: Identificação da Unidade */}
                    <div className="bento-card p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            Unidade e Respondente
                          </h3>
                          <span className="text-[10px] font-mono text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded">
                            {formData.schoolSector || 'Pinda'}
                          </span>
                        </div>

                        <div className="space-y-3 text-xs">
                          <div>
                            <label className="text-slate-400 block text-[11px]">Escola</label>
                            <div className="font-bold text-slate-900 text-xs mt-0.5 truncate">
                              {formData.schoolName || 'Aguardando preenchimento (Etapa 1)'}
                            </div>
                          </div>

                          <div>
                            <label className="text-slate-400 block text-[11px]">Respondente Oficial</label>
                            <div className="font-bold text-slate-900 text-xs mt-0.5 truncate flex items-center gap-1.5">
                              <UserCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>{formData.directorName || 'Não identificado'}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              {formData.respondentRole === 'PROFESSOR_CO_RESPONSAVEL'
                                ? 'Professor(a) Co-Responsável'
                                : 'Diretor(a)'}
                            </div>
                          </div>

                          <div>
                            <label className="text-slate-400 block text-[11px]">Bairros Atendidos</label>
                            <div className="font-medium text-slate-700 text-xs mt-0.5 truncate">
                              {formData.neighborhoodCoverage || 'Pindamonhangaba - SP'}
                            </div>
                          </div>

                          {formData.startTime && (
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                              <span className="text-[11px] text-slate-400 font-medium">Início da Sessão:</span>
                              <span className="font-mono font-bold text-blue-700 text-xs bg-blue-50 px-2 py-0.5 rounded">
                                {formData.startTime}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Bento Card 2: Status do Diagnóstico & Esferas */}
                    <div className="bento-card p-5 flex flex-col justify-between">
                      <div>
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                          Status das Respostas
                        </h3>

                        <div className="space-y-2.5">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-100 text-center">
                              <div className="text-emerald-900 text-[10px] font-bold uppercase">
                                Respondidas
                              </div>
                              <div className="text-emerald-700 text-lg font-black mt-0.5">
                                {answeredStepsCount}
                              </div>
                            </div>

                            <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-100 text-center">
                              <div className="text-amber-900 text-[10px] font-bold uppercase">
                                Pendentes
                              </div>
                              <div className="text-amber-700 text-lg font-black mt-0.5">
                                {pendingStepsCount}
                              </div>
                            </div>
                          </div>

                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                            <div className="text-slate-500 text-[10px] font-bold uppercase">
                              Módulo Ativo
                            </div>
                            <div className="text-slate-800 text-xs font-bold mt-0.5 truncate">
                              {formData.sphere === 'EI'
                                ? 'Educação Infantil (28 Questões)'
                                : formData.sphere === 'EF'
                                ? 'Ensino Fundamental I (28 Questões)'
                                : 'EI + EF I (56 Questões)'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Bento Progress Card */}
                <div className="bento-card p-5 flex flex-col sm:flex-row items-center gap-6">
                  <div className="text-center sm:text-left shrink-0">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      Conclusão Total
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold text-blue-600">
                      {progressPercent}%
                    </div>
                  </div>

                  <div className="flex-1 w-full">
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                      <div
                        className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <span>Identificação</span>
                      <span>Triagem</span>
                      <span>Módulos de Diagnóstico</span>
                      <span>Homologação</span>
                    </div>
                  </div>

                  <div className="text-center sm:text-right shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsPanelOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-2xs cursor-pointer"
                    >
                      Ver Todas as Questões
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Modals & Drawers */}
      <QuestionsPanelModal
        isOpen={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        steps={applicableSteps}
        currentStepId={currentStep?.id || ''}
        formData={formData}
        onSelectStep={handleJumpToStep}
      />

      <AiSynthesisModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        formData={formData}
      />

      <HelpModal
        isOpen={isHelpModalOpen}
        onClose={() => setIsHelpModalOpen(false)}
      />

      <AdminDashboardModal
        isOpen={isAdminModalOpen}
        onClose={() => setIsAdminModalOpen(false)}
      />
    </div>
  );
}
