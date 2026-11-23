import React, { useEffect } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
}

const widthMap = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export const Dialog: React.FC<DialogProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#04070C]/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      onClick={onClose}
    >
      <div
        className={cn(
          'w-full bg-[#0D1422] border border-[rgba(145,162,184,0.22)] rounded-xl shadow-2xl animate-slide-up overflow-hidden',
          widthMap[maxWidth]
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-[rgba(145,162,184,0.12)]">
          <div>
            <h2 id="dialog-title" className="font-display text-lg font-semibold text-[#F5F8FC]">
              {title}
            </h2>
            {description && (
              <p className="text-xs text-[#91A2B8] mt-1 leading-relaxed">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-md text-[#91A2B8] hover:text-[#F5F8FC] hover:bg-[#121E2E] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'danger' | 'primary';
  loading?: boolean;
  requireTypedText?: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  loading = false,
  requireTypedText,
}) => {
  const [typed, setTyped] = React.useState('');

  useEffect(() => {
    if (!open) setTyped('');
  }, [open]);

  const canConfirm = !requireTypedText || typed.trim() === requireTypedText;

  return (
    <Dialog open={open} onClose={onClose} title={title} maxWidth="sm">
      <div className="space-y-5">
        <div className="flex items-start gap-3">
          {tone === 'danger' && (
            <div className="w-9 h-9 rounded-lg bg-[#F06473]/12 border border-[#F06473]/25 flex items-center justify-center text-[#F06473] shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
          )}
          <p className="text-sm text-[#91A2B8] leading-relaxed">{description}</p>
        </div>

        {requireTypedText && (
          <div className="space-y-1.5">
            <label className="block text-xs text-[#91A2B8]">
              Type <span className="font-mono text-[#F5F8FC]">{requireTypedText}</span> to confirm
            </label>
            <input
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              placeholder={requireTypedText}
              className="w-full h-10 bg-[#080C14] border border-[rgba(145,162,184,0.22)] rounded-lg px-3.5 text-sm font-mono text-[#F5F8FC] focus:outline-none focus:border-[#F06473]"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
            disabled={!canConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
