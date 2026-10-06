import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  ArrowUp, 
  ArrowDown, 
  ArrowUpRight, 
  ArrowDownRight
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

      {/* 2 Cartões embaixo de Total Disponível: Entrada e Saída lado a lado - Sem fundo colorido, sem quadrado no ícone, apenas linha separando */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4">
        
        {/* LADO ESQUERDO: ENTRADA (Seta para cima direta, sem quadrado, fundo neutro) */}
        <div 
          id="card-receitas-topo"
          className="relative bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl p-3.5 sm:p-5 border border-slate-200/90 dark:border-slate-800 select-none cursor-default flex flex-col justify-between transition-colors"
        >
          <div>
            <div className="flex items-center gap-2">
              <ArrowUp className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-600 dark:text-emerald-400 stroke-[2.5] shrink-0" />
              <div className="min-w-0">
                <span className="text-xs sm:text-base font-black text-slate-900 dark:text-white block leading-tight truncate">
                  Entrada
                </span>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">
                  Total de entradas
                </p>
              </div>
            </div>

            <div className="mt-2.5 sm:mt-3.5">
              <div className="text-lg xs:text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                {showValues ? formatCurrency(grossIncome || totalIncome) : '••••••'}
              </div>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-200/80 dark:border-slate-700/60 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1 truncate text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="truncate">Entradas do mês</span>
            </span>
          </div>
        </div>

        {/* LADO DIREITO: SAÍDA (Seta para baixo direta, sem quadrado, fundo neutro) */}
        <div 
          id="card-saidas-topo"
          className="relative bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl p-3.5 sm:p-5 border border-slate-200/90 dark:border-slate-800 select-none cursor-default flex flex-col justify-between transition-colors"
        >
          <div>
            <div className="flex items-center gap-2">
              <ArrowDown className="w-5 h-5 sm:w-6 sm:h-6 text-rose-600 dark:text-rose-400 stroke-[2.5] shrink-0" />
              <div className="min-w-0">
                <span className="text-xs sm:text-base font-black text-slate-900 dark:text-white block leading-tight truncate">
                  Saída
                </span>
                <p className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5 truncate">
                  {totalInvestment > 0 ? 'Saídas + Investimentos' : 'Total de saídas'}
                </p>
              </div>
            </div>

            <div className="mt-2.5 sm:mt-3.5">
              <div className="text-lg xs:text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight truncate">
                {showValues ? formatCurrency(finalOutflows) : '••••••'}
              </div>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-200/80 dark:border-slate-700/60 text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center justify-between">
            <span className="flex items-center gap-1 truncate text-rose-600 dark:text-rose-400">
              <ArrowDownRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="truncate">Saídas do mês</span>
            </span>
          </div>
        </div>

      </div>

    </div>
  );
};
