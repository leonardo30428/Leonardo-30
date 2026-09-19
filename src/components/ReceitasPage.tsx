import React, { useState } from 'react';
import { 
  ArrowLeft, 
  TrendingUp, 
  Plus, 
  Wallet, 
  CheckCircle2, 
  Calendar, 
  Layers,
  ArrowUpRight,
  Trash2,
  PieChart,
  Sparkles,
  Clock
} from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency, formatDate, isTransactionPending } from '../utils/finance';

interface ReceitasPageProps {
  transactions: Transaction[];
  onBack: () => void;
  onOpenNewTransaction: () => void;
  onNavigateToPlanning: () => void;
  onDeleteTransaction?: (id: string) => void;
  onToggleTransactionPaid?: (id: string) => void;
}

export const ReceitasPage: React.FC<ReceitasPageProps> = ({
  transactions,
  onBack,
  onOpenNewTransaction,
  onNavigateToPlanning,
  onDeleteTransaction,
  onToggleTransactionPaid,
}) => {
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'paid' | 'pending'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Income transactions
  const incomeTransactions = transactions.filter((t) => t.type === 'income');
  const expenseTransactions = transactions.filter((t) => t.type === 'expense');

  const filteredIncomes = incomeTransactions.filter((item) => {
    const pending = isTransactionPending(item);
    if (filterPeriod === 'paid' && pending) return false;
    if (filterPeriod === 'pending' && !pending) return false;
    if (searchTerm && !item.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const totalIncome = incomeTransactions.reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = expenseTransactions.reduce((acc, t) => acc + t.amount, 0);
  const totalReceived = incomeTransactions
    .filter((t) => !isTransactionPending(t))
    .reduce((acc, t) => acc + t.amount, 0);

  // Dynamic sobra (surplus) based on actual income and expenses
  const sobraLiquida = totalIncome - totalExpense;

  // Group dynamic income by category
  interface CategorySummary {
    total: number;
    count: number;
  }

  const categoriesMap: Record<string, CategorySummary> = {};
  incomeTransactions.forEach((t) => {
    const cat = t.category || 'Outras Receitas';
    if (!categoriesMap[cat]) {
      categoriesMap[cat] = { total: 0, count: 0 };
    }
    categoriesMap[cat].total += t.amount;
    categoriesMap[cat].count += 1;
  });

  const dynamicCategories: [string, CategorySummary][] = Object.entries(categoriesMap);

  return (
    <div id="receitas-dedicated-page" className="space-y-6 animate-fadeIn">
      
      {/* Top Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
            id="back-to-home-btn"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl border border-slate-200 shadow-2xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Voltar ao Início</span>
          </button>

          <span className="text-slate-300 font-light">/</span>
          <span className="text-xs sm:text-sm font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/60 flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-emerald-600" />
            Gestão de Entradas
          </span>
        </div>

        {/* Quick Add Income */}
        <button
          id="receitas-add-income-btn"
          onClick={onOpenNewTransaction}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors self-start sm:self-auto active:scale-98"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Nova Entrada</span>
        </button>
      </div>

      {/* Hero Stats for Incomes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Receitas */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-emerald-800 bg-emerald-100/90 px-2.5 py-1 rounded-md">
              Total de Entradas
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-3">
            {formatCurrency(totalIncome)}
          </p>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{incomeTransactions.length} entrada(s) registrada(s)</span>
          </div>
        </div>

        {/* Status de Recebimento */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
              Confirmado em Conta
            </span>
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-700 tracking-tight mt-3">
            {formatCurrency(totalReceived)}
          </p>
          <div className="mt-2 text-xs text-slate-500">
            <span>
              {totalIncome > 0 
                ? `${((totalReceived / totalIncome) * 100).toFixed(0)}% das entradas já recebidas` 
                : 'Aguardando primeiros lançamentos'}
            </span>
          </div>
        </div>

        {/* Sobra Líquida baseada no orçamento real */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[11px] font-bold tracking-wider bg-white/20 px-2 py-0.5 rounded-md">
              Sobra Líquida Atual
            </span>
            <p className="text-2xl sm:text-3xl font-black mt-2">
              {formatCurrency(sobraLiquida)}
            </p>
            <p className="text-xs text-emerald-100 mt-1">
              {sobraLiquida >= 0 
                ? 'Saldo disponível após abater todas as despesas lançadas.' 
                : 'Gastos superaram as receitas cadastradas.'}
            </p>
          </div>

          <button
            onClick={onNavigateToPlanning}
            className="mt-3 text-xs font-bold text-white bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg flex items-center justify-between transition-colors"
          >
            <span>Ver Planejamento Salarial</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Breakdown by Income Sources (Dynamic based on user entries) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-emerald-600" />
              Fontes de Renda por Categoria
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Valores calculados em tempo real a partir dos seus lançamentos de receita.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg self-start sm:self-auto">
            {totalIncome > 0 ? `Total: ${formatCurrency(totalIncome)}` : 'Zerado'}
          </span>
        </div>

        {dynamicCategories.length === 0 ? (
          <div className="mt-4 p-8 text-center bg-slate-50/70 border border-dashed border-slate-200 rounded-2xl">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Wallet className="w-6 h-6" />
            </div>
            <h4 className="text-sm sm:text-base font-bold text-slate-800">
              Nenhuma entrada cadastrada ainda
            </h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">
              Todas as contas estão zeradas para você testar do zero. Clique no botão abaixo para adicionar sua primeira entrada (salário, comissão, adiantamento ou vendas).
            </p>
            <button
              onClick={onOpenNewTransaction}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Cadastrar Primeira Entrada</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {dynamicCategories.map(([categoryName, data], index) => {
              const pct = totalIncome > 0 ? ((data.total / totalIncome) * 100).toFixed(1) : '0';
              const colors = [
                { border: 'border-sky-200', bg: 'bg-sky-50/40', badge: 'bg-sky-100 text-sky-800', text: 'text-sky-700', bar: 'bg-sky-500' },
                { border: 'border-emerald-200', bg: 'bg-emerald-50/40', badge: 'bg-emerald-100 text-emerald-800', text: 'text-emerald-700', bar: 'bg-emerald-500' },
                { border: 'border-purple-200', bg: 'bg-purple-50/40', badge: 'bg-purple-100 text-purple-800', text: 'text-purple-700', bar: 'bg-purple-500' },
              ];
              const theme = colors[index % colors.length];

              return (
                <div 
                  key={categoryName}
                  className={`p-4 rounded-xl border ${theme.border} ${theme.bg} flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold tracking-wider px-2 py-0.5 rounded ${theme.badge}`}>
                        {pct}% da Renda
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {data.count} lançamento(s)
                      </span>
                    </div>
                    <h4 className="text-base font-black text-slate-900 mt-2 truncate">
                      {categoryName}
                    </h4>
                    <p className={`text-xl font-extrabold ${theme.text} mt-1`}>
                      {formatCurrency(data.total)}
                    </p>
                  </div>

                  <div className="mt-4 pt-2 border-t border-slate-200/60">
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${theme.bar}`}
                        style={{ width: `${Math.min(100, Math.max(5, Number(pct)))}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detailed Incomes Table / List */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Extrato de Entradas Cadastradas
            </h3>
            <p className="text-xs text-slate-500">
              Lançamentos individuais de receitas e recebimentos programados.
            </p>
          </div>

          {/* Filter & Search */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Buscar receita..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
            />

            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg text-xs">
              <button
                onClick={() => setFilterPeriod('all')}
                className={`px-2.5 py-1 font-semibold rounded-md transition-all ${
                  filterPeriod === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Todas ({incomeTransactions.length})
              </button>
              <button
                onClick={() => setFilterPeriod('paid')}
                className={`px-2.5 py-1 font-semibold rounded-md transition-all ${
                  filterPeriod === 'paid' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
                }`}
              >
                Recebidas
              </button>
            </div>
          </div>
        </div>

        {/* List of Incomes with Generous Spacing and NO overlapping text */}
        {filteredIncomes.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            Nenhuma receita encontrada para os filtros selecionados.
          </div>
        ) : (
          <div className="divide-y divide-slate-100 mt-2">
            {filteredIncomes.map((item) => (
              <div 
                key={item.id}
                className="py-4 px-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 hover:bg-slate-50/90 rounded-2xl transition-all"
              >
                {/* Left side: Icon, Title, and Subtitle metadata with ample room */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs mt-0.5 sm:mt-0">
                    <TrendingUp className="w-5 h-5 stroke-[2.2]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 truncate">
                      {item.description}
                    </h4>
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1 font-medium text-slate-600">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {formatDate(item.date)}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium text-[11px]">
                        {item.category}
                      </span>
                      {item.bankName && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium text-[11px]">
                            {item.bankName}
                          </span>
                        </>
                      )}
                      {item.notes && (
                        <>
                          <span className="text-slate-300 hidden sm:inline">•</span>
                          <span className="text-[11px] text-emerald-800 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md hidden sm:inline font-medium">
                            {item.notes}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Amount and Recebido badge separated from left text */}
                <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center shrink-0 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-100 sm:border-l sm:border-slate-100 sm:pl-5 gap-2 min-w-[130px]">
                  <span className="text-base sm:text-lg font-black text-emerald-600 tracking-tight whitespace-nowrap">
                    +{formatCurrency(item.amount)}
                  </span>
                  <div className="flex items-center gap-2">
                    {(() => {
                      const pending = isTransactionPending(item);
                      return (
                        <button
                          type="button"
                          onClick={() => onToggleTransactionPaid?.(item.id)}
                          title={pending ? 'Pendente - clique para marcar como recebido' : 'Recebido - clique para marcar como pendente'}
                          className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap shadow-2xs transition-all hover:scale-102 ${
                            pending
                              ? 'text-amber-800 bg-amber-100 border border-amber-300'
                              : 'text-emerald-800 bg-emerald-100/90 border border-emerald-200'
                          }`}
                        >
                          {pending ? (
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                          ) : (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                          {pending ? 'Pendente' : 'Recebido'}
                        </button>
                      );
                    })()}
                    {onDeleteTransaction && (
                      <button
                        onClick={() => onDeleteTransaction(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                        title="Excluir lançamento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
