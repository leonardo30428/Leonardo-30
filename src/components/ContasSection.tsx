import React, { useState } from 'react';
import { 
  Clock, 
  TrendingDown, 
  TrendingUp, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  Repeat, 
  ChevronRight,
  Filter
} from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency, formatDateBR } from '../utils/finance';

interface ContasSectionProps {
  transactions: Transaction[];
  onSelectTab: (type: 'pagar' | 'receber') => void;
}

export const ContasSection: React.FC<ContasSectionProps> = ({
  transactions,
  onSelectTab,
}) => {
  // Contas de Saídas/Gastos (Despesas) - NUNCA inclui receitas
  const expenseAccounts = transactions.filter((t) => t.type === 'expense');

  // Entradas/Receitas
  const incomeAccounts = transactions.filter((t) => t.type === 'income');

  // Cálculos para o cartão "Pagar"
  const pendingExpenses = expenseAccounts.filter((t) => t.isPaid === false);
  const totalToPay = pendingExpenses.reduce((sum, t) => sum + t.amount, 0);
  const countToPay = pendingExpenses.length;

  // Cálculos para o cartão "Receber"
  const pendingIncomes = incomeAccounts.filter((t) => t.isPaid === false);
  const totalToReceive = pendingIncomes.length > 0 
    ? pendingIncomes.reduce((sum, t) => sum + t.amount, 0)
    : incomeAccounts.reduce((sum, t) => sum + t.amount, 0);
  const countToReceive = pendingIncomes.length > 0 ? pendingIncomes.length : incomeAccounts.length;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-5">
      
      {/* 2 Cartões Clicáveis: "Pagar" e "Receber" (Abrem aba dedicada de Contas) */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        
        {/* Cartão Clicável: PAGAR (Compacto) */}
        <button
          type="button"
          id="card-filtro-pagar"
          onClick={() => onSelectTab('pagar')}
          className="flex flex-col items-start p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 bg-rose-50/40 hover:bg-rose-50/90 hover:border-rose-300 hover:shadow-xs text-left transition-all cursor-pointer relative group active:scale-98"
          title="Ver contas a pagar em aba dedicada"
        >
          {/* Topo do card: Ícone menor + Título */}
          <div className="flex items-center justify-between w-full mb-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs shadow-rose-200 shrink-0">
                <Clock className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-slate-700 truncate">
                Pagar
              </span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition-all" />
          </div>

          <span className="text-base sm:text-xl font-black text-slate-900 tracking-tight mt-0.5 truncate w-full">
            {formatCurrency(totalToPay)}
          </span>

          <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-[11px] font-semibold text-rose-700">
            <span className="truncate">{countToPay > 0 ? `${countToPay} pendente(s)` : 'Tudo em dia'}</span>
          </div>
        </button>

        {/* Cartão Clicável: RECEBER (Compacto) */}
        <button
          type="button"
          id="card-filtro-receber"
          onClick={() => onSelectTab('receber')}
          className="flex flex-col items-start p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 bg-emerald-50/40 hover:bg-emerald-50/90 hover:border-emerald-300 hover:shadow-xs text-left transition-all cursor-pointer relative group active:scale-98"
          title="Ver contas a receber em aba dedicada"
        >
          {/* Topo do card: Ícone menor + Título */}
          <div className="flex items-center justify-between w-full mb-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs shadow-emerald-200 shrink-0">
                <TrendingUp className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span className="text-[11px] sm:text-xs font-bold text-slate-700 truncate">
                Receber
              </span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
          </div>

          <span className="text-base sm:text-xl font-black text-slate-900 tracking-tight mt-0.5 truncate w-full">
            {formatCurrency(totalToReceive)}
          </span>

          <div className="flex items-center gap-1 mt-1 text-[10px] sm:text-[11px] font-semibold text-emerald-700">
            <span className="truncate">{countToReceive > 0 ? `${countToReceive} previsto(s)` : 'Nenhum'}</span>
          </div>
        </button>

      </div>

    </div>
  );
};
