import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Search, 
  Trash2, 
  Camera, 
  Building2, 
  Edit3,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  Repeat,
  FileText
} from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { formatCurrency, formatDateBR, isTransactionPending } from '../utils/finance';

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
      <div className="mt-4 divide-y divide-slate-100">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Nenhuma transação encontrada com os filtros atuais.
          </div>
        ) : (
          filtered.map((tx) => {
            const isIncome = tx.type === 'income';
            const isInvestment = tx.type === 'investment' || tx.category === 'Investimento';

            return (
              <div
                key={tx.id}
                className="py-3.5 px-2 sm:px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-5 group hover:bg-slate-50/80 rounded-2xl transition-all"
              >
                {/* Left side: Icon, Title, and Subtitle metadata with ample room */}
                <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-2xs mt-0.5 sm:mt-0 ${
                      isIncome
                        ? 'bg-emerald-100 text-emerald-700'
                        : isInvestment
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    {isIncome ? (
                      <TrendingUp className="w-5 h-5 stroke-[2.2]" />
                    ) : isInvestment ? (
                      <PiggyBank className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5 stroke-[2.2]" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* Top line: Description (e.g. Adiantamento, Aluguel, Salário) */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-base sm:text-[17px] font-extrabold text-slate-900 break-words leading-snug">
                        {tx.description}
                      </h4>
                      {tx.isRecurring && (
                        <span title="Conta Recorrente" className="inline-flex items-center text-indigo-600 shrink-0">
                          <Repeat className="w-3.5 h-3.5" />
                        </span>
                      )}
                      {tx.source === 'receipt_scan' && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded-md border border-indigo-200">
                          <Camera className="w-2.5 h-2.5" />
                          IA Scanner
                        </span>
                      )}
                    </div>

                    {/* Subtitle line: Date, Category, and Bank clearly underneath */}
                    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 mt-1">
                      <span className="flex items-center gap-1 text-xs sm:text-[13px] font-semibold text-slate-700">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {formatDateBR(tx.date)}
                      </span>
                      
                      <span className="text-slate-300">•</span>
                      
                      <span className={`px-2 py-0.5 rounded-md text-[11px] ${
                        tx.category === 'Investimento'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-bold'
                          : 'bg-slate-100 text-slate-700 font-medium'
                      }`}>
                        {tx.category}
                      </span>

                      {/* Bank badge: ALWAYS clearly visible underneath, distinct from amount */}
                      <span className="text-slate-300">•</span>
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium text-[11px] flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        {tx.bankName || 'Itaú'}
                      </span>

                      {tx.notes && (
                        <>
                          <span className="text-slate-300 hidden sm:inline">•</span>
                          <span className="text-[11px] text-slate-600 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded-md hidden sm:inline font-medium truncate max-w-[200px]">
                            {tx.notes}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Amount and status badge, totally separated from bank and description */}
                <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center shrink-0 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-100 sm:border-l sm:border-slate-100 sm:pl-5 gap-1.5 min-w-[140px]">
                  <span
                    className={`text-base sm:text-lg font-black tracking-tight whitespace-nowrap ${
                      isIncome
                        ? 'text-emerald-600'
                        : isInvestment
                        ? 'text-indigo-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {isIncome ? '+' : '-'}{' '}
                    {formatCurrency(tx.amount)}
                  </span>

                  {(() => {
                    const pending = isTransactionPending(tx);
                    return (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onToggleTransactionPaid?.(tx.id)}
                          title={
                            pending
                              ? 'Pendente - clique para marcar como concluído'
                              : isIncome
                              ? 'Recebido - clique para marcar como pendente'
                              : 'Pago - clique para marcar como pendente'
                          }
                          className={`inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap shadow-2xs transition-all hover:scale-102 ${
                            pending
                              ? 'text-amber-800 bg-amber-100 border border-amber-300'
                              : isIncome
                              ? 'text-emerald-800 bg-emerald-100/90 border border-emerald-200'
                              : isInvestment
                              ? 'text-indigo-800 bg-indigo-100/90 border border-indigo-200'
                              : 'text-slate-700 bg-slate-100 border border-slate-200'
                          }`}
                        >
                          {pending ? (
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                          ) : (
                            <CheckCircle2 className={`w-3.5 h-3.5 ${isInvestment ? 'text-indigo-600' : 'text-emerald-600'}`} />
                          )}
                          {pending ? 'Pendente' : isIncome ? 'Recebido' : isInvestment ? 'Aporte' : 'Pago'}
                        </button>

                        {onEditTransaction && (
                          <button
                            onClick={() => onEditTransaction(tx)}
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Editar este lançamento"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => onDeleteTransaction(tx.id)}
                          className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-70 group-hover:opacity-100 cursor-pointer"
                          title="Excluir movimentação"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })()}
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
