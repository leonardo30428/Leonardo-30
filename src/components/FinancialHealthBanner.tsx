import React from 'react';
import { AlertTriangle, CheckCircle2, TrendingDown, Sparkles, ArrowRight } from 'lucide-react';
import { MonthlySummary } from '../types';
import { formatCurrency } from '../utils/finance';

interface FinancialHealthBannerProps {
  summary: MonthlySummary;
  onAskAdvice: () => void;
  onViewExpenses: () => void;
}

export const FinancialHealthBanner: React.FC<FinancialHealthBannerProps> = ({
  summary,
  onAskAdvice,
  onViewExpenses,
}) => {
  const { isRed, balance, topExpenseCategory, financialHealthScore, healthStatus } = summary;

  if (isRed) {
    return (
      <div 
        id="financial-health-banner-red"
        className="rounded-2xl bg-rose-50 border-2 border-rose-300 p-5 shadow-sm text-rose-950 transition-all"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-rose-300">
              <AlertTriangle className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-black tracking-wider bg-rose-200/80 text-rose-800 px-2.5 py-0.5 rounded-full">
                  Atenção: Você está no Vermelho
                </span>
                <span className="text-xs font-semibold text-rose-700">
                  Saúde Financeira: {healthStatus} ({financialHealthScore}/100)
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-rose-900 mt-1">
                Gastos ultrapassaram seus ganhos em {formatCurrency(Math.abs(balance))}
              </h2>
              <p className="text-sm text-rose-800/90 mt-1 max-w-2xl">
                Seu maior gasto este mês foi em <strong className="text-rose-950 font-bold">{topExpenseCategory.category}</strong> somando{' '}
                <span className="underline font-bold decoration-rose-400">{formatCurrency(topExpenseCategory.amount)}</span> ({topExpenseCategory.percentage}% do total).
                Ajuste seus hábitos de consumo nessa categoria para restabelecer o equilíbrio do orçamento mensal.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
            <button
              id="banner-view-expenses-btn"
              onClick={onViewExpenses}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-rose-900 bg-white hover:bg-rose-100/70 border border-rose-300 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <TrendingDown className="w-4 h-4 text-rose-600" />
              Revisar Gastos
            </button>
            <button
              id="banner-ask-ai-advice-btn"
              onClick={onAskAdvice}
              className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm shadow-rose-300 transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" />
              Dicas para Sair do Vermelho
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      id="financial-health-banner-healthy"
      className="rounded-2xl bg-emerald-50/70 border border-emerald-200/80 p-5 shadow-xs text-emerald-950 transition-all"
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs shadow-emerald-200">
            <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                Saúde Financeira: {healthStatus} ({financialHealthScore}/100)
              </span>
              <span className="text-xs font-semibold text-emerald-700">
                Orçamento sob controle
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-emerald-950 mt-1">
              Ganhos menos Gastos: Saldo Líquido Positivo de {formatCurrency(balance)}
            </h2>
            <p className="text-sm text-emerald-900/80 mt-1 max-w-2xl">
              Fique atento aos hábitos: você mais gastou com <strong className="text-emerald-950 font-bold">{topExpenseCategory.category}</strong>{' '}
              ({formatCurrency(topExpenseCategory.amount)} • {topExpenseCategory.percentage}% das despesas). Mantenha o foco para continuar poupando e investindo com segurança!
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0">
          <button
            id="banner-healthy-tips-btn"
            onClick={onAskAdvice}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-emerald-900 bg-white hover:bg-emerald-100/70 border border-emerald-300 rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            Dicas Inteligentes de Economia
          </button>
        </div>
      </div>
    </div>
  );
};
