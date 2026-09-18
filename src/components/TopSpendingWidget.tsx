import React from 'react';
import { ShoppingBag, AlertCircle, TrendingUp, Lightbulb, Sparkles } from 'lucide-react';
import { Transaction, MonthlySummary } from '../types';
import { formatCurrency } from '../utils/finance';

interface TopSpendingWidgetProps {
  summary: MonthlySummary;
  transactions: Transaction[];
  onAskAiForHabits: () => void;
}

export const TopSpendingWidget: React.FC<TopSpendingWidgetProps> = ({
  summary,
  transactions,
  onAskAiForHabits,
}) => {
  const { topExpenseCategory, isRed, totalExpense } = summary;

  // Filter top transactions inside the highest spending category or highest overall
  const topTransactions = transactions
    .filter((tx) => tx.type === 'expense')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 3);

  return (
    <div 
      id="top-spending-widget"
      className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                O Que Você Mais Gastou
              </h4>
              <p className="text-[11px] text-slate-500">Monitor de Hábitos de Consumo</p>
            </div>
          </div>

          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            isRed ? 'bg-rose-100 text-rose-800' : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}>
            {topExpenseCategory.percentage}% dos gastos
          </span>
        </div>

        {/* Main Category Focus */}
        <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200/70">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-600">Categoria com Maior Impacto:</span>
            <span className="text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
              {topExpenseCategory.category}
            </span>
          </div>

          <div className="mt-2 flex items-baseline justify-between">
            <span className="text-xl font-extrabold text-slate-900">
              {formatCurrency(topExpenseCategory.amount)}
            </span>
            <span className="text-xs font-semibold text-rose-600">
              {topExpenseCategory.percentage}% do total gasto
            </span>
          </div>

          {/* Warning notice */}
          <div className="mt-3 flex items-start gap-2 text-xs text-amber-900 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200/60">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>Lembrete de Equilíbrio:</strong> Para garantir que o orçamento mensal feche no positivo,
              avalie cortes ou limites semanais nesta categoria. Pequenos ajustes de hábito geram grande alívio.
            </p>
          </div>
        </div>

        {/* Top 3 biggest individual expenses */}
        <div className="mt-4">
          <span className="text-xs font-bold tracking-wider text-slate-500">
            Maiores Despesas Individuais:
          </span>
          <div className="mt-2 space-y-2">
            {topTransactions.map((tx, idx) => (
              <div 
                key={tx.id}
                className="flex items-center justify-between p-2.5 rounded-lg bg-white hover:bg-slate-50 border border-slate-100 transition-colors text-xs"
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span className="w-4.5 h-4.5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-500">
                    {idx + 1}
                  </span>
                  <div className="truncate">
                    <p className="font-semibold text-slate-800 truncate">{tx.description}</p>
                    <p className="text-[10px] text-slate-400">{tx.category} • {tx.date}</p>
                  </div>
                </div>
                <span className="font-bold text-rose-600 shrink-0">
                  {formatCurrency(tx.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Action to consult AI for habits */}
      <div className="mt-5 pt-3 border-t border-slate-100">
        <button
          id="btn-adjust-habits-ai"
          onClick={onAskAiForHabits}
          className="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 text-xs font-bold text-violet-800 bg-violet-50 hover:bg-violet-100 rounded-xl border border-violet-200/80 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-violet-600" />
          Como Ajustar Hábitos em {topExpenseCategory.category}?
        </button>
      </div>

    </div>
  );
};
