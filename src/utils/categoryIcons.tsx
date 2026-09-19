import React from 'react';
import { 
  Utensils, 
  ShoppingCart, 
  Users, 
  Home, 
  Car, 
  CreditCard, 
  Wifi, 
  Phone, 
  HeartPulse, 
  Pill, 
  Sparkles, 
  GraduationCap, 
  Tv, 
  Music, 
  Shirt, 
  Briefcase, 
  Wallet, 
  PiggyBank, 
  Tag, 
  Building2,
  LucideIcon
} from 'lucide-react';
import { getTodayDateString } from './finance';

export interface CategoryVisual {
  icon: LucideIcon;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

export function getCategoryVisual(categoryName?: string): CategoryVisual {
  const cat = (categoryName || '').toLowerCase().trim();

  if (cat.includes('alimenta') || cat.includes('restaurante') || cat.includes('lanche') || cat.includes('comida')) {
    return {
      icon: Utensils,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-600',
      borderColor: 'border-orange-200/80',
    };
  }

  if (cat.includes('supermercado') || cat.includes('mercado') || cat.includes('feira') || cat.includes('compras')) {
    return {
      icon: ShoppingCart,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      borderColor: 'border-amber-200/80',
    };
  }

  if (cat.includes('pens') || cat.includes('filho') || cat.includes('menino') || cat.includes('família') || cat.includes('familia')) {
    return {
      icon: Users,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200/80',
    };
  }

  if (cat.includes('aluguel') || cat.includes('moradia') || cat.includes('casa') || cat.includes('condom') || cat.includes('iptu')) {
    return {
      icon: Home,
      bgColor: 'bg-sky-50',
      textColor: 'text-sky-600',
      borderColor: 'border-sky-200/80',
    };
  }

  if (cat.includes('transporte') || cat.includes('uber') || cat.includes('combust') || cat.includes('gasolina') || cat.includes('carro')) {
    return {
      icon: Car,
      bgColor: 'bg-teal-50',
      textColor: 'text-teal-600',
      borderColor: 'border-teal-200/80',
    };
  }

  if (cat.includes('cartão') || cat.includes('cartao') || cat.includes('fatura') || cat.includes('nubank')) {
    return {
      icon: CreditCard,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-200/80',
    };
  }

  if (cat.includes('internet') || cat.includes('wifi')) {
    return {
      icon: Wifi,
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      borderColor: 'border-indigo-200/80',
    };
  }

  if (cat.includes('telefone') || cat.includes('celular') || cat.includes('recarga')) {
    return {
      icon: Phone,
      bgColor: 'bg-cyan-50',
      textColor: 'text-cyan-600',
      borderColor: 'border-cyan-200/80',
    };
  }

  if (cat.includes('saúde') || cat.includes('saude') || cat.includes('médico') || cat.includes('medico') || cat.includes('dentista') || cat.includes('hospital')) {
    return {
      icon: HeartPulse,
      bgColor: 'bg-rose-50',
      textColor: 'text-rose-600',
      borderColor: 'border-rose-200/80',
    };
  }

  if (cat.includes('farmácia') || cat.includes('farmacia') || cat.includes('remédio') || cat.includes('remedio')) {
    return {
      icon: Pill,
      bgColor: 'bg-red-50',
      textColor: 'text-red-600',
      borderColor: 'border-red-200/80',
    };
  }

  if (cat.includes('lazer') || cat.includes('viagem') || cat.includes('passeio') || cat.includes('cinema')) {
    return {
      icon: Sparkles,
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
      borderColor: 'border-pink-200/80',
    };
  }

  if (cat.includes('educa') || cat.includes('curso') || cat.includes('escola') || cat.includes('faculdade')) {
    return {
      icon: GraduationCap,
      bgColor: 'bg-violet-50',
      textColor: 'text-violet-600',
      borderColor: 'border-violet-200/80',
    };
  }

  if (cat.includes('assinatura') || cat.includes('streaming') || cat.includes('netflix') || cat.includes('spotify')) {
    return {
      icon: Tv,
      bgColor: 'bg-fuchsia-50',
      textColor: 'text-fuchsia-600',
      borderColor: 'border-fuchsia-200/80',
    };
  }

  if (cat.includes('vestuário') || cat.includes('vestuario') || cat.includes('roupa') || cat.includes('calçado')) {
    return {
      icon: Shirt,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      borderColor: 'border-emerald-200/80',
    };
  }

  if (cat.includes('salário') || cat.includes('salario') || cat.includes('renda') || cat.includes('trabalho') || cat.includes('freelance') || cat.includes('bônus')) {
    return {
      icon: Briefcase,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200/80',
    };
  }

  if (cat.includes('invest') || cat.includes('reserva') || cat.includes('cdb') || cat.includes('selic') || cat.includes('ações')) {
    return {
      icon: PiggyBank,
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-700',
      borderColor: 'border-indigo-200/80',
    };
  }

  return {
    icon: Tag,
    bgColor: 'bg-slate-100',
    textColor: 'text-slate-600',
    borderColor: 'border-slate-200/80',
  };
}

/**
 * Formata a data para formato curto:
 * Se for a data de hoje (ou paga hoje): 'Hoje'
 * Se não: ex '16 de set', '25 de out', '18 de set'
 */
export function formatShortDateWithMonth(dateStr?: string, isPaidToday?: boolean): string {
  if (isPaidToday) return 'Hoje';
  if (!dateStr) return '';
  const today = getTodayDateString();
  if (dateStr === today) {
    return 'Hoje';
  }
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const day = parseInt(parts[2], 10);
  const monthIndex = parseInt(parts[1], 10) - 1;
  const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
  const monthName = months[monthIndex] || '';
  return `${day} de ${monthName}`;
}
