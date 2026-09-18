import React from 'react';
import { 
  Wallet, 
  Bell
} from 'lucide-react';

interface HeaderProps {
  onOpenNewTransaction: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount: number;
  onNavigateHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenNewTransaction,
  onOpenNotifications,
  unreadNotificationsCount,
  onNavigateHome,
}) => {
  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          
          {/* Logo & Home Click */}
          <div 
            onClick={onNavigateHome}
            className="flex items-center gap-3 cursor-pointer select-none group"
            title="Ir para a Visão Geral"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs shadow-emerald-200 group-hover:bg-emerald-700 transition-colors">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">FinanSmart</span>
              <p className="text-[11px] text-slate-500 hidden sm:block">Controle e Planejamento Financeiro</p>
            </div>
          </div>

          {/* Clean Action Buttons: Notifications only */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Notifications Button */}
            <button
              id="header-notifications-btn"
              onClick={onOpenNotifications}
              className="p-2 sm:p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors relative border border-slate-200/70"
              title="Notificações e Lembretes"
            >
              <Bell className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
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
