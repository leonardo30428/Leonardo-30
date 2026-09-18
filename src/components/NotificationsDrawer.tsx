import React from 'react';
import { X, Bell, AlertTriangle, Target, CheckCircle2, CalendarClock, ShieldCheck } from 'lucide-react';
import { MonthlySummary } from '../types';

export interface SmartNotification {
  id: string;
  type: 'alert' | 'bill' | 'goal' | 'sync';
  title: string;
  message: string;
  time: string;
  unread: boolean;
}

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: SmartNotification[];
  onMarkAllAsRead: () => void;
  onOpenAIChat: (prompt?: string) => void;
}

export const NotificationsDrawer: React.FC<NotificationsDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllAsRead,
  onOpenAIChat,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
      <div 
        id="notifications-drawer"
        className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200 border-l border-slate-200"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-800 flex items-center justify-center">
              <Bell className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Central de Notificações Inteligentes
              </h3>
              <p className="text-xs text-slate-500">Lembretes de pagamentos e metas</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Subheader */}
        <div className="px-4 py-2 bg-slate-100/70 border-b border-slate-200/60 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-medium">
            {notifications.filter((n) => n.unread).length} não lidas
          </span>
          <button
            onClick={onMarkAllAsRead}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Marcar todas como lidas
          </button>
        </div>

        {/* Notifications list */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`p-3.5 rounded-xl border transition-all ${
                n.unread
                  ? 'bg-indigo-50/40 border-indigo-200'
                  : 'bg-white border-slate-200/80 opacity-80'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                    n.type === 'alert'
                      ? 'bg-rose-100 text-rose-700'
                      : n.type === 'bill'
                      ? 'bg-amber-100 text-amber-700'
                      : n.type === 'goal'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {n.type === 'alert' && <AlertTriangle className="w-4 h-4" />}
                  {n.type === 'bill' && <CalendarClock className="w-4 h-4" />}
                  {n.type === 'goal' && <Target className="w-4 h-4" />}
                  {n.type === 'sync' && <ShieldCheck className="w-4 h-4" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h5 className="text-xs font-bold text-slate-900 truncate">
                      {n.title}
                    </h5>
                    <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {n.message}
                  </p>

                  {n.type === 'alert' && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenAIChat('Como cortar despesas nesta categoria para equilibrar o mês?');
                      }}
                      className="mt-2 text-[11px] font-bold text-rose-700 hover:text-rose-900 underline block"
                    >
                      Pedir sugestão de ajuste à IA &rarr;
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Notificações ativas de pagamentos e metas
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
