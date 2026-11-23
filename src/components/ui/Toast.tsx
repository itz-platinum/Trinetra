import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { cn } from '../../lib/utils';

type ToastTone = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  tone: ToastTone;
  title: string;
  description?: string;
}

interface ToastContextType {
  toast: {
    success: (title: string, description?: string) => void;
    error: (title: string, description?: string) => void;
    info: (title: string, description?: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<ToastItem[]>([]);

  const push = useCallback((tone: ToastTone, title: string, description?: string) => {
    const id = Math.random().toString(36).slice(2, 9);
    setItems((prev) => [...prev, { id, tone, title, description }]);
    setTimeout(() => {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }, 3600);
  }, []);

  const dismiss = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const toast = {
    success: (title: string, description?: string) => push('success', title, description),
    error: (title: string, description?: string) => push('error', title, description),
    info: (title: string, description?: string) => push('info', title, description),
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {items.map((item) => (
          <div
            key={item.id}
            role="status"
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg bg-[#0D1422] border shadow-xl animate-slide-up',
              item.tone === 'success' && 'border-[#28C987]/35',
              item.tone === 'error' && 'border-[#F06473]/35',
              item.tone === 'info' && 'border-[#25C9F2]/35'
            )}
          >
            <span className="mt-0.5 shrink-0">
              {item.tone === 'success' && <CheckCircle2 className="w-4 h-4 text-[#28C987]" />}
              {item.tone === 'error' && <AlertCircle className="w-4 h-4 text-[#F06473]" />}
              {item.tone === 'info' && <Info className="w-4 h-4 text-[#25C9F2]" />}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[#F5F8FC]">{item.title}</p>
              {item.description && (
                <p className="text-xs text-[#91A2B8] mt-0.5 leading-relaxed">{item.description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              aria-label="Dismiss notification"
              className="text-[#64748B] hover:text-[#F5F8FC] transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx.toast;
};
