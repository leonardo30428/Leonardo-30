import React, { useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  CreditCard,
  X
} from 'lucide-react';
import { TransactionType } from '../types';

export type ChoiceModalType = TransactionType | 'card_expense';

interface TransactionTypeChoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectType: (type: ChoiceModalType) => void;
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
      id="modal-icones-flutuantes-leque"
      className="fixed inset-0 z-50 flex flex-col justify-end items-center pb-2.5 sm:pb-3 pointer-events-none"
    >
      {/* 1. Fundo Translúcido Suave (Backdrop) */}
      <div 
        className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs pointer-events-auto animate-fadeIn transition-opacity cursor-pointer"
        onClick={onClose}
        aria-label="Fechar leque de opções"
      />

      {/* 2. Container Central do Leque Radial Flutuante */}
      <div 
        className="relative pointer-events-auto flex items-center justify-center w-14 h-14 z-50 mb-1"
        onClick={(e) => e.stopPropagation()}
      >

        {/* --- RAMO 1: ENTRADA (Extrema Esquerda) --- */}
        <div className="absolute -left-30 sm:-left-38 -top-16 sm:-top-20 flex flex-col items-center animate-fanLeft z-10">
          <button
            type="button"
            id="btn-leque-entrada"
            onClick={() => onSelectType('income')}
            className="group flex flex-col items-center cursor-pointer"
            title="Lançar Entrada"
          >
            <span className="text-white text-xs sm:text-[13px] font-black tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] whitespace-nowrap mb-1.5 group-hover:scale-105 group-active:scale-95 transition-all select-none">
              Entrada
            </span>
            <div className="w-13 h-13 rounded-full bg-emerald-600 group-hover:bg-emerald-700 text-white flex items-center justify-center shadow-xl shadow-emerald-600/40 border-2 border-white dark:border-slate-800 group-hover:scale-110 group-active:scale-95 transition-all">
              <TrendingUp className="w-6 h-6 stroke-[2.5]" />
            </div>
          </button>
        </div>

        {/* --- RAMO 2: SAÍDA (Centro-Esquerda Elevado) --- */}
        <div className="absolute -left-10 sm:-left-13 -top-34 sm:-top-40 flex flex-col items-center animate-fanCenterLeft z-10">
          <button
            type="button"
            id="btn-leque-saida"
            onClick={() => onSelectType('expense')}
            className="group flex flex-col items-center cursor-pointer"
            title="Lançar Saída"
          >
            <span className="text-white text-xs sm:text-[13px] font-black tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] whitespace-nowrap mb-1.5 group-hover:scale-105 group-active:scale-95 transition-all select-none">
              Saída
            </span>
            <div className="w-13 h-13 rounded-full bg-rose-600 group-hover:bg-rose-700 text-white flex items-center justify-center shadow-xl shadow-rose-600/40 border-2 border-white dark:border-slate-800 group-hover:scale-110 group-active:scale-95 transition-all">
              <TrendingDown className="w-6 h-6 stroke-[2.5]" />
            </div>
          </button>
        </div>

        {/* --- RAMO 3: DESPESA DO CARTÃO (Centro-Direita Elevado) --- */}
        <div className="absolute left-10 sm:left-13 -top-34 sm:-top-40 flex flex-col items-center animate-fanCenterRight z-10">
          <button
            type="button"
            id="btn-leque-cartao"
            onClick={() => onSelectType('card_expense')}
            className="group flex flex-col items-center cursor-pointer"
            title="Lançar Despesas do Cartão"
          >
            <span className="text-white text-xs sm:text-[13px] font-black tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] whitespace-nowrap mb-1.5 group-hover:scale-105 group-active:scale-95 transition-all select-none">
              Despesas do cartão
            </span>
            <div className="w-13 h-13 rounded-full bg-indigo-600 group-hover:bg-indigo-700 text-white flex items-center justify-center shadow-xl shadow-indigo-600/40 border-2 border-white dark:border-slate-800 group-hover:scale-110 group-active:scale-95 transition-all">
              <CreditCard className="w-6 h-6 stroke-[2.2]" />
            </div>
          </button>
        </div>

        {/* --- RAMO 4: INVESTIMENTO (Extrema Direita) --- */}
        <div className="absolute -right-30 sm:-right-38 -top-16 sm:-top-20 flex flex-col items-center animate-fanRight z-10">
          <button
            type="button"
            id="btn-leque-investimento"
            onClick={() => onSelectType('investment')}
            className="group flex flex-col items-center cursor-pointer"
            title="Lançar Investimento"
          >
            <span className="text-white text-xs sm:text-[13px] font-black tracking-tight drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] whitespace-nowrap mb-1.5 group-hover:scale-105 group-active:scale-95 transition-all select-none">
              Investimento
            </span>
            <div className="w-13 h-13 rounded-full bg-violet-600 group-hover:bg-violet-700 text-white flex items-center justify-center shadow-xl shadow-violet-600/40 border-2 border-white dark:border-slate-800 group-hover:scale-110 group-active:scale-95 transition-all">
              <PiggyBank className="w-6 h-6 stroke-[2.2]" />
            </div>
          </button>
        </div>

        {/* 3. Botão Central de Fechar (X) na base do leque */}
        <button
          type="button"
          id="btn-fechar-leque"
          onClick={onClose}
          className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white flex items-center justify-center shadow-2xl border-3 border-white dark:border-slate-900 hover:scale-105 active:scale-95 transition-all cursor-pointer z-20"
          title="Fechar opções"
        >
          <X className="w-6 h-6 stroke-[2.5]" />
        </button>

      </div>
    </div>
  );
};
