import React from 'react';
import { Home, BarChart3, ArrowLeftRight, MoreHorizontal, Plus } from 'lucide-react';

export type AppTabType = 'planejamento' | 'balanceamento' | 'mais' | 'contas';

interface BottomNavBarProps {
  activeTab: AppTabType;
  onChangeTab: (tab: AppTabType) => void;
  onOpenNewTransaction: () => void;
  onViewPending: () => void;
  pendingCount: number;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({
  activeTab,
  onChangeTab,
  onOpenNewTransaction,
  onViewPending,
  pendingCount,
}) => {
  return (
    <nav 
      id="bottom-navigation-bar"
      aria-label="Navegação Principal"
      style={{ position: 'fixed', bottom: 0, left: 0, right: 0 }}
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200/90 dark:border-slate-800 shadow-xl transition-colors pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="max-w-md sm:max-w-lg mx-auto px-4 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between">
        
        {/* 1. Início / Planejamento & Contas (Símbolo de Casa) */}
        <button
          id="btn-nav-inicio"
          onClick={() => onChangeTab('planejamento')}
          className={`flex items-center justify-center w-13.5 h-13.5 sm:w-15 sm:h-15 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'planejamento'
              ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50/80 dark:bg-emerald-950/40'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
          }`}
          title="Início"
          aria-label="Início"
        >
          <Home className={`w-7 h-7 sm:w-7.5 sm:h-7.5 ${activeTab === 'planejamento' ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
        </button>

        {/* 2. Comparativo / Balanceamento dos Meses (Ícone de Gráfico) */}
        <button
          id="btn-nav-comparativo"
          onClick={() => onChangeTab('balanceamento')}
          className={`flex items-center justify-center w-13.5 h-13.5 sm:w-15 sm:h-15 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'balanceamento'
              ? 'text-indigo-700 dark:text-indigo-400 bg-indigo-50/80 dark:bg-indigo-950/40'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
          }`}
          title="Comparativo"
          aria-label="Comparativo"
        >
          <BarChart3 className={`w-7 h-7 sm:w-7.5 sm:h-7.5 ${activeTab === 'balanceamento' ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
        </button>

        {/* 3. (+) Botão Central no Centro da Barra Inferior para Adicionar */}
        <div className="flex items-center justify-center -mt-7 sm:-mt-8">
          <button
            id="btn-central-adicionar"
            onClick={onOpenNewTransaction}
            className="w-15 h-15 sm:w-16.5 sm:h-16.5 rounded-full bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 active:scale-95 text-white flex items-center justify-center shadow-xl border-3 sm:border-4 border-white dark:border-slate-900 transition-all cursor-pointer"
            title="Adicionar"
            aria-label="Adicionar Entrada, Saída ou Investimento"
          >
            <Plus className="w-8 h-8 sm:w-9 sm:h-9 stroke-[2.5]" />
          </button>
        </div>

        {/* 4. Transações do Mês / Contas */}
        <button
          id="btn-nav-contas"
          onClick={onViewPending}
          className={`flex items-center justify-center w-13.5 h-13.5 sm:w-15 sm:h-15 rounded-2xl relative transition-all cursor-pointer ${
            activeTab === 'contas'
              ? 'text-rose-600 dark:text-rose-400 bg-rose-50/80 dark:bg-rose-950/40'
              : 'text-slate-500 dark:text-slate-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
          }`}
          title="Transações do Mês"
          aria-label="Transações do Mês"
        >
          <div className="relative flex items-center justify-center">
            <ArrowLeftRight className={`w-7 h-7 sm:w-7.5 sm:h-7.5 ${activeTab === 'contas' ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
            {pendingCount > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-5 h-5 px-1 rounded-full bg-rose-500 text-white text-[11px] font-black flex items-center justify-center shadow-2xs">
                {pendingCount}
              </span>
            )}
          </div>
        </button>

        {/* 5. Mais Opções (Ícone de Mais) */}
        <button
          id="btn-nav-mais"
          onClick={() => onChangeTab('mais')}
          className={`flex items-center justify-center w-13.5 h-13.5 sm:w-15 sm:h-15 rounded-2xl transition-all cursor-pointer ${
            activeTab === 'mais'
              ? 'text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
          }`}
          title="Mais"
          aria-label="Mais"
        >
          <MoreHorizontal className={`w-7 h-7 sm:w-7.5 sm:h-7.5 ${activeTab === 'mais' ? 'stroke-[2.5]' : 'stroke-[2]'}`} />
        </button>

      </div>
    </nav>
  );
};

