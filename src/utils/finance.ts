import { Transaction, MonthlySummary } from '../types';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(amount);
}

export function formatCompactCurrency(amount: number): string {
  if (Math.abs(amount) >= 1000) {
    return `R$ ${(amount / 1000).toFixed(1)}k`;
  }
  return formatCurrency(amount);
}

export function formatDateBR(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  if (!day) return dateStr;
  return `${day}/${month}/${year}`;
}

export const formatDate = formatDateBR;

/**
 * Retorna a data de hoje no formato YYYY-MM-DD
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Determina se uma movimentação está pendente:
 * - Se a data for estritamente futura em relação a hoje (ex: hoje 14, lançamento para 16), fica Pendente.
 * - Se isPaid for explicitamente false, fica Pendente.
 * - Se a data for hoje ou passada e isPaid não for false, fica Concluído (Recebido/Pago).
 */
export function isTransactionPending(tx: { date?: string; isPaid?: boolean }): boolean {
  if (tx.isPaid === false) return true;
  if (!tx.date) return false;
  const today = getTodayDateString();
  if (tx.date > today) return true;
  return false;
}

export function calculateSummary(transactions: Transaction[]): MonthlySummary {
  let grossIncome = 0;
  let totalExpense = 0;
  let totalInvestment = 0;
  const categoryExpenses: Record<string, number> = {};

  transactions.forEach((tx) => {
    if (tx.type === 'income') {
      grossIncome += tx.amount;
    } else if (tx.type === 'expense') {
      totalExpense += tx.amount;
      categoryExpenses[tx.category] = (categoryExpenses[tx.category] || 0) + tx.amount;
      if (tx.category === 'Investimento') {
        totalInvestment += tx.amount;
      }
    } else if (tx.type === 'investment') {
      totalInvestment += tx.amount;
    }
  });

  // Mandato do usuário: Investimentos aparecem em "saídas" (Saídas = Gastos + Investimentos)
  const totalOutflows = totalExpense + totalInvestment;

  // Total disponível (Saldo): Receitas - Saídas
  const balance = grossIncome - totalOutflows;
  const netRemaining = balance;
  const isRed = balance < 0;

  // Find category with highest expense
  let topCategory = 'Nenhuma';
  let topAmount = 0;
  Object.entries(categoryExpenses).forEach(([cat, amt]) => {
    if (amt > topAmount) {
      topAmount = amt;
      topCategory = cat;
    }
  });

  const topPercentage = totalExpense > 0 ? Math.round((topAmount / totalExpense) * 100) : 0;
  const savingsRate = grossIncome > 0 ? (totalInvestment / grossIncome) * 100 : 0;

  // Calculate Health Score (0 - 100)
  let score = 50;
  if (isRed) {
    score = Math.max(10, Math.round(35 - (Math.abs(balance) / (grossIncome || 1)) * 30));
  } else {
    const expenseRatio = grossIncome > 0 ? totalExpense / grossIncome : 1;
    if (expenseRatio <= 0.6) score += 30;
    else if (expenseRatio <= 0.75) score += 20;
    else if (expenseRatio <= 0.9) score += 10;

    if (savingsRate >= 20) score += 20;
    else if (savingsRate >= 10) score += 12;
    else if (savingsRate > 0) score += 5;
  }

  score = Math.min(100, Math.max(0, score));

  let healthStatus: MonthlySummary['healthStatus'] = 'Boa';
  if (isRed) {
    healthStatus = 'Crítica (No Vermelho)';
  } else if (score >= 80) {
    healthStatus = 'Excelente';
  } else if (score >= 60) {
    healthStatus = 'Boa';
  } else {
    healthStatus = 'Atenção';
  }

  return {
    totalIncome: grossIncome,
    grossIncome,
    totalExpense,
    totalInvestment,
    totalOutflows,
    balance,
    netRemaining,
    isRed,
    savingsRate,
    topExpenseCategory: {
      category: topCategory,
      amount: topAmount,
      percentage: topPercentage,
    },
    financialHealthScore: score,
    healthStatus,
  };
}
