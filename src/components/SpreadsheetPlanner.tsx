import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown,
  Wallet, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Sparkles, 
  RotateCcw,
  Edit2, 
  X,
  PiggyBank,
  Link2,
  Calendar,
  Check,
  ShieldCheck,
  ArrowRight,
  ChevronRight
} from 'lucide-react';
import { SpreadsheetEnvelope, SpreadsheetBudgetItem, Transaction, TransactionType } from '../types';
import { formatCurrency } from '../utils/finance';
import { emptySpreadsheetEnvelopes } from '../data/mockData';
import { HorizontalRankingModal, RankingCategoryType } from './HorizontalRankingModal';

interface SpreadsheetPlannerProps {
  transactions?: Transaction[];
  selectedMonthDate?: string;
  onAskAiTips?: (question: string) => void;
  onOpenNewTransaction?: (type?: TransactionType) => void;
  onAddTransaction?: (tx: Omit<Transaction, 'id'>) => void;
  onDeleteTransaction?: (id: string) => void;
  onToggleTransactionPaid?: (id: string) => void;
  onResetAllData?: () => void;
}

const COLOR_PRESETS = [
  { color: '#10b981', bgLight: 'bg-emerald-50', borderColor: 'border-emerald-200' },
  { color: '#6366f1', bgLight: 'bg-indigo-50', borderColor: 'border-indigo-200' },
  { color: '#0ea5e9', bgLight: 'bg-sky-50', borderColor: 'border-sky-200' },
  { color: '#f59e0b', bgLight: 'bg-amber-50', borderColor: 'border-amber-200' },
  { color: '#8b5cf6', bgLight: 'bg-purple-50', borderColor: 'border-purple-200' },
];

export const SpreadsheetPlanner: React.FC<SpreadsheetPlannerProps> = ({ 
  transactions = [],
  selectedMonthDate,
  onAskAiTips,
  onOpenNewTransaction,
  onAddTransaction,
  onDeleteTransaction,
  onToggleTransactionPaid,
  onResetAllData,
}) => {
  // Extract transactions from top
  const incomeTransactions = useMemo(() => transactions.filter((t) => t.type === 'income'), [transactions]);
  const expenseTransactions = useMemo(() => transactions.filter((t) => t.type === 'expense'), [transactions]);
  const investmentTransactions = useMemo(() => transactions.filter((t) => t.type === 'investment'), [transactions]);

  const totalIncomeFromTransactions = useMemo(() => {
    return incomeTransactions.reduce((acc, t) => acc + t.amount, 0);
  }, [incomeTransactions]);

  const [envelopes, setEnvelopes] = useState<SpreadsheetEnvelope[]>(() => {
    try {
      const saved = localStorage.getItem('finansmart_sheet_envelopes_v11');
      return saved ? JSON.parse(saved) : emptySpreadsheetEnvelopes;
    } catch {
      return emptySpreadsheetEnvelopes;
    }
  });

  const [confirmingReset, setConfirmingReset] = useState(false);

  // State to open horizontal ranking chart modal (1. Renda, 2. Despesas, 3. Investimentos)
  const [rankingModalType, setRankingModalType] = useState<RankingCategoryType | null>(null);

  // Modal / Form state to add item (investment or expense) directly
  const [activeEnvelopeIdForNewItem, setActiveEnvelopeIdForNewItem] = useState<string | null>(null);
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [newItemCategory, setNewItemCategory] = useState('');
  const [newItemType, setNewItemType] = useState<'expense' | 'investment'>('expense');

  // Modal / Form to add a new income envelope
  const [isAddingEnvelope, setIsAddingEnvelope] = useState(false);
  const [newEnvelopeName, setNewEnvelopeName] = useState('');
  const [newEnvelopeAmount, setNewEnvelopeAmount] = useState('');

  // Modal / Form to edit envelope income
  const [editingEnvelopeIncomeId, setEditingEnvelopeIncomeId] = useState<string | null>(null);
  const [editIncomeValue, setEditIncomeValue] = useState('');

  // Modal / Form to rename envelope
  const [editingEnvelopeNameId, setEditingEnvelopeNameId] = useState<string | null>(null);
  const [editEnvelopeNameValue, setEditEnvelopeNameValue] = useState('');

  // Helper to persist envelopes
  const saveEnvelopes = (newEnvelopes: SpreadsheetEnvelope[]) => {
    setEnvelopes(newEnvelopes);
    try {
      localStorage.setItem('finansmart_sheet_envelopes_v11', JSON.stringify(newEnvelopes));
    } catch (e) {
      console.error(e);
    }
  };

  // AUTOMATIC LINKAGE: When user launches income transactions above, automatically update the primary envelope ("Renda Principal")
  useEffect(() => {
    if (totalIncomeFromTransactions > 0) {
      setEnvelopes((prevEnvs) => {
        if (!prevEnvs || prevEnvs.length === 0) {
          const initial = [{
            id: 'env-1',
            name: 'Renda Principal do Mês',
            incomeAmount: totalIncomeFromTransactions,
            percentageOfIncome: 100,
            color: '#10b981',
            bgLight: 'bg-emerald-50',
            borderColor: 'border-emerald-200',
            items: [],
            totalAllocated: 0,
            finalBalance: totalIncomeFromTransactions,
          }];
          saveEnvelopes(initial);
          return initial;
        }

        // If there's 1 envelope (or the first is Renda Principal), sync its value directly with the user's income transactions!
        if (prevEnvs.length === 1 && prevEnvs[0].incomeAmount !== totalIncomeFromTransactions) {
          const updated = prevEnvs.map((env, idx) => 
            idx === 0 ? { ...env, incomeAmount: totalIncomeFromTransactions } : env
          );
          saveEnvelopes(updated);
          return updated;
        }

        return prevEnvs;
      });
    } else {
      // When there are no income transactions, ensure primary envelope income is 0
      setEnvelopes((prevEnvs) => {
        if (!prevEnvs || prevEnvs.length === 0) return emptySpreadsheetEnvelopes;
        if (prevEnvs.length === 1 && prevEnvs[0].incomeAmount !== 0) {
          const updated = prevEnvs.map((env, idx) =>
            idx === 0 ? { ...env, incomeAmount: 0 } : env
          );
          saveEnvelopes(updated);
          return updated;
        }
        return prevEnvs;
      });
    }
  }, [totalIncomeFromTransactions]);

  // Overall Income (from transactions if available, otherwise from envelopes)
  const totalIncome = useMemo(() => {
    if (totalIncomeFromTransactions > 0) return totalIncomeFromTransactions;
    if (incomeTransactions.length > 0) return 0;
    if (envelopes.length === 1 && envelopes[0].name === 'Renda Principal do Mês') {
      return envelopes[0].incomeAmount || 0;
    }
    return envelopes.reduce((acc, env) => acc + env.incomeAmount, 0);
  }, [totalIncomeFromTransactions, envelopes, incomeTransactions]);

  // All linked items: All expense transactions + All investment transactions + any manual local items
  const allLinkedItems = useMemo(() => {
    const items: SpreadsheetBudgetItem[] = [];

    // 1. Add all expense transactions launched above
    expenseTransactions.forEach((tx) => {
      const isInvest = tx.category === 'Investimento' || tx.category?.toLowerCase().includes('investimento');
      items.push({
        id: tx.id,
        transactionId: tx.id,
        description: tx.description,
        amount: tx.amount,
        percentageOfTotal: totalIncome > 0 ? (tx.amount / totalIncome) * 100 : 0,
        category: tx.category || 'Despesa',
        type: isInvest ? 'investment' : 'expense',
        envelope: envelopes[0]?.name || 'Renda Principal do Mês',
        isPaid: tx.isPaid !== false,
        isLinkedFromTop: true,
      });
    });

    // 2. Add all investment transactions launched above (avoiding duplicates)
    investmentTransactions.forEach((tx) => {
      if (items.some((existing) => existing.id === tx.id || existing.transactionId === tx.id)) {
        return;
      }
      items.push({
        id: tx.id,
        transactionId: tx.id,
        description: tx.description,
        amount: tx.amount,
        percentageOfTotal: totalIncome > 0 ? (tx.amount / totalIncome) * 100 : 0,
        category: tx.category || 'Investimento',
        type: 'investment',
        envelope: envelopes[0]?.name || 'Renda Principal do Mês',
        isPaid: true,
        isLinkedFromTop: true,
      });
    });

    // 3. Add any legacy/local items from envelopes that don't match an existing transaction
    envelopes.forEach((env) => {
      env.items.forEach((item) => {
        if (!items.some((existing) => existing.id === item.id || (item.transactionId && existing.transactionId === item.transactionId))) {
          items.push({
            ...item,
            envelope: env.name,
            percentageOfTotal: totalIncome > 0 ? (item.amount / totalIncome) * 100 : 0,
            isLinkedFromTop: false,
          });
        }
      });
    });

    return items;
  }, [expenseTransactions, investmentTransactions, envelopes, totalIncome]);

  // Total Expenses (linked + manual)
  const totalExpenses = useMemo(() => {
    return allLinkedItems
      .filter((i) => i.type === 'expense')
      .reduce((acc, item) => acc + item.amount, 0);
  }, [allLinkedItems]);

  // Total Investments (linked + manual)
  const totalInvestments = useMemo(() => {
    return allLinkedItems
      .filter((i) => i.type === 'investment')
      .reduce((acc, item) => acc + item.amount, 0);
  }, [allLinkedItems]);

  // Total Allocated
  const totalAllocated = useMemo(() => {
    return totalExpenses + totalInvestments;
  }, [totalExpenses, totalInvestments]);

  // Net Surplus (O que sobra livre)
  const totalCalculatedSurplus = useMemo(() => {
    return totalIncome - totalAllocated;
  }, [totalIncome, totalAllocated]);

  // Percentages computed automatically
  const investmentPercentage = useMemo(() => {
    if (totalIncome <= 0) return 0;
    return (totalInvestments / totalIncome) * 100;
  }, [totalInvestments, totalIncome]);

  const expensePercentage = useMemo(() => {
    if (totalIncome <= 0) return 0;
    return (totalExpenses / totalIncome) * 100;
  }, [totalExpenses, totalIncome]);

  const surplusPercentage = useMemo(() => {
    if (totalIncome <= 0) return 0;
    return (totalCalculatedSurplus / totalIncome) * 100;
  }, [totalCalculatedSurplus, totalIncome]);

  // Toggle item paid
  const handleToggleItemPaid = (item: SpreadsheetBudgetItem) => {
    if (item.transactionId && onToggleTransactionPaid) {
      onToggleTransactionPaid(item.transactionId);
    } else {
      // Local fallback
      const updated = envelopes.map((env) => ({
        ...env,
        items: env.items.map((i) => (i.id === item.id ? { ...i, isPaid: !i.isPaid } : i)),
      }));
      saveEnvelopes(updated);
    }
  };

  // Delete item
  const handleDeleteItem = (item: SpreadsheetBudgetItem) => {
    if (item.transactionId && onDeleteTransaction) {
      onDeleteTransaction(item.transactionId);
    } else {
      const updated = envelopes.map((env) => ({
        ...env,
        items: env.items.filter((i) => i.id !== item.id),
      }));
      saveEnvelopes(updated);
    }
  };

  // Add new item directly as a real transaction so it connects everywhere!
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(newItemAmount.replace(',', '.'));
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;

    const finalDescription = newItemDescription.trim() || 'Aporte Investimento';
    const finalCategory = newItemCategory.trim() || 'Investimento';

    if (onAddTransaction) {
      onAddTransaction({
        description: finalDescription,
        amount: parsedAmount,
        date: selectedMonthDate || new Date().toISOString().split('T')[0],
        type: 'expense', // Atribuído à despesa porque sai do salário!
        category: finalCategory,
        source: 'manual',
        bankName: 'Nubank',
        isPaid: true,
      });
    } else {
      // Local fallback
      const targetEnv = envelopes.find((env) => env.id === activeEnvelopeIdForNewItem) || envelopes[0];
      const newItem: SpreadsheetBudgetItem = {
        id: `item-${Date.now()}`,
        description: finalDescription,
        amount: parsedAmount,
        percentageOfTotal: totalIncome > 0 ? (parsedAmount / totalIncome) * 100 : 0,
        category: finalCategory,
        type: 'investment',
        envelope: targetEnv.name,
        isPaid: true,
      };

      const updated = envelopes.map((env) => {
        if (env.id !== targetEnv.id) return env;
        return {
          ...env,
          items: [...env.items, newItem],
        };
      });
      saveEnvelopes(updated);
    }

    setActiveEnvelopeIdForNewItem(null);
    setNewItemDescription('');
    setNewItemAmount('');
    setNewItemCategory('Investimento');
    setNewItemType('investment');
  };

  // Reset to Zero
  const handleResetToZero = () => {
    saveEnvelopes(emptySpreadsheetEnvelopes);
  };

  return (
    <div 
      id="spreadsheet-salary-planner" 
      className="bg-white rounded-3xl p-5 sm:p-7 border border-emerald-500/30 shadow-xs relative overflow-hidden space-y-6"
    >
      {/* Top Header - Planejamento Centralizado */}
      <div className="relative flex items-center justify-center pb-5 border-b border-slate-100">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight text-center">
          Planejamento
        </h2>
        {onResetAllData && (
          <div className="absolute right-0 flex items-center gap-1.5">
            {confirmingReset ? (
              <div className="flex items-center gap-1 bg-rose-50 border border-rose-200 px-2 py-1 rounded-xl animate-fadeIn">
                <span className="text-[11px] font-bold text-rose-700">Confirmar?</span>
                <button
                  onClick={() => {
                    saveEnvelopes(emptySpreadsheetEnvelopes);
                    onResetAllData();
                    setConfirmingReset(false);
                  }}
                  className="px-2 py-0.5 bg-rose-600 hover:bg-rose-700 text-white text-[11px] font-bold rounded-lg transition-colors"
                >
                  Sim, zerar tudo
                </button>
                <button
                  onClick={() => setConfirmingReset(false)}
                  className="px-1.5 py-0.5 text-slate-500 hover:text-slate-800 text-[11px] font-semibold"
                >
                  Cancelar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmingReset(true)}
                className="text-xs font-semibold text-slate-500 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 px-2.5 py-1.5 rounded-xl transition-colors flex items-center gap-1.5"
                title="Zerar todos os lançamentos, entradas e planejamento"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Zerar tudo</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* 1. GRAND INVESTMENT RATE SHOWCASE: Mostrando automaticamente quantos % do que ganha vai para o investimento */}
      <div 
        id="investment-rate-hero-card"
        className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 rounded-3xl p-5 sm:p-7 text-white border border-emerald-500/30 shadow-md"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
                <Plus className="w-4 h-4 stroke-[2.5]" />
              </div>
              <span className="text-xs font-bold tracking-wider text-emerald-300">
                Taxa de Investimento Automática
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md font-bold border border-emerald-500/30">
                Live
              </span>
            </div>

            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white">
                {investmentPercentage.toFixed(1)}%
              </span>
              <span className="text-base sm:text-lg font-bold text-emerald-300">
                do que você ganha vai para Investimentos
              </span>
            </div>

            <p className="text-xs text-slate-300">
              {totalIncome > 0 ? (
                <>
                  <strong className="text-white">{formatCurrency(totalInvestments)}</strong> investidos de um total de{' '}
                  <strong className="text-white">{formatCurrency(totalIncome)}</strong> em entradas confirmadas no mês.
                </>
              ) : (
                'Cadastre suas entradas acima para calcular sua taxa de investimento em tempo real.'
              )}
            </p>
          </div>

          {/* Contextual Status / Milestone */}
          <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/10 max-w-sm lg:w-80">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
              <Sparkles className="w-4 h-4" />
              <span>
                {investmentPercentage >= 20
                  ? 'Meta Excelente (20%+)'
                  : investmentPercentage > 0
                  ? 'Construindo Patrimônio'
                  : 'Iniciar Primeiros Aportes'}
              </span>
            </div>
            <p className="text-xs text-slate-200 mt-1.5 leading-relaxed">
              {investmentPercentage >= 20
                ? `Parabéns! Você está investindo ${investmentPercentage.toFixed(1)}% da sua renda, superando a meta clássica de 20% da regra 50/30/20.`
                : investmentPercentage > 0
                ? `Você está destinando ${investmentPercentage.toFixed(1)}% aos investimentos. Você tem ${formatCurrency(Math.max(0, totalCalculatedSurplus))} de sobra que pode ser aportada.`
                : 'Destine uma fatia da sua renda clicando em "+ Investir" para ver a porcentagem crescer automaticamente.'}
            </p>

            <button
              onClick={() => {
                setActiveEnvelopeIdForNewItem(envelopes[0]?.id || 'env-1');
                setNewItemType('investment');
                setNewItemDescription('Reserva de Emergência');
                setNewItemCategory('Investimento');
              }}
              className="mt-3 w-full py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center cursor-pointer"
            >
              <span>Fazer novo aporte</span>
            </button>
          </div>

        </div>

        {/* Visual Multi-Segment Progress Bar */}
        <div className="mt-6 pt-5 border-t border-white/10 space-y-2.5">
          <div className="flex items-center justify-between text-xs text-slate-300 font-medium flex-wrap gap-2">
            <div className="flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block shadow-xs shadow-emerald-500/50" />
                Investimentos: {investmentPercentage.toFixed(1)}% ({formatCurrency(totalInvestments)})
              </span>
              <span className="flex items-center gap-1.5 text-rose-300 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block shadow-xs shadow-rose-500/50" />
                Despesas Vinculadas: {expensePercentage.toFixed(1)}% ({formatCurrency(totalExpenses)})
              </span>
              <span className="flex items-center gap-1.5 text-sky-300 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 inline-block shadow-xs shadow-sky-500/50" />
                Sobra Livre: {surplusPercentage.toFixed(1)}% ({formatCurrency(totalCalculatedSurplus)})
              </span>
            </div>
          </div>

          {/* Bar */}
          <div className="w-full h-3.5 bg-white/15 rounded-full overflow-hidden flex">
            <div 
              className="bg-emerald-500 h-full transition-all duration-500" 
              style={{ width: `${Math.min(100, investmentPercentage)}%` }} 
              title={`Investimentos: ${investmentPercentage.toFixed(1)}%`}
            />
            <div 
              className="bg-rose-500 h-full transition-all duration-500" 
              style={{ width: `${Math.min(100 - investmentPercentage, expensePercentage)}%` }} 
              title={`Despesas: ${expensePercentage.toFixed(1)}%`}
            />
            <div 
              className="bg-sky-500 h-full transition-all duration-500" 
              style={{ width: `${Math.max(0, 100 - investmentPercentage - expensePercentage)}%` }} 
              title={`Sobra Livre: ${surplusPercentage.toFixed(1)}%`}
            />
          </div>

          {/* Benchmark Guides Centralizados - Seleção Dinâmica conforme meta atingida */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-5 text-xs pt-2 font-medium">
            {/* 0% Tier */}
            {investmentPercentage < 10 ? (
              <span className="inline-flex items-center gap-1.5 text-slate-200 font-bold bg-white/15 px-3 py-1 rounded-full border border-white/25 text-xs shadow-xs transition-all">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-300 inline-block" />
                0% {investmentPercentage === 0 ? '(Atual)' : ''}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-slate-400 text-[11px] sm:text-xs font-medium transition-all">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                0%
              </span>
            )}

            <span className="text-slate-600 hidden sm:inline">•</span>

            {/* 10% (Básico) Tier */}
            {investmentPercentage >= 10 && investmentPercentage < 20 ? (
              <span className="inline-flex items-center gap-1.5 text-amber-300 font-bold bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/40 text-xs shadow-xs shadow-amber-500/20 transition-all">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block shadow-xs shadow-amber-400/50" />
                10% (Básico)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-slate-400 text-[11px] sm:text-xs font-medium transition-all">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                10% (Básico)
              </span>
            )}

            <span className="text-slate-600 hidden sm:inline">•</span>

            {/* 20% (Meta Recomendada) Tier - Seleciona apenas ao atingir a meta recomendada */}
            {investmentPercentage >= 20 && investmentPercentage < 30 ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-300 font-bold bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-500/30 text-xs shadow-xs shadow-emerald-500/20 transition-all">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block shadow-xs shadow-emerald-400/50" />
                20% (Meta Recomendada)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-slate-400 text-[11px] sm:text-xs font-medium transition-all">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                20% (Meta Recomendada)
              </span>
            )}

            <span className="text-slate-600 hidden sm:inline">•</span>

            {/* 30%+ (Independência) Tier */}
            {investmentPercentage >= 30 ? (
              <span className="inline-flex items-center gap-1.5 text-indigo-300 font-bold bg-indigo-500/25 px-3 py-1 rounded-full border border-indigo-500/35 text-xs shadow-xs shadow-indigo-500/20 transition-all">
                <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block shadow-xs shadow-indigo-400/50" />
                30%+ (Independência)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-slate-400 text-[11px] sm:text-xs font-medium transition-all">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                30%+ (Independência)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: Adicionar Item (Investimento ou Despesa) direto no Planejamento e Extrato */}
      {activeEnvelopeIdForNewItem && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-xl border border-slate-200">
            <div className="pb-3 border-b border-slate-100 relative">
              <button
                onClick={() => setActiveEnvelopeIdForNewItem(null)}
                className="absolute right-0 top-0 p-1 text-slate-400 hover:text-slate-700 rounded-lg z-10"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="text-center w-full">
                <h3 className="font-black text-base sm:text-lg text-slate-900 flex items-center justify-center gap-1.5">
                  <Plus className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                  <span>Investimento</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Aporte planejado que sai da receita do mês
                </p>
              </div>
            </div>

            <form onSubmit={handleAddItem} className="mt-4 space-y-3.5">
              {/* Badge indicativo centralizado: Investimento */}
              <div className="flex items-center justify-center p-2.5 bg-indigo-50/80 border border-indigo-100 rounded-xl">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center">
                    <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                  </div>
                  <span className="text-xs font-bold text-indigo-950">
                    Investimento
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome do Investimento / Ativo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Reserva de Emergência, Tesouro Selic, CDB 100%, Ações..."
                  value={newItemDescription}
                  onChange={(e) => setNewItemDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs placeholder:text-[11.5px] placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />

                {/* Suggestions Pills */}
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[
                    'Reserva de Emergência',
                    'Tesouro Selic',
                    'CDB 100% CDI',
                    'Ações / FIIs',
                    'Caixinha Nubank',
                    'Criptomoeda',
                  ].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => {
                        setNewItemDescription(sug);
                        setNewItemCategory('Investimento');
                      }}
                      className="px-2 py-0.5 text-[11px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 rounded-md font-medium text-slate-600 transition-colors"
                    >
                      + {sug}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Valor do Aporte (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0,00"
                  value={newItemAmount}
                  onChange={(e) => setNewItemAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm placeholder:text-xs placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Categoria
                </label>
                <input
                  type="text"
                  placeholder="Investimento"
                  value={newItemCategory || 'Investimento'}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs placeholder:text-[11.5px] placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveEnvelopeIdForNewItem(null)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-colors bg-indigo-600 hover:bg-indigo-700"
                >
                  Confirmar Investimento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Gráfico Deitado das Maiores para as Menores (1. Renda, 2. Despesas, 3. Investimentos) */}
      <HorizontalRankingModal
        isOpen={Boolean(rankingModalType)}
        onClose={() => setRankingModalType(null)}
        initialType={rankingModalType || 'expense'}
        transactions={transactions}
      />

      {/* 4. The Grand Surplus Result Footer */}
      <div 
        id="grand-surplus-banner"
        className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-5 sm:p-6 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4 text-center sm:text-left">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30">
            <PiggyBank className="w-8 h-8 text-white stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <span className="text-xs font-bold tracking-wider bg-white/25 px-2 py-0.5 rounded-md text-emerald-100">
                Resultado Integrado
              </span>
              <span className="text-xs text-emerald-100 font-medium hidden sm:inline">
                Sincronização Ativa em Tempo Real
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black tracking-tight mt-1">
              O que sobra? {formatCurrency(totalCalculatedSurplus)}
            </h3>
            <p className="text-xs text-emerald-100 mt-0.5">
              Valor líquido disponível após pagar as contas lançadas e separar a porcentagem dos investimentos.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => onAskAiTips?.(`Como posso aproveitar melhor a sobra de ${formatCurrency(totalCalculatedSurplus)} do meu planejamento salarial?`)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white text-emerald-800 font-bold text-xs rounded-xl shadow-xs hover:bg-emerald-50 transition-all"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Dicas da IA para a Sobra
          </button>
        </div>
      </div>

    </div>
  );
};
