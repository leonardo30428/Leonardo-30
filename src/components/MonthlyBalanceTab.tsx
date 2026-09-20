import React, { useMemo, useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  ArrowLeftRight,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Transaction, BankAccount } from '../types';
import { formatCurrency, calculateSummary } from '../utils/finance';
import { getMonthKey } from '../utils/dateUtils';
import { getCategoryVisual } from '../utils/categoryIcons';

interface MonthlyBalanceTabProps {
  transactions: Transaction[];
  months: string[];
  currentMonth: string;
  bankAccounts?: BankAccount[];
  onSelectMonth: (monthName: string) => void;
  onGoToPlanning?: () => void;
  onCopyMonthContas?: (fromMonthKey: string, toMonthKey: string) => void;
}

export const MonthlyBalanceTab: React.FC<MonthlyBalanceTabProps> = ({
  transactions,
  months,
  currentMonth,
  onSelectMonth,
}) => {
  // Estado para alternar entre "Saídas" e "Entradas" por categoria
  const [categoryViewType, setCategoryViewType] = useState<'expense' | 'income'>('expense');

  // Navegação do mês: < setembro 2026 > (sem parênteses)
  const currentMonthIdx = months.indexOf(currentMonth);
  const handlePrevMonth = () => {
    if (currentMonthIdx > 0) {
      onSelectMonth(months[currentMonthIdx - 1]);
    } else {
      onSelectMonth(months[months.length - 1]);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIdx < months.length - 1) {
      onSelectMonth(months[currentMonthIdx + 1]);
    } else {
      onSelectMonth(months[0]);
    }
  };

  // Chave do mês selecionado (ex: "2026-09")
  const currentKey = useMemo(() => getMonthKey(currentMonth), [currentMonth]);

  // Transações do mês ativo
  const monthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date && t.date.startsWith(currentKey));
  }, [transactions, currentKey]);

  // 1. Cálculos de Entrada, Saída, Investimento e Balanço do Mês
  const monthTotals = useMemo(() => {
    let income = 0;
    let expenses = 0;
    let investments = 0;

    monthTransactions.forEach((t) => {
      if (t.type === 'income') income += t.amount;
      else if (t.type === 'investment') investments += t.amount;
      else expenses += t.amount;
    });

    const balance = income - expenses - investments;

    let statusText = 'Equilibrado';
    let statusBadgeColor = 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';

    if (balance > 0) {
      statusText = 'No Azul (Superávit)';
      statusBadgeColor = 'text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800';
    } else if (balance < 0) {
      statusText = 'Déficit no Mês';
      statusBadgeColor = 'text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800';
    }

    return {
      income,
      expenses,
      investments,
      balance,
      statusText,
      statusBadgeColor,
    };
  }, [monthTransactions]);

  // Altura máxima para o gráfico de barras verticais ("gráfico em pé")
  const maxBarValue = Math.max(monthTotals.income, monthTotals.expenses, monthTotals.investments, 1);

  // Calcula a altura percentual da cápsula arredondada sem achatar
  const getBarHeightPercent = (val: number) => {
    if (val <= 0) return 0;
    const pct = (val / maxBarValue) * 100;
    return Math.min(Math.max(pct, 12), 100);
  };

  // 2. Agrupamento por Categoria para o Gráfico em Círculo e Lista de Categorias
  const categoriesData = useMemo(() => {
    const map: Record<string, number> = {};

    monthTransactions
      .filter((t) => t.type === categoryViewType)
      .forEach((t) => {
        const cat = t.category || (categoryViewType === 'expense' ? 'Outros Gastos' : 'Outras Entradas');
        map[cat] = (map[cat] || 0) + t.amount;
      });

    const list = Object.entries(map).map(([name, amount]) => ({
      name,
      amount,
    }));

    list.sort((a, b) => b.amount - a.amount);

    const total = list.reduce((sum, item) => sum + item.amount, 0);

    const distinctColors = [
      '#10b981', // emerald
      '#f43f5e', // rose
      '#6366f1', // indigo
      '#f59e0b', // amber
      '#06b6d4', // cyan
      '#8b5cf6', // purple
      '#ec4899', // pink
      '#14b8a6', // teal
      '#3b82f6', // blue
      '#84cc16', // lime
    ];

    return {
      items: list.map((item, index) => ({
        ...item,
        percent: total > 0 ? (item.amount / total) * 100 : 0,
        color: distinctColors[index % distinctColors.length],
      })),
      total,
    };
  }, [monthTransactions, categoryViewType]);

  // 3. Cálculos de Patrimônio (12 Meses) - CONTABILIZA SOMENTE O "TOTAL DISPONÍVEL" DA TELA INICIAL
  const patrimonioData = useMemo(() => {
    const currentIdx = months.indexOf(currentMonth);
    const startIdx = Math.max(0, currentIdx - 11);
    const selectedMonths = months.slice(startIdx, currentIdx + 1);

    // Para cada mês dos 12 meses, contabiliza estritamente o "total disponível" da tela inicial
    const monthlySeries = selectedMonths.map((mName) => {
      const key = getMonthKey(mName);
      const txs = transactions.filter((t) => t.date && t.date.startsWith(key));
      const summary = calculateSummary(txs);
      const totalDisponivel = summary.balance; // IDÊNTICO ao "Total disponível" da tela inicial

      const [mOnly] = mName.split(' ');
      const shortName = mOnly.slice(0, 3).toLowerCase();

      return {
        name: mName,
        shortName,
        totalDisponivel,
      };
    });

    // Total disponível do mês ativo (igual ao card da tela inicial)
    const activeSummary = calculateSummary(monthTransactions);
    const saldoTotal = activeSummary.balance;

    // Variação em relação ao início da série de 12 meses
    const initialDisponivel = monthlySeries.length > 0 ? monthlySeries[0].totalDisponivel : saldoTotal;
    const diff = saldoTotal - initialDisponivel;
    const percentage = initialDisponivel !== 0
      ? (diff / Math.abs(initialDisponivel)) * 100
      : (saldoTotal > 0 ? 100 : (saldoTotal < 0 ? -100 : 0));

    // Valor máximo e mínimo para cálculo de alturas
    const allValues = monthlySeries.map((m) => m.totalDisponivel);
    const maxVal = Math.max(...allValues, 100);
    const minVal = Math.min(...allValues, 0);

    return {
      saldoTotal,
      diff,
      percentage,
      monthlySeries,
      maxVal,
      minVal,
    };
  }, [months, currentMonth, transactions, monthTransactions]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">

      {/* ========================================================================= */}
      {/* 1. SEÇÃO ANÁLISE / BALANÇO DO MÊS COM GRÁFICO EM PÉ 100% ARREDONDADO      */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xs transition-colors">
        
        {/* Cabeçalho: "Análise" à esquerda e "< setembro 2026 >" à direita (sem parênteses) */}
        <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Análise
          </h2>

          {/* Navegação do mês: < setembro 2026 > (sem parênteses) */}
          <div className="flex items-center gap-1.5 text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800/90 px-3 py-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-2xs">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
              title="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>

            <span className="px-2 text-slate-900 dark:text-white capitalize">
              {currentMonth.toLowerCase()}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg transition-colors cursor-pointer"
              title="Próximo mês"
            >
              <ChevronRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Em baixo: Gráfico em pé arredondado à esquerda e Balanço do mês à direita */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5 items-center">
          
          {/* Gráfico em pé (colunas verticais) estilo cápsula totalmente arredondada */}
          <div className="bg-slate-50/80 dark:bg-slate-800/50 p-5 rounded-3xl border border-slate-200/70 dark:border-slate-700/60 flex flex-col items-center justify-end min-h-[230px]">
            <div className="w-full flex items-end justify-around gap-2 sm:gap-4 h-48 pt-4">
              
              {/* Coluna 1: Entrada - Cápsula Arredondada com valor completo incluindo centavos */}
              <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                <span className="text-[11px] sm:text-xs font-black text-emerald-700 dark:text-emerald-400 text-center whitespace-nowrap leading-tight">
                  {formatCurrency(monthTotals.income)}
                </span>
                <div className="w-8 sm:w-9 bg-slate-200/80 dark:bg-slate-700/80 rounded-full h-36 flex items-end p-1 shadow-inner transition-all">
                  <div
                    style={{ height: `${getBarHeightPercent(monthTotals.income)}%` }}
                    className="w-full bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all duration-500 shadow-sm"
                  />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Entrada
                </span>
              </div>

              {/* Coluna 2: Saída - Cápsula Arredondada com valor completo incluindo centavos */}
              <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                <span className="text-[11px] sm:text-xs font-black text-rose-700 dark:text-rose-400 text-center whitespace-nowrap leading-tight">
                  {formatCurrency(monthTotals.expenses)}
                </span>
                <div className="w-8 sm:w-9 bg-slate-200/80 dark:bg-slate-700/80 rounded-full h-36 flex items-end p-1 shadow-inner transition-all">
                  <div
                    style={{ height: `${getBarHeightPercent(monthTotals.expenses)}%` }}
                    className="w-full bg-rose-500 dark:bg-rose-400 rounded-full transition-all duration-500 shadow-sm"
                  />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Saída
                </span>
              </div>

              {/* Coluna 3: Investimento - Cápsula Arredondada com valor completo incluindo centavos */}
              <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
                <span className="text-[11px] sm:text-xs font-black text-indigo-700 dark:text-indigo-400 text-center whitespace-nowrap leading-tight">
                  {formatCurrency(monthTotals.investments)}
                </span>
                <div className="w-8 sm:w-9 bg-slate-200/80 dark:bg-slate-700/80 rounded-full h-36 flex items-end p-1 shadow-inner transition-all">
                  <div
                    style={{ height: `${getBarHeightPercent(monthTotals.investments)}%` }}
                    className="w-full bg-indigo-500 dark:bg-indigo-400 rounded-full transition-all duration-500 shadow-sm"
                  />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Investimento
                </span>
              </div>

            </div>
          </div>

          {/* Lado Direito: Subtítulo "Balanço do mês" e valores ordenados */}
          <div className="flex flex-col justify-center space-y-3.5 bg-slate-50/80 dark:bg-slate-800/50 p-5 rounded-3xl border border-slate-200/70 dark:border-slate-700/60">
            <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight pb-1 border-b border-slate-200/60 dark:border-slate-700/60">
              Balanço do mês
            </h3>

            {/* Entrada */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-bold text-slate-600 dark:text-slate-300">
                Entrada
              </span>
              <span className="font-black text-emerald-700 dark:text-emerald-400">
                {formatCurrency(monthTotals.income)}
              </span>
            </div>

            {/* Saída */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-bold text-slate-600 dark:text-slate-300">
                Saída
              </span>
              <span className="font-black text-rose-700 dark:text-rose-400">
                {formatCurrency(monthTotals.expenses)}
              </span>
            </div>

            {/* Investimento */}
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="font-bold text-slate-600 dark:text-slate-300">
                Investimento
              </span>
              <span className="font-black text-indigo-700 dark:text-indigo-400">
                {formatCurrency(monthTotals.investments)}
              </span>
            </div>

            {/* O Balanço */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200/80 dark:border-slate-700/80">
              <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                Balanço
              </span>
              <span className={`text-base sm:text-lg font-black tracking-tight ${
                monthTotals.balance >= 0 
                  ? 'text-emerald-700 dark:text-emerald-400' 
                  : 'text-rose-600 dark:text-rose-400'
              }`}>
                {formatCurrency(monthTotals.balance)}
              </span>
            </div>

            {/* Em baixo centralizado: o status do balanço */}
            <div className="pt-2 flex justify-center">
              <span className={`inline-flex items-center gap-1.5 text-xs font-black px-4 py-1.5 rounded-full border shadow-2xs ${monthTotals.statusBadgeColor}`}>
                {monthTotals.balance >= 0 ? (
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <AlertCircle className="w-4 h-4 stroke-[2.5]" />
                )}
                <span>{monthTotals.statusText}</span>
              </span>
            </div>

          </div>

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 2. SEÇÃO CATEGORIAS (TOGGLE SAÍDAS / ENTRADAS, GRÁFICO CÍRCULO E BARRAS)  */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xs transition-colors">
        
        {/* Em cima à esquerda: "Saídas" e ao clicar altera para "Entradas" */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setCategoryViewType((prev) => (prev === 'expense' ? 'income' : 'expense'))}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm font-black transition-all shadow-xs cursor-pointer active:scale-95 ${
              categoryViewType === 'expense'
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
            title="Clique para alternar entre Saídas e Entradas"
          >
            <span>{categoryViewType === 'expense' ? 'Saídas' : 'Entradas'}</span>
            <ArrowLeftRight className="w-3.5 h-3.5 opacity-80" />
          </button>

          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
            {categoriesData.items.length} {categoryViewType === 'expense' ? 'categorias de gastos' : 'categorias de renda'}
          </span>
        </div>

        {/* Embaixo: Gráfico em círculo com "Total Gasto" e o valor no meio */}
        <div className="py-6 flex flex-col items-center justify-center">
          <div className="relative w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center">
            
            {/* SVG Donut Chart */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              {/* Trilha de fundo */}
              <circle
                cx="100"
                cy="100"
                r="72"
                fill="none"
                className="stroke-slate-100 dark:stroke-slate-800"
                strokeWidth="20"
              />

              {categoriesData.total === 0 ? (
                <circle
                  cx="100"
                  cy="100"
                  r="72"
                  fill="none"
                  className="stroke-slate-200 dark:stroke-slate-700"
                  strokeWidth="20"
                  strokeDasharray="452.39"
                  strokeDashoffset="0"
                />
              ) : (
                (() => {
                  const circumference = 2 * Math.PI * 72; // ~452.39
                  let accumulatedOffset = 0;

                  return categoriesData.items.map((cat, idx) => {
                    const strokeDash = (cat.percent / 100) * circumference;
                    const strokeOffset = -accumulatedOffset;
                    accumulatedOffset += strokeDash;

                    return (
                      <circle
                        key={idx}
                        cx="100"
                        cy="100"
                        r="72"
                        fill="none"
                        stroke={cat.color}
                        strokeWidth="20"
                        strokeDasharray={`${strokeDash} ${circumference}`}
                        strokeDashoffset={strokeOffset}
                        strokeLinecap="round"
                        className="transition-all duration-700"
                      />
                    );
                  });
                })()
              )}
            </svg>

            {/* No meio do círculo: "Total Gasto" (ou "Total Recebido") e o valor */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4 text-center">
              <span className="text-[11px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {categoryViewType === 'expense' ? 'Total Gasto' : 'Total Recebido'}
              </span>
              <span className={`text-base sm:text-lg font-black tracking-tight mt-0.5 ${
                categoryViewType === 'expense' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
              }`}>
                {formatCurrency(categoriesData.total)}
              </span>
            </div>

          </div>
        </div>

        {/* Em baixo: "Saídas por categoria" com nome, barra no meio e valor + porcentagem à direita */}
        <div className="pt-2 space-y-4">
          <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
            {categoryViewType === 'expense' ? 'Saídas por categoria' : 'Entradas por categoria'}
          </h3>

          {categoriesData.items.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400 font-medium">
              Nenhuma movimentação registrada nesta categoria neste mês.
            </div>
          ) : (
            <div className="space-y-3">
              {categoriesData.items.map((cat, idx) => {
                const visual = getCategoryVisual(cat.name);
                const IconComponent = visual.icon;

                return (
                  <div 
                    key={idx}
                    className="flex items-center gap-3 p-2.5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Categoria à esquerda (ícone + nome) */}
                    <div className="flex items-center gap-2.5 w-32 sm:w-40 shrink-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${visual.bgColor} ${visual.textColor} border ${visual.borderColor}`}>
                        <IconComponent className="w-4 h-4 stroke-[2.2]" />
                      </div>
                      <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                        {cat.name}
                      </span>
                    </div>

                    {/* No meio: uma barra para indicar a porcentagem */}
                    <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
                      <div
                        style={{ 
                          width: `${Math.max(cat.percent, 3)}%`,
                          backgroundColor: cat.color
                        }}
                        className="h-full rounded-full transition-all duration-500"
                      />
                    </div>

                    {/* Do lado direito: o valor e embaixo a porcentagem */}
                    <div className="w-24 sm:w-28 text-right shrink-0">
                      <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white block">
                        {formatCurrency(cat.amount)}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block">
                        {cat.percent.toFixed(1)}%
                      </span>
                    </div>

                  </div>
                );
              })}
            </div>
          )}

        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. SEÇÃO PATRIMÔNIO (CÁPSULAS DE TENDÊNCIA 12 MESES DO TOTAL DISPONÍVEL)  */}
      {/* ========================================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xs transition-colors">
        
        {/* Título: "Patrimônio" à esquerda e a referência "12 meses" à direita */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Patrimônio
          </h2>

          <span className="text-xs font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-xl border border-slate-200/60 dark:border-slate-700">
            12 meses
          </span>
        </div>

        {/* No bloco do gráfico: à esquerda saldo total e valor, à direita porcentagem e variação */}
        <div className="pt-5">
          <div className="flex items-start justify-between gap-4 pb-5">
            
            {/* Lado Esquerdo: "saldo total" e embaixo o valor disponível (Total Disponível da tela inicial) */}
            <div>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block uppercase tracking-wider">
                Saldo total
              </span>
              <span className={`text-xl sm:text-2xl font-black tracking-tight mt-0.5 block ${
                patrimonioData.saldoTotal >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {formatCurrency(patrimonioData.saldoTotal)}
              </span>
              <span className="text-[11px] font-medium text-slate-400 mt-0.5 block">
                Total disponível no mês
              </span>
            </div>

            {/* Lado Direito: porcentagem e embaixo o valor a mais ou a menos de patrimônio */}
            <div className="text-right">
              <span className={`inline-flex items-center gap-1 text-sm sm:text-base font-black ${
                patrimonioData.diff >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {patrimonioData.diff >= 0 ? (
                  <TrendingUp className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <TrendingDown className="w-4 h-4 stroke-[2.5]" />
                )}
                <span>{patrimonioData.diff >= 0 ? `+${patrimonioData.percentage.toFixed(1)}%` : `${patrimonioData.percentage.toFixed(1)}%`}</span>
              </span>

              <span className={`text-xs sm:text-sm font-bold block mt-0.5 ${
                patrimonioData.diff >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
              }`}>
                {patrimonioData.diff >= 0 ? `+${formatCurrency(patrimonioData.diff)}` : formatCurrency(patrimonioData.diff)}
              </span>
              <span className="text-[10px] font-medium text-slate-400 block mt-0.5">
                Variação em 12 meses
              </span>
            </div>

          </div>

          {/* GRÁFICO DE PATRIMÔNIO: CÁPSULAS DE TENDÊNCIA 12 MESES COM O MÊS ATUAL EM DESTAQUE */}
          <div className="bg-slate-50/80 dark:bg-slate-800/50 p-4 sm:p-5 rounded-3xl border border-slate-200/70 dark:border-slate-700/60">
            <div className="pt-2">
              <div className="flex items-end justify-between gap-1.5 sm:gap-2.5 h-44 pb-2">
                {patrimonioData.monthlySeries.map((m, idx) => {
                  const isCurrent = m.name === currentMonth;
                  const val = m.totalDisponivel;
                  const maxSpan = Math.max(patrimonioData.maxVal, 100);
                  // Altura percentual da barra
                  const heightPercent = Math.min(Math.max((Math.abs(val) / maxSpan) * 100, 12), 100);
                  const isPositive = val >= 0;

                  return (
                    <div
                      key={idx}
                      onClick={() => onSelectMonth(m.name)}
                      className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer"
                      title={`${m.name}: ${formatCurrency(val)}`}
                    >
                      {/* Valor flutuante no mês selecionado */}
                      {isCurrent && (
                        <div className="mb-1.5 animate-bounce">
                          <span className="text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-xs whitespace-nowrap">
                            {formatCurrency(val)}
                          </span>
                        </div>
                      )}

                      {/* Trilha da Cápsula Arredondada */}
                      <div className={`w-full max-w-[28px] rounded-full h-32 flex items-end p-1 transition-all ${
                        isCurrent 
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 ring-2 ring-emerald-500/40' 
                          : 'bg-slate-200/70 dark:bg-slate-700/60 group-hover:bg-slate-300 dark:group-hover:bg-slate-600'
                      }`}>
                        {/* Barra de preenchimento interna arredondada */}
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-full transition-all duration-500 ${
                            isCurrent
                              ? 'bg-emerald-500 dark:bg-emerald-400 shadow-sm'
                              : isPositive
                              ? 'bg-indigo-400/80 dark:bg-indigo-500/80 group-hover:bg-indigo-500'
                              : 'bg-rose-400/80 dark:bg-rose-500/80 group-hover:bg-rose-500'
                          }`}
                        />
                      </div>

                      {/* Rótulo do Mês */}
                      <span className={`text-[10px] sm:text-[11px] font-extrabold uppercase mt-2 transition-colors ${
                        isCurrent
                          ? 'text-emerald-700 dark:text-emerald-400 scale-105'
                          : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white'
                      }`}>
                        {m.shortName}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
