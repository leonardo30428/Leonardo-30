import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  RefreshCw, 
  MessageSquare,
  TrendingDown,
  PiggyBank,
  CheckCircle2
} from 'lucide-react';
import { ChatMessage, MonthlySummary } from '../types';

interface GeminiChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  summary: MonthlySummary;
  initialCustomPrompt?: string;
}

export const GeminiChatDrawer: React.FC<GeminiChatDrawerProps> = ({
  isOpen,
  onClose,
  summary,
  initialCustomPrompt,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      role: 'model',
      text: `Olá! Sou o seu consultor financeiro inteligente FinanSmart. 
Estou analisando seu mês atual: você acumulou R$ ${summary.totalIncome.toFixed(2)} em entradas e R$ ${summary.totalExpense.toFixed(2)} em despesas. ${
        summary.isRed 
          ? `Notei que você está no vermelho em R$ ${Math.abs(summary.balance).toFixed(2)}, com maior concentração em ${summary.topExpenseCategory.category}. Como posso te ajudar a reequilibrar seus gastos hoje?`
          : `Sua saúde financeira está positiva em R$ ${summary.balance.toFixed(2)}! Como posso ajudar a otimizar seus investimentos ou metas?`
      }`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (initialCustomPrompt && isOpen) {
      sendMessage(initialCustomPrompt);
    }
  }, [initialCustomPrompt, isOpen]);

  const quickPrompts = [
    summary.isRed ? "O que cortar primeiro para sair do vermelho?" : "Como acelerar minhas metas de economia?",
    `Como reduzir meus gastos com ${summary.topExpenseCategory.category}?`,
    "Como aplicar a regra 50-30-20 na prática?",
    "Onde investir minha reserva de emergência?",
  ];

  const sendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({ role: m.role, text: m.text })),
          financialContext: {
            totalIncome: summary.totalIncome,
            totalExpense: summary.totalExpense,
            totalInvestment: summary.totalInvestment,
            balance: summary.balance,
            netRemaining: summary.netRemaining,
            isRed: summary.isRed,
            topExpenseCategory: summary.topExpenseCategory,
            healthStatus: summary.healthStatus,
            score: summary.financialHealthScore,
            spreadsheetEnvelopes: (() => {
              try {
                const saved = localStorage.getItem('finansmart_sheet_envelopes_v11');
                if (saved) {
                  const envs = JSON.parse(saved);
                  return envs.map((e: any) => ({
                    envelope: `${e.name} (R$ ${e.incomeAmount.toFixed(2)})`,
                    items: (e.items || []).map((i: any) => `${i.description} (R$ ${i.amount.toFixed(2)})`).join(', ') || 'Nenhum item',
                    saldo: `R$ ${(e.finalBalance || 0).toFixed(2)}`,
                  }));
                }
              } catch {}
              return [];
            })(),
            surplus: `R$ ${summary.balance.toFixed(2)} livre`,
          },
        }),
      });

      const data = await response.json();
      const botReply: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'model',
        text: data.reply || data.error || 'Desculpe, tive um problema ao responder. Tente novamente.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botReply]);
    } catch (err: any) {
      console.error(err);
      const fallbackReply: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'model',
        text: summary.isRed
          ? `Para estancar o déficit este mês, sugiro: 1) Estipular um limite rígido de R$ ${Math.max(100, Math.round(summary.topExpenseCategory.amount * 0.7))} para ${summary.topExpenseCategory.category}; 2) Pausar compras a prazo no cartão; 3) Priorizar quitar ou pagar contas essenciais antes de gastos supérfluos.`
          : `Excelente momento para seu patrimônio: Com saldo livre de R$ ${summary.balance.toFixed(2)}, recomendo direcionar 60% dessa sobra para a sua Reserva de Emergência (Tesouro Selic ou CDB 100% CDI) e 40% para objetivos de médio prazo.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackReply]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden overflow-x-hidden touch-pan-y bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div 
        id="gemini-chat-drawer"
        className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-slate-200 overflow-x-hidden"
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-violet-50/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-xs shadow-violet-200">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">FinanSmart AI</h3>
                <span className="text-[10px] font-bold bg-violet-200/80 text-violet-800 px-2 py-0.5 rounded-full">
                  Consultor Pessoal
                </span>
              </div>
              <p className="text-xs text-slate-500">Orientação sob medida para seu orçamento</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Financial Context Pill inside chat */}
        <div className="px-4 py-2 bg-slate-100/70 border-b border-slate-200/60 flex items-center justify-between text-[11px] text-slate-600 font-medium">
          <span>
            Saldo: <strong className={summary.isRed ? 'text-rose-600' : 'text-emerald-700'}>
              R$ {summary.balance.toFixed(2)}
            </strong>
          </span>
          <span>
            Maior gasto: <strong>{summary.topExpenseCategory.category}</strong>
          </span>
          <span className="bg-white px-2 py-0.5 rounded border border-slate-200">
            {summary.healthStatus}
          </span>
        </div>

        {/* Messages Thread (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/30">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-violet-600 text-white flex items-center justify-center shrink-0 text-xs mt-1 shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-slate-900 text-white rounded-br-xs'
                      : 'bg-white border border-slate-200/80 text-slate-800 shadow-xs rounded-bl-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                  <span
                    className={`block text-[10px] mt-1 text-right ${
                      isUser ? 'text-slate-400' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-slate-700 text-white flex items-center justify-center shrink-0 text-xs mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-2.5 items-center text-xs text-slate-500 bg-white border border-slate-200/80 p-3 rounded-2xl w-fit">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-violet-600" />
              <span>Consultor FinanSmart analisando seus dados...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts Chips */}
        <div className="p-3 border-t border-slate-100 bg-white flex items-center gap-2 overflow-x-auto no-scrollbar">
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(prompt)}
              className="text-[11px] whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-100 hover:bg-violet-50 hover:text-violet-800 hover:border-violet-200 text-slate-700 font-medium border border-slate-200/60 transition-all shrink-0"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Input area */}
        <form onSubmit={handleSubmit} className="p-3.5 border-t border-slate-200 bg-white flex items-center gap-2">
          <input
            type="text"
            placeholder="Pergunte sobre gastos, investimentos, dívidas..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-slate-100 text-xs sm:text-sm text-slate-900 px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-violet-600 hover:bg-violet-700 text-white flex items-center justify-center transition-all disabled:opacity-40 shrink-0 shadow-xs shadow-violet-200"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>

      </div>
    </div>
  );
};
