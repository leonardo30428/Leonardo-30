import React from 'react';
import { 
  ArrowDown,
  ArrowUp, 
  CreditCard,
  ChevronRight,
  Receipt
} from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency, isTransactionPending } from '../utils/finance';
import { getCategoryVisual, formatShortDateWithMonth } from '../utils/categoryIcons';

interface ContasSectionProps {
  transactions: Transaction[];
  onSelectTab: (type: 'pagar' | 'receber') => void;
  onSelectFatura: () => void;
  invoiceAmount?: number;
  onEditTransaction?: (transaction: Transaction) => void;
}

export const ContasSection: React.FC<ContasSectionProps> = ({
  transactions,
  onSelectTab,
  onSelectFatura,
  invoiceAmount = 0,
  onEditTransaction,
}) => {
  // Contas de Saídas/Gastos (Despesas e Investimentos)
  const expenseAccounts = transactions.filter((t) => t.type === 'expense' || t.type === 'investment');

  // Entradas/Receitas
  const incomeAccounts = transactions.filter((t) => t.type === 'income');

  // Cálculos para o cartão "Pagar"
  const pendingExpenses = expenseAccounts.filter((t) => t.isPaid === false);
  const totalToPay = pendingExpenses.reduce((sum, t) => sum + t.amount, 0);
  const countToPay = pendingExpenses.length;

  // Cálculos para o cartão "Receber" - apenas o valor que ainda vai receber (sem contar com valores já recebidos)
  const pendingIncomes = incomeAccounts.filter((t) => t.isPaid === false);
  const totalToReceive = pendingIncomes.reduce((sum, t) => sum + t.amount, 0);
  const countToReceive = pendingIncomes.length;

  // Saídas recentes: somente as que foram pagas (isPaid !== false e não pendentes)
  const paidExpenses = expenseAccounts.filter((t) => !isTransactionPending(t) && t.isPaid !== false);
  const recentExpenses = [...paidExpenses]
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 4);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-4 sm:p-5 transition-colors">
      
      {/* 3 Cartões Clicáveis Lado a Lado: "Pagar", "Receber" e "Faturas" - Sem fundo colorido, sem quadrado no ícone, apenas linha separadora */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
        
        {/* 1. Cartão Clicável: PAGAR (Seta para baixo direta, sem quadrado, fundo neutro) */}
        <button
          type="button"
          id="card-filtro-pagar"
          onClick={() => onSelectTab('pagar')}
          className="flex flex-col items-start p-2 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs text-left transition-all cursor-pointer relative group min-w-0"
          title="Ver contas a pagar em aba dedicada"
        >
          {/* Topo do card: Ícone direto de seta para baixo + Título */}
          <div className="flex items-center justify-between w-full mb-0.5 sm:mb-1">
            <div className="flex items-center gap-1 sm:gap-2 min-w-0">
              <ArrowDown className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-rose-600 dark:text-rose-400 stroke-[2.5] shrink-0" />
              <span className="text-[11px] sm:text-sm font-bold text-slate-700 dark:text-slate-300 truncate">
                Pagar
              </span>
            </div>
            <ChevronRight className="hidden sm:block w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-rose-600 dark:group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>

          <span className="text-xs sm:text-lg font-black text-slate-900 dark:text-white tracking-tight mt-0.5 sm:mt-1 truncate w-full">
            {formatCurrency(totalToPay)}
          </span>

          <div className="flex items-center gap-1 mt-0.5 sm:mt-1 text-[9px] sm:text-[11px] font-semibold text-rose-600 dark:text-rose-400 w-full">
            <span className="truncate">{countToPay > 0 ? `${countToPay} pend.` : 'Em dia'}</span>
          </div>
        </button>

        {/* 2. Cartão Clicável: RECEBER (Seta para cima direta, sem quadrado, fundo neutro) */}
        <button
          type="button"
          id="card-filtro-receber"
          onClick={() => onSelectTab('receber')}
          className="flex flex-col items-start p-2 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs text-left transition-all cursor-pointer relative group min-w-0"
          title="Ver contas a receber em aba dedicada"
        >
          {/* Topo do card: Ícone direto de seta para cima + Título */}
          <div className="flex items-center justify-between w-full mb-0.5 sm:mb-1">
            <div className="flex items-center gap-1 sm:gap-2 min-w-0">
              <ArrowUp className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-emerald-600 dark:text-emerald-400 stroke-[2.5] shrink-0" />
              <span className="text-[11px] sm:text-sm font-bold text-slate-700 dark:text-slate-300 truncate">
                Receber
              </span>
            </div>
            <ChevronRight className="hidden sm:block w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>

          <span className="text-xs sm:text-lg font-black text-slate-900 dark:text-white tracking-tight mt-0.5 sm:mt-1 truncate w-full">
            {formatCurrency(totalToReceive)}
          </span>

          <div className="flex items-center gap-1 mt-0.5 sm:mt-1 text-[9px] sm:text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 w-full">
            <span className="truncate">{countToReceive > 0 ? `${countToReceive} a rec.` : 'Recebido'}</span>
          </div>
        </button>

        {/* 3. Cartão Clicável: FATURAS (Ícone de cartão direto, sem quadrado, fundo neutro) */}
        <button
          type="button"
          id="card-filtro-faturas"
          onClick={onSelectFatura}
          className="flex flex-col items-start p-2 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 hover:bg-slate-100/70 dark:hover:bg-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs text-left transition-all cursor-pointer relative group min-w-0"
          title="Abrir aba de Cartões e Faturas"
        >
          {/* Topo do card: Ícone direto de cartão + Título */}
          <div className="flex items-center justify-between w-full mb-0.5 sm:mb-1">
            <div className="flex items-center gap-1 sm:gap-2 min-w-0">
              <CreditCard className="w-3.5 h-3.5 sm:w-4.5 sm:h-4.5 text-indigo-600 dark:text-indigo-400 stroke-[2.2] shrink-0" />
              <span className="text-[11px] sm:text-sm font-bold text-slate-700 dark:text-slate-300 truncate">
                Faturas
              </span>
            </div>
            <ChevronRight className="hidden sm:block w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>

          <span className="text-xs sm:text-lg font-black text-slate-900 dark:text-white tracking-tight mt-0.5 sm:mt-1 truncate w-full">
            {formatCurrency(invoiceAmount)}
          </span>

          <div className="flex items-center gap-1 mt-0.5 sm:mt-1 text-[9px] sm:text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 w-full">
            <span className="truncate">{invoiceAmount > 0 ? 'Fatura aberta' : 'Em dia'}</span>
          </div>
        </button>

      </div>

      {/* Seção "Saídas recentes" abaixo dos dois cartões pagar e receber */}
      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center justify-between mb-2.5 px-0.5">
          <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
            <Receipt className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Saídas recentes</span>
          </h3>
          {paidExpenses.length > 0 && (
            <button
              type="button"
              onClick={() => onSelectTab('pagar')}
              className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:underline transition-all cursor-pointer"
            >
              Ver todas ({paidExpenses.length})
            </button>
          )}
        </div>

        {recentExpenses.length === 0 ? (
          <div className="py-4 px-3 text-center bg-slate-50/70 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Nenhuma saída paga registrada neste mês.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentExpenses.map((expense) => {
              const isInv = expense.type === 'investment';
              const visual = getCategoryVisual(expense.category);
              const CategoryIcon = visual.icon;
              const formattedDate = formatShortDateWithMonth(expense.date);
              const bankNameClean = (expense.bankName || 'Nubank').toLowerCase();

              return (
                <div
                  key={expense.id}
                  onClick={() => onEditTransaction?.(expense)}
                  className="flex items-center justify-between p-2.5 sm:p-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 hover:bg-slate-100/70 dark:hover:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer group"
                  title="Clique para editar este lançamento"
                >
                  {/* Esquerda: Ícone da Categoria + Categoria como Título + Data e Banco como Subtítulo */}
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div className={`w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-xl flex items-center justify-center border ${visual.bgColor} ${visual.textColor} ${visual.borderColor} shrink-0 shadow-2xs`}>
                      <CategoryIcon className="w-4 h-4 stroke-[2.2]" />
                    </div>

                    <div className="min-w-0 flex-1">
                      {/* Categoria em cima */}
                      <div className="flex items-center gap-1.5">
                        <span className="font-extrabold text-xs sm:text-[13px] text-slate-900 dark:text-white group-hover:text-rose-700 dark:group-hover:text-rose-400 transition-colors block leading-tight truncate">
                          {expense.category || (isInv ? 'Investimento' : 'Outros')}
                        </span>
                      </div>
                      {/* Data e banco em baixo da categoria */}
                      <span className="text-[10.5px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium block mt-0.5 truncate">
                        {formattedDate} - {bankNameClean}
                      </span>
                    </div>
                  </div>

                  {/* Direita: Valor */}
                  <div className="text-right shrink-0 pl-2">
                    <span className="font-black text-xs sm:text-sm text-slate-900 dark:text-white tracking-tight">
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
