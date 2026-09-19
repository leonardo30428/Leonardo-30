// Utilitários de data e propagação de meses para o FinanSmart

export const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const MONTH_NUMBER_MAP: Record<string, string> = {
  Janeiro: '01',
  Fevereiro: '02',
  Março: '03',
  Abril: '04',
  Maio: '05',
  Junho: '06',
  Julho: '07',
  Agosto: '08',
  Setembro: '09',
  Outubro: '10',
  Novembro: '11',
  Dezembro: '12',
};

/**
 * Converte nome do mês formatado (ex: "Setembro 2026" ou "Janeiro 2027") para chave YYYY-MM
 */
export function getMonthKey(monthName: string): string {
  if (!monthName) return '2026-09';
  const parts = monthName.trim().split(' ');
  const name = parts[0] || 'Setembro';
  const year = parts[1] || '2026';
  const monthNum = MONTH_NUMBER_MAP[name] || '09';
  return `${year}-${monthNum}`;
}

/**
 * Converte chave YYYY-MM para nome legível (ex: "2027-01" -> "Janeiro 2027")
 */
export function formatMonthKeyToName(yearMonth: string): string {
  if (!yearMonth) return 'Setembro 2026';
  const [yearStr, monthStr] = yearMonth.split('-');
  const mIndex = parseInt(monthStr, 10) - 1;
  const name = MONTH_NAMES[mIndex] || 'Setembro';
  return `${name} ${yearStr || '2026'}`;
}

/**
 * Soma N meses a uma data YYYY-MM-DD.
 * Cuida automaticamente da virada de ano (dezembro -> janeiro do ano seguinte)
 * e do ajuste para o último dia do mês (ex: 31 de janeiro + 1 mês = 28 ou 29 de fevereiro).
 */
export function addMonthsToDate(dateStr: string, monthsToAdd: number): string {
  if (!dateStr) return dateStr;
  const parts = dateStr.split('-');
  const year = parseInt(parts[0], 10) || 2026;
  const month = parseInt(parts[1], 10) || 9; // 1 a 12
  const day = parseInt(parts[2], 10) || 10;

  const totalMonths = year * 12 + (month - 1) + monthsToAdd;
  const newYear = Math.floor(totalMonths / 12);
  const newMonth = (totalMonths % 12) + 1;

  // Dias no novo mês (passar dia 0 para o mês seguinte retorna o total de dias do mês desejado)
  const daysInNewMonth = new Date(newYear, newMonth, 0).getDate();
  const newDay = Math.min(day, daysInNewMonth);

  const formattedMonth = String(newMonth).padStart(2, '0');
  const formattedDay = String(newDay).padStart(2, '0');

  return `${newYear}-${formattedMonth}-${formattedDay}`;
}

/**
 * Remove qualquer sufixo de parcelas como "(1/3)" ou "(10/12)" do final da descrição
 */
export function cleanInstallmentDescription(desc: string): string {
  if (!desc) return '';
  return desc.replace(/\s*\(\d+\/\d+\)$/, '').trim();
}

/**
 * Lista de meses padrão do app (2026 a 2027 completo, cobrindo a virada de ano)
 */
export const DEFAULT_MONTHS_LIST: string[] = [
  'Janeiro 2026',
  'Fevereiro 2026',
  'Março 2026',
  'Abril 2026',
  'Maio 2026',
  'Junho 2026',
  'Julho 2026',
  'Agosto 2026',
  'Setembro 2026',
  'Outubro 2026',
  'Novembro 2026',
  'Dezembro 2026',
  'Janeiro 2027',
  'Fevereiro 2027',
  'Março 2027',
  'Abril 2027',
  'Maio 2027',
  'Junho 2027',
  'Julho 2027',
  'Agosto 2027',
  'Setembro 2027',
  'Outubro 2027',
  'Novembro 2027',
  'Dezembro 2027',
];
