import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, hint, error, id, disabled, ...props }, ref) => {
    const inputId = id || React.useId();

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-medium text-[#91A2B8] tracking-wide">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          className={cn(
            'w-full bg-[#080C14] border rounded-lg px-3.5 py-2.5 text-sm text-[#F5F8FC] placeholder:text-[#64748B] transition-colors duration-150 resize-y',
            'focus:outline-none focus:border-[#25C9F2] focus:ring-1 focus:ring-[#25C9F2]/40',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            error
              ? 'border-[#F06473] focus:border-[#F06473]'
              : 'border-[rgba(145,162,184,0.22)] hover:border-[rgba(145,162,184,0.36)]',
            className
          )}
          {...props}
        />
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

Textarea.displayName = 'Textarea';
