import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightSlot?: React.ReactNode;
  wrapperClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      wrapperClassName,
      label,
      hint,
      error,
      leftIcon,
      rightSlot,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || React.useId();

    return (
      <div className={cn('space-y-1.5 w-full', wrapperClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-medium text-[#91A2B8] tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span className="absolute left-3.5 text-[#64748B] pointer-events-none flex items-center">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={cn(
              'w-full h-10 bg-[#080C14] border rounded-lg text-sm text-[#F5F8FC] placeholder:text-[#64748B] transition-colors duration-150',
              'focus:outline-none focus:border-[#25C9F2] focus:ring-1 focus:ring-[#25C9F2]/40',
              'disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[#0D1422]',
              error
                ? 'border-[#F06473] focus:border-[#F06473] focus:ring-[#F06473]/30'
                : 'border-[rgba(145,162,184,0.22)] hover:border-[rgba(145,162,184,0.36)]',
              leftIcon ? 'pl-10' : 'px-3.5',
              rightSlot ? 'pr-10' : 'pr-3.5',
              className
            )}
            {...props}
          />
          {rightSlot && (
            <span className="absolute right-3 flex items-center">{rightSlot}</span>
          )}
        </div>
        {error ? (
          <p id={`${inputId}-error`} className="flex items-center gap-1.5 text-xs text-[#F06473]">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="text-xs text-[#64748B]">
            {hint}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
