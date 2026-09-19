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

  const handleAdjustDay = (delta: number) => {
    const parts = (date || new Date().toISOString().split('T')[0]).split('-');
    const d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    d.setDate(d.getDate() + delta);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setDate(`${y}-${m}-${day}`);
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
        setDescription(editingTransaction.description || '');
        setAmount(editingTransaction.amount ? editingTransaction.amount.toString() : '');
        setCategory(editingTransaction.category || '');
        setBankName(editingTransaction.bankName || '');
        setDate(editingTransaction.date || defaultDate || new Date().toISOString().split('T')[0]);
        setIsPaid(editingTransaction.isPaid !== false);
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
        const initialDate = editingTransaction.date || defaultDate || new Date().toISOString().split('T')[0];
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
        setDate(defaultDate || new Date().toISOString().split('T')[0]);
        setIsPaid(true);
        setShowMoreDetails(false);
        setRepetitionMode('uma_vez');
        setInstallmentsCount(2);
        setCurrentInstallment(1);
        setInstallmentValueType('total');
        setFrequency('mensal');
        setCustomDays('30');
        setIsCategoryPickerOpen(false);
        setCategorySearch('');
        setNewCategoryName('');
        setIsCustomDatePickerOpen(false);
        const initialDate = defaultDate || new Date().toISOString().split('T')[0];
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

  const [viewportBottomOffset, setViewportBottomOffset] = useState<number>(0);

  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      if (window.visualViewport) {
        // Quantidade de pixels ocupada pelo teclado virtual na parte inferior da tela
        const offset = Math.max(0, window.innerHeight - window.visualViewport.height - window.visualViewport.offsetTop);
        setViewportBottomOffset(offset);
      }
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize);
      window.visualViewport.addEventListener('scroll', handleResize);
      handleResize();
    }

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize);
        window.visualViewport.removeEventListener('scroll', handleResize);
      }
    };
  }, [isOpen]);

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
    
    let finalDescription = description.trim() || finalCategory;
    if (repetitionMode === 'parcela') {
      finalDescription = `${finalDescription} (${currentInstallment}/${installmentsCount})`;
    }

    const finalBank = bankName.trim() || 'Conta Principal';
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-x-hidden touch-pan-y"
      style={{
        paddingBottom: viewportBottomOffset > 0 ? `${viewportBottomOffset + 12}px` : undefined,
        transition: 'padding-bottom 0.15s ease-out',
      }}
    >
      <div 
        id="transaction-modal"
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col mx-auto"
      >
        {/* Header - Título centralizado, com ícone < no canto superior esquerdo e escaner no canto superior direito */}
        <div className="relative p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          {/* Canto superior esquerdo: somente o ícone < para voltar */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-200/70 transition-colors cursor-pointer z-10"
            title="Voltar"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          <div className="absolute inset-x-0 text-center pointer-events-none px-14">
            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
              {editingTransaction
                ? (editingTransaction.type === 'income' 
                    ? 'Editar receita' 
                    : editingTransaction.type === 'investment' 
                    ? 'Editar investimento' 
                    : 'Editar gasto')
                : (type === 'income' 
                    ? 'Nova Receita' 
                    : type === 'investment'
                    ? 'Novo Investimento'
                    : 'Novo Gasto')}
            </h3>
            <p className="text-xs text-slate-500 truncate mt-0.5">
              {editingTransaction
                ? 'Atualize as informações do seu gasto'
                : (type === 'income' 
                    ? 'Adicione seus ganhos ou entradas financeiras' 
                    : type === 'investment'
                    ? 'Registre seus aportes e investimentos'
                    : 'Registre seus gastos e contas do mês')}
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
              className={`p-2 text-slate-500 rounded-xl transition-colors cursor-pointer z-10 ml-auto ${
                type === 'expense'
                  ? 'hover:text-rose-700 hover:bg-rose-50'
                  : 'hover:text-emerald-700 hover:bg-emerald-50'
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
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0">
          
          <div className="p-5 sm:p-6 space-y-4 overflow-y-auto overflow-x-hidden flex-1">
          
          {/* Botão de Deslizar: PAGO (para gasto) / RECEBIDO (para receita) */}
          <div className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/90 rounded-2xl">
            <span className="text-sm sm:text-base font-extrabold text-slate-900">
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
                  : 'bg-slate-300'
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
              <label className="block text-sm sm:text-[15px] font-bold text-slate-800 mb-1.5">
                Valor (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full text-sm placeholder:text-xs font-bold p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div>
              <label className="block text-sm sm:text-[15px] font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-500" />
                Data *
              </label>

              {/* Caixa com formato '20 set 2026' e botões (< >) para passar o dia */}
              <div className="relative flex items-center justify-between bg-white p-2 px-3 rounded-xl border border-slate-300 focus-within:ring-2 focus-within:ring-slate-900">
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
                  <span className="text-xs sm:text-sm font-bold text-slate-900 select-none">
                    {formatBRDisplayDate(date)}
                  </span>
                </div>

                {/* Input nativo invisível */}
                <input
                  ref={dateInputRef}
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="sr-only"
                />

                {/* Ícones (< >) para passar o dia sem precisar do calendário */}
                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    type="button"
                    onClick={() => handleAdjustDay(-1)}
                    className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Dia anterior"
                  >
                    <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleAdjustDay(1)}
                    className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    title="Próximo dia"
                  >
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Description - Título "Descrição" e placeholder "Descrição opcional" */}
          <div>
            <label className="block text-sm sm:text-[15px] font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <AlignLeft className="w-4 h-4 text-slate-500" />
              Descrição
            </label>
            <input
              type="text"
              placeholder="Descrição opcional"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs placeholder:text-[11.5px] placeholder:text-slate-400 p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-slate-900 text-slate-800"
            />
          </div>

          {/* Categoria sem escrita direta: clique no campo ou no botão (+) abre as categorias e adicionar categoria */}
          <div>
            <label className="block text-sm sm:text-[15px] font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-slate-500" />
              Categoria
            </label>

            <div 
              onClick={() => setIsCategoryPickerOpen(true)}
              className="relative flex items-center justify-between bg-white p-2.5 px-3 rounded-xl border border-slate-300 hover:border-slate-400 cursor-pointer transition-colors"
              title="Clique para escolher ou adicionar categoria"
            >
              <span className={`text-xs sm:text-sm font-semibold truncate ${category ? 'text-slate-900' : 'text-slate-400'}`}>
                {category || 'Selecione uma categoria...'}
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCategoryPickerOpen(true);
                }}
                className={`p-1 text-slate-500 rounded-lg transition-colors cursor-pointer ml-2 ${
                  type === 'expense'
                    ? 'hover:text-rose-700 hover:bg-rose-50'
                    : 'hover:text-emerald-700 hover:bg-emerald-50'
                }`}
                title="Abrir categorias e adicionar categoria"
              >
                <Plus className={`w-4 h-4 stroke-[2.5] ${
                  type === 'expense' ? 'text-rose-600' : type === 'investment' ? 'text-indigo-600' : 'text-emerald-600'
                }`} />
              </button>
            </div>
          </div>

          {/* Conta / Banco */}
          <div>
            <label className="block text-sm sm:text-[15px] font-bold text-slate-800 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-500" />
                Conta / Banco
              </span>
            </label>
            <input
              type="text"
              placeholder="Digite o banco ou conta (ex: Nubank, Itaú, Bradesco, Dinheiro...)"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full text-xs placeholder:text-[11.5px] placeholder:text-slate-400 p-2.5 rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-slate-900 text-slate-800"
            />
          </div>

          {/* Seção "Mais detalhes" */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setShowMoreDetails(!showMoreDetails)}
              className="w-full flex items-center justify-between py-2 text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                <span>Mais detalhes</span>
              </span>
              {showMoreDetails ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Conteúdo de Mais Detalhes: "Uma vez", "Parcela" e "Recorrente" */}
            {showMoreDetails && (
              <div className="mt-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 animate-in fade-in duration-150">
                
                {/* Abas das opções */}
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-white rounded-xl border border-slate-200 shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setRepetitionMode('uma_vez')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      repetitionMode === 'uma_vez'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Uma vez
                  </button>

                  <button
                    type="button"
                    onClick={() => setRepetitionMode('parcela')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      repetitionMode === 'parcela'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Parcela
                  </button>

                  <button
                    type="button"
                    onClick={() => setRepetitionMode('recorrente')}
                    className={`py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      repetitionMode === 'recorrente'
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Recorrente
                  </button>
                </div>

                {/* Sub-opções quando for "Parcela" */}
                {repetitionMode === 'parcela' && (
                  <div className="space-y-3 pt-1 border-t border-slate-200/60">
                    
                    {/* Parcelas: botões do lado - 2 + */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Parcelas</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const next = Math.max(2, installmentsCount - 1);
                            setInstallmentsCount(next);
                            if (currentInstallment > next) setCurrentInstallment(next);
                          }}
                          className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-base shadow-2xs transition-colors cursor-pointer"
                          title="Diminuir quantidade de parcelas"
                        >
                          -
                        </button>
                        <span className="w-8 text-center font-black text-slate-900 text-sm">
                          {installmentsCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => setInstallmentsCount((prev) => prev + 1)}
                          className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-base shadow-2xs transition-colors cursor-pointer"
                          title="Aumentar quantidade de parcelas"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Embaixo: Parcela atual */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">Parcela atual</span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCurrentInstallment((prev) => Math.max(1, prev - 1))}
                          className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-base shadow-2xs transition-colors cursor-pointer"
                          title="Parcela anterior"
                        >
                          -
                        </button>
                        <span className="min-w-14 text-center font-bold text-slate-900 text-xs">
                          {currentInstallment} de {installmentsCount}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCurrentInstallment((prev) => Math.min(installmentsCount, prev + 1))}
                          className="w-8 h-8 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-base shadow-2xs transition-colors cursor-pointer"
                          title="Próxima parcela"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    {/* Embaixo: Valor informado do lado "Total" "Parcela" */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span className="text-xs font-bold text-slate-700">Valor informado</span>
                      <div className="flex items-center bg-white p-0.5 rounded-lg border border-slate-200 shadow-2xs">
                        <button
                          type="button"
                          onClick={() => setInstallmentValueType('total')}
                          className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                            installmentValueType === 'total'
                              ? 'bg-slate-900 text-white shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Total
                        </button>
                        <button
                          type="button"
                          onClick={() => setInstallmentValueType('parcela')}
                          className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                            installmentValueType === 'parcela'
                              ? 'bg-slate-900 text-white shadow-2xs'
                              : 'text-slate-600 hover:text-slate-900'
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
                  <div className="space-y-2.5 pt-1 border-t border-slate-200/60">
                    <span className="block text-xs font-bold text-slate-700">
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
                              ? 'bg-slate-900 text-white border-slate-900 font-bold shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {opt === 'personalizar' ? 'Personalizar' : opt}
                        </button>
                      ))}
                    </div>

                    {frequency === 'personalizar' && (
                      <div className="mt-2 flex items-center gap-2 bg-white p-2.5 rounded-xl border border-slate-200">
                        <span className="text-xs text-slate-600">Repetir a cada</span>
                        <input
                          type="number"
                          min="1"
                          value={customDays}
                          onChange={(e) => setCustomDays(e.target.value)}
                          className="w-16 p-1 text-xs text-center font-bold border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-slate-900"
                        />
                        <span className="text-xs text-slate-600">dias</span>
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}
          </div>

          </div>

          {/* Action: Ícone de confirmar centralizado e fixo na base do modal, ou botões de Salvar/Excluir no modo de edição */}
          <div className={`p-3.5 sm:p-4 flex items-center border-t border-slate-100 bg-white/95 backdrop-blur-xs shrink-0 shadow-xs ${
            editingTransaction ? 'justify-between' : 'justify-center'
          }`}>
            {editingTransaction && onDeleteTransaction ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Tem certeza que deseja excluir este gasto?')) {
                    onDeleteTransaction(editingTransaction.id);
                    onClose();
                  }
                }}
                className="px-3.5 py-2.5 rounded-2xl text-rose-600 hover:bg-rose-50 border border-rose-200/80 font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Excluir este lançamento"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir</span>
              </button>
            ) : null}

            {editingTransaction ? (
              <button
                type="submit"
                id="btn-submit-new-transaction"
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-2xl text-white font-black text-sm shadow-md active:scale-95 hover:scale-102 transition-all cursor-pointer ${
                  type === 'expense'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                    : type === 'investment'
                    ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                }`}
                title="Salvar alterações"
              >
                <Check className="w-5 h-5 stroke-[3]" />
                <span>Salvar Alterações</span>
              </button>
            ) : (
              <button
                type="submit"
                id="btn-submit-new-transaction"
                className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full text-white flex items-center justify-center shadow-lg active:scale-95 hover:scale-105 transition-all cursor-pointer ${
                  type === 'expense'
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
                    : type === 'investment'
                    ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
                }`}
                title="Confirmar lançamento"
              >
                <Check className="w-7 h-7 stroke-[3]" />
              </button>
            )}
          </div>

        </form>

      </div>

      {/* Modal / Sheet Interno de Seleção e Criação de Categorias */}
      {isCategoryPickerOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xs animate-in fade-in duration-100 overflow-x-hidden">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150">
            
            {/* Header do Picker de Categorias */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Tag className={`w-4 h-4 ${type === 'expense' ? 'text-rose-600' : 'text-emerald-600'}`} />
                <h4 className="font-extrabold text-slate-900 text-sm sm:text-base">
                  Categorias
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsCategoryPickerOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Criar nova categoria */}
            <div className={`p-4 border-b border-slate-100 space-y-2 ${type === 'expense' ? 'bg-rose-50/50' : 'bg-emerald-50/50'}`}>
              <span className={`text-xs font-extrabold block ${type === 'expense' ? 'text-rose-900' : 'text-emerald-900'}`}>
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
                  className={`flex-1 text-xs p-2 rounded-xl bg-white border font-medium focus:outline-hidden focus:ring-2 ${
                    type === 'expense'
                      ? 'border-rose-300 focus:ring-rose-500'
                      : 'border-emerald-300 focus:ring-emerald-500'
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
            <div className="p-4 border-b border-slate-100">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3" />
                <input
                  type="text"
                  placeholder="Buscar categoria..."
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="w-full text-xs pl-8.5 pr-3 py-2 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-slate-900 bg-slate-50"
                />
              </div>
            </div>

            {/* Lista de Categorias Disponíveis */}
            <div className="p-4 overflow-y-auto flex-1 space-y-1.5">
              {filteredCategories.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
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
                            ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
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
            <div className="p-3 border-t border-slate-100 flex justify-end bg-slate-50">
              <button
                type="button"
                onClick={() => setIsCategoryPickerOpen(false)}
                className="px-4 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 rounded-xl transition-colors cursor-pointer"
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
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col p-4 sm:p-5 animate-in zoom-in-95 duration-150">
            
            {/* Header do Calendário: Mês/Ano e setas para navegar */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
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
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                title="Mês anterior"
              >
                <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
              </button>

              <span className="font-extrabold text-slate-900 text-sm sm:text-base capitalize">
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
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                title="Próximo mês"
              >
                <ChevronRight className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Dias da semana */}
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((dayChar, i) => (
                <span key={i} className="text-[11px] font-bold text-slate-400 py-1">
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
                        setDate(dateIso);
                        setIsCustomDatePickerOpen(false);
                      }}
                      className={`h-9 w-9 mx-auto rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                        isSelected
                          ? type === 'expense'
                            ? 'bg-rose-600 text-white shadow-xs scale-105 font-black'
                            : type === 'investment'
                            ? 'bg-indigo-600 text-white shadow-xs scale-105 font-black'
                            : 'bg-emerald-600 text-white shadow-xs scale-105 font-black'
                          : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
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
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  const todayIso = new Date().toISOString().split('T')[0];
                  setDate(todayIso);
                  setIsCustomDatePickerOpen(false);
                }}
                className={`text-xs font-bold transition-colors cursor-pointer ${
                  type === 'expense'
                    ? 'text-rose-600 hover:text-rose-700'
                    : 'text-emerald-600 hover:text-emerald-700'
                }`}
              >
                Hoje
              </button>

              <button
                type="button"
                onClick={() => setIsCustomDatePickerOpen(false)}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
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
