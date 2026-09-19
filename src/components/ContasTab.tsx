import React from 'react';
import { 
  ChevronLeft,
  Plus,
  Repeat,
  FileText
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
  // Contas de Saídas/Gastos (Despesas) - NUNCA inclui receitas
  const expenseAccounts = transactions.filter((t) => t.type === 'expense');

  // Entradas/Receitas
  const incomeAccounts = transactions.filter((t) => t.type === 'income');

  // Dados exclusivos do modo selecionado ('pagar' OU 'receber')
  const isPagar = mode === 'pagar';
  const baseList = isPagar ? expenseAccounts : incomeAccounts;

  // Cálculos do modo ativo
  const pendingItems = baseList.filter((t) => t.isPaid === false);
  const paidItems = baseList.filter((t) => t.isPaid !== false);
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
    const visual = getCategoryVisual(item.category);
    const CategoryIcon = visual.icon;
    const isRecurring = Boolean(item.recurrence || item.isRecurring);
    const dateText = getDisplayDate(item);
    const bankNameClean = (item.bankName || 'nubank').toLowerCase();
    const categoryClean = (item.category || 'outros').toLowerCase();

    return (
      <div
        key={item.id}
        onClick={() => onEditTransaction?.(item)}
        className={`group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all cursor-pointer gap-3 ${
          isConcluded
            ? 'bg-slate-50/60 border-slate-200/70 opacity-60 hover:opacity-90 hover:bg-slate-50'
            : 'bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
        }`}
        title="Clique para editar este gasto"
      >
        {/* Lado Esquerdo: Ícone da Categoria + Descrição como Título (com ícone recorrente) + Subtítulo (categoria - banco) */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Ícone da Categoria */}
          <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border ${visual.bgColor} ${visual.textColor} ${visual.borderColor} shrink-0 shadow-2xs`}>
            <CategoryIcon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.2]" />
          </div>

          <div className="min-w-0 flex-1">
            {/* Título: Descrição completa + Apenas o Ícone de Recorrência (sem a palavra "Recorrente") */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className={`font-extrabold text-sm sm:text-base text-slate-900 break-words leading-snug ${
                isConcluded ? 'line-through text-slate-500' : ''
              }`}>
                {item.description}
              </span>

              {isRecurring && (
                <span 
                  title="Conta Recorrente"
                  className="inline-flex items-center p-0.5 text-indigo-600 shrink-0"
                >
                  <Repeat className="w-3.5 h-3.5 stroke-[2.5]" />
                </span>
              )}
            </div>

            {/* Subtítulo: categoria e banco ex: (alimentação - nubank) */}
            <div className="text-xs text-slate-500 font-medium truncate mt-0.5">
              {categoryClean} - {bankNameClean}
            </div>
          </div>
        </div>

        {/* Lado Direito: No topo a Data ("Hoje" ou "16 de set") e Embaixo da Data o Valor */}
        <div className="flex items-center shrink-0 text-right">
          <div className="flex flex-col items-end">
            {/* Data: "Hoje" ou data como "16 de set" */}
            <span className={`text-[11px] sm:text-xs font-bold ${
              dateText === 'Hoje' ? 'text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200/60' : 'text-slate-400'
            }`}>
              {dateText}
            </span>

            {/* Embaixo da data o valor */}
            <span className={`text-sm sm:text-base font-black tracking-tight whitespace-nowrap mt-0.5 ${
              isConcluded ? 'text-slate-400 line-through' : isPagar ? 'text-rose-700' : 'text-emerald-700'
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
      <div className="relative flex items-center justify-between bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-2xs">
        {/* Lado Esquerdo: Voltar */}
        <div className="flex items-center z-10">
          <button
            type="button"
            onClick={onGoBackToPlanning}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer flex items-center gap-1 font-bold text-xs"
            title="Voltar para a página inicial"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            <span className="hidden sm:inline">Voltar</span>
          </button>
        </div>

        {/* Centro: Título centralizado sem bolinha e sem subtítulo */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none px-16">
          <h2 className="text-base sm:text-lg font-black text-slate-900 text-center tracking-tight pointer-events-auto">
            Transações do mês
          </h2>
        </div>

        {/* Lado Direito: Relatório PDF + Adicionar */}
        <div className="flex items-center gap-2 z-10">
          {onOpenMonthlyPdfReport && (
            <button
              type="button"
              onClick={onOpenMonthlyPdfReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 border border-slate-200/80 shadow-2xs cursor-pointer active:scale-95 transition-all"
              title="Gerar e enviar relatório do mês via PDF"
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline">Relatório PDF</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenNewTransaction(isPagar ? 'expense' : 'income')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer active:scale-95 transition-all ${
              isPagar
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span className="hidden sm:inline">Adicionar {isPagar ? 'Gasto' : 'Receita'}</span>
          </button>
        </div>
      </div>

      {/* Card de Resumo do Sub-Total */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs">
        <div>
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
            {isPagar ? 'Total a Pagar (Pendente)' : 'Total a Receber (Pendente)'}
          </span>
          <span className={`text-2xl sm:text-3xl font-black tracking-tight ${
            isPagar ? 'text-rose-600' : 'text-emerald-600'
          }`}>
            {formatCurrency(totalPending)}
          </span>
          <p className="text-xs text-slate-400 mt-0.5">
            Total geral do mês ({currentMonthName}): {formatCurrency(totalAll)}
          </p>
        </div>
      </div>

      {/* Lista de Contas */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-4">
        {baseList.length === 0 ? (
          <div className="text-center py-10 px-4 bg-slate-50/70 border border-dashed border-slate-200 rounded-2xl">
            <p className="text-sm font-semibold text-slate-600">
              {isPagar 
                ? 'Nenhuma despesa registrada neste mês.' 
                : 'Nenhuma receita registrada neste mês.'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Clique em &quot;Adicionar {isPagar ? 'Gasto' : 'Receita'}&quot; para criar o primeiro registro.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Seção 1: Contas a Pagar / Pendentes */}
            <div className="space-y-2.5">
              {paidItems.length > 0 && (
                <div className="flex items-center gap-2 pb-1">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-600">
                    {isPagar ? 'Contas a Pagar' : 'Contas a Receber'} ({pendingItems.length})
                  </span>
                </div>
              )}

              {pendingItems.length === 0 ? (
                <div className="py-4 text-center text-xs text-slate-400 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  Tudo pago e em dia por aqui!
                </div>
              ) : (
                pendingItems.map((item) => renderTransactionRow(item, false))
              )}
            </div>

            {/* Seção 2: Contas Pagas / Recebidas embaixo das contas a pagar */}
            {paidItems.length > 0 && (
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2 pt-2 pb-1 border-t border-slate-100">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-500">
                    {isPagar ? 'Pagas' : 'Recebidas'} ({paidItems.length})
                  </span>
                  <div className="flex-1 h-px bg-slate-200/70 ml-1" />
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
