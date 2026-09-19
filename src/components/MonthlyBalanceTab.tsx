import React, { useMemo, useState } from 'react';
import { 
  Scale, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Wallet, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Copy,
  ShieldCheck,
  Link2,
  Check,
  X
} from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency, formatDateBR } from '../utils/finance';
import { getMonthKey } from '../utils/dateUtils';

interface MonthData {
  name: string;
  key: string; // e.g. '2026-08', '2026-09', '2026-10'
  income: number;
  expenses: number;
  investments: number;
  surplus: number;
  savingsRate: number;
  expenseRate: number;
  txCount: number;
  status: 'healthy' | 'warning' | 'alert';
}

interface MonthlyBalanceTabProps {
  transactions: Transaction[];
  months: string[];
  currentMonth: string;
  onSelectMonth: (monthName: string) => void;
  onGoToPlanning: () => void;
  onCopyMonthContas?: (fromMonthKey: string, toMonthKey: string) => void;
}

export const MonthlyBalanceTab: React.FC<MonthlyBalanceTabProps> = ({
  transactions,
  months,
  currentMonth,
  onSelectMonth,
  onGoToPlanning,
  onCopyMonthContas,
}) => {
  // Calculate stats for all available months
  const monthsData: MonthData[] = useMemo(() => {
    return months.map((mName) => {
      const key = getMonthKey(mName);
      const monthTxs = transactions.filter((t) => t.date && t.date.startsWith(key));

      const income = monthTxs
        .filter((t) => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

      const expenses = monthTxs
        .filter((t) => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);

      const investments = monthTxs
        .filter((t) => t.type === 'investment')
        .reduce((sum, t) => sum + t.amount, 0);

      const surplus = income - expenses - investments;
      const expenseRate = income > 0 ? (expenses / income) * 100 : 0;
      const savingsRate = income > 0 ? (investments / income) * 100 : 0;

      let status: 'healthy' | 'warning' | 'alert' = 'healthy';
      if (surplus < 0) {
        status = 'alert';
      } else if (expenseRate > 75 || savingsRate < 10) {
        status = 'warning';
      }

      return {
        name: mName,
        key,
        income,
        expenses,
        investments,
        surplus,
        savingsRate,
        expenseRate,
        txCount: monthTxs.length,
        status,
      };
    });
  }, [months, transactions]);

  // Find September and October for side-by-side comparison
  const setMonth = monthsData.find((m) => m.name.includes('Setembro'));
  const outMonth = monthsData.find((m) => m.name.includes('Outubro'));

  // Calculate Max value for relative chart bars
  const maxVal = useMemo(() => {
    return Math.max(
      ...monthsData.flatMap((m) => [m.income, m.expenses, m.investments]),
      1000
    );
  }, [monthsData]);

  // Total surplus accumulated across all months
  const totalAccumulatedSurplus = useMemo(() => {
    return monthsData.reduce((acc, m) => acc + m.surplus, 0);
  }, [monthsData]);

  const totalAccumulatedInvested = useMemo(() => {
    return monthsData.reduce((acc, m) => acc + m.investments, 0);
  }, [monthsData]);

  // Parâmetros do mês atualmente selecionado
  const activeMonthKey = getMonthKey(currentMonth);
  const activeMonthTxs = useMemo(() => {
    return transactions.filter((t) => t.date && t.date.startsWith(activeMonthKey));
  }, [transactions, activeMonthKey]);

  const activeIncomeTxs = useMemo(() => activeMonthTxs.filter((t) => t.type === 'income'), [activeMonthTxs]);
  const activeExpenseTxs = useMemo(() => activeMonthTxs.filter((t) => t.type === 'expense'), [activeMonthTxs]);
  const activeInvestmentTxs = useMemo(() => activeMonthTxs.filter((t) => t.type === 'investment'), [activeMonthTxs]);

  const activeTotalIncome = activeIncomeTxs.reduce((s, t) => s + t.amount, 0);
  const activeTotalExpense = activeExpenseTxs.reduce((s, t) => s + t.amount, 0);
  const activeTotalInvestments = activeInvestmentTxs.reduce((s, t) => s + t.amount, 0);
  const activeSurplus = activeTotalIncome - activeTotalExpense - activeTotalInvestments;

  const activeExpensePct = activeTotalIncome > 0 ? (activeTotalExpense / activeTotalIncome) * 100 : 0;
  const activeInvestmentPct = activeTotalIncome > 0 ? (activeTotalInvestments / activeTotalIncome) * 100 : 0;
  const activeSurplusPct = activeTotalIncome > 0 ? (activeSurplus / activeTotalIncome) * 100 : 0;

  const [rankingModalType, setRankingModalType] = useState<'income' | 'expense' | 'investment' | null>(null);

  const currentRankingItems = useMemo(() => {
    if (!rankingModalType) return [];
    const list = rankingModalType === 'income' 
      ? activeIncomeTxs 
      : rankingModalType === 'expense' 
      ? activeExpenseTxs 
      : activeInvestmentTxs;
    return [...list].sort((a, b) => b.amount - a.amount);
  }, [rankingModalType, activeIncomeTxs, activeExpenseTxs, activeInvestmentTxs]);

  return (
    <div className="space-y-6 animate-fadeIn pb-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/50">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-400 text-xs font-bold mb-3 backdrop-blur-xs border border-white/10">
              <Scale className="w-3.5 h-3.5" />
              <span>Balanço Comparativo Entre os Meses</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Balanceamento dos Meses
            </h2>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
              Monitore a transição financeira de Setembro de 2026 para Outubro de 2026 e verifique a sustentabilidade do seu orçamento, saldo acumulado e evolução dos investimentos.
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <span className="text-[10px] font-bold tracking-wider text-slate-300 block">
                Investimentos Totais
              </span>
              <span className="text-lg sm:text-2xl font-black text-indigo-300 mt-1 block">
                {formatCurrency(totalAccumulatedInvested)}
              </span>
              <span className="text-[11px] text-emerald-300 font-medium flex items-center gap-1 mt-0.5">
                <Sparkles className="w-3 h-3" />
                Patrimônio em construção
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <span className="text-[10px] font-bold tracking-wider text-slate-300 block">
                Sobra Líquida Acumulada
              </span>
              <span className={`text-lg sm:text-2xl font-black mt-1 block ${totalAccumulatedSurplus >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                {formatCurrency(totalAccumulatedSurplus)}
              </span>
              <span className="text-[11px] text-slate-300 font-medium block mt-0.5">
                Em {monthsData.length} meses analisados
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Destaque Setembro vs Outubro de 2026 */}
      {setMonth && outMonth && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Comparativo Direto: Setembro 2026 vs Outubro 2026</span>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Em Destaque
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Veja o impacto das contas de Setembro para Outubro de 2026
              </p>
            </div>
            
            {onCopyMonthContas && (
              <button
                onClick={() => onCopyMonthContas('2026-09', '2026-10')}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all border border-slate-200/80 dark:border-slate-700 cursor-pointer"
                title="Replicar contas fixas de Setembro para Outubro"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Replicar Contas de Setembro para Outubro</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card Setembro */}
            <div className={`p-5 rounded-2xl border transition-all ${
              currentMonth === setMonth.name 
                ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-200 dark:ring-emerald-800' 
                : 'bg-slate-50/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    09
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Setembro de 2026</h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{setMonth.txCount} contas e transações</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onSelectMonth(setMonth.name);
                    onGoToPlanning();
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 hover:bg-emerald-600 dark:hover:bg-emerald-600 hover:text-white dark:hover:text-white text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <span>Abrir Contas</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block">Renda</span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">{formatCurrency(setMonth.income)}</span>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 block">Despesas</span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">{formatCurrency(setMonth.expenses)}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block">{setMonth.expenseRate.toFixed(0)}% da renda</span>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 block">Investido</span>
                  <span className="text-xs sm:text-sm font-black text-indigo-900 dark:text-indigo-200">{formatCurrency(setMonth.investments)}</span>
                  <span className="text-[10px] text-indigo-500 dark:text-indigo-400 block">{setMonth.savingsRate.toFixed(0)}% aporte</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Sobra Livre do Mês:</span>
                <span className={`text-sm font-black ${setMonth.surplus >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {formatCurrency(setMonth.surplus)}
                </span>
              </div>
            </div>

            {/* Card Outubro */}
            <div className={`p-5 rounded-2xl border transition-all ${
              currentMonth === outMonth.name 
                ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-700 ring-2 ring-emerald-200 dark:ring-emerald-800' 
                : 'bg-slate-50/80 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
            }`}>
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                    10
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">Outubro de 2026</h4>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">{outMonth.txCount} contas e transações</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    onSelectMonth(outMonth.name);
                    onGoToPlanning();
                  }}
                  className="px-3 py-1.5 text-xs font-bold rounded-xl bg-white dark:bg-slate-800 hover:bg-indigo-600 dark:hover:bg-indigo-600 hover:text-white dark:hover:text-white text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-700 transition-all flex items-center gap-1 shadow-2xs cursor-pointer"
                >
                  <span>Abrir Contas</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 block">Renda</span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">{formatCurrency(outMonth.income)}</span>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-rose-700 dark:text-rose-400 block">Despesas</span>
                  <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">{formatCurrency(outMonth.expenses)}</span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 block">{outMonth.expenseRate.toFixed(0)}% da renda</span>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-[10px] font-bold text-indigo-700 dark:text-indigo-400 block">Investido</span>
                  <span className="text-xs sm:text-sm font-black text-indigo-900 dark:text-indigo-200">{formatCurrency(outMonth.investments)}</span>
                  <span className="text-[10px] text-indigo-500 dark:text-indigo-400 block">{outMonth.savingsRate.toFixed(0)}% aporte</span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Sobra Livre do Mês:</span>
                <span className={`text-sm font-black ${outMonth.surplus >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {formatCurrency(outMonth.surplus)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. QUADRO DE PARÂMETROS FINANCEIROS (Exclusivo da aba Comparativo) */}
      <div 
        id="comparativo-parameters-panel" 
        className="bg-slate-50/90 dark:bg-slate-800/80 rounded-3xl p-5 sm:p-7 border border-slate-200/90 dark:border-slate-700 space-y-5 transition-colors"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80 dark:border-slate-700">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-base sm:text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Quadro de Parâmetros Financeiros ({currentMonth})
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Análise dos 4 pilares orçamentários (Renda, Despesas, Investimentos e Sobra) com ranking do maior ao menor
            </p>
          </div>

          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-100/90 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl self-start sm:self-auto flex items-center gap-1.5 border border-emerald-200 dark:border-emerald-800">
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
            Parâmetros Ativos
          </span>
        </div>

        {/* Os 4 Cards de Parâmetros */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          
          {/* Card 1: Renda Principal */}
          <div 
            onClick={() => setRankingModalType('income')}
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-emerald-200 dark:border-emerald-800/60 shadow-2xs cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-600 hover:shadow-md transition-all group flex flex-col justify-between"
            role="button"
            tabIndex={0}
            title="Clique para ver os parâmetros com as maiores receitas até as menores"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold tracking-wider text-emerald-800 dark:text-emerald-300">
                  1. Renda Principal
                </span>
                <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                  100% Base
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {formatCurrency(activeTotalIncome)}
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium mt-1 flex items-center gap-1">
                  <Link2 className="w-3 h-3" />
                  {activeIncomeTxs.length > 0 
                    ? `${activeIncomeTxs.length} entrada(s)`
                    : 'Nenhuma entrada'}
                </p>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-emerald-100/80 dark:border-emerald-900/40 flex items-center justify-between text-[11px] font-bold text-emerald-700 dark:text-emerald-400 group-hover:text-emerald-900 dark:group-hover:text-emerald-200 transition-colors">
              <span>Ver Ranking</span>
              <span className="flex items-center gap-0.5">Maiores →</span>
            </div>
          </div>

          {/* Card 2: Despesas */}
          <div 
            onClick={() => setRankingModalType('expense')}
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-rose-200 dark:border-rose-800/60 shadow-2xs cursor-pointer hover:border-rose-400 dark:hover:border-rose-600 hover:shadow-md transition-all group flex flex-col justify-between"
            role="button"
            tabIndex={0}
            title="Clique para ver os parâmetros com as maiores despesas até as menores"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold tracking-wider text-rose-800 dark:text-rose-300">
                  2. Despesas
                </span>
                <span className="text-[10px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 px-2 py-0.5 rounded-full">
                  {activeExpensePct.toFixed(1)}% da renda
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {formatCurrency(activeTotalExpense)}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                  {activeTotalExpense > 0 ? (
                    activeExpensePct <= 70 ? '✅ Saudável (≤70%)' : '⚠️ Acima de 70%'
                  ) : 'Nenhum gasto'}
                </p>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-rose-100/80 dark:border-rose-900/40 flex items-center justify-between text-[11px] font-bold text-rose-700 dark:text-rose-400 group-hover:text-rose-900 dark:group-hover:text-rose-200 transition-colors">
              <span>Ver Ranking</span>
              <span className="flex items-center gap-0.5">Maiores →</span>
            </div>
          </div>

          {/* Card 3: Investimentos */}
          <div 
            onClick={() => setRankingModalType('investment')}
            className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-indigo-200 dark:border-indigo-800/60 shadow-2xs cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-600 hover:shadow-md transition-all group flex flex-col justify-between"
            role="button"
            tabIndex={0}
            title="Clique para ver os parâmetros com os maiores investimentos até os menores"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold tracking-wider text-indigo-800 dark:text-indigo-300">
                  3. Investimentos
                </span>
                <span className="text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                  {activeInvestmentPct.toFixed(1)}% da renda
                </span>
              </div>
              <div className="mt-2">
                <div className="text-xl sm:text-2xl font-black text-indigo-950 dark:text-indigo-200 tracking-tight">
                  {formatCurrency(activeTotalInvestments)}
                </div>
                <p className="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium mt-1">
                  {activeInvestmentPct >= 20 
                    ? '🎯 Meta de 20% atingida!' 
                    : activeInvestmentPct > 0 
                    ? '🌱 Em construção' 
                    : 'Aguardando aporte'}
                </p>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-indigo-100/80 dark:border-indigo-900/40 flex items-center justify-between text-[11px] font-bold text-indigo-700 dark:text-indigo-400 group-hover:text-indigo-900 dark:group-hover:text-indigo-200 transition-colors">
              <span>Ver Ranking</span>
              <span className="flex items-center gap-0.5">Maiores →</span>
            </div>
          </div>

          {/* Card 4: Sobra Livre */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-sky-200 dark:border-sky-800/60 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold tracking-wider text-sky-800 dark:text-sky-300">
                  4. Sobra Livre
                </span>
                <span className="text-[10px] font-bold bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 px-2 py-0.5 rounded-full">
                  {activeSurplusPct.toFixed(1)}% da renda
                </span>
              </div>
              <div className="mt-2">
                <div className={`text-xl sm:text-2xl font-black tracking-tight ${activeSurplus < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
                  {formatCurrency(activeSurplus)}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                  {activeSurplus > 0 
                    ? 'Livre para reserva ou lazer' 
                    : activeSurplus < 0 
                    ? '⚠️ Déficit detectado' 
                    : 'Totalmente alocado'}
                </p>
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-sky-100/80 dark:border-sky-900/40 text-[11px] font-bold text-sky-700 dark:text-sky-400">
              <span>Saldo final do mês</span>
            </div>
          </div>

        </div>

        {/* Diagnóstico */}
        <div className="p-3.5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            <strong>Diagnóstico de Parâmetro:</strong>{' '}
            {activeInvestmentPct >= 20 
              ? 'Sua distribuição financeira está excelente, garantindo independência patrimonial no longo prazo.' 
              : activeInvestmentPct > 0 
              ? `Você está destinando ${activeInvestmentPct.toFixed(1)}% para investimentos. Recomenda-se aproximar da meta de 20% com a sobra de ${formatCurrency(Math.max(0, activeSurplus))}.` 
              : 'Você ainda não registrou investimentos neste mês. Destine uma parcela da sua receita para multiplicar seu patrimônio.'}
          </span>
        </div>
      </div>

      {/* Tabela de Balanceamento Mês a Mês */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-sm transition-colors">
        <div className="pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>Tabela Geral de Balanceamento Mensal</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Clique em qualquer mês para carregar suas contas no planejamento e atualizar o extrato
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[11px] font-extrabold tracking-wider bg-slate-50/70 dark:bg-slate-800/70">
                <th className="py-3 px-3.5 rounded-l-xl">Mês</th>
                <th className="py-3 px-3 text-right">Renda (Entradas)</th>
                <th className="py-3 px-3 text-right">Despesas (Gastos)</th>
                <th className="py-3 px-3 text-right">Investimentos</th>
                <th className="py-3 px-3 text-right">Sobra Líquida</th>
                <th className="py-3 px-3 text-center">Saúde</th>
                <th className="py-3 px-3.5 text-center rounded-r-xl">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {monthsData.map((m) => {
                const isCurrent = m.name === currentMonth;
                return (
                  <tr 
                    key={m.key} 
                    className={`transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/80 ${isCurrent ? 'bg-emerald-50/40 dark:bg-emerald-950/30 font-semibold' : ''}`}
                  >
                    <td className="py-3.5 px-3.5 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${isCurrent ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-600'}`} />
                      <span>{m.name}</span>
                      {isCurrent && (
                        <span className="text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                          Mês Ativo
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(m.income)}
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-rose-700 dark:text-rose-400">
                      {formatCurrency(m.expenses)}
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-normal">
                        {m.expenseRate.toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-bold text-indigo-700 dark:text-indigo-400">
                      {formatCurrency(m.investments)}
                      <span className="text-[10px] text-indigo-500 dark:text-indigo-400 block font-normal">
                        {m.savingsRate.toFixed(0)}%
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-right font-extrabold">
                      <span className={m.surplus >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                        {formatCurrency(m.surplus)}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {m.status === 'healthy' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          Equilibrado
                        </span>
                      ) : m.status === 'warning' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                          <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                          Atenção
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-full border border-rose-200 dark:border-rose-800">
                          <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                          Déficit
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3.5 text-center">
                      <button
                        onClick={() => {
                          onSelectMonth(m.name);
                          onGoToPlanning();
                        }}
                        className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          isCurrent 
                            ? 'bg-emerald-600 text-white shadow-2xs' 
                            : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                        }`}
                        title={`Carregar planejamento e contas de ${m.name}`}
                      >
                        {isCurrent ? 'Visualizando' : 'Carregar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gráfico Visual Comparativo de Barras */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200/90 dark:border-slate-800 shadow-sm transition-colors">
        <div className="pb-4 border-b border-slate-100 dark:border-slate-800 mb-5">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            Evolução Comparativa: Renda vs Despesas vs Investimentos
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Proporção de fluxo financeiro entre os meses
          </p>
        </div>

        <div className="space-y-5">
          {monthsData.map((m) => {
            const incomeWidth = Math.min(100, Math.max(3, (m.income / maxVal) * 100));
            const expenseWidth = Math.min(100, Math.max(3, (m.expenses / maxVal) * 100));
            const investWidth = Math.min(100, Math.max(3, (m.investments / maxVal) * 100));

            return (
              <div key={m.key} className="p-3 bg-slate-50/80 dark:bg-slate-800/60 rounded-2xl border border-slate-200/60 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                    {m.name}
                  </span>
                  <div className="flex items-center gap-3 text-[11px] font-bold">
                    <span className="text-emerald-700 dark:text-emerald-400">Renda: {formatCurrency(m.income)}</span>
                    <span className="text-rose-700 dark:text-rose-400">Gastos: {formatCurrency(m.expenses)}</span>
                    <span className="text-indigo-700 dark:text-indigo-400">Investido: {formatCurrency(m.investments)}</span>
                  </div>
                </div>

                {/* Stacked comparison bars */}
                <div className="space-y-1.5">
                  <div className="w-full bg-slate-200/70 dark:bg-slate-700/70 h-2.5 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${incomeWidth}%` }}
                      title={`Renda: ${formatCurrency(m.income)}`}
                    />
                  </div>
                  <div className="w-full bg-slate-200/70 dark:bg-slate-700/70 h-2.5 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-rose-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${expenseWidth}%` }}
                      title={`Despesas: ${formatCurrency(m.expenses)}`}
                    />
                  </div>
                  <div className="w-full bg-slate-200/70 dark:bg-slate-700/70 h-2.5 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${investWidth}%` }}
                      title={`Investimentos: ${formatCurrency(m.investments)}`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span>Renda (Entradas)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500" />
            <span>Despesas (Gastos)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-indigo-500" />
            <span>Investimentos (Aportes)</span>
          </div>
        </div>
      </div>

      {/* MODAL DE RANKING: MAIORES PARA MENORES */}
      {rankingModalType && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[85vh] flex flex-col transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs ${
                  rankingModalType === 'income' 
                    ? 'bg-emerald-600' 
                    : rankingModalType === 'expense' 
                    ? 'bg-rose-600' 
                    : 'bg-indigo-600'
                }`}>
                  #
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                    {rankingModalType === 'income' 
                      ? 'Ranking de Entradas (Maiores → Menores)' 
                      : rankingModalType === 'expense' 
                      ? 'Ranking de Saídas (Maiores → Menores)' 
                      : 'Ranking de Investimentos (Maiores → Menores)'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {currentMonth} • {currentRankingItems.length} lançamento(s)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setRankingModalType(null)}
                className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 pr-1 flex-1">
              {currentRankingItems.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-500 dark:text-slate-400">
                  Nenhum lançamento registrado nesta categoria para este mês.
                </div>
              ) : (
                currentRankingItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100/70 dark:hover:bg-slate-750 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-black flex items-center justify-center shrink-0">
                        {idx + 1}º
                      </span>
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm block">
                          {item.description}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <span>{item.category}</span>
                          <span>•</span>
                          <span>{formatDateBR(item.date)}</span>
                          {item.bankName && (
                            <>
                              <span>•</span>
                              <span>{item.bankName}</span>
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white">
                      {formatCurrency(item.amount)}
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0">
              <button
                onClick={() => setRankingModalType(null)}
                className="px-4 py-2 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
