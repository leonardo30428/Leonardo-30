import React, { useState, useRef, useEffect } from 'react';
import { 
  Wallet, 
  Bell,
  Sun,
  Moon,
  Smartphone,
  Check
} from 'lucide-react';
import { useTheme, ThemeMode } from '../context/ThemeContext';

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
  const { themeMode, isDark, setThemeMode } = useTheme();
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (themeMenuRef.current && !themeMenuRef.current.contains(event.target as Node)) {
        setIsThemeMenuOpen(false);
      }
    };
    if (isThemeMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isThemeMenuOpen]);

  const themeOptions: { id: ThemeMode; label: string; icon: React.ReactNode; desc: string }[] = [
    {
      id: 'system',
      label: 'Padrão do Aparelho',
      desc: 'Segue o tema do seu celular ou computador',
      icon: <Smartphone className="w-4 h-4 text-emerald-500" />,
    },
    {
      id: 'light',
      label: 'Tema Claro',
      desc: 'Fundo branco limpo com alto contraste',
      icon: <Sun className="w-4 h-4 text-amber-500" />,
    },
    {
      id: 'dark',
      label: 'Tema Escuro',
      desc: 'Tons escuros confortáveis para a visão',
      icon: <Moon className="w-4 h-4 text-indigo-400" />,
    },
  ];

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

          {/* Clean Action Buttons: Theme Switcher & Notifications */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            
            {/* Theme Switcher Button & Dropdown */}
            <div className="relative" ref={themeMenuRef}>
              <button
                id="header-theme-toggle-btn"
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 rounded-xl transition-colors border border-slate-200/70 dark:border-slate-700 text-xs font-semibold cursor-pointer"
                title="Escolher Tema: Padrão do Aparelho, Escuro ou Claro"
                aria-label="Selecionar tema visual"
              >
                {themeMode === 'system' ? (
                  <>
                    <Smartphone className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="hidden md:inline text-[11px] text-slate-600 dark:text-slate-300">Padrão</span>
                  </>
                ) : themeMode === 'dark' ? (
                  <>
                    <Moon className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                    <span className="hidden md:inline text-[11px] text-slate-600 dark:text-slate-300">Escuro</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span className="hidden md:inline text-[11px] text-slate-600 dark:text-slate-300">Claro</span>
                  </>
                )}
              </button>

              {/* Theme Dropdown Menu */}
              {isThemeMenuOpen && (
                <div 
                  id="theme-dropdown-menu"
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-2 z-50 animate-fadeIn"
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 mb-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">Aparência do Aplicativo</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">Escolha o tema de exibição</p>
                  </div>

                  <div className="space-y-1">
                    {themeOptions.map((opt) => {
                      const isSelected = themeMode === opt.id;
                      return (
                        <button
                          key={opt.id}
                          id={`theme-option-${opt.id}`}
                          onClick={() => {
                            setThemeMode(opt.id);
                            setIsThemeMenuOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                            isSelected 
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200 font-bold' 
                              : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="shrink-0 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                              {opt.icon}
                            </div>
                            <div className="min-w-0">
                              <span className="text-xs block leading-tight truncate">{opt.label}</span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400 block truncate mt-0.5">{opt.desc}</span>
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 ml-1.5 stroke-[2.5]" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

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
