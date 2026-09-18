import React from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Lightbulb, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { MonthlySummary } from '../types';
import { formatCurrency } from '../utils/finance';

interface CompactFinancialHealthProps {
  summary: MonthlySummary;
  onAskAdvice: () => void;
  onViewExpenses: () => void;
}

export const CompactFinancialHealth: React.FC<CompactFinancialHealthProps> = ({
  summary,
  onAskAdvice,
  onViewExpenses,
}) => {
  const { 
    isRed, 
    balance, 
    financialHealthScore, 
    healthStatus, 
    topExpenseCategory,
    savingsRate,
    totalIncome,
    totalExpense
  } = summary;

  const isZeroed = totalIncome === 0 && totalExpense === 0;
  const displayScore = isZeroed ? 100 : financialHealthScore;

  // Practical tailored tip to improve score
  const tipText = isZeroed
    ? 'Adicione suas receitas ou despesas nos cartões abaixo para acompanhar sua saúde financeira.'
    : isRed 
    ? `Você gastou mais do que recebeu em ${formatCurrency(Math.abs(balance))}. Reduza gastos na categoria ${topExpenseCategory.category} para estancar o déficit e recuperar seu score para 80+.`
    : `Seu saldo está positivo (+${formatCurrency(balance)})! Dica para subir de ${financialHealthScore} para 95+: guarde 10% da sua sobra em uma aplicação com liquidez diária (100% do CDI).`;

  return (
    <div 
      id="compact-financial-health-card"
      className={`rounded-2xl p-4 sm:p-5 border transition-all ${
        isZeroed
          ? 'bg-slate-50/80 border-slate-200 text-slate-900'
          : isRed 
          ? 'bg-rose-50/70 border-rose-200 text-rose-950' 
          : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Left: Score and Status badge */}
        <div className="flex items-center gap-3.5">
          
          {/* Circular Score Badge */}
          <div className="relative flex items-center justify-center shrink-0">
            <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center font-black shadow-xs ${
              isZeroed
                ? 'bg-slate-800 text-white'
                : isRed 
                ? 'bg-rose-600 text-white shadow-rose-200' 
                : 'bg-emerald-600 text-white shadow-emerald-200'
            }`}>
              <span className="text-lg leading-tight">{displayScore}</span>
              <span className="text-[9px] font-bold opacity-80">de 100</span>
            </div>
          </div>

          {/* Status info */}
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                isZeroed
                  ? 'bg-slate-200 text-slate-800'
                  : isRed 
                  ? 'bg-rose-200 text-rose-800' 
                  : 'bg-emerald-200/90 text-emerald-800'
              }`}>
                {isZeroed ? (
                  <Sparkles className="w-3 h-3 text-slate-700" />
                ) : isRed ? (
                  <AlertTriangle className="w-3 h-3 text-rose-700" />
                ) : (
                  <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                )}
                {isZeroed ? 'Iniciar' : isRed ? 'Negativo' : 'Positivo'}
              </span>
            </div>

            <p className="text-xs font-semibold text-slate-700">
              {isZeroed
                ? 'Nenhuma despesa ou receita cadastrada ainda'
                : isRed 
                ? `Déficit de ${formatCurrency(Math.abs(balance))} este mês` 
                : `Superávit líquido de +${formatCurrency(balance)} (${savingsRate}% poupado)`}
            </p>
          </div>
        </div>

        {/* Right: Quick action button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onAskAdvice}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all shadow-2xs ${
              isRed 
                ? 'bg-rose-600 hover:bg-rose-700 text-white' 
                : 'bg-emerald-700 hover:bg-emerald-800 text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ver Dicas com IA</span>
          </button>
        </div>

      </div>

      {/* Dica para melhorar (Clean, compact box) */}
      <div className={`mt-3 pt-3 border-t flex items-start gap-2.5 text-xs ${
        isRed 
          ? 'border-rose-200 text-rose-900' 
          : 'border-emerald-200 text-emerald-900'
      }`}>
        <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="font-bold">Como melhorar sua pontuação: </strong> 
          {tipText}
        </p>
      </div>

    </div>
  );
};
