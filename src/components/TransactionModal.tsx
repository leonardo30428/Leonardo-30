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
  Trash2,
  Calculator,
  AlertCircle,
  Utensils,
  ShoppingCart,
  Home,
  Car,
  Heart,
  Briefcase,
  GraduationCap,
  Plane,
  Dumbbell,
  Coffee,
  Smartphone,
  Gift,
  Dog,
  DollarSign,
  CreditCard,
  Music,
  Film,
  Sparkles
} from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { getTodayDateString, formatCurrencyInput, numericToMaskedString } from '../utils/finance';
import { cleanInstallmentDescription } from '../utils/dateUtils';
import { QuickCalculatorModal } from './QuickCalculatorModal';

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

// Cores opacas, foscas e sofisticadas para categorias
export const CATEGORY_COLORS = [
  { name: 'Ardósia', hex: '#475569' },
  { name: 'Grafite', hex: '#334155' },
  { name: 'Verde Sálvia', hex: '#2e5a44' },
  { name: 'Petróleo', hex: '#27525b' },
  { name: 'Azul Aço', hex: '#2b4c6f' },
  { name: 'Índigo Fosco', hex: '#3730a3' },
  { name: 'Ameixa', hex: '#582c4d' },
  { name: 'Terracota', hex: '#873d32' },
  { name: 'Mostarda Queimado', hex: '#855923' },
  { name: 'Oliva', hex: '#445135' },
];

// Ícones variados para categorias
export const CATEGORY_ICONS = [
  { id: 'Utensils', label: 'Alimentação' },
  { id: 'ShoppingCart', label: 'Compras' },
  { id: 'Home', label: 'Moradia' },
  { id: 'Car', label: 'Transporte' },
  { id: 'Heart', label: 'Saúde' },
  { id: 'Briefcase', label: 'Trabalho' },
  { id: 'GraduationCap', label: 'Educação' },
  { id: 'Plane', label: 'Viagem' },
  { id: 'Dumbbell', label: 'Fitness' },
  { id: 'Coffee', label: 'Lazer' },
  { id: 'Smartphone', label: 'Tecnologia' },
  { id: 'Gift', label: 'Presente' },
  { id: 'Dog', label: 'Pet' },
  { id: 'DollarSign', label: 'Finanças' },
  { id: 'PiggyBank', label: 'Economia' },
  { id: 'CreditCard', label: 'Cartão' },
  { id: 'Music', label: 'Música' },
  { id: 'Film', label: 'Cinema' },
  { id: 'Sparkles', label: 'Geral' },
  { id: 'Tag', label: 'Outros' },
];

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
  const [formWarningMessage, setFormWarningMessage] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState<boolean>(true);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const formScrollRef = useRef<HTMLDivElement>(null);
  const moreDetailsRef = useRef<HTMLDivElement>(null);

  // Estados da nova aba de criação de categoria
  const [categoryModalView, setCategoryModalView] = useState<'list' | 'create'>('list');
  const [newCatName, setNewCatName] = useState('');
  const [newCatType, setNewCatType] = useState<TransactionType>(defaultType);
  const [newCatColor, setNewCatColor] = useState<string>(CATEGORY_COLORS[0].hex);
  const [newCatIcon, setNewCatIcon] = useState<string>('Tag');

  const renderCategoryIcon = (iconId: string, className = "w-5 h-5") => {
    switch (iconId) {
      case 'Utensils': return <Utensils className={className} />;
      case 'ShoppingCart': return <ShoppingCart className={className} />;
      case 'Home': return <Home className={className} />;
      case 'Car': return <Car className={className} />;
      case 'Heart': return <Heart className={className} />;
      case 'Briefcase': return <Briefcase className={className} />;
      case 'GraduationCap': return <GraduationCap className={className} />;
      case 'Plane': return <Plane className={className} />;
      case 'Dumbbell': return <Dumbbell className={className} />;
      case 'Coffee': return <Coffee className={className} />;
      case 'Smartphone': return <Smartphone className={className} />;
      case 'Gift': return <Gift className={className} />;
      case 'Dog': return <Dog className={className} />;
      case 'DollarSign': return <DollarSign className={className} />;
      case 'PiggyBank': return <PiggyBank className={className} />;
      case 'CreditCard': return <CreditCard className={className} />;
      case 'Music': return <Music className={className} />;
      case 'Film': return <Film className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      default: return <Tag className={className} />;
    }
  };

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

  // Rolar suavemente quando abrir 'Mais detalhes' para que as opções fiquem visíveis imediatamente sem precisar rolar para cima
  useEffect(() => {
    if (showMoreDetails && moreDetailsRef.current) {
      const timer = setTimeout(() => {
        moreDetailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [showMoreDetails]);

  useEffect(() => {
    if (isOpen) {
      if (editingTransaction) {
        setType(editingTransaction.type);
        const cleanDesc = cleanInstallmentDescription(editingTransaction.description || '');
        setDescription(cleanDesc);
        setAmount(editingTransaction.amount ? numericToMaskedString(editingTransaction.amount) : '');
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
        setFormWarningMessage(null);
        setIsCategoryPickerOpen(false);
        setCategoryModalView('list');
        setCategorySearch('');
        setNewCategoryName('');
        setNewCatName('');
        setIsCustomDatePickerOpen(false);
        const parts = initialDate.split('-');
        setCalendarViewDate({
          year: parseInt(parts[0], 10) || new Date().getFullYear(),
          month: (parseInt(parts[1], 10) || (new Date().getMonth() + 1)) - 1
        });
      }
    }
  }, [defaultType, defaultDate, isOpen, editingTransaction]);

  // Salvar categorias personalizadas com metadados (tipo, cor e ícone)
  const handleSaveCustomCategoryRich = (
    name: string, 
    catType: TransactionType = type, 
    catColor: string = CATEGORY_COLORS[0].hex, 
    catIcon: string = 'Tag'
  ) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (!customCategories.includes(trimmed)) {
      const updated = [...customCategories, trimmed];
      setCustomCategories(updated);
      try {
        localStorage.setItem('finance_user_custom_categories', JSON.stringify(updated));
        const metaRaw = localStorage.getItem('finance_user_custom_categories_metadata');
        const meta = metaRaw ? JSON.parse(metaRaw) : {};
        meta[trimmed] = { type: catType, color: catColor, icon: catIcon };
        localStorage.setItem('finance_user_custom_categories_metadata', JSON.stringify(meta));
      } catch (e) {
        console.error(e);
      }
    }
    setCategory(trimmed);
    setNewCatName('');
  };

  const handleSaveCustomCategory = (name: string) => {
    handleSaveCustomCategoryRich(name, type, newCatColor, newCatIcon);
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
    const rawAmount = parseFloat(amount.replace(/\./g, '').replace(',', '.'));
    if (isNaN(rawAmount) || rawAmount <= 0) {
      setFormWarningMessage('Por favor, informe um valor válido maior que zero.');
      return;
    }

    const isDescEmpty = !description.trim();
    const isBankEmpty = !bankName.trim();

    if (isDescEmpty && isBankEmpty) {
      setDescriptionError(true);
      setBankNameError(true);
      setFormWarningMessage('Por favor, preencha a Descrição e a Conta / Banco para continuar.');
      return;
    }

    if (isDescEmpty) {
      setDescriptionError(true);
      setBankNameError(false);
      setFormWarningMessage('Por favor, preencha a Descrição para continuar.');
      return;
    }

    if (isBankEmpty) {
      setDescriptionError(false);
      setBankNameError(true);
      setFormWarningMessage('Por favor, preencha a Conta / Banco para continuar.');
      return;
    }

    setDescriptionError(false);
    setBankNameError(false);
    setFormWarningMessage(null);

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
            : 'min(94dvh, 720px)',
          height: isKeyboardOpen ? `${Math.max(260, viewportMetrics.height - 12)}px` : undefined,
        }}
      >
        {/* Header - Título centralizado, com ícone < no canto superior esquerdo e escaner no canto superior direito */}
        <div className="relative px-4 py-2.5 sm:px-5 sm:py-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/80 shrink-0">
          {/* Canto superior esquerdo: somente o ícone < para voltar */}
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-200/70 dark:hover:bg-slate-700 transition-colors cursor-pointer z-10"
            title="Voltar"
          >
            <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
          </button>

          <div className="absolute inset-x-0 text-center pointer-events-none px-12">
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
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
          </div>

          {/* Canto superior direito: escaner de conta ou cupom fiscal (sem o botão de fechar X) */}
          {onOpenReceiptScanner ? (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenReceiptScanner();
              }}
              className={`p-1.5 text-slate-500 dark:text-slate-400 rounded-xl transition-colors cursor-pointer z-10 ml-auto ${
                type === 'expense'
                  ? 'hover:text-rose-700 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                  : 'hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
              title="Escanear conta ou cupom fiscal"
            >
              <ScanLine className="w-4.5 h-4.5" />
            </button>
          ) : (
            <div className="w-8 h-8" />
          )}
        </div>

        {/* Form Body com Scroll suave e layout compacto para caber de ponta a ponta na tela */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          
          <div 
            ref={formScrollRef}
            className="p-3.5 sm:p-5 space-y-2.5 sm:space-y-3 overflow-y-auto overflow-x-hidden flex-1 min-h-0"
          >

          {/* Aviso quando o usuário tenta adicionar sem preencher os campos necessários */}
          {formWarningMessage && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs font-bold animate-fadeIn">
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{formWarningMessage}</span>
            </div>
          )}
          
          {/* Botão de Deslizar: PAGO (para gasto) / RECEBIDO (para receita) */}
          <div className="flex items-center justify-between py-1.5 px-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700/80 rounded-xl">
            <span className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
              {type === 'income' ? 'Recebido' : type === 'investment' ? 'Aportado' : 'Pago'}
            </span>
            
            {/* Botão para deslizar (Toggle switch) */}
            <button
              type="button"
              role="switch"
              aria-checked={isPaid}
              onClick={() => setIsPaid(!isPaid)}
              className={`relative inline-flex h-5.5 w-10.5 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                isPaid 
                  ? type === 'expense' 
                    ? 'bg-[#be4357]' 
                    : type === 'investment' 
                    ? 'bg-[#43529c]' 
                    : 'bg-[#278672]' 
                  : 'bg-slate-300 dark:bg-slate-700'
              }`}
              title={isPaid ? 'Marcar como pendente' : 'Marcar como concluído'}
            >
              <span
                className={`pointer-events-none inline-block h-4.5 w-4.5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                  isPaid ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Amount and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                Valor (R$)
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 select-none">
                  R$
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  required
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => {
                    const { display } = formatCurrencyInput(e.target.value);
                    setAmount(display);
                    if (formWarningMessage) setFormWarningMessage(null);
                  }}
                  className="w-full text-xs sm:text-sm font-bold pl-8.5 pr-9 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-slate-900 dark:focus:ring-emerald-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setIsCalculatorOpen(true)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                  title="Abrir calculadora"
                  aria-label="Calculadora"
                >
                  <Calculator className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                Data
              </label>

              {/* Caixa com formato '20 set 2026' e botões (< >) para passar o dia */}
              <div className="relative flex items-center justify-between bg-white dark:bg-slate-800 py-1.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 focus-within:ring-2 focus-within:ring-slate-900 dark:focus-within:ring-emerald-500 transition-colors">
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
                  <Calendar className={`w-3.5 h-3.5 shrink-0 ${
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
                <div className="flex items-center gap-0.5 shrink-0 ml-1">
                  <button
                    type="button"
                    onClick={() => handleAdjustDay(-1)}
                    className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                    title="Dia anterior"
                  >
                    <ChevronLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustDay(1)}
                    className="p-1 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
                    title="Próximo dia"
                  >
                    <ChevronRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
              <AlignLeft className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Descrição</span>
            </label>
            <input
              type="text"
              placeholder="Informe a descrição da movimentação"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                if (descriptionError) setDescriptionError(false);
                if (formWarningMessage) setFormWarningMessage(null);
              }}
              className={`w-full text-xs placeholder:text-[11.5px] placeholder:text-slate-400 dark:placeholder:text-slate-500 py-2 px-3 rounded-xl border bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 text-slate-800 dark:text-white transition-colors ${
                descriptionError
                  ? 'border-rose-400/80 focus:ring-rose-400/60 bg-rose-50/20 dark:bg-rose-950/20'
                  : 'border-slate-300 dark:border-slate-700 focus:ring-slate-900 dark:focus:ring-emerald-500'
              }`}
            />
          </div>

          {/* Categoria sem escrita direta: clique no campo ou no botão (+) abre as categorias e adicionar categoria */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Categoria</span>
            </label>

            <div 
              onClick={() => setIsCategoryPickerOpen(true)}
              className="relative flex items-center justify-between bg-white dark:bg-slate-800 py-2 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-600 cursor-pointer transition-colors"
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
                <Plus className={`w-3.5 h-3.5 stroke-[2.5] ${
                  type === 'expense' ? 'text-rose-600' : type === 'investment' ? 'text-indigo-600' : 'text-emerald-600'
                }`} />
              </button>
            </div>
          </div>

          {/* Conta / Banco */}
          <div>
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Conta / Banco</span>
            </label>
            <input
              type="text"
              placeholder="Digite o banco ou conta (ex: Nubank, Itaú, Bradesco, Dinheiro...)"
              value={bankName}
              onChange={(e) => {
                setBankName(e.target.value);
                if (bankNameError) setBankNameError(false);
                if (formWarningMessage) setFormWarningMessage(null);
              }}
              className={`w-full text-xs placeholder:text-[11.5px] placeholder:text-slate-400 dark:placeholder:text-slate-500 py-2 px-3 rounded-xl border bg-white dark:bg-slate-800 focus:outline-hidden focus:ring-2 text-slate-800 dark:text-white transition-colors ${
                bankNameError
                  ? 'border-rose-400/80 focus:ring-rose-400/60 bg-rose-50/20 dark:bg-rose-950/20'
                  : 'border-slate-300 dark:border-slate-700 focus:ring-slate-900 dark:focus:ring-emerald-500'
              }`}
            />
          </div>

          {/* Seção "Mais detalhes" */}
          <div ref={moreDetailsRef} className="pt-1.5 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setShowMoreDetails(!showMoreDetails)}
              className="w-full flex items-center justify-between py-1.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
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
              <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3 animate-in fade-in duration-150">
                
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
                  <div className="space-y-2.5 pt-1 border-t border-slate-200/60 dark:border-slate-700">
                    
                    {/* Parcelas: botões do lado - 2 + */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Parcelas</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            const next = Math.max(2, installmentsCount - 1);
                            setInstallmentsCount(next);
                            if (currentInstallment > next) setCurrentInstallment(next);
                          }}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-sm shadow-2xs transition-colors cursor-pointer"
                          title="Diminuir quantidade de parcelas"
                        >
                          -
                        </button>
                        <span className="w-7 text-center font-black text-slate-900 dark:text-white text-xs sm:text-sm">
                          {installmentsCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => setInstallmentsCount((prev) => prev + 1)}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-sm shadow-2xs transition-colors cursor-pointer"
                          title="Aumentar quantidade de parcelas"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Embaixo: Parcela atual */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Parcela atual</span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => setCurrentInstallment((prev) => Math.max(1, prev - 1))}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-sm shadow-2xs transition-colors cursor-pointer"
                          title="Parcela anterior"
                        >
                          -
                        </button>
                        <span className="min-w-12 text-center font-bold text-slate-900 dark:text-white text-xs">
                          {currentInstallment} de {installmentsCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentInstallment((prev) => Math.min(installmentsCount, prev + 1))}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-sm shadow-2xs transition-colors cursor-pointer"
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
                          className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
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
                          className={`px-2.5 py-0.5 text-xs font-bold rounded-md transition-all cursor-pointer ${
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
                  <div className="space-y-2 pt-1 border-t border-slate-200/60 dark:border-slate-700">
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
                      <div className="mt-1.5 flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                        <span className="text-xs text-slate-600 dark:text-slate-300">Repetir a cada</span>
                        <input
                          type="number"
                          min="1"
                          value={customDays}
                          onChange={(e) => setCustomDays(e.target.value)}
                          className="w-14 p-1 text-xs text-center font-bold border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-850 text-slate-900 dark:text-white rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900 dark:focus:ring-emerald-500"
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

          {/* Action Footer: Botões sempre visíveis na tela sem sobrepor campos */}
          <div className="shrink-0 px-4 py-2.5 sm:py-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-center relative z-20">
            {editingTransaction && onDeleteTransaction ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Tem certeza que deseja excluir este lançamento?')) {
                    onDeleteTransaction(editingTransaction.id);
                    onClose();
                  }
                }}
                className="absolute left-4 sm:left-6 w-10 h-10 rounded-full text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900/60 shadow-md flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
                title="Excluir este lançamento"
              >
                <Trash2 className="w-4.5 h-4.5" />
              </button>
            ) : null}

            <button
              type="submit"
              id="btn-submit-new-transaction"
              className={`w-12 h-12 sm:w-13 sm:h-13 rounded-full flex items-center justify-center shadow-md transition-all duration-200 cursor-pointer hover:scale-105 active:scale-95 ${
                type === 'expense'
                  ? 'bg-[#b84357] hover:bg-[#a6394c] text-white shadow-rose-950/20 ring-4 ring-white/60 dark:ring-slate-900/60'
                  : type === 'investment'
                  ? 'bg-[#43529c] hover:bg-[#394685] text-white shadow-indigo-950/20 ring-4 ring-white/60 dark:ring-slate-900/60'
                  : 'bg-[#278672] hover:bg-[#206f5e] text-white shadow-teal-950/20 ring-4 ring-white/60 dark:ring-slate-900/60'
              }`}
              title={editingTransaction ? 'Salvar alterações' : `Confirmar ${type === 'expense' ? 'Saída' : type === 'investment' ? 'Investimento' : 'Entrada'}`}
            >
              <Check className="w-6.5 h-6.5 text-white stroke-[2.75]" />
            </button>
          </div>

        </form>

      </div>

      {/* Modal / Sheet Interno de Seleção e Criação de Categorias */}
      {isCategoryPickerOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-100 overflow-x-hidden">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[88vh] animate-fadeIn transition-colors">
            
            {categoryModalView === 'list' ? (
              <>
                {/* Header do Picker de Categorias (Lista) */}
                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-slate-600 dark:text-slate-300" />
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

                {/* Linha: Criar nova categoria (texto à esquerda e ícone +) */}
                <div 
                  onClick={() => {
                    setNewCatName('');
                    setNewCatType(type);
                    setCategoryModalView('create');
                  }}
                  className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer transition-colors group"
                >
                  <span className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-200">
                    Criar nova categoria
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setNewCatName('');
                      setNewCatType(type);
                      setCategoryModalView('create');
                    }}
                    className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 group-hover:bg-slate-200 dark:group-hover:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                    title="Criar nova categoria"
                    aria-label="Criar nova categoria"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>

                {/* Busca de Categorias Existentes */}
                <div className="p-3 sm:p-4 border-b border-slate-100 dark:border-slate-800">
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
                      Nenhuma categoria encontrada. Clique em &quot;Criar nova categoria&quot; acima!
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
                              <Check className="w-3.5 h-3.5 shrink-0 ml-1 text-slate-300" />
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
              </>
            ) : (
              <>
                {/* Nova Aba de Criação de Categoria */}
                {/* Header */}
                <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setCategoryModalView('list')}
                    className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Voltar para a lista"
                  >
                    <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
                  </button>
                  <h4 className="font-extrabold text-slate-900 dark:text-white text-sm sm:text-base">
                    Nova categoria
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsCategoryPickerOpen(false)}
                    className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                    title="Fechar"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Corpo da Nova Aba */}
                <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1">
                  
                  {/* Ícone da categoria e do lado para adicionar o nome */}
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
                    <div 
                      className="w-13 h-13 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs transition-all"
                      style={{ backgroundColor: newCatColor }}
                      title="Pré-visualização do ícone"
                    >
                      {renderCategoryIcon(newCatIcon, "w-6 h-6")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                        Nome da categoria
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Supermercado, Aluguel, Freelance..."
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && newCatName.trim()) {
                            e.preventDefault();
                            const name = newCatName.trim();
                            handleSaveCustomCategoryRich(name, newCatType, newCatColor, newCatIcon);
                            setCategory(name);
                            setIsCategoryPickerOpen(false);
                            setCategoryModalView('list');
                          }
                        }}
                        className="w-full text-xs sm:text-sm font-semibold p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-slate-700 dark:focus:ring-slate-500 transition-colors"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Embaixo: Tipo da categoria se é saída ou entrada */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Tipo da categoria
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setNewCatType('expense')}
                        className={`py-2 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          newCatType === 'expense'
                            ? 'bg-rose-950/25 dark:bg-rose-950/40 text-rose-300 border-rose-800/80 ring-1 ring-rose-700/50'
                            : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
                        <span>Saída</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setNewCatType('income')}
                        className={`py-2 px-3 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          newCatType === 'income'
                            ? 'bg-emerald-950/25 dark:bg-emerald-950/40 text-emerald-300 border-emerald-800/80 ring-1 ring-emerald-700/50'
                            : 'bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Entrada</span>
                      </button>
                    </div>
                  </div>

                  {/* Embaixo ainda a cor (paleta opaca e sofisticada) */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Cor
                    </label>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5">
                      {CATEGORY_COLORS.map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setNewCatColor(c.hex)}
                          className={`w-7.5 h-7.5 rounded-full shrink-0 flex items-center justify-center transition-all cursor-pointer ${
                            newCatColor === c.hex ? 'ring-2 ring-offset-2 ring-slate-700 dark:ring-slate-300 scale-105' : 'hover:scale-105 opacity-85 hover:opacity-100'
                          }`}
                          style={{ backgroundColor: c.hex }}
                          title={c.name}
                        >
                          {newCatColor === c.hex && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* E em embaixo o ícone da categoria */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      Ícone da categoria
                    </label>
                    <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto p-1.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/60 dark:border-slate-700/60">
                      {CATEGORY_ICONS.map((item) => {
                        const isSelected = newCatIcon === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => setNewCatIcon(item.id)}
                            className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-slate-800 text-white shadow-xs'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60'
                            }`}
                            title={item.label}
                          >
                            {renderCategoryIcon(item.id, "w-4 h-4")}
                            <span className="text-[9px] font-semibold truncate w-full text-center">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </div>

                {/* Footer da Nova Aba */}
                <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2 bg-slate-50 dark:bg-slate-800">
                  <button
                    type="button"
                    onClick={() => setCategoryModalView('list')}
                    className="px-3.5 py-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="button"
                    disabled={!newCatName.trim()}
                    onClick={() => {
                      const name = newCatName.trim();
                      if (!name) return;
                      handleSaveCustomCategoryRich(name, newCatType, newCatColor, newCatIcon);
                      setCategory(name);
                      setIsCategoryPickerOpen(false);
                      setCategoryModalView('list');
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-xs font-extrabold rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    Criar categoria
                  </button>
                </div>
              </>
            )}

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

      {/* Modal da Calculadora Integrada ao Campo de Valor */}
      <QuickCalculatorModal
        isOpen={isCalculatorOpen}
        initialValue={amount}
        onClose={() => setIsCalculatorOpen(false)}
        onChangeLive={(liveVal) => {
          setAmount(liveVal);
        }}
        onApply={(calculatedValue) => {
          setAmount(calculatedValue);
        }}
      />

    </div>
  );
};
