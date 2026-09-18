import React from 'react';
import { 
  X, 
  FileSpreadsheet, 
  PiggyBank, 
  Building2, 
  Bot, 
  RotateCcw, 
  ChevronRight,
  ShieldCheck,
  TrendingUp,
  Sparkles,
  Layers
} from 'lucide-react';
import { formatCurrency } from '../utils/finance';

interface MaisMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToPlanning: () => void;
  onNavigateToInvestimentos: () => void;
  onOpenBankSync: () => void;
  onOpenAIChat: () => void;
  onRestoreSpreadsheet: () => void;
  onToggleAugData: () => void;
  isAugPrintData: boolean;
}

export const MaisMenuModal: React.FC<MaisMenuModalProps> = ({
  isOpen,
  onClose,
  onNavigateToPlanning,
  onNavigateToInvestimentos,
  onOpenBankSync,
  onOpenAIChat,
  onRestoreSpreadsheet,
  onToggleAugData,
  isAugPrintData,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-100 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">Mais Opções</h3>
            <p className="text-xs text-slate-500">Recursos avançados do seu orçamento</p>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Menu list */}
        <div className="p-4 sm:p-5 space-y-2.5 max-h-[70vh] overflow-y-auto">
          
          {/* 1. Planejamento Salarial (Sua Planilha) */}
          <div 
            onClick={() => {
              onClose();
              onNavigateToPlanning();
            }}
            className="p-3.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 cursor-pointer flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  Planejamento Salarial (Planilha)
                </h4>
                <p className="text-[11px] text-emerald-800">
                  Envelopes: Adiantamento, Comissão, Salário • Alocação por Entrada
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-emerald-700 group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* 2. Investimentos & Metas */}
          <div 
            onClick={() => {
              onClose();
              onNavigateToInvestimentos();
            }}
            className="p-3.5 rounded-2xl bg-indigo-50/70 hover:bg-indigo-100/80 border border-indigo-100 cursor-pointer flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <PiggyBank className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  Investimentos & Metas
                </h4>
                <p className="text-[11px] text-slate-500">
                  Tesouro Selic, Caixinha Nubank e reservas
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-700 group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* 3. Contas & Sincronização Bancária */}
          <div 
            onClick={() => {
              onClose();
              onOpenBankSync();
            }}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-100 cursor-pointer flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center shadow-xs">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  Contas Bancárias & Cartões
                </h4>
                <p className="text-[11px] text-slate-500">
                  Itaú, Nubank, Santander e Carteira
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* 4. Assistente IA Gemini */}
          <div 
            onClick={() => {
              onClose();
              onOpenAIChat();
            }}
            className="p-3.5 rounded-2xl bg-violet-50 hover:bg-violet-100/80 border border-violet-100 cursor-pointer flex items-center justify-between transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-violet-600 text-white flex items-center justify-center shadow-xs">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  Assistente Financeiro IA
                </h4>
                <p className="text-[11px] text-slate-500">
                  Dicas personalizadas de economia e conselhos
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-violet-600 group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* 5. Alternar Modo de Exibição de Dados */}
          <div 
            onClick={() => {
              onToggleAugData();
              onClose();
            }}
            className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 cursor-pointer flex items-center justify-between transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-700 text-white flex items-center justify-center shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  {isAugPrintData ? 'Alternar para Minha Planilha' : 'Alternar para Print (Agosto 2026)'}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {isAugPrintData 
                    ? 'Mostrar R$ 3.405,15 de receitas da sua planilha'
                    : 'Mostrar visual exato do print com R$ 30.444,00'}
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
              Alternar
            </span>
          </div>

          {/* 6. Restaurar Valores Originais da Planilha */}
          <div 
            onClick={() => {
              onRestoreSpreadsheet();
              onClose();
            }}
            className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 flex items-center justify-center gap-2 text-xs font-semibold cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurar dados originais da planilha</span>
          </div>

        </div>

        {/* Close button */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
