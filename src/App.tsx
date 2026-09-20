import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { TransactionsList, TransactionFilterType } from './components/TransactionsList';
import { BankSyncModal } from './components/BankSyncModal';
import { ReceiptScannerModal } from './components/ReceiptScannerModal';
import { GeminiChatDrawer } from './components/GeminiChatDrawer';
import { TransactionModal } from './components/TransactionModal';
import { NotificationsDrawer, SmartNotification } from './components/NotificationsDrawer';
import { SpreadsheetPlanner } from './components/SpreadsheetPlanner';
import { IntuitiveBalanceHeader } from './components/IntuitiveBalanceHeader';
import { ContasSection } from './components/ContasSection';
import { ContasTab } from './components/ContasTab';
import { CardInvoiceConnectionModal } from './components/CardInvoiceConnectionModal';
import { MonthlyBalanceTab } from './components/MonthlyBalanceTab';
import { BottomNavBar } from './components/BottomNavBar';
import { PendingBillsModal } from './components/PendingBillsModal';
import { TransactionTypeChoiceModal } from './components/TransactionTypeChoiceModal';
import { MonthlyReportModal } from './components/MonthlyReportModal';
import { 
  Transaction, 
  BankAccount, 
  SavingGoal, 
  BillReminder, 
  TransactionType 
} from './types';
import { 
  initialTransactions, 
  initialBankAccounts, 
  initialSavingGoals, 
  initialBillReminders,
  emptySpreadsheetEnvelopes
} from './data/mockData';
import { 
  calculateSummary, 
  formatCurrency,
  isTransactionPending
} from './utils/finance';
import { 
  DEFAULT_MONTHS_LIST, 
  getMonthKey, 
  addMonthsToDate, 
  cleanInstallmentDescription 
} from './utils/dateUtils';
import { 
  Bot, 
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Calendar,
  FileText
} from 'lucide-react';

const CLEAN_SLATE_VERSION = 'v11_zerado_total_limpo';

const emptyBankAccounts: BankAccount[] = [
  {
    id: 'card-1',
    name: 'Cartão de Crédito Nubank',
    institution: 'Nubank',
    type: 'credit_card',
    balance: 0,
    availableLimit: 5000,
    lastSync: 'Aguardando sincronização',
    color: '#820ad1',
    status: 'connected',
    accountNumber: 'Final 8421',
  },
  {
    id: 'bank-1',
    name: 'Conta Corrente Principal',
    institution: 'Nubank',
    type: 'checking',
    balance: 0,
    lastSync: 'Sincronizado',
    color: '#820ad1',
    status: 'connected',
    accountNumber: 'Conta 0001',
  },
];

export type AppSection = 
  | 'inicio' 
  | 'receitas' 
  | 'gastos' 
  | 'fatura' 
  | 'planejamento' 
  | 'extrato' 
  | 'relatorios';

export default function App() {
  // Active App Tab: 'planejamento' (Planejamento) | 'contas' (Contas a Pagar / Receber) | 'balanceamento' (Balanceamento dos Meses) | 'historico' (Histórico de Transações)
  const [activeAppTab, setActiveAppTab] = useState<'planejamento' | 'balanceamento' | 'historico' | 'contas'>('planejamento');
  const [contasMode, setContasMode] = useState<'pagar' | 'receber'>('pagar');
  const [historyScope, setHistoryScope] = useState<'currentMonth' | 'all'>('currentMonth');

  // Month navigation: includes 2026 and 2027 with seamless December to January rollover
  const months = DEFAULT_MONTHS_LIST;
  const initialMonthIdx = months.indexOf('Setembro 2026');
  const [currentMonthIndex, setCurrentMonthIndex] = useState(initialMonthIdx >= 0 ? initialMonthIdx : 8);
  const currentMonth = months[currentMonthIndex] || 'Setembro 2026';

  const currentMonthKey = useMemo(() => getMonthKey(currentMonth), [currentMonth]);

  // Transactions local persistence - seeds initial multi-month accounts cleanly
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const isSynced = localStorage.getItem('finansmart_multimonth_v12');
      if (isSynced !== 'v12') {
        localStorage.setItem('finansmart_multimonth_v12', 'v12');
        localStorage.setItem('finansmart_transactions', JSON.stringify(initialTransactions));
        localStorage.setItem('finansmart_bank_accounts', JSON.stringify(emptyBankAccounts));
        localStorage.setItem('finansmart_saving_goals', JSON.stringify([]));
        localStorage.setItem('finansmart_bill_reminders', JSON.stringify([]));
        localStorage.setItem('finansmart_sheet_envelopes_v11', JSON.stringify(emptySpreadsheetEnvelopes));
        return initialTransactions;
      }
      const saved = localStorage.getItem('finansmart_transactions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return initialTransactions;
    } catch {
      return initialTransactions;
    }
  });

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>(() => {
    try {
      const isSynced = localStorage.getItem('finansmart_clean_v11_synced');
      if (isSynced !== CLEAN_SLATE_VERSION) return emptyBankAccounts;
      const saved = localStorage.getItem('finansmart_bank_accounts');
      return saved ? JSON.parse(saved) : emptyBankAccounts;
    } catch {
      return emptyBankAccounts;
    }
  });

  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>(() => {
    try {
      const isSynced = localStorage.getItem('finansmart_clean_v11_synced');
      if (isSynced !== CLEAN_SLATE_VERSION) return [];
      const saved = localStorage.getItem('finansmart_saving_goals');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [billReminders, setBillReminders] = useState<BillReminder[]>(() => {
    try {
      const isSynced = localStorage.getItem('finansmart_clean_v11_synced');
      if (isSynced !== CLEAN_SLATE_VERSION) return [];
      const saved = localStorage.getItem('finansmart_bill_reminders');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage on changes
  useEffect(() => {
    localStorage.setItem('finansmart_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('finansmart_bank_accounts', JSON.stringify(bankAccounts));
  }, [bankAccounts]);

  useEffect(() => {
    localStorage.setItem('finansmart_saving_goals', JSON.stringify(savingGoals));
  }, [savingGoals]);

  useEffect(() => {
    localStorage.setItem('finansmart_bill_reminders', JSON.stringify(billReminders));
  }, [billReminders]);

  // Notifications State - initialized clean
  const [notifications, setNotifications] = useState<SmartNotification[]>([]);

  // Modal dialog states
  const [isTypeChoiceModalOpen, setIsTypeChoiceModalOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [transactionModalDefaultType, setTransactionModalDefaultType] = useState<TransactionType>('expense');

  const handleSelectTransactionType = (type: TransactionType) => {
    setEditingTransaction(null);
    setTransactionModalDefaultType(type);
    setIsTypeChoiceModalOpen(false);
    setIsTransactionModalOpen(true);
  };

  const handleOpenEditTransaction = (tx: Transaction) => {
    setEditingTransaction(tx);
    setTransactionModalDefaultType(tx.type);
    setIsTransactionModalOpen(true);
  };

  const handleUpdateTransaction = (updatedTx: Transaction) => {
    const prevTx = transactions.find((t) => t.id === updatedTx.id);

    const isNowRecurring = Boolean(updatedTx.isRecurring);
    const wasRecurring = Boolean(prevTx?.isRecurring);

    const hasInstallments = Boolean(updatedTx.installments && updatedTx.installments.total > 1);
    const hadInstallments = Boolean(prevTx?.installments && prevTx.installments.total > 1);

    let nextTransactions = [...transactions];

    // CENÁRIO 1: Alterou de ÚNICA para RECORRENTE
    if (isNowRecurring && !wasRecurring) {
      const parentId = prevTx?.recurringParentId || `rec-${Date.now()}`;
      const updatedMainTx: Transaction = {
        ...updatedTx,
        isRecurring: true,
        recurringParentId: parentId,
      };

      // Gera os meses posteriores (15 meses à frente cobrindo a virada do ano de dezembro para janeiro)
      const futureTxs: Transaction[] = [];
      for (let offset = 1; offset <= 15; offset++) {
        const nextDate = addMonthsToDate(updatedTx.date, offset);
        futureTxs.push({
          ...updatedTx,
          id: `tx-rec-${parentId}-${offset}-${Date.now()}`,
          date: nextDate,
          isRecurring: true,
          recurringParentId: parentId,
          isPaid: false, // nos meses posteriores começa pendente (previsto)
        });
      }

      nextTransactions = nextTransactions.map((t) => (t.id === updatedTx.id ? updatedMainTx : t));
      nextTransactions = [...futureTxs, ...nextTransactions];

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          type: 'sync',
          title: 'Conta Recorrente Ativada',
          message: `"${updatedTx.description}" agora é recorrente e foi propagada para os meses posteriores (renovando para o ano seguinte)!`,
          time: 'Agora',
          unread: true,
        },
        ...prev,
      ]);
    } 
    // CENÁRIO 2: Já era RECORRENTE e foi editada
    else if (isNowRecurring && wasRecurring) {
      const parentId = updatedTx.recurringParentId || prevTx?.recurringParentId;
      nextTransactions = nextTransactions.map((t) => (t.id === updatedTx.id ? updatedTx : t));

      if (parentId) {
        const parts = updatedTx.date.split('-');
        const newDay = parseInt(parts[2], 10) || 10;

        nextTransactions = nextTransactions.map((t) => {
          if (t.recurringParentId === parentId && t.id !== updatedTx.id && t.date > updatedTx.date) {
            const tParts = t.date.split('-');
            const tYear = parseInt(tParts[0], 10);
            const tMonth = parseInt(tParts[1], 10);
            const maxDays = new Date(tYear, tMonth, 0).getDate();
            const adjustedDay = Math.min(newDay, maxDays);
            const adjustedDate = `${tParts[0]}-${tParts[1]}-${String(adjustedDay).padStart(2, '0')}`;

            return {
              ...t,
              description: updatedTx.description,
              amount: updatedTx.amount,
              date: adjustedDate,
              type: updatedTx.type,
              category: updatedTx.category,
              bankName: updatedTx.bankName,
            };
          }
          return t;
        });
      }

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          type: 'sync',
          title: 'Recorrência Atualizada',
          message: `O lançamento "${updatedTx.description}" e os meses posteriores foram sincronizados.`,
          time: 'Agora',
          unread: true,
        },
        ...prev,
      ]);
    } 
    // CENÁRIO 3: Alterou de RECORRENTE para ÚNICA
    else if (!isNowRecurring && wasRecurring) {
      const parentId = prevTx?.recurringParentId;
      const updatedMainTx: Transaction = {
        ...updatedTx,
        isRecurring: false,
        recurringParentId: undefined,
      };

      // Remove repetições futuras
      nextTransactions = nextTransactions.filter(
        (t) => !(parentId && t.recurringParentId === parentId && t.id !== updatedTx.id && t.date > updatedTx.date)
      );
      nextTransactions = nextTransactions.map((t) => (t.id === updatedTx.id ? updatedMainTx : t));

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          type: 'alert',
          title: 'Recorrência Desativada',
          message: `"${updatedTx.description}" agora é única. Repetições futuras foram removidas.`,
          time: 'Agora',
          unread: true,
        },
        ...prev,
      ]);
    } 
    // CENÁRIO 4: Lançamento em PARCELAS
    else if (hasInstallments) {
      const total = updatedTx.installments!.total;
      const current = updatedTx.installments!.current || 1;
      const seriesId = prevTx?.installmentParentId || updatedTx.installmentParentId || `inst-${Date.now()}`;
      const baseDesc = cleanInstallmentDescription(updatedTx.description);

      const updatedMainTx: Transaction = {
        ...updatedTx,
        description: `${baseDesc} (${current}/${total})`,
        installmentParentId: seriesId,
        installments: {
          ...updatedTx.installments!,
          current,
          total,
        },
      };

      // Remove parcelas futuras antigas dessa série se existiam
      nextTransactions = nextTransactions.filter(
        (t) => !(t.installmentParentId === seriesId && t.id !== updatedTx.id && t.date > updatedTx.date)
      );

      // Gera as parcelas subsequentes nos meses seguintes até quitar
      const futureInstallments: Transaction[] = [];
      for (let i = current + 1; i <= total; i++) {
        const monthsOffset = i - current;
        const nextDate = addMonthsToDate(updatedTx.date, monthsOffset);
        futureInstallments.push({
          ...updatedTx,
          id: `tx-inst-${seriesId}-${i}-${Date.now()}`,
          description: `${baseDesc} (${i}/${total})`,
          date: nextDate,
          installments: {
            current: i,
            total,
            type: updatedTx.installments?.type,
          },
          installmentParentId: seriesId,
          isPaid: false, // nos meses seguintes começa como pendente
        });
      }

      nextTransactions = nextTransactions.map((t) => (t.id === updatedTx.id ? updatedMainTx : t));
      nextTransactions = [...futureInstallments, ...nextTransactions];

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          type: 'sync',
          title: 'Parcelas Programadas',
          message: `Parcela ${current}/${total} atualizada e parcelas restantes programadas nos meses seguintes até quitar!`,
          time: 'Agora',
          unread: true,
        },
        ...prev,
      ]);
    } 
    // CENÁRIO 5: Transação ÚNICA / NORMAL
    else {
      // Se antes tinha parcelas e agora não tem, limpa as futuras
      if (hadInstallments && prevTx?.installmentParentId) {
        nextTransactions = nextTransactions.filter(
          (t) => !(t.installmentParentId === prevTx.installmentParentId && t.id !== updatedTx.id && t.date > updatedTx.date)
        );
      }
      nextTransactions = nextTransactions.map((t) => (t.id === updatedTx.id ? updatedTx : t));

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          type: 'sync',
          title: 'Gasto Atualizado',
          message: `O lançamento "${updatedTx.description}" foi atualizado com sucesso.`,
          time: 'Agora',
          unread: true,
        },
        ...prev,
      ]);
    }

    setTransactions(nextTransactions);
  };
  const [isReceiptScannerOpen, setIsReceiptScannerOpen] = useState(false);
  const [isBankSyncOpen, setIsBankSyncOpen] = useState(false);
  const [isCardConnectionOpen, setIsCardConnectionOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [customAIChatPrompt, setCustomAIChatPrompt] = useState<string | undefined>(undefined);
  const [isSyncing, setIsSyncing] = useState(false);

  // Transactions filter on extrato view
  const [activeFilter, setActiveFilter] = useState<TransactionFilterType>('all');
  const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
  const [isMonthlyReportModalOpen, setIsMonthlyReportModalOpen] = useState(false);

  // Filter transactions for the selected month (e.g. Setembro or Outubro)
  const currentMonthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date && t.date.startsWith(currentMonthKey));
  }, [transactions, currentMonthKey]);

  // Compute pending transactions (unpaid expenses and bills) for the active month
  const pendingTransactions = useMemo(() => {
    return currentMonthTransactions.filter(
      (tx) => (tx.type === 'expense' || tx.category !== 'Renda Principal') && (isTransactionPending(tx) || tx.isPaid === false)
    );
  }, [currentMonthTransactions]);

  const pendingAmount = useMemo(() => {
    return pendingTransactions.reduce((acc, t) => acc + t.amount, 0);
  }, [pendingTransactions]);

  const handleOpenContasTab = (type: 'pagar' | 'receber') => {
    setContasMode(type);
    setActiveAppTab('contas');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleViewPending = () => {
    handleOpenContasTab('pagar');
  };

  // Compute live summary metrics for the active month
  const currentMonthSummary = useMemo(() => {
    return calculateSummary(currentMonthTransactions);
  }, [currentMonthTransactions]);

  // Compute live summary metrics for all transactions combined
  const overallSummary = useMemo(() => {
    return calculateSummary(transactions);
  }, [transactions]);

  // Compute main credit card invoice amount
  const mainCreditCard = bankAccounts.find((acc) => acc.type === 'credit_card');
  const cardExpenseTxs = currentMonthTransactions.filter(
    (t) => t.type === 'expense' && (
      t.bankName?.toLowerCase().includes('cartão') ||
      t.bankName?.toLowerCase().includes('nubank') ||
      t.category === 'Cartão de Crédito'
    )
  );
  const mainCardInvoiceAmount = (mainCreditCard && mainCreditCard.balance > 0)
    ? mainCreditCard.balance
    : cardExpenseTxs.reduce((acc, t) => acc + t.amount, 0);

  // Clear history function with scope support
  const handleClearHistory = (scope: 'currentMonth' | 'all') => {
    if (scope === 'currentMonth') {
      setTransactions((prev) => prev.filter((t) => !t.date || !t.date.startsWith(currentMonthKey)));
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          type: 'alert',
          title: 'Histórico do Mês Apagado',
          message: `As movimentações de ${currentMonth} foram excluídas com sucesso.`,
          time: 'Agora',
          unread: true,
        },
        ...prev,
      ]);
    } else {
      setTransactions([]);
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          type: 'alert',
          title: 'Histórico Completo Apagado',
          message: 'Todas as movimentações de todos os meses foram excluídas com sucesso.',
          time: 'Agora',
          unread: true,
        },
        ...prev,
      ]);
    }
  };

  // Duplicate accounts from one month to another
  const handleCopyMonthContas = (fromMonthKey: string, toMonthKey: string) => {
    const sourceTxs = transactions.filter((t) => t.date && t.date.startsWith(fromMonthKey));
    if (sourceTxs.length === 0) return;

    const newTxs: Transaction[] = sourceTxs.map((t, idx) => {
      const day = t.date.split('-')[2] || '10';
      return {
        ...t,
        id: `tx-copy-${Date.now()}-${idx}`,
        date: `${toMonthKey}-${day}`,
      };
    });

    setTransactions((prev) => [...prev, ...newTxs]);
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: 'sync',
        title: 'Contas Replicadas',
        message: `${newTxs.length} contas copiadas para o novo mês com sucesso.`,
        time: 'Agora',
        unread: true,
      },
      ...prev,
    ]);
  };

  // Clear all data to start completely fresh and test
  const handleClearAllData = () => {
    setTransactions([]);
    setBankAccounts(emptyBankAccounts);
    setSavingGoals([]);
    setBillReminders([]);
    localStorage.setItem('finansmart_clean_v11_synced', CLEAN_SLATE_VERSION);
    localStorage.setItem('finansmart_transactions', JSON.stringify([]));
    localStorage.setItem('finansmart_bank_accounts', JSON.stringify(emptyBankAccounts));
    localStorage.setItem('finansmart_saving_goals', JSON.stringify([]));
    localStorage.setItem('finansmart_bill_reminders', JSON.stringify([]));
    localStorage.setItem('finansmart_sheet_envelopes_v11', JSON.stringify(emptySpreadsheetEnvelopes));
    localStorage.removeItem('finansmart_clean_v9_synced');
    localStorage.removeItem('finansmart_clean_v7_synced');
    localStorage.removeItem('finansmart_clean_v8_synced');
    localStorage.removeItem('finansmart_sheet_envelopes_v9');
    localStorage.removeItem('finansmart_sheet_envelopes_v8');

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: 'alert',
        title: 'Tudo Zerado',
        message: 'Todas as entradas, saídas, movimentações e planejamento foram 100% zerados!',
        time: 'Agora',
        unread: true,
      },
      ...prev,
    ]);
  };

  const handlePayInvoice = (cardId: string, amount: number) => {
    if (amount <= 0) return;
    setBankAccounts((prev) =>
      prev.map((c) => (c.id === cardId ? { ...c, balance: 0, availableLimit: (c.availableLimit || 0) + amount } : c))
    );
    handleAddTransaction({
      description: 'Pagamento Fatura do Cartão',
      amount,
      date: `${currentMonthKey}-20`,
      type: 'expense',
      category: 'Cartão de Crédito',
      source: 'manual',
      isPaid: true,
    });
  };

  const handleAddTransaction = (newTxData: Omit<Transaction, 'id'>) => {
    const txDate = newTxData.date || `${currentMonthKey}-10`;

    // 1. CASO PARCELADO: lança a parcela atual e programa nos meses seguintes até quitar
    if (newTxData.installments && newTxData.installments.total > 1) {
      const total = newTxData.installments.total;
      const current = newTxData.installments.current || 1;
      const seriesId = `inst-${Date.now()}`;
      const baseDesc = cleanInstallmentDescription(newTxData.description);

      const currentTx: Transaction = {
        ...newTxData,
        id: `tx-${Date.now()}`,
        description: `${baseDesc} (${current}/${total})`,
        date: txDate,
        installments: {
          ...newTxData.installments,
          current,
          total,
        },
        installmentParentId: seriesId,
        isPaid: newTxData.isPaid,
      };

      const futureInstallments: Transaction[] = [];
      for (let i = current + 1; i <= total; i++) {
        const monthsOffset = i - current;
        const nextDate = addMonthsToDate(txDate, monthsOffset);
        futureInstallments.push({
          ...newTxData,
          id: `tx-inst-${seriesId}-${i}`,
          description: `${baseDesc} (${i}/${total})`,
          date: nextDate,
          installments: {
            ...newTxData.installments,
            current: i,
            total,
          },
          installmentParentId: seriesId,
          isPaid: false, // nos meses seguintes começa como pendente
        });
      }

      setTransactions((prev) => [currentTx, ...futureInstallments, ...prev]);

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          type: 'sync',
          title: 'Lançamento Parcelado',
          message: `${baseDesc}: parcela ${current}/${total} lançada e as parcelas restantes programadas nos meses seguintes até quitar!`,
          time: 'Agora',
          unread: true,
        },
        ...prev,
      ]);
      return;
    }

    // 2. CASO RECORRENTE: propaga para os meses posteriores e renova de dezembro para janeiro
    if (newTxData.isRecurring) {
      const parentId = `rec-${Date.now()}`;
      const currentTx: Transaction = {
        ...newTxData,
        id: `tx-${Date.now()}`,
        date: txDate,
        isRecurring: true,
        recurringParentId: parentId,
        isPaid: newTxData.isPaid,
      };

      const futureTxs: Transaction[] = [];
      // Gera para os próximos 15 meses posteriores garantindo virada de ano automática
      for (let offset = 1; offset <= 15; offset++) {
        const nextDate = addMonthsToDate(txDate, offset);
        futureTxs.push({
          ...newTxData,
          id: `tx-rec-${parentId}-${offset}`,
          date: nextDate,
          isRecurring: true,
          recurringParentId: parentId,
          isPaid: false, // nos meses posteriores começa pendente (previsto)
        });
      }

      setTransactions((prev) => [currentTx, ...futureTxs, ...prev]);

      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          type: 'sync',
          title: 'Conta Recorrente Programada',
          message: `${newTxData.description} (${formatCurrency(newTxData.amount)}) programada para os meses posteriores e renovada para o próximo ano!`,
          time: 'Agora',
          unread: true,
        },
        ...prev,
      ]);
      return;
    }

    // 3. CASO NORMAL (ÚNICA)
    const newTx: Transaction = {
      ...newTxData,
      id: `tx-${Date.now()}`,
      date: txDate,
    };

    setTransactions((prev) => [newTx, ...prev]);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        type: 'sync',
        title: 'Movimentação Registrada',
        message: `${newTx.description} (${formatCurrency(newTx.amount)}) adicionada com sucesso.`,
        time: 'Agora',
        unread: true,
      },
      ...prev,
    ]);
  };

  const handleDeleteTransaction = (id: string) => {
    const target = transactions.find((t) => t.id === id);
    if (target && target.recurringParentId) {
      // Se for recorrente, remove todas as instâncias da recorrência
      setTransactions((prev) => prev.filter((t) => t.recurringParentId !== target.recurringParentId && t.id !== id));
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          type: 'alert',
          title: 'Conta Recorrente Removida',
          message: `${target.description} foi retirada de todos os meses com sucesso.`,
          time: 'Agora',
          unread: true,
        },
        ...prev,
      ]);
    } else if (target && target.installmentParentId) {
      // Se for parcelada, remove todas as parcelas da série
      setTransactions((prev) => prev.filter((t) => t.installmentParentId !== target.installmentParentId && t.id !== id));
      setNotifications((prev) => [
        {
          id: `notif-${Date.now()}`,
          type: 'alert',
          title: 'Parcelamento Removido',
          message: `Todas as parcelas de ${cleanInstallmentDescription(target.description)} foram removidas com sucesso.`,
          time: 'Agora',
          unread: true,
        },
        ...prev,
      ]);
    } else {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const handleToggleTransactionPaid = (id: string) => {
    setTransactions((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const currentlyPending = isTransactionPending(t);
          return {
            ...t,
            isPaid: currentlyPending ? true : false,
          };
        }
        return t;
      })
    );
  };

  const handlePayBill = (billId: string) => {
    const bill = billReminders.find((b) => b.id === billId);
    if (!bill) return;

    if (!bill.isPaid) {
      setBillReminders((prev) =>
        prev.map((b) => (b.id === billId ? { ...b, isPaid: true } : b))
      );

      handleAddTransaction({
        description: `Pagamento: ${bill.title}`,
        amount: bill.amount,
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        category: bill.category || 'Contas Fixas',
        source: 'manual',
        isPaid: true,
      });
    } else {
      setBillReminders((prev) =>
        prev.map((b) => (b.id === billId ? { ...b, isPaid: false } : b))
      );
    }
  };

  const handleAddDepositToGoal = (goalId: string, amount: number) => {
    setSavingGoals((prev) =>
      prev.map((g) =>
        g.id === goalId ? { ...g, currentAmount: g.currentAmount + amount } : g
      )
    );

    const goal = savingGoals.find((g) => g.id === goalId);
    handleAddTransaction({
      description: `Aporte Meta: ${goal?.title || 'Poupança'}`,
      amount,
      date: new Date().toISOString().split('T')[0],
      type: 'investment',
      category: 'Reserva de Emergência',
      source: 'manual',
      isPaid: true,
    });
  };

  const handleAddNewBill = (newBill: BillReminder) => {
    setBillReminders((prev) => [newBill, ...prev]);
  };

  const handleAddNewGoal = (newGoal: SavingGoal) => {
    setSavingGoals((prev) => [newGoal, ...prev]);
  };

  const handleOpenAIChatWithPrompt = (prompt?: string) => {
    setCustomAIChatPrompt(prompt);
    setIsAIChatOpen(true);
  };

  const handleChangeMonth = (direction: 'prev' | 'next') => {
    if (direction === 'prev') {
      setCurrentMonthIndex((prev) => (prev > 0 ? prev - 1 : months.length - 1));
    } else {
      setCurrentMonthIndex((prev) => (prev < months.length - 1 ? prev + 1 : 0));
    }
  };

  const unreadNotificationsCount = notifications.filter((n) => n.unread).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-16 font-sans selection:bg-emerald-500 selection:text-white transition-colors">
      
      {/* Top Header */}
      <Header
        onOpenNewTransaction={() => setIsTypeChoiceModalOpen(true)}
        onOpenNotifications={() => setIsNotificationsOpen(true)}
        unreadNotificationsCount={unreadNotificationsCount}
        onNavigateHome={() => setActiveAppTab('planejamento')}
      />

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 space-y-6 pb-28 sm:pb-32">

        {/* ========================================================================= */}
        {/* ABA 1: TELA INICIAL (SALDO, RECEITAS, SAÍDAS E CONTAS)                    */}
        {/* ========================================================================= */}
        {activeAppTab === 'planejamento' && (
          <div className="space-y-5 animate-fadeIn">

            {/* Seletor de Mês (apenas na tela inicial) - Centralizado */}
            <div className="flex justify-center items-center">
              <div className="flex items-center bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl px-3 py-1.5 shadow-2xs transition-colors">
                <button
                  onClick={() => handleChangeMonth('prev')}
                  className="p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                  title="Mês anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="flex items-center gap-1.5 px-4 text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  <Calendar className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{currentMonth}</span>
                </div>
                <button
                  onClick={() => handleChangeMonth('next')}
                  className="p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-lg transition-colors cursor-pointer"
                  title="Próximo mês"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* 1. Minimalist Total Disponível com Receitas (descontado investimentos) e Saídas */}
            <IntuitiveBalanceHeader
              summary={currentMonthSummary}
            />

            {/* 2. Seção CONTAS com 2 cartões clicáveis Pagar / Receber e Despesas Recentes */}
            <div id="section-contas">
              <ContasSection
                transactions={currentMonthTransactions}
                onSelectTab={handleOpenContasTab}
                onEditTransaction={handleOpenEditTransaction}
              />
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* ABA: CONTAS (PAGAR / RECEBER) EM UMA ABA DEDICADA                       */}
        {/* ========================================================================= */}
        {activeAppTab === 'contas' && (
          <ContasTab
            transactions={currentMonthTransactions}
            currentMonthName={currentMonth}
            mode={contasMode}
            onTogglePaid={handleToggleTransactionPaid}
            onGoBackToPlanning={() => setActiveAppTab('planejamento')}
            onOpenNewTransaction={(type) => {
              setEditingTransaction(null);
              setTransactionModalDefaultType(type);
              setIsTransactionModalOpen(true);
            }}
            onEditTransaction={handleOpenEditTransaction}
            onOpenMonthlyPdfReport={() => setIsMonthlyReportModalOpen(true)}
          />
        )}

        {/* ========================================================================= */}
        {/* ABA 2: BALANCEAMENTO DOS MESES (SETEMBRO vs OUTUBRO vs DEMAIS MESES)     */}
        {/* ========================================================================= */}
        {activeAppTab === 'balanceamento' && (
          <MonthlyBalanceTab
            transactions={transactions}
            months={months}
            currentMonth={currentMonth}
            bankAccounts={bankAccounts}
            onSelectMonth={(monthName) => {
              const idx = months.indexOf(monthName);
              if (idx !== -1) setCurrentMonthIndex(idx);
            }}
            onGoToPlanning={() => setActiveAppTab('planejamento')}
            onCopyMonthContas={handleCopyMonthContas}
            onOpenMonthlyPdfReport={() => setIsMonthlyReportModalOpen(true)}
          />
        )}

        {/* ========================================================================= */}
        {/* ABA 3: HISTÓRICO COMPLETO DE TRANSAÇÕES COM OPÇÃO DE APAGAR HISTÓRICO   */}
        {/* ========================================================================= */}
        {activeAppTab === 'historico' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
                  Histórico de Transações Registradas
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Consulte todos os lançamentos ou filtre pelo mês de referência selecionado.
                </p>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 transition-colors">
                <button
                  onClick={() => setHistoryScope('currentMonth')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    historyScope === 'currentMonth'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Apenas {currentMonth} ({currentMonthTransactions.length})
                </button>
                <button
                  onClick={() => setHistoryScope('all')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    historyScope === 'all'
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  Todos os Meses ({transactions.length})
                </button>
              </div>
            </div>

            <TransactionsList
              transactions={historyScope === 'currentMonth' ? currentMonthTransactions : transactions}
              onDeleteTransaction={handleDeleteTransaction}
              onToggleTransactionPaid={handleToggleTransactionPaid}
              onClearHistory={handleClearHistory}
              onEditTransaction={handleOpenEditTransaction}
              onOpenMonthlyPdfReport={() => setIsMonthlyReportModalOpen(true)}
              currentMonthName={historyScope === 'currentMonth' ? currentMonth : 'Todos os Meses'}
              activeFilter={activeFilter}
              onChangeFilter={setActiveFilter}
            />
          </div>
        )}

      </main>

      {/* Floating Action Button for Gemini AI Assistant (elevado para não sobrepor a barra de navegação inferior) */}
      <div className="fixed bottom-20 right-4 sm:right-6 z-30">
        <button
          id="fab-ai-assistant"
          onClick={() => handleOpenAIChatWithPrompt()}
          className="flex items-center gap-2 px-3.5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-bold rounded-2xl shadow-lg shadow-violet-500/30 hover:scale-102 active:scale-98 transition-all text-xs cursor-pointer"
          title="Falar com Assistente Financeiro IA"
        >
          <Bot className="w-4 h-4" />
          <span className="hidden sm:inline">Assistente IA</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>
      </div>

      {/* Barra de Navegação Inferior Fixa (Ícones Lucide: Casa, Comparativo, (+) Lançar no centro, Pendências e Histórico) */}
      <BottomNavBar
        activeTab={activeAppTab}
        onChangeTab={setActiveAppTab}
        onOpenNewTransaction={() => {
          setEditingTransaction(null);
          setIsTypeChoiceModalOpen(true);
        }}
        onViewPending={handleViewPending}
        pendingCount={pendingTransactions.length}
      />

      {/* Modal de Contas Pendentes (Quadro e Direcionamento de Contas não pagas) */}
      <PendingBillsModal
        isOpen={isPendingModalOpen}
        onClose={() => setIsPendingModalOpen(false)}
        pendingTransactions={pendingTransactions}
        onToggleTransactionPaid={handleToggleTransactionPaid}
        currentMonthName={currentMonth}
      />

      {/* MODALS AND DRAWERS */}

      {/* 0. Modal de Escolha de Tipo: Receita, Gasto ou Investimento */}
      <TransactionTypeChoiceModal
        isOpen={isTypeChoiceModalOpen}
        onClose={() => setIsTypeChoiceModalOpen(false)}
        onSelectType={handleSelectTransactionType}
      />
      
      {/* 1. Transaction Modal (Add Income, Expense or Investment, or Edit Gasto) */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        onAddTransaction={handleAddTransaction}
        onEditTransaction={handleUpdateTransaction}
        onDeleteTransaction={handleDeleteTransaction}
        editingTransaction={editingTransaction}
        defaultType={transactionModalDefaultType}
        defaultDate={`${currentMonthKey}-10`}
        onOpenReceiptScanner={() => setIsReceiptScannerOpen(true)}
      />

      {/* 2. Card Invoice Connection Modal */}
      <CardInvoiceConnectionModal
        isOpen={isCardConnectionOpen}
        onClose={() => setIsCardConnectionOpen(false)}
        cards={bankAccounts}
        onAddCardInvoice={(newCard) => {
          setBankAccounts((prev) => [newCard, ...prev]);
        }}
        onOpenReceiptScanner={() => setIsReceiptScannerOpen(true)}
      />

      {/* 3. Receipt Scanner Modal */}
      <ReceiptScannerModal
        isOpen={isReceiptScannerOpen}
        onClose={() => setIsReceiptScannerOpen(false)}
        onAddTransaction={handleAddTransaction}
      />

      {/* 3. Bank & Credit Card Sync Modal */}
      <BankSyncModal
        isOpen={isBankSyncOpen}
        onClose={() => setIsBankSyncOpen(false)}
        accounts={bankAccounts}
        onSyncAll={async () => {
          setIsSyncing(true);
          await new Promise((resolve) => setTimeout(resolve, 1500));
          setIsSyncing(false);
        }}
        onAddAccount={(newAcc) => setBankAccounts((prev) => [...prev, newAcc])}
      />

      {/* 4. Gemini AI Chat Drawer */}
      <GeminiChatDrawer
        isOpen={isAIChatOpen}
        onClose={() => {
          setIsAIChatOpen(false);
          setCustomAIChatPrompt(undefined);
        }}
        summary={currentMonthSummary}
        initialCustomPrompt={customAIChatPrompt}
      />

      {/* 5. Notifications Drawer */}
      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        notifications={notifications}
        onMarkAllAsRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
        }}
        onOpenAIChat={handleOpenAIChatWithPrompt}
      />

      {/* 6. Monthly Financial Report (PDF) Modal */}
      <MonthlyReportModal
        isOpen={isMonthlyReportModalOpen}
        onClose={() => setIsMonthlyReportModalOpen(false)}
        monthName={currentMonth}
        summary={currentMonthSummary}
        transactions={currentMonthTransactions}
      />

    </div>
  );
}
