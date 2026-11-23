import React, { useState, useRef, useEffect } from 'react';
import { cn } from '../../lib/utils';

export interface DropdownItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
  dividerBefore?: boolean;
}

export interface DropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export const Dropdown: React.FC<DropdownProps> = ({
  trigger,
  items,
  align = 'right',
  className,
}) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', handleOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      <div onClick={() => setOpen((prev) => !prev)} className="cursor-pointer">
        {trigger}
      </div>
      {open && (
        <div
          role="menu"
          className={cn(
            'absolute z-50 mt-2 w-52 rounded-lg bg-[#0D1422] border border-[rgba(145,162,184,0.22)] shadow-xl py-1.5 animate-fade-in',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {item.dividerBefore && (
                <div className="my-1 border-t border-[rgba(145,162,184,0.12)]" />
              )}
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  item.onClick();
                }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-medium text-left transition-colors cursor-pointer',
                  item.danger
                    ? 'text-[#F06473] hover:bg-[#F06473]/10'
                    : 'text-[#F5F8FC] hover:bg-[#121E2E]'
                )}
              >
                {item.icon && <span className="shrink-0 opacity-80">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </button>
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};
