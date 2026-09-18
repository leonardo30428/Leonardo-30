import React, { useState } from 'react';
import { Lightbulb, Sparkles, RefreshCw, CheckCircle, ArrowRight } from 'lucide-react';
import { SmartTip, MonthlySummary } from '../types';

interface SmartSavingTipsProps {
  summary: MonthlySummary;
  onOpenAIChat: (customPrompt?: string) => void;
}

export const SmartSavingTips: React.FC<SmartSavingTipsProps> = ({ summary, onOpenAIChat }) => {
  const [tips, setTips] = useState<SmartTip[]>([
    {
      title: summary.isRed ? "Plano de Choque para Sair do Vermelho" : "Estratégia 50-30-20 Atualizada",
      description: summary.isRed
        ? `Seus gastos excederam as receitas. Congele compras em ${summary.topExpenseCategory.category} e renegocie tarifas fixas para recuperar a margem positiva.`
        : "Mantenha até 50% para necessidades, 30% para estilo de vida e dedique 20% diretamente para seus investimentos e reserva.",
      badge: summary.isRed ? "Prioritário" : "Dica de Ouro",
      category: "Orçamento",
    },
    {
      title: "Auditoria Ativa de Assinaturas e Recorrências",
      description: "Serviços de streaming, delivery frequente e tarifas bancárias podem estar drenando mais de R$ 350 por mês sem você perceber.",
      badge: "Economia",
      category: "Hábitos",
    },
    {
      title: "Aporte Automático no Primeiro Dia",
      description: "Pague-se primeiro: programe uma transferência automática para a corretora ou Tesouro Direto assim que o salário cair na conta.",
      badge: "Construção",
      category: "Investimentos",
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const fetchAiTips = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/financial-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summary }),
      });
      const data = await response.json();
      if (data.tips && Array.isArray(data.tips) && data.tips.length > 0) {
        setTips(data.tips);
      }
    } catch (err) {
      console.error('Erro ao buscar dicas de IA:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
      
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Lightbulb className="w-4.5 h-4.5" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900">
              Dicas Inteligentes de Economia
            </h4>
            <p className="text-xs text-slate-500">Baseadas nos seus resultados mensais</p>
          </div>
        </div>

        <button
          id="btn-refresh-ai-tips"
          onClick={fetchAiTips}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 rounded-lg border border-emerald-200 transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
          ) : (
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          )}
          <span>{isLoading ? 'Gerando...' : 'Atualizar com IA'}</span>
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {tips.map((tip, idx) => (
          <div
            key={idx}
            className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-emerald-300 hover:shadow-xs transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-bold tracking-wider bg-emerald-100/80 text-emerald-800 px-2 py-0.5 rounded">
                  {tip.badge}
                </span>
                <span className="text-[11px] font-medium text-slate-400">
                  {tip.category}
                </span>
              </div>

              <h5 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                {tip.title}
              </h5>

              <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                {tip.description}
              </p>
            </div>

            <button
              onClick={() => onOpenAIChat(`Quero aprofundar sobre esta dica: "${tip.title}". Como aplicar no meu dia a dia?`)}
              className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:text-emerald-800 transition-colors"
            >
              <span>Conversar com IA</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        ))}
      </div>

    </div>
  );
};
