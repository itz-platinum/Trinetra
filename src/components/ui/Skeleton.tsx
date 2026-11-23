import React from 'react';
import { cn } from '../../lib/utils';

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div
    aria-hidden="true"
    className={cn(
      'animate-pulse rounded-md bg-[#121E2E] border border-[rgba(145,162,184,0.08)]',
      className
    )}
  />
);
