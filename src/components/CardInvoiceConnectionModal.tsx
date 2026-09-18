import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  ShieldCheck, 
  RefreshCw, 
  FileText, 
  Upload, 
  Camera, 
  CheckCircle2, 
  ArrowRight,
  ExternalLink,
  Sparkles,
  Lock,
  Building2
} from 'lucide-react';
import { BankAccount } from '../types';
import { formatCurrency } from '../utils/finance';

interface CardInvoiceConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  cards: BankAccount[];
  onAddCardInvoice: (newCard: BankAccount) => void;
  onOpenReceiptScanner: () => void;
}

export const CardInvoiceConnectionModal: React.FC<CardInvoiceConnectionModalProps> = ({
  isOpen,
  onClose,
  cards,
  onAddCardInvoice,
  onOpenReceiptScanner,
}) => {
  const [activeTab, setActiveTab] = useState<'open_finance' | 'upload_pdf' | 'manual'>('open_finance');
  const [selectedBank, setSelectedBank] = useState('Nubank');
  const [isConnecting, setIsConnecting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Manual / Quick form
  const [cardName, setCardName] = useState('Cartão Nubank Roxinho');
  const [invoiceAmount, setInvoiceAmount] = useState('500.00');
  const [totalLimit, setTotalLimit] = useState('5000.00');
  const [closingDay, setClosingDay] = useState('13');
  const [dueDay, setDueDay] = useState('20');

  // File upload simulation
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  if (!isOpen) return null;

  const popularBanks = [
    { name: 'Nubank', color: '#820ad1', logoText: 'Nu' },
    { name: 'Banco Itaú', color: '#ec7000', logoText: 'Itaú' },
    { name: 'Bradesco', color: '#cc092f', logoText: 'BBD' },
    { name: 'Santander', color: '#ec0000', logoText: 'SAN' },
    { name: 'Banco Inter', color: '#ff7a00', logoText: 'Inter' },
    { name: 'C6 Bank', color: '#1f1f1f', logoText: 'C6' },
  ];

  const handleSimulateOpenFinanceConnect = async () => {
    setIsConnecting(true);
    setSuccessMessage(null);

    await new Promise((resolve) => setTimeout(resolve, 1500));

    const newConnectedCard: BankAccount = {
      id: `card-${Date.now()}`,
      institution: selectedBank,
      name: `Cartão ${selectedBank} Mastercard`,
      type: 'credit_card',
      balance: parseFloat(invoiceAmount) || 500,
      availableLimit: (parseFloat(totalLimit) || 5000) - (parseFloat(invoiceAmount) || 500),
      lastSync: 'Agora mesmo (Open Finance)',
      color: popularBanks.find((b) => b.name === selectedBank)?.color || '#334155',
      status: 'connected',
      accountNumber: `Final **** ${Math.floor(1000 + Math.random() * 9000)}`,
    };

    onAddCardInvoice(newConnectedCard);
    setIsConnecting(false);
    setSuccessMessage(`Fatura do ${selectedBank} conectada e sincronizada com sucesso!`);
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 2000);
  };

  const handleProcessUploadedPDF = async () => {
    if (!uploadedFile) return;
    setIsProcessingFile(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const parsedCard: BankAccount = {
      id: `card-pdf-${Date.now()}`,
      institution: 'Importado de Fatura PDF',
      name: uploadedFile.name.replace(/\.[^/.]+$/, ''),
      type: 'credit_card',
      balance: parseFloat(invoiceAmount) || 500,
      availableLimit: 4500,
      lastSync: 'Importado via PDF',
      color: '#475569',
      status: 'connected',
      accountNumber: 'Extrato Importado',
    };

    onAddCardInvoice(parsedCard);
    setIsProcessingFile(false);
    setSuccessMessage('Fatura importada e despesas computadas no orçamento!');
    setTimeout(() => {
      setSuccessMessage(null);
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto overflow-x-hidden touch-pan-y">
      <div 
        id="card-connection-modal"
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-x-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150 mx-auto"
      >
        {/* Top Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-xs shadow-indigo-200">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
                Conectar Fatura do Cartão de Crédito
              </h3>
              <p className="text-xs text-slate-500">
                Acompanhe o valor da fatura, compras e limite em tempo real
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 px-5 sm:px-6 bg-white gap-2 pt-3">
          <button
            onClick={() => setActiveTab('open_finance')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'open_finance'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Open Finance (Automático)</span>
          </button>

          <button
            onClick={() => setActiveTab('upload_pdf')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'upload_pdf'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Importar Fatura (PDF / OFX)</span>
          </button>

          <button
            onClick={() => setActiveTab('manual')}
            className={`pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'manual'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Inserir Manualmente</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          
          {successMessage && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 text-xs sm:text-sm font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* TAB 1: OPEN FINANCE AUTOMATIC */}
          {activeTab === 'open_finance' && (
            <div className="space-y-4">
              
              {/* How it works info card */}
              <div className="p-4 bg-indigo-50/70 border border-indigo-200/80 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-indigo-900 font-extrabold text-xs sm:text-sm">
                  <Lock className="w-4 h-4 text-indigo-600" />
                  <span>Como funciona a conexão com o cartão?</span>
                </div>
                <p className="text-xs text-indigo-950/80 leading-relaxed">
                  Pelo <strong>Open Finance Brasil</strong> (regulamentado pelo Banco Central), você autoriza a leitura segura dos lançamentos e do valor da sua fatura. 
                  O aplicativo consulta diretamente seu banco e atualiza automaticamente quanto você já gastou e a data de vencimento.
                </p>
                <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-indigo-700 font-semibold">
                  <span className="bg-white/80 px-2 py-0.5 rounded-md border border-indigo-200">✓ Criptografia ponta a ponta</span>
                  <span className="bg-white/80 px-2 py-0.5 rounded-md border border-indigo-200">✓ Apenas leitura de fatura</span>
                  <span className="bg-white/80 px-2 py-0.5 rounded-md border border-indigo-200">✓ Zero movimentações ou transferências</span>
                </div>
              </div>

              {/* Bank selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Selecione a instituição do seu cartão:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {popularBanks.map((bank) => (
                    <button
                      key={bank.name}
                      type="button"
                      onClick={() => setSelectedBank(bank.name)}
                      className={`p-3 rounded-xl border flex items-center gap-2.5 text-left transition-all ${
                        selectedBank === bank.name
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div 
                        className="w-8 h-8 rounded-lg text-white flex items-center justify-center font-black text-xs shrink-0"
                        style={{ backgroundColor: bank.color }}
                      >
                        {bank.logoText}
                      </div>
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {bank.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form values */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Fatura Atual Estimada (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={invoiceAmount}
                    onChange={(e) => setInvoiceAmount(e.target.value)}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ex: 500.00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Limite Total do Cartão (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={totalLimit}
                    onChange={(e) => setTotalLimit(e.target.value)}
                    className="w-full text-xs sm:text-sm p-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Ex: 5000.00"
                  />
                </div>
              </div>

              {/* Connect button */}
              <button
                type="button"
                onClick={handleSimulateOpenFinanceConnect}
                disabled={isConnecting}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isConnecting ? 'animate-spin' : ''}`} />
                <span>
                  {isConnecting ? `Conectando com ${selectedBank}...` : `Conectar Cartão ${selectedBank} via Open Finance`}
                </span>
              </button>

            </div>
          )}

          {/* TAB 2: UPLOAD PDF / OFX */}
          {activeTab === 'upload_pdf' && (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-xs sm:text-sm">
                  <FileText className="w-4 h-4 text-slate-600" />
                  <span>Importar Arquivo da Fatura</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  Você também pode baixar a fatura em PDF ou arquivo OFX no aplicativo do seu banco e anexar aqui.
                </p>
              </div>

              {/* Drop area */}
              <div 
                className="border-2 border-dashed border-slate-300 hover:border-indigo-500 rounded-2xl p-6 text-center bg-slate-50/50 transition-colors cursor-pointer"
                onClick={() => document.getElementById('file-upload-invoice')?.click()}
              >
                <input
                  id="file-upload-invoice"
                  type="file"
                  accept=".pdf,.ofx,.csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setUploadedFile(e.target.files[0]);
                    }
                  }}
                />
                <Upload className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                <div className="text-xs sm:text-sm font-bold text-slate-800">
                  {uploadedFile ? uploadedFile.name : 'Clique ou arraste a Fatura (PDF ou OFX)'}
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  Suporta faturas do Nubank, Itaú, Santander, Bradesco e Inter
                </p>
              </div>

              {uploadedFile && (
                <button
                  type="button"
                  onClick={handleProcessUploadedPDF}
                  disabled={isProcessingFile}
                  className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>{isProcessingFile ? 'Lendo lançamentos da fatura...' : 'Processar e Atualizar Fatura'}</span>
                </button>
              )}

              {/* Or scan with camera */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">Prefere fotografar o boleto ou papel?</span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenReceiptScanner();
                  }}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition-colors flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Scanner com IA</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: MANUAL INPUT */}
          {activeTab === 'manual' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nome do Cartão</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                    placeholder="Ex: Nubank Mastercard"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Fatura Atual (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={invoiceAmount}
                    onChange={(e) => setInvoiceAmount(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                    placeholder="Ex: 500.00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Dia do Vencimento</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={dueDay}
                    onChange={(e) => setDueDay(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                    placeholder="Dia 20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Limite Total (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={totalLimit}
                    onChange={(e) => setTotalLimit(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
                    placeholder="Ex: 5000.00"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleSimulateOpenFinanceConnect}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm rounded-xl transition-all"
              >
                Salvar Cartão e Fatura
              </button>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Conexão 100% segura e regulamentada
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
