import React from 'react';
import { cn } from '../../lib/utils';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-dashed border-[rgba(145,162,184,0.22)] bg-[#0D1422]/60 px-6 py-12 text-center flex flex-col items-center',
        className
      )}
    >
      <div className="w-11 h-11 rounded-lg bg-[#121E2E] border border-[rgba(145,162,184,0.16)] flex items-center justify-center text-[#91A2B8] mb-4">
        {icon}
      </div>
      <h3 className="font-display text-base font-semibold text-[#F5F8FC]">{title}</h3>
      <p className="text-sm text-[#91A2B8] mt-1.5 max-w-sm leading-relaxed">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
};
