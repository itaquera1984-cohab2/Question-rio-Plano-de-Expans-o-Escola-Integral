import React from 'react';
import { SurveyFormData } from '../types/questionnaire';
import { LABELS, exportToCSV, exportToJSON } from '../utils/helpers';
import {
  CheckCircle2,
  Download,
  Printer,
  ShieldCheck,
  RotateCcw,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';

interface ProtocolCertificateProps {
  formData: SurveyFormData;
  onNewSurvey: () => void;
  onOpenAiHelper: () => void;
  onBackToEdit: () => void;
}

export const ProtocolCertificate: React.FC<ProtocolCertificateProps> = ({
  formData,
  onNewSurvey,
  onOpenAiHelper,
  onBackToEdit,
}) => {
  return (
    <div id="protocol-certificate-root" className="max-w-4xl mx-auto space-y-6">
      {/* Official Receipt Bento Card */}
      <div className="bento-card overflow-hidden print:border-none print:shadow-none bg-white shadow-md">
        {/* Certificate Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 text-center relative">
          <div className="w-16 h-16 bg-white/10 border border-white/20 rounded-2xl mx-auto flex items-center justify-center mb-3 shadow-xs p-1.5 backdrop-blur-xs">
            <img
              src="/brasao.png"
              alt="Brasão de Pindamonhangaba"
              className="max-h-full max-w-full object-contain"
            />
          </div>
          <span className="bento-badge bg-emerald-950 text-emerald-300 border border-emerald-800">
            Comprovante Oficial de Homologação
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white mt-2 uppercase tracking-wide">
            Prefeitura Municipal de Pindamonhangaba
          </h2>
          <p className="text-sm font-semibold text-blue-300 mt-0.5">
            Secretaria Municipal de Educação • GT Indicadores e Equidade Educacional
          </p>
          <p className="text-xs text-slate-300 mt-1 max-w-xl mx-auto leading-relaxed">
            Questionário Diagnóstico Municipal homologado com sucesso e arquivado na base de planejamento da rede.
          </p>
        </div>

        {/* Protocol Metadata Box */}
        <div className="bg-slate-50 border-y border-slate-200 p-6 grid grid-cols-1 sm:grid-cols-4 gap-4 text-center sm:text-left">
          <div className="sm:border-r border-slate-200 sm:pr-4">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
              Número de Protocolo
            </span>
            <span className="text-sm sm:text-base font-mono font-bold text-blue-600 block mt-0.5">
              {formData.protocolNumber}
            </span>
          </div>

          <div className="sm:border-r border-slate-200 sm:pr-4">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
              Data e Hora do Registro
            </span>
            <span className="text-xs sm:text-sm font-semibold text-slate-800 block mt-1">
              {formData.updatedAt
                ? new Date(formData.updatedAt).toLocaleString('pt-BR')
                : new Date().toLocaleString('pt-BR')}
            </span>
          </div>

          <div className="sm:border-r border-slate-200 sm:pr-4">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
              Tempo de Preenchimento
            </span>
            <span className="text-xs sm:text-sm font-bold text-blue-700 block mt-1 font-mono">
              {formData.elapsedTimeFormatted || '15 min 20 seg'}
            </span>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              ({formData.startTime || 'Início'} às {formData.endTime || 'Fim'})
            </span>
          </div>

          <div>
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
              Status da Homologação
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 mt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              CONCLUÍDO / REGISTRADO
            </span>
          </div>
        </div>

        {/* School Summary Table */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Dados da Unidade e Respondente
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Unidade Escolar:</span>
                <span className="font-bold text-slate-900 text-sm block">
                  {formData.schoolName || 'Escola Municipal'}
                  {formData.schoolSector ? ` (${formData.schoolSector})` : ''}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Território / Bairros:</span>
                <span className="font-semibold text-slate-900 block">
                  {formData.neighborhoodCoverage || 'Pindamonhangaba - SP'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Etapas Ofertadas:</span>
                <span className="font-bold text-blue-700 block">
                  {LABELS.sphere[formData.sphere] || formData.sphere}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Município:</span>
                <span className="font-semibold text-slate-800 block">
                  Pindamonhangaba - SP
                </span>
              </div>
            </div>
          </div>

          {/* Respondent Signature Box */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-left">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider block">
                Assinado Digitalmente por:
              </span>
              <span className="font-bold text-slate-900 text-sm block">
                {formData.directorName || 'Gestor(a) Responsável'}
              </span>
              <span className="text-xs text-slate-600 block">
                {formData.respondentRole === 'PROFESSOR_CO_RESPONSAVEL'
                  ? 'Professor(a) Co-Responsável'
                  : 'Diretor(a)'}{' '}
                {formData.directorEmail ? `• ${formData.directorEmail}` : ''}
              </span>
            </div>

            <div className="text-center sm:text-right">
              <div className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-600 font-mono text-xs">
                Chave: {formData.protocolNumber?.replace(/[^a-zA-Z0-9]/g, '').slice(-8)}
              </div>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center space-x-2">
            <button
              id="btn-cert-back"
              onClick={onBackToEdit}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 transition shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Rascunho</span>
            </button>

            <button
              id="btn-cert-ai"
              onClick={onOpenAiHelper}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold border border-blue-200 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>Parecer IA</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="btn-cert-csv"
              onClick={() => exportToCSV(formData)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 transition shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>

            <button
              id="btn-cert-json"
              onClick={() => exportToJSON(formData)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 transition shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>JSON</span>
            </button>

            <button
              id="btn-cert-print"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir Certificado</span>
            </button>

            <button
              id="btn-cert-new"
              onClick={onNewSurvey}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Novo Diagnóstico</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
