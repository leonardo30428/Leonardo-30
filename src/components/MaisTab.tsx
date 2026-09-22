import React, { useState } from 'react';
import { 
  Settings, 
  Search, 
  FileText, 
  ChevronRight, 
  ArrowLeft, 
  Sun, 
  Moon, 
  Smartphone, 
  Check, 
  X,
  SlidersHorizontal,
  FileSpreadsheet
} from 'lucide-react';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import { Transaction } from '../types';
import { TransactionsList, TransactionFilterType } from './TransactionsList';
import { RelatorioTab } from './RelatorioTab';

interface MaisTabProps {
  transactions: Transaction[];
  currentMonthTransactions: Transaction[];
  currentMonth: string;
  availableMonths?: string[];
  onDeleteTransaction: (id: string) => void;
  onToggleTransactionPaid: (id: string) => void;
  onClearHistory: (scope: 'currentMonth' | 'all') => void;
  onEditTransaction: (transaction: Transaction) => void;
  onOpenMonthlyPdfReport: () => void;
  activeFilter: TransactionFilterType;
  onChangeFilter: (filter: TransactionFilterType) => void;
  historyScope: 'currentMonth' | 'all';
  onChangeHistoryScope: (scope: 'currentMonth' | 'all') => void;
  onSelectMonth?: (month: string) => void;
}

export const MaisTab: React.FC<MaisTabProps> = ({
  transactions,
  currentMonthTransactions,
  currentMonth,
  availableMonths,
  onDeleteTransaction,
  onToggleTransactionPaid,
  onClearHistory,
  onEditTransaction,
  onOpenMonthlyPdfReport,
  activeFilter,
  onChangeFilter,
  historyScope,
  onChangeHistoryScope,
  onSelectMonth,
}) => {
  const { themeMode, setThemeMode } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeView, setActiveView] = useState<'menu' | 'analisar' | 'relatorio'>('menu');

  const themeOptions: { id: ThemeMode; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: 'system',
      label: 'Padrão do Aparelho',
      desc: 'Segue o tema do seu celular ou computador',
      icon: <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
    },
    {
      id: 'light',
      label: 'Tema Claro',
      desc: 'Fundo branco limpo com alto contraste',
      icon: <Sun className="w-5 h-5 text-amber-500" />,
    },
    {
      id: 'dark',
      label: 'Tema Escuro',
      desc: 'Tons escuros confortáveis para a visão',
      icon: <Moon className="w-5 h-5 text-indigo-400" />,
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Topo da Aba Mais: Título à esquerda e Ícone de Configurações à direita (oculto no Relatório) */}
      {activeView !== 'relatorio' && (
        <div className="flex items-center justify-between bg-white dark:bg-slate-900 px-5 py-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xs transition-colors">
          <div className="flex items-center gap-3">
            {activeView !== 'menu' && (
              <button
                onClick={() => setActiveView('menu')}
                className="p-2 -ml-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
                title="Voltar para Mais opções"
                aria-label="Voltar"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {activeView === 'analisar' 
                  ? 'Análise e Histórico' 
                  : 'Mais'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {activeView === 'analisar' 
                  ? 'Histórico de transações registradas' 
                  : 'Recursos adicionais e configurações'}
              </p>
            </div>
          </div>

          {/* Ícone de Configurações no Topo */}
          <button
            id="btn-mais-configuracoes"
            onClick={() => setIsSettingsOpen(true)}
            className="p-2.5 sm:p-3 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700 rounded-2xl transition-colors border border-slate-200/70 dark:border-slate-700 cursor-pointer"
            title="Configurações e Tema"
            aria-label="Abrir Configurações"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* CONTEÚDO PRINCIPAL: MENU DE OPÇÕES */}
      {activeView === 'menu' && (
        <div className="space-y-3.5">
          
          {/* Opção 1: Analisar */}
          <div
            id="card-opcao-analisar"
            onClick={() => setActiveView('analisar')}
            className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-emerald-300 dark:hover:border-emerald-800/80 hover:shadow-xs transition-all cursor-pointer group flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <Search className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                  Analisar
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Histórico de transações registradas, pesquisa e filtros
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </div>

          {/* Opção 2: Relatório Personalizado (em baixo de Analisar) */}
          <div
            id="card-opcao-relatorio-personalizado"
            onClick={() => setActiveView('relatorio')}
            className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-800/80 hover:shadow-xs transition-all cursor-pointer group flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                <FileText className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                  Relatório personalizado
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Demonstrativo por período, gráfico de categorias e resumo completo
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
          </div>

        </div>
      )}

      {/* CONTEÚDO DA VISÃO 'RELATÓRIO PERSONALIZADO' */}
      {activeView === 'relatorio' && (
        <div className="space-y-6 animate-fadeIn">
          <RelatorioTab
            transactions={transactions}
            currentMonth={currentMonth}
            availableMonths={availableMonths}
            onSelectMonth={onSelectMonth}
            onBack={() => setActiveView('menu')}
          />
        </div>
      )}

      {/* CONTEÚDO DA VISÃO 'ANALISAR' (Histórico de transações com filtros e ações) */}
      {activeView === 'analisar' && (
        <div className="space-y-6 animate-fadeIn">
          
          {/* Seletor de Escopo: Apenas o Mês Atual ou Todos os Meses */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xs transition-colors">
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                Transações Registradas
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Consulte todos os lançamentos ou filtre pelo mês de referência.
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 transition-colors">
              <button
                onClick={() => onChangeHistoryScope('currentMonth')}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  historyScope === 'currentMonth'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Apenas {currentMonth} ({currentMonthTransactions.length})
              </button>
              <button
                onClick={() => onChangeHistoryScope('all')}
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
            onDeleteTransaction={onDeleteTransaction}
            onToggleTransactionPaid={onToggleTransactionPaid}
            onClearHistory={onClearHistory}
            onEditTransaction={onEditTransaction}
            onOpenMonthlyPdfReport={onOpenMonthlyPdfReport}
            currentMonthName={historyScope === 'currentMonth' ? currentMonth : 'Todos os Meses'}
            activeFilter={activeFilter}
            onChangeFilter={onChangeFilter}
          />
        </div>
      )}

      {/* MODAL DE CONFIGURAÇÕES (ABERTO AO CLICAR NO ÍCONE DE CONFIGURAÇÕES) */}
      {isSettingsOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
          onClick={() => setIsSettingsOpen(false)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-scaleUp p-5 sm:p-6 space-y-5 transition-colors"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header do Modal de Configurações */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Configurações
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Preferências do aplicativo
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Seção: Aparência e Tema */}
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-400">
                  Aparência e Tema
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Escolha como o aplicativo será exibido no seu dispositivo.
                </p>
              </div>

              <div className="space-y-2">
                {themeOptions.map((opt) => {
                  const isSelected = themeMode === opt.id;
                  return (
                    <button
                      key={opt.id}
                      id={`settings-theme-option-${opt.id}`}
                      onClick={() => setThemeMode(opt.id)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-2xl text-left transition-all cursor-pointer border ${
                        isSelected 
                          ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-slate-900 dark:text-white shadow-xs' 
                          : 'bg-slate-50/70 dark:bg-slate-800/50 border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="shrink-0 p-2 bg-slate-100 dark:bg-slate-800 rounded-xl shadow-2xs border border-slate-200/60 dark:border-slate-700">
                          {opt.icon}
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs sm:text-sm font-bold block leading-tight truncate">
                            {opt.label}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block truncate mt-0.5">
                            {opt.desc}
                          </span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 ml-2">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Botão Concluir */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setIsSettingsOpen(false)}
                className="w-full py-3 bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 font-bold rounded-2xl transition-colors cursor-pointer text-xs sm:text-sm shadow-xs"
              >
                Concluir
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
