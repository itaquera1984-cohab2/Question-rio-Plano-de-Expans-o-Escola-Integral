import React, { useState } from 'react';
import { QuestionStep, SurveyFormData } from '../types/questionnaire';
import { isStepAnswered } from '../data/steps';
import {
  X,
  ListFilter,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen,
  School,
  Check,
  FastForward,
  FileText,
  Download,
} from 'lucide-react';

interface QuestionsPanelModalProps {
  isOpen: boolean;
  onClose: () => void;
  steps: QuestionStep[];
  currentStepId: string;
  formData: SurveyFormData;
  onSelectStep: (stepId: string) => void;
}

export const QuestionsPanelModal: React.FC<QuestionsPanelModalProps> = ({
  isOpen,
  onClose,
  steps,
  currentStepId,
  formData,
  onSelectStep,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'ANSWERED' | 'PENDING'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const answeredCount = steps.filter((s) => isStepAnswered(s.id, formData)).length;
  const pendingCount = steps.length - answeredCount;

  const filteredSteps = steps.filter((step) => {
    const isAnswered = isStepAnswered(step.id, formData);
    if (filter === 'ANSWERED' && !isAnswered) return false;
    if (filter === 'PENDING' && isAnswered) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchCode = step.stepCode.toLowerCase().includes(q);
      const matchKey = step.key ? step.key.toLowerCase().includes(q) : false;
      const matchTitle = step.title.toLowerCase().includes(q);
      const matchPrompt = step.directorPrompt.toLowerCase().includes(q);
      return matchCode || matchKey || matchTitle || matchPrompt;
    }
    return true;
  });

  const handleGoToFirstPending = () => {
    const firstPending = steps.find((s) => !isStepAnswered(s.id, formData));
    if (firstPending) {
      onSelectStep(firstPending.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center">
              <ListFilter className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Painel Geral de Questões e Status
              </h3>
              <p className="text-xs text-slate-400">
                Navegue livremente, confira pendências ou pule para qualquer questão
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Metrics Bar */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                filter === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
              }`}
            >
              Todas ({steps.length})
            </button>
            <button
              onClick={() => setFilter('ANSWERED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                filter === 'ANSWERED'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Respondidas ({answeredCount})
            </button>
            <button
              onClick={() => setFilter('PENDING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                filter === 'PENDING'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Pendentes ({pendingCount})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/Questionario_Educacao_Integral_Questoes.pdf"
              target="_blank"
              rel="noopener noreferrer"
              download="Questionario_Educacao_Integral_Questoes.pdf"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-2xs"
              title="Baixar Caderno Completo de Questões em PDF"
            >
              <Download className="w-3.5 h-3.5 text-blue-400" />
              <span>Baixar Caderno PDF</span>
            </a>

            {pendingCount > 0 && (
              <button
                onClick={handleGoToFirstPending}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-2xs"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>Ir p/ 1ª Pendente</span>
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 py-2.5 bg-white border-b border-slate-100">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrar por código ou texto (ex: EF-10, Demanda, Transporte)..."
            className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Questions List */}
        <div className="p-4 overflow-y-auto flex-1 divide-y divide-slate-100 space-y-1">
          {filteredSteps.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-xs">
              Nenhuma questão encontrada com os filtros selecionados.
            </div>
          ) : (
            filteredSteps.map((s, idx) => {
              const isAnswered = isStepAnswered(s.id, formData);
              const isCurrent = s.id === currentStepId;

              return (
                <div
                  key={s.id}
                  onClick={() => {
                    onSelectStep(s.id);
                    onClose();
                  }}
                  className={`p-3 rounded-xl cursor-pointer transition flex items-center justify-between gap-3 ${
                    isCurrent
                      ? 'bg-blue-50/80 border border-blue-200 ring-1 ring-blue-500/20'
                      : 'hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex flex-col items-start gap-1 shrink-0">
                      <span className="text-xs font-mono font-extrabold px-2 py-1 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {s.stepCode}
                      </span>
                      {s.key && (
                        <span className="text-[9.5px] font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.2 rounded border border-indigo-200">
                          {s.key}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-900 truncate">
                        {s.title}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {s.blockLabel}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {isAnswered ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        <Check className="w-3 h-3" />
                        Respondida
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        <Clock className="w-3 h-3" />
                        Pendente
                      </span>
                    )}
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-center">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition"
          >
            Fechar Painel
          </button>
        </div>
      </div>
    </div>
  );
};
