import React from 'react';
import { 
  ChevronLeft,
  Plus
} from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency, getTodayDateString } from '../utils/finance';
import { getCategoryVisual, formatShortDateWithMonth } from '../utils/categoryIcons';

interface ContasTabProps {
  transactions: Transaction[];
  currentMonthName: string;
  mode: 'pagar' | 'receber';
  onTogglePaid?: (id: string) => void;
  onGoBackToPlanning: () => void;
  onOpenNewTransaction: (type: 'income' | 'expense') => void;
  onEditTransaction?: (transaction: Transaction) => void;
  onOpenMonthlyPdfReport?: () => void;
}

export const ContasTab: React.FC<ContasTabProps> = ({
  transactions,
  currentMonthName,
  mode,
  onGoBackToPlanning,
  onOpenNewTransaction,
  onEditTransaction,
  onOpenMonthlyPdfReport,
}) => {
  // Contas de Saídas/Gastos (Despesas e Investimentos) - NUNCA inclui receitas
  const expenseAccounts = transactions.filter((t) => t.type === 'expense' || t.type === 'investment');

  // Entradas/Receitas
  const incomeAccounts = transactions.filter((t) => t.type === 'income');

  // Dados exclusivos do modo selecionado ('pagar' OU 'receber')
  const isPagar = mode === 'pagar';
  const baseList = isPagar ? expenseAccounts : incomeAccounts;

  // Cálculos do modo ativo - organizados pelos dias de pagamento
  const sortByPaymentDay = (a: Transaction, b: Transaction) => (a.date || '').localeCompare(b.date || '');
  const pendingItems = [...baseList.filter((t) => t.isPaid === false)].sort(sortByPaymentDay);
  const paidItems = [...baseList.filter((t) => t.isPaid !== false)].sort(sortByPaymentDay);
  const totalPending = pendingItems.reduce((sum, t) => sum + t.amount, 0);
  const totalAll = baseList.reduce((sum, t) => sum + t.amount, 0);

  // Helper para formatar data: "Hoje" se for hoje/paga hoje, senão "16 de set"
  const getDisplayDate = (item: Transaction) => {
    const today = getTodayDateString();
    const isToday = item.date === today;
    return formatShortDateWithMonth(item.date, isToday);
  };

  // Renderizador de um item da lista
  const renderTransactionRow = (item: Transaction, isConcluded: boolean) => {
    const isInv = item.type === 'investment';
    const visual = getCategoryVisual(item.category);
    const CategoryIcon = visual.icon;
    const dateText = getDisplayDate(item);
    const bankNameClean = (item.bankName || 'nubank').toLowerCase();
    const categoryClean = (item.category || (isInv ? 'investimento' : 'outros')).toLowerCase();

    return (
      <div
        key={item.id}
        onClick={() => onEditTransaction?.(item)}
        className={`group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer gap-3 ${
          isConcluded
            ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800 opacity-60 hover:opacity-90 hover:bg-slate-50 dark:hover:bg-slate-800/60'
            : 'bg-white dark:bg-slate-900 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
        }`}
        title="Clique para editar este lançamento"
      >
        {/* Lado Esquerdo: Ícone da Categoria + Descrição como Título + Subtítulo (categoria - banco) */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Ícone da Categoria */}
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border ${visual.bgColor} ${visual.textColor} ${visual.borderColor} shrink-0 shadow-2xs`}>
            <CategoryIcon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
          </div>

          <div className="min-w-0 flex-1">
            {/* Título: Descrição completa */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`font-extrabold text-sm sm:text-base text-slate-900 dark:text-white break-words leading-snug ${
                isConcluded ? 'line-through text-slate-400 dark:text-slate-500' : ''
              }`}>
                {item.description}
              </span>
            </div>

            {/* Subtítulo: categoria e banco ex: (alimentação - nubank) */}
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate mt-0.5">
              {categoryClean} - {bankNameClean}
            </div>
          </div>
        </div>

        {/* Lado Direito: No topo a Data ("Hoje" ou "16 de set") e Embaixo da Data o Valor */}
        <div className="flex items-center shrink-0 text-right">
          <div className="flex flex-col items-end">
            {/* Data: "Hoje" ou data como "16 de set" - mesma cor das datas */}
            <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-slate-400">
              {dateText}
            </span>

            {/* Embaixo da data o valor */}
            <span className={`text-sm sm:text-base font-black tracking-tight whitespace-nowrap mt-0.5 ${
              isConcluded ? 'text-slate-400 dark:text-slate-500 line-through' : isPagar ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400'
            }`}>
              {formatCurrency(item.amount)}
            </span>
          </div>
        </div>

      </div>
    );
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Top Header com Botão Voltar à esquerda, Título centralizado e Botão Adicionar à direita */}
      <div className="relative flex items-center justify-between bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xs transition-colors">
        {/* Lado Esquerdo: Voltar */}
        <div className="flex items-center z-10">
          <button
            type="button"
            onClick={onGoBackToPlanning}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer flex items-center gap-1 font-bold text-xs"
            title="Voltar para a página inicial"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            <span className="hidden sm:inline">Voltar</span>
          </button>
        </div>

        {/* Centro: Título centralizado sem bolinha e sem subtítulo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-16">
          <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white text-center tracking-tight pointer-events-auto">
            Transações do mês
          </h2>
        </div>

        {/* Lado Direito: Apenas Adicionar (sem botão PDF em transações do mês) */}
        <div className="flex items-center gap-2 z-10">
          <button
            type="button"
            onClick={() => onOpenNewTransaction(isPagar ? 'expense' : 'income')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer transition-colors ${
              isPagar
                ? 'bg-rose-600 hover:bg-rose-700 dark:bg-rose-600 dark:hover:bg-rose-500'
                : 'bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500'
            }`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Adicionar {isPagar ? 'Saída' : 'Entrada'}</span>
          </button>
        </div>
      </div>

      {/* Card de Resumo do Sub-Total */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors">
        <div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            {isPagar ? 'Total a Pagar (Pendente)' : 'Total a Receber'}
          </span>
          <span className={`text-2xl sm:text-3xl font-black tracking-tight ${
            isPagar ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
          }`}>
            {formatCurrency(totalPending)}
          </span>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
            {isPagar 
              ? `Total geral do mês (${currentMonthName}): ${formatCurrency(totalAll)}`
              : `Total já recebido no mês: ${formatCurrency(paidItems.reduce((sum, t) => sum + t.amount, 0))}`}
          </p>
        </div>
      </div>

      {/* Lista de Contas */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs p-5 sm:p-6 space-y-4 transition-colors">
        {baseList.length === 0 ? (
          <div className="text-center py-10 px-4 bg-slate-50/70 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              {isPagar 
                ? 'Nenhuma saída registrada neste mês.' 
                : 'Nenhuma entrada registrada neste mês.'}
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Clique em &quot;Adicionar {isPagar ? 'Saída' : 'Entrada'}&quot; para criar o primeiro registro.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Seção 1: Contas a Pagar / Pendentes */}
            <div className="space-y-2.5">
              {paidItems.length > 0 && (
                <div className="flex items-center gap-2 pb-1">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-600 dark:text-slate-300">
                    {isPagar ? 'Contas a Pagar' : 'Valores a Receber'} ({pendingItems.length})
                  </span>
                </div>
              )}

              {pendingItems.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400 dark:text-slate-500 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                  {isPagar ? 'Tudo pago e em dia por aqui!' : 'Tudo recebido e em dia por aqui! Nenhum valor pendente.'}
                </div>
              ) : (
                pendingItems.map((item) => renderTransactionRow(item, false))
              )}
            </div>

            {/* Seção 2: Contas Pagas / Recebidas embaixo das contas a pagar */}
            {paidItems.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2 pt-2 pb-1 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {isPagar ? 'Pagas / Concluídas' : 'Recebidas'} ({paidItems.length})
                  </span>
                  <div className="flex-1 h-px bg-slate-200/70 dark:bg-slate-800 ml-1" />
                </div>

                {paidItems.map((item) => renderTransactionRow(item, true))}
              </div>
            )}

          </div>
        )}
      </div>

    </div>
  );
};
