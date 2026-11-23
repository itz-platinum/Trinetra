import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  QrCode,
  Share2,
  EyeOff,
  Info,
} from 'lucide-react';
import { PublicProfileLayout } from '../components/PublicProfileLayout';
import { Avatar } from '../components/Avatar';
import { PaymentAppItem } from '../components/PaymentAppItem';
import { PaymentAppIcon } from '../components/PaymentAppIcon';
import { QrCodePanel } from '../components/QrCodePanel';
import { Button } from '../components/ui/Button';
import { Dialog } from '../components/ui/Dialog';
import { Skeleton } from '../components/ui/Skeleton';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import { EmptyState } from '../components/ui/EmptyState';
import { useToast } from '../components/ui/Toast';
import { apiClient, ApiError } from '../lib/api';
import { buildUpiUri, getUpiAppMeta, cn } from '../lib/utils';
import { PublicProfile, PublicConnection } from '../types';

const AMOUNT_PRESETS = ['100', '500', '1000', '2000'];

export const PublicProfilePage: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const toast = useToast();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [connections, setConnections] = useState<PublicConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [unpublished, setUnpublished] = useState(false);

  const [amount, setAmount] = useState(() => {
    if (typeof window === 'undefined') return '';
    const params = new URLSearchParams(window.location.search);
    const raw = params.get('amount') || params.get('am') || '';
    const parsed = parseFloat(raw);
    return !Number.isNaN(parsed) && parsed > 0 && parsed <= 100000 ? raw : '';
  });
  const [copiedVpa, setCopiedVpa] = useState<string | null>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const [selectedApp, setSelectedApp] = useState<PublicConnection | null>(null);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [showInlineQr, setShowInlineQr] = useState(true);

  const canonicalUsername = profile?.username || username || '';
  const profileUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/u/${encodeURIComponent(canonicalUsername)}`
      : '';

  useEffect(() => {
    fetchProfileData();
  }, [username]);

  const fetchProfileData = async () => {
    setLoading(true);
    setError('');
    setUnpublished(false);
    try {
      const data = await apiClient.get<{
        profile: PublicProfile;
        connections: PublicConnection[];
      }>(`/api/public/profile/${encodeURIComponent(username || '')}`, {
        skipUnauthorizedHandler: true,
      });
      setProfile(data.profile);
      setConnections(data.connections || []);
    } catch (err: any) {
      if (err instanceof ApiError && err.data?.unpublished) {
        setUnpublished(true);
      } else {
        setError(err instanceof ApiError ? err.message : 'Unable to load profile right now.');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyVpa = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedVpa(id);
    toast.success('UPI ID copied', text);
    setTimeout(() => setCopiedVpa(null), 2000);
  };

  const handleCopyProfileLink = () => {
    navigator.clipboard.writeText(profileUrl);
    setCopiedUrl(true);
    toast.success('Profile link copied', `/u/${canonicalUsername}`);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share && profile) {
      try {
        await navigator.share({
          title: `${profile.full_name} (@${profile.username}) — TRINETRA`,
          text: `Pay ${profile.full_name} via UPI on TRINETRA`,
          url: profileUrl,
        });
      } catch {
        // User dismissed share sheet
      }
    } else {
      handleCopyProfileLink();
    }
  };

  const handlePayClick = (conn: PublicConnection) => {
    setSelectedApp(conn);
    setPayModalOpen(true);
  };

  const getUpiUriForConn = (conn: PublicConnection) => {
    if (!profile) return '#';
    return buildUpiUri({
      vpa: conn.upi_id,
      recipientName: profile.full_name,
      amount,
      appType: conn.application_type,
    });
  };

  if (loading) {
    return (
      <PublicProfileLayout>
        <div className="w-full rounded-xl border border-[rgba(145,162,184,0.16)] bg-[#0D1422]/85 backdrop-blur-md p-6 space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-3.5 w-24" />
            </div>
          </div>
          <Skeleton className="h-12 w-full" />
          <div className="space-y-2.5">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
      </PublicProfileLayout>
    );
  }

  if (unpublished) {
    return (
      <PublicProfileLayout>
        <div className="w-full rounded-xl border border-[rgba(145,162,184,0.18)] bg-[#0D1422]/85 backdrop-blur-md p-8 text-center space-y-5">
          <div className="w-12 h-12 rounded-xl bg-[#121E2E] border border-[rgba(145,162,184,0.18)] flex items-center justify-center text-[#91A2B8] mx-auto">
            <EyeOff className="w-5 h-5" />
          </div>
          <div className="space-y-1.5">
            <StatusIndicator tone="neutral" label="Profile Unpublished" className="mx-auto" />
            <h1 className="font-display text-xl font-semibold text-[#F5F8FC]">
              @{username} is currently unavailable
            </h1>
            <p className="text-sm text-[#91A2B8] leading-relaxed">
              The owner of this TRINETRA profile has temporarily unpublished their public payment connections.
            </p>
          </div>
          <Link to="/" className="inline-block">
            <Button variant="secondary">Return to TRINETRA</Button>
          </Link>
        </div>
      </PublicProfileLayout>
    );
  }

  if (error || !profile) {
    return (
      <PublicProfileLayout>
        <div className="w-full rounded-xl border border-[rgba(145,162,184,0.18)] bg-[#0D1422]/85 backdrop-blur-md p-8 text-center space-y-5">
          <div className="w-12 h-12 rounded-xl bg-[#F06473]/10 border border-[#F06473]/25 flex items-center justify-center text-[#F06473] mx-auto">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div className="space-y-1.5">
            <h1 className="font-display text-xl font-semibold text-[#F5F8FC]">
              Profile not found
            </h1>
            <p className="text-sm text-[#91A2B8] leading-relaxed">
              No active TRINETRA identity exists for{' '}
              <span className="font-mono text-[#F5F8FC]">@{username}</span>.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Link to="/">
              <Button variant="secondary">Home</Button>
            </Link>
            <Link to="/register">
              <Button>Claim @{username}</Button>
            </Link>
          </div>
        </div>
      </PublicProfileLayout>
    );
  }

  const parsedAmount = amount ? parseFloat(amount) : NaN;
  const hasValidAmount = !Number.isNaN(parsedAmount) && parsedAmount > 0;

  return (
    <PublicProfileLayout>
      {/* Essential Public Identity Card */}
      <div className="rounded-xl border border-[rgba(145,162,184,0.18)] bg-[#0D1422]/88 backdrop-blur-md shadow-2xl overflow-hidden animate-fade-in">
        {/* Identity Section */}
        <div className="p-6 border-b border-[rgba(145,162,184,0.12)] space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <Avatar src={profile.avatar_url} name={profile.full_name} size="xl" />
              <div className="min-w-0">
                <h1 className="font-display text-xl font-semibold text-[#F5F8FC] truncate">
                  {profile.full_name}
                </h1>
                <p className="font-mono text-xs text-[#25C9F2] truncate mt-0.5">
                  @{profile.username}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleNativeShare}
              aria-label="Share profile"
              className="h-8 w-8 inline-flex items-center justify-center rounded-md bg-[#121E2E] hover:bg-[#19283D] border border-[rgba(145,162,184,0.18)] text-[#91A2B8] hover:text-[#F5F8FC] transition-colors shrink-0 cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {profile.bio && (
            <p className="text-sm text-[#91A2B8] leading-relaxed">{profile.bio}</p>
          )}

          {/* Quick Share & QR Actions */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={handleCopyProfileLink}
              className="flex-1 h-8 inline-flex items-center justify-center gap-1.5 rounded-md bg-[#080C14] hover:bg-[#121E2E] border border-[rgba(145,162,184,0.16)] text-xs font-medium text-[#91A2B8] hover:text-[#F5F8FC] transition-colors cursor-pointer"
            >
              {copiedUrl ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#28C987]" />
                  <span className="text-[#28C987]">Copied link</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy link</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => setShowInlineQr((prev) => !prev)}
              className={cn(
                'flex-1 h-8 inline-flex items-center justify-center gap-1.5 rounded-md border text-xs font-medium transition-colors cursor-pointer',
                showInlineQr
                  ? 'bg-[#25C9F2]/12 border-[#25C9F2]/40 text-[#25C9F2]'
                  : 'bg-[#080C14] hover:bg-[#121E2E] border-[rgba(145,162,184,0.16)] text-[#91A2B8] hover:text-[#F5F8FC]'
              )}
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>{showInlineQr ? 'Hide QR Code' : 'Show QR Code'}</span>
            </button>
          </div>
        </div>

        {/* Expandable Inline QR Code Generator Panel */}
        {showInlineQr && (
          <div className="p-6 border-b border-[rgba(145,162,184,0.12)] bg-[#080C14]/50 animate-fade-in">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-display text-sm font-semibold text-[#F5F8FC]">
                  Scan & Pay QR Code
                </h2>
                <p className="text-xs text-[#91A2B8]">
                  Encodes direct UPI payment intent or profile URL
                </p>
              </div>
            </div>
            <QrCodePanel
              profileUrl={profileUrl}
              recipientName={profile.full_name}
              connections={connections}
              amount={hasValidAmount ? amount : undefined}
            />
          </div>
        )}

        {/* Optional Custom Amount Entry */}
        {profile.allow_custom_amount && (
          <div className="px-6 py-4 border-b border-[rgba(145,162,184,0.12)] bg-[#080C14]/35 space-y-2.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="custom-upi-amount"
                className="text-xs font-medium text-[#91A2B8]"
              >
                Amount (Optional, INR)
              </label>
              {amount && (
                <button
                  type="button"
                  onClick={() => setAmount('')}
                  className="text-[11px] text-[#64748B] hover:text-[#F5F8FC] cursor-pointer"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono text-sm font-semibold text-[#F5F8FC]">
                ₹
              </span>
              <input
                id="custom-upi-amount"
                type="number"
                min="1"
                max="100000"
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount (e.g. 500)"
                className="w-full h-10 bg-[#080C14] border border-[rgba(145,162,184,0.22)] rounded-lg pl-8 pr-3.5 text-sm font-mono tabular-nums text-[#F5F8FC] placeholder:text-[#64748B] focus:outline-none focus:border-[#25C9F2]"
              />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {AMOUNT_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset)}
                  className={cn(
                    'px-2.5 py-1 rounded-md text-[11px] font-mono tabular-nums border transition-colors cursor-pointer',
                    amount === preset
                      ? 'bg-[#25C9F2]/12 border-[#25C9F2]/40 text-[#25C9F2]'
                      : 'bg-[#080C14] border-[rgba(145,162,184,0.14)] text-[#91A2B8] hover:text-[#F5F8FC]'
                  )}
                >
                  ₹{preset}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Payment Destinations */}
        <div className="p-6 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
              Payment Destinations
            </h2>
            <span className="font-mono text-[11px] text-[#91A2B8] tabular-nums">
              {connections.length} {connections.length === 1 ? 'app' : 'apps'}
            </span>
          </div>

          {connections.length === 0 ? (
            <EmptyState
              icon={<QrCode className="w-5 h-5" />}
              title="No payment apps active"
              description="This user has not enabled any UPI payment handles yet."
              className="py-8"
            />
          ) : (
            <div className="space-y-2.5">
              {connections.map((conn) => (
                <PaymentAppItem
                  key={conn.id}
                  id={conn.id}
                  applicationType={conn.application_type}
                  label={conn.application_label}
                  upiId={conn.upi_id}
                  mode="visitor"
                  copied={copiedVpa === conn.id}
                  onSelect={() => handlePayClick(conn)}
                  onCopy={() => copyVpa(conn.upi_id, conn.id)}
                />
              ))}
            </div>
          )}

          <div className="pt-2 flex items-start gap-2 text-[11px] text-[#64748B] leading-relaxed">
            <Info className="w-3.5 h-3.5 text-[#91A2B8] shrink-0 mt-0.5" />
            <span>
              Selecting an app opens a standard UPI payment intent on your device. TRINETRA never handles funds or UPI PINs.
            </span>
          </div>
        </div>
      </div>

      {/* Payment Launch Confirmation Dialog */}
      <Dialog
        open={payModalOpen && Boolean(selectedApp)}
        onClose={() => setPayModalOpen(false)}
        title={
          selectedApp
            ? `Pay with ${selectedApp.application_label || getUpiAppMeta(selectedApp.application_type).name}`
            : 'Open UPI App'
        }
        description={`Initiate a UPI intent to ${profile.full_name}`}
        maxWidth="sm"
      >
        {selectedApp && (
          <div className="space-y-5">
            <div className="flex items-center gap-3.5 p-3.5 rounded-lg bg-[#080C14] border border-[rgba(145,162,184,0.14)]">
              <PaymentAppIcon type={selectedApp.application_type} size="md" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-[#F5F8FC] truncate">
                  {selectedApp.application_label || getUpiAppMeta(selectedApp.application_type).name}
                </p>
                <p className="text-xs font-mono text-[#91A2B8] truncate">
                  {selectedApp.upi_id}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-[#080C14] border border-[rgba(145,162,184,0.14)] divide-y divide-[rgba(145,162,184,0.1)] text-xs">
              <div className="flex items-center justify-between px-3.5 py-2.5">
                <span className="text-[#91A2B8]">Recipient</span>
                <span className="font-medium text-[#F5F8FC]">{profile.full_name}</span>
              </div>
              <div className="flex items-center justify-between px-3.5 py-2.5">
                <span className="text-[#91A2B8]">UPI ID (VPA)</span>
                <span className="font-mono text-[#F5F8FC]">{selectedApp.upi_id}</span>
              </div>
              {hasValidAmount && (
                <div className="flex items-center justify-between px-3.5 py-2.5">
                  <span className="text-[#91A2B8]">Amount</span>
                  <span className="font-mono font-semibold text-[#28C987] tabular-nums">
                    ₹{parsedAmount.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            <div className="space-y-2.5">
              <a
                href={getUpiUriForConn(selectedApp)}
                onClick={() => setPayModalOpen(false)}
                className="w-full h-11 px-6 rounded-lg text-sm font-medium bg-[#25C9F2] text-[#080C14] hover:bg-[#3DD2F6] inline-flex items-center justify-center gap-2 transition-colors"
              >
                <span>Open {getUpiAppMeta(selectedApp.application_type).name}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <Button
                variant="secondary"
                size="md"
                className="w-full"
                leftIcon={
                  copiedVpa === `${selectedApp.id}_modal` ? (
                    <Check className="w-3.5 h-3.5 text-[#28C987]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )
                }
                onClick={() => copyVpa(selectedApp.upi_id, `${selectedApp.id}_modal`)}
              >
                {copiedVpa === `${selectedApp.id}_modal` ? 'UPI ID Copied' : 'Copy UPI ID'}
              </Button>
            </div>

            <p className="text-[11px] text-[#64748B] leading-relaxed text-center">
              Payments are completed inside your UPI application. TRINETRA does not verify payment completion.
            </p>
          </div>
        )}
      </Dialog>
    </PublicProfileLayout>
  );
};
