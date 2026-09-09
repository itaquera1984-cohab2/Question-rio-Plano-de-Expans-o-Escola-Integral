import React from 'react';
import {
  Building2,
  RotateCcw,
  Sparkles,
  HelpCircle,
  ChevronRight,
  ListFilter,
  Download,
  KeyRound,
} from 'lucide-react';
import { EducationSphere, RespondentRole } from '../types/questionnaire';

interface HeaderProps {
  currentStepIndex: number;
  totalSteps: number;
  currentBlockLabel: string;
  sphere: EducationSphere;
  schoolSector?: string;
  schoolName?: string;
  neighborhoodCoverage?: string;
  directorName?: string;
  respondentRole?: RespondentRole;
  protocolNumber?: string;
  onReset: () => void;
  onOpenAiHelper: () => void;
  onOpenHelpModal: () => void;
  onOpenPanel: () => void;
  onOpenAdmin?: () => void;
  onOpenChangePassword?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStepIndex,
  totalSteps,
  currentBlockLabel,
  sphere,
  schoolSector,
  schoolName,
  neighborhoodCoverage,
  directorName,
  respondentRole,
  protocolNumber,
  onReset,
  onOpenAiHelper,
  onOpenHelpModal,
  onOpenPanel,
  onOpenAdmin,
  onOpenChangePassword,
}) => {
  const getSphereBadge = () => {
    switch (sphere) {
      case 'EI':
        return { label: 'Educação Infantil (EI)', color: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'EF':
        return { label: 'Ensino Fundamental I (EF I)', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'AMBOS':
      default:
        return { label: 'Ambas (EI + EF I)', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    }
  };

  const badge = getSphereBadge();

  return (
    <div id="system-header-container" className="w-full flex flex-col shadow-xs">
      {/* Official Institutional Header - Prefeitura Municipal de Pindamonhangaba */}
      <header
        id="official-pinda-header"
        className="flex-col md:flex-row gap-3 md:gap-0"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderBottom: '2px solid rgb(0, 51, 102)',
          fontFamily: 'Arial, sans-serif',
          backgroundColor: 'rgb(248, 249, 250)',
        }}
      >
        <div
          id="header-brasao-container"
          className="flex items-center justify-center md:justify-start"
          style={{ flex: '0 0 80px', textAlign: 'left' }}
        >
          <img
            id="header-brasao-img"
            alt="Brasão de Pindamonhangaba"
            src="/brasao.png"
            style={{ maxHeight: '75px', width: 'auto' }}
          />
        </div>
        <div style={{ flex: '1 1 0%', textAlign: 'center', padding: '0px 15px' }}>
          <h1
            className="leading-snug"
            style={{
              margin: '0px',
              fontSize: '18px',
              color: 'rgb(0, 51, 102)',
              fontWeight: 'bold',
              textTransform: 'uppercase',
            }}
          >
            Prefeitura Municipal de Pindamonhangaba
          </h1>
          <h2
            style={{
              margin: '4px 0px 0px',
              fontSize: '14px',
              color: 'rgb(51, 51, 51)',
              fontWeight: 600,
            }}
          >
            Secretaria Municipal de Educação
          </h2>
          <p
            style={{
              margin: '2px 0px 0px',
              fontSize: '12px',
              color: 'rgb(85, 85, 85)',
            }}
          >
            GT — Grupo de Trabalho de Indicadores e Equidade Educacional
          </p>
        </div>
        <div
          className="hidden md:block"
          style={{ flex: '0 0 80px', textAlign: 'right' }}
        ></div>
      </header>

      {/* System Action Toolbar & Diagnostic Navigation Bar */}
      <nav
        id="diagnostic-action-toolbar"
        className="bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 py-2.5"
      >
        <div className="max-w-[1600px] mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Breadcrumb Route */}
          <div className="flex items-center space-x-2 text-xs">
            <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
              Questionário Diagnóstico Municipal
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-semibold text-blue-800 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200">
              {currentBlockLabel}
            </span>
          </div>

          {/* Center/Right: School Info & Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {schoolName ? (
              <div className="hidden lg:flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl text-xs">
                <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <div className="max-w-[200px] truncate text-left">
                  <span className="font-bold text-slate-800 block truncate">
                    {schoolName} {schoolSector ? `(${schoolSector})` : ''}
                  </span>
                  {neighborhoodCoverage && (
                    <span className="text-slate-400 text-[10px] truncate block">{neighborhoodCoverage}</span>
                  )}
                </div>
              </div>
            ) : null}

            <span className={`hidden sm:inline-flex text-xs px-2.5 py-1 rounded-lg font-bold border ${badge.color}`}>
              {badge.label}
            </span>

            {/* Quick Actions */}
            <div className="flex items-center space-x-1.5 border-l border-slate-200 pl-2 sm:pl-3">
              {onOpenChangePassword && (
                <button
                  type="button"
                  onClick={onOpenChangePassword}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition border border-emerald-200 cursor-pointer"
                  title="Alterar minha senha"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Alterar senha</span>
                </button>
              )}
              {onOpenAdmin && (
                <button
                  id="btn-admin-portal"
                  onClick={onOpenAdmin}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold transition border border-amber-300 cursor-pointer"
                  title="Painel Restrito Gabinete GT"
                >
                  <span className="text-amber-600 font-normal">⚙️</span>
                  <span className="hidden md:inline">Admin GT</span>
                </button>
              )}

              <button
                id="btn-open-panel"
                onClick={onOpenPanel}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                title="Painel de Todas as Questões e Status"
              >
                <ListFilter className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Painel</span>
              </button>

              <a
                id="btn-download-pdf-questions"
                href="/Questionario_Educacao_Integral_Questoes.pdf"
                target="_blank"
                rel="noopener noreferrer"
                download="Questionario_Educacao_Integral_Questoes.pdf"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-2xs cursor-pointer"
                title="Baixar Caderno Completo de Questões em PDF (Gerais, EI e EF)"
              >
                <Download className="w-3.5 h-3.5 text-blue-200" />
                <span className="hidden sm:inline">PDF Questões</span>
              </a>

              <button
                id="btn-ai-helper"
                onClick={onOpenAiHelper}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition border border-blue-200 cursor-pointer"
                title="Parecer Técnico com Inteligência Artificial"
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Parecer IA</span>
              </button>

              <button
                id="btn-help-modal"
                onClick={onOpenHelpModal}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                title="Orientações e Guia"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              <button
                id="btn-reset-survey"
                onClick={onReset}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                title="Reiniciar Questionário"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* Respondent Identity Pill */}
            <div className="hidden xl:flex items-center space-x-2 pl-2">
              <div className="text-right text-xs">
                <div className="font-bold text-slate-900 leading-tight">
                  {directorName || 'Respondente'}
                </div>
                <div className="text-[10px] text-slate-500">
                  {respondentRole === 'PROFESSOR_CO_RESPONSAVEL'
                    ? 'Prof. Co-Responsável'
                    : 'Diretor(a)'}
                </div>
              </div>
              <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                {directorName ? directorName.charAt(0).toUpperCase() : 'R'}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
};
