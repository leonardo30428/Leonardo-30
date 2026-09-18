import React, { useState } from 'react';
import { 
  ArrowLeft, 
  CreditCard, 
  Plus, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowUpRight, 
  DollarSign, 
  Sparkles, 
  FileText, 
  Camera, 
  ChevronRight,
  RefreshCw,
  TrendingDown,
  Lock
} from 'lucide-react';
import { BankAccount, Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils/finance';

interface FaturaPageProps {
  cards: BankAccount[];
  transactions: Transaction[];
  onBack: () => void;
  onOpenCardConnection: () => void;
  onOpenNewTransaction: () => void;
  onOpenScanner: () => void;
  onPayInvoice: (cardId: string, amount: number) => void;
  onDeleteTransaction?: (id: string) => void;
}

export const FaturaPage: React.FC<FaturaPageProps> = ({
  cards,
  transactions,
  onBack,
  onOpenCardConnection,
  onOpenNewTransaction,
  onOpenScanner,
  onPayInvoice,
  onDeleteTransaction,
}) => {
  const creditCards = cards.filter((c) => c.type === 'credit_card');
  const [selectedCardId, setSelectedCardId] = useState<string>(
    creditCards[0]?.id || 'card-default'
  );

  const activeCard = creditCards.find((c) => c.id === selectedCardId) || creditCards[0] || {
    id: 'card-default',
    name: 'Cartão de Crédito Principal',
    institution: 'Nubank',
    balance: 0,
    availableLimit: 5000,
    lastSync: 'Aguardando conexão',
    color: '#820ad1',
    status: 'connected',
    accountNumber: 'Final ****',
  };

  // Card expenses from transactions
  const cardExpenses = transactions.filter(
    (t) => t.type === 'expense' && (
      t.bankName?.toLowerCase().includes('cartão') ||
      t.bankName?.toLowerCase().includes('nubank') ||
      t.category === 'Cartão de Crédito' ||
      t.category === 'Compras'
    )
  );

  const totalInvoice = activeCard.balance > 0 ? activeCard.balance : cardExpenses.reduce((acc, t) => acc + t.amount, 0);
  const availableLimit = activeCard.availableLimit !== undefined ? activeCard.availableLimit : 5000 - totalInvoice;
  const totalLimit = totalInvoice + (availableLimit > 0 ? availableLimit : 0);
  const usagePercentage = totalLimit > 0 ? Math.min(100, Math.round((totalInvoice / totalLimit) * 100)) : 0;

  return (
    <div id="fatura-page" className="space-y-6 animate-fadeIn">
      
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao Início</span>
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Fatura do Cartão
            </h1>
            <p className="text-xs text-slate-500">
              Acompanhe lançamentos, fechamento, vencimento e limite
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenCardConnection}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 transition-colors shadow-2xs"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Conectar Cartão (Open Finance)</span>
          </button>

          <button
            onClick={onOpenNewTransaction}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Compra</span>
          </button>
        </div>
      </div>

      {/* Card Selector if user has multiple cards */}
      {creditCards.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {creditCards.map((card) => (
            <button
              key={card.id}
              onClick={() => setSelectedCardId(card.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 shrink-0 ${
                activeCard.id === card.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{card.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Main Invoice Highlights Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visual Credit Card Preview */}
        <div 
          className="rounded-3xl p-6 text-white shadow-md relative overflow-hidden flex flex-col justify-between h-56 lg:h-auto"
          style={{ background: `linear-gradient(135deg, ${activeCard.color || '#820ad1'}, #1e1b4b)` }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-6 h-6 opacity-90" />
              <span className="font-black text-sm tracking-wider">
                {activeCard.institution || 'Cartão de Crédito'}
              </span>
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs">
              {activeCard.status === 'connected' ? 'Open Finance Ativo' : 'Manual'}
            </span>
          </div>

          <div className="my-auto py-2">
            <span className="text-xs font-bold tracking-wider opacity-80 block">
              Fatura Atual
            </span>
            <div className="text-3xl sm:text-4xl font-black tracking-tight">
              {formatCurrency(totalInvoice)}
            </div>
            <span className="text-[11px] opacity-80 mt-0.5 block">
              Status: {totalInvoice === 0 ? 'Sem lançamentos' : 'Fatura Aberta'}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs font-semibold pt-2 border-t border-white/15 opacity-90">
            <span>{activeCard.accountNumber || '**** **** **** 8421'}</span>
            <span>Vencimento: Dia 20</span>
          </div>
        </div>

        {/* Invoice Status & Limit Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Resumo do Limite</span>
              <span className="text-xs text-slate-400 font-normal">Limite total: {formatCurrency(totalLimit || 5000)}</span>
            </h3>

            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[11px] text-slate-500 font-bold block">Fatura Fechando em</span>
                <span className="text-sm sm:text-base font-black text-slate-900">Dia 13</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[11px] text-slate-500 font-bold block">Vencimento</span>
                <span className="text-sm sm:text-base font-black text-slate-900">Dia 20</span>
              </div>
            </div>

            {/* Limit Progress */}
            <div className="space-y-1.5 mt-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>Limite Utilizado ({usagePercentage}%)</span>
                <span>Disponível: {formatCurrency(availableLimit)}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all ${
                    usagePercentage > 80 ? 'bg-rose-500' : usagePercentage > 50 ? 'bg-amber-500' : 'bg-indigo-600'
                  }`}
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
            <button
              onClick={() => onPayInvoice(activeCard.id, totalInvoice)}
              disabled={totalInvoice === 0}
              className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Registrar Pagamento da Fatura</span>
            </button>
          </div>
        </div>

        {/* Quick Connection Options */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Sincronização da Fatura</span>
            </h3>

            <p className="text-xs text-slate-600 leading-relaxed">
              Você pode sincronizar os lançamentos do cartão conectando pelo Open Finance, importando o extrato em PDF ou fotografando a fatura.
            </p>

            <div className="space-y-2">
              <button
                onClick={onOpenCardConnection}
                className="w-full p-2.5 text-left rounded-xl border border-indigo-200 bg-indigo-50/60 hover:bg-indigo-100/70 text-indigo-900 transition-colors flex items-center justify-between text-xs font-bold"
              >
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Conectar via Open Finance</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-indigo-500" />
              </button>

              <button
                onClick={onOpenScanner}
                className="w-full p-2.5 text-left rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 transition-colors flex items-center justify-between text-xs font-bold"
              >
                <div className="flex items-center gap-2">
                  <Camera className="w-3.5 h-3.5 text-slate-600" />
                  <span>Escanear Boleto / Fatura com IA</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 flex items-center gap-1.5 pt-2 border-t border-slate-100">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Dados protegidos com criptografia ponta a ponta</span>
          </div>
        </div>

      </div>

      {/* Transactions on Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Compras e Lançamentos nesta Fatura
            </h3>
            <p className="text-xs text-slate-500">
              {cardExpenses.length} transações registradas no cartão
            </p>
          </div>

          <button
            onClick={onOpenNewTransaction}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Compra</span>
          </button>
        </div>

        {cardExpenses.length === 0 ? (
          <div className="text-center py-10 px-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 mx-auto flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              Nenhuma compra registrada nesta fatura ainda
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Você pode adicionar compras manualmente com o botão acima ou conectar o cartão para importar os lançamentos automaticamente.
            </p>
            <button
              onClick={onOpenNewTransaction}
              className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-indigo-700 transition-colors"
            >
              + Cadastrar Primeira Compra
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {cardExpenses.map((t) => (
              <div key={t.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
                    <TrendingDown className="w-4 h-4 text-rose-600" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">{t.description}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-2">
                      <span>{formatDate(t.date)}</span>
                      <span>•</span>
                      <span className="bg-slate-100 px-1.5 py-0.2 rounded text-slate-600 font-semibold">
                        {t.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-black text-rose-600 text-sm">
                    -{formatCurrency(t.amount)}
                  </span>
                  {onDeleteTransaction && (
                    <button
                      onClick={() => onDeleteTransaction(t.id)}
                      className="text-slate-300 hover:text-rose-600 p-1 transition-colors"
                      title="Excluir lançamento"
                    >
                      ×
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
