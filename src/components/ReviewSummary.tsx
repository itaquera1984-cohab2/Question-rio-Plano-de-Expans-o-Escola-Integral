import React, { useState } from 'react';
import { SurveyFormData, Ei18StaffData } from '../types/questionnaire';
import { LABELS, exportToCSV, exportToJSON } from '../utils/helpers';
import {
  Building2,
  CheckCircle2,
  Users,
  Clock,
  Sparkles,
  FileText,
  Download,
  Edit3,
  Check,
  AlertTriangle,
  UserCheck,
  Phone,
  Mail,
  Briefcase,
  BookOpen,
  HelpCircle,
  GraduationCap,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReviewSummaryProps {
  formData: SurveyFormData;
  onChange: (updated: Partial<SurveyFormData>) => void;
  onJumpToStep: (stepId: string) => void;
  onFinalSubmit: (signatureName: string) => Promise<{ success: boolean; error?: string }>;
  onOpenAiHelper: () => void;
}

export const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  formData,
  onChange,
  onJumpToStep,
  onFinalSubmit,
  onOpenAiHelper,
}) => {
  const [signatureName, setSignatureName] = useState(formData.directorName || '');
  const [hasConfirmedTerms, setHasConfirmedTerms] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate current elapsed time if not already captured
  const now = new Date();
  const currentEndTime = now.toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const currentEndTimestamp = now.getTime();
  const startTimestamp = formData.startTimestamp || (now.getTime() - 15 * 60 * 1000);
  const elapsedSeconds = Math.max(1, Math.round((currentEndTimestamp - startTimestamp) / 1000));
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const remainingSecs = elapsedSeconds % 60;
  const computedElapsedFormatted = `${elapsedMinutes} min ${remainingSecs.toString().padStart(2, '0')} seg`;

  const displayStartTime = formData.startTime || '08:00:00';
  const displayEndTime = formData.endTime || currentEndTime;
  const displayElapsed = formData.elapsedTimeFormatted || computedElapsedFormatted;

  const handleConfirm = async () => {
    if (!signatureName.trim()) {
      setErrorMsg('Por favor, confirme o nome do respondente para assinar o relatório.');
      return;
    }
    if (!hasConfirmedTerms) {
      setErrorMsg('É necessário declarar a veracidade das informações prestadas para finalizar o protocolo.');
      return;
    }
    setErrorMsg(null);

    setIsSubmitting(true);
    const result = await onFinalSubmit(signatureName.trim());
    setIsSubmitting(false);
    if (!result.success) {
      setErrorMsg(result.error || 'Não foi possível enviar e registrar o relatório. Tente novamente.');
      return;
    }

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // ignore
    }
  };

  const showEI = formData.sphere === 'EI' || formData.sphere === 'AMBOS';
  const showEF = formData.sphere === 'EF' || formData.sphere === 'AMBOS';

  return (
    <div className="space-y-6">
      {/* Header Bento Card */}
      <div className="bento-card p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="bento-badge bg-emerald-50 text-emerald-700 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Secretaria Municipal de Educação de Pindamonhangaba
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">
              Relatório Resumo do Diagnóstico Municipal
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Revise atentamente todas as informações registradas. Você pode clicar em &ldquo;Editar&rdquo; em qualquer seção para fazer alterações antes de homologar.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportToCSV(formData)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition border border-slate-200"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>

            <button
              onClick={() => exportToJSON(formData)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition border border-slate-200"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Exportar JSON</span>
            </button>

            <button
              onClick={onOpenAiHelper}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition border border-blue-200"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Parecer IA</span>
            </button>
          </div>
        </div>
      </div>

      {/* Session Timing & Status Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-200">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Controle de Sessão e Tempo
            </div>
            <div className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span>Início: <strong>{displayStartTime}</strong></span>
              <span className="text-slate-300">•</span>
              <span>Término: <strong>{displayEndTime}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-200">
          <span className="text-xs font-bold text-blue-900">Tempo Decorrido Total:</span>
          <span className="text-sm font-black text-blue-700 font-mono">{displayElapsed}</span>
        </div>
      </div>

      {/* Grid Bento of Summary Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Identificação e Triagem */}
        <div className="bento-card p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <UserCheck className="w-4 h-4 text-blue-600" />
                <span>1. Identificação e Unidade Escolar</span>
              </div>
              <button
                onClick={() => onJumpToStep('ETAPA_0_IDENTIFICACAO')}
                className="text-xs text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar</span>
              </button>
            </div>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Respondente:</span>
                <span className="font-bold text-slate-900 text-right">{formData.directorName || 'Não informado'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Cargo / Função:</span>
                <span className="font-bold text-slate-900">
                  {formData.respondentRole === 'PROFESSOR_CO_RESPONSAVEL'
                    ? 'Professor(a) Co-Responsável'
                    : 'Diretor(a)'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">E-mail:</span>
                <span className="font-mono text-slate-700">{formData.directorEmail || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Telefone:</span>
                <span className="text-slate-900 font-semibold">{formData.directorPhone || '-'}</span>
              </div>
              {formData.schoolSector && (
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Setor Escolar:</span>
                  <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    {formData.schoolSector}
                  </span>
                </div>
              )}
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Escola:</span>
                <span className="font-bold text-slate-900 text-right">{formData.schoolName || 'Não informada'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Território/Bairros:</span>
                <span className="text-slate-700 text-right">{formData.neighborhoodCoverage || '-'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Etapas Ofertadas:</span>
                <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                  {LABELS.sphere[formData.sphere] || formData.sphere}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100">
                <span className="text-slate-500 block mb-1 font-semibold">Frequência de Visitas (GREB's / GT / Superv.):</span>
                <span className="text-slate-800 font-medium bg-slate-50 p-2 rounded-lg block text-[11px] leading-relaxed border border-slate-200">
                  • <strong>GREB's:</strong> {formData.supervisionVisitsData?.grebs?.dias ?? 0} dias, {formData.supervisionVisitsData?.grebs?.meses ?? 0} meses, {formData.supervisionVisitsData?.grebs?.anual ?? 0} anual<br />
                  • <strong>GT:</strong> {formData.supervisionVisitsData?.gt?.dias ?? 0} dias, {formData.supervisionVisitsData?.gt?.meses ?? 0} meses, {formData.supervisionVisitsData?.gt?.anual ?? 0} anual<br />
                  • <strong>Supervisoras:</strong> {(formData.supervisionVisitsData?.supervisoras_estado || formData.supervisionVisitsData?.supervisoras)?.dias ?? 0} dias, {(formData.supervisionVisitsData?.supervisoras_estado || formData.supervisionVisitsData?.supervisoras)?.meses ?? 0} meses, {(formData.supervisionVisitsData?.supervisoras_estado || formData.supervisionVisitsData?.supervisoras)?.anual ?? 0} anual
                </span>
              </div>

              {/* UNI-01: Viabilidade de Oferta Integral (ed-integral) */}
              {(() => {
                const uni = formData['ed-integral'] || formData['UNI-01'] || formData.uni_01_data || formData.ed_integral;
                const diretriz = uni?.diretriz_escolhida || formData.uni_01_diretriz;
                const det = uni?.detalhes || {};
                return (
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-500 font-semibold flex items-center gap-1.5">
                        <span className="px-1 py-0.2 font-mono text-[10px] bg-blue-100 text-blue-800 rounded font-bold">UNI-01</span>
                        <span className="px-1 py-0.2 font-mono text-[9.5px] bg-indigo-100 text-indigo-800 rounded font-bold">ed-integral</span>
                        <span>Viabilidade e Diretriz Integral:</span>
                      </span>
                      <button
                        onClick={() => onJumpToStep('UNI_01')}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-0.5"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Editar</span>
                      </button>
                    </div>
                    {diretriz ? (
                      <div className="text-slate-800 font-medium bg-blue-50/70 p-2.5 rounded-lg text-[11px] leading-relaxed border border-blue-200">
                        <div className="font-bold text-blue-900 mb-1">
                          Diretriz Escolhida: <span className="bg-white px-1.5 py-0.5 rounded border border-blue-300 font-extrabold">{diretriz}</span>
                        </div>
                        {diretriz === 'CONTINUIDADE' && (
                          <div className="text-slate-700">
                            • Ação: <strong>{det.acao_continuidade === 'MANTER' ? 'Manter quantidade atual' : det.acao_continuidade === 'AUMENTAR' ? 'Aumentar oferta' : 'Diminuir oferta'}</strong>
                            {(det.acao_continuidade === 'AUMENTAR' || det.acao_continuidade === 'DIMINUIR') && (
                              <span> ({det.qtd_salas_ajuste ?? 0} salas de ajuste)</span>
                            )}
                          </div>
                        )}
                        {diretriz === 'IMPLEMENTACAO' && (
                          <div className="text-slate-700">
                            • Regime: <strong>{det.regime_planejado === 'INTEGRAL' ? 'Tempo Integral' : 'Tempo Parcial'}</strong> | Salas planejadas: <strong>{det.qtd_salas_implementacao ?? 0}</strong>
                          </div>
                        )}
                        {diretriz === 'AMPLIACAO' && (
                          <div className="text-slate-700">
                            • Quantidade de salas para ampliação: <strong>{det.qtd_salas_ampliacao ?? 0} salas adicionais</strong>
                          </div>
                        )}
                        {det.observacao_comunidade && (
                          <div className="mt-1 pt-1 border-t border-blue-200/60 text-[10.5px] text-slate-600 italic">
                            &ldquo;{det.observacao_comunidade}&rdquo;
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">Pendente de preenchimento</span>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>

        {/* Resumo Módulo EI (Se aplicável) */}
        {showEI && (
          <div className="bento-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <GraduationCap className="w-4 h-4 text-blue-600" />
                  <span>2. Módulo EI • Educação Infantil (EI-01 a EI-28)</span>
                </div>
                <button
                  onClick={() => onJumpToStep('EI_01')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
              </div>

              <div className="mt-4 space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Matrículas Totais (EI-01):</span>
                  <span className="font-bold text-slate-900">
                    {formData.ei_01_totalEnrolled || formData.ei_15_totalEnrolled || 0} alunos
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Matrículas (Integral / Parcial):</span>
                  <span className="font-bold text-slate-900">
                    {formData.ei_17_integralCount || 0} / {formData.ei_17_partialCount || 0}{' '}
                    <span className="text-slate-500 font-normal">
                      (Total: {(formData.ei_17_integralCount || 0) + (formData.ei_17_partialCount || 0)} alunos)
                    </span>
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Capacidade Máxima (Int / Parc):</span>
                  <span className="font-bold text-blue-700">
                    {formData.ei_17_integralCapacity || 0} / {formData.ei_17_partialCapacity || 0}{' '}
                    <span className="text-slate-500 font-normal">
                      (Total: {(formData.ei_17_integralCapacity || 0) + (formData.ei_17_partialCapacity || 0)} vagas)
                    </span>
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Ocupadas no Turno (M / T / Int):</span>
                  <span className="font-semibold text-slate-800">
                    {formData.ei_02_occupiedMorning || 0} / {formData.ei_02_occupiedAfternoon || 0} / {formData.ei_02_occupiedIntegral || 0}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Lista de Espera:</span>
                  <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                    {formData.ei_03_waitingListCount ?? 0} crianças ({formData.ei_04_avgWaitTime || 'N/A'})
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Quadro de Profissionais (EI-18):</span>
                  <span className="font-semibold text-slate-800">
                    {formData['EI-18'] || formData.ei_18_staffData ? (
                      (() => {
                        const s = (formData['EI-18'] || formData.ei_18_staffData!) as Ei18StaffData;
                        const totAtual = Object.values(s).reduce((acc: number, item) => acc + (item?.atual || 0), 0);
                        const totNec = Object.values(s).reduce((acc: number, item) => acc + (item?.necessidade || 0), 0);
                        return `${totAtual} atuais (+${totNec} necessários)`;
                      })()
                    ) : (
                      formData.ei_18_staffBreakdown ? 'Registrado' : '-'
                    )}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Capacidade de Expansão:</span>
                  <span className="font-semibold text-slate-800">
                    {formData.ei_10_expansionCapacity || 'Não informado'} (+{formData.ei_11_additionalSlotsEstimated || 0} vagas)
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Avaliação Geral de Qualidade:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {formData.ei_28_overallQuality || 'Boa'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Resumo Módulo EF (Se aplicável) */}
        {showEF && (
          <div className="bento-card p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <span>3. Módulo EF • Ensino Fundamental I (EF-01 a EF-28)</span>
                </div>
                <button
                  onClick={() => onJumpToStep('EF_01')}
                  className="text-xs text-blue-600 hover:text-blue-800 font-bold inline-flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
              </div>

              <div className="mt-4 space-y-2.5 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Total de Matrículas Ativas:</span>
                  <span className="font-bold text-slate-900">{formData.ef_01_totalEnrolled} alunos</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Matrículas por Turno (M / T / Int):</span>
                  <span className="font-semibold text-slate-800">
                    {formData.ef_03_enrolledMorning || 0} / {formData.ef_03_enrolledAfternoon || 0} / {formData.ef_03_enrolledIntegral || 0}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Classificação Territorial:</span>
                  <span className="font-semibold text-slate-800">
                    {formData.sphere === 'AMBOS'
                      ? `${formData.ef_04_territoryType || formData.ei_19_territoryType || 'Urbano'} (Replicado de EI-19)`
                      : formData.ef_04_territoryType || '-'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Condições Socioeconômicas:</span>
                  <span className="font-semibold text-slate-800">
                    {formData.sphere === 'AMBOS'
                      ? `${formData.ef_05_socioeconomicProfile || formData.ei_20_socioeconomicProfile || 'Mistas'} (Replicado de EI-20)`
                      : formData.ef_05_socioeconomicProfile || '-'}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Quadro de Profissionais (EF-18):</span>
                  <span className="font-semibold text-slate-800">
                    {formData.sphere === 'AMBOS' ? (
                      (() => {
                        const s = (formData['EI-18'] || formData.ei_18_staffData) as Ei18StaffData | undefined;
                        if (!s) return 'Integrado de EI-18';
                        const totAtual = Object.values(s).reduce((acc: number, item) => acc + (item?.atual || 0), 0);
                        const totNec = Object.values(s).reduce((acc: number, item) => acc + (item?.necessidade || 0), 0);
                        return `${totAtual} atuais (+${totNec} nec.) • Unificado EI-18`;
                      })()
                    ) : (formData.sphere === 'AMBOS' ? (formData['EI-18'] || formData.ei_18_staffData) : (formData['EF-18'] || formData.ef_18_staffData)) ? (
                      (() => {
                        const s = (formData.sphere === 'AMBOS'
                          ? (formData['EI-18'] || formData.ei_18_staffData)
                          : (formData['EF-18'] || formData.ef_18_staffData!)) as Ei18StaffData;
                        const totAtual = Object.values(s).reduce((acc: number, item) => acc + (item?.atual || 0), 0);
                        const totNec = Object.values(s).reduce((acc: number, item) => acc + (item?.necessidade || 0), 0);
                        return `${totAtual} atuais (+${totNec} necessários)`;
                      })()
                    ) : (
                      formData.ef_18_staffBreakdown ? 'Registrado' : '-'
                    )}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Proporção PPIs:</span>
                  <span className="font-semibold text-slate-800">{formData.ef_06_ppiProportion || '-'}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Transferências (Rec. / Exp.):</span>
                  <span className="font-semibold text-slate-800">
                    {formData.ef_10_transfersReceived || 0} rec. / {formData.ef_10_transfersIssued || 0} exp.
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Busca Ativa & Risco:</span>
                  <span className="font-semibold text-slate-800">
                    {formData.ef_14_activeSearchStrategy} | {formData.ef_15_individualizedTracking}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Avaliação Geral de Qualidade:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {formData.ef_28_overallQuality || 'Boa'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Confirmation & Homologation Card */}
      <div className="bento-card p-6 sm:p-8 bg-slate-900 text-white shadow-lg">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Declaração e Homologação do Diagnóstico</span>
        </h3>
        <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
          Ao homologar, as respostas serão validadas e arquivadas no sistema municipal de Pindamonhangaba.
        </p>

        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-950/80 border border-rose-600/60 rounded-xl text-rose-200 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Assinatura Digital (Nome Completo do Respondente) <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              value={signatureName}
              onChange={(e) => setSignatureName(e.target.value)}
              placeholder="Digite seu nome completo"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
              <input
                type="checkbox"
                checked={hasConfirmedTerms}
                onChange={(e) => setHasConfirmedTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-700 text-blue-600 focus:ring-blue-500 bg-slate-800"
              />
              <span>
                Declaro que as informações aqui prestadas são verídicas e refletem fielmente a realidade da Unidade Escolar perante a Secretaria de Educação de Pindamonhangaba.
              </span>
            </label>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 font-mono">
            Protocolo Gerado: <span className="text-blue-400 font-bold">{formData.protocolNumber}</span>
          </div>

          <button
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-md transition cursor-pointer active:scale-[0.99] disabled:cursor-wait disabled:opacity-60"
          >
            <span>{isSubmitting ? 'ENVIANDO RELATÓRIOS AO SUPABASE...' : '💾 SALVAR E REGISTRAR RESPOSTAS DEFINITIVAS'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
