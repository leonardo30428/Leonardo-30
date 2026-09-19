import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  CreditCard, 
  RefreshCw, 
  CheckCircle2, 
  Plus, 
  ShieldCheck, 
  Sliders,
  ExternalLink
} from 'lucide-react';
import { BankAccount } from '../types';
import { formatCurrency } from '../utils/finance';

interface BankSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  accounts: BankAccount[];
  onSyncAll: () => Promise<void>;
  onAddAccount: (newAccount: BankAccount) => void;
}

export const BankSyncModal: React.FC<BankSyncModalProps> = ({
  isOpen,
  onClose,
  accounts,
  onSyncAll,
  onAddAccount,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [autoSyncEnabled, setAutoSyncEnabled] = useState(true);
  const [showAddBank, setShowAddBank] = useState(false);

  // New bank form
  const [selectedInstitution, setSelectedInstitution] = useState('Bradesco');
  const [accountType, setAccountType] = useState<'checking' | 'credit_card' | 'investment'>('checking');
  const [accountName, setAccountName] = useState('');
  const [initialBalance, setInitialBalance] = useState('');

  if (!isOpen) return null;

  const handleSync = async () => {
    setIsSyncing(true);
    setSyncSuccess(false);
    try {
      await onSyncAll();
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 3000);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountName.trim()) return;

    const colors: Record<string, string> = {
      Bradesco: '#cc092f',
      Santander: '#ec0000',
      'Banco do Brasil': '#003882',
      'C6 Bank': '#242424',
      'XP Investimentos': '#000000',
      'BTG Pactual': '#0b2038',
    };

    const newAcc: BankAccount = {
      id: `bank-${Date.now()}`,
      institution: selectedInstitution,
      name: accountName,
      type: accountType,
      balance: parseFloat(initialBalance) || 0,
      lastSync: 'Recém-sincronizado',
      color: colors[selectedInstitution] || '#475569',
      status: 'connected',
      accountNumber: 'Conectado via Open Finance',
    };

    onAddAccount(newAcc);
    setShowAddBank(false);
    setAccountName('');
    setInitialBalance('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto overflow-x-hidden touch-pan-y">
      <div 
        id="bank-sync-modal"
        className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-x-hidden flex flex-col max-h-[90vh] animate-fadeIn mx-auto transition-colors"
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-900 dark:bg-slate-700 text-white flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base sm:text-lg">
                Sincronização Bancária & Cartões
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Integração direta e automática via Open Finance Brasil
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* Open finance security banner */}
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-xl p-3.5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-700 dark:text-emerald-400 shrink-0" />
              <div className="text-xs text-emerald-950 dark:text-emerald-200">
                <span className="font-bold">Conexão Segura Criptografada (Open Finance):</span>
                <p className="text-emerald-800 dark:text-emerald-300">Seus dados são protegidos com leitura somente para fins de categorização e extrato.</p>
              </div>
            </div>

            {/* Auto sync switch */}
            <div className="flex items-center gap-2 shrink-0">
              <label className="text-[11px] font-bold text-emerald-900 dark:text-emerald-200 hidden sm:inline">
                Auto-Sync
              </label>
              <button
                onClick={() => setAutoSyncEnabled(!autoSyncEnabled)}
                className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                  autoSyncEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                    autoSyncEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Sync action button */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                {accounts.length} Instituições Conectadas
              </span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Última sincronização geral realizada hoje
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                id="btn-sync-all-accounts"
                onClick={handleSync}
                disabled={isSyncing}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Todas Agora'}</span>
              </button>
            </div>
          </div>

          {syncSuccess && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 rounded-lg text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Extratos e saldos sincronizados com sucesso com suas contas bancárias!
            </div>
          )}

          {/* Accounts & Cards list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-wider text-slate-500 dark:text-slate-400">
                Contas e Cartões de Crédito
              </span>
              <button
                onClick={() => setShowAddBank(!showAddBank)}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                Conectar Novo Banco
              </button>
            </div>

            {/* Form to connect a new institution */}
            {showAddBank && (
              <form onSubmit={handleCreateAccount} className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-200 dark:border-indigo-800/60 space-y-3 animate-in fade-in">
                <div className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  Adicionar Nova Conexão Open Finance
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Instituição</label>
                    <select
                      value={selectedInstitution}
                      onChange={(e) => setSelectedInstitution(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="Bradesco">Banco Bradesco</option>
                      <option value="Santander">Banco Santander</option>
                      <option value="Banco do Brasil">Banco do Brasil</option>
                      <option value="C6 Bank">C6 Bank</option>
                      <option value="XP Investimentos">XP Investimentos</option>
                      <option value="BTG Pactual">BTG Pactual</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Tipo</label>
                    <select
                      value={accountType}
                      onChange={(e) => setAccountType(e.target.value as any)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="checking">Conta Corrente</option>
                      <option value="credit_card">Cartão de Crédito</option>
                      <option value="investment">Conta Investimentos</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nome de Identificação</label>
                    <input
                      type="text"
                      placeholder="Ex: Minha Conta Corrente"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      required
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Saldo ou Fatura Atual (R$)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Ex: 1500.00"
                      value={initialBalance}
                      onChange={(e) => setInitialBalance(e.target.value)}
                      className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddBank(false)}
                    className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs cursor-pointer"
                  >
                    Autorizar e Conectar
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-2.5">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:border-slate-300 dark:hover:border-slate-600 transition-all flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 font-bold text-sm shadow-xs"
                      style={{ backgroundColor: acc.color }}
                    >
                      {acc.type === 'credit_card' ? (
                        <CreditCard className="w-5 h-5" />
                      ) : (
                        <Building2 className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">{acc.institution}</span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                          {acc.type === 'credit_card' ? 'Cartão de Crédito' : acc.type === 'investment' ? 'Investimentos' : 'Conta Corrente'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{acc.name} • {acc.accountNumber}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs text-slate-400 dark:text-slate-500">
                      {acc.type === 'credit_card' ? 'Fatura Atual' : 'Saldo'}
                    </div>
                    <div className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {formatCurrency(acc.balance)}
                    </div>
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center justify-end gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {acc.lastSync}
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Certificado pelo Banco Central do Brasil
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600 rounded-lg transition-colors cursor-pointer"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
