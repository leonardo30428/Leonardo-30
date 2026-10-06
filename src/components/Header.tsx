import React from 'react';
import { 
  Wallet, 
  Bell,
  ChevronDown,
  User
} from 'lucide-react';
import { UserProfile } from '../types';

interface HeaderProps {
  onOpenNewTransaction: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  onNavigateHome?: () => void;
  activeProfile?: UserProfile;
  onOpenProfiles?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewTransaction,
  onOpenNotifications,
  unreadNotificationsCount,
  onNavigateHome,
  activeProfile,
  onOpenProfiles,
}) => {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-30 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo & Home Click */}
          <div 
            onClick={onNavigateHome}
            className="flex items-center gap-3 cursor-pointer select-none group"
            title="Ir para a Visão Geral"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs shadow-emerald-200 dark:shadow-none group-hover:bg-emerald-700 transition-colors">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">FinanSmart</span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">Controle e Planejamento Financeiro</p>
            </div>
          </div>

          {/* Action Buttons: User Profile Selector + Notifications */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* User Profile Selector Pill */}
            {activeProfile && (
              <button
                type="button"
                id="header-user-profile-btn"
                onClick={onOpenProfiles}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-slate-200/90 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all cursor-pointer group"
                title={`Perfil de usuário: ${activeProfile.name} (Clique para alternar ou criar perfis)`}
              >
                <div 
                  className="w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-lg flex items-center justify-center text-xs text-white shadow-2xs font-bold shrink-0"
                  style={{ backgroundColor: activeProfile.color || '#10b981' }}
                >
                  {activeProfile.avatarEmoji || <User className="w-3.5 h-3.5" />}
                </div>
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-100 max-w-[100px] sm:max-w-[140px] truncate">
                  {activeProfile.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors shrink-0" />
              </button>
            )}

            {/* Notifications Button */}
            <button
              id="header-notifications-btn"
              onClick={onOpenNotifications}
              className="p-2 sm:p-2.5 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 rounded-xl transition-colors relative border border-slate-200/70 dark:border-slate-700 cursor-pointer"
              title="Notificações e Lembretes"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700 dark:text-slate-300" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center shadow-xs">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
