import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Calendar, 
  Tag, 
  Building2, 
  AlignLeft,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Plus,
  Check,
  Search,
  ArrowLeft,
  ScanLine,
  ChevronLeft,
  ChevronRight,
  Trash2
} from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { getTodayDateString } from '../utils/finance';
import { cleanInstallmentDescription } from '../utils/dateUtils';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onEditTransaction?: (transaction: Transaction) => void;
  onDeleteTransaction?: (id: string) => void;
  editingTransaction?: Transaction | null;
  defaultType?: TransactionType;
  defaultDate?: string;
  onOpenReceiptScanner?: () => void;
}

const DEFAULT_EXPENSE_CATEGORIES = [
  'Alimentação',
  'Aluguel',
  'Cartão de Crédito',
  'Transporte',
  'Internet',
  'Telefone',
  'Saúde',
  'Lazer',
  'Educação',
  'Contas de Casa',
  'Supermercado',
  'Farmácia',
  'Vestuário',
  'Assinaturas',
  'Outro',
];

const DEFAULT_INCOME_CATEGORIES = [
  'Salário',
  'Freelance',
  'Rendimentos',
  'Vendas',
  'Bônus / PLR',
  'Reembolso',
  'Pró-labore',
  'Outro',
];

const DEFAULT_INVESTMENT_CATEGORIES = [
  'Reserva de Emergência',
  'Tesouro Selic',
  'CDB 100% CDI',
  'Ações / FIIs',
  'Caixinha Nubank',
  'Criptomoeda',
  'Previdência Privada',
  'Outro',
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  editingTransaction,
  defaultType = 'expense',
  defaultDate,
  onOpenReceiptScanner,
}) => {
  const [type, setType] = useState<TransactionType>(defaultType);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('');
  const [bankName, setBankName] = useState('');
  const [descriptionError, setDescriptionError] = useState(false);
  const [bankNameError, setBankNameError] = useState(false);
  const [isPaid, setIsPaid] = useState<boolean>(true);
  const dateInputRef = useRef<HTMLInputElement>(null);

  const formatBRDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length < 3) return dateStr;
    const day = parts[2];
    const m = parseInt(parts[1], 10) - 1;
    const year = parts[0];
    const monthsShort = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    return `${parseInt(day, 10)} ${monthsShort[m] || ''} ${year}`;
  };

  const handleDateChange = (newDateStr: string) => {
    setDate(newDateStr);
    const today = getTodayDateString();
    // Se a data for alterada para depois de hoje, o botão de pago ou recebido NÃO se ativa sem o usuário apertar
    if (newDateStr > today) {
      setIsPaid(false);
    }
  };

  const handleAdjustDay = (delta: number) => {
    const parts = (date || getTodayDateString()).split('-');
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    d.setDate(d.getDate() + delta);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    handleDateChange(`${y}-${m}-${day}`);
  };

  // Categorias personalizadas e modal de categorias
  const [isCategoryPickerOpen, setIsCategoryPickerOpen] = useState(false);
  const [categorySearch, setCategorySearch] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('finance_user_custom_categories');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Calendário interativo (funciona 100% no Vercel, mobile e desktop)
  const [isCustomDatePickerOpen, setIsCustomDatePickerOpen] = useState(false);
  const [calendarViewDate, setCalendarViewDate] = useState(() => {
    const parts = (defaultDate || new Date().toISOString().split('T')[0]).split('-');
    return {
      year: parseInt(parts[0], 10) || new Date().getFullYear(),
      month: (parseInt(parts[1], 10) || (new Date().getMonth() + 1)) - 1
    };
  });

  // Mais detalhes state
  const [showMoreDetails, setShowMoreDetails] = useState<boolean>(false);
  const [repetitionMode, setRepetitionMode] = useState<'uma_vez' | 'parcela' | 'recorrente'>('uma_vez');

  // Parcela state
  const [installmentsCount, setInstallmentsCount] = useState<number>(2);
  const [currentInstallment, setCurrentInstallment] = useState<number>(1);
  const [installmentValueType, setInstallmentValueType] = useState<'total' | 'parcela'>('total');

  // Recorrente state
  const [frequency, setFrequency] = useState<'semanal' | 'quinzenal' | 'mensal' | 'bimestral' | 'personalizar'>('mensal');
  const [customDays, setCustomDays] = useState<string>('30');

  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        setType(editingTransaction.type);
        const cleanDesc = cleanInstallmentDescription(editingTransaction.description || '');
        setDescription(cleanDesc);
        setAmount(editingTransaction.amount ? editingTransaction.amount.toString() : '');
        setCategory(editingTransaction.category || '');
        setBankName(editingTransaction.bankName || '');
        const initialDate = editingTransaction.date || defaultDate || getTodayDateString();
        const today = getTodayDateString();
        setDate(initialDate);
        if (initialDate > today && editingTransaction.isPaid !== true) {
          setIsPaid(false);
        } else {
          setIsPaid(editingTransaction.isPaid !== false);
        }
        const hasExtra = Boolean(editingTransaction.notes || editingTransaction.isRecurring || editingTransaction.recurrence || editingTransaction.installments);
        setShowMoreDetails(hasExtra);
        setRepetitionMode(
          editingTransaction.isRecurring || editingTransaction.recurrence 
            ? 'recorrente' 
            : editingTransaction.installments 
            ? 'parcela' 
            : 'uma_vez'
        );
        if (editingTransaction.installments) {
          setInstallmentsCount(editingTransaction.installments.total || 2);
          setCurrentInstallment(editingTransaction.installments.current || 1);
          setInstallmentValueType(editingTransaction.installments.type || 'total');
        }
        if (editingTransaction.recurrence && editingTransaction.recurrence !== 'nenhuma') {
          setFrequency(editingTransaction.recurrence as any);
        }
        setIsCategoryPickerOpen(false);
        setCategorySearch('');
        setNewCategoryName('');
        setIsCustomDatePickerOpen(false);
        const parts = initialDate.split('-');
        setCalendarViewDate({
          year: parseInt(parts[0], 10) || new Date().getFullYear(),
          month: (parseInt(parts[1], 10) || (new Date().getMonth() + 1)) - 1
        });
      } else {
        setType(defaultType);
        setDescription('');
        setAmount('');
        setCategory('');
        setBankName('');
        const initialDate = defaultDate || getTodayDateString();
        const today = getTodayDateString();
        setDate(initialDate);
        // Se a data inicial for depois de hoje, o botão de pago/recebido não se ativa sem o usuário apertar
        if (initialDate > today) {
          setIsPaid(false);
        } else {
          setIsPaid(true);
        }
        setShowMoreDetails(false);
        setRepetitionMode('uma_vez');
        setInstallmentsCount(2);
        setCurrentInstallment(1);
        setInstallmentValueType('total');
        setFrequency('mensal');
        setCustomDays('30');
        setDescriptionError(false);
        setBankNameError(false);
        setIsCategoryPickerOpen(false);
        setCategorySearch('');
        setNewCategoryName('');
        setIsCustomDatePickerOpen(false);
        const parts = initialDate.split('-');
        setCalendarViewDate({
          year: parseInt(parts[0], 10) || new Date().getFullYear(),
          month: (parseInt(parts[1], 10) || (new Date().getMonth() + 1)) - 1
        });
      }
    }
  }, [defaultType, defaultDate, isOpen, editingTransaction]);

  // Salvar categorias personalizadas no localStorage
  const handleSaveCustomCategory = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!customCategories.includes(trimmed)) {
      const updated = [...customCategories, trimmed];
      setCustomCategories(updated);
      try {
        localStorage.setItem('finance_user_custom_categories', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
    }
    setCategory(trimmed);
    setNewCategoryName('');
    setIsCategoryPickerOpen(false);
  };

  const [viewportMetrics, setViewportMetrics] = useState(() => ({
    height: typeof window !== 'undefined' ? (window.visualViewport?.height || window.innerHeight) : 800,
    offsetTop: 0,
    keyboardHeight: 0,
  }));

  useEffect(() => {
    if (!isOpen) return;

    const handleViewportChange = () => {
      if (typeof window === 'undefined') return;

      if (window.visualViewport) {
        const vv = window.visualViewport;
        const currentHeight = vv.height;
        const offsetTop = vv.offsetTop || 0;
        // Altura do teclado é a diferença entre a altura da janela interna e o visualViewport
        const kb = Math.max(0, window.innerHeight - currentHeight);
        setViewportMetrics({
          height: currentHeight,
          offsetTop,
          keyboardHeight: kb,
        });
      } else {
        setViewportMetrics({
          height: window.innerHeight,
          offsetTop: 0,
          keyboardHeight: 0,
        });
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      window.visualViewport.addEventListener('scroll', handleViewportChange);
      handleViewportChange();
    }
    window.addEventListener('resize', handleViewportChange);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
        window.visualViewport.removeEventListener('scroll', handleViewportChange);
      }
      window.removeEventListener('resize', handleViewportChange);
    };
  }, [isOpen]);

  const isKeyboardOpen = viewportMetrics.keyboardHeight > 60;

  if (!isOpen) return null;

  // Lista combinada de categorias disponíveis para o tipo atual
  const baseCategories = 
    type === 'income' 
      ? DEFAULT_INCOME_CATEGORIES 
      : type === 'investment' 
      ? DEFAULT_INVESTMENT_CATEGORIES 
      : DEFAULT_EXPENSE_CATEGORIES;

  const allAvailableCategories = Array.from(new Set([...baseCategories, ...customCategories]));
  const filteredCategories = allAvailableCategories.filter(c => 
    c.toLowerCase().includes(categorySearch.toLowerCase().trim())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(rawAmount) || rawAmount <= 0) return;

    let hasError = false;
    if (!description.trim()) {
      setDescriptionError(true);
      hasError = true;
    } else {
      setDescriptionError(false);
    }

    if (!bankName.trim()) {
      setBankNameError(true);
      hasError = true;
    } else {
      setBankNameError(false);
    }

    if (hasError) {
      return;
    }

    let finalAmount = rawAmount;
    if (repetitionMode === 'parcela' && installmentValueType === 'total') {
      finalAmount = Number((rawAmount / installmentsCount).toFixed(2));
    }

    const defaultCat = 
      type === 'income' 
        ? 'Salário' 
        : type === 'investment' 
        ? 'Investimento' 
        : 'Geral';
    const finalCategory = category.trim() || defaultCat;
    
    const baseDescription = cleanInstallmentDescription(description.trim());
    let finalDescription = baseDescription;
    if (repetitionMode === 'parcela') {
      finalDescription = `${baseDescription} (${currentInstallment}/${installmentsCount})`;
    }

    const finalBank = bankName.trim();
    const today = getTodayDateString();
    const finalDate = date || today;

    if (editingTransaction && onEditTransaction) {
      onEditTransaction({
        ...editingTransaction,
        description: finalDescription,
        amount: finalAmount,
        date: finalDate,
        type,
        category: finalCategory,
        bankName: finalBank,
        isPaid: isPaid,
        installments: repetitionMode === 'parcela' ? {
          current: currentInstallment,
          total: installmentsCount,
          type: installmentValueType,
        } : undefined,
        recurrence: repetitionMode === 'recorrente' ? frequency : undefined,
        isRecurring: repetitionMode === 'recorrente',
      });
      onClose();
      return;
    }

    onAddTransaction({
      description: finalDescription,
      amount: finalAmount,
      date: finalDate,
      type,
      category: finalCategory,
      source: 'manual',
      bankName: finalBank,
      isPaid: isPaid,
      installments: repetitionMode === 'parcela' ? {
        current: currentInstallment,
        total: installmentsCount,
        type: installmentValueType,
      } : undefined,
      recurrence: repetitionMode === 'recorrente' ? frequency : undefined,
      isRecurring: repetitionMode === 'recorrente',
    });

    onClose();
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-hidden touch-pan-y ${
        isKeyboardOpen ? 'items-start pt-2 sm:pt-4' : 'items-center'
      }`}
      style={{
        top: isKeyboardOpen && viewportMetrics.offsetTop > 0 ? `${viewportMetrics.offsetTop}px` : 0,
        bottom: isKeyboardOpen ? `${viewportMetrics.keyboardHeight}px` : 0,
        height: isKeyboardOpen && viewportMetrics.height > 0 ? `${viewportMetrics.height}px` : '100%',
        transition: 'bottom 0.12s cubic-bezier(0.16, 1, 0.3, 1), height 0.12s cubic-bezier(0.16, 1, 0.3, 1)',
      }}
    >
      <div 
        id="transaction-modal"
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden animate-fadeIn flex flex-col mx-auto transition-all"
        style={{
          maxHeight: isKeyboardOpen && viewportMetrics.height > 0 
            ? `${Math.max(260, viewportMetrics.height - 12)}px` 
            : '92vh',
          height: isKeyboardOpen ? `${Math.max(260, viewportMetrics.height - 12)}px` : undefined,
        }}
      >
        {/* Header - Título centralizado, com ícone < no canto superior esquerdo e escaner no canto superior direito */}
        <div className="relative p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/80 shrink-0">
          {/* Canto superior esquerdo: somente o ícone < para voltar */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors cursor-pointer z-10"
            title="Voltar"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          <div className="absolute inset-x-0 text-center pointer-events-none px-14">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
              {editingTransaction
                ? (editingTransaction.type === 'income' 
                    ? 'Editar Entrada' 
                    : editingTransaction.type === 'investment' 
                    ? 'Editar Investimento' 
                    : 'Editar Saída')
                : (type === 'income' 
                    ? 'Nova Entrada' 
                    : type === 'investment'
                    ? 'Novo Investimento'
                    : 'Nova Saída')}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {editingTransaction
                ? 'Atualize as informações do lançamento'
                : (type === 'income' 
                    ? 'Adicione suas entradas financeiras' 
                    : type === 'investment'
                    ? 'Registre seus aportes e investimentos'
                    : 'Registre suas saídas e contas do mês')}
            </p>
          </div>

          {/* Canto superior direito: escaner de conta ou cupom fiscal (sem o botão de fechar X) */}
          {onOpenReceiptScanner ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenReceiptScanner();
              }}
              className={`p-2 text-slate-500 dark:text-slate-400 rounded-xl transition-colors cursor-pointer z-10 ml-auto ${
                type === 'expense'
                  ? 'hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                  : 'hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
              title="Escanear conta ou cupom fiscal"
            >
              <ScanLine className="w-5 h-5" />
            </button>
          ) : (
            <div className="w-9 h-9" />
          )}
        </div>

        {/* Form Body com Scroll suave */}
        <form onSubmit={handleSubmit} className="relative flex flex-col flex-1 overflow-hidden min-h-0">
          
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto overflow-x-hidden flex-1 pb-24">
          
          {/* Botão de Deslizar: PAGO (para gasto) / RECEBIDO (para receita) */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 rounded-2xl">
            <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              {type === 'income' ? 'Recebido' : type === 'investment' ? 'Aportado' : 'Pago'}
            </span>
            
            {/* Botão para deslizar (Toggle switch) */}
            <button
              type="button"
              role="switch"
              aria-checked={isPaid}
              onClick={() => setIsPaid(!isPaid)}
              className={`relative inline-flex h-6.5 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                isPaid 
                  ? type === 'expense' 
                    ? 'bg-rose-600' 
                    : type === 'investment' 
                    ? 'bg-indigo-600' 
                    : 'bg-emerald-600' 
                  : 'bg-slate-300 dark:bg-slate-700'
              }`}
              title={isPaid ? 'Marcar como pendente' : 'Marcar como concluído'}
            >
              <span
                className={`pointer-events-none inline-block h-5.5 w-5.5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                  isPaid ? 'translate-x-5.5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Amount and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm sm:text-[15px] font-bold text-slate-800 dark:text-slate-200 mb-1.5">
                Valor (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                inputMode="decimal"
                required
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-sm placeholder:text-xs font-bold p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm sm:text-[15px] font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                Data *
              </label>

              {/* Caixa com formato '20 set 2026' e botões (< >) para passar o dia */}
              <div className="relative flex items-center justify-between bg-white dark:bg-slate-800 p-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-slate-900 dark:focus-within:ring-emerald-500 transition-colors">
                {/* Clique no texto/ícone abre o calendário */}
                <div 
                  onClick={() => {
                    const currentParts = (date || new Date().toISOString().split('T')[0]).split('-');
                    setCalendarViewDate({
                      year: parseInt(currentParts[0], 10) || new Date().getFullYear(),
                      month: (parseInt(currentParts[1], 10) || (new Date().getMonth() + 1)) - 1
                    });
                    setIsCustomDatePickerOpen(true);
                    if (dateInputRef.current && 'showPicker' in HTMLInputElement.prototype) {
                      try {
                        dateInputRef.current.showPicker();
                      } catch {
                        // fallback silencioso para o modal customizado
                      }
                    }
                  }}
                  className="flex items-center gap-2 cursor-pointer flex-1 py-0.5"
                  title="Clique para abrir o calendário"
                >
                  <Calendar className={`w-4 h-4 shrink-0 ${
                    type === 'expense' ? 'text-rose-600' : type === 'investment' ? 'text-indigo-600' : 'text-emerald-600'
                  }`} />
                  <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white select-none">
                    {formatBRDisplayDate(date)}
                  </span>
                </div>

                {/* Input nativo invisível */}
                <input
                  ref={dateInputRef}
                  type="date"
                  required
                  value={date}
                  onChange={(e) => handleDateChange(e.target.value)}
                  className="sr-only"
                />

                {/* Ícones (< >) para passar o dia sem precisar do calendário */}
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    type="button"
                    onClick={() => handleAdjustDay(-1)}
                    className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                    title="Dia anterior"
                  >
                    <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustDay(1)}
                    className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                    title="Próximo dia"
                  >
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Description - Obrigatório */}
          <div>
            <label className="block text-sm sm:text-[15px] font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <AlignLeft className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Descrição</span>
                <span className="text-rose-500 text-sm">*</span>
              </span>
              <span className="text-[10px] font-semibold text-rose-500/90 dark:text-rose-400/90 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded">
                Obrigatório
              </span>
            </label>
            <input
              type="text"
              placeholder="Informe a descrição da movimentação (obrigatório)"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (descriptionError) setDescriptionError(false);
              }}
              className={`w-full text-xs placeholder:text-[11.5px] placeholder:text-slate-400 dark:placeholder:text-slate-500 p-2.5 rounded-xl border bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 text-slate-800 dark:text-white transition-colors ${
                descriptionError
                  ? 'border-rose-500 focus:ring-rose-500 bg-rose-50/20 dark:bg-rose-950/20'
                  : 'border-slate-300 dark:border-slate-700 focus:ring-slate-900 dark:focus:ring-emerald-500'
              }`}
            />
            {descriptionError && (
              <span className="text-[11px] font-semibold text-rose-500 mt-1 block">
                Por favor, informe a descrição da movimentação.
              </span>
            )}
          </div>

          {/* Categoria sem escrita direta: clique no campo ou no botão (+) abre as categorias e adicionar categoria */}
          <div>
            <label className="block text-sm sm:text-[15px] font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              Categoria
            </label>

            <div 
              onClick={() => setIsCategoryPickerOpen(true)}
              className="relative flex items-center justify-between bg-white dark:bg-slate-800 p-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 cursor-pointer transition-colors"
              title="Clique para escolher ou adicionar categoria"
            >
              <span className={`text-xs sm:text-sm font-semibold truncate ${category ? 'text-slate-900 dark:text-white' : 'text-slate-400 dark:text-slate-500'}`}>
                {category || 'Selecione uma categoria...'}
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCategoryPickerOpen(true);
                }}
                className={`p-1 text-slate-500 dark:text-slate-400 rounded-lg transition-colors cursor-pointer ml-2 ${
                  type === 'expense'
                    ? 'hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                    : 'hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                }`}
                title="Abrir categorias e adicionar categoria"
              >
                <Plus className={`w-4 h-4 stroke-[2.5] ${
                  type === 'expense' ? 'text-rose-600' : type === 'investment' ? 'text-indigo-600' : 'text-emerald-600'
                }`} />
              </button>
            </div>
          </div>

          {/* Conta / Banco - Obrigatório */}
          <div>
            <label className="block text-sm sm:text-[15px] font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Conta / Banco</span>
                <span className="text-rose-500 text-sm">*</span>
              </span>
              <span className="text-[10px] font-semibold text-rose-500/90 dark:text-rose-400/90 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded">
                Obrigatório
              </span>
            </label>
            <input
              type="text"
              placeholder="Digite o banco ou conta (ex: Nubank, Itaú, Bradesco, Dinheiro...)"
              value={bankName}
              onChange={(e) => {
                setBankName(e.target.value);
                if (bankNameError) setBankNameError(false);
              }}
              className={`w-full text-xs placeholder:text-[11.5px] placeholder:text-slate-400 dark:placeholder:text-slate-500 p-2.5 rounded-xl border bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 text-slate-800 dark:text-white transition-colors ${
                bankNameError
                  ? 'border-rose-500 focus:ring-rose-500 bg-rose-50/20 dark:bg-rose-950/20'
                  : 'border-slate-300 dark:border-slate-700 focus:ring-slate-900 dark:focus:ring-emerald-500'
              }`}
            />
            {bankNameError && (
              <span className="text-[11px] font-semibold text-rose-500 mt-1 block">
                Por favor, informe a conta ou banco.
              </span>
            )}
          </div>

          {/* Seção "Mais detalhes" */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowMoreDetails(!showMoreDetails)}
              className="w-full flex items-center justify-between py-2 text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                <span>Mais detalhes</span>
              </span>
              {showMoreDetails ? (
                <ChevronUp className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400 dark:text-slate-500" />
              )}
            </button>

            {/* Conteúdo de Mais Detalhes: "Uma vez", "Parcela" e "Recorrente" */}
            {showMoreDetails && (
              <div className="mt-2.5 p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-4 animate-in fade-in duration-150">
                
                {/* Abas das opções */}
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-white dark:bg-slate-850 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setRepetitionMode('uma_vez')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      repetitionMode === 'uma_vez'
                        ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Uma vez
                  </button>

                  <button
                    type="button"
                    onClick={() => setRepetitionMode('parcela')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      repetitionMode === 'parcela'
                        ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Parcela
                  </button>

                  <button
                    type="button"
                    onClick={() => setRepetitionMode('recorrente')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      repetitionMode === 'recorrente'
                        ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Recorrente
                  </button>
                </div>

                {/* Sub-opções quando for "Parcela" */}
                {repetitionMode === 'parcela' && (
                  <div className="space-y-3 pt-1 border-t border-slate-200/60 dark:border-slate-700">
                    
                    {/* Parcelas: botões do lado - 2 + */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Parcelas</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const next = Math.max(2, installmentsCount - 1);
                            setInstallmentsCount(next);
                            if (currentInstallment > next) setCurrentInstallment(next);
                          }}
                          className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-base shadow-2xs transition-colors cursor-pointer"
                          title="Diminuir quantidade de parcelas"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-black text-slate-900 dark:text-white text-sm">
                          {installmentsCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => setInstallmentsCount((prev) => prev + 1)}
                          className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-base shadow-2xs transition-colors cursor-pointer"
                          title="Aumentar quantidade de parcelas"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Embaixo: Parcela atual */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Parcela atual</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCurrentInstallment((prev) => Math.max(1, prev - 1))}
                          className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-base shadow-2xs transition-colors cursor-pointer"
                          title="Parcela anterior"
                        >
                          -
                        </button>
                        <span className="min-w-14 text-center font-bold text-slate-900 dark:text-white text-xs">
                          {currentInstallment} de {installmentsCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentInstallment((prev) => Math.min(installmentsCount, prev + 1))}
                          className="w-8 h-8 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-base shadow-2xs transition-colors cursor-pointer"
                          title="Próxima parcela"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Embaixo: Valor informado do lado "Total" "Parcela" */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Valor informado</span>
                      <div className="flex items-center bg-white dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => setInstallmentValueType('total')}
                          className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                            installmentValueType === 'total'
                              ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-2xs'
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          Total
                        </button>
                        <button
                          type="button"
                          onClick={() => setInstallmentValueType('parcela')}
                          className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                            installmentValueType === 'parcela'
                              ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-2xs'
                              : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          Parcela
                        </button>
                      </div>
                    </div>

                  </div>
                )}

                {/* Sub-opções quando for "Recorrente" */}
                {repetitionMode === 'recorrente' && (
                  <div className="space-y-2.5 pt-1 border-t border-slate-200/60 dark:border-slate-700">
                    <span className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Frequência
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(['semanal', 'quinzenal', 'mensal', 'bimestral', 'personalizar'] as const).map((opt) => (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => setFrequency(opt)}
                          className={`px-2.5 py-1 text-xs font-semibold rounded-lg border transition-all cursor-pointer capitalize ${
                            frequency === opt
                              ? 'bg-slate-900 dark:bg-slate-700 text-white border-slate-900 dark:border-slate-700 font-bold shadow-2xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                          }`}
                        >
                          {opt === 'personalizar' ? 'Personalizar' : opt}
                        </button>
                      ))}
                    </div>

                    {frequency === 'personalizar' && (
                      <div className="mt-2 flex items-center gap-2 bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="text-xs text-slate-600 dark:text-slate-300">Repetir a cada</span>
                        <input
                          type="number"
                          min="1"
                          value={customDays}
                          onChange={(e) => setCustomDays(e.target.value)}
                          className="w-16 p-1 text-xs text-center font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-900 dark:text-white rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900 dark:focus:ring-emerald-500"
                        />
                        <span className="text-xs text-slate-600 dark:text-slate-300">dias</span>
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}
          </div>

          </div>

          {/* Action: Ícone circular flutuante idêntico ao da imagem, sem retângulo ou barra, repousando acima do teclado */}
          <div className="absolute bottom-3 sm:bottom-4 inset-x-0 flex items-center justify-center pointer-events-none z-30 px-6">
            {editingTransaction && onDeleteTransaction ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Tem certeza que deseja excluir este lançamento?')) {
                    onDeleteTransaction(editingTransaction.id);
                    onClose();
                  }
                }}
                className="pointer-events-auto absolute left-6 w-11 h-11 rounded-full text-rose-600 dark:text-rose-400 bg-white/95 dark:bg-slate-800/95 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 shadow-lg flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
                title="Excluir este lançamento"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            ) : null}

            <button
              type="submit"
              id="btn-submit-new-transaction"
              className={`pointer-events-auto w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-200 cursor-pointer hover:scale-110 active:scale-95 ${
                type === 'expense'
                  ? 'bg-[#E5536D] hover:bg-[#D4415C] text-white shadow-rose-900/30 ring-4 ring-white/60 dark:ring-slate-900/60'
                  : type === 'investment'
                  ? 'bg-[#5B67F6] hover:bg-[#4955E4] text-white shadow-indigo-900/30 ring-4 ring-white/60 dark:ring-slate-900/60'
                  : 'bg-[#40B5A6] hover:bg-[#349E91] text-white shadow-teal-900/30 ring-4 ring-white/60 dark:ring-slate-900/60'
              }`}
              title={editingTransaction ? 'Salvar alterações' : `Confirmar ${type === 'expense' ? 'Saída' : type === 'investment' ? 'Investimento' : 'Entrada'}`}
            >
              <Check className="w-7 h-7 text-white stroke-[2.75]" />
            </button>
          </div>

        </form>

      </div>

      {/* Modal / Sheet Interno de Seleção e Criação de Categorias */}
      {isCategoryPickerOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-100 overflow-x-hidden">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[85vh] animate-fadeIn transition-colors">
            
            {/* Header do Picker de Categorias */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800">
              <div className="flex items-center gap-2">
                <Tag className={`w-4 h-4 ${type === 'expense' ? 'text-rose-600' : 'text-emerald-600'}`} />
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                  Categorias
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryPickerOpen(false)}
                className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Criar nova categoria */}
            <div className={`p-4 border-b border-slate-100 dark:border-slate-800 space-y-2 ${type === 'expense' ? 'bg-rose-50/50 dark:bg-rose-950/20' : 'bg-emerald-50/50 dark:bg-emerald-950/20'}`}>
              <span className={`text-xs font-extrabold block ${type === 'expense' ? 'text-rose-900 dark:text-rose-300' : 'text-emerald-900 dark:text-emerald-300'}`}>
                Criar nova categoria
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Nome da nova categoria..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSaveCustomCategory(newCategoryName);
                    }
                  }}
                  className={`flex-1 text-xs p-2 rounded-xl bg-white dark:bg-slate-800 text-slate-900 dark:text-white border font-medium focus:outline-hidden focus:ring-2 ${
                    type === 'expense'
                      ? 'border-rose-300 dark:border-rose-800 focus:ring-rose-500'
                      : 'border-emerald-300 dark:border-emerald-800 focus:ring-emerald-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => handleSaveCustomCategory(newCategoryName)}
                  disabled={!newCategoryName.trim()}
                  className={`px-3 py-2 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
                    type === 'expense'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Criar</span>
                </button>
              </div>
            </div>

            {/* Busca de Categorias Existentes */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
                <input
                  type="text"
                  placeholder="Buscar categoria..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full text-xs pl-8.5 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-emerald-500 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Lista de Categorias Disponíveis */}
            <div className="p-4 overflow-y-auto flex-1 space-y-1.5">
              {filteredCategories.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
                  Nenhuma categoria encontrada. Digite acima para criar!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {filteredCategories.map((catName) => {
                    const isSelected = category === catName;
                    return (
                      <button
                        key={catName}
                        type="button"
                        onClick={() => {
                          setCategory(catName);
                          setIsCategoryPickerOpen(false);
                        }}
                        className={`p-2.5 rounded-xl border text-xs font-bold text-left transition-all flex items-center justify-between cursor-pointer ${
                          isSelected
                            ? 'bg-slate-900 dark:bg-slate-700 text-white border-slate-900 dark:border-slate-700 shadow-2xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                        }`}
                      >
                        <span className="truncate">{catName}</span>
                        {isSelected && (
                          <Check className={`w-3.5 h-3.5 shrink-0 ml-1 ${type === 'expense' ? 'text-rose-400' : 'text-emerald-400'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer do Picker */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex justify-end bg-slate-50 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setIsCategoryPickerOpen(false)}
                className="px-4 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/70 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
              >
                Concluir
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Modal de Calendário Direto (Totalmente compatível com Vercel, iOS, Android e Web) */}
      {isCustomDatePickerOpen && (
        <div className="fixed inset-0 z-70 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-100">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col p-4 sm:p-5 animate-fadeIn transition-colors">
            
            {/* Header do Calendário: Mês/Ano e setas para navegar */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setCalendarViewDate(prev => {
                    const newMonth = prev.month - 1;
                    if (newMonth < 0) {
                      return { year: prev.year - 1, month: 11 };
                    }
                    return { year: prev.year, month: newMonth };
                  });
                }}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Mês anterior"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              </button>

              <span className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base capitalize">
                {new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(
                  new Date(calendarViewDate.year, calendarViewDate.month, 1)
                )}
              </span>

              <button
                type="button"
                onClick={() => {
                  setCalendarViewDate(prev => {
                    const newMonth = prev.month + 1;
                    if (newMonth > 11) {
                      return { year: prev.year + 1, month: 0 };
                    }
                    return { year: prev.year, month: newMonth };
                  });
                }}
                className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                title="Próximo mês"
              >
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Dias da semana */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((dayChar, i) => (
                <span key={i} className="text-[11px] font-bold text-slate-400 dark:text-slate-500 py-1">
                  {dayChar}
                </span>
              ))}
            </div>

            {/* Grade de dias */}
            <div className="grid grid-cols-7 gap-1 text-center">
              {(() => {
                const year = calendarViewDate.year;
                const month = calendarViewDate.month;
                const firstDayOfWeek = new Date(year, month, 1).getDay();
                const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
                const cells = [];

                // Células vazias antes do primeiro dia
                for (let i = 0; i < firstDayOfWeek; i++) {
                  cells.push(<div key={`empty-${i}`} className="h-9" />);
                }

                // Células dos dias do mês
                for (let d = 1; d <= totalDaysInMonth; d++) {
                  const mStr = String(month + 1).padStart(2, '0');
                  const dStr = String(d).padStart(2, '0');
                  const dateIso = `${year}-${mStr}-${dStr}`;
                  const isSelected = date === dateIso;

                  cells.push(
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        handleDateChange(dateIso);
                        setIsCustomDatePickerOpen(false);
                      }}
                      className={`h-9 w-9 mx-auto rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                        isSelected
                          ? type === 'expense'
                            ? 'bg-rose-600 text-white shadow-xs scale-105 font-black'
                            : type === 'investment'
                            ? 'bg-indigo-600 text-white shadow-xs scale-105 font-black'
                            : 'bg-emerald-600 text-white shadow-xs scale-105 font-black'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      {d}
                    </button>
                  );
                }

                return cells;
              })()}
            </div>

            {/* Footer com botão "Hoje" e fechar */}
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const todayIso = getTodayDateString();
                  handleDateChange(todayIso);
                  setIsCustomDatePickerOpen(false);
                }}
                className={`text-xs font-bold transition-colors cursor-pointer ${
                  type === 'expense'
                    ? 'text-rose-600 hover:text-rose-700 dark:text-rose-400'
                    : 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400'
                }`}
              >
                Hoje
              </button>

              <button
                type="button"
                onClick={() => setIsCustomDatePickerOpen(false)}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
