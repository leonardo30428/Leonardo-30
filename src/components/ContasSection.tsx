import React from 'react';
import { 
  TrendingDown,
  TrendingUp, 
  ChevronRight,
  Receipt
} from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency } from '../utils/finance';
import { getCategoryVisual, formatShortDateWithMonth } from '../utils/categoryIcons';

interface ContasSectionProps {
  transactions: Transaction[];
  onSelectTab: (type: 'pagar' | 'receber') => void;
  onEditTransaction?: (transaction: Transaction) => void;
}

export const ContasSection: React.FC<ContasSectionProps> = ({
  transactions,
  onSelectTab,
  onEditTransaction,
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

  // Despesas recentes ordenadas por data decrescente (as mais recentes primeiro)
  const recentExpenses = [...expenseAccounts]
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 4);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-4 sm:p-5">
      
      {/* 2 Cartões Clicáveis: "Pagar" e "Receber" (Abrem aba dedicada de Contas) */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        
        {/* Cartão Clicável: PAGAR (Compacto) */}
        <button
          type="button"
          id="card-filtro-pagar"
          onClick={() => onSelectTab('pagar')}
          className="flex flex-col items-start p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 bg-rose-50/40 hover:bg-rose-50/90 hover:border-rose-300 hover:shadow-xs text-left transition-colors cursor-pointer relative group"
          title="Ver contas a pagar em aba dedicada"
        >
          {/* Topo do card: Ícone menor + Título */}
          <div className="flex items-center justify-between w-full mb-1">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center shadow-xs shadow-rose-200 shrink-0">
                <TrendingDown className="w-3.5 h-3.5 stroke-[2.5]" />
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
          className="flex flex-col items-start p-3 sm:p-3.5 rounded-2xl border border-slate-200/90 bg-emerald-50/40 hover:bg-emerald-50/90 hover:border-emerald-300 hover:shadow-xs text-left transition-colors cursor-pointer relative group"
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

      {/* Seção "Despesas recentes" abaixo dos dois cartões pagar e receber */}
      <div className="mt-4 pt-3.5 border-t border-slate-100">
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <h3 className="text-xs sm:text-sm font-black text-slate-900 tracking-tight flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-slate-500" />
            <span>Despesas recentes</span>
          </h3>
          {expenseAccounts.length > 0 && (
            <button
              type="button"
              onClick={() => onSelectTab('pagar')}
              className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline transition-all cursor-pointer"
            >
              Ver todas ({expenseAccounts.length})
            </button>
          )}
        </div>

        {recentExpenses.length === 0 ? (
          <div className="py-4 px-3 text-center bg-slate-50/70 border border-dashed border-slate-200 rounded-2xl">
            <p className="text-xs text-slate-500 font-medium">
              Nenhuma despesa recente registrada neste mês.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentExpenses.map((expense) => {
              const visual = getCategoryVisual(expense.category);
              const CategoryIcon = visual.icon;
              const formattedDate = formatShortDateWithMonth(expense.date);
              const bankNameClean = (expense.bankName || 'Nubank').toLowerCase();

              return (
                <div
                  key={expense.id}
                  onClick={() => onEditTransaction?.(expense)}
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border border-slate-100 bg-slate-50/40 hover:bg-slate-100/70 hover:border-slate-300 transition-all cursor-pointer group"
                  title="Clique para editar este gasto"
                >
                  {/* Esquerda: Ícone da Categoria + Categoria como Título + Data e Banco como Subtítulo */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className={`w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-xl flex items-center justify-center border ${visual.bgColor} ${visual.textColor} ${visual.borderColor} shrink-0 shadow-2xs`}>
                      <CategoryIcon className="w-4 h-4 stroke-[2.2]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* Categoria em cima */}
                      <span className="font-extrabold text-xs sm:text-[13px] text-slate-900 group-hover:text-rose-700 transition-colors block leading-tight truncate">
                        {expense.category || 'Outros'}
                      </span>
                      {/* Data e banco em baixo da categoria */}
                      <span className="text-[10.5px] sm:text-[11px] text-slate-500 font-medium block mt-0.5 truncate">
                        {formattedDate} - {bankNameClean}
                      </span>
                    </div>
                  </div>

                  {/* Direita: Valor */}
                  <div className="text-right shrink-0 pl-2">
                    <span className="font-black text-xs sm:text-sm text-slate-900 tracking-tight">
                      {formatCurrency(expense.amount)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
