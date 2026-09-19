import React from 'react';
import { Clock, CheckCircle2, X, AlertCircle, Building2, Calendar } from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency, formatDateBR } from '../utils/finance';

interface PendingBillsModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingTransactions: Transaction[];
  onToggleTransactionPaid: (id: string) => void;
  currentMonthName: string;
}

export const PendingBillsModal: React.FC<PendingBillsModalProps> = ({
  isOpen,
  onClose,
  pendingTransactions,
  onToggleTransactionPaid,
  currentMonthName,
}) => {
  if (!isOpen) return null;

  const totalPendingAmount = pendingTransactions.reduce((acc, t) => acc + t.amount, 0);

  return (
    <div 
      id="modal-contas-pendentes"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto overflow-x-hidden touch-pan-y"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-x-hidden flex flex-col max-h-[85vh] mx-auto transition-colors">
        
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-amber-500/10 via-amber-50/50 to-white dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900 border-b border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs shadow-amber-300 dark:shadow-none">
              <Clock className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
                Contas Pendentes ({currentMonthName})
              </h3>
              <p className="text-xs text-amber-800 dark:text-amber-300 font-medium">
                Contas e despesas que você ainda não pagou
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total Summary Banner */}
        <div className="px-5 sm:px-6 py-3.5 bg-amber-50/80 dark:bg-amber-950/20 border-b border-amber-200/50 dark:border-amber-900/30 flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-900 dark:text-amber-300 font-bold block tracking-wider">
              Total a Pagar
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-950 dark:text-amber-100">
              {formatCurrency(totalPendingAmount)}
            </span>
          </div>

          <div className="text-right">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-200 px-2.5 py-1 bg-amber-200/80 dark:bg-amber-900/60 rounded-full">
              {pendingTransactions.length} {pendingTransactions.length === 1 ? 'pendência' : 'pendências'}
            </span>
          </div>
        </div>

        {/* List of Pending Transactions */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
          {pendingTransactions.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                Parabéns! Nenhuma conta pendente
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                Todas as contas e despesas registradas para este mês já foram pagas.
              </p>
            </div>
          ) : (
            pendingTransactions.map((tx) => (
              <div
                key={tx.id}
                className="pt-3 first:pt-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/60 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200/70 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                      {tx.description}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {tx.category}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                      Vencimento: {formatDateBR(tx.date)}
                    </span>
                    {tx.bankName && (
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        {tx.bankName}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-700">
                  <span className="font-black text-rose-700 dark:text-rose-400 text-sm sm:text-base">
                    {formatCurrency(tx.amount)}
                  </span>

                  <button
                    onClick={() => onToggleTransactionPaid(tx.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
                    title="Marcar conta como paga"
                  >
                    <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    <span>Pagar Conta</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-xl transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
