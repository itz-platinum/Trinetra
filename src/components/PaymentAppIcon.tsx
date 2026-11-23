import React from 'react';
import { Smartphone } from 'lucide-react';
import { cn, getUpiAppMeta } from '../lib/utils';
import { UpiAppType } from '../types';

export interface PaymentAppIconProps {
  type: UpiAppType | string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const boxSizes = {
  sm: 'w-8 h-8 text-[11px] rounded-md',
  md: 'w-10 h-10 text-xs rounded-lg',
  lg: 'w-12 h-12 text-sm rounded-lg',
};

export const PaymentAppIcon: React.FC<PaymentAppIconProps> = ({
  type,
  size = 'md',
  className,
}) => {
  const meta = getUpiAppMeta(type);

  return (
    <div
      className={cn(
        'shrink-0 border flex items-center justify-center font-mono font-semibold tracking-tight select-none',
        meta.bgTint,
        meta.borderTint,
        boxSizes[size],
        className
      )}
      style={{ color: meta.accentHex }}
      aria-hidden="true"
    >
      {type === 'other' ? (
        <Smartphone className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      ) : (
        meta.shortCode
      )}
    </div>
  );
};
