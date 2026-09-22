import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  ArrowLeft,
  FileText, 
  Download, 
  Share2, 
  TrendingDown, 
  TrendingUp, 
  Wallet,
  Calendar as CalendarIcon,
  CheckCircle2,
  Percent
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip 
} from 'recharts';
import { Transaction } from '../types';
import { formatCurrency, calculateSummary } from '../utils/finance';
import { getMonthKey, DEFAULT_MONTHS_LIST } from '../utils/dateUtils';
import { getCategoryVisual } from '../utils/categoryIcons';
import { downloadMonthlyPdf, shareOrSendPdf } from '../utils/pdfReport';

export interface RelatorioTabProps {
  transactions: Transaction[];
  currentMonth: string;
  availableMonths?: string[];
  onSelectMonth?: (month: string) => void;
  onBack?: () => void;
}

type PeriodType = 'mes' | 'ano' | 'personalizado';

// Cores mais opacas, elegantes e foscas para os segmentos do gráfico
const MATTE_COLORS = [
  '#3b82f6', // Azul suave
  '#10b981', // Esmeralda suave
  '#f59e0b', // Âmbar suave
  '#ef4444', // Vermelho suave
  '#8b5cf6', // Violeta suave
  '#06b6d4', // Ciano suave
  '#ec4899', // Rosa suave
  '#64748b', // Ardósia fosca
  '#14b8a6', // Teal suave
  '#84cc16', // Lima suave
];

export const RelatorioTab: React.FC<RelatorioTabProps> = ({
  transactions,
  currentMonth,
  availableMonths = DEFAULT_MONTHS_LIST,
  onSelectMonth,
  onBack,
}) => {
  // 1. Estados de seleção do período
  const [periodType, setPeriodType] = useState<PeriodType>('mes');
  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonth || 'Setembro 2026');
  
  // Ano selecionado (derivado do mês ou atual)
  const [selectedYear, setSelectedYear] = useState<number>(() => {
    const parts = (currentMonth || '').split(' ');
    const yearCandidate = parts[parts.length - 1];
    return parseInt(yearCandidate, 10) || new Date().getFullYear();
  });

  // Datas para o período personalizado
  const [customStartDate, setCustomStartDate] = useState<string>('2026-09-01');
  const [customEndDate, setCustomEndDate] = useState<string>('2026-09-30');

  // Estados para o Modal de Calendário (idêntico ao de adicionar transação)
  const [isDatePickerOpen, setIsDatePickerOpen] = useState<boolean>(false);
  const [calendarTarget, setCalendarTarget] = useState<'start' | 'end'>('start');
  const [calendarViewDate, setCalendarViewDate] = useState<{ year: number; month: number }>({
    year: 2026,
    month: 8,
  });

  const formatBRDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const day = parts[2];
    const m = parseInt(parts[1], 10) - 1;
    const year = parts[0];
    const monthsShort = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    return `${parseInt(day, 10)} ${monthsShort[m] || ''} ${year}`;
  };

  // Estado para indicar se o relatório já foi gerado
  const [hasGenerated, setHasGenerated] = useState<boolean>(false);
  const [activeParams, setActiveParams] = useState<{
    periodType: PeriodType;
    selectedMonth: string;
    selectedYear: number;
    customStartDate: string;
    customEndDate: string;
  } | null>(null);

  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Navegação de meses
  const monthIdx = availableMonths.indexOf(selectedMonth);
  const handlePrevMonth = () => {
    const nextIdx = monthIdx > 0 ? monthIdx - 1 : availableMonths.length - 1;
    const nextMonth = availableMonths[nextIdx];
    setSelectedMonth(nextMonth);
    if (onSelectMonth) onSelectMonth(nextMonth);
  };

  const handleNextMonth = () => {
    const nextIdx = monthIdx < availableMonths.length - 1 ? monthIdx + 1 : 0;
    const nextMonth = availableMonths[nextIdx];
    setSelectedMonth(nextMonth);
    if (onSelectMonth) onSelectMonth(nextMonth);
  };

  // Navegação de anos
  const handlePrevYear = () => setSelectedYear((y) => y - 1);
  const handleNextYear = () => setSelectedYear((y) => y + 1);

  // Parâmetros do período ativo para o relatório
  const activePeriod = activeParams || {
    periodType,
    selectedMonth,
    selectedYear,
    customStartDate,
    customEndDate,
  };

  // 2. Filtro de transações com base no período gerado
  const filteredTransactions = useMemo(() => {
    if (!hasGenerated) return [];

    if (activePeriod.periodType === 'mes') {
      const monthKey = getMonthKey(activePeriod.selectedMonth);
      return transactions.filter((t) => t.date && t.date.startsWith(monthKey));
    }

    if (activePeriod.periodType === 'ano') {
      const yearStr = String(activePeriod.selectedYear);
      return transactions.filter((t) => t.date && t.date.startsWith(yearStr));
    }

    if (activePeriod.periodType === 'personalizado') {
      return transactions.filter((t) => {
        if (!t.date) return false;
        return t.date >= activePeriod.customStartDate && t.date <= activePeriod.customEndDate;
      });
    }

    return transactions;
  }, [transactions, activePeriod, hasGenerated]);

  // 3. Cálculos de Saídas, Entradas e Sobra
  const { totalSaidas, totalEntradas, sobra, categoriesBreakdown, topCategory } = useMemo(() => {
    let entradas = 0;
    let saidas = 0;
    const categoryMap: Record<string, { amount: number; count: number }> = {};

    filteredTransactions.forEach((tx) => {
      if (tx.type === 'income') {
        entradas += tx.amount;
      } else if (tx.type === 'expense' || tx.type === 'investment') {
        saidas += tx.amount;
        const cat = tx.category || 'Outros';
        if (!categoryMap[cat]) {
          categoryMap[cat] = { amount: 0, count: 0 };
        }
        categoryMap[cat].amount += tx.amount;
        categoryMap[cat].count += 1;
      }
    });

    const net = entradas - saidas;

    const list = Object.entries(categoryMap)
      .map(([name, data]) => ({
        name,
        amount: data.amount,
        count: data.count,
        percent: saidas > 0 ? (data.amount / saidas) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);

    const top = list.length > 0 ? list[0] : null;

    return {
      totalSaidas: saidas,
      totalEntradas: entradas,
      sobra: net,
      categoriesBreakdown: list,
      topCategory: top,
    };
  }, [filteredTransactions]);

  // Dados para o gráfico Donut de Recharts
  const chartData = useMemo(() => {
    if (categoriesBreakdown.length === 0) {
      return [{ name: 'Sem saídas', value: 1, color: '#94a3b8' }];
    }
    return categoriesBreakdown.map((cat, idx) => ({
      name: cat.name,
      value: cat.amount,
      percent: cat.percent,
      color: MATTE_COLORS[idx % MATTE_COLORS.length],
    }));
  }, [categoriesBreakdown]);

  // Ação de gerar relatório
  const handleGenerateReport = () => {
    setActiveParams({
      periodType,
      selectedMonth,
      selectedYear,
      customStartDate,
      customEndDate,
    });
    setHasGenerated(true);
  };

  // Exportação em PDF
  const handleDownloadPdf = async () => {
    try {
      setIsExporting(true);
      const summary = calculateSummary(filteredTransactions);
      const periodLabel = 
        activePeriod.periodType === 'mes' 
          ? activePeriod.selectedMonth 
          : activePeriod.periodType === 'ano' 
          ? `Ano ${activePeriod.selectedYear}` 
          : `${activePeriod.customStartDate} até ${activePeriod.customEndDate}`;

      await downloadMonthlyPdf({
        monthName: periodLabel,
        summary,
        transactions: filteredTransactions,
      });
      setExportNotice('Relatório baixado com sucesso!');
      setTimeout(() => setExportNotice(null), 3000);
    } catch {
      setExportNotice('Erro ao gerar PDF. Tente novamente.');
      setTimeout(() => setExportNotice(null), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  const handleSharePdf = async () => {
    try {
      setIsExporting(true);
      const summary = calculateSummary(filteredTransactions);
      const periodLabel = 
        activePeriod.periodType === 'mes' 
          ? activePeriod.selectedMonth 
          : activePeriod.periodType === 'ano' 
          ? `Ano ${activePeriod.selectedYear}` 
          : `${activePeriod.customStartDate} até ${activePeriod.customEndDate}`;

      const res = await shareOrSendPdf({
        monthName: periodLabel,
        summary,
        transactions: filteredTransactions,
      });
      if (res.success) {
        setExportNotice(res.method === 'share' ? 'Compartilhado com sucesso!' : 'Download do PDF realizado com sucesso!');
      } else {
        setExportNotice('Não foi possível compartilhar diretamente.');
      }
      setTimeout(() => setExportNotice(null), 3500);
    } catch {
      setExportNotice('Erro ao compartilhar PDF.');
      setTimeout(() => setExportNotice(null), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div id="aba-relatorio" className="space-y-6 animate-fadeIn pb-12">
      
      {/* 1. BOTÃO VOLTAR (CASO ACESSADO VIA MENU MAIS) */}
      {onBack && (
        <div className="flex items-center">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            title="Voltar para Mais opções"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
            <span>Voltar</span>
          </button>
        </div>
      )}

      {/* 2. SEÇÃO PERÍODO */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
        
        {/* Título "Período" à esquerda */}
        <h2 className="text-sm sm:text-base font-bold text-slate-700 dark:text-slate-300 text-left">
          Período
        </h2>

        {/* Opções: Mês, Ano, Personalizado */}
        <div className="grid grid-cols-3 gap-2 bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
          <button
            type="button"
            onClick={() => setPeriodType('mes')}
            className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              periodType === 'mes'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Mês
          </button>
          <button
            type="button"
            onClick={() => setPeriodType('ano')}
            className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              periodType === 'ano'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Ano
          </button>
          <button
            type="button"
            onClick={() => setPeriodType('personalizado')}
            className={`py-2 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
              periodType === 'personalizado'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Personalizado
          </button>
        </div>

        {/* Campo Personalizado: Datas puras lado a lado sem retângulos/caixas */}
        {periodType === 'personalizado' && (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 pt-2 pb-1 animate-fadeIn">
            <div>
              <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                Data de início
              </span>
              <button
                type="button"
                onClick={() => {
                  const parts = customStartDate.split('-');
                  setCalendarTarget('start');
                  setCalendarViewDate({
                    year: parseInt(parts[0], 10) || new Date().getFullYear(),
                    month: (parseInt(parts[1], 10) || 1) - 1,
                  });
                  setIsDatePickerOpen(true);
                }}
                className="flex items-center gap-2 text-sm sm:text-base font-black text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer py-1 select-none"
              >
                <CalendarIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                <span>{formatBRDisplayDate(customStartDate)}</span>
              </button>
            </div>

            <div>
              <span className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">
                Data de término
              </span>
              <button
                type="button"
                onClick={() => {
                  const parts = customEndDate.split('-');
                  setCalendarTarget('end');
                  setCalendarViewDate({
                    year: parseInt(parts[0], 10) || new Date().getFullYear(),
                    month: (parseInt(parts[1], 10) || 1) - 1,
                  });
                  setIsDatePickerOpen(true);
                }}
                className="flex items-center gap-2 text-sm sm:text-base font-black text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer py-1 select-none"
              >
                <CalendarIcon className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                <span>{formatBRDisplayDate(customEndDate)}</span>
              </button>
            </div>
          </div>
        )}

        {/* Em baixo: setas puras e nome puro quando for Mês */}
        {periodType === 'mes' && (
          <div className="flex items-center justify-center gap-5 py-2">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white active:scale-90 transition-transform cursor-pointer"
              title="Mês anterior"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
            </button>

            <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white min-w-40 text-center select-none capitalize">
              {selectedMonth}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white active:scale-90 transition-transform cursor-pointer"
              title="Próximo mês"
            >
              <ChevronRight className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>
        )}

        {/* Em baixo: setas puras e número puro quando for Ano */}
        {periodType === 'ano' && (
          <div className="flex items-center justify-center gap-5 py-2">
            <button
              type="button"
              onClick={handlePrevYear}
              className="p-1 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white active:scale-90 transition-transform cursor-pointer"
              title="Ano anterior"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
            </button>

            <span className="text-base sm:text-lg font-black text-slate-900 dark:text-white min-w-28 text-center select-none">
              {selectedYear}
            </span>

            <button
              type="button"
              onClick={handleNextYear}
              className="p-1 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white active:scale-90 transition-transform cursor-pointer"
              title="Próximo ano"
            >
              <ChevronRight className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>
        )}

        {/* Em baixo um botão: Gerar Relatório */}
        <div className="pt-2">
          <button
            type="button"
            id="btn-gerar-relatorio"
            onClick={handleGenerateReport}
            className="w-full py-3.5 px-6 rounded-2xl font-black text-sm sm:text-base text-white bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2.5 shadow-2xs active:scale-[0.99] cursor-pointer"
          >
            <FileText className="w-4 h-4 stroke-[2.5]" />
            <span>Gerar relatório</span>
          </button>
        </div>

      </div>

      {/* RENDERIZAÇÃO DO RELATÓRIO: SOMENTE APÓS CLICAR EM "GERAR RELATÓRIO" */}
      {hasGenerated && (
        <div id="resultado-relatorio-gerado" className="space-y-6 animate-fadeIn">
          {/* 3. NO RELATÓRIO: 3 CARTÕES UM DO LADO DO OUTRO (SAÍDAS, ENTRADAS, SOBRA) */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
        
        {/* Cartão 1: Saídas */}
        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs text-center">
          <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 block mb-1">
            Saídas
          </span>
          <span className="text-sm sm:text-xl font-black text-rose-600 dark:text-rose-400 block tracking-tight">
            {formatCurrency(totalSaidas)}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 mt-1 block hidden sm:block">
            Despesas do período
          </span>
        </div>

        {/* Cartão 2: Entradas */}
        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs text-center">
          <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 block mb-1">
            Entradas
          </span>
          <span className="text-sm sm:text-xl font-black text-emerald-600 dark:text-emerald-400 block tracking-tight">
            {formatCurrency(totalEntradas)}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 mt-1 block hidden sm:block">
            Receitas do período
          </span>
        </div>

        {/* Cartão 3: Sobra (o que sobrou do mês) */}
        <div className="p-3.5 sm:p-5 rounded-2xl sm:rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs text-center">
          <span className="text-xs sm:text-sm font-bold text-slate-500 dark:text-slate-400 block mb-1">
            Sobra
          </span>
          <span className={`text-sm sm:text-xl font-black block tracking-tight ${
            sobra >= 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'
          }`}>
            {formatCurrency(sobra)}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 mt-1 block hidden sm:block">
            {sobra >= 0 ? 'Saldo positivo' : 'Déficit no período'}
          </span>
        </div>

      </div>

      {/* 4. BLOCO DO GRÁFICO POR CATEGORIA */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-5">
        
        {/* Cabeçalho do Gráfico: à esquerda "Por categoria", à direita "Total gasto no mês ou período" */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white tracking-tight">
            Por categoria
          </h3>
          <div className="text-right">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
              Total gasto
            </span>
            <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
              {formatCurrency(totalSaidas)}
            </span>
          </div>
        </div>

        {/* 5. GRÁFICO REDONDO + 2 CARTÕES DO LADO */}
        <div className="grid grid-cols-12 gap-3 sm:gap-6 items-center">
          
          {/* Gráfico Redondo Donut com Total Gasto no meio (sempre ao lado dos 2 cartões) */}
          <div className="col-span-6 md:col-span-7 flex items-center justify-center relative min-h-48 sm:min-h-60">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius="56%"
                  outerRadius="86%"
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: number) => [formatCurrency(val), 'Gasto']}
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    borderRadius: '16px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Texto no meio do gráfico: "Total gasto" e o valor abaixo */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center px-1">
              <span className="text-[9px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Total gasto
              </span>
              <span className="text-xs sm:text-lg font-black text-slate-900 dark:text-white tracking-tight mt-0.5">
                {formatCurrency(totalSaidas)}
              </span>
            </div>
          </div>

          {/* Do lado do gráfico: 2 cartões um em baixo do outro */}
          <div className="col-span-6 md:col-span-5 flex flex-col gap-2.5 sm:gap-3">
            
            {/* Primeiro Cartão: Maior gasto */}
            <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Maior gasto
              </span>
              <div className="flex items-center gap-1.5 mt-0.5 truncate">
                {topCategory && (
                  <div className="w-2 h-2 rounded-full bg-slate-700 dark:bg-slate-300 shrink-0" />
                )}
                <span className="text-xs sm:text-base font-extrabold text-slate-900 dark:text-white truncate">
                  {topCategory ? topCategory.name : 'Nenhum gasto'}
                </span>
              </div>
              <span className="text-xs sm:text-lg font-black text-rose-600 dark:text-rose-400 mt-0.5 sm:mt-1 block tracking-tight">
                {topCategory ? formatCurrency(topCategory.amount) : 'R$ 0,00'}
              </span>
            </div>

            {/* Segundo Cartão: mostrando a porcentagem do gasto */}
            <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60">
              <span className="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                Impacto no total
              </span>
              <div className="flex items-baseline gap-1 mt-0.5">
                <span className="text-base sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {topCategory ? `${topCategory.percent.toFixed(1)}%` : '0,0%'}
                </span>
                <span className="text-[10px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
                  das saídas
                </span>
              </div>

              {/* Barra de progresso visual */}
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 sm:h-2 rounded-full mt-2 sm:mt-2.5 overflow-hidden">
                <div 
                  className="bg-slate-800 dark:bg-slate-300 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(topCategory ? topCategory.percent : 0, 100)}%` }}
                />
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* 6. SUBTÍTULO: CATEGORIAS DE MAIOR PESO */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
        
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white tracking-tight">
            Categorias de maior peso
          </h4>
          <span className="text-xs font-bold text-slate-400">
            {categoriesBreakdown.length} {categoriesBreakdown.length === 1 ? 'categoria' : 'categorias'}
          </span>
        </div>

        {/* Lista do maior para o menor Saída do mês ou período */}
        {categoriesBreakdown.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-xs sm:text-sm">
            Nenhuma saída registrada neste período.
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {categoriesBreakdown.map((item, index) => {
              const visual = getCategoryVisual(item.name);
              const IconComp = visual.icon;
              const colorDot = MATTE_COLORS[index % MATTE_COLORS.length];

              return (
                <div 
                  key={index}
                  className="p-3 sm:p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 flex flex-col gap-2 transition-colors"
                >
                  <div className="flex items-center justify-between gap-3">
                    
                    {/* Categoria com ícone e nome */}
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${visual.bgColor} ${visual.textColor} border ${visual.borderColor}`}>
                        <IconComp className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white truncate block">
                          {item.name}
                        </span>
                        <span className="text-[11px] font-medium text-slate-400 block">
                          {item.count} {item.count === 1 ? 'lançamento' : 'lançamentos'}
                        </span>
                      </div>
                    </div>

                    {/* Valor e Porcentagem */}
                    <div className="text-right shrink-0">
                      <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white block">
                        {formatCurrency(item.amount)}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block">
                        {item.percent.toFixed(1)}%
                      </span>
                    </div>

                  </div>

                  {/* Barra de porcentagem relativa */}
                  <div className="w-full bg-slate-200/80 dark:bg-slate-700/80 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${Math.max(item.percent, 2)}%`,
                        backgroundColor: colorDot
                      }}
                    />
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* 7. AÇÕES COMPLEMENTARES: BAIXAR PDF E COMPARTILHAR */}
      <div className="bg-slate-100/80 dark:bg-slate-900/60 p-4 sm:p-5 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-center sm:text-left">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            Exportar Demonstrativo Oficial
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
            Gere o arquivo PDF formatado para arquivamento ou envio
          </span>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl font-bold text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Baixar PDF</span>
          </button>

          <button
            type="button"
            onClick={handleSharePdf}
            disabled={isExporting}
            className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl font-bold text-xs bg-slate-800 hover:bg-slate-900 text-white dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <Share2 className="w-4 h-4" />
            <span>Compartilhar</span>
          </button>
        </div>
      </div>

          {exportNotice && (
            <div className="p-3 bg-slate-800 text-white text-xs font-bold rounded-2xl text-center shadow-lg animate-fadeIn">
              {exportNotice}
            </div>
          )}

        </div>
      )}

      {/* Modal de Calendário Direto (idêntico ao visto ao adicionar transação) */}
      {isDatePickerOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col p-4 sm:p-5 animate-fadeIn transition-colors">
            
            {/* Header do Calendário: Mês/Ano e setas para navegar */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setCalendarViewDate(prev => {
                    const newMonth = prev.month - 1;
                    if (newMonth < 0) {
                      return { year: prev.year - 1, month: 11 };
                    }
                    return { year: prev.year, month: newMonth };
                  });
                }}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Mês anterior"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              </button>

              <span className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base capitalize">
                {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
                  new Date(calendarViewDate.year, calendarViewDate.month, 1)
                )}
              </span>

              <button
                type="button"
                onClick={() => {
                  setCalendarViewDate(prev => {
                    const newMonth = prev.month + 1;
                    if (newMonth > 11) {
                      return { year: prev.year + 1, month: 0 };
                    }
                    return { year: prev.year, month: newMonth };
                  });
                }}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Próximo mês"
              >
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Dias da semana */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((dayChar, i) => (
                <span key={i} className="text-[11px] font-bold text-slate-400 dark:text-slate-500 py-1">
                  {dayChar}
                </span>
              ))}
            </div>

            {/* Grade de dias */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {(() => {
                const year = calendarViewDate.year;
                const month = calendarViewDate.month;
                const firstDayOfWeek = new Date(year, month, 1).getDay();
                const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
                const cells = [];

                // Células vazias antes do primeiro dia
                for (let i = 0; i < firstDayOfWeek; i++) {
                  cells.push(<div key={`empty-${i}`} className="h-9" />);
                }

                const activeDate = calendarTarget === 'start' ? customStartDate : customEndDate;

                // Células dos dias do mês
                for (let d = 1; d <= totalDaysInMonth; d++) {
                  const mStr = String(month + 1).padStart(2, '0');
                  const dStr = String(d).padStart(2, '0');
                  const dateIso = `${year}-${mStr}-${dStr}`;
                  const isSelected = activeDate === dateIso;

                  cells.push(
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        if (calendarTarget === 'start') {
                          setCustomStartDate(dateIso);
                        } else {
                          setCustomEndDate(dateIso);
                        }
                        setIsDatePickerOpen(false);
                      }}
                      className={`h-9 w-9 mx-auto rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs scale-105 font-black'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {d}
                    </button>
                  );
                }

                return cells;
              })()}
            </div>

            {/* Rodapé com botão Fechar */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setIsDatePickerOpen(false)}
                className="px-4 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
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
