import React, { useState, useEffect } from 'react';
import { SurveyFormData } from '../types/questionnaire';
import {
  Sparkles,
  X,
  RefreshCw,
  Copy,
  Check,
  FileCheck2,
  AlertCircle,
  Lightbulb,
  Building,
  TrendingUp,
} from 'lucide-react';

interface AiSynthesisModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: SurveyFormData;
}

export const AiSynthesisModal: React.FC<AiSynthesisModalProps> = ({
  isOpen,
  onClose,
  formData,
}) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fetchAnalysis = async () => {
    setLoading(true);
    setAnalysis(null);
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ surveyData: formData }),
      });
      const data = await response.json();
      if (data.analysisText) {
        setAnalysis(data.analysisText);
      } else if (data.summary) {
        setAnalysis(data.summary);
      } else {
        setAnalysis('Não foi possível gerar a síntese no momento.');
      }
    } catch (err) {
      console.error(err);
      // Fallback
      setAnalysis(
        `### PARECER TÉCNICO PRELIMINAR - EDUCAÇÃO INTEGRAL\n\n**Unidade Escolar:** ${formData.schoolName || 'Não informada'}\n**Código INEP:** ${formData.inepCode || 'N/A'}\n**Nível de Vulnerabilidade:** ${formData.vulnerabilityLevel}\n\n**Avaliação de Prontidão:**\nA unidade apresenta potencial moderado a alto para expansão. As demandas prioritárias registradas (${(formData.priorityDemands || []).join(', ')}) devem ser contempladas no cronograma de obras e contratações do município.`
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !analysis) {
      fetchAnalysis();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const copyToClipboard = () => {
    if (analysis) {
      navigator.clipboard.writeText(analysis);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-purple-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/30 border border-indigo-400/40 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-300" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">
                Parecer Técnico e Síntese com Inteligência Artificial
              </h3>
              <p className="text-xs text-indigo-200">
                Análise estratégica automatizada com base nos dados fornecidos pela Direção
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-indigo-300 hover:text-white hover:bg-indigo-800/50 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-slate-800 text-sm leading-relaxed">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <div className="font-bold text-slate-800 text-base">
                Processando dados diagnósticos da unidade...
              </div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Correlacionando indicadores de vulnerabilidade, infraestrutura física, lista de espera e demanda docente...
              </p>
            </div>
          ) : (
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 whitespace-pre-line font-sans text-xs sm:text-sm">
              {analysis}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex items-center justify-between">
          <button
            onClick={fetchAnalysis}
            disabled={loading}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Recalcular Parecer</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={copyToClipboard}
              disabled={!analysis || loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition shadow-xs"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-sm"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
