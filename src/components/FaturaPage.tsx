import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Trash2
} from 'lucide-react';
import { BankAccount, Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils/finance';
import { getCategoryVisual } from '../utils/categoryIcons';
import { AddCardModal } from './AddCardModal';

interface FaturaPageProps {
  cards: BankAccount[];
  transactions: Transaction[];
  onBack?: () => void;
  onOpenCardConnection?: () => void;
  onOpenNewTransaction?: () => void;
  onOpenScanner?: () => void;
  onPayInvoice: (cardId: string, amount: number) => void;
  onDeleteTransaction?: (id: string) => void;
  onAddCard?: (newCard: BankAccount) => void;
  onDeleteCard?: (cardId: string) => void;
}

export const FaturaPage: React.FC<FaturaPageProps> = ({
  cards,
  transactions,
  onPayInvoice,
  onDeleteTransaction,
  onAddCard,
  onDeleteCard,
}) => {
  // Modal de adicionar novo cartão (estilo IMG_3628.png)
  const [isAddCardModalOpen, setIsAddCardModalOpen] = useState(false);

  // Lista de cartões de crédito (inicia com apenas 1 único cartão)
  const creditCards = useMemo(() => {
    const list = cards.filter((c) => c.type === 'credit_card');
    if (list.length > 0) return list;
    return [
      {
        id: 'card-default-1',
        name: 'Cartão de Crédito Nubank',
        institution: 'Nubank',
        type: 'credit_card' as const,
        balance: 0,
        availableLimit: 5000,
        lastSync: 'Sincronizado',
        color: '#820ad1',
        status: 'connected' as const,
        accountNumber: 'Final 8421',
        dueDay: 10,
        closingDay: 1,
      },
    ];
  }, [cards]);

  const [activeCardIndex, setActiveCardIndex] = useState(0);

  useEffect(() => {
    if (activeCardIndex >= creditCards.length) {
      setActiveCardIndex(Math.max(0, creditCards.length - 1));
    }
  }, [creditCards.length, activeCardIndex]);

  const activeCard = creditCards[activeCardIndex] || creditCards[0];

  const carouselRef = useRef<HTMLDivElement>(null);

  // Despesas no cartão ativo
  const cardExpenses = useMemo(() => {
    return transactions.filter(
      (t) =>
        t.type === 'expense' &&
        (t.category === 'Cartão de Crédito' ||
          t.bankName?.toLowerCase().includes('cartão') ||
          t.bankName?.toLowerCase().includes(activeCard.institution?.toLowerCase() || '') ||
          t.bankName?.toLowerCase().includes('nubank'))
    );
  }, [transactions, activeCard]);

  const totalInvoice = activeCard.balance > 0 
    ? activeCard.balance 
    : cardExpenses.reduce((acc, t) => acc + t.amount, 0);

  const availableLimit = activeCard.availableLimit !== undefined 
    ? activeCard.availableLimit 
    : 5000 - totalInvoice;

  const totalLimit = totalInvoice + (availableLimit > 0 ? availableLimit : 0);
  const usagePercentage = totalLimit > 0 ? Math.min(100, Math.round((totalInvoice / totalLimit) * 100)) : 0;

  // Lógica de arrastar/scrollar o carrossel de cartões
  const handleScroll = () => {
    if (!carouselRef.current) return;
    const { scrollLeft, offsetWidth } = carouselRef.current;
    if (offsetWidth === 0) return;
    const index = Math.round(scrollLeft / (offsetWidth * 0.85));
    const clamped = Math.max(0, Math.min(creditCards.length - 1, index));
    if (clamped !== activeCardIndex) {
      setActiveCardIndex(clamped);
    }
  };

  const scrollToCard = (idx: number) => {
    if (!carouselRef.current) return;
    const cardEl = carouselRef.current.children[idx] as HTMLElement;
    if (cardEl) {
      cardEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      setActiveCardIndex(idx);
    }
  };

  const handleSaveCard = (newCard: BankAccount) => {
    onAddCard?.(newCard);
    setIsAddCardModalOpen(false);
    setTimeout(() => {
      const targetIdx = creditCards.length;
      setActiveCardIndex(targetIdx);
      scrollToCard(targetIdx);
    }, 150);
  };

  return (
    <div id="fatura-page" className="space-y-6 animate-fadeIn pb-12">
      
      {/* 1. TÍTULO CENTRALIZADO COM BOTÃO (+) NO CANTO SUPERIOR DIREITO */}
      <div className="relative flex items-center justify-center pt-1 pb-2">
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight text-center">
          Fatura do cartão
        </h1>

        <button
          type="button"
          id="btn-adicionar-cartao-fatura"
          onClick={() => setIsAddCardModalOpen(true)}
          className="absolute right-0 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 flex items-center justify-center border border-slate-200/90 dark:border-slate-700 shadow-2xs hover:scale-105 active:scale-95 transition-all cursor-pointer"
          title="Adicionar novo cartão"
          aria-label="Adicionar novo cartão"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>
      </div>

      {/* 2. CARROSSEL DE CARTÕES (OU CARTÃO ÚNICO CENTRALIZADO QUANDO HOUVER APENAS 1) */}
      <div className="space-y-2.5">
        <div className="relative">
          {creditCards.length === 1 ? (
            /* Caso haja apenas 1 cartão: Fica fixo e perfeitamente centralizado sem arrastar para o vazio */
            <div className="flex justify-center py-2 px-1">
              {(() => {
                const card = creditCards[0];
                const cardTotal = card.balance > 0 
                  ? card.balance 
                  : cardExpenses.reduce((acc, t) => acc + t.amount, 0);

                return (
                  <div
                    key={card.id}
                    className="w-full max-w-[380px] rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between h-52 sm:h-56 transition-all duration-300"
                    style={{
                      background: `linear-gradient(135deg, ${card.color || '#820ad1'}, #0f172a)`,
                    }}
                  >
                    {/* Topo do Cartão */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-6 h-6 opacity-90" />
                        <span className="font-black text-sm tracking-wider">
                          {card.name || card.institution}
                        </span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs">
                        {card.flag || card.institution || 'Crédito'}
                      </span>
                    </div>

                    {/* Valor da Fatura Atual */}
                    <div className="my-auto py-2">
                      <span className="text-xs font-bold tracking-wider opacity-85 block">
                        Fatura Atual
                      </span>
                      <div className="text-2xl sm:text-3xl font-black tracking-tight mt-0.5">
                        {formatCurrency(cardTotal)}
                      </div>
                      <span className="text-[11px] opacity-80 mt-0.5 block">
                        {cardTotal === 0 ? 'Sem pendências' : 'Fatura aberta'}
                      </span>
                    </div>

                    {/* Rodapé do Cartão com Vencimento Escolhido */}
                    <div className="flex items-center justify-between text-xs font-semibold pt-2 opacity-90">
                      <span>{card.accountNumber || 'Final 8421'}</span>
                      <span>Vencimento dia {card.dueDay || 10}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          ) : (
            /* Caso haja 2 ou mais cartões: Permite arrastar para o lado para trocar de cartão */
            <div
              ref={carouselRef}
              onScroll={handleScroll}
              className="flex gap-3.5 sm:gap-4 overflow-x-auto snap-x snap-mandatory py-2 px-1 scrollbar-none touch-pan-x cursor-grab active:cursor-grabbing"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {creditCards.map((card, idx) => {
                const isActive = idx === activeCardIndex;
                const cardTotal = card.balance > 0 
                  ? card.balance 
                  : cardExpenses.reduce((acc, t) => acc + t.amount, 0);

                return (
                  <div
                    key={card.id}
                    onClick={() => scrollToCard(idx)}
                    className={`snap-center shrink-0 w-[84vw] xs:w-[320px] sm:w-[380px] rounded-3xl p-5 sm:p-6 text-white shadow-xl relative overflow-hidden flex flex-col justify-between h-52 sm:h-56 transition-all duration-300 cursor-pointer ${
                      isActive ? 'scale-100 opacity-100' : 'scale-95 opacity-60 hover:opacity-80'
                    }`}
                    style={{
                      background: `linear-gradient(135deg, ${card.color || '#820ad1'}, #0f172a)`,
                    }}
                  >
                    {/* Topo do Cartão */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-6 h-6 opacity-90" />
                        <span className="font-black text-sm tracking-wider">
                          {card.name || card.institution}
                        </span>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 backdrop-blur-xs">
                        {card.flag || card.institution || 'Crédito'}
                      </span>
                    </div>

                    {/* Valor da Fatura Atual */}
                    <div className="my-auto py-2">
                      <span className="text-xs font-bold tracking-wider opacity-85 block">
                        Fatura Atual
                      </span>
                      <div className="text-2xl sm:text-3xl font-black tracking-tight mt-0.5">
                        {formatCurrency(cardTotal)}
                      </div>
                      <span className="text-[11px] opacity-80 mt-0.5 block">
                        {cardTotal === 0 ? 'Sem pendências' : 'Fatura aberta'}
                      </span>
                    </div>

                    {/* Rodapé do Cartão com Vencimento Escolhido */}
                    <div className="flex items-center justify-between text-xs font-semibold pt-2 opacity-90">
                      <span>{card.accountNumber || 'Final 8421'}</span>
                      <div className="flex items-center gap-2">
                        <span>Vencimento dia {card.dueDay || 10}</span>
                        {onDeleteCard && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteCard(card.id);
                              setActiveCardIndex(0);
                            }}
                            className="text-white/60 hover:text-rose-200 transition-colors cursor-pointer p-0.5"
                            title="Remover este cartão"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Botões discretos de navegação esquerda/direita (desktop, apenas se tiver mais de 1 cartão) */}
          {creditCards.length > 1 && (
            <div className="hidden sm:flex items-center justify-between pointer-events-none absolute inset-y-0 -left-3 -right-3">
              <button
                type="button"
                onClick={() => scrollToCard(Math.max(0, activeCardIndex - 1))}
                disabled={activeCardIndex === 0}
                className="pointer-events-auto p-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-0 transition-all cursor-pointer"
                title="Cartão anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollToCard(Math.min(creditCards.length - 1, activeCardIndex + 1))}
                disabled={activeCardIndex === creditCards.length - 1}
                className="pointer-events-auto p-1.5 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-0 transition-all cursor-pointer"
                title="Próximo cartão"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Indicadores de Cartão (Bolinhas) e Dica de arrastar (apenas se tiver mais de 1 cartão) */}
        {creditCards.length > 1 && (
          <div className="flex flex-col items-center justify-center gap-1">
            <div className="flex items-center gap-1.5">
              {creditCards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToCard(i)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    i === activeCardIndex
                      ? 'w-6 bg-slate-900 dark:bg-white'
                      : 'w-2 bg-slate-300 dark:bg-slate-700'
                  }`}
                  aria-label={`Ver cartão ${i + 1}`}
                />
              ))}
            </div>
            <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
              Arraste para o lado para trocar de cartão
            </span>
          </div>
        )}
      </div>

      {/* 3. RESUMO DO LIMITE E PAGAMENTO (Cor do retângulo igual à do telefone) */}
      <div className="bg-slate-50 dark:bg-slate-950 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-4 transition-colors">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/70 dark:border-slate-800">
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              Resumo do Limite
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
              Limite total: {formatCurrency(totalLimit || 5000)}
            </span>
          </div>

          {/* Datas de Fechamento e Vencimento Dinâmicas do Cartão Ativo */}
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mt-4">
            <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 transition-colors">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold block">
                Fechamento da fatura
              </span>
              <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                Dia {activeCard.closingDay || 1}
              </span>
            </div>
            <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 transition-colors">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold block">
                Vencimento do cartão
              </span>
              <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                Dia {activeCard.dueDay || 10}
              </span>
            </div>
          </div>

          {/* Barra de Progresso do Limite */}
          <div className="space-y-1.5 mt-4">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Utilizado ({usagePercentage}%)</span>
              <span>Disponível: {formatCurrency(availableLimit)}</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  usagePercentage > 80 ? 'bg-rose-500' : usagePercentage > 50 ? 'bg-amber-500' : 'bg-indigo-600'
                }`}
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Botão de Pagamento da Fatura */}
        <div className="pt-2">
          <button
            onClick={() => onPayInvoice(activeCard.id, totalInvoice)}
            disabled={totalInvoice === 0}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Registrar Pagamento da Fatura ({formatCurrency(totalInvoice)})</span>
          </button>
        </div>
      </div>

      {/* 4. COMPRAS E LANÇAMENTOS NO CARTÃO (Cor do retângulo igual à do telefone) */}
      <div className="bg-slate-50 dark:bg-slate-950 rounded-3xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800/80 shadow-xs space-y-4 transition-colors">
        <div className="pb-3 border-b border-slate-200/70 dark:border-slate-800">
          <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
            Compras nesta fatura
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {cardExpenses.length} lançamento(s) registrado(s)
          </p>
        </div>

        {cardExpenses.length === 0 ? (
          <div className="text-center py-8 px-4 space-y-2 bg-white/70 dark:bg-slate-900/60 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
            <CreditCard className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Nenhuma compra registrada nesta fatura ainda.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-200/70 dark:divide-slate-800">
            {cardExpenses.map((t) => {
              const visual = getCategoryVisual(t.category);
              const CategoryIcon = visual.icon;

              return (
                <div key={t.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${visual.bgColor} ${visual.textColor} ${visual.borderColor} shrink-0`}>
                      <CategoryIcon className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-slate-900 dark:text-white truncate">
                        {t.description}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-2 mt-0.5">
                        <span>{formatDate(t.date)}</span>
                        <span>•</span>
                        <span className="truncate">{t.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-black text-rose-600 dark:text-rose-400 text-sm">
                      -{formatCurrency(t.amount)}
                    </span>
                    {onDeleteTransaction && (
                      <button
                        onClick={() => onDeleteTransaction(t.id)}
                        className="text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 p-1 text-base transition-colors cursor-pointer"
                        title="Excluir lançamento"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* NOVO MODAL: ADICIONAR NOVO CARTÃO (DESIGN FIEL A IMG_3628.png) */}
      <AddCardModal
        isOpen={isAddCardModalOpen}
        onClose={() => setIsAddCardModalOpen(false)}
        onSaveCard={handleSaveCard}
        availableAccounts={cards.filter((c) => c.type === 'checking')}
      />

    </div>
  );
};
