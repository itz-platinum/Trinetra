import React from 'react';
import { ArrowUpRight, Copy, Check, Edit2, Trash2 } from 'lucide-react';
import { cn, getUpiAppMeta } from '../lib/utils';
import { PaymentAppIcon } from './PaymentAppIcon';
import { UpiAppType } from '../types';

export interface PaymentAppItemProps {
  id: string;
  applicationType: UpiAppType | string;
  label?: string;
  upiId: string;
  isEnabled?: boolean;
  mode?: 'visitor' | 'manage' | 'preview';
  copied?: boolean;
  onSelect?: () => void;
  onCopy?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggle?: () => void;
  className?: string;
}

export const PaymentAppItem: React.FC<PaymentAppItemProps> = ({
  applicationType,
  label,
  upiId,
  isEnabled = true,
  mode = 'visitor',
  copied = false,
  onSelect,
  onCopy,
  onEdit,
  onDelete,
  onToggle,
  className,
}) => {
  const meta = getUpiAppMeta(applicationType);
  const displayTitle = label || meta.name;

  if (mode === 'manage') {
    return (
      <div
        className={cn(
          'flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border bg-[#0D1422] transition-colors',
          isEnabled
            ? 'border-[rgba(145,162,184,0.16)]'
            : 'border-[rgba(145,162,184,0.1)] opacity-70',
          className
        )}
      >
        <div className="flex items-center gap-3.5 min-w-0">
          <PaymentAppIcon type={applicationType} size="md" />
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h4 className="text-sm font-semibold text-[#F5F8FC] truncate">{displayTitle}</h4>
              <span
                className={cn(
                  'text-[11px] font-medium',
                  isEnabled ? 'text-[#28C987]' : 'text-[#91A2B8]'
                )}
              >
                · {isEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <p className="text-xs font-mono text-[#91A2B8] truncate mt-0.5">{upiId}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 justify-end">
          {onToggle && (
            <button
              type="button"
              role="switch"
              aria-checked={isEnabled}
              aria-label={isEnabled ? `Disable ${displayTitle}` : `Enable ${displayTitle}`}
              onClick={onToggle}
              className={cn(
                'relative inline-flex h-6 w-10 items-center rounded-full border transition-colors cursor-pointer',
                isEnabled
                  ? 'bg-[#28C987]/20 border-[#28C987]/50'
                  : 'bg-[#121E2E] border-[rgba(145,162,184,0.25)]'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 rounded-full transition-transform',
                  isEnabled ? 'translate-x-5 bg-[#28C987]' : 'translate-x-1 bg-[#64748B]'
                )}
              />
            </button>
          )}
          {onEdit && (
            <button
              type="button"
              onClick={onEdit}
              aria-label={`Edit ${displayTitle}`}
              className="h-8 w-8 inline-flex items-center justify-center rounded-md bg-[#121E2E] hover:bg-[#19283D] border border-[rgba(145,162,184,0.18)] text-[#91A2B8] hover:text-[#F5F8FC] transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
          )}
          {onDelete && (
            <button
              type="button"
              onClick={onDelete}
              aria-label={`Remove ${displayTitle}`}
              className="h-8 w-8 inline-flex items-center justify-center rounded-md bg-[#F06473]/10 hover:bg-[#F06473]/20 border border-[#F06473]/25 text-[#F06473] transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onKeyDown={
        onSelect
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect();
              }
            }
          : undefined
      }
      className={cn(
        'group flex items-center justify-between gap-3 p-3.5 rounded-xl border border-[rgba(145,162,184,0.16)] bg-[#121E2E]/70 transition-all duration-150',
        onSelect &&
          'cursor-pointer hover:bg-[#172538] hover:border-[#25C9F2]/45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25C9F2]',
        className
      )}
    >
      <div className="flex items-center gap-3.5 min-w-0">
        <PaymentAppIcon type={applicationType} size="md" />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#F5F8FC] group-hover:text-[#25C9F2] transition-colors truncate">
            {displayTitle}
          </p>
          <p className="text-xs font-mono text-[#91A2B8] truncate">{upiId}</p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {onCopy && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onCopy();
            }}
            aria-label={`Copy ${upiId}`}
            className="h-8 w-8 inline-flex items-center justify-center rounded-md bg-[#080C14] border border-[rgba(145,162,184,0.18)] text-[#91A2B8] hover:text-[#F5F8FC] transition-colors cursor-pointer"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-[#28C987]" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        )}
        {mode === 'visitor' && (
          <span className="h-8 w-8 inline-flex items-center justify-center rounded-md bg-[#25C9F2]/10 text-[#25C9F2] group-hover:bg-[#25C9F2] group-hover:text-[#080C14] transition-colors">
            <ArrowUpRight className="w-4 h-4" />
          </span>
        )}
      </div>
    </div>
  );
};
