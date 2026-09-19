import React from 'react';
import { 
  ArrowLeft, 
  PiggyBank, 
  Plus, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2, 
  Calendar, 
  Building2,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { Transaction, SavingGoal, BankAccount } from '../types';
import { formatCurrency, formatDate } from '../utils/finance';

interface InvestimentosPageProps {
  transactions: Transaction[];
  goals: SavingGoal[];
  bankAccounts: BankAccount[];
  onBack: () => void;
  onOpenNewTransaction: () => void;
  onAddDepositToGoal: (goalId: string, amount: number) => void;
  onAddNewGoal: (newGoal: SavingGoal) => void;
}

export const InvestimentosPage: React.FC<InvestimentosPageProps> = ({
  transactions,
  goals,
  bankAccounts,
  onBack,
  onOpenNewTransaction,
  onAddDepositToGoal,
}) => {
  const investmentTransactions = transactions.filter((t) => t.type === 'investment' || t.category === 'Investimento');
  const totalInvestment = investmentTransactions.reduce((acc, t) => acc + t.amount, 0);

  return (
    <div id="investimentos-dedicated-page" className="space-y-6 animate-fadeIn">
      
      {/* Top Breadcrumbs & Back Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            id="back-to-home-btn"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Voltar ao Início</span>
          </button>

          <span className="text-slate-300 dark:text-slate-600 font-light">/</span>
          <span className="text-xs sm:text-sm font-bold text-indigo-800 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/70 px-2.5 py-1 rounded-lg border border-indigo-200/60 dark:border-indigo-800 flex items-center gap-1.5">
            <PiggyBank className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            Gestão de Investimentos & Reservas
          </span>
        </div>

        {/* Quick Add Investment */}
        <button
          id="investimentos-add-btn"
          onClick={onOpenNewTransaction}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Novo Aporte</span>
        </button>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Aportes no Mês */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border-2 border-indigo-500/80 dark:border-indigo-500/60 shadow-xs relative overflow-hidden transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-indigo-800 dark:text-indigo-300 bg-indigo-100/90 dark:bg-indigo-950/80 px-2.5 py-1 rounded-md border border-transparent dark:border-indigo-800">
              Total Investido no Mês
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
              <PiggyBank className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-3">
            {formatCurrency(totalInvestment)}
          </p>
          <div className="mt-2 text-xs text-indigo-700 dark:text-indigo-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>17,97% da sua renda poupada e investida</span>
          </div>
        </div>

        {/* Aporte Tesouro Selic */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
              Tesouro Selic (Reserva)
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400 tracking-tight mt-3">
            R$ 361,94
          </p>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Alocado na entrada do <strong className="text-slate-800 dark:text-slate-200">Salário</strong> (10,63%)</span>
          </div>
        </div>

        {/* Caixinha Imprevistos */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md">
              Caixinha Nubank
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 flex items-center justify-center">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-extrabold text-purple-700 dark:text-purple-400 tracking-tight mt-3">
            R$ 250,00
          </p>
          <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            <span>Alocado na entrada da <strong className="text-slate-800 dark:text-slate-200">Comissão</strong> (7,34%)</span>
          </div>
        </div>
      </div>

      {/* Goals / Metas Progress */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Metas de Economia e Patrimônio
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Acompanhe a evolução das suas reservas e objetivos futuros.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {goals.map((goal) => {
            const percentage = Math.min(100, Math.round((goal.currentAmount / (goal.targetAmount || 1)) * 100));

            return (
              <div 
                key={goal.id}
                className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold tracking-wider bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                      {goal.category}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">{percentage}%</span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-2">{goal.title}</h4>
                  <div className="mt-2 flex items-baseline justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">Acumulado:</span>
                    <span className="font-extrabold text-slate-900 dark:text-white">{formatCurrency(goal.currentAmount)}</span>
                  </div>
                  <div className="flex items-baseline justify-between text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span>Meta total:</span>
                    <span className="text-slate-800 dark:text-slate-200">{formatCurrency(goal.targetAmount)}</span>
                  </div>

                  <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden mt-3">
                    <div 
                      className="h-full bg-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-slate-700 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 dark:text-slate-500">Meta: {formatDate(goal.deadline)}</span>
                  <button
                    onClick={() => onAddDepositToGoal(goal.id, 50)}
                    className="text-xs font-bold text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-100 bg-indigo-50 dark:bg-indigo-950/80 hover:bg-indigo-100 dark:hover:bg-indigo-900 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    + R$ 50 Aporte
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bank & Custody Accounts */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
          Contas e Custódia de Investimentos
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Saldos atualizados onde suas reservas estão guardadas rendendo.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {bankAccounts.map((acc) => (
            <div key={acc.id} className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-2xs">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span className="font-semibold">{acc.institution}</span>
                <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 rounded font-medium">{acc.type === 'investment' ? 'Investimento' : 'Corrente'}</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-1 line-clamp-1">{acc.name}</h4>
              <p className="text-base font-extrabold text-slate-900 dark:text-white mt-1">{formatCurrency(acc.balance)}</p>
              <div className="mt-2 text-[10px] text-slate-400 dark:text-slate-500">
                {acc.accountNumber || 'Sincronizado'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Investment Transactions History */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-1">
          Histórico de Aportes do Mês
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Registros de depósitos destinados à reserva de emergência e investimentos.
        </p>

        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {investmentTransactions.map((item) => (
            <div 
              key={item.id}
              className="py-3.5 flex items-center justify-between hover:bg-slate-50/80 dark:hover:bg-slate-800/80 px-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 flex items-center justify-center shrink-0">
                  <PiggyBank className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.description}</h4>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <span className="flex items-center gap-1 font-medium">
                      <Calendar className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      {formatDate(item.date)}
                    </span>
                    <span>•</span>
                    <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.2 rounded font-medium">
                      {item.category}
                    </span>
                    {item.notes && (
                      <span className="text-[11px] text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.2 rounded hidden sm:inline">
                        {item.notes}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <span className="text-base font-extrabold text-indigo-700 dark:text-indigo-400 block">
                  +{formatCurrency(item.amount)}
                </span>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                  ✓ Aportado
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
