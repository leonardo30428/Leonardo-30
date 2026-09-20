import React, { useMemo, useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  TrendingDown, 
  ArrowLeftRight,
  CheckCircle2,
  AlertCircle,
  SlidersHorizontal
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
  onOpenMonthlyPdfReport?: () => void;
}

export const MonthlyBalanceTab: React.FC<MonthlyBalanceTabProps> = ({
  transactions,
  months,
  currentMonth,
  onSelectMonth,
  onOpenMonthlyPdfReport,
}) => {
  // Estado para alternar entre "Saídas" e "Entradas" por categoria
  const [categoryViewType, setCategoryViewType] = useState<'expense' | 'income'>('expense');
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; val: number; name: string } | null>(null);

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

  // Percentuais de Entrada, Saída e Investimento sobre o total movimentado no mês
  const totalMovement = monthTotals.income + monthTotals.expenses + monthTotals.investments;
  const incomePercent = totalMovement > 0 ? (monthTotals.income / totalMovement) * 100 : 0;
  const expensePercent = totalMovement > 0 ? (monthTotals.expenses / totalMovement) * 100 : 0;
  const investmentPercent = totalMovement > 0 ? (monthTotals.investments / totalMovement) * 100 : 0;

  const formatPercent = (pct: number) => {
    if (pct <= 0) return '0%';
    return `${pct.toFixed(pct % 1 === 0 ? 0 : 1).replace('.', ',')}%`;
  };

  // Altura máxima para o gráfico de barras verticais em porcentagem
  const maxPercent = Math.max(incomePercent, expensePercent, investmentPercent, 1);

  // Calcula a altura percentual da cápsula arredondada baseada na porcentagem
  const getBarHeightPercent = (pct: number) => {
    if (pct <= 0) return 0;
    const height = (pct / maxPercent) * 100;
    return Math.min(Math.max(height, 12), 100);
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

  // 3. Cálculos de Patrimônio (12 Meses Móveis) - IDÊNTICO À IMAGEM DE REFERÊNCIA
  const patrimonioData = useMemo(() => {
    const monthNames = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    const shortNames = [
      'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
      'jul', 'ago', 'set', 'out', 'nov', 'dez'
    ];

    const parts = currentMonth.split(' ');
    const mName = parts[0]?.toLowerCase();
    const year = parseInt(parts[1] || '2026', 10);
    let curMonthIdx = monthNames.indexOf(mName);
    if (curMonthIdx === -1) curMonthIdx = 8; // default Setembro (8)

    // Gera exatamente os 12 meses anteriores até o mês atual (ex: out, nov, dez, jan... ago, set)
    const monthlySeries = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date(year, curMonthIdx - i, 1);
      const mIdx = d.getMonth();
      const y = d.getFullYear();
      const key = `${y}-${String(mIdx + 1).padStart(2, '0')}`;
      const txs = transactions.filter((t) => t.date && t.date.startsWith(key));
      const summary = calculateSummary(txs);
      const totalDisponivel = summary.balance;

      const fullCapName = `${monthNames[mIdx].charAt(0).toUpperCase() + monthNames[mIdx].slice(1)} ${y}`;

      monthlySeries.push({
        name: fullCapName,
        shortName: shortNames[mIdx],
        key,
        totalDisponivel,
      });
    }

    // Total disponível do mês ativo (saldo total)
    const activeSummary = calculateSummary(monthTransactions);
    const saldoTotal = activeSummary.balance;

    // Variação em relação ao início da série de 12 meses
    const initialDisponivel = monthlySeries.length > 0 ? monthlySeries[0].totalDisponivel : 0;
    const diff = saldoTotal - initialDisponivel;
    const percentage = initialDisponivel !== 0
      ? (diff / Math.abs(initialDisponivel)) * 100
      : (saldoTotal !== 0 ? 0.0 : 0.0);

    // Escala e valores para marcações no eixo Y idênticas ao print
    const allValues = monthlySeries.map((m) => m.totalDisponivel);
    const maxVal = Math.max(...allValues, saldoTotal, 1);
    const minVal = Math.min(...allValues, saldoTotal, 0);

    // Limites superior e inferior arredondados para escala visual
    const ceiling = maxVal <= 10 ? Math.ceil(maxVal * 1.08) : Math.ceil(maxVal * 1.15);
    const floor = minVal < 0 ? Math.floor(minVal * 1.1) : 0;
    const span = Math.max(ceiling - floor, 1);

    const ticks = [
      ceiling,
      Math.round(floor + span * 0.75),
      Math.round(floor + span * 0.5),
      Math.round(floor + span * 0.25),
      floor,
    ];

    return {
      saldoTotal,
      diff,
      percentage,
      monthlySeries,
      maxVal,
      minVal,
      ceiling,
      floor,
      span,
      ticks,
    };
  }, [currentMonth, transactions, monthTransactions]);

  // Pontos geométricos e curvas SVG suaves (Spline Cúbico)
  const chartPoints = useMemo(() => {
    const width = 460;
    const height = 135;
    const topPad = 10;
    const botPad = 4;
    const chartHeight = height - topPad - botPad;

    const points = patrimonioData.monthlySeries.map((m, i) => {
      const x = (i / (patrimonioData.monthlySeries.length - 1)) * width;
      const norm = (m.totalDisponivel - patrimonioData.floor) / patrimonioData.span;
      const clampedNorm = Math.max(0, Math.min(1, norm));
      const y = topPad + (1 - clampedNorm) * chartHeight;
      return { x, y, val: m.totalDisponivel, name: m.name, shortName: m.shortName };
    });

    // Spline cúbico contínuo
    let linePath = '';
    if (points.length > 0) {
      linePath = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i === 0 ? 0 : i - 1];
        const p1 = points[i];
        const p2 = points[i + 1];
        const p3 = points[i + 2 < points.length ? i + 2 : points.length - 1];

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;

        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        linePath += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
      }
    }

    const baselineY = height;
    const areaPath = points.length > 0
      ? `${linePath} L ${points[points.length - 1].x.toFixed(1)} ${baselineY} L ${points[0].x.toFixed(1)} ${baselineY} Z`
      : '';

    return {
      points,
      linePath,
      areaPath,
      width,
      height,
      baselineY,
    };
  }, [patrimonioData]);

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
              
              {/* Coluna 1: Entrada - Exibe Porcentagem ao invés do valor numérico */}
              <div 
                className="flex flex-col items-center gap-2 flex-1 min-w-0"
                title={`Entradas: ${formatCurrency(monthTotals.income)} (${formatPercent(incomePercent)})`}
              >
                <span className="text-xs sm:text-sm font-black text-emerald-700 dark:text-emerald-400 text-center whitespace-nowrap leading-tight">
                  {formatPercent(incomePercent)}
                </span>
                <div className="w-8 sm:w-9 bg-slate-200/80 dark:bg-slate-700/80 rounded-full h-36 flex items-end p-1 shadow-inner transition-all">
                  <div
                    style={{ height: `${getBarHeightPercent(incomePercent)}%` }}
                    className="w-full bg-emerald-500 dark:bg-emerald-400 rounded-full transition-all duration-500 shadow-sm"
                  />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Entrada
                </span>
              </div>

              {/* Coluna 2: Saída - Exibe Porcentagem ao invés do valor numérico */}
              <div 
                className="flex flex-col items-center gap-2 flex-1 min-w-0"
                title={`Saídas: ${formatCurrency(monthTotals.expenses)} (${formatPercent(expensePercent)})`}
              >
                <span className="text-xs sm:text-sm font-black text-rose-700 dark:text-rose-400 text-center whitespace-nowrap leading-tight">
                  {formatPercent(expensePercent)}
                </span>
                <div className="w-8 sm:w-9 bg-slate-200/80 dark:bg-slate-700/80 rounded-full h-36 flex items-end p-1 shadow-inner transition-all">
                  <div
                    style={{ height: `${getBarHeightPercent(expensePercent)}%` }}
                    className="w-full bg-rose-500 dark:bg-rose-400 rounded-full transition-all duration-500 shadow-sm"
                  />
                </div>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Saída
                </span>
              </div>

              {/* Coluna 3: Investimento - Exibe Porcentagem ao invés do valor numérico */}
              <div 
                className="flex flex-col items-center gap-2 flex-1 min-w-0"
                title={`Investimentos: ${formatCurrency(monthTotals.investments)} (${formatPercent(investmentPercent)})`}
              >
                <span className="text-xs sm:text-sm font-black text-indigo-700 dark:text-indigo-400 text-center whitespace-nowrap leading-tight">
                  {formatPercent(investmentPercent)}
                </span>
                <div className="w-8 sm:w-9 bg-slate-200/80 dark:bg-slate-700/80 rounded-full h-36 flex items-end p-1 shadow-inner transition-all">
                  <div
                    style={{ height: `${getBarHeightPercent(investmentPercent)}%` }}
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
      {/* 3. SEÇÃO PATRIMÔNIO (GRÁFICO DE ÁREA 12 MESES IDÊNTICO À IMAGEM)           */}
      {/* ========================================================================= */}
      <div className="space-y-3">
        
        {/* Título: "Patrimônio" à esquerda e a referência "12 meses" à direita */}
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Patrimônio
          </h2>

          <span className="text-xs font-semibold text-slate-400 dark:text-slate-400">
            12 meses
          </span>
        </div>

        {/* Card Escuro de Patrimônio Idêntico à Imagem */}
        <div className="bg-[#12191d] dark:bg-[#12191d] text-white rounded-3xl p-5 sm:p-6 border border-[#1c272d] shadow-sm">
          
          {/* Topo do Card: Saldo Total à esquerda e Badge Verde de Variação à direita */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <span className="text-xs font-semibold text-[#82959e] block tracking-wide">
                Saldo total
              </span>
              <span className="text-2xl sm:text-3xl font-black tracking-tight text-white block mt-0.5">
                {formatCurrency(patrimonioData.saldoTotal)}
              </span>
            </div>

            {/* Pill arredondada com porcentagem e valor */}
            <div className="bg-[#13372c] border border-[#1b4d3e] rounded-2xl px-3.5 py-1.5 flex flex-col items-end min-w-[85px]">
              <span className="text-xs sm:text-sm font-black text-[#34d399] leading-tight">
                {patrimonioData.diff >= 0 ? `+${patrimonioData.percentage.toFixed(1)}%` : `${patrimonioData.percentage.toFixed(1)}%`}
              </span>
              <span className="text-[11px] font-bold text-[#34d399] leading-tight">
                {patrimonioData.diff >= 0 ? `+${formatCurrency(patrimonioData.saldoTotal)}` : formatCurrency(patrimonioData.saldoTotal)}
              </span>
            </div>
          </div>

          {/* Gráfico de Área 12 Meses com Eixo Y à Esquerda */}
          <div className="flex items-stretch gap-2 pt-2">
            
            {/* Eixo Y com 5 valores monetários (ex: R$ 6, R$ 4, R$ 3, R$ 1, R$ 0) */}
            <div className="w-12 sm:w-14 shrink-0 flex flex-col justify-between py-1 text-left text-[11px] font-medium text-[#607179] h-36 select-none">
              {patrimonioData.ticks.map((t, idx) => (
                <span key={idx} className="whitespace-nowrap">
                  R$ {t}
                </span>
              ))}
            </div>

            {/* Área do Gráfico SVG e Linha dos 12 Meses */}
            <div className="flex-1 relative flex flex-col justify-between overflow-visible min-w-0">
              <div className="relative h-36 w-full">
                <svg viewBox="0 0 460 135" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="patrimonioGlowArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.45" />
                      <stop offset="60%" stopColor="#2dd4bf" stopOpacity="0.15" />
                      <stop offset="100%" stopColor="#2dd4bf" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Preenchimento gradiente sob a curva */}
                  {chartPoints.areaPath && (
                    <path d={chartPoints.areaPath} fill="url(#patrimonioGlowArea)" />
                  )}

                  {/* Linha da curva suave contínua em verde-água brilhante */}
                  {chartPoints.linePath && (
                    <path 
                      d={chartPoints.linePath} 
                      fill="none" 
                      stroke="#2dd4bf" 
                      strokeWidth="2.5" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                  )}

                  {/* Ponto de destaque no mês ativo (último mês da série) */}
                  {chartPoints.points.length > 0 && (
                    <>
                      <circle 
                        cx={chartPoints.points[chartPoints.points.length - 1].x} 
                        cy={chartPoints.points[chartPoints.points.length - 1].y} 
                        r="3.5" 
                        fill="#2dd4bf" 
                      />
                      <circle 
                        cx={chartPoints.points[chartPoints.points.length - 1].x} 
                        cy={chartPoints.points[chartPoints.points.length - 1].y} 
                        r="8" 
                        fill="#2dd4bf" 
                        fillOpacity="0.25" 
                      />
                    </>
                  )}

                  {/* Indicador ao passar o mouse */}
                  {hoveredPoint && (
                    <circle 
                      cx={hoveredPoint.x} 
                      cy={hoveredPoint.y} 
                      r="4.5" 
                      fill="#2dd4bf" 
                      stroke="#ffffff" 
                      strokeWidth="2" 
                    />
                  )}
                </svg>

                {/* Tooltip flutuante ao passar o mouse */}
                {hoveredPoint && (
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-[#1b262c] text-white text-[11px] px-2.5 py-1 rounded-xl shadow-lg border border-[#2b3a42] pointer-events-none z-10 whitespace-nowrap">
                    <span className="font-bold text-[#2dd4bf]">{hoveredPoint.name}: </span>
                    <span className="font-semibold">{formatCurrency(hoveredPoint.val)}</span>
                  </div>
                )}
              </div>

              {/* Linha horizontal de base */}
              <div className="w-full h-px bg-[#1e2a2f] mt-1" />

              {/* Rótulos dos 12 meses idênticos à imagem: out nov dez jan fev mar abr mai jun jul ago set */}
              <div className="w-full flex justify-between items-center pt-1.5 px-0.5">
                {chartPoints.points.map((pt, i) => {
                  const isCurrent = i === chartPoints.points.length - 1;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => onSelectMonth(pt.name)}
                      onMouseEnter={() => setHoveredPoint({ x: pt.x, y: pt.y, val: pt.val, name: pt.name })}
                      onMouseLeave={() => setHoveredPoint(null)}
                      className={`text-[10px] sm:text-[11px] font-medium transition-colors cursor-pointer text-center ${
                        isCurrent 
                          ? 'text-[#2dd4bf] font-bold' 
                          : 'text-[#607179] hover:text-white'
                      }`}
                      title={`${pt.name}: ${formatCurrency(pt.val)}`}
                    >
                      {pt.shortName}
                    </button>
                  );
                })}
              </div>

            </div>

          </div>

        </div>

        {/* Card: Relatórios avançados idêntico à imagem */}
        <div 
          onClick={onOpenMonthlyPdfReport}
          className="bg-[#12191d] dark:bg-[#12191d] border border-[#1c272d] rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-[#182328] transition-colors"
          title="Ver relatórios completos em PDF"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1a262b] flex items-center justify-center text-[#2dd4bf] shrink-0">
              <TrendingUp className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white tracking-tight">
                Relatórios avançados
              </h4>
              <p className="text-xs text-[#82959e] truncate max-w-[200px] sm:max-w-xs">
                Fixas vs variáveis, comparativo, fluxo de ca...
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-[#607179]" />
        </div>

        {/* Ação centralizada: Personalizar análise */}
        <div className="flex justify-center pt-2 pb-1">
          <button
            type="button"
            onClick={onOpenMonthlyPdfReport}
            className="inline-flex items-center gap-2 text-xs font-semibold text-[#82959e] hover:text-white transition-colors cursor-pointer py-1 px-3 rounded-xl hover:bg-[#182328]"
          >
            <SlidersHorizontal className="w-4 h-4 stroke-[2]" />
            <span>Personalizar análise</span>
          </button>
        </div>

      </div>

    </div>
  );
};
