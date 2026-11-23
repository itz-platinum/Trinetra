import React from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  elevated?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, elevated = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border border-[rgba(145,162,184,0.16)] backdrop-blur-md',
        elevated ? 'bg-[#121E2E]/88' : 'bg-[#0D1422]/84',
        className
      )}
      {...props}
    />
  )
);
Card.displayName = 'Card';

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('px-6 py-5 border-b border-[rgba(145,162,184,0.12)]', className)} {...props} />
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({ className, ...props }) => (
  <h3 className={cn('font-display text-base font-semibold text-[#F5F8FC] tracking-tight', className)} {...props} />
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({ className, ...props }) => (
  <p className={cn('text-xs text-[#91A2B8] mt-1 leading-relaxed', className)} {...props} />
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('p-6', className)} {...props} />
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, ...props }) => (
  <div className={cn('px-6 py-4 border-t border-[rgba(145,162,184,0.12)] flex items-center justify-between', className)} {...props} />
);
