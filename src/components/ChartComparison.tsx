import React, { useState } from 'react';
import { BarChart3, PieChart, Info, ArrowLeftRight, TrendingUp } from 'lucide-react';
import { Transaction } from '../types';
import { monthlyHistoryData } from '../data/mockData';
import { formatCurrency } from '../utils/finance';

interface ChartComparisonProps {
  transactions: Transaction[];
  currentIncome?: number;
  currentExpense: number;
  currentInvestment: number;
}

export const ChartComparison: React.FC<ChartComparisonProps> = ({
  transactions,
  currentIncome = 0,
  currentExpense,
  currentInvestment,
}) => {
  const [activeTab, setActiveTab] = useState<'income_expense' | 'expense_investment' | 'categories'>('income_expense');
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null);

  // Group current expenses by category
  const categoryMap: Record<string, number> = {};
  transactions
    .filter((tx) => tx.type === 'expense')
    .forEach((tx) => {
      categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
    });

  const categoryList = Object.entries(categoryMap)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: currentExpense > 0 ? (amount / currentExpense) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Use dynamic current month numbers for the latest month bar
  const history = monthlyHistoryData.map((item) => {
    if (item.month.includes('Set')) {
      return {
        ...item,
        ganhos: currentIncome,
        gastos: currentExpense,
        investimentos: currentInvestment,
      };
    }
    return {
      ...item,
      ganhos: item.entradas ?? 0,
      gastos: item.gastos ?? 0,
      investimentos: item.investimentos ?? 0,
    };
  });

  const isIncomeExpense = activeTab === 'income_expense';
  const isExpenseInvestment = activeTab === 'expense_investment';

  const maxVal = Math.max(
    ...history.flatMap((h) => 
      isIncomeExpense 
        ? [h.ganhos, h.gastos, 1000] 
        : [h.gastos, h.investimentos, 1000]
    )
  ) * 1.15;

  const currentBalance = currentIncome - currentExpense;
  const ratio = currentExpense > 0 ? (currentInvestment / currentExpense) * 100 : 0;

  const getBarHeight = (value: number) => {
    if (value <= 0 || maxVal <= 0) return 0;
    return Math.max(4, (value / maxVal) * 100);
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
      
      {/* Header with toggle and title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              {isIncomeExpense 
                ? 'Análise Gráfica: Entradas vs Saídas' 
                : isExpenseInvestment 
                ? 'Análise Gráfica: Saídas vs Investimentos' 
                : 'Distribuição de Saídas por Categoria'}
            </h3>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-md border ${
              isIncomeExpense
                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                : isExpenseInvestment
                ? 'bg-indigo-50 text-indigo-700 border-indigo-100'
                : 'bg-rose-50 text-rose-700 border-rose-100'
            }`}>
              {isIncomeExpense ? 'Entradas x Saídas' : isExpenseInvestment ? 'Saídas x Investido' : 'Detalhamento'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {isIncomeExpense 
              ? 'Acompanhe a relação direta entre o dinheiro que entra e o que sai todo mês'
              : isExpenseInvestment
              ? 'Acompanhe a proporção entre o que você consome e o que constrói de patrimônio'
              : 'Veja onde está concentrada a maior parte do seu orçamento mensal'}
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex flex-wrap items-center bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200/60 gap-1">
          <button
            id="tab-chart-income-expense-btn"
            onClick={() => setActiveTab('income_expense')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              isIncomeExpense
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5 text-emerald-600" />
            Entradas vs Saídas
          </button>
          
          <button
            id="tab-chart-comparison-btn"
            onClick={() => setActiveTab('expense_investment')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              isExpenseInvestment
                ? 'bg-white text-indigo-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
            Saídas vs Investido
          </button>

          <button
            id="tab-chart-categories-btn"
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              activeTab === 'categories'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PieChart className="w-3.5 h-3.5 text-rose-500" />
            Categorias
          </button>
        </div>
      </div>

      {/* Main Charts View */}
      {isIncomeExpense ? (
        <div className="mt-5">
          {/* Quick Indicators: Ganhos vs Gastos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-800">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Ganhos deste Mês
              </div>
              <div className="text-lg font-bold text-emerald-950 mt-1">
                {formatCurrency(currentIncome)}
              </div>
            </div>

            <div className="bg-rose-50/60 p-3 rounded-xl border border-rose-100">
              <div className="flex items-center gap-1.5 text-xs font-medium text-rose-700">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Saídas deste Mês
              </div>
              <div className="text-lg font-bold text-rose-950 mt-1">
                {formatCurrency(currentExpense)}
              </div>
            </div>

            <div className={`col-span-2 sm:col-span-1 p-3 rounded-xl border flex flex-col justify-center ${
              currentBalance < 0 
                ? 'bg-rose-50/40 border-rose-200/80' 
                : 'bg-emerald-50/40 border-emerald-200/80'
            }`}>
              <div className="text-xs font-medium text-slate-600">Saldo do Mês (Sobra Líquida)</div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className={`text-lg font-bold ${
                  currentBalance < 0 ? 'text-rose-700' : 'text-emerald-800'
                }`}>
                  {currentBalance >= 0 ? `+${formatCurrency(currentBalance)}` : formatCurrency(currentBalance)}
                </span>
                <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded-sm ${
                  currentBalance < 0 ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {currentBalance < 0 ? 'Déficit' : 'No Azul'}
                </span>
              </div>
            </div>
          </div>

          {/* SVG/CSS Bar Chart: Entradas vs Saídas */}
          <div className="relative h-64 sm:h-72 w-full pt-4">
            
            {/* Legend */}
            <div className="flex items-center justify-end gap-5 text-xs font-medium text-slate-600 mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-emerald-600" />
                <span>Entradas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-rose-500" />
                <span>Saídas</span>
              </div>
            </div>

            {/* Grid & Bars Container */}
            <div className="h-48 sm:h-54 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-slate-200">
              {history.map((item) => {
                const incomeHeight = getBarHeight(item.ganhos);
                const expenseHeight = getBarHeight(item.gastos);
                const isCurrent = item.month.includes('Set');

                return (
                  <div
                    key={item.month}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative"
                    onMouseEnter={() => setHoveredMonth(item.month)}
                    onMouseLeave={() => setHoveredMonth(null)}
                  >
                    {/* Tooltip on hover */}
                    {hoveredMonth === item.month && (
                      <div className="absolute -top-16 bg-slate-900 text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-lg z-20 whitespace-nowrap pointer-events-none transition-all">
                        <div className="font-bold text-slate-200">{item.month}</div>
                        <div className="text-emerald-400">Ganhos: {formatCurrency(item.ganhos)}</div>
                        <div className="text-rose-300">Gastos: {formatCurrency(item.gastos)}</div>
                        <div className="text-slate-300 text-[10px]">
                          Saldo: {formatCurrency(item.ganhos - item.gastos)}
                        </div>
                      </div>
                    )}

                    {/* Bars pair */}
                    <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-full">
                      {/* Income Bar */}
                      <div
                        className={`w-1/2 max-w-[28px] rounded-t-md transition-all duration-300 ${
                          isCurrent 
                            ? 'bg-emerald-600 ring-2 ring-emerald-300/60' 
                            : 'bg-emerald-500/85 hover:bg-emerald-600'
                        }`}
                        style={{ height: `${incomeHeight}%` }}
                        title={`${item.month} - Ganhos: ${formatCurrency(item.ganhos)}`}
                      />

                      {/* Expense Bar */}
                      <div
                        className={`w-1/2 max-w-[28px] rounded-t-md transition-all duration-300 ${
                          isCurrent 
                            ? 'bg-rose-500 ring-2 ring-rose-300/60' 
                            : 'bg-rose-400/85 hover:bg-rose-500'
                        }`}
                        style={{ height: `${expenseHeight}%` }}
                        title={`${item.month} - Gastos: ${formatCurrency(item.gastos)}`}
                      />
                    </div>

                    {/* Month label */}
                    <span className={`text-[11px] font-semibold mt-2 ${
                      isCurrent ? 'text-emerald-700 font-bold' : 'text-slate-500'
                    }`}>
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Bottom info caption */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2 px-1">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                Quanto maior a barra verde em relação à vermelha, maior é a sua folga e segurança financeira.
              </span>
            </div>

          </div>
        </div>
      ) : isExpenseInvestment ? (
        <div className="mt-5">
          {/* Quick Indicators: Gastos vs Investimentos */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            <div className="bg-rose-50/50 p-3 rounded-xl border border-rose-100">
              <div className="flex items-center gap-1.5 text-xs font-medium text-rose-700">
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                Gastos deste Mês
              </div>
              <div className="text-lg font-bold text-rose-950 mt-1">
                {formatCurrency(currentExpense)}
              </div>
            </div>

            <div className="bg-indigo-50/50 p-3 rounded-xl border border-indigo-100">
              <div className="flex items-center gap-1.5 text-xs font-medium text-indigo-700">
                <span className="w-2 h-2 rounded-full bg-indigo-600" />
                Investido no Mês
              </div>
              <div className="text-lg font-bold text-indigo-950 mt-1">
                {formatCurrency(currentInvestment)}
              </div>
            </div>

            <div className="col-span-2 sm:col-span-1 bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex flex-col justify-center">
              <div className="text-xs font-medium text-slate-600">Relação Investimento/Gasto</div>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-lg font-bold text-slate-900">
                  {ratio.toFixed(0)}%
                </span>
                <span className="text-[11px] text-slate-500 font-medium">
                  (Ideal: &ge; 25%)
                </span>
              </div>
            </div>
          </div>

          {/* SVG Bar Chart: Gastos vs Investido */}
          <div className="relative h-64 sm:h-72 w-full pt-4">
            
            {/* Legend */}
            <div className="flex items-center justify-end gap-5 text-xs font-medium text-slate-600 mb-2">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-rose-500" />
                <span>Gastos Mensais</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-indigo-600" />
                <span>Valor Investido</span>
              </div>
            </div>

            {/* Grid & Bars Container */}
            <div className="h-48 sm:h-54 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-slate-200">
              {history.map((item) => {
                const expenseHeight = getBarHeight(item.gastos);
                const investHeight = getBarHeight(item.investimentos);
                const isCurrent = item.month.includes('Set');

                return (
                  <div
                    key={item.month}
                    className="flex-1 flex flex-col items-center h-full justify-end group relative"
                    onMouseEnter={() => setHoveredMonth(item.month)}
                    onMouseLeave={() => setHoveredMonth(null)}
                  >
                    {/* Tooltip on hover */}
                    {hoveredMonth === item.month && (
                      <div className="absolute -top-16 bg-slate-900 text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-lg z-20 whitespace-nowrap pointer-events-none transition-all">
                        <div className="font-bold text-slate-200">{item.month}</div>
                        <div className="text-rose-300">Gastos: {formatCurrency(item.gastos)}</div>
                        <div className="text-indigo-300">Investido: {formatCurrency(item.investimentos)}</div>
                      </div>
                    )}

                    {/* Bars pair */}
                    <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-full">
                      {/* Expense Bar */}
                      <div
                        className={`w-1/2 max-w-[28px] rounded-t-md transition-all duration-300 ${
                          isCurrent 
                            ? 'bg-rose-500 ring-2 ring-rose-300/60' 
                            : 'bg-rose-400/85 hover:bg-rose-500'
                        }`}
                        style={{ height: `${expenseHeight}%` }}
                        title={`${item.month} - Gastos: ${formatCurrency(item.gastos)}`}
                      />

                      {/* Investment Bar */}
                      <div
                        className={`w-1/2 max-w-[28px] rounded-t-md transition-all duration-300 ${
                          isCurrent 
                            ? 'bg-indigo-600 ring-2 ring-indigo-300/60' 
                            : 'bg-indigo-500/85 hover:bg-indigo-600'
                        }`}
                        style={{ height: `${investHeight}%` }}
                        title={`${item.month} - Investido: ${formatCurrency(item.investimentos)}`}
                      />
                    </div>

                    {/* Month label */}
                    <span className={`text-[11px] font-semibold mt-2 ${
                      isCurrent ? 'text-indigo-700 font-bold' : 'text-slate-500'
                    }`}>
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Bottom info caption */}
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2 px-1">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span>
                Quanto maior a barra roxa em relação à vermelha, mais saudável é o seu ritmo de acúmulo financeiro.
              </span>
            </div>

          </div>
        </div>
      ) : (
        /* Categories distribution view */
        <div className="mt-5 space-y-4">
          <div className="text-xs text-slate-500 font-medium">
            Detalhamento de todos os gastos deste mês por categoria:
          </div>

          {categoryList.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Nenhuma despesa cadastrada ainda para exibir o gráfico de categorias.
            </div>
          ) : (
            <div className="space-y-3">
              {categoryList.map((cat, idx) => (
                <div key={cat.category} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-600">
                        {idx + 1}
                      </span>
                      {cat.category}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{formatCurrency(cat.amount)}</span>
                      <span className="text-slate-500 font-medium text-[11px]">
                        ({cat.percentage.toFixed(1)}%)
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        idx === 0
                          ? 'bg-rose-500'
                          : idx === 1
                          ? 'bg-amber-500'
                          : 'bg-indigo-500'
                      }`}
                      style={{ width: `${Math.min(100, Math.max(3, cat.percentage))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
