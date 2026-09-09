import React, { useState } from 'react';
import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2, X } from 'lucide-react';
import { changeSchoolPassword } from '../utils/supabaseClient';

interface ChangePasswordModalProps {
  isOpen: boolean;
  schoolId: string;
  schoolLogin: string;
  schoolName: string;
  onClose: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  schoolId,
  schoolLogin,
  schoolName,
  onClose,
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const close = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmation('');
    setError('');
    setSuccess(false);
    onClose();
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (newPassword !== confirmation) {
      setError('A confirmação não corresponde à nova senha.');
      return;
    }
    setIsSaving(true);
    const result = await changeSchoolPassword({ schoolId, login: schoolLogin, currentPassword, newPassword });
    setIsSaving(false);
    if (!result.success) {
      setError(result.error || 'Não foi possível alterar a senha.');
      return;
    }
    setSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmation('');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/60 p-4" role="dialog" aria-modal="true" aria-labelledby="change-password-title">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 p-5">
          <div className="flex gap-3">
            <div className="rounded-xl bg-emerald-100 p-2 text-emerald-700"><KeyRound className="h-5 w-5" /></div>
            <div>
              <h2 id="change-password-title" className="font-bold text-slate-900">Alterar senha de acesso</h2>
              <p className="mt-1 text-xs text-slate-500">{schoolName}</p>
            </div>
          </div>
          <button type="button" onClick={close} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100" aria-label="Fechar"><X className="h-5 w-5" /></button>
        </div>

        {success ? (
          <div className="p-6 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
            <p className="mt-3 font-bold text-slate-900">Senha alterada com sucesso.</p>
            <p className="mt-1 text-sm text-slate-600">Use a nova senha no próximo acesso.</p>
            <button type="button" onClick={close} className="mt-5 rounded-lg bg-emerald-700 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-800">Concluir</button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4 p-6">
            <p className="rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-600">
              A nova senha deve ter ao menos 10 caracteres, incluindo letra maiúscula, letra minúscula, número e caractere especial.
            </p>
            {[
              ['Senha atual', currentPassword, setCurrentPassword],
              ['Nova senha', newPassword, setNewPassword],
              ['Confirmar nova senha', confirmation, setConfirmation],
            ].map(([label, value, setter]) => (
              <label key={label as string} className="block text-sm font-semibold text-slate-700">
                {label as string}
                <div className="relative mt-1.5">
                  <input required type={showPasswords ? 'text' : 'password'} value={value as string} onChange={(e) => (setter as React.Dispatch<React.SetStateAction<string>>)(e.target.value)} autoComplete="new-password" className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-10 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" />
                </div>
              </label>
            ))}
            <button type="button" onClick={() => setShowPasswords((value) => !value)} className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900">
              {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showPasswords ? 'Ocultar senhas' : 'Mostrar senhas'}
            </button>
            {error && <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p>}
            <button disabled={isSaving} type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-60">
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {isSaving ? 'Salvando...' : 'Salvar nova senha'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
