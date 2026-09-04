import React from 'react';
import { X, HelpCircle, BookOpen, CheckCircle2, ListFilter, FastForward, Search } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <HelpCircle className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-base text-white">
                Orientações do Questionário Diagnóstico Municipal
              </h3>
              <p className="text-xs text-slate-400">Secretaria Municipal de Educação de Pindamonhangaba</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700 leading-relaxed">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <h4 className="font-bold text-blue-900 mb-1 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-600" />
              Objetivo do Diagnóstico Municipal
            </h4>
            <p className="text-slate-700">
              Coletar informações operacionais e pedagógicas precisas de cada unidade escolar para subsidiar o planejamento de vagas, equidade territorial, jornada escolar e investimentos da rede municipal de Pindamonhangaba.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-bold text-slate-900 text-sm">Recursos de Navegação Disponíveis:</h4>

            <div className="flex items-start space-x-2.5">
              <ListFilter className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong>Painel de Status:</strong> A qualquer momento você pode clicar em &ldquo;Painel&rdquo; para ver a lista de questões com indicação de <span className="text-emerald-700 font-bold">[Respondida]</span> ou <span className="text-amber-700 font-bold">[Pendente]</span>.
              </div>
            </div>

            <div className="flex items-start space-x-2.5">
              <Search className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
              <div>
                <strong>Busca Rápida por Código:</strong> Digite o código de qualquer questão (por exemplo: <code>EI-01</code>, <code>EI-28</code>, <code>EF-10</code>) para saltar instantaneamente para ela.
              </div>
            </div>

            <div className="flex items-start space-x-2.5">
              <FastForward className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>Pular Questões:</strong> Se você não tiver um dado específico no momento, use o botão &ldquo;Pular / Próxima Pendente&rdquo; para responder depois. O sistema mantém todas as pendências sinalizadas.
              </div>
            </div>

            <div className="flex items-start space-x-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Homologação e Protocolo:</strong> Na tela final de revisão, o Diretor ou Professor Co-Responsável confirma a veracidade das informações e gera o protocolo oficial.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs"
          >
            Entendido, continuar
          </button>
        </div>
      </div>
    </div>
  );
};
