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
  Baby,
  Dog,
  Dumbbell,
  Coffee,
  Plane,
  Gift,
  Film,
  Heart,
  LucideIcon
} from 'lucide-react';
import { getTodayDateString } from './finance';

export interface CategoryVisual {
  icon: LucideIcon;
  bgColor: string;
  textColor: string;
  borderColor: string;
}

const CUSTOM_ICON_MAP: Record<string, LucideIcon> = {
  Utensils,
  ShoppingCart,
  Home,
  Car,
  Heart,
  Briefcase,
  GraduationCap,
  Plane,
  Dumbbell,
  Coffee,
  Smartphone: Phone,
  Gift,
  Dog,
  DollarSign: Wallet,
  PiggyBank,
  CreditCard,
  Music,
  Film,
  Sparkles,
  Baby,
  Users,
  Tag,
};

export function getCategoryVisual(categoryName?: string): CategoryVisual {
  const cat = (categoryName || '').toLowerCase().trim();

  // 1. Verificar se há metadados de categoria personalizada salvos pelo usuário
  if (typeof window !== 'undefined' && categoryName) {
    try {
      const metaRaw = localStorage.getItem('finance_user_custom_categories_metadata');
      if (metaRaw) {
        const meta = JSON.parse(metaRaw);
        if (meta[categoryName]?.icon && CUSTOM_ICON_MAP[meta[categoryName].icon]) {
          return {
            icon: CUSTOM_ICON_MAP[meta[categoryName].icon],
            bgColor: 'bg-slate-100 dark:bg-slate-800',
            textColor: 'text-slate-700 dark:text-slate-200',
            borderColor: 'border-slate-200 dark:border-slate-700',
          };
        }
      }
    } catch {
      // fallback silencioso
    }
  }

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

  // Pensão alimentícia / Família / Filhos
  if (cat.includes('pens') || cat.includes('filho') || cat.includes('menino') || cat.includes('família') || cat.includes('familia') || cat.includes('criança') || cat.includes('crianca')) {
    return {
      icon: Baby,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      borderColor: 'border-blue-200/80',
    };
  }

  if (cat.includes('aluguel') || cat.includes('moradia') || cat.includes('casa') || cat.includes('condom') || cat.includes('iptu') || cat.includes('imóvel') || cat.includes('imovel')) {
    return {
      icon: Home,
      bgColor: 'bg-sky-50',
      textColor: 'text-sky-600',
      borderColor: 'border-sky-200/80',
    };
  }

  if (cat.includes('transporte') || cat.includes('uber') || cat.includes('combust') || cat.includes('gasolina') || cat.includes('carro') || cat.includes('moto') || cat.includes('veículo') || cat.includes('veiculo')) {
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

  if (cat.includes('saúde') || cat.includes('saude') || cat.includes('médico') || cat.includes('medico') || cat.includes('dentista') || cat.includes('hospital') || cat.includes('exame')) {
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

  if (cat.includes('lazer') || cat.includes('passeio')) {
    return {
      icon: Sparkles,
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600',
      borderColor: 'border-pink-200/80',
    };
  }

  if (cat.includes('viagem') || cat.includes('voo') || cat.includes('hotel') || cat.includes('passagem')) {
    return {
      icon: Plane,
      bgColor: 'bg-sky-50',
      textColor: 'text-sky-600',
      borderColor: 'border-sky-200/80',
    };
  }

  if (cat.includes('academia') || cat.includes('fitness') || cat.includes('treino') || cat.includes('esporte')) {
    return {
      icon: Dumbbell,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      borderColor: 'border-emerald-200/80',
    };
  }

  if (cat.includes('café') || cat.includes('cafe') || cat.includes('bar') || cat.includes('padaria')) {
    return {
      icon: Coffee,
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      borderColor: 'border-amber-200/80',
    };
  }

  if (cat.includes('pet') || cat.includes('animal') || cat.includes('veterinário') || cat.includes('veterinario') || cat.includes('cachorro') || cat.includes('gato')) {
    return {
      icon: Dog,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      borderColor: 'border-yellow-200/80',
    };
  }

  if (cat.includes('presente')) {
    return {
      icon: Gift,
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      borderColor: 'border-purple-200/80',
    };
  }

  if (cat.includes('cinema') || cat.includes('filme')) {
    return {
      icon: Film,
      bgColor: 'bg-indigo-50',
      textColor: 'text-indigo-600',
      borderColor: 'border-indigo-200/80',
    };
  }

  if (cat.includes('música') || cat.includes('musica') || cat.includes('show')) {
    return {
      icon: Music,
      bgColor: 'bg-violet-50',
      textColor: 'text-violet-600',
      borderColor: 'border-violet-200/80',
    };
  }

  if (cat.includes('educa') || cat.includes('curso') || cat.includes('escola') || cat.includes('faculdade') || cat.includes('livro')) {
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

  if (cat.includes('vestuário') || cat.includes('vestuario') || cat.includes('roupa') || cat.includes('calçado') || cat.includes('calcado')) {
    return {
      icon: Shirt,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      borderColor: 'border-emerald-200/80',
    };
  }

  if (cat.includes('salário') || cat.includes('salario') || cat.includes('renda') || cat.includes('trabalho') || cat.includes('freelance') || cat.includes('bônus') || cat.includes('bonus') || cat.includes('pró-labore') || cat.includes('pro-labore')) {
    return {
      icon: Briefcase,
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      borderColor: 'border-emerald-200/80',
    };
  }

  if (cat.includes('invest') || cat.includes('reserva') || cat.includes('cdb') || cat.includes('selic') || cat.includes('ações') || cat.includes('acoes') || cat.includes('fii') || cat.includes('caixinha') || cat.includes('cripto') || cat.includes('previdência') || cat.includes('previdencia')) {
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
