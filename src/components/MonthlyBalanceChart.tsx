import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Legend,
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  LineChart as LineChartIcon, 
  Calendar, 
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Wallet
} from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency, formatCompactCurrency } from '../utils/finance';
import { getMonthKey, MONTH_NAMES, DEFAULT_MONTHS_LIST } from '../utils/dateUtils';
import { useTheme } from '../context/ThemeContext';

export interface MonthlyBalanceChartProps {
  transactions: Transaction[];
  currentMonth?: string;
  availableMonths?: string[];
  onSelectMonth?: (monthName: string) => void;
}

type ChartViewType = 'saldo' | 'comparativo' | 'acumulado';

interface MonthDataPoint {
  monthKey: string;
  shortName: string;
  fullName: string;
  income: number;
  expenses: number;
  balance: number;
  cumulativeBalance: number;
  txCount: number;
}

export const MonthlyBalanceChart: React.FC<MonthlyBalanceChartProps> = ({
  transactions,
  currentMonth,
  availableMonths = DEFAULT_MONTHS_LIST,
  onSelectMonth,
}) => {
  const { isDark } = useTheme();
  const [chartView, setChartView] = useState<ChartViewType>('saldo');
  const [scope, setScope] = useState<'withData' | 'allMonths'>('withData');

  // Process data for each month
  const chartData = useMemo<MonthDataPoint[]>(() => {
    // 1. Group transactions by month key (YYYY-MM)
    const monthMap = new Map<string, { income: number; expenses: number; count: number }>();

    transactions.forEach((tx) => {
      if (!tx.date) return;
      const key = tx.date.substring(0, 7); // e.g. "2026-09"
      const existing = monthMap.get(key) || { income: 0, expenses: 0, count: 0 };

      if (tx.type === 'income') {
        existing.income += tx.amount;
      } else if (tx.type === 'expense' || tx.type === 'investment') {
        existing.expenses += tx.amount;
      }
      existing.count += 1;
      monthMap.set(key, existing);
    });

    // 2. Identify list of months to display
    let monthKeysToUse: string[] = [];

    if (scope === 'allMonths') {
      // Use available months list (e.g. 2026 to 2027)
      monthKeysToUse = availableMonths.map((m) => getMonthKey(m));
    } else {
      // Use months that have transactions + currentMonth if not present
      const keysWithData = Array.from(monthMap.keys()).sort();
      if (currentMonth) {
        const curKey = getMonthKey(currentMonth);
        if (!keysWithData.includes(curKey)) {
          keysWithData.push(curKey);
          keysWithData.sort();
        }
      }
      // If no transactions at all, fall back to current year months up to 6 months
      if (keysWithData.length === 0) {
        monthKeysToUse = availableMonths.slice(0, 6).map((m) => getMonthKey(m));
      } else {
        monthKeysToUse = keysWithData;
      }
    }

    // 3. Build data points with cumulative balance calculation
    let runningCumulative = 0;
    const points: MonthDataPoint[] = [];

    monthKeysToUse.forEach((key) => {
      const [yearStr, monthStr] = key.split('-');
      const mIndex = parseInt(monthStr, 10) - 1;
      const monthName = MONTH_NAMES[mIndex] || 'Mês';
      const shortName = `${monthName.substring(0, 3)}/${yearStr.substring(2)}`;
      const fullName = `${monthName} ${yearStr}`;

      const raw = monthMap.get(key) || { income: 0, expenses: 0, count: 0 };
      const balance = raw.income - raw.expenses;
      runningCumulative += balance;

      points.push({
        monthKey: key,
        shortName,
        fullName,
        income: Math.round(raw.income * 100) / 100,
        expenses: Math.round(raw.expenses * 100) / 100,
        balance: Math.round(balance * 100) / 100,
        cumulativeBalance: Math.round(runningCumulative * 100) / 100,
        txCount: raw.count,
      });
    });

    return points;
  }, [transactions, availableMonths, currentMonth, scope]);

  // Key metrics calculation for header cards
  const stats = useMemo(() => {
    if (chartData.length === 0) {
      return {
        avgBalance: 0,
        bestMonth: null as MonthDataPoint | null,
        totalNet: 0,
        positiveMonthsCount: 0,
      };
    }

    const dataPointsWithActivity = chartData.filter((d) => d.txCount > 0 || d.income > 0 || d.expenses > 0);
    const pool = dataPointsWithActivity.length > 0 ? dataPointsWithActivity : chartData;

    const totalNet = pool.reduce((acc, d) => acc + d.balance, 0);
    const avgBalance = totalNet / pool.length;

    let bestMonth = pool[0];
    let positiveCount = 0;

    pool.forEach((d) => {
      if (d.balance > bestMonth.balance) {
        bestMonth = d;
      }
      if (d.balance > 0) {
        positiveCount++;
      }
    });

    return {
      avgBalance,
      bestMonth,
      totalNet,
      positiveMonthsCount: positiveCount,
    };
  }, [chartData]);

  // Color definitions according to current theme
  const gridColor = isDark ? '#334155' : '#f1f5f9';
  const textColor = isDark ? '#94a3b8' : '#64748b';
  const zeroLineColor = isDark ? '#475569' : '#cbd5e1';

  // Custom tooltip for recharts
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: MonthDataPoint = payload[0].payload;
      const isPositive = data.balance >= 0;

      return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-xl text-xs space-y-2 min-w-[200px]">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
            <span className="font-extrabold text-slate-900 dark:text-white text-sm">
              {data.fullName}
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
              {data.txCount} {data.txCount === 1 ? 'lançamento' : 'lançamentos'}
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                Receitas:
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(data.income)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                Saídas:
              </span>
              <span className="font-bold text-rose-600 dark:text-rose-400">
                {formatCurrency(data.expenses)}
              </span>
            </div>

            <div className="pt-1 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="font-extrabold text-slate-700 dark:text-slate-300">
                Saldo do Mês:
              </span>
              <span className={`font-black ${isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                {isPositive ? '+' : ''}{formatCurrency(data.balance)}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">
              <span>Saldo Acumulado:</span>
              <span className={`font-bold ${data.cumulativeBalance >= 0 ? 'text-slate-900 dark:text-white' : 'text-rose-500'}`}>
                {formatCurrency(data.cumulativeBalance)}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 p-4 sm:p-6 shadow-2xs space-y-5 transition-colors">
      
      {/* Header do Card com Título e Seletor de visualização */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/70 dark:border-emerald-800/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-2xs">
            <TrendingUp className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              Evolução do Saldo Mensal
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Histórico financeiro consolidado ao longo dos meses
            </p>
          </div>
        </div>

        {/* Controles de visualização: Tipo de Gráfico */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/70 self-start sm:self-auto">
          <button
            type="button"
            id="btn-chart-view-saldo"
            onClick={() => setChartView('saldo')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              chartView === 'saldo'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>Saldo Mensal</span>
          </button>

          <button
            type="button"
            id="btn-chart-view-comparativo"
            onClick={() => setChartView('comparativo')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              chartView === 'comparativo'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-indigo-500" />
            <span>Receitas x Saídas</span>
          </button>

          <button
            type="button"
            id="btn-chart-view-acumulado"
            onClick={() => setChartView('acumulado')}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              chartView === 'acumulado'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <LineChartIcon className="w-3.5 h-3.5 text-amber-500" />
            <span>Acumulado</span>
          </button>
        </div>
      </div>

      {/* Cards de Métricas Resumo */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        
        {/* Média Mensal */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/70 dark:border-slate-700/60">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
            Saldo Médio Mensal
          </span>
          <span className={`text-sm sm:text-base font-black block mt-0.5 truncate ${stats.avgBalance >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {formatCurrency(stats.avgBalance)}
          </span>
        </div>

        {/* Melhor Mês */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/70 dark:border-slate-700/60">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
            Melhor Mês
          </span>
          <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white block mt-0.5 truncate">
            {stats.bestMonth ? stats.bestMonth.shortName : '—'}
          </span>
          {stats.bestMonth && (
            <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 block truncate">
              +{formatCompactCurrency(stats.bestMonth.balance)}
            </span>
          )}
        </div>

        {/* Saldo Líquido Total */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/70 dark:border-slate-700/60">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
            Resultado Total
          </span>
          <span className={`text-sm sm:text-base font-black block mt-0.5 truncate ${stats.totalNet >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
            {formatCurrency(stats.totalNet)}
          </span>
        </div>

        {/* Meses Positivos */}
        <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/70 dark:border-slate-700/60">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block truncate">
            Meses Positivos
          </span>
          <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white block mt-0.5">
            {stats.positiveMonthsCount} / {chartData.length}
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
            {chartData.length > 0 ? `${Math.round((stats.positiveMonthsCount / chartData.length) * 100)}% no azul` : '—'}
          </span>
        </div>

      </div>

      {/* ÁREA DO GRÁFICO RECHARTS */}
      <div className="w-full h-64 sm:h-72 pt-2">
        {chartData.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 text-xs">
            <Calendar className="w-8 h-8 mb-2 opacity-50" />
            <span>Nenhuma movimentação registrada no histórico para gerar o gráfico.</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartView === 'saldo' ? (
              <AreaChart data={chartData} margin={{ top: 10, right: 12, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="balanceGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis 
                  dataKey="shortName" 
                  stroke={textColor} 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={{ stroke: gridColor }}
                />
                <YAxis 
                  stroke={textColor} 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => formatCompactCurrency(val)}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke={zeroLineColor} strokeWidth={1.5} strokeDasharray="2 2" />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  name="Saldo do Mês" 
                  stroke="#10b981" 
                  strokeWidth={2.5} 
                  fillOpacity={1} 
                  fill="url(#balanceGrad)"
                  dot={{ r: 3.5, fill: '#10b981', strokeWidth: 1.5, stroke: isDark ? '#0f172a' : '#ffffff' }}
                  activeDot={{ r: 6, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </AreaChart>
            ) : chartView === 'comparativo' ? (
              <BarChart data={chartData} margin={{ top: 10, right: 12, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis 
                  dataKey="shortName" 
                  stroke={textColor} 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={{ stroke: gridColor }}
                />
                <YAxis 
                  stroke={textColor} 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => formatCompactCurrency(val)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="income" 
                  name="Receitas" 
                  fill="#10b981" 
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={28}
                />
                <Bar 
                  dataKey="expenses" 
                  name="Saídas" 
                  fill="#f43f5e" 
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={28}
                />
              </BarChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 10, right: 12, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis 
                  dataKey="shortName" 
                  stroke={textColor} 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={{ stroke: gridColor }}
                />
                <YAxis 
                  stroke={textColor} 
                  fontSize={10} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(val) => formatCompactCurrency(val)}
                />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={0} stroke={zeroLineColor} strokeWidth={1.5} strokeDasharray="2 2" />
                <Line 
                  type="monotone" 
                  dataKey="cumulativeBalance" 
                  name="Saldo Acumulado" 
                  stroke="#6366f1" 
                  strokeWidth={2.5} 
                  dot={{ r: 3.5, fill: '#6366f1', strokeWidth: 1.5, stroke: isDark ? '#0f172a' : '#ffffff' }}
                  activeDot={{ r: 6, fill: '#6366f1', stroke: '#ffffff', strokeWidth: 2 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Legenda e seletor de abrangência (Meses com dados vs Todos os meses) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
        
        {/* Legenda dos indicadores */}
        <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400">
          {chartView === 'saldo' && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Saldo Líquido</span>
            </div>
          )}

          {chartView === 'comparativo' && (
            <>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Entradas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Saídas (Gastos + Invest.)</span>
              </div>
            </>
          )}

          {chartView === 'acumulado' && (
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" />
              <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Evolução Cumulativa</span>
            </div>
          )}
        </div>

        {/* Filtro de período */}
        <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/70 dark:border-slate-700/60">
          <button
            type="button"
            onClick={() => setScope('withData')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              scope === 'withData'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Meses com Lançamento
          </button>
          <button
            type="button"
            onClick={() => setScope('allMonths')}
            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              scope === 'allMonths'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Todos os Meses ({availableMonths.length})
          </button>
        </div>

      </div>

    </div>
  );
};
