import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  CreditCard, 
  X, 
  Check, 
  DollarSign, 
  Calendar, 
  Hash, 
  Building2,
  ChevronRight
} from 'lucide-react';
import { BankAccount } from '../types';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCard: (newCard: BankAccount) => void;
  availableAccounts?: BankAccount[];
}

const BANK_PRESETS = [
  { name: 'Nubank', color: '#820ad1' },
  { name: 'Inter', color: '#ff7a00' },
  { name: 'Itaú', color: '#003399' },
  { name: 'Santander', color: '#cc0000' },
  { name: 'Bradesco', color: '#cc092f' },
  { name: 'C6 Bank', color: '#1e293b' },
  { name: 'Banco do Brasil', color: '#ca8a04' },
  { name: 'XP', color: '#09090b' },
  { name: 'Outro', color: '#10b981' },
];

const COLOR_OPTIONS = [
  '#820ad1', // Nubank roxo
  '#ff7a00', // Inter laranja
  '#003399', // Itaú azul
  '#cc0000', // Santander vermelho
  '#1e293b', // C6 escuro
  '#09090b', // XP preto
  '#10b981', // Verde esmeralda
  '#ca8a04', // Dourado BB
  '#E27D60', // Coral / Salmão
  '#0284c7', // Azul ciano
];

export const AddCardModal: React.FC<AddCardModalProps> = ({
  isOpen,
  onClose,
  onSaveCard,
}) => {
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('Nubank');
  const [limitStr, setLimitStr] = useState('5.000,00');
  const [dueDay, setDueDay] = useState<number>(10);
  const [closingDay, setClosingDay] = useState<number>(3);
  const [finalDigits, setFinalDigits] = useState('8421');
  const [color, setColor] = useState('#820ad1');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [activeDayPicker, setActiveDayPicker] = useState<'due' | 'closing' | null>(null);
  const [keyboardOffset, setKeyboardOffset] = useState<number>(0);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);
  const [error, setError] = useState('');

  // Acompanhamento dinâmico do teclado virtual para o botão de confirmação
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateKeyboardOffset = () => {
      if (window.visualViewport) {
        const viewportHeight = window.visualViewport.height;
        const windowHeight = window.innerHeight;
        const heightDiff = windowHeight - viewportHeight;
        
        if (heightDiff > 120) {
          // Elevação moderada e confortável (não sobe excessivamente para o meio da tela)
          setKeyboardOffset(Math.min(54, Math.max(20, Math.round(heightDiff * 0.15))));
          setIsKeyboardOpen(true);
          return;
        }
      }

      // Fallback para campos em foco em dispositivos móveis (elevação suave)
      const activeEl = document.activeElement;
      const isInputFocused = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');
      const isMobile = window.innerWidth <= 768;

      if (isInputFocused && isMobile) {
        setKeyboardOffset(48);
        setIsKeyboardOpen(true);
      } else {
        setKeyboardOffset(0);
        setIsKeyboardOpen(false);
      }
    };

    const handleFocusIn = (e: FocusEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        setTimeout(updateKeyboardOffset, 150);
      }
    };

    const handleFocusOut = () => {
      setTimeout(updateKeyboardOffset, 180);
    };

    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', updateKeyboardOffset);
      window.visualViewport.addEventListener('scroll', updateKeyboardOffset);
    }
    window.addEventListener('resize', updateKeyboardOffset);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', updateKeyboardOffset);
        window.visualViewport.removeEventListener('scroll', updateKeyboardOffset);
      }
      window.removeEventListener('resize', updateKeyboardOffset);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  if (!isOpen) return null;
  if (typeof document === 'undefined') return null;

  const handleSelectBank = (bank: typeof BANK_PRESETS[0]) => {
    setInstitution(bank.name);
    setColor(bank.color);
    if (!name || BANK_PRESETS.some(b => name === `Cartão ${b.name}`)) {
      setName(`Cartão ${bank.name}`);
    }
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setLimitStr('');
      return;
    }
    const val = parseFloat(raw) / 100;
    setLimitStr(val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };

  const parseLimit = (str: string): number => {
    if (!str) return 0;
    const clean = str.replace(/\./g, '').replace(',', '.');
    return parseFloat(clean) || 0;
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Por favor, informe o nome do cartão.');
      return;
    }

    const limitVal = parseLimit(limitStr);
    const cleanDigits = finalDigits.replace(/\D/g, '');
    const accountStr = cleanDigits.length >= 4 
      ? `Final ${cleanDigits.slice(-4)}` 
      : (cleanDigits ? `Final ${cleanDigits}` : 'Final 8421');

    const newCard: BankAccount = {
      id: `card-${Date.now()}`,
      name: trimmedName,
      institution,
      type: 'credit_card',
      balance: 0,
      availableLimit: limitVal > 0 ? limitVal : 5000,
      lastSync: 'Recém-adicionado',
      color,
      status: 'connected',
      accountNumber: accountStr,
      dueDay: Number(dueDay) || 10,
      closingDay: Number(closingDay) || 3,
    };

    onSaveCard(newCard);
    onClose();
  };

  return createPortal(
    <div 
      id="modal-adicionar-cartao"
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden transition-colors relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <CreditCard className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
                Adicionar Cartão
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cadastre um novo cartão de crédito
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1 pb-24">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Pré-visualização do Cartão */}
          <div 
            className="rounded-2xl p-4 text-white shadow-md relative overflow-hidden transition-colors"
            style={{ backgroundColor: color }}
          >
            <div className="flex justify-between items-start mb-6">
              <span className="text-xs font-bold uppercase tracking-wider opacity-85">
                {institution || 'Banco'}
              </span>
              <CreditCard className="w-6 h-6 opacity-80" />
            </div>
            <div className="text-lg font-black tracking-tight mb-3 truncate">
              {name || 'Nome do Cartão'}
            </div>
            <div className="flex justify-between items-end text-xs opacity-90 font-medium">
              <span>Final {finalDigits || '8421'}</span>
              <span>Venc. dia {dueDay} • Fecha dia {closingDay}</span>
            </div>
          </div>

          {/* Atalhos de Bancos Populares */}
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
              Banco ou Instituição
            </label>
            <div className="flex flex-wrap gap-1.5">
              {BANK_PRESETS.map((bank) => (
                <button
                  key={bank.name}
                  type="button"
                  onClick={() => handleSelectBank(bank)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    institution === bank.name
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {bank.name}
                </button>
              ))}
            </div>
          </div>

          {/* Nome do Cartão */}
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
              Nome do Cartão
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Ex: Nubank Roxinho, Inter Black"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Limite de Crédito */}
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
              Limite de Crédito
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                inputMode="numeric"
                value={limitStr}
                onChange={handleLimitChange}
                placeholder="0,00"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Vencimento e Fechamento com Seletor dos Dias 1 a 30 em formato quadrado */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Dia Vencimento
              </label>
              <div 
                onClick={() => setActiveDayPicker('due')}
                className="flex items-center px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 rounded-xl text-sm font-semibold text-slate-900 dark:text-white transition-colors cursor-pointer group"
                title="Clique no ícone de calendário para escolher de 1 a 30"
              >
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDayPicker('due');
                    }}
                    className="p-1 -ml-1 text-slate-400 group-hover:text-emerald-500 transition-colors cursor-pointer"
                    title="Abrir calendário (dias 1 a 30)"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                  <span>Dia {dueDay}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Dia Fechamento
              </label>
              <div 
                onClick={() => setActiveDayPicker('closing')}
                className="flex items-center px-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 rounded-xl text-sm font-semibold text-slate-900 dark:text-white transition-colors cursor-pointer group"
                title="Clique no ícone de calendário para escolher de 1 a 30"
              >
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveDayPicker('closing');
                    }}
                    className="p-1 -ml-1 text-slate-400 group-hover:text-emerald-500 transition-colors cursor-pointer"
                    title="Abrir calendário (dias 1 a 30)"
                  >
                    <Calendar className="w-4 h-4" />
                  </button>
                  <span>Dia {closingDay}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Final do Cartão */}
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
              Últimos 4 Dígitos
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                maxLength={4}
                value={finalDigits}
                onChange={(e) => setFinalDigits(e.target.value.replace(/\D/g, ''))}
                placeholder="Ex: 8421"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Seletor de Cor: "Cor" do lado esquerdo, esfera com a cor + > do lado direito que expande as cores */}
          <div className="pt-1">
            <div 
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="flex items-center justify-between py-2.5 px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-colors select-none"
            >
              <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
                Cor
              </span>
              <div className="flex items-center gap-2">
                <div 
                  className="w-5 h-5 rounded-full border border-white/30 shadow-xs ring-1 ring-slate-300 dark:ring-slate-600"
                  style={{ backgroundColor: color }}
                />
                <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${showColorPicker ? 'rotate-90' : ''}`} />
              </div>
            </div>

            {/* Paleta expandida ao clicar */}
            {showColorPicker && (
              <div className="mt-2.5 p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 flex flex-wrap gap-2.5 animate-fadeIn">
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => {
                      setColor(c);
                      setShowColorPicker(false);
                    }}
                    className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                      color === c ? 'scale-110 ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: c }}
                    title={c}
                  >
                    {color === c && <Check className="w-4 h-4 text-white stroke-[3]" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </form>

        {/* Modal de Dias de 1 a 30 em Formato Só o Quadrado com o Número */}
        {activeDayPicker && (
          <div 
            className="absolute inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setActiveDayPicker(null)}
          >
            <div 
              className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full animate-scaleUp"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Calendar className="w-4 h-4 stroke-[2.5]" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                      {activeDayPicker === 'due' ? 'Vencimento da Fatura' : 'Fechamento da Fatura'}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Selecione um dia (1 a 30)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveDayPicker(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Formato: Somente o quadrado com o número de 1 a 30 */}
              <div className="grid grid-cols-6 gap-2">
                {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => {
                  const isSelected = activeDayPicker === 'due' ? dueDay === day : closingDay === day;
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        if (activeDayPicker === 'due') {
                          setDueDay(day);
                        } else {
                          setClosingDay(day);
                        }
                        setActiveDayPicker(null);
                      }}
                      className={`aspect-square flex items-center justify-center rounded-xl font-bold text-sm transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-600 text-white shadow-md font-black scale-105 ring-2 ring-emerald-500 ring-offset-1 dark:ring-offset-slate-900'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-700/80 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200/80 dark:border-slate-700/80'
                      }`}
                      title={`Dia ${day}`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Botão de Confirmar Centralizado (Acompanha o teclado virtual ficando centralizado) */}
        <div 
          className={`transition-all duration-200 ease-out z-40 pointer-events-auto ${
            isKeyboardOpen
              ? 'fixed left-1/2 -translate-x-1/2'
              : 'absolute bottom-4 left-1/2 -translate-x-1/2'
          }`}
          style={isKeyboardOpen ? { bottom: `${Math.max(16, keyboardOffset + 14)}px` } : undefined}
        >
          <button
            type="button"
            onClick={() => handleSubmit()}
            className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-xl shadow-emerald-600/40 flex items-center justify-center transition-all cursor-pointer ring-4 ring-emerald-600/20"
            title="Confirmar e salvar cartão"
            aria-label="Confirmar e salvar cartão"
          >
            <Check className="w-7 h-7 stroke-[3.2]" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

