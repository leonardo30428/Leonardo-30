import { jsPDF } from 'jspdf';
import { Transaction, MonthlySummary } from '../types';
import { formatCurrency, formatDateBR, isTransactionPending } from './finance';

export interface GeneratePdfOptions {
  monthName: string;
  summary: MonthlySummary;
  transactions: Transaction[];
  recipientEmail?: string;
}

export function generateMonthlyPdfDoc({
  monthName,
  summary,
  transactions,
}: GeneratePdfOptions): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let y = 16;

  // Helper to add new page if needed
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 16) {
      doc.addPage();
      y = 16;
      return true;
    }
    return false;
  };

  // Header Background bar
  doc.setFillColor(16, 185, 129); // Emerald-500
  doc.rect(margin, y, pageWidth - margin * 2, 22, 'F');

  // Header Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('FinanSmart - Relatório Financeiro Mensal', margin + 6, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text(`Mês de Referência: ${monthName}  |  Gerado em: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, margin + 6, y + 16);

  y += 28;

  // Cards de Resumo Executivo (4 colunas)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.text('Resumo Financeiro do Mês', margin, y);
  y += 5;

  const cardWidth = (pageWidth - margin * 2 - 9) / 4;
  const cardHeight = 18;

  // Receitas
  doc.setFillColor(236, 253, 245); // Emerald-50
  doc.setDrawColor(167, 243, 208); // Emerald-200
  doc.roundedRect(margin, y, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(6, 95, 70);
  doc.text('TOTAL RECEITAS', margin + 3, y + 6);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(summary.totalIncome), margin + 3, y + 13);

  // Despesas
  const c2x = margin + cardWidth + 3;
  doc.setFillColor(255, 241, 242); // Rose-50
  doc.setDrawColor(254, 205, 211); // Rose-200
  doc.roundedRect(c2x, y, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(159, 18, 57);
  doc.text('TOTAL DESPESAS', c2x + 3, y + 6);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(summary.totalExpense), c2x + 3, y + 13);

  // Saldo
  const c3x = c2x + cardWidth + 3;
  const isPositive = summary.balance >= 0;
  doc.setFillColor(isPositive ? 240 : 254, isPositive ? 253 : 242, isPositive ? 244 : 242);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(c3x, y, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(isPositive ? 22 : 159, isPositive ? 101 : 18, isPositive ? 52 : 57);
  doc.text('SALDO DO MÊS', c3x + 3, y + 6);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(summary.balance), c3x + 3, y + 13);

  // Pendente a Pagar
  const pendingBillsTotal = transactions
    .filter((t) => t.type === 'expense' && (t.isPaid === false || isTransactionPending(t)))
    .reduce((acc, t) => acc + t.amount, 0);

  const c4x = c3x + cardWidth + 3;
  doc.setFillColor(254, 243, 199); // Amber-50
  doc.setDrawColor(253, 230, 138); // Amber-200
  doc.roundedRect(c4x, y, cardWidth, cardHeight, 2, 2, 'FD');
  doc.setFontSize(7.5);
  doc.setTextColor(146, 64, 14);
  doc.text('PENDENTE A PAGAR', c4x + 3, y + 6);
  doc.setFontSize(10.5);
  doc.setFont('helvetica', 'bold');
  doc.text(formatCurrency(pendingBillsTotal), c4x + 3, y + 13);

  y += cardHeight + 9;

  // Despesas por Categoria
  const categoryMap: { [cat: string]: number } = {};
  transactions
    .filter((t) => t.type === 'expense')
    .forEach((t) => {
      const cat = t.category || 'Outros';
      categoryMap[cat] = (categoryMap[cat] || 0) + t.amount;
    });

  const categories = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);

  if (categories.length > 0) {
    checkPageBreak(35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text('Gastos por Categoria', margin, y);
    y += 5;

    // Mini tabela de categorias
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, pageWidth - margin * 2, 7, 'F');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text('Categoria', margin + 3, y + 4.8);
    doc.text('Participação', margin + 70, y + 4.8);
    doc.text('Valor Total', pageWidth - margin - 25, y + 4.8);
    y += 7;

    categories.slice(0, 6).forEach(([cat, val]) => {
      checkPageBreak(7);
      const pct = summary.totalExpense > 0 ? ((val / summary.totalExpense) * 100).toFixed(1) : '0';
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(30, 41, 59);
      doc.text(cat, margin + 3, y + 4.5);
      doc.text(`${pct}%`, margin + 70, y + 4.5);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(val), pageWidth - margin - 25, y + 4.5);

      // Linha sutil separadora
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y + 6.5, pageWidth - margin, y + 6.5);
      y += 6.5;
    });

    y += 6;
  }

  // Tabela Completa de Transações
  checkPageBreak(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`Detalhamento dos Lançamentos (${transactions.length} registros)`, margin, y);
  y += 5;

  // Cabeçalho da Tabela
  const tableHeaders = () => {
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(margin, y, pageWidth - margin * 2, 7.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text('Data', margin + 2, y + 5);
    doc.text('Descrição Completa', margin + 22, y + 5);
    doc.text('Categoria / Banco', margin + 85, y + 5);
    doc.text('Status', margin + 135, y + 5);
    doc.text('Valor', pageWidth - margin - 22, y + 5);
    y += 8;
  };

  tableHeaders();

  // Ordenar transações por data decrescente
  const sortedTx = [...transactions].sort((a, b) => (b.date || '').localeCompare(a.date || ''));

  sortedTx.forEach((tx, idx) => {
    // Calcular altura necessária para a descrição completa
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    // splitTextToSize garante que o texto da descrição NUNCA seja cortado
    const descLines = doc.splitTextToSize(tx.description || '-', 58);
    const rowHeight = Math.max(7, descLines.length * 4.2 + 3);

    if (checkPageBreak(rowHeight + 8)) {
      tableHeaders();
    }

    // Fundo zebrado
    if (idx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(margin, y, pageWidth - margin * 2, rowHeight, 'F');
    }

    // Data
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(formatDateBR(tx.date), margin + 2, y + 4.5);

    // Descrição completa
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(15, 23, 42);
    doc.text(descLines, margin + 22, y + 4.5);

    // Categoria & Banco
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    const catBankText = `${tx.category || '-'} (${tx.bankName || 'Nubank'})`;
    const catBankLines = doc.splitTextToSize(catBankText, 45);
    doc.text(catBankLines, margin + 85, y + 4.5);

    // Status
    const isPaid = tx.isPaid !== false;
    doc.setFontSize(7.5);
    if (isPaid) {
      doc.setTextColor(16, 185, 129); // emerald-600
      doc.text('Pago / Recebido', margin + 135, y + 4.5);
    } else {
      doc.setTextColor(225, 29, 72); // rose-600
      doc.text('Pendente', margin + 135, y + 4.5);
    }

    // Valor com cor por tipo
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    if (tx.type === 'income') {
      doc.setTextColor(5, 150, 105); // emerald
      doc.text(`+ ${formatCurrency(tx.amount)}`, pageWidth - margin - 22, y + 4.5);
    } else if (tx.type === 'investment') {
      doc.setTextColor(79, 70, 229); // indigo
      doc.text(formatCurrency(tx.amount), pageWidth - margin - 22, y + 4.5);
    } else {
      doc.setTextColor(225, 29, 72); // rose
      doc.text(`- ${formatCurrency(tx.amount)}`, pageWidth - margin - 22, y + 4.5);
    }

    // Linha divisória fina
    doc.setDrawColor(241, 245, 249);
    doc.line(margin, y + rowHeight, pageWidth - margin, y + rowHeight);

    y += rowHeight;
  });

  // Rodapé em todas as páginas com numeração
  const totalPages = (doc.internal as any).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `FinanSmart - Relatório emitido em ${new Date().toLocaleDateString('pt-BR')} - Página ${i} de ${totalPages}`,
      pageWidth / 2,
      pageHeight - 7,
      { align: 'center' }
    );
  }

  return doc;
}

export function downloadMonthlyPdf(options: GeneratePdfOptions): void {
  const doc = generateMonthlyPdfDoc(options);
  const cleanMonth = options.monthName.replace(/\s+/g, '_').toLowerCase();
  doc.save(`Relatorio_Financeiro_${cleanMonth}.pdf`);
}

export async function shareOrSendPdf(options: GeneratePdfOptions): Promise<{ success: boolean; method: string }> {
  const doc = generateMonthlyPdfDoc(options);
  const cleanMonth = options.monthName.replace(/\s+/g, '_').toLowerCase();
  const fileName = `Relatorio_Financeiro_${cleanMonth}.pdf`;

  const blob = doc.output('blob');
  const file = new File([blob], fileName, { type: 'application/pdf' });

  // Se o navegador suportar Web Share API com arquivos
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: `Relatório Financeiro - ${options.monthName}`,
        text: `Segue o relatório financeiro do mês de ${options.monthName} gerado pelo FinanSmart.`,
        files: [file],
      });
      return { success: true, method: 'share' };
    } catch (err) {
      console.warn('Compartilhamento cancelado ou falhou, fazendo download:', err);
    }
  }

  // Fallback para download direto
  doc.save(fileName);
  return { success: true, method: 'download' };
}
