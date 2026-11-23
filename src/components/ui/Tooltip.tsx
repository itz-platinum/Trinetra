import React, { useState } from 'react';
import { cn } from '../../lib/utils';

export interface TooltipProps {
  content: string;
  children: React.ReactNode;
  side?: 'top' | 'bottom';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  side = 'top',
  className,
}) => {
  const [visible, setVisible] = useState(false);

  return (
    <span
      className={cn('relative inline-flex items-center', className)}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <span
          role="tooltip"
          className={cn(
            'pointer-events-none absolute left-1/2 -translate-x-1/2 z-50 px-2.5 py-1.5 rounded-md text-xs font-medium whitespace-nowrap',
            'bg-[#121E2E] text-[#F5F8FC] border border-[rgba(145,162,184,0.24)] shadow-lg animate-fade-in',
            side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
};
