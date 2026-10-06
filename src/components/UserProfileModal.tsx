import React, { useState } from 'react';
import { 
  X, 
  User, 
  Check, 
  Plus, 
  Trash2, 
  Edit3, 
  ShieldCheck, 
  Users,
  Sparkles
} from 'lucide-react';
import { UserProfile } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profiles: UserProfile[];
  activeProfileId: string;
  onSelectProfile: (profileId: string) => void;
  onCreateProfile: (profile: Omit<UserProfile, 'id' | 'createdAt'>) => void;
  onUpdateProfile: (profile: UserProfile) => void;
  onDeleteProfile: (profileId: string) => void;
}

const EMOJI_OPTIONS = ['👤', '💼', '🏠', '👩', '👨', '🌟', '💳', '🛒', '🎯', '🚀', '💰', '🏖️'];

const COLOR_OPTIONS = [
  { name: 'Esmeralda', hex: '#10b981' },
  { name: 'Índigo', hex: '#6366f1' },
  { name: 'Violeta', hex: '#8b5cf6' },
  { name: 'Rosa', hex: '#f43f5e' },
  { name: 'Azul Celeste', hex: '#0284c7' },
  { name: 'Âmbar', hex: '#f59e0b' },
  { name: 'Ardósia', hex: '#475569' },
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profiles,
  activeProfileId,
  onSelectProfile,
  onCreateProfile,
  onUpdateProfile,
  onDeleteProfile,
}) => {
  const [view, setView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);

  // Form states
  const [profileName, setProfileName] = useState('');
  const [profileEmoji, setProfileEmoji] = useState(EMOJI_OPTIONS[0]);
  const [profileColor, setProfileColor] = useState(COLOR_OPTIONS[0].hex);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setProfileName('');
    setProfileEmoji(EMOJI_OPTIONS[Math.floor(Math.random() * EMOJI_OPTIONS.length)]);
    setProfileColor(COLOR_OPTIONS[Math.floor(Math.random() * COLOR_OPTIONS.length)].hex);
    setErrorMessage('');
    setView('create');
  };

  const handleStartEdit = (profile: UserProfile) => {
    setEditingProfile(profile);
    setProfileName(profile.name);
    setProfileEmoji(profile.avatarEmoji || '👤');
    setProfileColor(profile.color || '#10b981');
    setErrorMessage('');
    setView('edit');
  };

  const handleSaveCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) {
      setErrorMessage('Por favor, informe o nome do perfil.');
      return;
    }

    onCreateProfile({
      name: profileName.trim(),
      avatarEmoji: profileEmoji,
      color: profileColor,
    });

    setView('list');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProfile) return;
    if (!profileName.trim()) {
      setErrorMessage('Por favor, informe o nome do perfil.');
      return;
    }

    onUpdateProfile({
      ...editingProfile,
      name: profileName.trim(),
      avatarEmoji: profileEmoji,
      color: profileColor,
    });

    setView('list');
  };

  const handleDelete = (id: string, name: string) => {
    if (profiles.length <= 1) {
      alert('Você precisa manter pelo menos 1 perfil ativo.');
      return;
    }

    if (confirm(`Tem certeza que deseja excluir o perfil "${name}"? Os lançamentos deste perfil serão removidos.`)) {
      onDeleteProfile(id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-200/60 dark:border-emerald-800/60">
              <Users className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
                {view === 'list' && 'Perfis de Usuário'}
                {view === 'create' && 'Novo Perfil'}
                {view === 'edit' && 'Editar Perfil'}
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {view === 'list' && 'Contas e lançamentos separados por pessoa'}
                {view === 'create' && 'Crie um perfil com contas próprias'}
                {view === 'edit' && 'Atualize o nome e aparência'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          
          {/* VIEW: LIST */}
          {view === 'list' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/60 rounded-2xl flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed font-medium">
                  Cada usuário possui suas <strong>próprias contas bancárias, cartões, despesas e receitas</strong>.
                  Ao alternar de perfil, os lançamentos mudam automaticamente!
                </p>
              </div>

              {/* Profiles List */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {profiles.map((profile) => {
                  const isActive = profile.id === activeProfileId;
                  return (
                    <div
                      key={profile.id}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                        isActive
                          ? 'bg-slate-50 dark:bg-slate-800/70 border-emerald-500/80 shadow-xs ring-1 ring-emerald-500/40'
                          : 'bg-white dark:bg-slate-900/60 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          onSelectProfile(profile.id);
                          onClose();
                        }}
                        className="flex items-center gap-3 text-left flex-1 min-w-0 cursor-pointer"
                      >
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg text-white shadow-xs shrink-0"
                          style={{ backgroundColor: profile.color || '#10b981' }}
                        >
                          {profile.avatarEmoji || '👤'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-slate-900 dark:text-white truncate">
                              {profile.name}
                            </span>
                            {isActive && (
                              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 shrink-0">
                                Ativo
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 dark:text-slate-500 block truncate">
                            {isActive ? 'Perfil atual em uso' : 'Clique para alternar para este perfil'}
                          </span>
                        </div>
                      </button>

                      {/* Actions: Edit & Delete */}
                      <div className="flex items-center gap-1 pl-2">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(profile)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="Editar perfil"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {profiles.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleDelete(profile.id, profile.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                            title="Excluir perfil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Add New Profile Button */}
              <button
                type="button"
                onClick={handleStartCreate}
                className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 text-slate-700 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-emerald-400 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Adicionar Novo Perfil de Usuário</span>
              </button>
            </div>
          )}

          {/* VIEW: CREATE or EDIT */}
          {(view === 'create' || view === 'edit') && (
            <form onSubmit={view === 'create' ? handleSaveCreate : handleSaveEdit} className="space-y-4">
              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-600 dark:text-rose-400">
                  {errorMessage}
                </div>
              )}

              {/* Preview Avatar */}
              <div className="flex flex-col items-center justify-center py-2">
                <div 
                  className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-md text-white border-2 border-white dark:border-slate-800 transition-all"
                  style={{ backgroundColor: profileColor }}
                >
                  {profileEmoji}
                </div>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-semibold">
                  Prévia do Perfil
                </span>
              </div>

              {/* Name Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Nome do Perfil / Usuário
                </label>
                <input
                  type="text"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Ex: Leonardo, Pessoal, Trabalho, Maria..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 text-slate-900 dark:text-white text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                  autoFocus
                />
              </div>

              {/* Emoji Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Ícone / Avatar
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {EMOJI_OPTIONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setProfileEmoji(emoji)}
                      className={`h-10 rounded-xl text-lg flex items-center justify-center border transition-all cursor-pointer ${
                        profileEmoji === emoji
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/50 scale-105 shadow-2xs'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Picker */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Cor de Identificação
                </label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {COLOR_OPTIONS.map((c) => (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setProfileColor(c.hex)}
                      className={`w-8 h-8 rounded-xl shrink-0 transition-all flex items-center justify-center cursor-pointer ${
                        profileColor === c.hex ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white scale-110' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {profileColor === c.hex && <Check className="w-4 h-4 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Voltar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                >
                  {view === 'create' ? 'Salvar Perfil' : 'Atualizar Perfil'}
                </button>
              </div>

            </form>
          )}

        </div>
      </div>
    </div>
  );
};
