import React from 'react';
import { X, ArrowDown, ArrowUp, CreditCard, CheckCircle2, AlertCircle } from 'lucide-react';
import { BillReminder } from '../types';
import { formatCurrency } from '../utils/finance';

interface PendenciasModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedTab?: 'pagar' | 'receber' | 'faturas';
  bills: BillReminder[];
  onPayBill: (id: string) => void;
  onOpenNewTransaction: () => void;
}

export const PendenciasModal: React.FC<PendenciasModalProps> = ({
  isOpen,
  onClose,
  selectedTab = 'pagar',
  bills,
  onPayBill,
  onOpenNewTransaction,
}) => {
  const [tab, setTab] = React.useState<'pagar' | 'receber' | 'faturas'>(selectedTab);

  React.useEffect(() => {
    if (selectedTab) setTab(selectedTab);
  }, [selectedTab]);

  if (!isOpen) return null;

  const unpaidBills = bills.filter((b) => !b.isPaid);
  const cardBills = bills.filter((b) => b.category.toLowerCase().includes('cart') || b.title.toLowerCase().includes('cart') || b.title.toLowerCase().includes('fatura'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Suas Pendências</h3>
              <p className="text-xs text-slate-500">Controle de pagamentos e recebimentos</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="p-3 bg-slate-50/70 border-b border-slate-100 grid grid-cols-3 gap-2">
          <button
            onClick={() => setTab('pagar')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              tab === 'pagar'
                ? 'bg-white text-rose-700 shadow-xs border border-rose-100'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDown className="w-3.5 h-3.5 text-rose-500" />
            <span>Pagar</span>
          </button>

          <button
            onClick={() => setTab('receber')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              tab === 'receber'
                ? 'bg-white text-emerald-700 shadow-xs border border-emerald-100'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>Receber</span>
          </button>

          <button
            onClick={() => setTab('faturas')}
            className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              tab === 'faturas'
                ? 'bg-white text-orange-700 shadow-xs border border-orange-100'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5 text-orange-500" />
            <span>Faturas</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 max-h-[60vh] overflow-y-auto space-y-3">
          {tab === 'pagar' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                <span>Contas a Pagar</span>
                <span className="font-bold text-rose-600">
                  {formatCurrency(unpaidBills.reduce((acc, b) => acc + b.amount, 0))}
                </span>
              </div>
              {unpaidBills.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  Nenhuma conta pendente de pagamento!
                </div>
              ) : (
                unpaidBills.map((bill) => (
                  <div 
                    key={bill.id}
                    className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all"
                  >
                    <div>
                      <p className="text-xs font-bold text-slate-800">{bill.title}</p>
                      <p className="text-[11px] text-slate-400">Vencimento: {bill.dueDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-rose-600">
                        {formatCurrency(bill.amount)}
                      </span>
                      <button
                        onClick={() => onPayBill(bill.id)}
                        className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
                      >
                        Pagar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {tab === 'receber' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                <span>Recebimentos Previstos</span>
                <span className="font-bold text-emerald-600">R$ 2.400,00</span>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Comissão de Vendas</span>
                  <span className="text-xs font-extrabold text-emerald-600">R$ 1.750,00</span>
                </div>
                <p className="text-[11px] text-slate-500">Previsão de depósito: Dia 10 do mês</p>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Recebimento da Lojinha</span>
                  <span className="text-xs font-extrabold text-emerald-600">R$ 650,00</span>
                </div>
                <p className="text-[11px] text-slate-500">Recebimento via Pix / Cartão</p>
              </div>
            </div>
          )}

          {tab === 'faturas' && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
                <span>Faturas de Cartão de Crédito</span>
                <span className="font-bold text-orange-600">R$ 2.177,30</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-purple-600 text-white flex items-center justify-center text-[10px] font-bold">Nu</span>
                    <span className="text-xs font-bold text-slate-800">Fatura Cartão Nubank</span>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900">R$ 500,00</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Vence dia 20</span>
                  <span className="text-emerald-600 font-semibold">Alocado no Salário</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-orange-500 text-white flex items-center justify-center text-[10px] font-bold">Itaú</span>
                    <span className="text-xs font-bold text-slate-800">Fatura Cartão Itaú</span>
                  </div>
                  <span className="text-xs font-extrabold text-slate-900">R$ 1.677,30</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Vence dia 25</span>
                  <span className="text-slate-500">Limite Disp: R$ 3.500,00</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onOpenNewTransaction();
            }}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800"
          >
            + Adicionar Pendência
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
