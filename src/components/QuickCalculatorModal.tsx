import React, { useState, useEffect, useCallback, useRef } from 'react';
import { numericToMaskedString } from '../utils/finance';

interface QuickCalculatorModalProps {
  isOpen: boolean;
  initialValue?: string;
  onClose: () => void;
  onApply: (formattedAmount: string) => void;
  onChangeLive?: (liveFormattedAmount: string) => void;
}

/**
 * Avaliador matemático seguro sem uso de eval
 */
function evaluateMathExpression(expr: string): number {
  let clean = expr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/\./g, '') // remove separador de milhar se houver
    .replace(/,/g, '.') // converte vírgula decimal para ponto
    .replace(/\s+/g, '');

  // Se terminar em operador pendente, remove para calcular o que já foi digitado
  clean = clean.replace(/[+\-*/]+$/, '');
  if (!clean) return 0;

  const tokens: (number | string)[] = [];
  let currentNum = '';

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if ('0123456789.'.includes(char)) {
      currentNum += char;
    } else if ('+-*/'.includes(char)) {
      if (currentNum !== '') {
        tokens.push(parseFloat(currentNum));
        currentNum = '';
      } else if (char === '-' && (i === 0 || '+-*/'.includes(clean[i - 1]))) {
        currentNum = '-';
        continue;
      }
      tokens.push(char);
    }
  }

  if (currentNum !== '' && currentNum !== '-') {
    tokens.push(parseFloat(currentNum));
  }

  if (tokens.length === 0) return 0;

  // Passo 1: Multiplicação e Divisão
  const pass1: (number | string)[] = [];
  let i = 0;
  while (i < tokens.length) {
    const token = tokens[i];
    if (token === '*' || token === '/') {
      const prev = pass1.pop() as number;
      const next = tokens[i + 1] as number;
      if (typeof prev === 'number' && typeof next === 'number') {
        const res = token === '*' ? prev * next : next !== 0 ? prev / next : 0;
        pass1.push(res);
        i += 2;
      } else {
        pass1.push(token);
        i++;
      }
    } else {
      pass1.push(token);
      i++;
    }
  }

  // Passo 2: Adição e Subtração
  let total = typeof pass1[0] === 'number' ? pass1[0] : 0;
  for (let j = 1; j < pass1.length; j += 2) {
    const op = pass1[j];
    const val = pass1[j + 1];
    if (typeof val === 'number') {
      if (op === '+') total += val;
      if (op === '-') total -= val;
    }
  }

  return isNaN(total) || !isFinite(total) ? 0 : total;
}

/**
 * Formata o número para exibição ao vivo no cabeçalho
 */
function formatDisplayNumber(val: number): string {
  if (isNaN(val) || !isFinite(val)) return '0';
  if (Number.isInteger(val)) {
    return val.toLocaleString('pt-BR');
  }
  return val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export const QuickCalculatorModal: React.FC<QuickCalculatorModalProps> = ({
  isOpen,
  initialValue = '',
  onClose,
  onApply,
  onChangeLive,
}) => {
  const [expression, setExpression] = useState('');
  const [liveResult, setLiveResult] = useState<number>(0);
  const [hasNewInput, setHasNewInput] = useState<boolean>(false);
  const [isCalculated, setIsCalculated] = useState<boolean>(false);
  const wasOpenRef = useRef<boolean>(false);

  // Estados de gesto de arrastar para baixo pelo retângulo superior
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartYRef = useRef<number>(0);

  // Inicializa apenas quando o modal abre (transição de fechado para aberto)
  useEffect(() => {
    if (isOpen && !wasOpenRef.current) {
      const cleanInitial = initialValue.trim();
      if (cleanInitial && cleanInitial !== '0,00') {
        const parsed = evaluateMathExpression(cleanInitial);
        const displayExpr = Number.isInteger(parsed) ? String(parsed) : cleanInitial;
        setExpression(displayExpr);
        setLiveResult(parsed);
        setHasNewInput(false);
        setIsCalculated(false);
      } else {
        setExpression('0');
        setLiveResult(0);
        setHasNewInput(false);
        setIsCalculated(false);
      }
    }
    wasOpenRef.current = isOpen;
  }, [isOpen, initialValue]);

  // Recalcula o resultado ao vivo sempre que a expressão muda
  useEffect(() => {
    if (!expression || expression === '0') {
      setLiveResult(0);
      return;
    }
    const computed = evaluateMathExpression(expression);
    setLiveResult(computed);
  }, [expression]);

  // Atualiza em tempo real o valor no formulário de trás enquanto o usuário digita
  useEffect(() => {
    if (!isOpen || !hasNewInput || !onChangeLive) return;
    const finalVal = liveResult || evaluateMathExpression(expression);
    const masked = numericToMaskedString(finalVal) || '0,00';
    onChangeLive(masked);
  }, [liveResult, expression, isOpen, hasNewInput, onChangeLive]);

  const handleDigit = useCallback((digit: string) => {
    setIsCalculated(false);
    setExpression((prev) => {
      // Se acabou de abrir com valor inicial e o usuário começa a digitar um número novo, substitui
      if (!hasNewInput) {
        setHasNewInput(true);
        return digit;
      }
      if (prev === '0') {
        return digit;
      }
      return prev + digit;
    });
  }, [hasNewInput]);

  const handleOperator = useCallback((op: '÷' | '×' | '−' | '+') => {
    setIsCalculated(false);
    setHasNewInput(true);
    setExpression((prev) => {
      const trimmed = prev.trim();
      if (!trimmed || trimmed === '0') {
        return `0 ${op} `;
      }
      const lastChar = trimmed.slice(-1);
      if (['+', '-', '−', '×', '*', '÷', '/'].includes(lastChar)) {
        // Substitui o operador existente
        const withoutLast = trimmed.slice(0, -1).trim();
        return `${withoutLast} ${op} `;
      }
      return `${trimmed} ${op} `;
    });
  }, []);

  const handleComma = useCallback(() => {
    setIsCalculated(false);
    setHasNewInput(true);
    setExpression((prev) => {
      if (!prev || prev === '0') return '0,';
      // Verifica se a última parte do número já possui vírgula
      const parts = prev.split(/\s[+−×÷*/-]\s/);
      const lastPart = parts[parts.length - 1] || '';
      if (lastPart.includes(',')) {
        return prev;
      }
      return prev + ',';
    });
  }, []);

  const handleBackspace = useCallback(() => {
    setIsCalculated(false);
    setHasNewInput(true);
    setExpression((prev) => {
      const trimmedEnd = prev.trimEnd();
      if (!trimmedEnd || trimmedEnd === '0') return '0';

      // Se terminar com operador com espaços (ex: "25 + ")
      const lastChar = trimmedEnd.slice(-1);
      if (['+', '-', '−', '×', '*', '÷', '/'].includes(lastChar)) {
        const withoutOp = trimmedEnd.slice(0, -1).trimEnd();
        return withoutOp || '0';
      }

      const next = prev.slice(0, -1).trimEnd();
      return next || '0';
    });
  }, []);

  const handleConfirm = useCallback(() => {
    const finalVal = liveResult || evaluateMathExpression(expression);
    const masked = numericToMaskedString(finalVal) || '0,00';
    setIsCalculated(true);
    onApply(masked);
    onClose();
  }, [liveResult, expression, onApply, onClose]);

  // Suporte a teclado físico
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === ',' || e.key === '.') {
        e.preventDefault();
        handleComma();
      } else if (e.key === '+') {
        e.preventDefault();
        handleOperator('+');
      } else if (e.key === '-') {
        e.preventDefault();
        handleOperator('−');
      } else if (e.key === '*') {
        e.preventDefault();
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleDigit, handleComma, handleOperator, handleBackspace, handleConfirm, onClose]);

  // Handlers para o retângulo arredondado: deslizar para baixo fecha a calculadora
  const handleTouchStart = (e: React.TouchEvent) => {
    dragStartYRef.current = e.touches[0].clientY;
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    const currentY = e.touches[0].clientY;
    const delta = currentY - dragStartYRef.current;
    if (delta > 0) {
      setDragOffset(delta);
    } else {
      setDragOffset(0);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);
    if (dragOffset > 38) {
      setDragOffset(0);
      onClose();
    } else {
      setDragOffset(0);
    }
  };

  // Suporte a mouse para arrasto no desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartYRef.current = e.clientY;
    setIsDragging(true);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientY - dragStartYRef.current;
      if (delta > 0) {
        setDragOffset(delta);
      } else {
        setDragOffset(0);
      }
    };

    const onMouseUp = (upEvent: MouseEvent) => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      setIsDragging(false);
      const delta = upEvent.clientY - dragStartYRef.current;
      if (delta > 38) {
        setDragOffset(0);
        onClose();
      } else {
        setDragOffset(0);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  if (!isOpen) return null;

  // O cálculo/expressão à esquerda aparece quando houver sinal de operação (ex: 6+3) ou se já foi calculado
  const hasOperator = /[+−×÷*/-]/.test(expression) || isCalculated;

  return (
    <div 
      className="fixed inset-0 z-70 bg-black/30 flex flex-col justify-end animate-in fade-in duration-150"
      onClick={onClose}
    >
      {/* Container inferior (Bottom Sheet compacto) */}
      <div 
        role="dialog"
        aria-modal="true"
        aria-label="Calculadora"
        className="w-full max-w-sm sm:max-w-md mx-auto bg-[#131920] text-white rounded-t-3xl p-3 sm:p-4 pb-4 sm:pb-5 shadow-2xl border-t border-slate-800/90 animate-in slide-in-from-bottom duration-200 flex flex-col select-none"
        style={{
          transform: dragOffset > 0 ? `translateY(${dragOffset}px)` : undefined,
          transition: isDragging ? 'none' : 'transform 0.18s ease-out',
          opacity: dragOffset > 0 ? Math.max(0.4, 1 - dragOffset / 200) : 1,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Barra superior de arrasto (drag pill com suporte a deslizar para baixo) */}
        <div 
          className="w-full py-2 -mt-1 mb-1.5 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing touch-none select-none group"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onClick={onClose}
          title="Deslize para baixo ou clique para fechar"
          role="button"
          aria-label="Deslizar para baixo para fechar"
        >
          <div className="w-12 h-1.5 bg-slate-600/70 group-hover:bg-slate-500 active:bg-slate-400 rounded-full transition-colors" />
        </div>

        {/* Visor: Expressão à esquerda (visível com operação, sem sumir após o cálculo) e Resultado R$ à direita */}
        <div className="flex items-center justify-between px-2 pt-0 pb-2.5 min-h-11">
          {/* Expressão digitada (ex: 6 + 3 ou 25 × 9) mantida perfeitamente visível */}
          <div className="text-slate-400 font-semibold text-base sm:text-lg truncate max-w-[55%] font-mono tracking-wide h-6 flex items-center">
            {hasOperator ? expression : ''}
          </div>

          {/* Resultado ao vivo (ex: R$ 225) */}
          <div className="flex items-baseline gap-1 text-right ml-auto">
            <span className="text-slate-400 font-bold text-sm sm:text-base select-none">
              R$
            </span>
            <span className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
              {formatDisplayNumber(liveResult)}
            </span>
          </div>
        </div>

        {/* Grade 4x4 de Teclas da Calculadora - Cores opacas e elegantes */}
        <div className="grid grid-cols-4 gap-2 sm:gap-2.5 mb-2.5">
          {/* Linha 1: 7, 8, 9, ÷ */}
          <button
            type="button"
            onClick={() => handleDigit('7')}
            className="h-11.5 sm:h-13 rounded-xl sm:rounded-2xl bg-[#1a2128] hover:bg-[#232c35] active:scale-95 text-slate-100 font-bold text-xl sm:text-2xl flex items-center justify-center transition-all cursor-pointer"
          >
            7
          </button>
          <button
            type="button"
            onClick={() => handleDigit('8')}
            className="h-11.5 sm:h-13 rounded-xl sm:rounded-2xl bg-[#1a2128] hover:bg-[#232c35] active:scale-95 text-slate-100 font-bold text-xl sm:text-2xl flex items-center justify-center transition-all cursor-pointer"
          >
            8
          </button>
          <button
            type="button"
            onClick={() => handleDigit('9')}
            className="h-11.5 sm:h-13 rounded-xl sm:rounded-2xl bg-[#1a2128] hover:bg-[#232c35] active:scale-95 text-slate-100 font-bold text-xl sm:text-2xl flex items-center justify-center transition-all cursor-pointer"
          >
            9
          </button>
          <button
            type="button"
            onClick={() => handleOperator('÷')}
            className="h-11.5 sm:h-13 rounded-xl sm:rounded-2xl bg-[#1e2730] hover:bg-[#283440] active:scale-95 text-slate-300 font-bold text-xl sm:text-2xl flex items-center justify-center transition-all cursor-pointer"
          >
            ÷
          </button>

          {/* Linha 2: 4, 5, 6, × */}
          <button
            type="button"
            onClick={() => handleDigit('4')}
            className="h-11.5 sm:h-13 rounded-xl sm:rounded-2xl bg-[#1a2128] hover:bg-[#232c35] active:scale-95 text-slate-100 font-bold text-xl sm:text-2xl flex items-center justify-center transition-all cursor-pointer"
          >
            4
          </button>
          <button
            type="button"
            onClick={() => handleDigit('5')}
            className="h-11.5 sm:h-13 rounded-xl sm:rounded-2xl bg-[#1a2128] hover:bg-[#232c35] active:scale-95 text-slate-100 font-bold text-xl sm:text-2xl flex items-center justify-center transition-all cursor-pointer"
          >
            5
          </button>
          <button
            type="button"
            onClick={() => handleDigit('6')}
            className="h-11.5 sm:h-13 rounded-xl sm:rounded-2xl bg-[#1a2128] hover:bg-[#232c35] active:scale-95 text-slate-100 font-bold text-xl sm:text-2xl flex items-center justify-center transition-all cursor-pointer"
          >
            6
          </button>
          <button
            type="button"
            onClick={() => handleOperator('×')}
            className="h-11.5 sm:h-13 rounded-xl sm:rounded-2xl bg-[#1e2730] hover:bg-[#283440] active:scale-95 text-slate-300 font-bold text-xl sm:text-2xl flex items-center justify-center transition-all cursor-pointer"
          >
            ×
          </button>

          {/* Linha 3: 1, 2, 3, − */}
          <button
            type="button"
            onClick={() => handleDigit('1')}
            className="h-11.5 sm:h-13 rounded-xl sm:rounded-2xl bg-[#1a2128] hover:bg-[#232c35] active:scale-95 text-slate-100 font-bold text-xl sm:text-2xl flex items-center justify-center transition-all cursor-pointer"
          >
            1
          </button>
          <button
            type="button"
            onClick={() => handleDigit('2')}
            className="h-11.5 sm:h-13 rounded-xl sm:rounded-2xl bg-[#1a2128] hover:bg-[#232c35] active:scale-95 text-slate-100 font-bold text-xl sm:text-2xl flex items-center justify-center transition-all cursor-pointer"
          >
            2
          </button>
          <button
            type="button"
            onClick={() => handleDigit('3')}
            className="h-11.5 sm:h-13 rounded-xl sm:rounded-2xl bg-[#1a2128] hover:bg-[#232c35] active:scale-95 text-slate-100 font-bold text-xl sm:text-2xl flex items-center justify-center transition-all cursor-pointer"
          >
            3
          </button>
          <button
            type="button"
            onClick={() => handleOperator('−')}
            className="h-11.5 sm:h-13 rounded-xl sm:rounded-2xl bg-[#1e2730] hover:bg-[#283440] active:scale-95 text-slate-300 font-bold text-xl sm:text-2xl flex items-center justify-center transition-all cursor-pointer"
          >
            −
          </button>

          {/* Linha 4: , , 0, ⌫, + */}
          <button
            type="button"
            onClick={handleComma}
            className="h-11.5 sm:h-13 rounded-xl sm:rounded-2xl bg-[#1a2128] hover:bg-[#232c35] active:scale-95 text-slate-100 font-bold text-xl sm:text-2xl flex items-center justify-center transition-all cursor-pointer"
          >
            ,
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-11.5 sm:h-13 rounded-xl sm:rounded-2xl bg-[#1a2128] hover:bg-[#232c35] active:scale-95 text-slate-100 font-bold text-xl sm:text-2xl flex items-center justify-center transition-all cursor-pointer"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleBackspace}
            className="h-11.5 sm:h-13 rounded-xl sm:rounded-2xl bg-[#1a2128] hover:bg-[#232c35] active:scale-95 text-slate-400 flex items-center justify-center transition-all cursor-pointer"
            title="Apagar"
            aria-label="Apagar dígito"
          >
            <svg className="w-5.5 h-5.5 stroke-[2]" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z" />
              <line x1="18" y1="9" x2="12" y2="15" />
              <line x1="12" y1="9" x2="18" y2="15" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => handleOperator('+')}
            className="h-11.5 sm:h-13 rounded-xl sm:rounded-2xl bg-[#1e2730] hover:bg-[#283440] active:scale-95 text-slate-300 font-bold text-xl sm:text-2xl flex items-center justify-center transition-all cursor-pointer"
          >
            +
          </button>
        </div>

        {/* Botão Inferior: Confirmar em tom opaco e refinado */}
        <button
          type="button"
          onClick={handleConfirm}
          className="w-full py-3 sm:py-3.5 rounded-xl sm:rounded-2xl bg-[#2d5c60] hover:bg-[#356a6f] active:scale-98 text-slate-100 font-black text-base sm:text-lg shadow-sm flex items-center justify-center transition-all cursor-pointer"
        >
          Confirmar
        </button>

      </div>
    </div>
  );
};
