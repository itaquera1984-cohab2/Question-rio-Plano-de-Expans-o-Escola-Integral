import React, { useState } from 'react';
import {
  OfficialSchoolUnit,
  RespondentRole,
  EducationSphere,
} from '../types/questionnaire';
import {
  OFFICIAL_SCHOOL_UNITS,
  findSchoolById,
  findSchoolByLogin,
  validateSchoolCredentials,
  normalizeText,
  SECTORS_LIST,
} from '../data/schoolsData';
import {
  isSchoolSubmitted,
  getSubmissionForSchool,
} from '../utils/submissionRegistry';
import { validateSchoolViaSupabase } from '../utils/supabaseClient';
import {
  Building2,
  Lock,
  UserCheck,
  Mail,
  Phone,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  Eye,
  EyeOff,
  AlertTriangle,
  School,
  KeyRound,
  Layers,
  Settings,
  HelpCircle,
  Loader2,
  MapPin,
} from 'lucide-react';

interface AuthLoginScreenProps {
  onLoginSuccess: (payload: {
    unit: OfficialSchoolUnit;
    role: RespondentRole;
    respondentName: string;
    respondentEmail: string;
    respondentPhone: string;
    startTime: string;
    startTimestamp: number;
  }) => void;
  onOpenAdmin: () => void;
  onOpenHelp: () => void;
}

export const AuthLoginScreen: React.FC<AuthLoginScreenProps> = ({
  onLoginSuccess,
  onOpenAdmin,
  onOpenHelp,
}) => {
  // Step 1: Sector
  const [selectedSector, setSelectedSector] = useState<string>('Setor 1');
  // Step 2: School
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('');
  // Step 3 & 4: Login & Password
  const [loginInput, setLoginInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  // Step 5: Cargo do Respondente (Strictly 2 options)
  const [respondentRole, setRespondentRole] = useState<RespondentRole>('DIRETOR');
  // Step 6: Nome Completo & Contato
  const [respondentName, setRespondentName] = useState<string>('');
  const [respondentEmail, setRespondentEmail] = useState<string>('');
  const [respondentPhone, setRespondentPhone] = useState<string>('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lockedSchoolError, setLockedSchoolError] = useState<{
    schoolName: string;
    submissionDate?: string;
    protocolNumber?: string;
  } | null>(null);

  // Filter schools strictly by selected sector
  const schoolsInSector = OFFICIAL_SCHOOL_UNITS.filter(
    (u) => u.sector === selectedSector
  );

  // Auto-detect school by typed login
  const recognizedSchool = React.useMemo(() => {
    if (!loginInput.trim() || loginInput.trim().length < 2) return null;
    return findSchoolByLogin(loginInput.trim());
  }, [loginInput]);

  const handleSectorChange = (newSector: string) => {
    setSelectedSector(newSector);
    setSelectedSchoolId('');
    setLoginInput('');
    setPasswordInput('');
    setErrorMessage(null);
    setLockedSchoolError(null);
  };

  const handleSelectSchool = (unit: OfficialSchoolUnit) => {
    setSelectedSchoolId(unit.id);
    if (unit.sector && unit.sector !== selectedSector) {
      setSelectedSector(unit.sector);
    }
    setLoginInput(unit.login);
    setErrorMessage(null);
    setLockedSchoolError(null);

    // Check if already completed locally or in registry
    if (isSchoolSubmitted(unit.id)) {
      const sub = getSubmissionForSchool(unit.id);
      setLockedSchoolError({
        schoolName: unit.name,
        submissionDate: sub?.submissionDate,
        protocolNumber: sub?.protocolNumber,
      });
    }
  };

  const handleLoginInputChange = (val: string) => {
    setLoginInput(val);
    setErrorMessage(null);
    const matched = findSchoolByLogin(val);
    if (matched) {
      if (matched.sector && matched.sector !== selectedSector) {
        setSelectedSector(matched.sector);
      }
      setSelectedSchoolId(matched.id);
      if (isSchoolSubmitted(matched.id)) {
        const sub = getSubmissionForSchool(matched.id);
        setLockedSchoolError({
          schoolName: matched.name,
          submissionDate: sub?.submissionDate,
          protocolNumber: sub?.protocolNumber,
        });
      } else {
        setLockedSchoolError(null);
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLockedSchoolError(null);

    let effectiveSchoolId = selectedSchoolId;
    let effectiveSector = selectedSector;

    // Auto-resolve school if user typed a valid school login
    if (!effectiveSchoolId && loginInput.trim()) {
      const matched = findSchoolByLogin(loginInput.trim());
      if (matched) {
        effectiveSchoolId = matched.id;
        effectiveSector = matched.sector || selectedSector;
        setSelectedSchoolId(matched.id);
        setSelectedSector(effectiveSector);
      }
    }

    if (!effectiveSchoolId) {
      setErrorMessage('Por favor, selecione a sua Unidade Escolar ou informe o Login correto.');
      return;
    }

    if (!loginInput.trim()) {
      setErrorMessage('Informe o Login da Unidade Escolar.');
      return;
    }

    if (!passwordInput.trim()) {
      setErrorMessage('Informe a Senha de Acesso da Unidade.');
      return;
    }

    if (!respondentName.trim()) {
      setErrorMessage('Informe o Nome Completo do Respondente.');
      return;
    }

    if (!respondentEmail.trim()) {
      setErrorMessage('Informe o E-mail de Contato do Respondente.');
      return;
    }

    if (!respondentPhone.trim()) {
      setErrorMessage('Informe o Telefone / WhatsApp do Respondente.');
      return;
    }

    setIsLoading(true);

    try {
      // 1. Supabase Validation:
      const res = await validateSchoolViaSupabase({
        schoolId: effectiveSchoolId,
        login: loginInput,
        senha: passwordInput,
        sector: effectiveSector,
      });

      if (res.isCompleted) {
        setLockedSchoolError({
          schoolName: res.unit?.name || 'Unidade Escolar',
          protocolNumber: res.submissionInfo?.protocolNumber,
          submissionDate: res.submissionInfo?.submissionDate,
        });
        setIsLoading(false);
        return;
      }

      if (!res.success || !res.unit) {
        setErrorMessage(
          res.error ||
            'Login ou Senha incorretos para a unidade selecionada. Tente novamente.'
        );
        setIsLoading(false);
        return;
      }

      // Check local submission registry as well
      if (isSchoolSubmitted(res.unit.id)) {
        const sub = getSubmissionForSchool(res.unit.id);
        setLockedSchoolError({
          schoolName: res.unit.name,
          submissionDate: sub?.submissionDate,
          protocolNumber: sub?.protocolNumber,
        });
        setIsLoading(false);
        return;
      }

      // Capture session start time & unlock form
      const now = new Date();
      const startTimeFormatted = now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      const startTimestamp = now.getTime();

      onLoginSuccess({
        unit: res.unit,
        role: respondentRole,
        respondentName: respondentName.trim(),
        respondentEmail: respondentEmail.trim(),
        respondentPhone: respondentPhone.trim(),
        startTime: startTimeFormatted,
        startTimestamp,
      });
    } catch (err: any) {
      console.error('Login error:', err);
      // Fallback local check
      const localVal = validateSchoolCredentials(
        effectiveSchoolId,
        loginInput,
        passwordInput
      );
      if (!localVal.success || !localVal.unit) {
        setErrorMessage(
          localVal.error || 'Login ou Senha incorretos para a unidade selecionada. Tente novamente.'
        );
      } else {
        const now = new Date();
        const startTimeFormatted = now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        });
        onLoginSuccess({
          unit: localVal.unit,
          role: respondentRole,
          respondentName: respondentName.trim(),
          respondentEmail: respondentEmail.trim(),
          respondentPhone: respondentPhone.trim(),
          startTime: startTimeFormatted,
          startTimestamp: now.getTime(),
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectedUnit = selectedSchoolId
    ? findSchoolById(selectedSchoolId)
    : undefined;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-200 text-slate-900 flex flex-col justify-between antialiased">
      {/* Top Header Permanent Bar */}
      <div id="login-top-bar" className="w-full bg-[#003366] text-white py-3 px-4 sm:px-8 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs sm:text-sm font-extrabold tracking-wide uppercase">
              [ SISTEMA DE DIAGNÓSTICO EDUCACIONAL - SME PINDAMONHANGABA ]
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenHelp}
              className="px-2.5 py-1.5 rounded-lg text-xs text-white/80 hover:text-white hover:bg-white/10 transition flex items-center gap-1 font-medium cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Orientações</span>
            </button>

            <button
              id="btn-login-admin"
              type="button"
              onClick={onOpenAdmin}
              className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-amber-300 text-xs font-bold transition flex items-center gap-1.5 border border-amber-300/40 shadow-xs cursor-pointer"
            >
              <span>⚙️ Restrito Admin</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Authentication Container */}
      <div className="max-w-4xl w-full mx-auto px-4 py-8">
        {/* Header Institutional Card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-6 text-center">
          <div className="flex justify-center mb-3">
            <img
              alt="Brasão de Pindamonhangaba"
              src="/brasao.png"
              className="h-16 w-auto object-contain"
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#003366] uppercase tracking-tight">
            Prefeitura Municipal de Pindamonhangaba
          </h1>
          <h2 className="text-sm sm:text-base font-bold text-slate-700 mt-1">
            Secretaria Municipal de Educação — Grupo de Trabalho (GT)
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl mx-auto">
            Autenticação individualizada com controle de acesso por setor para as <strong>67 unidades escolares</strong> da rede municipal. 
            Módulo conectado ao banco de dados Supabase (PostgreSQL).
          </p>
        </div>

        {/* Lock Alert Banner if school already completed */}
        {lockedSchoolError && (
          <div className="mb-6 p-5 rounded-2xl bg-amber-50 border-2 border-amber-400 text-amber-950 shadow-sm animate-shake">
            <div className="flex items-start gap-3.5">
              <div className="p-2 bg-amber-200/80 rounded-xl shrink-0 mt-0.5">
                <AlertTriangle className="w-6 h-6 text-amber-800" />
              </div>
              <div className="flex-1 text-xs sm:text-sm">
                <h3 className="font-extrabold text-amber-900 text-sm sm:text-base mb-1">
                  Atenção: A unidade {lockedSchoolError.schoolName} já enviou as respostas deste questionário.
                </h3>
                <p className="text-amber-800 leading-relaxed">
                  Para alterações de dados enviados, entre em contato com o <strong>Gabinete GT SME para solicitar a liberação de refazimento</strong>.
                </p>
                {lockedSchoolError.protocolNumber && (
                  <div className="mt-2.5 inline-flex items-center gap-2 bg-white/90 border border-amber-300 px-3 py-1.5 rounded-lg text-xs font-mono text-amber-900 font-bold">
                    <span>Protocolo: {lockedSchoolError.protocolNumber}</span>
                    {lockedSchoolError.submissionDate && (
                      <span className="text-amber-700 font-normal">
                        ({lockedSchoolError.submissionDate})
                      </span>
                    )}
                  </div>
                )}
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={onOpenAdmin}
                    className="px-3 py-1.5 bg-amber-800 text-white rounded-lg text-xs font-bold hover:bg-amber-900 transition flex items-center gap-1 cursor-pointer"
                  >
                    <span>Área Administrativa (Gabinete)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSchoolId('');
                      setLoginInput('');
                      setPasswordInput('');
                      setLockedSchoolError(null);
                    }}
                    className="px-3 py-1.5 bg-white text-amber-900 border border-amber-300 rounded-lg text-xs font-bold hover:bg-amber-100 transition cursor-pointer"
                  >
                    Escolher Outra Escola
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs sm:text-sm font-semibold flex items-center gap-2.5 shadow-2xs">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Authentication Form */}
        <form onSubmit={handleFormSubmit} className="space-y-5">
          {/* Item 1: Setor Escolar */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                Setor Escolar Municipal
              </h3>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                Selecione o seu Setor (1, 2, 3, 4, 5, 6, 7, 9, 10 ou 11) <span className="text-rose-500">*</span>
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {SECTORS_LIST.map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => handleSectorChange(sec)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center cursor-pointer ${
                      selectedSector === sec
                        ? 'bg-[#003366] text-white border-[#003366] shadow-xs scale-[1.02]'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {sec}
                  </button>
                ))}
              </div>
              <span className="text-[11px] text-slate-500 mt-2 block">
                Setor ativo: <strong>{selectedSector}</strong> ({schoolsInSector.length} unidades escolares cadastradas neste setor)
              </span>
            </div>
          </div>

          {/* Item 2: Unidade Escolar */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                Unidade Escolar (Filtrada por {selectedSector})
              </h3>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                Selecione sua Escola / CMEI <span className="text-rose-500">*</span>
              </label>

              <select
                value={selectedSchoolId}
                onChange={(e) => {
                  const unit = findSchoolById(e.target.value);
                  if (unit) handleSelectSchool(unit);
                  else setSelectedSchoolId('');
                }}
                className="w-full px-3.5 py-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white text-slate-900 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 transition cursor-pointer"
              >
                <option value="">-- Selecione sua unidade escolar --</option>
                {schoolsInSector.map((school) => {
                  const isDone = isSchoolSubmitted(school.id);
                  return (
                    <option key={school.id} value={school.id}>
                      {school.id} - {school.name} ({school.offer === 'AMBOS' ? 'EI + EF I' : school.offer}) {isDone ? ' [CONCLUÍDO]' : ''}
                    </option>
                  );
                })}
              </select>

              {selectedUnit && (
                <div className="p-3.5 bg-blue-50/80 rounded-xl border border-blue-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <School className="w-4 h-4 text-blue-700 shrink-0" />
                    <span className="text-slate-900 font-bold">
                      {selectedUnit.name}
                    </span>
                    <span className="bg-[#003366] text-white font-bold px-2 py-0.5 rounded text-[10px]">
                      Oferta: {selectedUnit.offer === 'AMBOS' ? 'EI + EF I' : selectedUnit.offer === 'EI' ? 'Educação Infantil (EI)' : 'Ensino Fundamental I (EF I)'}
                    </span>
                  </div>
                  <div className="text-slate-600 text-[11px]">
                    {selectedUnit.sector} • {selectedUnit.neighborhood}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Item 3 & 4: Login da Unidade e Senha */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  Login e Senha da Unidade Escolar
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                  Login da Unidade <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={loginInput}
                  onChange={(e) => handleLoginInputChange(e.target.value)}
                  placeholder="Ex: Angelo, Montoro, Dulce, Ayrton..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm font-semibold bg-white"
                />

                {recognizedSchool && (
                  <div className="mt-1.5 p-2 bg-emerald-50 border border-emerald-300 rounded-lg text-[11px] text-emerald-800 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      Unidade identificada: <strong>{recognizedSchool.name}</strong> ({recognizedSchool.sector})
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5 text-blue-600" />
                  Senha de Acesso <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Ex: Angelo@2026"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm font-semibold bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Padrão institucional: <code>Login@2026</code> (Ex: <code>Angelo@2026</code>)
                </span>
              </div>
            </div>
          </div>

          {/* Item 5 & 6: Cargo do Respondente e Identificação */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 mb-4">
              <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                4
              </div>
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                Identificação do Respondente Oficial
              </h3>
            </div>

            {/* Cargo do Respondente - Strict 2 options */}
            <div className="mb-5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Cargo do Respondente (Restrito a 2 opções) <span className="text-rose-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex items-center gap-3 ${
                    respondentRole === 'DIRETOR'
                      ? 'border-blue-600 bg-blue-50/80 text-blue-950 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="respondentRole"
                    value="DIRETOR"
                    checked={respondentRole === 'DIRETOR'}
                    onChange={() => setRespondentRole('DIRETOR')}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-bold text-xs sm:text-sm">[1] Diretor(a)</div>
                    <div className="text-[11px] text-slate-500">Gestor(a) titular da Unidade Escolar</div>
                  </div>
                </label>

                <label
                  className={`p-3.5 rounded-xl border-2 cursor-pointer transition flex items-center gap-3 ${
                    respondentRole === 'PROFESSOR_CO_RESPONSAVEL'
                      ? 'border-blue-600 bg-blue-50/80 text-blue-950 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="respondentRole"
                    value="PROFESSOR_CO_RESPONSAVEL"
                    checked={respondentRole === 'PROFESSOR_CO_RESPONSAVEL'}
                    onChange={() => setRespondentRole('PROFESSOR_CO_RESPONSAVEL')}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-bold text-xs sm:text-sm">[2] Professor(a) Co-Responsável</div>
                    <div className="text-[11px] text-slate-500">Docente indicado para co-preenchimento oficial</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Informações Pessoais */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                  Nome Completo <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={respondentName}
                  onChange={(e) => setRespondentName(e.target.value)}
                  placeholder="Ex: Profª Maria da Silva"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                  E-mail de Contato <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={respondentEmail}
                  onChange={(e) => setRespondentEmail(e.target.value)}
                  placeholder="exemplo@pindamonhangaba.sp.gov.br"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5 flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-blue-600" />
                  WhatsApp / Telefone <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={respondentPhone}
                  onChange={(e) => setRespondentPhone(e.target.value)}
                  placeholder="(12) 99999-9999"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 text-sm bg-white"
                />
              </div>
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="text-xs text-slate-500 text-center sm:text-left">
              Ao iniciar a sessão, o horário de início (HH:MM:SS) será registrado e o formulário liberado.
            </div>

            <button
              id="btn-auth-submit"
              type="submit"
              disabled={isLoading || !!lockedSchoolError}
              className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-extrabold text-sm text-white transition flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                isLoading || lockedSchoolError
                  ? 'bg-slate-400 cursor-not-allowed opacity-70'
                  : 'bg-[#003366] hover:bg-[#002244] active:scale-[0.99]'
              }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Validando no Supabase...</span>
                </>
              ) : (
                <>
                  <span>Autenticar e Iniciar Questionário</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Footer Info */}
      <footer className="w-full py-4 text-center text-xs text-slate-500 border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Secretaria Municipal de Educação de Pindamonhangaba © 2026 — Grupo de Trabalho (GT)</span>
          <button
            type="button"
            onClick={onOpenAdmin}
            className="text-slate-700 hover:text-slate-900 font-bold underline flex items-center gap-1 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            Acesso Restrito Gabinete / GT
          </button>
        </div>
      </footer>
    </div>
  );
};
