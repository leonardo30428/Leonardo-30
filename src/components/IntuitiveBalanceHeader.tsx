import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  TrendingDown,
  Clock,
  ArrowRight
} from 'lucide-react';
import { MonthlySummary } from '../types';
import { formatCurrency } from '../utils/finance';

interface IntuitiveBalanceHeaderProps {
  summary: MonthlySummary;
}

export const IntuitiveBalanceHeader: React.FC<IntuitiveBalanceHeaderProps> = ({
  summary,
}) => {
  const [showValues, setShowValues] = useState(true);
  const { totalIncome, grossIncome, totalExpense, totalInvestment, totalOutflows, balance } = summary;
  const finalOutflows = totalOutflows ?? (totalExpense + totalInvestment);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-5 transition-colors">
      
      {/* Top row: Total Disponível centralizado */}
      <div className="flex flex-col items-center justify-center text-center pb-4 border-b border-slate-100 dark:border-slate-800 space-y-1">
        <div className="flex items-center justify-center gap-1.5 text-slate-500 dark:text-slate-400">
          <span className="text-xs sm:text-sm font-medium">
            Total disponível
          </span>
          <button
            onClick={() => setShowValues(!showValues)}
            className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            title={showValues ? 'Ocultar valores' : 'Mostrar valores'}
          >
            {showValues ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight ${balance < 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
          {showValues ? formatCurrency(balance) : '••••••'}
        </h1>
      </div>

      {/* 2 Cartões não clicáveis embaixo de Total Disponível: Entrada e Saída lado a lado */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
        
        {/* LADO ESQUERDO: ENTRADA (Não clicável) */}
        <div 
          id="card-receitas-topo"
          className="relative bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl p-3.5 sm:p-5 border border-emerald-200/90 dark:border-emerald-800/60 select-none cursor-default flex flex-col justify-between transition-colors"
        >
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shadow-emerald-200 dark:shadow-none shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-base font-black text-emerald-950 dark:text-emerald-100 block leading-tight truncate">
                  Entrada
                </span>
                <p className="text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-400 font-medium mt-0.5 truncate">
                  Total de entradas
                </p>
              </div>
            </div>

            <div className="mt-2.5 sm:mt-3.5">
              <div className="text-lg xs:text-xl sm:text-3xl font-black text-emerald-950 dark:text-emerald-100 tracking-tight truncate">
                {showValues ? formatCurrency(grossIncome || totalIncome) : '••••••'}
              </div>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-emerald-200/60 dark:border-emerald-800/50 text-[10px] sm:text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1 truncate">
              <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="truncate">Entradas do mês</span>
            </span>
          </div>
        </div>

        {/* LADO DIREITO: SAÍDA (Inclui despesas e investimentos) */}
        <div 
          id="card-saidas-topo"
          className="relative bg-rose-50/70 dark:bg-rose-950/40 rounded-2xl p-3.5 sm:p-5 border border-rose-200/90 dark:border-rose-800/60 select-none cursor-default flex flex-col justify-between transition-colors"
        >
          <div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-rose-600 text-white flex items-center justify-center shadow-xs shadow-rose-200 dark:shadow-none shrink-0">
                <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
              </div>
              <div className="min-w-0">
                <span className="text-xs sm:text-base font-black text-rose-950 dark:text-rose-100 block leading-tight truncate">
                  Saída
                </span>
                <p className="text-[10px] sm:text-xs text-rose-700 dark:text-rose-400 font-medium mt-0.5 truncate">
                  {totalInvestment > 0 ? 'Saídas + Investimentos' : 'Total de saídas'}
                </p>
              </div>
            </div>

            <div className="mt-2.5 sm:mt-3.5">
              <div className="text-lg xs:text-xl sm:text-3xl font-black text-rose-950 dark:text-rose-100 tracking-tight truncate">
                {showValues ? formatCurrency(finalOutflows) : '••••••'}
              </div>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-rose-200/60 dark:border-rose-800/50 text-[10px] sm:text-xs text-rose-700 dark:text-rose-400 font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1 truncate">
              <ArrowDownRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="truncate">Saídas do mês</span>
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
