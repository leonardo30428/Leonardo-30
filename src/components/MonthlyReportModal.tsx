import React, { useState } from 'react';
import {
  X,
  FileText,
  Download,
  Share2,
  Check,
  Send,
  Printer,
  Sparkles,
  ArrowDownRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { MonthlySummary, Transaction } from '../types';
import { formatCurrency } from '../utils/finance';
import { downloadMonthlyPdf, shareOrSendPdf } from '../utils/pdfReport';

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  monthName: string;
  summary: MonthlySummary;
  transactions: Transaction[];
}

export const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({
  isOpen,
  onClose,
  monthName,
  summary,
  transactions,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = () => {
    try {
      setIsGenerating(true);
      downloadMonthlyPdf({
        monthName,
        summary,
        transactions,
      });
      setSuccessMessage('PDF baixado com sucesso!');
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
        monthName,
        summary,
        transactions,
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
    const message = `📊 *Relatório Financeiro - ${monthName}*\n\n` +
      `💰 *Receitas:* ${formatCurrency(summary.totalIncome)}\n` +
      `🔻 *Despesas:* ${formatCurrency(summary.totalExpenses)}\n` +
      `⚖️ *Saldo Líquido:* ${formatCurrency(summary.netBalance)}\n` +
      `⏳ *Pendente a Pagar:* ${formatCurrency(summary.pendingBillsTotal || 0)}\n\n` +
      `📄 _Total de ${transactions.length} lançamentos registrados no FinanSmart._\n` +
      `Baixe o relatório detalhado em PDF no aplicativo!`;

    const encoded = encodeURIComponent(message);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleEmailSend = () => {
    const subject = encodeURIComponent(`Relatório Financeiro Mensal - ${monthName}`);
    const body = encodeURIComponent(
      `Olá!\n\nSegue o resumo do relatório financeiro de ${monthName}:\n\n` +
      `- Total de Receitas: ${formatCurrency(summary.totalIncome)}\n` +
      `- Total de Despesas: ${formatCurrency(summary.totalExpenses)}\n` +
      `- Saldo Líquido: ${formatCurrency(summary.netBalance)}\n` +
      `- Contas Pendentes: ${formatCurrency(summary.pendingBillsTotal || 0)}\n` +
      `- Total de lançamentos: ${transactions.length}\n\n` +
      `Gerado automaticamente pelo FinanSmart.`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div 
        className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-sm shadow-emerald-200">
              <FileText className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg leading-tight">
                Relatório do Mês em PDF
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Mês de Referência: <span className="font-bold text-slate-800">{monthName}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          
          {successMessage && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs font-bold text-emerald-800 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[3]" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Card Resumo que irá no PDF */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/60">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Resumo do Documento
              </span>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800 px-2 py-0.5 rounded-full">
                {transactions.length} Lançamentos
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3">
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Total Entradas</span>
                <span className="text-sm sm:text-base font-black text-emerald-400">
                  {formatCurrency(summary.totalIncome)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Total Saídas</span>
                <span className="text-sm sm:text-base font-black text-rose-400">
                  {formatCurrency(summary.totalExpenses)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Saldo do Mês</span>
                <span className={`text-sm sm:text-base font-black ${summary.netBalance >= 0 ? 'text-white' : 'text-rose-400'}`}>
                  {formatCurrency(summary.netBalance)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 font-medium block">Pendente a Pagar</span>
                <span className="text-sm sm:text-base font-black text-amber-400">
                  {formatCurrency(summary.pendingBillsTotal || 0)}
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1.5">
            <p className="font-bold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              O PDF gerado inclui:
            </p>
            <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1 text-[11px]">
              <li>Cabeçalho com data de emissão e referência do mês</li>
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
              <span>{isGenerating ? 'Gerando PDF...' : 'Baixar Relatório em PDF'}</span>
            </button>

            {/* Compartilhar / Enviar Direto */}
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                id="btn-compartilhar-pdf"
                onClick={handleShare}
                disabled={isGenerating}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-xs transition-all cursor-pointer"
                title="Compartilhar arquivo PDF"
              >
                <Share2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Compartilhar PDF</span>
              </button>

              <button
                type="button"
                id="btn-enviar-whatsapp"
                onClick={handleWhatsAppSend}
                className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl border border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70 text-emerald-800 font-bold text-xs transition-all cursor-pointer"
                title="Enviar resumo formatado via WhatsApp"
              >
                <Send className="w-3.5 h-3.5 text-emerald-600" />
                <span>Enviar no WhatsApp</span>
              </button>
            </div>

            {/* Opção secundária: E-mail */}
            <button
              type="button"
              onClick={handleEmailSend}
              className="w-full py-2 text-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Enviar resumo por E-mail
            </button>

          </div>

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
