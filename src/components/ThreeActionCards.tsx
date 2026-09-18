import React from 'react';
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  CreditCard, 
  ChevronRight 
} from 'lucide-react';
import { formatCurrency } from '../utils/finance';

interface ThreeActionCardsProps {
  totalExpense: number;
  totalIncome: number;
  invoiceAmount: number;
  onNavigate: (section: 'gastos' | 'receitas' | 'fatura') => void;
}

export const ThreeActionCards: React.FC<ThreeActionCardsProps> = ({
  totalExpense,
  totalIncome,
  invoiceAmount,
  onNavigate,
}) => {
  return (
    <div id="three-action-cards-section" className="space-y-2">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* CARD 1: DESPESAS */}
        <div
          id="btn-card-despesas"
          role="button"
          tabIndex={0}
          onClick={() => onNavigate('gastos')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigate('gastos');
            }
          }}
          className="group bg-white hover:bg-rose-50/40 p-4 sm:p-5 rounded-3xl border border-slate-200 hover:border-rose-300 shadow-xs hover:shadow-sm transition-all text-left flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-rose-100 group-hover:bg-rose-600 text-rose-600 group-hover:text-white flex items-center justify-center font-bold transition-colors">
                <ArrowDownRight className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-sm text-slate-800 group-hover:text-rose-900">
                Despesas
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
          </div>

          <div>
            <span className="text-[11px] font-bold tracking-wider text-slate-400">
              Total de Gastos
            </span>
            <div className="text-xl sm:text-2xl font-black text-rose-600 tracking-tight">
              {formatCurrency(totalExpense)}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Toque para abrir a página de despesas
            </span>
          </div>
        </div>

        {/* CARD 2: A RECEBER */}
        <div
          id="btn-card-receber"
          role="button"
          tabIndex={0}
          onClick={() => onNavigate('receitas')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigate('receitas');
            }
          }}
          className="group bg-white hover:bg-emerald-50/40 p-4 sm:p-5 rounded-3xl border border-slate-200 hover:border-emerald-300 shadow-xs hover:shadow-sm transition-all text-left flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 group-hover:bg-emerald-600 text-emerald-600 group-hover:text-white flex items-center justify-center font-bold transition-colors">
                <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-sm text-slate-800 group-hover:text-emerald-900">
                A Receber
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
          </div>

          <div>
            <span className="text-[11px] font-bold tracking-wider text-slate-400">
              Total de Entradas
            </span>
            <div className="text-xl sm:text-2xl font-black text-emerald-600 tracking-tight">
              {formatCurrency(totalIncome)}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Toque para abrir a página de recebimentos
            </span>
          </div>
        </div>

        {/* CARD 3: FATURA */}
        <div
          id="btn-card-fatura"
          role="button"
          tabIndex={0}
          onClick={() => onNavigate('fatura')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onNavigate('fatura');
            }
          }}
          className="group bg-white hover:bg-indigo-50/40 p-4 sm:p-5 rounded-3xl border border-slate-200 hover:border-indigo-300 shadow-xs hover:shadow-sm transition-all text-left flex flex-col justify-between cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 group-hover:bg-indigo-600 text-indigo-600 group-hover:text-white flex items-center justify-center font-bold transition-colors">
                <CreditCard className="w-5 h-5" />
              </div>
              <span className="font-extrabold text-sm text-slate-800 group-hover:text-indigo-900">
                Fatura
              </span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
          </div>

          <div>
            <span className="text-[11px] font-bold tracking-wider text-slate-400">
              Fatura Atual do Cartão
            </span>
            <div className="text-xl sm:text-2xl font-black text-indigo-600 tracking-tight">
              {formatCurrency(invoiceAmount)}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Toque para abrir a página da fatura
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
