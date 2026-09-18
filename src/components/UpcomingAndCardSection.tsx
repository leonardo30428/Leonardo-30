import React, { useState } from 'react';
import { 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldCheck, 
  ChevronRight, 
  AlertCircle,
  TrendingUp,
  Link,
  DollarSign
} from 'lucide-react';
import { BillReminder, BankAccount, Transaction } from '../types';
import { formatCurrency, formatDateBR, isTransactionPending } from '../utils/finance';

interface UpcomingAndCardSectionProps {
  bills: BillReminder[];
  onPayBill: (billId: string) => void;
  onOpenNewBill: () => void;
  bankAccounts: BankAccount[];
  onOpenCardConnection: () => void;
  onNavigateToSection?: (section: 'receitas' | 'gastos') => void;
  onOpenNewTransaction: (type?: 'income' | 'expense') => void;
  transactions?: Transaction[];
  onToggleTransactionPaid?: (id: string) => void;
}

export const UpcomingAndCardSection: React.FC<UpcomingAndCardSectionProps> = ({
  bills,
  onPayBill,
  onOpenNewBill,
  bankAccounts,
  onOpenCardConnection,
  onNavigateToSection,
  onOpenNewTransaction,
  transactions = [],
  onToggleTransactionPaid,
}) => {
  // Filter credit card accounts
  const creditCards = bankAccounts.filter((acc) => acc.type === 'credit_card');
  const mainCard = creditCards[0] || {
    id: 'default-card',
    name: 'Cartão Nubank Mastercard Gold',
    institution: 'Nubank',
    type: 'credit_card',
    balance: 500.0,
    availableLimit: 4500.0,
    lastSync: 'Sincronizado via Open Finance',
    color: '#820ad1',
    status: 'connected',
    accountNumber: 'Final 8421',
  };

  // Scheduled / expected incomes (O que vai ser recebido) from real transactions or registered incomes
  const incomeTxs = transactions.filter((t) => t.type === 'income');
  const upcomingIncomes = incomeTxs.map((t) => ({
    id: t.id,
    title: t.description,
    amount: t.amount,
    date: formatDateBR(t.date),
    pending: isTransactionPending(t),
    category: t.category,
    bankName: t.bankName,
  }));

  // Bills to pay (O que vai ser pago)
  const pendingBills = bills.filter((b) => !b.isPaid);
  const paidBills = bills.filter((b) => b.isPaid);

  const totalToPayPending = pendingBills.reduce((acc, b) => acc + b.amount, 0);
  const totalReceivables = upcomingIncomes.reduce((acc, r) => acc + r.amount, 0);

  return (
    <div className="space-y-4">
      
      {/* Section Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
            Compromissos & Faturas do Mês
          </h2>
          <p className="text-xs text-slate-500">
            Acompanhe o que vai ser pago, o que vai ser recebido e a fatura do seu cartão
          </p>
        </div>

        <button
          onClick={onOpenCardConnection}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-colors shadow-2xs"
        >
          <Link className="w-3.5 h-3.5" />
          <span>Conectar Fatura do Cartão</span>
        </button>
      </div>

      {/* 3 Main Columns / Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* ========================================================================= */}
        {/* CARD 1: O QUE VAI SER PAGO                                                */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <ArrowDownRight className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    O que vai ser pago
                  </h3>
                  <span className="text-[11px] text-slate-400">Contas e boletos do mês</span>
                </div>
              </div>

              <button
                onClick={onOpenNewBill}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                title="Adicionar conta a pagar"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Total to pay badge */}
            <div className="bg-rose-50/70 border border-rose-200/70 rounded-2xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-rose-800">
                  Total Pendente
                </span>
                <div className="text-lg sm:text-xl font-black text-rose-950">
                  {formatCurrency(totalToPayPending)}
                </div>
              </div>
              <span className="text-xs font-bold text-rose-700 bg-white/80 px-2 py-0.5 rounded-md border border-rose-200">
                {pendingBills.length} pendentes
              </span>
            </div>

            {/* List of items to pay */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {bills.map((bill) => (
                <div
                  key={bill.id}
                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 text-xs ${
                    bill.isPaid
                      ? 'bg-slate-50/70 border-slate-200 text-slate-500 line-through opacity-70'
                      : 'bg-white border-slate-200/90 hover:border-slate-300'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="font-bold text-slate-900 truncate">
                      {bill.title}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>Vencimento: {bill.dueDate.split('-').reverse().slice(0, 2).join('/')}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-black text-slate-900">
                      {formatCurrency(bill.amount)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onPayBill(bill.id)}
                      className={`p-1.5 rounded-lg border transition-all ${
                        bill.isPaid
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : 'bg-slate-100 hover:bg-emerald-600 hover:text-white text-slate-600 border-slate-200'
                      }`}
                      title={bill.isPaid ? 'Marcado como pago' : 'Marcar como pago'}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

          </div>

          <button
            onClick={() => onNavigateToSection?.('gastos')}
            className="mt-3 pt-3 border-t border-slate-100 text-xs font-bold text-slate-600 hover:text-rose-700 flex items-center justify-between transition-colors"
          >
            <span>Ver todas as despesas</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* CARD 2: O QUE VAI SER RECEBIDO                                            */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    O que vai ser recebido
                  </h3>
                  <span className="text-[11px] text-slate-400">Receitas previstas do mês</span>
                </div>
              </div>

              <button
                onClick={() => onOpenNewTransaction('income')}
                className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                title="Adicionar receita prevista"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Total to receive badge */}
            <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-2xl p-3 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-extrabold text-emerald-800">
                  Total Previsto
                </span>
                <div className="text-lg sm:text-xl font-black text-emerald-950">
                  {formatCurrency(totalReceivables)}
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-white/80 px-2 py-0.5 rounded-md border border-emerald-200">
                100% mapeado
              </span>
            </div>

            {/* List of items to receive */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {upcomingIncomes.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Nenhuma entrada registrada.
                </div>
              ) : (
                upcomingIncomes.map((inc) => (
                  <div
                    key={inc.id}
                    className="p-2.5 rounded-xl border border-slate-200/80 bg-white hover:border-slate-300 transition-all flex items-center justify-between gap-2 text-xs"
                  >
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">
                        {inc.title}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                        <span>Data: {inc.date}</span>
                        {inc.bankName && (
                          <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-semibold truncate max-w-[90px]">
                            {inc.bankName}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right shrink-0 flex flex-col items-end gap-1">
                      <span className="font-black text-emerald-700 block">
                        +{formatCurrency(inc.amount)}
                      </span>
                      <button
                        type="button"
                        onClick={() => onToggleTransactionPaid?.(inc.id)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 transition-all ${
                          inc.pending
                            ? 'text-amber-800 bg-amber-100 border border-amber-300'
                            : 'text-emerald-800 bg-emerald-100 border border-emerald-200'
                        }`}
                        title={
                          inc.pending
                            ? 'Pendente - clique para marcar como recebido'
                            : 'Recebido - clique para marcar como pendente'
                        }
                      >
                        {inc.pending ? (
                          <>
                            <Clock className="w-2.5 h-2.5 text-amber-600" />
                            Pendente
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                            Recebido
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

          </div>

          <button
            onClick={() => onNavigateToSection?.('receitas')}
            className="mt-3 pt-3 border-t border-slate-100 text-xs font-bold text-slate-600 hover:text-emerald-700 flex items-center justify-between transition-colors"
          >
            <span>Ver detalhes de receitas</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* CARD 3: MINHA FATURA DO CARTÃO & CONEXÃO                                  */}
        {/* ========================================================================= */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div 
                  className="w-8 h-8 rounded-xl text-white flex items-center justify-center font-bold"
                  style={{ backgroundColor: mainCard.color || '#820ad1' }}
                >
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">
                    Minha fatura do cartão
                  </h3>
                  <span className="text-[11px] text-slate-400">{mainCard.institution} • {mainCard.accountNumber || 'Mastercard'}</span>
                </div>
              </div>

              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Conectado
              </span>
            </div>

            {/* Credit Card Visual Replica */}
            <div 
              className="rounded-2xl p-4 text-white shadow-sm relative overflow-hidden flex flex-col justify-between h-36"
              style={{ background: `linear-gradient(135deg, ${mainCard.color || '#820ad1'}, #2e1065)` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold tracking-widest opacity-90">
                  {mainCard.institution}
                </span>
                <CreditCard className="w-5 h-5 opacity-80" />
              </div>

              <div>
                <span className="text-[10px] font-bold tracking-wider opacity-75">
                  Fatura Atual
                </span>
                <div className="text-2xl font-black tracking-tight">
                  {formatCurrency(mainCard.balance)}
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] opacity-90">
                <span>Vencimento: 20/09</span>
                <span>Limite disp.: {formatCurrency(mainCard.availableLimit || 4500)}</span>
              </div>
            </div>

            {/* Progress bar of limit usage */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px] text-slate-600 font-bold">
                <span>Uso do limite</span>
                <span>10% utilizado</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '10%' }} />
              </div>
            </div>

          </div>

          {/* Connection Callout: "a conexão tem como fazer conexão com a fatura do meu cartão?" */}
          <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
            <button
              id="btn-card-connection-card-widget"
              onClick={onOpenCardConnection}
              className="w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Conectar Outro Cartão / Atualizar Fatura</span>
            </button>
            <p className="text-[10px] text-slate-400 text-center">
              Sincronização via Open Finance, leitor de fatura PDF ou foto com IA
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
