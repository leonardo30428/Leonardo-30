import React, { useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  X, 
  ArrowRight 
} from 'lucide-react';
import { TransactionType } from '../types';

interface TransactionTypeChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: TransactionType) => void;
}

export const TransactionTypeChoiceModal: React.FC<TransactionTypeChoiceModalProps> = ({
  isOpen,
  onClose,
  onSelectType,
}) => {
  // Fecha com a tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      id="modal-escolha-tipo-lancamento"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-fadeIn transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 pb-3 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              O que você deseja lançar?
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
              Escolha uma opção para continuar
            </p>
          </div>
          <button
            type="button"
            id="btn-fechar-escolha-tipo"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options List */}
        <div className="p-5 sm:p-6 space-y-3">
          
          {/* 1. Opção RECEITA */}
          <button
            type="button"
            id="btn-opcao-receita"
            onClick={() => onSelectType('income')}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-100/90 dark:hover:bg-emerald-950/50 border border-emerald-200/90 dark:border-emerald-900/50 hover:border-emerald-400 dark:hover:border-emerald-700 text-left transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shadow-emerald-200 dark:shadow-none shrink-0">
                <TrendingUp className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-base font-extrabold text-emerald-950 dark:text-emerald-100 block">
                  Receita
                </span>
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-medium block">
                  Salários, rendimentos, vendas, PIX recebido e extras
                </span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
          </button>

          {/* 2. Opção GASTO */}
          <button
            type="button"
            id="btn-opcao-gasto"
            onClick={() => onSelectType('expense')}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/30 hover:bg-rose-100/90 dark:hover:bg-rose-950/50 border border-rose-200/90 dark:border-rose-900/50 hover:border-rose-400 dark:hover:border-rose-700 text-left transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-xs shadow-rose-200 dark:shadow-none shrink-0">
                <TrendingDown className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-base font-extrabold text-rose-950 dark:text-rose-100 block">
                  Gasto
                </span>
                <span className="text-xs text-rose-700 dark:text-rose-400 font-medium block">
                  Contas do mês, boletos, faturas, compras e despesas
                </span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-rose-600 dark:text-rose-400 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
          </button>

          {/* 3. Opção INVESTIMENTO */}
          <button
            type="button"
            id="btn-opcao-investimento"
            onClick={() => onSelectType('investment')}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 hover:bg-indigo-100/90 dark:hover:bg-indigo-950/50 border border-indigo-200/90 dark:border-indigo-900/50 hover:border-indigo-400 dark:hover:border-indigo-700 text-left transition-colors group cursor-pointer"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shadow-indigo-200 dark:shadow-none shrink-0">
                <PiggyBank className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div>
                <span className="text-base font-extrabold text-indigo-950 dark:text-indigo-100 block">
                  Investimento
                </span>
                <span className="text-xs text-indigo-700 dark:text-indigo-400 font-medium block">
                  Aportes, reservas de emergência, caixinhas e ativos
                </span>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-indigo-600 dark:text-indigo-400 group-hover:translate-x-1 transition-transform shrink-0 ml-2" />
          </button>

        </div>

        {/* Footer info */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 text-center">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};
