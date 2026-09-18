import React from 'react';
import { TrendingUp, TrendingDown, PiggyBank, Scale, ArrowUpRight, ArrowDownRight, ArrowRight } from 'lucide-react';
import { MonthlySummary } from '../types';
import { formatCurrency } from '../utils/finance';

interface OverviewCardsProps {
  summary: MonthlySummary;
  onNavigateToSection: (section: 'receitas' | 'gastos' | 'investimentos' | 'planejamento') => void;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({ summary, onNavigateToSection }) => {
  const { totalIncome, totalExpense, totalInvestment, balance, isRed, savingsRate } = summary;

  const expenseRatio = totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* 1. TOTAL DE ENTRADAS - CLIQUE DIRECIONA PARA PÁGINA DE RECEITAS */}
      <div 
        id="card-total-entradas"
        onClick={() => onNavigateToSection('receitas')}
        className="cursor-pointer bg-white rounded-2xl p-5 border-2 border-emerald-500 shadow-xs hover:shadow-md hover:border-emerald-600 transition-all relative overflow-hidden group select-none"
        title="Clique para ir para a página completa de Receitas"
      >
        <div className="absolute top-0 right-0 w-28 h-28 bg-emerald-50 rounded-bl-full -z-0 opacity-70 group-hover:scale-105 transition-transform" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold tracking-wider text-emerald-800 bg-emerald-100/90 px-2.5 py-1 rounded-md">
              Total de Entradas
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs shadow-emerald-200 group-hover:bg-emerald-700 transition-colors">
              <TrendingUp className="w-5 h-5 stroke-[2.5]" />
            </div>
          </div>

          <div className="mt-3">
            <span className="text-xs text-slate-500 font-medium">Receitas deste mês</span>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
              {formatCurrency(totalIncome)}
            </h3>
          </div>

          <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" />
              100% recebido
            </span>
            <span className="text-emerald-700 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
              Ver receitas <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      </div>

      {/* 2. TOTAL DE SAÍDAS (GASTOS) - CLIQUE DIRECIONA PARA PÁGINA DE GASTOS */}
      <div 
        id="card-total-gastos"
        onClick={() => onNavigateToSection('gastos')}
        className="cursor-pointer bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-rose-400 transition-all relative overflow-hidden group select-none"
        title="Clique para ir para a página completa de Gastos"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold tracking-wider text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md">
            Total de Gastos
          </span>
          <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-xs shadow-rose-200 group-hover:bg-rose-600 transition-colors">
            <TrendingDown className="w-5 h-5 stroke-[2.5]" />
          </div>
        </div>

        <div className="mt-3">
          <span className="text-xs text-slate-500 font-medium">Despesas acumuladas</span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            {formatCurrency(totalExpense)}
          </h3>
        </div>

        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className={`font-semibold flex items-center gap-0.5 ${expenseRatio > 85 ? 'text-rose-600' : 'text-slate-600'}`}>
            <ArrowDownRight className="w-3.5 h-3.5" />
            {expenseRatio}% das entradas
          </span>
          <span className="text-rose-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
            Ver gastos <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* 3. TOTAL INVESTIDO - CLIQUE DIRECIONA PARA INVESTIMENTOS */}
      <div 
        id="card-total-investido"
        onClick={() => onNavigateToSection('investimentos')}
        className="cursor-pointer bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-400 transition-all relative overflow-hidden group select-none"
        title="Clique para ir para a página de Investimentos e Metas"
      >
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md">
            Valor Investido
          </span>
          <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shadow-indigo-200 group-hover:bg-indigo-700 transition-colors">
            <PiggyBank className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        <div className="mt-3">
          <span className="text-xs text-slate-500 font-medium">Aportes e Patrimônio</span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            {formatCurrency(totalInvestment)}
          </h3>
        </div>

        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-indigo-700 font-semibold flex items-center gap-0.5">
            {savingsRate.toFixed(1)}% taxa poupança
          </span>
          <span className="text-indigo-600 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
            Ver aportes <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* 4. SAÚDE FINANCEIRA & SOBRA LIVRE - CLIQUE DIRECIONA PARA PLANEJAMENTO */}
      <div 
        id="card-saude-financeira"
        onClick={() => onNavigateToSection('planejamento')}
        className={`rounded-2xl p-5 border shadow-xs transition-all relative overflow-hidden cursor-pointer hover:shadow-md group select-none ${
          isRed 
            ? 'bg-rose-50/50 border-rose-300 hover:border-rose-400' 
            : 'bg-white border-slate-200 hover:border-emerald-400'
        }`}
        title="Clique para ver o Planejamento e Envelopes da sua Planilha"
      >
        <div className="flex items-center justify-between">
          <span className={`text-xs font-bold tracking-wider px-2.5 py-1 rounded-md ${
            isRed ? 'bg-rose-200 text-rose-900' : 'bg-slate-100 text-slate-700'
          }`}>
            Saúde Financeira
          </span>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white ${
            isRed ? 'bg-rose-600 shadow-xs shadow-rose-300' : 'bg-slate-800'
          }`}>
            <Scale className="w-5 h-5 stroke-[2.2]" />
          </div>
        </div>

        <div className="mt-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500 font-medium">Ganhos menos Gastos</span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              Sobra Livre: {formatCurrency(summary.netRemaining ?? (balance - totalInvestment))}
            </span>
          </div>
          <h3 className={`text-2xl sm:text-3xl font-extrabold tracking-tight mt-0.5 ${
            isRed ? 'text-rose-600' : 'text-emerald-700'
          }`}>
            {formatCurrency(balance)}
          </h3>
        </div>

        <div className="mt-3.5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className={`font-bold flex items-center gap-1.5 ${isRed ? 'text-rose-700' : 'text-emerald-700'}`}>
            <span className={`w-2 h-2 rounded-full ${isRed ? 'bg-rose-500' : 'bg-emerald-500'}`} />
            {isRed ? 'No Vermelho' : 'Saldo Positivo'}
          </span>
          <span className="text-slate-700 font-bold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
            Planejamento <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

    </div>
  );
};
