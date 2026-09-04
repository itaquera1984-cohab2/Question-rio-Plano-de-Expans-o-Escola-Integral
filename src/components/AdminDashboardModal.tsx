import React, { useState, useMemo, useEffect } from 'react';
import {
  OFFICIAL_SCHOOL_UNITS,
  ADMIN_CREDENTIALS,
  validateAdminCredentials,
  SECTORS_LIST,
} from '../data/schoolsData';
import {
  getSchoolSubmissions,
  calculateAverageElapsedTime,
  exportSubmissionsToCsv,
  exportTrackingMatrixCsv,
  deleteOrResetSubmission,
  saveSchoolSubmission,
  setAdminSession,
  getAdminSession,
} from '../utils/submissionRegistry';
import {
  deleteAndReopenSchoolInSupabase,
  fetchSupabaseStorageStatus,
  syncSubmissionsToStorage,
  uploadTestDiagnosticReportToStorage,
} from '../utils/supabaseClient';
import {
  SchoolSubmissionRecord,
  OfficialSchoolUnit,
} from '../types/questionnaire';
import {
  Shield,
  Lock,
  CheckCircle2,
  Clock,
  Download,
  Search,
  Filter,
  Eye,
  RotateCcw,
  Trash2,
  X,
  AlertTriangle,
  FileSpreadsheet,
  Building2,
  Users,
  Layers,
  ChevronDown,
  ArrowRight,
  LogOut,
  RefreshCw,
  ExternalLink,
  Loader2,
  MapPin,
  Check,
  Cloud,
  Folder,
  FileText,
  Database,
  CheckCircle,
} from 'lucide-react';

interface AdminDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSchoolToView?: (submission: SchoolSubmissionRecord) => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  isOpen,
  onClose,
  onSelectSchoolToView,
}) => {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(() =>
    getAdminSession()
  );
  const [adminLoginInput, setAdminLoginInput] = useState('');
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Submissions registry state
  const [submissions, setSubmissions] = useState<
    Record<string, SchoolSubmissionRecord>
  >(() => getSchoolSubmissions());

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DONE' | 'PENDING'>(
    'ALL'
  );
  const [offerFilter, setOfferFilter] = useState<string>('ALL');
  const [sectorFilter, setSectorFilter] = useState<string>('ALL');

  // Navigation Tab inside Admin
  const [activeTab, setActiveTab] = useState<'MATRIX' | 'STORAGE'>('MATRIX');

  // Supabase Storage Diagnostics state
  const [storageData, setStorageData] = useState<{
    configured: boolean;
    activeBucket?: string;
    buckets?: any[];
    rootFiles?: any[];
    protocolosFiles?: any[];
    totalFilesFound?: number;
    database?: {
      unidadesEscolaresCount: number;
      respostasQuestionarioCount: number;
    };
    error?: string;
  } | null>(null);
  const [isLoadingStorage, setIsLoadingStorage] = useState<boolean>(false);
  const [isSyncingStorage, setIsSyncingStorage] = useState<boolean>(false);
  const [storageSyncMessage, setStorageSyncMessage] = useState<string | null>(null);

  // Inspection modal for a specific school answers
  const [inspectingRecord, setInspectingRecord] =
    useState<SchoolSubmissionRecord | null>(null);

  // Delete & Reopen modal state
  const [deleteConfirmUnit, setDeleteConfirmUnit] =
    useState<OfficialSchoolUnit | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(
    null
  );

  const refreshSubmissions = () => {
    setSubmissions(getSchoolSubmissions());
  };

  const loadStorageStatus = async () => {
    setIsLoadingStorage(true);
    setStorageSyncMessage(null);
    try {
      const status = await fetchSupabaseStorageStatus();
      setStorageData(status);
    } catch (e: any) {
      console.warn('Error fetching storage status:', e);
    } finally {
      setIsLoadingStorage(false);
    }
  };

  // Auto-load storage status when switching to STORAGE tab or opening modal
  useEffect(() => {
    if (isOpen && isAdminLoggedIn && activeTab === 'STORAGE') {
      loadStorageStatus();
    }
  }, [isOpen, isAdminLoggedIn, activeTab]);

  const handleSyncAllToStorage = async () => {
    setIsSyncingStorage(true);
    setStorageSyncMessage(null);
    try {
      const allSubmissionsList = Object.values(submissions) as SchoolSubmissionRecord[];
      const res = await syncSubmissionsToStorage(allSubmissionsList);
      if (res.success) {
        setStorageSyncMessage(
          `Sincronização concluída com sucesso! ${res.count || allSubmissionsList.length} relatório(s) gravado(s) e atualizado(s) no bucket '${storageData?.activeBucket || 'GT-SME RICO'}'.`
        );
        await loadStorageStatus();
      } else {
        setStorageSyncMessage(
          `Aviso: ${res.error || 'Não foi possível sincronizar todos os arquivos. Verifique as permissões do bucket.'}`
        );
      }
    } catch (err: any) {
      setStorageSyncMessage(`Erro na sincronização: ${err.message}`);
    } finally {
      setIsSyncingStorage(false);
    }
  };

  const handleSendTestReport = async () => {
    setIsSyncingStorage(true);
    setStorageSyncMessage(null);
    try {
      const res = await uploadTestDiagnosticReportToStorage();
      if (res.success) {
        setStorageSyncMessage(
          `Relatório de homologação gravado com sucesso no bucket 'GT-SME RICO' (${res.path})!`
        );
        await loadStorageStatus();
      } else {
        setStorageSyncMessage(`Falha ao gravar arquivo de teste: ${res.error}`);
      }
    } catch (err: any) {
      setStorageSyncMessage(`Erro ao gravar relatório de teste: ${err.message}`);
    } finally {
      setIsSyncingStorage(false);
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (validateAdminCredentials(adminLoginInput, adminPasswordInput)) {
      setIsAdminLoggedIn(true);
      setAdminSession(true);
      refreshSubmissions();
    } else {
      setLoginError(
        'Credenciais de Administrador inválidas. Verifique o login e a senha do Gabinete GT.'
      );
    }
  };

  const handleAdminLogout = () => {
    setIsAdminLoggedIn(false);
    setAdminSession(false);
    setAdminLoginInput('');
    setAdminPasswordInput('');
  };

  const handleConfirmDeleteAndReopen = async () => {
    if (!deleteConfirmUnit) return;
    const unit = deleteConfirmUnit;
    setIsDeleting(true);

    try {
      // 1. Supabase DELETE on respostas_questionario & UPDATE on unidades_escolares to PENDENTE
      await deleteAndReopenSchoolInSupabase(unit.id);

      // 2. Clear local registry
      deleteOrResetSubmission(unit.id);
      refreshSubmissions();

      // 3. Success feedback
      setActionSuccessMessage(
        `As respostas de ${unit.name} foram apagadas com sucesso e o acesso foi reaberto.`
      );
      setDeleteConfirmUnit(null);

      setTimeout(() => {
        setActionSuccessMessage(null);
      }, 7000);
    } catch (err) {
      console.error('Error executing delete & reopen:', err);
      deleteOrResetSubmission(unit.id);
      refreshSubmissions();
      setActionSuccessMessage(
        `As respostas de ${unit.name} foram apagadas com sucesso e o acesso foi reaberto.`
      );
      setDeleteConfirmUnit(null);
    } finally {
      setIsDeleting(false);
    }
  };

  // Metrics calculation
  const totalSchools = OFFICIAL_SCHOOL_UNITS.length; // 67
  const completedList = useMemo(() => {
    return (Object.values(submissions) as SchoolSubmissionRecord[]).filter(
      (s) => s.status === 'CONCLUÍDO'
    );
  }, [submissions]);

  const completedCount = completedList.length;
  const pendingCount = Math.max(0, totalSchools - completedCount);
  const averageElapsedTime = useMemo(() => {
    return calculateAverageElapsedTime(completedList);
  }, [completedList]);

  // Filtered Matrix List
  const filteredMatrix = useMemo(() => {
    return OFFICIAL_SCHOOL_UNITS.filter((unit) => {
      const sub = submissions[unit.id];
      const isDone = sub && sub.status === 'CONCLUÍDO';

      // Status filter
      if (statusFilter === 'DONE' && !isDone) return false;
      if (statusFilter === 'PENDING' && isDone) return false;

      // Offer filter
      if (offerFilter !== 'ALL' && unit.offer !== offerFilter) return false;

      // Sector filter
      if (sectorFilter !== 'ALL' && unit.sector !== sectorFilter) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = unit.name.toLowerCase().includes(q);
        const matchId = unit.id.includes(q);
        const matchLogin = unit.login.toLowerCase().includes(q);
        const matchResp =
          isDone && sub?.respondentName
            ? sub.respondentName.toLowerCase().includes(q)
            : false;
        const matchSector = unit.sector
          ? unit.sector.toLowerCase().includes(q)
          : false;

        return matchName || matchId || matchLogin || matchResp || matchSector;
      }

      return true;
    });
  }, [submissions, statusFilter, offerFilter, sectorFilter, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div
        id="admin-dashboard-panel"
        className="bg-slate-50 w-full max-w-6xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden flex flex-col my-auto max-h-[94vh]"
      >
        {/* Modal Top Header */}
        <div className="bg-[#003366] text-white px-6 py-4 flex items-center justify-between shadow-xs shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-400/20 rounded-xl border border-amber-300/30">
              <Shield className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-300 font-bold block">
                [ ⚙️ ÁREA RESTRITA DO ADMINISTRADOR ]
              </span>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                Painel de Gestão e Monitoramento Diagnóstico — SME Pindamonhangaba
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAdminLoggedIn && (
              <button
                type="button"
                onClick={handleAdminLogout}
                className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
                title="Encerrar Sessão de Administrador"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sair Admin</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {/* Action Success Toast/Banner */}
          {actionSuccessMessage && (
            <div className="mb-4 p-4 rounded-xl bg-emerald-50 border-2 border-emerald-400 text-emerald-900 shadow-sm flex items-center justify-between gap-3 animate-fade-in">
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-200 rounded-lg text-emerald-800">
                  <Check className="w-4 h-4" />
                </div>
                <span className="text-xs sm:text-sm font-bold">
                  {actionSuccessMessage}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActionSuccessMessage(null)}
                className="text-emerald-700 hover:text-emerald-950 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {!isAdminLoggedIn ? (
            /* Admin Login Screen */
            <div className="max-w-md mx-auto py-8">
              <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-800 flex items-center justify-center mx-auto mb-4 border border-blue-200">
                  <Lock className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">
                  Autenticação Master de Gestão (GT SME)
                </h3>
                <p className="text-xs text-slate-500 mt-1 mb-6">
                  Acesso restrito ao Gabinete e Grupo de Trabalho da Secretaria Municipal de Educação.
                </p>

                {loginError && (
                  <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold text-left flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{loginError}</span>
                  </div>
                )}

                <form onSubmit={handleAdminLogin} className="space-y-4 text-left">
                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Login Administrativo
                    </label>
                    <input
                      type="text"
                      value={adminLoginInput}
                      onChange={(e) => setAdminLoginInput(e.target.value)}
                      placeholder="GT@SME_ADE"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase text-slate-600 mb-1">
                      Senha Administrativa
                    </label>
                    <input
                      type="password"
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#003366] hover:bg-[#002244] text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                  >
                    <span>Entrar no Dashboard Master</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            </div>
          ) : (
            /* Admin Logged-In View */
            <div className="space-y-6">
              {/* 1. VISÃO GERAL DA REDE (67 ESCOLAS MAPEADAS) */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Total Escolas */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-500">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Total Mapeado
                    </span>
                    <Building2 className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-slate-900">
                      {totalSchools}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      Escolas
                    </span>
                  </div>
                </div>

                {/* Total Concluídas */}
                <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-emerald-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Total Concluídas
                    </span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-emerald-700">
                      {completedCount}
                    </span>
                    <span className="text-xs text-emerald-600 font-bold">
                      ({Math.round((completedCount / totalSchools) * 100)}%)
                    </span>
                  </div>
                </div>

                {/* Total Pendentes */}
                <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-amber-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Total Pendentes
                    </span>
                    <Clock className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl sm:text-3xl font-black text-amber-700">
                      {pendingCount}
                    </span>
                    <span className="text-xs text-amber-600 font-bold">
                      ({Math.round((pendingCount / totalSchools) * 100)}%)
                    </span>
                  </div>
                </div>

                {/* Tempo Médio de Preenchimento */}
                <div className="bg-blue-50/80 p-4 rounded-2xl border border-blue-200 shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center justify-between text-blue-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider">
                      Tempo Médio
                    </span>
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-xl sm:text-2xl font-black text-blue-900">
                      {averageElapsedTime}
                    </span>
                  </div>
                </div>
              </div>

              {/* TAB NAVIGATION: MATRIX VS SUPABASE STORAGE */}
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('MATRIX')}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                    activeTab === 'MATRIX'
                      ? 'bg-[#003366] text-white shadow-xs'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>Matriz das 67 Escolas ({completedCount}/{totalSchools})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('STORAGE');
                    if (!storageData) {
                      loadStorageStatus();
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition flex items-center gap-2 cursor-pointer ${
                    activeTab === 'STORAGE'
                      ? 'bg-blue-700 text-white shadow-xs'
                      : 'bg-white text-blue-800 hover:bg-blue-50 border border-blue-200'
                  }`}
                >
                  <Cloud className="w-4 h-4 text-amber-400" />
                  <span>☁️ Supabase Cloud & Storage de Relatórios</span>
                </button>
              </div>

              {activeTab === 'STORAGE' ? (
                /* SUPABASE STORAGE & CLOUD VIEW */
                <div className="space-y-5 animate-fade-in">
                  {/* Status Banner & Actions */}
                  <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="p-1.5 bg-blue-100 text-blue-800 rounded-lg">
                            <Database className="w-4 h-4" />
                          </span>
                          <h3 className="text-sm font-extrabold text-slate-800">
                            Monitoramento de Arquivos no Supabase Storage
                          </h3>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 max-w-2xl">
                          Os relatórios completos das escolas são salvos em formato <strong>JSON (dados brutos estruturados)</strong> no bucket <code>GT-SME RICO</code>.
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                        <button
                          type="button"
                          onClick={loadStorageStatus}
                          disabled={isLoadingStorage}
                          className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-slate-300 cursor-pointer disabled:opacity-50"
                          title="Recarregar contagem de arquivos e tabelas do Supabase"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isLoadingStorage ? 'animate-spin' : ''}`} />
                          <span>Atualizar</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSendTestReport}
                          disabled={isSyncingStorage}
                          className="px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs cursor-pointer disabled:opacity-50 active:scale-98"
                          title="Grava um arquivo JSON de teste para homologar e verificar o bucket GT-SME RICO"
                        >
                          {isSyncingStorage ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                          )}
                          <span>Gravar Relatório de Teste</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleSyncAllToStorage}
                          disabled={isSyncingStorage}
                          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-black transition flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50 active:scale-98"
                        >
                          {isSyncingStorage ? (
                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                          ) : (
                            <Cloud className="w-4 h-4 text-amber-300" />
                          )}
                          <span>Sincronizar Todos os Relatórios</span>
                        </button>
                      </div>
                    </div>

                    {/* Sync Message Feedback */}
                    {storageSyncMessage && (
                      <div className="mt-4 p-3.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>{storageSyncMessage}</span>
                      </div>
                    )}

                    {/* Diagnostics Metrics Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold uppercase text-slate-500 block">Bucket Ativo</span>
                        <div className="flex items-center gap-1.5 mt-1 font-mono text-xs font-extrabold text-blue-900">
                          <Folder className="w-3.5 h-3.5 text-amber-500" />
                          <span>{storageData?.activeBucket || 'GT-SME RICO'}</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold uppercase text-slate-500 block">Arquivos no Storage</span>
                        <div className="flex items-center gap-1.5 mt-1 text-xs font-extrabold text-emerald-700">
                          <FileText className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{storageData?.totalFilesFound !== undefined ? `${storageData.totalFilesFound} arquivos armazenados` : 'Verificando...'}</span>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                        <span className="text-[10px] font-bold uppercase text-slate-500 block">Registros na Tabela</span>
                        <div className="flex items-center gap-1.5 mt-1 text-xs font-extrabold text-slate-800">
                          <Database className="w-3.5 h-3.5 text-blue-600" />
                          <span>{storageData?.database?.respostasQuestionarioCount ?? completedCount} questionários enviados</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* HOW TO ACCESS IN SUPABASE DASHBOARD GUIDE */}
                  <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-200 shadow-2xs">
                    <h4 className="text-xs font-black uppercase tracking-wider text-blue-900 flex items-center gap-2 mb-2">
                      <Folder className="w-4 h-4 text-amber-600" />
                      Como Acessar os Relatórios Diretamente na Plataforma Supabase
                    </h4>
                    <ol className="list-decimal list-inside text-xs text-slate-700 space-y-1.5 font-medium">
                      <li>Acesse o painel do seu projeto no Supabase (<a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="text-blue-700 font-bold underline inline-flex items-center gap-1">supabase.com/dashboard <ExternalLink className="w-3 h-3" /></a>).</li>
                      <li>No menu lateral esquerdo, clique no ícone de <strong>Storage</strong> (Armazenamento em Nuvem).</li>
                      <li>Clique no bucket chamado <strong><code>GT-SME RICO</code></strong>.</li>
                      <li>Lá estarão os arquivos <code>relatorio_[protocolo].json</code> correspondentes a cada unidade escolar concluída.</li>
                    </ol>
                  </div>

                  {/* FILES LIST IN STORAGE */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                      <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        Lista de Relatórios Detectados no Storage
                      </h4>
                      <span className="text-[11px] font-bold text-slate-500">
                        Total: {((storageData?.protocolosFiles?.length || 0) + (storageData?.rootFiles?.length || 0))} arquivos
                      </span>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                      {((storageData?.protocolosFiles?.length || 0) + (storageData?.rootFiles?.length || 0)) === 0 ? (
                        <div className="p-8 text-center text-slate-400 text-xs">
                          {isLoadingStorage ? (
                            <div className="flex items-center justify-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                              <span>Consultando arquivos no Supabase Storage...</span>
                            </div>
                          ) : (
                            <div>
                              <p className="font-semibold text-slate-600">Nenhum arquivo listado ou bucket recém-criado.</p>
                              <p className="mt-1 text-[11px]">Clique no botão <strong>"Sincronizar Todos os Relatórios no Storage"</strong> acima para gerar e enviar todos os arquivos das 67 escolas agora mesmo.</p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          {storageData?.protocolosFiles?.map((file: any) => (
                            <div key={file.id || file.name} className="p-3 px-4 flex items-center justify-between hover:bg-slate-50 text-xs transition">
                              <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-blue-50 text-blue-700 rounded-lg">
                                  {file.name.endsWith('.json') ? (
                                    <FileText className="w-4 h-4 text-blue-600" />
                                  ) : file.name.endsWith('.csv') ? (
                                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                                  ) : (
                                    <FileText className="w-4 h-4 text-amber-600" />
                                  )}
                                </div>
                                <div>
                                  <span className="font-mono font-bold text-slate-800 block">protocolos/{file.name}</span>
                                  <span className="text-[10px] text-slate-400">
                                    {file.metadata?.size ? `${Math.round(file.metadata.size / 1024)} KB` : 'Arquivo armazenado'} • Atualizado recentemente
                                  </span>
                                </div>
                              </div>

                              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                                {file.name.endsWith('.json') ? 'JSON' : file.name.endsWith('.csv') ? 'CSV' : 'TXT'}
                              </span>
                            </div>
                          ))}

                          {storageData?.rootFiles?.filter((f: any) => f.name !== 'protocolos').map((file: any) => (
                            <div key={file.id || file.name} className="p-3 px-4 flex items-center justify-between hover:bg-slate-50 text-xs transition">
                              <div className="flex items-center gap-3">
                                <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg">
                                  <FileText className="w-4 h-4 text-slate-600" />
                                </div>
                                <div>
                                  <span className="font-mono font-bold text-slate-800 block">{file.name}</span>
                                  <span className="text-[10px] text-slate-400">
                                    {file.metadata?.size ? `${Math.round(file.metadata.size / 1024)} KB` : 'Arquivo'}
                                  </span>
                                </div>
                              </div>

                              <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-700">
                                {file.name.endsWith('.json') ? 'JSON' : file.name.endsWith('.csv') ? 'CSV' : 'TXT'}
                              </span>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* MATRIX TABLE VIEW */
                <>
                  {/* 2. CENTRAL DE EXPORTAÇÃO DE DADOS */}
                  <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        Central de Exportação de Dados Diagnósticos
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Extraia todas as respostas ativas enviadas até o momento em formato CSV estruturado para planilhas.
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
                      <button
                        id="btn-admin-export-csv"
                        type="button"
                        onClick={() => exportSubmissionsToCsv(submissions)}
                        className="flex-1 sm:flex-initial px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold transition flex items-center justify-center gap-2 shadow-xs cursor-pointer active:scale-98"
                      >
                        <Download className="w-4 h-4" />
                        <span>📥 BAIXAR RELATÓRIO COMPLETO (CSV/EXCEL)</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => exportTrackingMatrixCsv(submissions)}
                        className="flex-1 sm:flex-initial px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-slate-300 cursor-pointer"
                        title="Exportar tabela de status e acompanhamento"
                      >
                        <FileSpreadsheet className="w-3.5 h-3.5 text-slate-600" />
                        <span>Exportar Matriz</span>
                      </button>

                      <button
                        type="button"
                        onClick={refreshSubmissions}
                        className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl border border-slate-200 transition cursor-pointer"
                        title="Recarregar dados do Supabase"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 3. MATRIZ DE ACOMPANHAMENTO POR SETOR */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                    {/* Table Control Bar */}
                    <div className="p-4 border-b border-slate-100 bg-white flex flex-col md:flex-row items-center justify-between gap-3">
                      {/* Search Bar */}
                      <div className="relative w-full md:w-80">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Buscar por escola, setor, responsável..."
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Filter Controls */}
                      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                        {/* Status filter */}
                        <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs">
                          <button
                            type="button"
                            onClick={() => setStatusFilter('ALL')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                              statusFilter === 'ALL'
                                ? 'bg-white text-blue-700 shadow-2xs'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            Todas ({totalSchools})
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatusFilter('DONE')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                              statusFilter === 'DONE'
                                ? 'bg-emerald-600 text-white shadow-2xs'
                                : 'text-emerald-700 hover:text-emerald-900'
                            }`}
                          >
                            Concluídas ({completedCount})
                          </button>
                          <button
                            type="button"
                            onClick={() => setStatusFilter('PENDING')}
                            className={`px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
                              statusFilter === 'PENDING'
                                ? 'bg-amber-600 text-white shadow-2xs'
                                : 'text-amber-700 hover:text-amber-900'
                            }`}
                          >
                            Pendentes ({pendingCount})
                          </button>
                        </div>

                        {/* Sector filter (Setores 1 a 11) */}
                        <select
                          value={sectorFilter}
                          onChange={(e) => setSectorFilter(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="ALL">Todos os Setores (1 a 11)</option>
                          {SECTORS_LIST.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>

                        {/* Offer filter */}
                        <select
                          value={offerFilter}
                          onChange={(e) => setOfferFilter(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="ALL">Todas as Ofertas</option>
                          <option value="EF">Ensino Fundamental (EF)</option>
                          <option value="EI">Educação Infantil (EI)</option>
                          <option value="AMBOS">Ambas (EI + EF)</option>
                        </select>
                      </div>
                    </div>

                {/* Tracking Table Matrix: [ ID | Setor | Nome da Escola | Responsável | Status | Ações ] */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-100/90 text-[11px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="py-3 px-3 w-12 text-center">ID</th>
                        <th className="py-3 px-3 w-24">Setor</th>
                        <th className="py-3 px-4">Nome da Escola</th>
                        <th className="py-3 px-4">Responsável</th>
                        <th className="py-3 px-3 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredMatrix.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="py-8 text-center text-slate-400 text-xs"
                          >
                            Nenhuma unidade escolar encontrada com os filtros selecionados.
                          </td>
                        </tr>
                      ) : (
                        filteredMatrix.map((unit) => {
                          const sub = submissions[unit.id];
                          const isDone = sub && sub.status === 'CONCLUÍDO';

                          return (
                            <tr
                              key={unit.id}
                              className={`hover:bg-slate-50/80 transition ${
                                isDone ? 'bg-emerald-50/25' : ''
                              }`}
                            >
                              {/* 1. ID */}
                              <td className="py-3 px-3 text-center font-mono font-bold text-slate-500">
                                {unit.id}
                              </td>

                              {/* 2. Setor */}
                              <td className="py-3 px-3">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200 text-slate-700 font-bold text-[11px]">
                                  <MapPin className="w-2.5 h-2.5 text-blue-600" />
                                  {unit.sector || '-'}
                                </span>
                              </td>

                              {/* 3. Nome da Escola */}
                              <td className="py-3 px-4">
                                <div className="font-bold text-slate-900 leading-snug">
                                  {unit.name}
                                </div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                  <span>
                                    Oferta:{' '}
                                    <strong className="text-slate-600 font-semibold">
                                      {unit.offer === 'AMBOS'
                                        ? 'EI + EF I'
                                        : unit.offer}
                                    </strong>
                                  </span>
                                  <span>• Login: <code>{unit.login}</code></span>
                                </div>
                              </td>

                              {/* 4. Responsável */}
                              <td className="py-3 px-4">
                                {isDone ? (
                                  <div>
                                    <div className="font-bold text-slate-900 truncate max-w-[200px]">
                                      {sub.respondentName}
                                    </div>
                                    <div className="text-[10px] text-slate-500 flex items-center gap-2">
                                      <span>
                                        {sub.respondentRole ===
                                        'PROFESSOR_CO_RESPONSAVEL'
                                          ? 'Prof. Co-Responsável'
                                          : 'Diretor'}
                                      </span>
                                      {sub.elapsedTimeFormatted && (
                                        <span className="text-blue-700 font-mono font-semibold">
                                          ({sub.elapsedTimeFormatted})
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-slate-400 italic">
                                    Não iniciado
                                  </span>
                                )}
                              </td>

                              {/* 5. Status */}
                              <td className="py-3 px-3 text-center">
                                {isDone ? (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                    CONCLUÍDO
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                                    <Clock className="w-3 h-3 text-amber-600" />
                                    PENDENTE
                                  </span>
                                )}
                              </td>

                              {/* 6. Ações: [ 🗑️ EXCLUIR RESPOSTAS / REABRIR ACESSO ] */}
                              <td className="py-3 px-4 text-right">
                                {isDone ? (
                                  <div className="inline-flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      onClick={() => setInspectingRecord(sub)}
                                      className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 transition flex items-center gap-1 text-[11px] font-bold border border-blue-200 cursor-pointer"
                                      title="Visualizar Respostas Enviadas"
                                    >
                                      <Eye className="w-3.5 h-3.5" />
                                      <span className="hidden xl:inline">Ver</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => setDeleteConfirmUnit(unit)}
                                      className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 hover:text-rose-800 transition flex items-center gap-1 text-[11px] font-bold border border-rose-200 shadow-2xs cursor-pointer active:scale-98"
                                      title="Excluir Respostas e Reabrir Acesso no Supabase"
                                    >
                                      <Trash2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                      <span>EXCLUIR RESPOSTAS / REABRIR ACESSO</span>
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-slate-400 font-medium">
                                    Aguardando envio
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 px-6 py-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>
            Secretaria Municipal de Educação de Pindamonhangaba — GT Indicadores © 2026
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold transition cursor-pointer"
          >
            Fechar Painel
          </button>
        </div>
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO E REABERTURA DE ACESSO */}
      {deleteConfirmUnit && (
        <div className="fixed inset-0 z-70 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-rose-200 overflow-hidden animate-scale-up">
            <div className="bg-rose-600 text-white p-5 flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-rose-200 font-bold block">
                  Ação Crítica de Gabinete
                </span>
                <h3 className="text-base font-extrabold">
                  Exclusão de Respostas e Reabertura
                </h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-rose-50 rounded-xl border border-rose-200 text-rose-950 text-xs sm:text-sm leading-relaxed">
                <p className="font-semibold text-rose-900 mb-2">
                  Tem certeza que deseja apagar os dados enviados pela unidade{' '}
                  <span className="font-black text-rose-950 underline">
                    {deleteConfirmUnit.name}
                  </span>
                  ?
                </p>
                <p className="text-rose-800">
                  Esta ação liberará a escola para preencher o questionário novamente.
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-1.5 text-slate-700">
                <div className="font-bold text-slate-800 mb-1">
                  Operações que serão executadas no Supabase:
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <code>DELETE FROM respostas_questionario WHERE unidade_id = '{deleteConfirmUnit.id}'</code>
                </div>
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <code>UPDATE unidades_escolares SET status = 'PENDENTE' WHERE id = '{deleteConfirmUnit.id}'</code>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeleteConfirmUnit(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDeleteAndReopen}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold transition flex items-center gap-2 shadow-md cursor-pointer active:scale-98 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                      <span>Processando no Supabase...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Confirmar Exclusão e Reabrir</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* INSPECT SUBMISSION DETAILS MODAL */}
      {inspectingRecord && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col">
            <div className="bg-slate-900 text-white p-4 rounded-t-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono text-blue-400 uppercase font-bold">
                  Comprovante de Envio Homologado
                </span>
                <h3 className="text-base font-bold">
                  {inspectingRecord.schoolName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectingRecord(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">
                    Protocolo
                  </span>
                  <span className="font-mono font-bold text-slate-900">
                    {inspectingRecord.protocolNumber}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">
                    Responsável
                  </span>
                  <span className="font-bold text-slate-900">
                    {inspectingRecord.respondentName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">
                    Cargo
                  </span>
                  <span className="font-bold text-slate-900">
                    {inspectingRecord.respondentRole ===
                    'PROFESSOR_CO_RESPONSAVEL'
                      ? 'Prof. Co-Responsável'
                      : 'Diretor'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block uppercase font-bold">
                    Tempo Decorrido
                  </span>
                  <span className="font-mono font-bold text-blue-700">
                    {inspectingRecord.elapsedTimeFormatted}
                  </span>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 bg-white">
                <h4 className="font-bold text-slate-800 mb-2">
                  Dados Gerais Registrados (JSON):
                </h4>
                <pre className="bg-slate-900 text-slate-100 p-4 rounded-lg font-mono text-[11px] overflow-x-auto max-h-60">
                  {JSON.stringify(inspectingRecord.formData, null, 2)}
                </pre>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-b-2xl border-t border-slate-200 flex justify-between items-center">
              <button
                type="button"
                onClick={() => {
                  const unit = OFFICIAL_SCHOOL_UNITS.find(
                    (u) => u.id === inspectingRecord.schoolId
                  );
                  setInspectingRecord(null);
                  if (unit) setDeleteConfirmUnit(unit);
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Excluir e Reabrir esta Unidade</span>
              </button>

              <button
                type="button"
                onClick={() => setInspectingRecord(null)}
                className="px-4 py-1.5 bg-slate-800 text-white rounded-lg text-xs font-bold hover:bg-slate-900"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
