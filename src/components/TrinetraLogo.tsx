import React from 'react';
import { cn } from '../lib/utils';

interface TrinetraLogoProps {
  className?: string;
  size?: number;
  withWordmark?: boolean;
}

export const TrinetraLogo: React.FC<TrinetraLogoProps> = ({
  className = '',
  size = 28,
  withWordmark = false,
}) => {
  return (
    <span className={cn('inline-flex items-center gap-2.5 select-none shrink-0', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="shrink-0"
      >
        <rect
          x="1"
          y="1"
          width="34"
          height="34"
          rx="8"
          fill="#0D1422"
          stroke="rgba(145, 162, 184, 0.22)"
          strokeWidth="1.2"
        />
        {/* Outer third-eye geometric contour */}
        <path
          d="M18 6.5C23.5 11.2 26.5 14.5 26.5 18C26.5 21.5 23.5 24.8 18 29.5C12.5 24.8 9.5 21.5 9.5 18C9.5 14.5 12.5 11.2 18 6.5Z"
          stroke="#25C9F2"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {/* Connection rays */}
        <path d="M5.5 18H9.5" stroke="#477BFF" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M26.5 18H30.5" stroke="#477BFF" strokeWidth="1.5" strokeLinecap="round" />
        {/* Core node */}
        <circle cx="18" cy="18" r="3" fill="#25C9F2" />
        <circle cx="18" cy="18" r="1.2" fill="#080C14" />
      </svg>
      {withWordmark && (
        <span className="font-display font-semibold text-base tracking-[0.08em] text-[#F5F8FC] whitespace-nowrap">
          TRINETRA
        </span>
      )}
    </span>
  );
};
