import React from 'react';
import { CheckCircle2, AlertCircle, Clock, ShieldCheck, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';

export type StatusTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface StatusIndicatorProps {
  tone?: StatusTone;
  label: string;
  icon?: React.ReactNode;
  className?: string;
}

const toneStyles: Record<StatusTone, string> = {
  success: 'text-[#28C987]',
  warning: 'text-[#E5A93B]',
  danger: 'text-[#F06473]',
  info: 'text-[#25C9F2]',
  neutral: 'text-[#91A2B8]',
};

const defaultIcons: Record<StatusTone, React.ReactNode> = {
  success: <CheckCircle2 className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />,
  warning: <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />,
  danger: <AlertCircle className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />,
  info: <ShieldCheck className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />,
  neutral: <EyeOff className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />,
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  tone = 'neutral',
  label,
  icon,
  className,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap',
        toneStyles[tone],
        className
      )}
    >
      {icon ?? defaultIcons[tone]}
      <span>{label}</span>
    </span>
  );
};
