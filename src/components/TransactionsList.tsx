import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  FileText
} from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { formatCurrency, isTransactionPending } from '../utils/finance';
import { getCategoryVisual, formatShortDateWithMonth } from '../utils/categoryIcons';

export type TransactionFilterType = 'all' | TransactionType | 'pending';

interface TransactionsListProps {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
  onToggleTransactionPaid?: (id: string) => void;
  onClearHistory?: (scope: 'currentMonth' | 'all') => void;
  onEditTransaction?: (transaction: Transaction) => void;
  onOpenMonthlyPdfReport?: () => void;
  currentMonthName?: string;
  activeFilter: TransactionFilterType;
  onChangeFilter: (filter: TransactionFilterType) => void;
}

export const TransactionsList: React.FC<TransactionsListProps> = ({
  transactions,
  onDeleteTransaction,
  onToggleTransactionPaid,
  onClearHistory,
  onEditTransaction,
  onOpenMonthlyPdfReport,
  currentMonthName = 'Mês Atual',
  activeFilter,
  onChangeFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showClearModal, setShowClearModal] = useState(false);

  const pendingCount = transactions.filter(
    (tx) => isTransactionPending(tx) || tx.isPaid === false
  ).length;

  const filtered = transactions.filter((tx) => {
    const isInvest = tx.type === 'investment' || tx.category === 'Investimento';
    const isPending = isTransactionPending(tx) || tx.isPaid === false;

    let matchesFilter = false;
    if (activeFilter === 'all') {
      matchesFilter = true;
    } else if (activeFilter === 'pending') {
      matchesFilter = isPending;
    } else if (activeFilter === 'investment') {
      matchesFilter = isInvest;
    } else if (activeFilter === 'expense') {
      matchesFilter = tx.type === 'expense';
    } else if (activeFilter === 'income') {
      matchesFilter = tx.type === 'income';
    }

    const matchesSearch =
      tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.bankName && tx.bankName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  // Separamos as movimentações em abertas/pendentes e concluídas
  const pendingTransactions = filtered.filter(
    (tx) => isTransactionPending(tx) || tx.isPaid === false
  );
  const concludedTransactions = filtered.filter(
    (tx) => !isTransactionPending(tx) && tx.isPaid !== false
  );

  const renderTransactionRow = (tx: Transaction, isConcluded: boolean) => {
    const visual = getCategoryVisual(tx.category);
    const CategoryIcon = visual.icon;
    const isIncome = tx.type === 'income';
    const isInvestment = tx.type === 'investment' || tx.category === 'Investimento';
    const dateText = formatShortDateWithMonth(tx.date);
    const bankNameClean = tx.bankName || 'Nubank';

    return (
      <div
        key={tx.id}
        onClick={() => onEditTransaction?.(tx)}
        className={`p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 group ${
          isConcluded
            ? 'bg-slate-50/60 border-slate-200/70 opacity-60 hover:opacity-90 hover:bg-slate-50'
            : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
        }`}
        title="Clique para editar este lançamento"
      >
        {/* Lado Esquerdo: Ícone da categoria, Descrição e embaixo Categoria - Banco */}
        <div className="flex items-center gap-3 sm:gap-3.5 min-w-0 flex-1">
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${visual.bgColor} ${visual.textColor} ${visual.borderColor} shadow-2xs`}
          >
            <CategoryIcon className="w-5 h-5 stroke-[2.2]" />
          </div>

          <div className="min-w-0 flex-1">
            {/* Descrição */}
            <h4
              className={`text-sm sm:text-base font-extrabold text-slate-900 break-words leading-snug ${
                isConcluded ? 'line-through text-slate-500' : ''
              }`}
            >
              {tx.description}
            </h4>

            {/* Embaixo: categoria - banco */}
            <span className="text-xs text-slate-500 font-medium block mt-0.5 break-words">
              {tx.category || 'Outros'} - {bankNameClean}
            </span>
          </div>
        </div>

        {/* Lado Direito: No topo a Data (ex: 18 de set) e Embaixo o Valor */}
        <div className="flex items-center shrink-0 text-right">
          <div className="flex flex-col items-end">
            {/* Data: ex 18 de set */}
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500">
              {dateText}
            </span>

            {/* Embaixo da data: o valor */}
            <span
              className={`text-sm sm:text-base font-black tracking-tight whitespace-nowrap ${
                isIncome
                  ? 'text-emerald-600'
                  : isInvestment
                  ? 'text-indigo-600'
                  : 'text-rose-600'
              }`}
            >
              {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div id="extrato-transacoes" className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
      
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">
            Extrato de Movimentações
          </h3>
          <p className="text-xs text-slate-500">
            Entradas, saídas e investimentos sincronizados e manuais
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar movimentação..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8.5 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 w-full sm:w-52"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200/60 overflow-x-auto">
            <button
              onClick={() => onChangeFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas
            </button>
            <button
              onClick={() => onChangeFilter('pending')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                activeFilter === 'pending'
                  ? 'bg-amber-500 text-white shadow-xs font-bold'
                  : 'text-slate-600 hover:text-amber-800'
              }`}
            >
              <span>Pendentes</span>
              {pendingCount > 0 && (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                  activeFilter === 'pending' ? 'bg-amber-600 text-white' : 'bg-amber-200 text-amber-900'
                }`}>
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => onChangeFilter('income')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Entradas
            </button>
            <button
              onClick={() => onChangeFilter('expense')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Saídas
            </button>
            <button
              onClick={() => onChangeFilter('investment')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                activeFilter === 'investment'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Investimentos
            </button>
          </div>

          {/* Relatório PDF Button */}
          {onOpenMonthlyPdfReport && transactions.length > 0 && (
            <button
              onClick={onOpenMonthlyPdfReport}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-900 border border-emerald-200 rounded-xl transition-all shadow-2xs whitespace-nowrap cursor-pointer"
              title="Gerar e enviar relatório do mês em PDF"
            >
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              <span>Relatório PDF</span>
            </button>
          )}

          {/* Apagar Histórico Button */}
          {onClearHistory && transactions.length > 0 && (
            <button
              onClick={() => setShowClearModal(true)}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 hover:text-rose-800 border border-rose-200 rounded-xl transition-all shadow-2xs whitespace-nowrap cursor-pointer"
              title="Opção de apagar histórico"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
              <span>Apagar Histórico</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal de Confirmação para Apagar Histórico */}
      {showClearModal && onClearHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-base">
                  Apagar Histórico de Transações
                </h4>
                <p className="text-xs text-slate-500">
                  Escolha o escopo de limpeza do histórico
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-200/70">
              Esta ação removerá os registros selecionados. Você pode optar por apagar somente as contas de {currentMonthName} ou todo o histórico geral.
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  onClearHistory('currentMonth');
                  setShowClearModal(false);
                }}
                className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all text-left flex items-center justify-between group cursor-pointer"
              >
                <span>Apagar apenas contas de {currentMonthName}</span>
                <span className="text-[11px] font-semibold text-rose-600 group-hover:translate-x-0.5 transition-transform">→</span>
              </button>

              <button
                onClick={() => {
                  onClearHistory('all');
                  setShowClearModal(false);
                }}
                className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all text-left flex items-center justify-between shadow-xs cursor-pointer"
              >
                <span>Apagar todo o histórico geral</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowClearModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Table / List */}
      <div className="mt-4">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Nenhuma movimentação encontrada com os filtros atuais.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Movimentações Pendentes / Em Aberto */}
            {pendingTransactions.length > 0 && (
              <div className="space-y-2.5">
                {concludedTransactions.length > 0 && (
                  <div className="flex items-center gap-2 pb-1">
                    <span className="text-xs font-black uppercase tracking-wider text-slate-600">
                      Movimentações ({pendingTransactions.length})
                    </span>
                    <div className="flex-1 h-px bg-slate-200/70 ml-1" />
                  </div>
                )}
                {pendingTransactions.map((tx) => renderTransactionRow(tx, false))}
              </div>
            )}

            {/* Sessão de Concluídas (Ofuscadas) */}
            {concludedTransactions.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2 pb-1 pt-1 border-t border-slate-100">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    Concluídas ({concludedTransactions.length})
                  </span>
                  <div className="flex-1 h-px bg-slate-200/70 ml-1" />
                </div>
                {concludedTransactions.map((tx) => renderTransactionRow(tx, true))}
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};
