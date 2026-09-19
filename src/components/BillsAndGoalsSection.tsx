import React, { useState } from 'react';
import { 
  CalendarClock, 
  Target, 
  CheckCircle, 
  AlertCircle, 
  Plus, 
  DollarSign, 
  ShieldCheck, 
  Plane, 
  Car, 
  Home,
  Check
} from 'lucide-react';
import { BillReminder, SavingGoal } from '../types';
import { formatCurrency, formatDateBR } from '../utils/finance';

interface BillsAndGoalsSectionProps {
  bills: BillReminder[];
  goals: SavingGoal[];
  onPayBill: (billId: string) => void;
  onAddDepositToGoal: (goalId: string, amount: number) => void;
  onAddNewBill: (newBill: BillReminder) => void;
  onAddNewGoal: (newGoal: SavingGoal) => void;
}

export const BillsAndGoalsSection: React.FC<BillsAndGoalsSectionProps> = ({
  bills,
  goals,
  onPayBill,
  onAddDepositToGoal,
  onAddNewBill,
  onAddNewGoal,
}) => {
  const [showAddBillModal, setShowAddBillModal] = useState(false);
  const [showAddGoalModal, setShowAddGoalModal] = useState(false);
  const [depositModalGoalId, setDepositModalGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState('');

  // New bill state
  const [billTitle, setBillTitle] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billDueDate, setBillDueDate] = useState('');
  const [billCategory, setBillCategory] = useState('Contas Fixas');

  // New goal state
  const [goalTitle, setGoalTitle] = useState('');
  const [goalTarget, setGoalTarget] = useState('');
  const [goalCurrent, setGoalCurrent] = useState('');
  const [goalDeadline, setGoalDeadline] = useState('');
  const [goalCategory, setGoalCategory] = useState('Segurança');

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depositAmount);
    if (depositModalGoalId && amt > 0) {
      onAddDepositToGoal(depositModalGoalId, amt);
      setDepositModalGoalId(null);
      setDepositAmount('');
    }
  };

  const handleCreateBill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billTitle || !billAmount) return;
    const newBill: BillReminder = {
      id: `bill-${Date.now()}`,
      title: billTitle,
      amount: parseFloat(billAmount),
      dueDate: billDueDate || new Date().toISOString().split('T')[0],
      isPaid: false,
      category: billCategory,
      recurrence: 'mensal',
      urgency: 'normal',
    };
    onAddNewBill(newBill);
    setShowAddBillModal(false);
    setBillTitle('');
    setBillAmount('');
  };

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalTitle || !goalTarget) return;
    const newGoal: SavingGoal = {
      id: `goal-${Date.now()}`,
      title: goalTitle,
      targetAmount: parseFloat(goalTarget),
      currentAmount: parseFloat(goalCurrent) || 0,
      deadline: goalDeadline || '2026-12-31',
      category: goalCategory,
      iconName: 'Target',
      color: 'emerald',
    };
    onAddNewGoal(newGoal);
    setShowAddGoalModal(false);
    setGoalTitle('');
    setGoalTarget('');
    setGoalCurrent('');
  };

  const getDaysRemaining = (dueDateStr: string): number => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(dueDateStr + 'T00:00:00');
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* 1. LEMBRETES DE PAGAMENTO (Contas a Vencer) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 flex items-center justify-center">
                <CalendarClock className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Lembretes de Pagamentos
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Contas e faturas próximas do vencimento</p>
              </div>
            </div>

            <button
              onClick={() => setShowAddBillModal(true)}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-800 dark:hover:text-rose-300 flex items-center gap-1 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1.5 rounded-lg transition-colors border border-rose-100 dark:border-rose-900/60 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Novo Lembrete
            </button>
          </div>

          {/* Bill List */}
          <div className="mt-4 space-y-3">
            {bills.map((bill) => {
              const daysLeft = getDaysRemaining(bill.dueDate);
              const isDueSoon = daysLeft <= 3 && daysLeft >= 0;
              const isOverdue = daysLeft < 0;

              return (
                <div
                  key={bill.id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                    bill.isPaid
                      ? 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 opacity-60'
                      : isDueSoon || isOverdue
                      ? 'bg-rose-50/40 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/50'
                      : 'bg-white dark:bg-slate-800/90 border-slate-200/80 dark:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => onPayBill(bill.id)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                        bill.isPaid
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 dark:border-slate-600 hover:border-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/50 text-transparent hover:text-emerald-600'
                      }`}
                      title={bill.isPaid ? 'Conta Paga' : 'Marcar como Paga'}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${bill.isPaid ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'}`}>
                          {bill.title}
                        </span>
                        {!bill.isPaid && (
                          <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
                            isOverdue
                              ? 'bg-rose-200 dark:bg-rose-900/80 text-rose-900 dark:text-rose-200'
                              : isDueSoon
                              ? 'bg-amber-100 dark:bg-amber-900/80 text-amber-800 dark:text-amber-200'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                          }`}>
                            {isOverdue ? 'Atrasada' : daysLeft === 0 ? 'Vence Hoje!' : `Em ${daysLeft} dias`}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        Vencimento: {formatDateBR(bill.dueDate)} • {bill.category}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white block">
                      {formatCurrency(bill.amount)}
                    </span>
                    <button
                      onClick={() => onPayBill(bill.id)}
                      className={`text-[11px] font-semibold transition-colors cursor-pointer ${
                        bill.isPaid
                          ? 'text-slate-400 dark:text-slate-500 cursor-default'
                          : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 underline'
                      }`}
                    >
                      {bill.isPaid ? 'Paga ✓' : 'Marcar Paga'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal New Bill */}
        {showAddBillModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in transition-colors">
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-3">Adicionar Lembrete de Pagamento</h4>
              <form onSubmit={handleCreateBill} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Título da Conta / Fatura</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Fatura Cartão Santander"
                    value={billTitle}
                    onChange={(e) => setBillTitle(e.target.value)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Valor (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="Ex: 350.00"
                      value={billAmount}
                      onChange={(e) => setBillAmount(e.target.value)}
                      className="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Data de Vencimento</label>
                    <input
                      type="date"
                      required
                      value={billDueDate}
                      onChange={(e) => setBillDueDate(e.target.value)}
                      className="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Categoria</label>
                  <select
                    value={billCategory}
                    onChange={(e) => setBillCategory(e.target.value)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-xs"
                  >
                    <option value="Contas Fixas">Contas Fixas (Água, Luz, Net)</option>
                    <option value="Cartão de Crédito">Cartão de Crédito</option>
                    <option value="Moradia">Moradia (Aluguel, Condomínio)</option>
                    <option value="Transporte">Transporte (IPVA, Seguro)</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddBillModal(false)}
                    className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg cursor-pointer"
                  >
                    Salvar Lembrete
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* 2. METAS DE ECONOMIA */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between transition-colors">
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 flex items-center justify-center">
                <Target className="w-4.5 h-4.5" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Metas de Economia
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">Progresso dos seus objetivos e sonhos</p>
              </div>
            </div>

            <button
              onClick={() => setShowAddGoalModal(true)}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1.5 rounded-lg transition-colors border border-indigo-100 dark:border-indigo-900/60 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Nova Meta
            </button>
          </div>

          {/* Goals List */}
          <div className="mt-4 space-y-4">
            {goals.map((goal) => {
              const pct = Math.min(100, Math.round((goal.currentAmount / goal.targetAmount) * 100));

              return (
                <div
                  key={goal.id}
                  className="p-4 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/40 dark:bg-slate-800/60 hover:bg-white dark:hover:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                        {goal.title}
                      </h5>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Prazo estimado: {formatDateBR(goal.deadline)} • {goal.category}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-800">
                        {pct}%
                      </span>
                      <button
                        onClick={() => setDepositModalGoalId(goal.id)}
                        className="px-2.5 py-1 text-[11px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer"
                      >
                        + Aporte
                      </button>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                    <span>Atual: <strong className="text-slate-900 dark:text-white">{formatCurrency(goal.currentAmount)}</strong></span>
                    <span>Objetivo: <strong className="text-slate-900 dark:text-white">{formatCurrency(goal.targetAmount)}</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Deposit Modal */}
        {depositModalGoalId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 w-full max-w-sm shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in transition-colors">
              <h4 className="font-bold text-slate-900 dark:text-white text-sm mb-2">Realizar Aporte na Meta</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">Adicione saldo poupado diretamente ao objetivo.</p>
              <form onSubmit={handleDepositSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Valor do Aporte (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="Ex: 250.00"
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(e.target.value)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-xs placeholder:text-[11.5px] placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setDepositModalGoalId(null)}
                    className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg text-xs cursor-pointer"
                  >
                    Confirmar Aporte
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal New Goal */}
        {showAddGoalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 w-full max-w-md shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in transition-colors">
              <h4 className="font-bold text-slate-900 dark:text-white text-base mb-3">Criar Nova Meta de Economia</h4>
              <form onSubmit={handleCreateGoal} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Nome da Meta</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Reforma da Casa, Viagem Fim de Ano"
                    value={goalTitle}
                    onChange={(e) => setGoalTitle(e.target.value)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Meta Alvo (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder="Ex: 5000.00"
                      value={goalTarget}
                      onChange={(e) => setGoalTarget(e.target.value)}
                      className="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-xs"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Valor Inicial (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 500.00"
                      value={goalCurrent}
                      onChange={(e) => setGoalCurrent(e.target.value)}
                      className="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-xs"
                    />
                  </div>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Data Prazo</label>
                  <input
                    type="date"
                    value={goalDeadline}
                    onChange={(e) => setGoalDeadline(e.target.value)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">Categoria</label>
                  <select
                    value={goalCategory}
                    onChange={(e) => setGoalCategory(e.target.value)}
                    className="w-full p-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-lg text-xs"
                  >
                    <option value="Segurança">Segurança (Reserva de Emergência)</option>
                    <option value="Sonho">Sonhos & Lazer (Viagem, Casamento)</option>
                    <option value="Patrimônio">Patrimônio (Carro, Imóvel)</option>
                    <option value="Educação">Educação & Carreira</option>
                  </select>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddGoalModal(false)}
                    className="px-3 py-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer"
                  >
                    Criar Meta
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
