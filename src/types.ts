export type TransactionType = 'income' | 'expense' | 'investment';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  category: string;
  source: 'manual' | 'bank_sync' | 'receipt_scan';
  bankName?: string;
  isPaid?: boolean;
  notes?: string;
  installments?: {
    current: number;
    total: number;
    type?: 'total' | 'installment';
  };
  installmentParentId?: string;
  recurrence?: 'semanal' | 'quinzenal' | 'mensal' | 'bimestral' | 'personalizar';
  isRecurring?: boolean;
  recurringParentId?: string;
  paidMonths?: { [monthKey: string]: boolean };
}

export interface BankAccount {
  id: string;
  name: string;
  institution: string;
  type: 'checking' | 'credit_card' | 'investment';
  balance: number;
  availableLimit?: number;
  lastSync: string;
  color: string;
  status: 'connected' | 'syncing' | 'error';
  accountNumber?: string;
}

export interface SavingGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  category: string;
  iconName: string;
  color: string;
}

export interface BillReminder {
  id: string;
  title: string;
  amount: number;
  dueDate: string;
  isPaid: boolean;
  category: string;
  recurrence: 'mensal' | 'unica' | 'anual';
  urgency?: 'urgent' | 'warning' | 'normal';
}

export interface SmartTip {
  title: string;
  description: string;
  badge: string;
  category: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
}

export interface MonthlySummary {
  totalIncome: number; // Receitas
  grossIncome: number; // Receita bruta total
  totalExpense: number;
  totalInvestment: number;
  totalOutflows: number; // Total de saídas (gastos + investimentos)
  balance: number; // Total Disponível: Receitas - Saídas
  netRemaining: number;
  isRed: boolean;
  savingsRate: number;
  topExpenseCategory: {
    category: string;
    amount: number;
    percentage: number;
  };
  financialHealthScore: number;
  healthStatus: 'Excelente' | 'Boa' | 'Atenção' | 'Crítica (No Vermelho)';
}

export interface SpreadsheetBudgetItem {
  id: string;
  description: string;
  amount: number;
  percentageOfTotal: number;
  category: string;
  type: 'expense' | 'investment';
  envelope: string;
  isPaid?: boolean;
  isLinkedFromTop?: boolean;
  transactionId?: string;
}

export interface SpreadsheetEnvelope {
  id: string;
  name: string;
  incomeAmount: number;
  percentageOfIncome: number;
  color: string;
  bgLight: string;
  borderColor: string;
  items: SpreadsheetBudgetItem[];
  totalAllocated: number;
  finalBalance: number;
}
