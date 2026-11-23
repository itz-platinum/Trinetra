import React, { useState } from 'react';
import { cn, getInitials } from '../lib/utils';

export interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs rounded-md',
  md: 'w-10 h-10 text-xs rounded-lg',
  lg: 'w-14 h-14 text-base rounded-xl',
  xl: 'w-20 h-20 text-xl rounded-xl',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className,
}) => {
  const [imgError, setImgError] = useState(false);
  const showImage = Boolean(src && src.trim() && !imgError);

  return (
    <div
      className={cn(
        'relative overflow-hidden shrink-0 bg-[#121E2E] border border-[rgba(145,162,184,0.22)] flex items-center justify-center font-display font-semibold text-[#25C9F2] select-none',
        sizeClasses[size],
        className
      )}
    >
      {showImage ? (
        <img
          src={src!}
          alt={name}
          referrerPolicy="no-referrer"
          onError={() => setImgError(true)}
          className="w-full h-full object-cover"
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
};
