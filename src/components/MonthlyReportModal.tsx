import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  FileText,
  Download,
  Share2,
  Check,
  Send,
  Printer,
  Sparkles,
  Calendar,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { MonthlySummary, Transaction } from '../types';
import { formatCurrency, calculateSummary } from '../utils/finance';
import { downloadMonthlyPdf, shareOrSendPdf } from '../utils/pdfReport';
import { DEFAULT_MONTHS_LIST, getMonthKey } from '../utils/dateUtils';

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthName: string;
  summary: MonthlySummary;
  transactions: Transaction[];
  allTransactions?: Transaction[];
  availableMonths?: string[];
  onSelectMonth?: (month: string) => void;
}

export const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({
  isOpen,
  onClose,
  monthName,
  summary,
  transactions,
  allTransactions,
  availableMonths,
  onSelectMonth,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(monthName || 'Setembro 2026');
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync selectedMonth with monthName when modal opens or monthName changes
  useEffect(() => {
    if (isOpen) {
      setSelectedMonth(monthName || 'Setembro 2026');
    }
  }, [isOpen, monthName]);

  const monthsList = availableMonths && availableMonths.length > 0 ? availableMonths : DEFAULT_MONTHS_LIST;

  // Compute active transactions and summary for the currently selected month
  const activeTransactions = useMemo(() => {
    const sourcePool = allTransactions && allTransactions.length > 0 ? allTransactions : transactions;
    if (selectedMonth === 'Todos os Meses') {
      return sourcePool;
    }
    const key = getMonthKey(selectedMonth);
    return sourcePool.filter((t) => t.date && t.date.startsWith(key));
  }, [allTransactions, transactions, selectedMonth]);

  const activeSummary = useMemo(() => {
    // If we have access to allTransactions or activeTransactions, calculate fresh
    if (allTransactions && allTransactions.length > 0) {
      return calculateSummary(activeTransactions);
    }
    // Fallback: if selected month matches the original monthName, use the original summary
    if (selectedMonth === monthName) {
      return summary;
    }
    return calculateSummary(activeTransactions);
  }, [allTransactions, activeTransactions, selectedMonth, monthName, summary]);

  const currentIdx = monthsList.indexOf(selectedMonth);
  const isFirstMonth = currentIdx <= 0;
  const isLastMonth = currentIdx >= monthsList.length - 1;

  // Quick navigation chips (surrounding months) - hook placed before early return
  const quickMonths = useMemo(() => {
    const centerIdx = currentIdx >= 0 ? currentIdx : 8;
    const start = Math.max(0, centerIdx - 2);
    const end = Math.min(monthsList.length, start + 5);
    return monthsList.slice(start, end);
  }, [monthsList, currentIdx]);

  const handlePrevMonth = () => {
    if (currentIdx > 0) {
      const prevMonth = monthsList[currentIdx - 1];
      setSelectedMonth(prevMonth);
      onSelectMonth?.(prevMonth);
    }
  };

  const handleNextMonth = () => {
    if (currentIdx >= 0 && currentIdx < monthsList.length - 1) {
      const nextMonth = monthsList[currentIdx + 1];
      setSelectedMonth(nextMonth);
      onSelectMonth?.(nextMonth);
    }
  };

  const handleMonthChange = (newMonth: string) => {
    setSelectedMonth(newMonth);
    if (newMonth !== 'Todos os Meses') {
      onSelectMonth?.(newMonth);
    }
  };

  const handleDownload = () => {
    try {
      setIsGenerating(true);
      downloadMonthlyPdf({
        monthName: selectedMonth,
        summary: activeSummary,
        transactions: activeTransactions,
      });
      setSuccessMessage(`PDF de ${selectedMonth} baixado com sucesso!`);
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShare = async () => {
    try {
      setIsGenerating(true);
      const res = await shareOrSendPdf({
        monthName: selectedMonth,
        summary: activeSummary,
        transactions: activeTransactions,
      });
      if (res.method === 'download') {
        setSuccessMessage('PDF baixado! Pronto para enviar no WhatsApp ou E-mail.');
      } else {
        setSuccessMessage('Relatório compartilhado com sucesso!');
      }
      setTimeout(() => setSuccessMessage(null), 3500);
    } catch (err) {
      console.error('Erro ao compartilhar PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleWhatsAppSend = () => {
    // Monta texto formatado do resumo para envio direto no WhatsApp
    const message = `📊 *Relatório Financeiro - ${selectedMonth}*\n\n` +
      `💰 *Entradas:* ${formatCurrency(activeSummary.totalIncome)}\n` +
      `🔻 *Saídas:* ${formatCurrency(activeSummary.totalExpenses)}\n` +
      `⚖️ *Saldo Líquido:* ${formatCurrency(activeSummary.netBalance)}\n` +
      `⏳ *Pendente a Pagar:* ${formatCurrency(activeSummary.pendingBillsTotal || 0)}\n\n` +
      `📄 _Total de ${activeTransactions.length} lançamentos registrados no FinanSmart._\n` +
      `Baixe o relatório detalhado em PDF no aplicativo!`;

    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleEmailSend = () => {
    const subject = encodeURIComponent(`Relatório Financeiro Mensal - ${selectedMonth}`);
    const body = encodeURIComponent(
      `Olá!\n\nSegue o resumo do relatório financeiro de ${selectedMonth}:\n\n` +
      `- Total de Entradas: ${formatCurrency(activeSummary.totalIncome)}\n` +
      `- Total de Saídas: ${formatCurrency(activeSummary.totalExpenses)}\n` +
      `- Saldo Líquido: ${formatCurrency(activeSummary.netBalance)}\n` +
      `- Contas Pendentes: ${formatCurrency(activeSummary.pendingBillsTotal || 0)}\n` +
      `- Total de lançamentos: ${activeTransactions.length}\n\n` +
      `Gerado automaticamente pelo FinanSmart.`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shadow-emerald-200 dark:shadow-none shrink-0">
              <FileText className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg leading-tight">
                Relatório do Mês em PDF
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Mês Selecionado: <span className="font-bold text-emerald-700 dark:text-emerald-400">{selectedMonth}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {successMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center gap-2.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 stroke-[3]" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* SELETOR DE MESES INTUITIVO */}
          <div className="bg-slate-50 dark:bg-slate-800/70 p-3 sm:p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/70 space-y-2.5">
            <div className="flex items-center justify-between">
              <label 
                htmlFor="select-report-month" 
                className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Escolha o Mês do Relatório:</span>
              </label>

              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/70 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                {activeTransactions.length} {activeTransactions.length === 1 ? 'lançamento' : 'lançamentos'}
              </span>
            </div>

            {/* Dropdown de Meses com botões Anterior / Próximo */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="btn-report-prev-month"
                onClick={handlePrevMonth}
                disabled={isFirstMonth}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs shrink-0"
                title="Mês anterior"
                aria-label="Mês anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="relative flex-1">
                <select
                  id="select-report-month"
                  value={selectedMonth}
                  onChange={(e) => handleMonthChange(e.target.value)}
                  className="w-full appearance-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-extrabold text-xs sm:text-sm rounded-xl py-2.5 pl-3 pr-8 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer shadow-2xs truncate"
                >
                  <option value="Todos os Meses">Todos os Meses (Consolidado Geral)</option>
                  <optgroup label="Selecione um Mês Específico">
                    {monthsList.map((m) => {
                      const mKey = getMonthKey(m);
                      const count = allTransactions ? allTransactions.filter(t => t.date?.startsWith(mKey)).length : 0;
                      return (
                        <option key={m} value={m}>
                          {m} {count > 0 ? `• (${count} lançamentos)` : ''}
                        </option>
                      );
                    })}
                  </optgroup>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-400">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </div>
              </div>

              <button
                type="button"
                id="btn-report-next-month"
                onClick={handleNextMonth}
                disabled={isLastMonth}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-2xs shrink-0"
                title="Próximo mês"
                aria-label="Próximo mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Chips de seleção rápida dos meses próximos */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-0.5 no-scrollbar">
              <button
                type="button"
                onClick={() => handleMonthChange('Todos os Meses')}
                className={`px-2.5 py-1 text-[11px] font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                  selectedMonth === 'Todos os Meses'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                Geral
              </button>
              {quickMonths.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => handleMonthChange(m)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded-lg whitespace-nowrap transition-all cursor-pointer ${
                    selectedMonth === m
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Card Resumo que irá no PDF (Atualizado em tempo real para o mês escolhido) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700/60 text-white shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Resumo de {selectedMonth}
                </span>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-full">
                {activeTransactions.length} Lançamentos
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3">
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Total Entradas</span>
                <span className="text-sm sm:text-base font-black text-emerald-400">
                  {formatCurrency(activeSummary.totalIncome)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Total Saídas</span>
                <span className="text-sm sm:text-base font-black text-rose-400">
                  {formatCurrency(activeSummary.totalExpenses)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Saldo do Mês</span>
                <span className={`text-sm sm:text-base font-black ${activeSummary.netBalance >= 0 ? 'text-white' : 'text-rose-400'}`}>
                  {formatCurrency(activeSummary.netBalance)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Pendente a Pagar</span>
                <span className="text-sm sm:text-base font-black text-amber-400">
                  {formatCurrency(activeSummary.pendingBillsTotal || 0)}
                </span>
              </div>
            </div>
          </div>

          {activeTransactions.length === 0 && (
            <div className="flex items-center gap-2 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl text-xs text-amber-800 dark:text-amber-300">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>Nenhum lançamento registrado para <strong>{selectedMonth}</strong>. Você pode emitir mesmo assim ou selecionar outro mês acima.</span>
            </div>
          )}

          <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3.5 space-y-1.5">
            <p className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              O PDF gerado inclui:
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-slate-600 dark:text-slate-400 pl-1 text-[11px]">
              <li>Cabeçalho com data de emissão e referência do mês ({selectedMonth})</li>
              <li>Quadro executivo com total de receitas, despesas e saldo</li>
              <li>Distribuição percentual de gastos por categoria</li>
              <li>Tabela completa com todos os lançamentos e descrições integrais</li>
            </ul>
          </div>

          {/* Ações de Envio e Download */}
          <div className="space-y-2.5 pt-1">
            
            {/* Botão Principal: Baixar PDF */}
            <button
              type="button"
              id="btn-baixar-relatorio-pdf"
              onClick={handleDownload}
              disabled={isGenerating}
              className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold text-sm shadow-md shadow-emerald-600/25 transition-all cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4 stroke-[2.5]" />
              <span>{isGenerating ? 'Gerando PDF...' : `Baixar Relatório de ${selectedMonth}`}</span>
            </button>

            {/* Compartilhar / Enviar Direto */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                id="btn-compartilhar-pdf"
                onClick={handleShare}
                disabled={isGenerating}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs shadow-xs transition-all cursor-pointer"
                title="Compartilhar arquivo PDF"
              >
                <Share2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Compartilhar PDF</span>
              </button>

              <button
                type="button"
                id="btn-enviar-whatsapp"
                onClick={handleWhatsAppSend}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/50 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 font-bold text-xs transition-all cursor-pointer"
                title="Enviar resumo formatado via WhatsApp"
              >
                <Send className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Enviar no WhatsApp</span>
              </button>
            </div>

            {/* Opção secundária: E-mail */}
            <button
              type="button"
              onClick={handleEmailSend}
              className="w-full py-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
            >
              Enviar resumo por E-mail
            </button>

          </div>

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-xl hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};

