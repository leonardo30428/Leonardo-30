import React, { useState } from 'react';
import { 
  ArrowLeft, 
  TrendingDown, 
  Plus, 
  CreditCard, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Tag, 
  FileSpreadsheet,
  Layers,
  ArrowDownRight,
  Trash2,
  Building2
} from 'lucide-react';
import { Transaction, BillReminder } from '../types';
import { formatCurrency, formatDate, isTransactionPending } from '../utils/finance';

interface GastosPageProps {
  transactions: Transaction[];
  bills: BillReminder[];
  onBack: () => void;
  onOpenNewTransaction: () => void;
  onPayBill: (id: string) => void;
  onDeleteTransaction?: (id: string) => void;
  onToggleTransactionPaid?: (id: string) => void;
}

export const GastosPage: React.FC<GastosPageProps> = ({
  transactions,
  bills,
  onBack,
  onOpenNewTransaction,
  onPayBill,
  onDeleteTransaction,
  onToggleTransactionPaid,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'bills'>('all');

  const expenseTransactions = transactions.filter((t) => t.type === 'expense');
  const totalExpense = expenseTransactions.reduce((acc, t) => acc + t.amount, 0);

  // Group by category
  const categoriesMap: Record<string, number> = {};
  expenseTransactions.forEach((t) => {
    categoriesMap[t.category] = (categoriesMap[t.category] || 0) + t.amount;
  });

  const categoryList = Object.entries(categoriesMap)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: Math.round((amount / (totalExpense || 1)) * 100),
    }))
    .sort((a, b) => b.amount - a.amount);

  const filteredExpenses = expenseTransactions.filter((item) => {
    if (searchTerm && !item.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div id="gastos-dedicated-page" className="space-y-6 animate-fadeIn">
      
      {/* Top Breadcrumbs & Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <button
            id="back-to-home-btn"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs sm:text-sm rounded-xl border border-slate-200 shadow-2xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600" />
            <span>Voltar ao Início</span>
          </button>

          <span className="text-slate-300 font-light">/</span>
          <span className="text-xs sm:text-sm font-bold text-rose-800 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200/60 flex items-center gap-1.5">
            <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
            Gestão de Gastos & Contas
          </span>
        </div>

        {/* Quick Add Expense */}
        <button
          id="gastos-add-expense-btn"
          onClick={onOpenNewTransaction}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Novo Gasto</span>
        </button>
      </div>

      {/* Hero Stats for Expenses */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Gastos */}
        <div className="bg-white rounded-2xl p-5 border-2 border-rose-400/80 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-rose-800 bg-rose-100/90 px-2.5 py-1 rounded-md">
              Total de Gastos
            </span>
            <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center">
              <TrendingDown className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
            {formatCurrency(totalExpense)}
          </p>
          <div className="mt-2 text-xs text-slate-500 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Total distribuído nos envelopes da sua planilha</span>
          </div>
        </div>

        {/* Maior Categoria de Gasto */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
              Maior Compromisso
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-lg font-black text-slate-900 tracking-tight mt-3 truncate">
            {categoryList[0]?.category || 'Nenhuma despesa'}
          </p>
          <div className="mt-1 text-xs text-slate-500">
            <strong className="text-slate-900">{formatCurrency(categoryList[0]?.amount || 0)}</strong> ({categoryList[0]?.percentage ? categoryList[0]?.percentage.toFixed(0) : 0}% dos gastos)
          </div>
        </div>

        {/* Total de Contas Mapeadas */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
              Contas & Lembretes
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-3">
            {bills.length} Contas
          </p>
          <div className="mt-2 text-xs text-slate-500">
            <span>{bills.filter(b => b.isPaid).length} pagas • {bills.filter(b => !b.isPaid).length} pendentes</span>
          </div>
        </div>
      </div>

      {/* Category Breakdown Progress Bars */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <h3 className="text-base font-extrabold text-slate-900 mb-1">
          Distribuição das Despesas por Categoria
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Visualização proporcional de onde seu dinheiro está sendo direcionado neste mês.
        </p>

        <div className="space-y-3">
          {categoryList.map((cat, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-800">{cat.category}</span>
                <span className="text-slate-900 font-extrabold">
                  {formatCurrency(cat.amount)} <span className="text-slate-400 font-normal">({cat.percentage}%)</span>
                </span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    idx === 0 ? 'bg-rose-500' : idx === 1 ? 'bg-amber-500' : 'bg-emerald-600'
                  }`}
                  style={{ width: `${cat.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bills & Reminders Toggle */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Lembretes de Pagamento e Vencimentos
            </h3>
            <p className="text-xs text-slate-500">
              Acompanhe o pagamento das suas contas cadastradas na planilha.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
          {bills.map((bill) => (
            <div 
              key={bill.id}
              onClick={() => onPayBill(bill.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                bill.isPaid 
                  ? 'bg-slate-50/70 border-slate-200 opacity-90' 
                  : 'bg-amber-50/60 border-amber-200 shadow-2xs hover:border-amber-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-wider text-slate-500">
                    {bill.category}
                  </span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    bill.isPaid ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {bill.isPaid ? 'Pago' : 'Pendente'}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-900 mt-1.5 line-clamp-1">
                  {bill.title}
                </h4>
                <p className="text-base font-extrabold text-slate-900 mt-1">
                  {formatCurrency(bill.amount)}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>Vence: {formatDate(bill.dueDate)}</span>
                <span className="text-emerald-700 font-bold">
                  {bill.isPaid ? '✓ Concluído' : 'Clique p/ Marcar'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Expense Transactions List */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">
              Todas as Saídas & Gastos
            </h3>
            <p className="text-xs text-slate-500">
              Lista completa das despesas cadastradas no mês.
            </p>
          </div>

          <input
            type="text"
            placeholder="Buscar despesa..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-rose-500"
          />
        </div>

        <div className="divide-y divide-slate-100 mt-2">
          {filteredExpenses.map((item) => (
            <div 
              key={item.id}
              className="py-4 px-3 sm:px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6 hover:bg-slate-50/90 rounded-2xl transition-all"
            >
              <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 shadow-2xs mt-0.5 sm:mt-0">
                  <TrendingDown className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-base font-extrabold text-slate-900 truncate">{item.description}</h4>
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-500 mt-1">
                    <span className="flex items-center gap-1 text-xs sm:text-[13px] font-semibold text-slate-700">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      {formatDate(item.date)}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium text-[11px]">
                      {item.category}
                    </span>
                    {item.bankName && (
                      <>
                        <span className="text-slate-300">•</span>
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium text-[11px] flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {item.bankName}
                        </span>
                      </>
                    )}
                    {item.notes && (
                      <>
                        <span className="text-slate-300 hidden sm:inline">•</span>
                        <span className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md hidden sm:inline">
                          {item.notes}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center shrink-0 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-100 sm:border-l sm:border-slate-100 sm:pl-5 gap-2 min-w-[130px]">
                <span className="text-base sm:text-lg font-black text-rose-600 tracking-tight whitespace-nowrap">
                  -{formatCurrency(item.amount)}
                </span>
                <div className="flex items-center gap-2">
                  {(() => {
                    const pending = isTransactionPending(item);
                    return (
                      <button
                        type="button"
                        onClick={() => onToggleTransactionPaid?.(item.id)}
                        title={pending ? 'Pendente - clique para marcar como pago' : 'Pago - clique para marcar como pendente'}
                        className={`text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap inline-flex items-center gap-1.5 transition-all hover:scale-102 shadow-2xs ${
                          pending
                            ? 'text-amber-800 bg-amber-100 border border-amber-300'
                            : 'text-slate-700 bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {pending ? (
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        )}
                        {pending ? 'Pendente' : 'Pago'}
                      </button>
                    );
                  })()}
                  {onDeleteTransaction && (
                    <button
                      onClick={() => onDeleteTransaction(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Excluir gasto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
