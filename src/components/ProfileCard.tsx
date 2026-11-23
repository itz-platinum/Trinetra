import React from 'react';
import { Globe, EyeOff } from 'lucide-react';
import { Avatar } from './Avatar';
import { StatusIndicator } from './ui/StatusIndicator';
import { PaymentAppItem } from './PaymentAppItem';
import { cn } from '../lib/utils';
import { UpiAppType } from '../types';

export interface ProfileCardConnection {
  id: string;
  application_type: UpiAppType | string;
  application_label?: string;
  upi_id: string;
}

export interface ProfileCardProps {
  fullName: string;
  username: string;
  avatarUrl?: string;
  bio?: string;
  visibility?: 'public' | 'unpublished';
  connections: ProfileCardConnection[];
  compact?: boolean;
  className?: string;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  fullName,
  username,
  avatarUrl,
  bio,
  visibility = 'public',
  connections,
  compact = false,
  className,
}) => {
  return (
    <div
      className={cn(
        'rounded-xl border border-[rgba(145,162,184,0.16)] bg-[#0D1422] overflow-hidden',
        className
      )}
    >
      <div className={cn('border-b border-[rgba(145,162,184,0.12)]', compact ? 'p-5' : 'p-6')}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <Avatar src={avatarUrl} name={fullName || 'User'} size={compact ? 'md' : 'lg'} />
            <div className="min-w-0">
              <h3 className="font-display text-base font-semibold text-[#F5F8FC] truncate">
                {fullName || 'Your Name'}
              </h3>
              <p className="text-xs font-mono text-[#25C9F2] truncate">
                @{username || 'username'}
              </p>
            </div>
          </div>
          <StatusIndicator
            tone={visibility === 'public' ? 'success' : 'neutral'}
            label={visibility === 'public' ? 'Public' : 'Unpublished'}
            icon={
              visibility === 'public' ? (
                <Globe className="w-3.5 h-3.5" />
              ) : (
                <EyeOff className="w-3.5 h-3.5" />
              )
            }
          />
        </div>
        {bio && (
          <p className="text-xs text-[#91A2B8] leading-relaxed mt-4 line-clamp-3">{bio}</p>
        )}
      </div>

      <div className={cn('space-y-2.5', compact ? 'p-4' : 'p-5')}>
        <p className="text-[11px] font-mono uppercase tracking-wider text-[#64748B]">
          Payment Destinations ({connections.length})
        </p>
        {connections.length === 0 ? (
          <p className="text-xs text-[#64748B] py-4 text-center border border-dashed border-[rgba(145,162,184,0.16)] rounded-lg">
            No enabled payment apps yet
          </p>
        ) : (
          <div className="space-y-2">
            {connections.slice(0, compact ? 3 : 5).map((conn) => (
              <PaymentAppItem
                key={conn.id}
                id={conn.id}
                applicationType={conn.application_type}
                label={conn.application_label}
                upiId={conn.upi_id}
                mode="preview"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
