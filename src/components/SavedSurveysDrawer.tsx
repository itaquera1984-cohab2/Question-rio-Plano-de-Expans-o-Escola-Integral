import React from 'react';
import { SurveyFormData } from '../types/questionnaire';
import { exportToCSV, exportToJSON } from '../utils/helpers';
import {
  X,
  Building2,
  Calendar,
  Download,
  Trash2,
  FolderOpen,
  PlusCircle,
  ShieldCheck,
  Clock,
  Layers,
} from 'lucide-react';

interface SavedSurveysDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedSurveys: SurveyFormData[];
  activeSurveyId: string;
  onSelectSurvey: (survey: SurveyFormData) => void;
  onDeleteSurvey: (id: string) => void;
  onNewSurvey: () => void;
}

export const SavedSurveysDrawer: React.FC<SavedSurveysDrawerProps> = ({
  isOpen,
  onClose,
  savedSurveys,
  activeSurveyId,
  onSelectSurvey,
  onDeleteSurvey,
  onNewSurvey,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-slideLeft">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <Layers className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-base text-white">
                Diagnósticos da Rede Escolar
              </h3>
              <p className="text-xs text-slate-400">
                {savedSurveys.length} unidade(s) registrada(s) localmente
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action button: Nova Coleta */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <button
            onClick={() => {
              onNewSurvey();
              onClose();
            }}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Iniciar Novo Diagnóstico de Escola</span>
          </button>
        </div>

        {/* List of saved surveys */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3">
          {savedSurveys.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Nenhum diagnóstico arquivado ainda. Os formulários preenchidos são salvos automaticamente.
            </div>
          ) : (
            savedSurveys.map((survey) => {
              const isActive = survey.id === activeSurveyId;
              return (
                <div
                  key={survey.id}
                  className={`p-4 rounded-xl border transition-all ${
                    isActive
                      ? 'border-blue-600 bg-blue-50/50 shadow-xs ring-1 ring-blue-500/30'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                        {survey.sphere}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-1">
                        {survey.schoolName || 'Escola sem identificação'}
                      </h4>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        INEP: <span className="font-mono font-semibold">{survey.inepCode || 'N/D'}</span>
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        survey.status === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {survey.status === 'CONFIRMED' ? 'Homologado' : 'Rascunho'}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">
                      Protocolo: {survey.protocolNumber}
                    </span>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => {
                          onSelectSurvey(survey);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-[11px]"
                      >
                        Carregar
                      </button>
                      <button
                        onClick={() => onDeleteSurvey(survey.id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 transition"
                        title="Excluir da memória"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 text-center text-[11px] text-slate-500">
          Dados sincronizados com o armazenamento seguro da aplicação.
        </div>
      </div>
    </div>
  );
};
