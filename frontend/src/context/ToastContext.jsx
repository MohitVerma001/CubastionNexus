import { createContext, useContext, useState, useCallback } from 'react';
import { CircleCheck as CheckCircle, CircleAlert as AlertCircle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 max-w-sm w-full">
      {toasts.map(t => <Toast key={t.id} toast={t} onRemove={onRemove} />)}
    </div>
  );
}

const TOAST_STYLES = {
  success: { bg: 'bg-white border-l-4 border-[#057A55]', icon: CheckCircle, iconColor: 'text-[#057A55]' },
  error: { bg: 'bg-white border-l-4 border-[#C81E1E]', icon: AlertCircle, iconColor: 'text-[#C81E1E]' },
  info: { bg: 'bg-white border-l-4 border-[#01516A]', icon: Info, iconColor: 'text-[#01516A]' },
};

function Toast({ toast, onRemove }) {
  const s = TOAST_STYLES[toast.type] || TOAST_STYLES.info;
  const Icon = s.icon;
  return (
    <div className={`${s.bg} rounded-lg shadow-lg px-4 py-3 flex items-start gap-3 animate-in slide-in-from-right-4 fade-in`}>
      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${s.iconColor}`} />
      <span className="text-sm text-[#0F0F0F] flex-1 leading-snug">{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} className="shrink-0 text-[#999] hover:text-[#5C5C5C] transition-colors">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
