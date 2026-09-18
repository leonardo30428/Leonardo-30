import React from 'react';
import { Home, ArrowLeftRight, History, Clock, Plus } from 'lucide-react';

interface BottomNavBarProps {
  activeTab: 'planejamento' | 'balanceamento' | 'historico' | 'contas';
  onChangeTab: (tab: 'planejamento' | 'balanceamento' | 'historico' | 'contas') => void;
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
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg"
    >
      <div className="max-w-md sm:max-w-lg mx-auto px-4 py-1.5 flex items-center justify-between">
        
        {/* 1. Início / Planejamento & Contas (Símbolo de Casa) */}
        <button
          id="btn-nav-inicio"
          onClick={() => onChangeTab('planejamento')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            activeTab === 'planejamento'
              ? 'text-emerald-700 font-bold'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
          title="Início - Planejamento & Contas"
        >
          <Home className={`w-5 h-5 ${activeTab === 'planejamento' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight">Início</span>
        </button>

        {/* 2. Comparativo / Balanceamento dos Meses */}
        <button
          id="btn-nav-comparativo"
          onClick={() => onChangeTab('balanceamento')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            activeTab === 'balanceamento'
              ? 'text-indigo-700 font-bold'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
          title="Comparativos e Balanceamento dos Meses"
        >
          <ArrowLeftRight className={`w-5 h-5 ${activeTab === 'balanceamento' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight">Comparativo</span>
        </button>

        {/* 3. (+) Botão Central no Centro da Barra Inferior para Adicionar Receita / Gasto */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-5">
          <button
            id="btn-central-adicionar"
            onClick={onOpenNewTransaction}
            className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-emerald-600/35 border-3 border-white transition-transform cursor-pointer"
            title="Adicionar Receita, Gasto ou Investimento"
          >
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </button>
          <span className="text-[10px] font-bold text-slate-700 mt-0.5">Novo</span>
        </div>

        {/* 4. Contas (Contas e vencimentos) */}
        <button
          id="btn-nav-contas"
          onClick={onViewPending}
          className={`flex-1 flex flex-col items-center justify-center py-1 relative transition-colors cursor-pointer ${
            activeTab === 'contas'
              ? 'text-rose-600 font-bold'
              : 'text-slate-500 hover:text-rose-700 font-medium'
          }`}
          title="Ver contas do mês"
        >
          <div className="relative">
            <Clock className={`w-5 h-5 ${activeTab === 'contas' ? 'stroke-[2.5]' : 'stroke-2'}`} />
            {pendingCount > 0 && (
              <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center shadow-2xs">
                {pendingCount}
              </span>
            )}
          </div>
          <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight">Contas</span>
        </button>

        {/* 5. Histórico de Transações */}
        <button
          id="btn-nav-historico"
          onClick={() => onChangeTab('historico')}
          className={`flex-1 flex flex-col items-center justify-center py-1 transition-colors cursor-pointer ${
            activeTab === 'historico'
              ? 'text-slate-900 font-bold'
              : 'text-slate-500 hover:text-slate-900 font-medium'
          }`}
          title="Histórico Completo de Transações"
        >
          <History className={`w-5 h-5 ${activeTab === 'historico' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] sm:text-[11px] mt-0.5 tracking-tight">Histórico</span>
        </button>

      </div>
    </nav>
  );
};
