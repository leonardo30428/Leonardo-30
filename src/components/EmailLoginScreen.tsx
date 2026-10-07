import React, { useState } from 'react';
import { 
  Mail, 
  User, 
  ArrowRight, 
  Wallet, 
  Sparkles, 
  ShieldCheck, 
  CreditCard,
  Trash2
} from 'lucide-react';
import { UserProfile } from '../types';

interface EmailLoginScreenProps {
  onLogin: (email: string, name?: string) => void;
  existingProfiles: UserProfile[];
  onDeleteProfile?: (profileId: string) => void;
}

export const EmailLoginScreen: React.FC<EmailLoginScreenProps> = ({
  onLogin,
  existingProfiles,
  onDeleteProfile,
}) => {
  const [emailInput, setEmailInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Por favor, informe seu e-mail para acessar.');
      return;
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Por favor, informe um endereço de e-mail válido.');
      return;
    }

    onLogin(cleanEmail, nameInput.trim());
  };

  const handleQuickSelect = (profile: UserProfile) => {
    if (profile.email) {
      onLogin(profile.email, profile.name);
    } else {
      onLogin(`${profile.id}@finansmart.app`, profile.name);
    }
  };

  return (
    <div 
      id="tela-login-email-usuario"
      className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden"
    >
      {/* Luzes de fundo sutis */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10 animate-fadeIn">
        
        {/* Cabeçalho da Aplicação */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-teal-500 to-indigo-600 text-white shadow-xl shadow-teal-500/20 mb-2">
            <Wallet className="w-8 h-8 stroke-[2.2]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            FinanSmart
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 font-medium max-w-xs mx-auto">
            Cada usuário possui suas próprias contas, cartões e movimentações isoladas.
          </p>
        </div>

        {/* Card Principal de Login com E-mail */}
        <div className="bg-slate-800/80 backdrop-blur-md rounded-3xl p-6 sm:p-7 border border-slate-700/80 shadow-2xl space-y-5">
          <div className="border-b border-slate-700/60 pb-3">
            <h2 className="text-base sm:text-lg font-black text-white">
              Acessar com seu E-mail
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Informe seu e-mail para carregar suas contas e finanças.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold animate-fadeIn">
                {error}
              </div>
            )}

            {/* Campo E-mail */}
            <div className="space-y-1.5">
              <label 
                htmlFor="input-login-email" 
                className="text-xs font-bold text-slate-300 flex items-center justify-between"
              >
                <span>E-mail do Usuário *</span>
                <span className="text-[10px] text-teal-400 font-semibold">Identifica seu perfil</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="input-login-email"
                  type="email"
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="ex: seuemail@gmail.com"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm font-semibold placeholder-slate-500 focus:outline-hidden focus:border-teal-400 focus:ring-1 focus:ring-teal-400 transition-all"
                  autoFocus
                />
              </div>
            </div>

            {/* Campo Nome (Opcional) */}
            <div className="space-y-1.5">
              <label 
                htmlFor="input-login-name" 
                className="text-xs font-bold text-slate-300"
              >
                Nome ou Apelido (opcional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="input-login-name"
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Ex: Leonardo"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/90 border border-slate-700 text-white text-sm font-semibold placeholder-slate-500 focus:outline-hidden focus:border-teal-400 transition-all"
                />
              </div>
            </div>

            {/* Botão Entrar */}
            <button
              type="submit"
              id="btn-entrar-email"
              className="w-full py-3.5 px-4 rounded-xl bg-teal-500 hover:bg-teal-400 active:scale-98 text-slate-950 font-black text-sm shadow-lg shadow-teal-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Entrar / Acessar Contas</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Destaque de segurança de dados */}
          <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Dados isolados e salvos para o seu e-mail</span>
          </div>
        </div>

        {/* Lista de Perfis já salvos neste aparelho (Acesso Rápido) */}
        {existingProfiles.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-md rounded-3xl p-5 border border-slate-700/60 space-y-3">
            <div className="text-xs font-bold text-slate-300 flex items-center justify-between">
              <span>Perfis salvos neste aparelho:</span>
              <span className="text-[10px] text-slate-400">{existingProfiles.length} perfil(s)</span>
            </div>

            <div className="space-y-2">
              {existingProfiles.map((p) => {
                const initials = (p.name || p.email || 'U').slice(0, 2).toUpperCase();
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/70 hover:bg-slate-900 border border-slate-700/70 transition-all gap-3"
                  >
                    <div 
                      onClick={() => handleQuickSelect(p)}
                      className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                    >
                      <div 
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0 shadow-xs"
                        style={{ backgroundColor: p.color || '#0d9488' }}
                      >
                        {p.avatarEmoji || initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-bold text-white truncate">
                          {p.name}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {p.email || 'Perfil local'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleQuickSelect(p)}
                        className="px-3 py-1.5 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 font-bold text-xs transition-colors cursor-pointer"
                      >
                        Entrar
                      </button>
                      {onDeleteProfile && existingProfiles.length > 1 && (
                        <button
                          type="button"
                          onClick={() => onDeleteProfile(p.id)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Remover perfil deste aparelho"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
