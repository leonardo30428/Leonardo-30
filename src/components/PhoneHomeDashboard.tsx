import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  EyeOff, 
  TrendingUp, 
  TrendingDown, 
  ArrowUp, 
  ArrowDown, 
  CreditCard, 
  ChevronRight as ArrowRightIcon,
  Wifi,
  BatteryCharging,
  Home,
  ArrowLeftRight,
  Plus,
  BarChart3,
  MoreHorizontal,
  Landmark,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { Transaction, MonthlySummary, BankAccount, BillReminder } from '../types';
import { formatCurrency } from '../utils/finance';

interface PhoneHomeDashboardProps {
  summary: MonthlySummary;
  transactions: Transaction[];
  bankAccounts: BankAccount[];
  bills: BillReminder[];
  onNavigateToReceitas: () => void;
  onNavigateToGastos: () => void;
  onNavigateToInvestimentos: () => void;
  onNavigateToPlanejamento: () => void;
  onNavigateToExtrato: () => void;
  onNavigateToRelatorios: () => void;
  onNavigateToMais: () => void;
  onOpenNewTransaction: () => void;
  onOpenBankSync: () => void;
  onOpenPendencias: (tab: 'pagar' | 'receber' | 'faturas') => void;
  currentMonth: string;
  onChangeMonth: (direction: 'prev' | 'next') => void;
  isAugPrintData: boolean;
}

export const PhoneHomeDashboard: React.FC<PhoneHomeDashboardProps> = ({
  summary,
  transactions,
  bankAccounts,
  bills,
  onNavigateToReceitas,
  onNavigateToGastos,
  onNavigateToInvestimentos,
  onNavigateToPlanejamento,
  onNavigateToExtrato,
  onNavigateToRelatorios,
  onNavigateToMais,
  onOpenNewTransaction,
  onOpenBankSync,
  onOpenPendencias,
  currentMonth,
  onChangeMonth,
  isAugPrintData,
}) => {
  // Toggle hide/show monetary values like real banking apps
  const [hideValues, setHideValues] = useState(false);

  // Values depending on month selected
  // If Agosto 2026: matches the exact numbers from the uploaded screenshot IMG_3350.png
  // If Setembro 2026 (or user custom): matches the user's personal spreadsheet calculations!
  const displayDisponivel = isAugPrintData ? 30444.00 : (summary.totalIncome - summary.totalExpense);
  const displayReceitas = isAugPrintData ? 12200.00 : summary.totalIncome;
  const displayDespesas = isAugPrintData ? 6142.90 : summary.totalExpense;

  // Pendencias values
  const pendenciasPagar = bills.filter(b => !b.isPaid).reduce((acc, b) => acc + b.amount, 0);
  const pendenciasReceber = 0;
  const pendenciasFaturas = 0;

  // Formatter that respects hideValues toggle
  const formatVal = (val: number, customPrefix = 'R$ ') => {
    if (hideValues) return '••••••';
    return formatCurrency(val);
  };

  return (
    <div className="w-full max-w-[395px] sm:max-w-[420px] mx-auto bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white rounded-[38px] sm:rounded-[44px] shadow-2xl border-[6px] border-slate-900/90 dark:border-slate-800 overflow-hidden relative font-sans select-none transition-colors">
      
      {/* 1. TOP STATUS BAR (iPhone style) */}
      <div className="pt-2 px-7 pb-1 flex items-center justify-between text-xs font-semibold text-slate-800 dark:text-slate-200">
        <span className="text-[13px] tracking-tight">09:41</span>
        
        {/* Dynamic Island Capsule */}
        <div className="w-[88px] h-[22px] bg-black rounded-full flex items-center justify-end pr-2">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
        </div>

        {/* Status icons: Wifi & Battery */}
        <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200">
          <Wifi className="w-3.5 h-3.5 stroke-[2.2]" />
          <div className="flex items-center gap-0.5">
            <span className="text-[11px] font-bold">41</span>
            <BatteryCharging className="w-4 h-4 text-emerald-600 dark:text-emerald-400 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* 2. MONTH SELECTOR HEADER: <  Agosto 2026  > */}
      <div className="px-6 py-3 flex items-center justify-between">
        <button 
          id="btn-prev-month"
          onClick={() => onChangeMonth('prev')}
          className="w-8 h-8 rounded-full hover:bg-slate-200/70 dark:hover:bg-slate-800 active:scale-95 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
          title="Mês anterior"
        >
          <ChevronLeft className="w-5 h-5 stroke-[2.2]" />
        </button>

        <div className="flex flex-col items-center">
          <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
            {currentMonth}
          </h2>
          {isAugPrintData ? (
            <span className="text-[10px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.2 rounded-full border border-emerald-200/60 dark:border-emerald-800">
              Visual idêntico ao seu print
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/80 px-2 py-0.2 rounded-full border border-emerald-200/60 dark:border-emerald-800">
              Dados da sua planilha
            </span>
          )}
        </div>

        <button 
          id="btn-next-month"
          onClick={() => onChangeMonth('next')}
          className="w-8 h-8 rounded-full hover:bg-slate-200/70 dark:hover:bg-slate-800 active:scale-95 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer"
          title="Próximo mês"
        >
          <ChevronRight className="w-5 h-5 stroke-[2.2]" />
        </button>
      </div>

      {/* SCROLLABLE MAIN CONTENT (padded at bottom for floating tab bar) */}
      <div className="px-4 space-y-3.5 pb-24 overflow-y-auto max-h-[calc(88vh-80px)] no-scrollbar">

        {/* 3. MAIN CARD: DISPONÍVEL + RECEITAS & DESPESAS */}
        <div 
          id="card-disponivel-main"
          className="bg-white dark:bg-slate-900 rounded-3xl p-5 shadow-xs border border-slate-100 dark:border-slate-800 transition-colors"
        >
          {/* Disponível header with eye toggle */}
          <div className="flex items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400 mb-1">
            <span className="text-xs sm:text-[13px] font-medium">Disponível</span>
            <button
              onClick={() => setHideValues(!hideValues)}
              className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer"
              title={hideValues ? 'Mostrar valores' : 'Ocultar valores'}
            >
              {hideValues ? (
                <EyeOff className="w-3.5 h-3.5 stroke-[2.2]" />
              ) : (
                <Eye className="w-3.5 h-3.5 stroke-[2.2]" />
              )}
            </button>
          </div>

          {/* Big central balance: R$ 30.444,00 */}
          <div className="text-center mb-5">
            <h1 className="text-2xl sm:text-[30px] font-extrabold text-slate-900 dark:text-white tracking-tight">
              {formatVal(displayDisponivel)}
            </h1>
          </div>

          {/* Sub-cards 2-column: Receitas & Despesas */}
          <div className="grid grid-cols-2 gap-2.5">
            
            {/* Entrada Tile */}
            <div
              id="card-receitas-tile"
              onClick={onNavigateToReceitas}
              className="bg-slate-50/80 dark:bg-slate-800/80 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/40 p-3 sm:p-3.5 rounded-2xl border border-slate-100/90 dark:border-slate-700/80 cursor-pointer active:scale-98 transition-all group"
              title="Toque para abrir a página detalhada de Entrada"
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <ArrowUp className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Entrada</span>
              </div>
              <p className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight group-hover:translate-x-0.5 transition-transform">
                {formatVal(displayReceitas)}
              </p>
            </div>

            {/* Saída Tile */}
            <div
              id="card-despesas-tile"
              onClick={onNavigateToGastos}
              className="bg-slate-50/80 dark:bg-slate-800/80 hover:bg-rose-50/50 dark:hover:bg-rose-950/40 p-3 sm:p-3.5 rounded-2xl border border-slate-100/90 dark:border-slate-700/80 cursor-pointer active:scale-98 transition-all group"
              title="Toque para abrir a página detalhada de Saída"
            >
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="w-4 h-4 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <ArrowDown className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Saída</span>
              </div>
              <p className="text-xs sm:text-sm font-extrabold text-rose-600 dark:text-rose-400 tracking-tight group-hover:translate-x-0.5 transition-transform">
                {formatVal(displayDespesas)}
              </p>
            </div>

          </div>
        </div>

        {/* 4. PENDÊNCIAS SECTION: Pagar, Receber, Faturas */}
        <div id="section-pendencias" className="space-y-1.5">
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white px-1">
            Pendências
          </h3>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-3 shadow-xs border border-slate-100 dark:border-slate-800 grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800 transition-colors">
            
            {/* 1. Pagar */}
            <div 
              onClick={() => onOpenPendencias('pagar')}
              className="flex flex-col items-center justify-center p-1.5 cursor-pointer hover:bg-rose-50/40 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
              title="Ver contas a pagar"
            >
              <div className="w-5 h-5 rounded-full bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-1">
                <ArrowDown className="w-3 h-3 stroke-[2.5]" />
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-0.5">Pagar</span>
              <span className="text-xs font-extrabold text-rose-600 dark:text-rose-400">
                {formatVal(pendenciasPagar)}
              </span>
            </div>

            {/* 2. Receber */}
            <div 
              onClick={() => onOpenPendencias('receber')}
              className="flex flex-col items-center justify-center p-1.5 cursor-pointer hover:bg-emerald-50/40 dark:hover:bg-emerald-950/40 rounded-xl transition-colors"
              title="Ver valores a receber"
            >
              <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1">
                <ArrowUp className="w-3 h-3 stroke-[2.5]" />
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-0.5">Receber</span>
              <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                {formatVal(pendenciasReceber)}
              </span>
            </div>

            {/* 3. Faturas */}
            <div 
              onClick={() => onOpenPendencias('faturas')}
              className="flex flex-col items-center justify-center p-1.5 cursor-pointer hover:bg-orange-50/40 dark:hover:bg-orange-950/40 rounded-xl transition-colors"
              title="Ver faturas de cartão"
            >
              <div className="w-5 h-5 rounded-full bg-orange-50 dark:bg-orange-950/80 text-orange-500 dark:text-orange-400 flex items-center justify-center mb-1">
                <CreditCard className="w-3 h-3 stroke-[2.5]" />
              </div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mb-0.5">Faturas</span>
              <span className="text-xs font-extrabold text-rose-500 dark:text-rose-400">
                {formatVal(pendenciasFaturas)}
              </span>
            </div>

          </div>
        </div>

        {/* 5. CONTAS SECTION: Itaú, Poupança, Carteira, Total Disponível */}
        <div id="section-contas" className="space-y-1.5">
          <div 
            onClick={onOpenBankSync}
            className="flex items-center justify-between px-1 cursor-pointer group"
          >
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
              Contas
            </h3>
            <ArrowRightIcon className="w-4 h-4 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition-all" />
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-xs border border-slate-100 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800 transition-colors">
            
            {/* Account 1: Itaú Conta Corrente */}
            <div className="pb-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#ec7000] text-white flex items-center justify-center font-black text-xs shadow-2xs tracking-tighter">
                  itaú
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Conta Corrente
                  </h4>
                  <div className="flex flex-col text-[10.5px] text-slate-400 dark:text-slate-500 leading-tight">
                    <span>Previsto {formatVal(isAugPrintData ? 17583.50 : 0)}</span>
                    <span>Reservado {formatVal(isAugPrintData ? 3500.00 : 0)}</span>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                  {formatVal(isAugPrintData ? 17736.00 : 0)}
                </span>
              </div>
            </div>

            {/* Account 2: Poupança / Santander */}
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#cc0000] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                  <span className="tracking-tighter">S</span>
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Poupança
                  </h4>
                  <p className="text-[10.5px] text-slate-400 dark:text-slate-500">
                    Previsto {formatVal(isAugPrintData ? 12500.00 : 0)}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                  {formatVal(isAugPrintData ? 12500.00 : 0)}
                </span>
              </div>
            </div>

            {/* Account 3: Carteira */}
            <div className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                  <Landmark className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Carteira
                  </h4>
                  <p className="text-[10.5px] text-slate-400 dark:text-slate-500">
                    Previsto {formatVal(isAugPrintData ? 208.00 : 0)}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                  {formatVal(isAugPrintData ? 208.00 : 0)}
                </span>
              </div>
            </div>

            {/* Total Disponível footer row */}
            <div className="pt-3 flex items-center justify-between">
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                Disponível
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                {formatVal(displayDisponivel)}
              </span>
            </div>

          </div>
        </div>

        {/* Quick Helper Shortcut to Personal Spreadsheet Envelopes */}
        <div 
          onClick={onNavigateToPlanejamento}
          className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 hover:bg-emerald-100/60 dark:hover:bg-emerald-900/50 border border-emerald-200/70 dark:border-emerald-800 flex items-center justify-between cursor-pointer transition-all"
        >
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-emerald-900 dark:text-emerald-300 font-bold">Planejamento Salarial</span>
          </div>
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">
            Sobra: {formatVal(displayDisponivel)} →
          </span>
        </div>

      </div>

      {/* 6. BOTTOM NAVIGATION TAB BAR */}
      <div 
        id="phone-bottom-nav"
        className="absolute bottom-0 inset-x-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-100 dark:border-slate-800 px-4 py-2.5 flex items-center justify-between z-20 transition-colors"
      >
        {/* Tab 1: Início (Active) */}
        <button
          onClick={() => {}}
          className="flex flex-col items-center justify-center gap-0.5 text-slate-900 dark:text-white flex-1 py-1 transition-colors cursor-pointer"
          title="Início"
        >
          <div className="w-6 h-6 flex items-center justify-center text-slate-900 dark:text-white">
            <Home className="w-5 h-5 fill-slate-900 dark:fill-white stroke-[1.8]" />
          </div>
        </button>

        {/* Tab 2: Extrato / Transações */}
        <button
          onClick={onNavigateToExtrato}
          className="flex flex-col items-center justify-center gap-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex-1 py-1 transition-colors cursor-pointer"
          title="Extrato e Movimentações"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <ArrowLeftRight className="w-5 h-5 stroke-[2]" />
          </div>
        </button>

        {/* Tab 3: Center Elevated (+) Button (Coral/Salmon) */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            id="phone-fab-add"
            onClick={onOpenNewTransaction}
            className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#ff6b57] to-[#ff8f7d] hover:from-[#f55944] hover:to-[#ff7b67] text-white flex items-center justify-center shadow-lg shadow-orange-500/30 active:scale-95 transition-all cursor-pointer"
            title="Adicionar Transação"
          >
            <Plus className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        {/* Tab 4: Relatórios / Gráficos */}
        <button
          onClick={onNavigateToRelatorios}
          className="flex flex-col items-center justify-center gap-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex-1 py-1 transition-colors cursor-pointer"
          title="Relatórios e Gráficos"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 stroke-[2]" />
          </div>
        </button>

        {/* Tab 5: Mais / Menu */}
        <button
          onClick={onNavigateToMais}
          className="flex flex-col items-center justify-center gap-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 flex-1 py-1 transition-colors cursor-pointer"
          title="Mais opções e Planejamento"
        >
          <div className="w-6 h-6 flex items-center justify-center">
            <MoreHorizontal className="w-5 h-5 stroke-[2.2]" />
          </div>
        </button>
      </div>

    </div>
  );
};
