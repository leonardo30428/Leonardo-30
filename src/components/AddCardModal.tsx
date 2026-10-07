import React, { useState } from 'react';
import { 
  CreditCard, 
  X, 
  Check, 
  DollarSign, 
  Calendar, 
  Hash, 
  Building2 
} from 'lucide-react';
import { BankAccount } from '../types';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCard: (newCard: BankAccount) => void;
  availableAccounts?: BankAccount[];
}

const BANK_PRESETS = [
  { name: 'Nubank', color: '#820ad1' },
  { name: 'Inter', color: '#ff7a00' },
  { name: 'Itaú', color: '#003399' },
  { name: 'Santander', color: '#cc0000' },
  { name: 'Bradesco', color: '#cc092f' },
  { name: 'C6 Bank', color: '#1e293b' },
  { name: 'Banco do Brasil', color: '#ca8a04' },
  { name: 'XP', color: '#09090b' },
  { name: 'Outro', color: '#10b981' },
];

const COLOR_OPTIONS = [
  '#820ad1', // Nubank roxo
  '#ff7a00', // Inter laranja
  '#003399', // Itaú azul
  '#cc0000', // Santander vermelho
  '#1e293b', // C6 escuro
  '#09090b', // XP preto
  '#10b981', // Verde esmeralda
  '#ca8a04', // Dourado BB
  '#E27D60', // Coral / Salmão
  '#0284c7', // Azul ciano
];

export const AddCardModal: React.FC<AddCardModalProps> = ({
  isOpen,
  onClose,
  onSaveCard,
}) => {
  const [name, setName] = useState('');
  const [institution, setInstitution] = useState('Nubank');
  const [limitStr, setLimitStr] = useState('5.000,00');
  const [dueDay, setDueDay] = useState<number>(10);
  const [closingDay, setClosingDay] = useState<number>(3);
  const [finalDigits, setFinalDigits] = useState('8421');
  const [color, setColor] = useState('#820ad1');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSelectBank = (bank: typeof BANK_PRESETS[0]) => {
    setInstitution(bank.name);
    setColor(bank.color);
    if (!name || BANK_PRESETS.some(b => name === `Cartão ${b.name}`)) {
      setName(`Cartão ${bank.name}`);
    }
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setLimitStr('');
      return;
    }
    const val = parseFloat(raw) / 100;
    setLimitStr(val.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };

  const parseLimit = (str: string): number => {
    if (!str) return 0;
    const clean = str.replace(/\./g, '').replace(',', '.');
    return parseFloat(clean) || 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Por favor, informe o nome do cartão.');
      return;
    }

    const limitVal = parseLimit(limitStr);
    const cleanDigits = finalDigits.replace(/\D/g, '');
    const accountStr = cleanDigits.length >= 4 
      ? `Final ${cleanDigits.slice(-4)}` 
      : (cleanDigits ? `Final ${cleanDigits}` : 'Final 8421');

    const newCard: BankAccount = {
      id: `card-${Date.now()}`,
      name: trimmedName,
      institution,
      type: 'credit_card',
      balance: 0,
      availableLimit: limitVal > 0 ? limitVal : 5000,
      lastSync: 'Recém-adicionado',
      color,
      status: 'connected',
      accountNumber: accountStr,
      dueDay: Number(dueDay) || 10,
      closingDay: Number(closingDay) || 3,
    };

    onSaveCard(newCard);
    onClose();
  };

  return (
    <div 
      id="modal-adicionar-cartao"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho do Modal */}
        <div className="p-5 sm:p-6 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <CreditCard className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base sm:text-lg">
                Adicionar Cartão
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cadastre um novo cartão de crédito
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* Pré-visualização do Cartão */}
          <div 
            className="rounded-2xl p-4 text-white shadow-md relative overflow-hidden transition-colors"
            style={{ backgroundColor: color }}
          >
            <div className="flex justify-between items-start mb-6">
              <span className="text-xs font-bold uppercase tracking-wider opacity-85">
                {institution || 'Banco'}
              </span>
              <CreditCard className="w-6 h-6 opacity-80" />
            </div>
            <div className="text-lg font-black tracking-tight mb-3 truncate">
              {name || 'Nome do Cartão'}
            </div>
            <div className="flex justify-between items-end text-xs opacity-90 font-medium">
              <span>Final {finalDigits || '8421'}</span>
              <span>Venc. dia {dueDay}</span>
            </div>
          </div>

          {/* Atalhos de Bancos Populares */}
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1.5">
              Banco ou Instituição
            </label>
            <div className="flex flex-wrap gap-1.5">
              {BANK_PRESETS.map((bank) => (
                <button
                  key={bank.name}
                  type="button"
                  onClick={() => handleSelectBank(bank)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    institution === bank.name
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {bank.name}
                </button>
              ))}
            </div>
          </div>

          {/* Nome do Cartão */}
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
              Nome do Cartão
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Ex: Nubank Roxinho, Inter Black"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Limite de Crédito */}
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
              Limite de Crédito
            </label>
            <div className="relative">
              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                inputMode="numeric"
                value={limitStr}
                onChange={handleLimitChange}
                placeholder="0,00"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Vencimento e Fechamento */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Dia Vencimento
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={dueDay}
                  onChange={(e) => setDueDay(Number(e.target.value))}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Dia Fechamento
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={closingDay}
                  onChange={(e) => setClosingDay(Number(e.target.value))}
                  className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Final do Cartão */}
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">
              Últimos 4 Dígitos
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                maxLength={4}
                value={finalDigits}
                onChange={(e) => setFinalDigits(e.target.value.replace(/\D/g, ''))}
                placeholder="Ex: 8421"
                className="w-full pl-10 pr-3 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Seletor de Cor do Cartão */}
          <div>
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-2">
              Cor do Cartão
            </label>
            <div className="flex flex-wrap gap-2.5">
              {COLOR_OPTIONS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-transform cursor-pointer ${
                    color === c ? 'scale-110 ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-slate-900' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                  title={c}
                >
                  {color === c && <Check className="w-4 h-4 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Botões do Rodapé */}
          <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-sm font-extrabold shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              Salvar Cartão
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
