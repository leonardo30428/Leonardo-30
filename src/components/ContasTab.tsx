import React, { useState } from 'react';
import { 
  Clock, 
  Building2, 
  Calendar, 
  CheckCircle2, 
  Repeat, 
  ChevronLeft,
  Plus,
  Check
} from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency, formatDateBR } from '../utils/finance';

interface ContasTabProps {
  transactions: Transaction[];
  currentMonthName: string;
  mode: 'pagar' | 'receber';
  onTogglePaid: (id: string) => void;
  onGoBackToPlanning: () => void;
  onOpenNewTransaction: (type: 'income' | 'expense') => void;
}

export const ContasTab: React.FC<ContasTabProps> = ({
  transactions,
  currentMonthName,
  mode,
  onTogglePaid,
  onGoBackToPlanning,
  onOpenNewTransaction,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('all');

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

  // Filtragem por status (Todas, Pendentes/Previstas, Pagas/Recebidas)
  const currentList = baseList.filter((item) => {
    if (statusFilter === 'pending') return item.isPaid === false;
    if (statusFilter === 'paid') return item.isPaid !== false;
    return true;
  });

  // Helper visual para símbolo e estilo de banco brasileiro
  const getBankStyle = (bankName?: string) => {
    const b = (bankName || '').toLowerCase();
    if (b.includes('nu') || b.includes('rox')) {
      return { bg: 'bg-purple-50 text-purple-800 border-purple-200/80', dot: 'bg-purple-600' };
    }
    if (b.includes('ita') || b.includes('itau')) {
      return { bg: 'bg-orange-50 text-orange-800 border-orange-200/80', dot: 'bg-orange-600' };
    }
    if (b.includes('inter')) {
      return { bg: 'bg-amber-50 text-amber-900 border-amber-200/80', dot: 'bg-amber-500' };
    }
    if (b.includes('brad')) {
      return { bg: 'bg-red-50 text-red-800 border-red-200/80', dot: 'bg-red-600' };
    }
    if (b.includes('sant')) {
      return { bg: 'bg-rose-50 text-rose-800 border-rose-200/80', dot: 'bg-rose-600' };
    }
    if (b.includes('brasil') || b.includes('bb')) {
      return { bg: 'bg-yellow-50 text-yellow-900 border-yellow-200/80', dot: 'bg-yellow-500' };
    }
    if (b.includes('caixa')) {
      return { bg: 'bg-blue-50 text-blue-800 border-blue-200/80', dot: 'bg-blue-600' };
    }
    if (b.includes('c6')) {
      return { bg: 'bg-slate-100 text-slate-900 border-slate-300', dot: 'bg-slate-800' };
    }
    return { bg: 'bg-slate-50 text-slate-700 border-slate-200', dot: 'bg-slate-500' };
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

        {/* Lado Direito: Adicionar */}
        <div className="flex items-center z-10">
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
            <span className="hidden sm:inline">Adicionar {isPagar ? 'Conta' : 'Receita'}</span>
          </button>
        </div>
      </div>

      {/* Card de Resumo do Sub-Total */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3">
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
            Total geral do mês: {formatCurrency(totalAll)}
          </p>
        </div>

        {/* Filtro por status das contas exibidas: Todas, Pendentes/Previstas, Pagas/Concluídas */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas ({baseList.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('pending')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              statusFilter === 'pending'
                ? isPagar ? 'bg-rose-50 text-rose-700 shadow-2xs font-black' : 'bg-emerald-50 text-emerald-700 shadow-2xs font-black'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isPagar ? 'A Pagar' : 'A Receber'} ({pendingItems.length})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('paid')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              statusFilter === 'paid' 
                ? isPagar 
                  ? 'bg-slate-800 text-white shadow-2xs font-black' 
                  : 'bg-emerald-50 text-emerald-800 shadow-2xs font-black' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {isPagar ? 'Pagas' : 'Recebidas'} ({paidItems.length})
          </button>
        </div>
      </div>

      {/* Lista de Contas (Exclusiva do que foi selecionado) */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-3">
        {currentList.length === 0 ? (
          <div className="text-center py-10 px-4 bg-slate-50/70 border border-dashed border-slate-200 rounded-2xl">
            <p className="text-sm font-semibold text-slate-600">
              {isPagar 
                ? 'Nenhuma conta a pagar encontrada.' 
                : 'Nenhuma receita a receber encontrada.'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {isPagar
                ? 'Não há débitos pendentes com o filtro selecionado.'
                : 'Não há entradas pendentes com o filtro selecionado.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {currentList.map((item) => {
              const isPending = item.isPaid === false;
              const bankStyle = getBankStyle(item.bankName);
              const isRecurring = Boolean(item.recurrence || item.isRecurring);

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border border-slate-200/90 hover:border-slate-300 bg-white hover:bg-slate-50/40 transition-all gap-3"
                >
                  {/* Lado Esquerdo: Nome da conta e símbolo do banco em baixo com data */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm sm:text-base text-slate-900 truncate">
                        {item.description}
                      </span>

                      {isRecurring && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/70 shrink-0">
                          <Repeat className="w-2.5 h-2.5" />
                          Recorrente
                        </span>
                      )}
                    </div>

                    {/* Embaixo: Símbolo do banco e data de vencimento */}
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      {/* Símbolo do Banco */}
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-bold border ${bankStyle.bg}`}>
                        <span className={`w-2 h-2 rounded-full ${bankStyle.dot}`} />
                        <Building2 className="w-3 h-3 opacity-70 shrink-0" />
                        <span className="truncate max-w-[120px]">{item.bankName || 'Conta'}</span>
                      </div>

                      <span className="text-slate-300">•</span>

                      {/* Data / Vencimento */}
                      <span className="flex items-center gap-1 text-[11.5px] font-medium text-slate-500">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {formatDateBR(item.date)}
                      </span>
                    </div>
                  </div>

                  {/* Lado Direito: Status "Previsto" / "Pago" e Valor no canto direito */}
                  <div className="flex items-center gap-3 shrink-0">
                    {/* Tag / Botão Previsto / Pago */}
                    <button
                      type="button"
                      onClick={() => onTogglePaid(item.id)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border ${
                        isPending
                          ? 'bg-amber-50 text-amber-900 border-amber-200/90 hover:bg-amber-100'
                          : isPagar
                          ? 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                          : 'bg-emerald-50 text-emerald-900 border-emerald-200/90 hover:bg-emerald-100'
                      }`}
                      title={isPending ? 'Clique para marcar como concluído' : 'Clique para marcar como pendente'}
                    >
                      {isPending ? (
                        <>
                          <Clock className="w-3 h-3 text-amber-600" />
                          <span>Previsto</span>
                        </>
                      ) : (
                        <>
                          <Check className={`w-3 h-3 ${isPagar ? 'text-slate-700 stroke-[3]' : 'text-emerald-600'}`} />
                          <span>{isPagar ? 'Pago' : 'Recebido'}</span>
                        </>
                      )}
                    </button>

                    {/* Valor no canto direito */}
                    <span className="text-base sm:text-lg font-black text-slate-900 tracking-tight whitespace-nowrap min-w-[80px] text-right">
                      {formatCurrency(item.amount)}
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
