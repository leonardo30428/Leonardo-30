import React, { useState, useMemo } from 'react';
import { 
  X, 
  TrendingDown, 
  TrendingUp, 
  PiggyBank, 
  BarChart3, 
  Layers, 
  ListOrdered, 
  ArrowDownWideNarrow, 
  Award, 
  Tag, 
  Calendar,
  Building2,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency } from '../utils/finance';

export type RankingCategoryType = 'income' | 'expense' | 'investment';

interface HorizontalRankingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: RankingCategoryType;
  transactions: Transaction[];
}

export const HorizontalRankingModal: React.FC<HorizontalRankingModalProps> = ({
  isOpen,
  onClose,
  initialType = 'expense',
  transactions,
}) => {
  const [activeType, setActiveType] = useState<RankingCategoryType>(initialType);
  const [viewMode, setViewMode] = useState<'category' | 'individual'>('individual');

  // Sync activeType when initialType changes if modal reopened
  React.useEffect(() => {
    if (isOpen) {
      setActiveType(initialType);
    }
  }, [isOpen, initialType]);

  // Filter transactions according to selected activeType
  const relevantTransactions = useMemo(() => {
    if (activeType === 'income') {
      return transactions.filter((t) => t.type === 'income');
    }
    if (activeType === 'investment') {
      return transactions.filter((t) => t.type === 'investment' || t.category === 'Investimento');
    }
    // Expense: normal expenses (excluding pure investment if categorized as investment)
    return transactions.filter(
      (t) => t.type === 'expense' && t.category !== 'Investimento'
    );
  }, [transactions, activeType]);

  const totalAmount = useMemo(() => {
    return relevantTransactions.reduce((acc, t) => acc + t.amount, 0);
  }, [relevantTransactions]);

  // Group by category
  const categoryRanking = useMemo(() => {
    const map: Record<string, { amount: number; count: number; transactions: Transaction[] }> = {};
    
    relevantTransactions.forEach((t) => {
      const cat = t.category || (activeType === 'income' ? 'Renda' : activeType === 'investment' ? 'Investimento' : 'Outros');
      if (!map[cat]) {
        map[cat] = { amount: 0, count: 0, transactions: [] };
      }
      map[cat].amount += t.amount;
      map[cat].count += 1;
      map[cat].transactions.push(t);
    });

    return Object.entries(map)
      .map(([name, data]) => ({
        id: name,
        title: name,
        subtitle: `${data.count} lançamento(s)`,
        amount: data.amount,
        percentage: totalAmount > 0 ? (data.amount / totalAmount) * 100 : 0,
        count: data.count,
      }))
      .sort((a, b) => b.amount - a.amount); // Decrescente: maiores até as menores
  }, [relevantTransactions, totalAmount, activeType]);

  // Individual transactions sorted descending
  const individualRanking = useMemo(() => {
    return [...relevantTransactions]
      .sort((a, b) => b.amount - a.amount) // Decrescente: maiores até as menores
      .map((t) => ({
        id: t.id,
        title: t.description || 'Sem descrição',
        subtitle: `${t.category} • ${t.date} ${t.bankName ? `• ${t.bankName}` : ''}`,
        amount: t.amount,
        percentage: totalAmount > 0 ? (t.amount / totalAmount) * 100 : 0,
        bankName: t.bankName,
        date: t.date,
        isPaid: t.isPaid,
      }));
  }, [relevantTransactions, totalAmount]);

  const currentList = viewMode === 'category' ? categoryRanking : individualRanking;
  const maxAmount = currentList.length > 0 ? Math.max(...currentList.map((i) => i.amount), 1) : 1;

  if (!isOpen) return null;

  // Visual themes according to type
  const theme = {
    income: {
      title: '1. Renda & Entradas',
      badgeText: 'Entradas',
      colorName: 'emerald',
      textColor: 'text-emerald-700',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      activeTabBg: 'bg-emerald-600 text-white',
      barGradient: 'bg-gradient-to-r from-emerald-500 to-emerald-600',
      icon: <TrendingUp className="w-4 h-4 text-emerald-600" />,
    },
    expense: {
      title: '2. Despesas & Gastos',
      badgeText: 'Despesas',
      colorName: 'rose',
      textColor: 'text-rose-700',
      bgColor: 'bg-rose-50',
      borderColor: 'border-rose-200',
      activeTabBg: 'bg-rose-600 text-white',
      barGradient: 'bg-gradient-to-r from-rose-500 to-rose-600',
      icon: <TrendingDown className="w-4 h-4 text-rose-600" />,
    },
    investment: {
      title: '3. Investimentos & Aportes',
      badgeText: 'Investimentos',
      colorName: 'indigo',
      textColor: 'text-indigo-700',
      bgColor: 'bg-indigo-50',
      borderColor: 'border-indigo-200',
      activeTabBg: 'bg-indigo-600 text-white',
      barGradient: 'bg-gradient-to-r from-indigo-500 to-indigo-600',
      icon: <PiggyBank className="w-4 h-4 text-indigo-600" />,
    },
  }[activeType];

  return (
    <div 
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <div className={`p-2 rounded-xl ${theme.bgColor} border ${theme.borderColor}`}>
                <BarChart3 className={`w-5 h-5 ${theme.textColor}`} />
              </div>
              <div>
                <h3 className="font-black text-lg sm:text-xl text-slate-900 tracking-tight flex items-center gap-2">
                  Parâmetros: Maiores para Menores
                </h3>
                <p className="text-xs text-slate-500">
                  Ranking de parâmetros por valor para acompanhamento de impacto financeiro
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Switcher Tabs: 1. Renda | 2. Despesas | 3. Investimentos */}
        <div className="mt-4 shrink-0 space-y-3">
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-2xl">
            <button
              onClick={() => setActiveType('income')}
              className={`py-2 px-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeType === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="truncate">1. Renda</span>
            </button>

            <button
              onClick={() => setActiveType('expense')}
              className={`py-2 px-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeType === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="truncate">2. Despesas</span>
            </button>

            <button
              onClick={() => setActiveType('investment')}
              className={`py-2 px-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                activeType === 'investment'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <PiggyBank className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="truncate">3. Investimentos</span>
            </button>
          </div>

          {/* KPI Summary & View Mode Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <div>
              <span className="text-[10px] font-extrabold tracking-wider text-slate-500 block">
                Total acumulado em {theme.badgeText}:
              </span>
              <span className={`text-xl sm:text-2xl font-black ${theme.textColor} tracking-tight`}>
                {formatCurrency(totalAmount)}
              </span>
              <span className="text-[11px] text-slate-500 ml-2 font-medium">
                ({currentList.length} {viewMode === 'category' ? 'categorias' : 'itens'})
              </span>
            </div>

            {/* Toggle: Por Categoria vs Por Item Individual */}
            <div className="flex items-center gap-1 bg-white border border-slate-200 p-1 rounded-xl self-start sm:self-auto">
              <button
                onClick={() => setViewMode('individual')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 ${
                  viewMode === 'individual'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ListOrdered className="w-3 h-3" />
                <span>Por Lançamento</span>
              </button>

              <button
                onClick={() => setViewMode('category')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 ${
                  viewMode === 'category'
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>Por Categoria</span>
              </button>
            </div>
          </div>
        </div>

        {/* The Bar Chart Content ("Parâmetro") */}
        <div className="mt-4 flex-1 overflow-y-auto pr-1 space-y-3">
          {currentList.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <BarChart3 className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-[1.5]" />
              <p className="text-sm font-semibold text-slate-600">Nenhum lançamento encontrado</p>
              <p className="text-xs text-slate-400 mt-1">
                Adicione lançamentos de {theme.badgeText.toLowerCase()} para visualizar os parâmetros ordenados.
              </p>
            </div>
          ) : (
            currentList.map((item, index) => {
              const rankNumber = index + 1;
              const barWidthPercentage = Math.min(100, Math.max(4, (item.amount / maxAmount) * 100));

              // Rank badge styling
              const rankStyle = 
                rankNumber === 1
                  ? 'bg-amber-400 text-amber-950 font-black shadow-xs ring-2 ring-amber-200'
                  : rankNumber === 2
                  ? 'bg-slate-200 text-slate-800 font-bold'
                  : rankNumber === 3
                  ? 'bg-amber-700/80 text-white font-bold'
                  : 'bg-slate-100 text-slate-600 font-medium';

              return (
                <div 
                  key={item.id} 
                  className="p-3 bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300 rounded-2xl transition-all space-y-2 shadow-2xs"
                >
                  {/* Top info line */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 truncate min-w-0">
                      <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 ${rankStyle}`}>
                        {rankNumber}º
                      </span>
                      <div className="truncate">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {item.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 truncate">
                          {item.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs sm:text-sm font-black text-slate-900 block tracking-tight">
                        {formatCurrency(item.amount)}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${theme.bgColor} ${theme.textColor}`}>
                        {item.percentage.toFixed(1)}% do total
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar ("Barra Deitada") */}
                  <div className="relative w-full bg-slate-100 rounded-full h-3 sm:h-3.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${theme.barGradient}`}
                      style={{ width: `${barWidthPercentage}%` }}
                      title={`${item.title}: ${formatCurrency(item.amount)} (${item.percentage.toFixed(1)}%)`}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span className="flex items-center gap-1 text-[11px]">
            <ArrowDownWideNarrow className="w-3.5 h-3.5 text-slate-400" />
            Ordenado automaticamente: maior valor ao menor valor
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
