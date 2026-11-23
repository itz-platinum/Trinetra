import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[#25C9F2] text-[#080C14] hover:bg-[#3DD2F6] active:bg-[#1BB5DC] border border-[#25C9F2]/40 font-semibold shadow-sm',
  secondary:
    'bg-[#121E2E] text-[#F5F8FC] hover:bg-[#19283D] active:bg-[#0F1927] border border-[rgba(145,162,184,0.22)] font-medium',
  outline:
    'bg-transparent text-[#F5F8FC] hover:bg-[#121E2E] active:bg-[#0D1422] border border-[rgba(145,162,184,0.24)] font-medium',
  ghost:
    'bg-transparent text-[#91A2B8] hover:text-[#F5F8FC] hover:bg-[#121E2E]/80 active:bg-[#121E2E] border border-transparent font-medium',
  danger:
    'bg-[#F06473]/12 text-[#F06473] hover:bg-[#F06473]/20 active:bg-[#F06473]/25 border border-[#F06473]/30 font-semibold',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-md',
  md: 'h-10 px-4 text-sm gap-2 rounded-lg',
  lg: 'h-11 px-5 text-sm gap-2.5 rounded-lg',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      loading = false,
      disabled,
      leftIcon,
      rightIcon,
      children,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading}
        className={cn(
          'inline-flex items-center justify-center whitespace-nowrap shrink-0 transition-colors duration-150 select-none',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#25C9F2] focus-visible:ring-offset-2 focus-visible:ring-offset-[#080C14]',
          'disabled:opacity-50 disabled:pointer-events-none cursor-pointer',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" aria-hidden="true" />
        ) : leftIcon ? (
          <span className="shrink-0 flex items-center">{leftIcon}</span>
        ) : null}
        <span>{children}</span>
        {!loading && rightIcon ? (
          <span className="shrink-0 flex items-center">{rightIcon}</span>
        ) : null}
      </button>
    );
  }
);

Button.displayName = 'Button';
