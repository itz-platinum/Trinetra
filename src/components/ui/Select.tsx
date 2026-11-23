import React from 'react';
import { ChevronDown, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: SelectOption[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, hint, error, options, id, disabled, ...props }, ref) => {
    const selectId = id || React.useId();

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-medium text-[#91A2B8] tracking-wide">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            className={cn(
              'w-full h-10 appearance-none bg-[#080C14] border rounded-lg pl-3.5 pr-10 text-sm text-[#F5F8FC] transition-colors duration-150',
              'focus:outline-none focus:border-[#25C9F2] focus:ring-1 focus:ring-[#25C9F2]/40',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              error
                ? 'border-[#F06473] focus:border-[#F06473]'
                : 'border-[rgba(145,162,184,0.22)] hover:border-[rgba(145,162,184,0.36)]',
              className
            )}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled} className="bg-[#0D1422] text-[#F5F8FC]">
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-[#91A2B8] pointer-events-none absolute right-3 top-1/2 -translate-y-1/2" />
        </div>
        {error ? (
          <p className="flex items-center gap-1.5 text-xs text-[#F06473]">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        ) : hint ? (
          <p className="text-xs text-[#64748B]">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
