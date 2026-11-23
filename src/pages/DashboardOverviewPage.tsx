import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Copy,
  Check,
  ExternalLink,
  CreditCard,
  User as UserIcon,
  Plus,
  Settings,
  QrCode,
  Shield,
  ArrowRight,
  CheckCircle2,
  Circle,
  Share2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../components/DashboardLayout';
import { ProfileCard } from '../components/ProfileCard';
import { QrCodePanel } from '../components/QrCodePanel';
import { PaymentAppItem } from '../components/PaymentAppItem';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Dialog } from '../components/ui/Dialog';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';
import { apiClient, ApiError } from '../lib/api';
import { PaymentConnection } from '../types';

export const DashboardOverviewPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [connections, setConnections] = useState<PaymentConnection[]>([]);
  const [loadingConnections, setLoadingConnections] = useState(true);
  const [copied, setCopied] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);

  const publicUrl =
    typeof window !== 'undefined' && user
      ? `${window.location.origin}/u/${user.username}`
      : '';

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    setLoadingConnections(true);
    try {
      const data = await apiClient.get<{ connections: PaymentConnection[] }>(
        '/api/payment-connections'
      );
      setConnections(data.connections || []);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        toast.error('Session expired', err.message);
      }
    } finally {
      setLoadingConnections(false);
    }
  };

  const copyProfileLink = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success('Public link copied', publicUrl);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share && user) {
      try {
        await navigator.share({
          title: `${user.full_name} (@${user.username}) — TRINETRA`,
          text: 'Pay via UPI using my TRINETRA profile link',
          url: publicUrl,
        });
      } catch {
        // cancelled
      }
    } else {
      copyProfileLink();
    }
  };

  if (!user) return null;

  const enabledConnections = connections.filter((c) => c.is_enabled === 1);
  const checklist = [
    {
      label: 'Set display name and public bio',
      done: Boolean(user.full_name?.trim() && user.bio?.trim()),
      actionPath: '/dashboard/profile',
    },
    {
      label: 'Connect at least one active UPI app',
      done: enabledConnections.length > 0,
      actionPath: '/dashboard/payment-methods',
    },
    {
      label: 'Keep public profile visibility active',
      done: user.profile_visibility === 'public',
      actionPath: '/dashboard/settings',
    },
  ];
  const completedSteps = checklist.filter((item) => item.done).length;

  return (
    <DashboardLayout pageTitle="Overview">
      <div className="space-y-8 animate-fade-in">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(145,162,184,0.12)]">
          <div className="space-y-1">
            <p className="font-mono text-[11px] uppercase tracking-wider text-[#25C9F2]">
              Workspace
            </p>
            <h2 className="font-display text-2xl font-bold text-[#F5F8FC] tracking-tight">
              Welcome back, {user.full_name.split(' ')[0]}
            </h2>
            <p className="text-sm text-[#91A2B8]">
              Manage your shareable UPI identity, active payment destinations, and QR code.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setQrModalOpen(true)}
              leftIcon={<QrCode className="w-4 h-4 text-[#25C9F2]" />}
            >
              QR Code
            </Button>
            <Link to={`/u/${user.username}`} target="_blank" rel="noopener noreferrer">
              <Button size="md" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                Public Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Public Share URL Strip */}
        <Card>
          <CardContent className="py-4 px-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
                Shareable Payment Link
              </p>
              <p className="font-mono text-sm text-[#F5F8FC] truncate mt-0.5">{publicUrl}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={copyProfileLink}
                leftIcon={
                  copied ? (
                    <Check className="w-3.5 h-3.5 text-[#28C987]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )
                }
              >
                {copied ? 'Copied' : 'Copy Link'}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleShare}
                leftIcon={<Share2 className="w-3.5 h-3.5" />}
              >
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main 2-Column Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Setup Checklist + Connected UPI Apps */}
          <div className="lg:col-span-7 space-y-6">
            {/* Profile Completion Checklist */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle>Identity Readiness</CardTitle>
                  <CardDescription>
                    {completedSteps} of {checklist.length} configuration steps completed
                  </CardDescription>
                </div>
                <span className="font-mono text-xs text-[#25C9F2] tabular-nums">
                  {Math.round((completedSteps / checklist.length) * 100)}%
                </span>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {checklist.map((step, idx) => (
                  <Link
                    key={idx}
                    to={step.actionPath}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg bg-[#080C14] border border-[rgba(145,162,184,0.12)] hover:border-[rgba(145,162,184,0.28)] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {step.done ? (
                        <CheckCircle2 className="w-4 h-4 text-[#28C987] shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-[#64748B] shrink-0" />
                      )}
                      <span
                        className={`text-xs font-medium truncate ${
                          step.done ? 'text-[#91A2B8]' : 'text-[#F5F8FC]'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#64748B] shrink-0" />
                  </Link>
                ))}
              </CardContent>
            </Card>

            {/* Connected Payment Destinations */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle>Payment Connections</CardTitle>
                  <CardDescription>
                    {enabledConnections.length} enabled on your public profile
                  </CardDescription>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate('/dashboard/payment-methods')}
                  leftIcon={<Plus className="w-3.5 h-3.5" />}
                >
                  Manage
                </Button>
              </CardHeader>
              <CardContent>
                {loadingConnections ? (
                  <div className="space-y-2.5">
                    <Skeleton className="h-14 w-full" />
                    <Skeleton className="h-14 w-full" />
                  </div>
                ) : connections.length === 0 ? (
                  <EmptyState
                    icon={<CreditCard className="w-5 h-5" />}
                    title="No UPI connections added"
                    description="Add your Google Pay, PhonePe, Paytm, or BHIM handle to accept UPI payments."
                    action={
                      <Button
                        size="sm"
                        onClick={() => navigate('/dashboard/payment-methods')}
                        leftIcon={<Plus className="w-3.5 h-3.5" />}
                      >
                        Add payment app
                      </Button>
                    }
                  />
                ) : (
                  <div className="space-y-2.5">
                    {connections.slice(0, 4).map((conn) => (
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
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Live Public Profile Card Preview */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
                Live Public Preview
              </p>
              <Link
                to="/dashboard/profile"
                className="text-xs font-medium text-[#25C9F2] hover:underline"
              >
                Edit details
              </Link>
            </div>
            <ProfileCard
              fullName={user.full_name}
              username={user.username}
              avatarUrl={user.avatar_url}
              bio={user.bio}
              visibility={user.profile_visibility}
              connections={enabledConnections}
            />
          </div>
        </div>

        {/* Quick Navigation Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Profile & Bio',
              desc: 'Update avatar, name, and handle',
              icon: UserIcon,
              path: '/dashboard/profile',
            },
            {
              title: 'UPI Connections',
              desc: 'Configure linked VPA handles',
              icon: CreditCard,
              path: '/dashboard/payment-methods',
            },
            {
              title: 'Visibility & Preferences',
              desc: 'Public toggle & custom amounts',
              icon: Settings,
              path: '/dashboard/settings',
            },
            {
              title: 'Security',
              desc: 'Password & session management',
              icon: Shield,
              path: '/dashboard/security',
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className="group rounded-xl border border-[rgba(145,162,184,0.14)] bg-[#0D1422] hover:bg-[#121E2E] hover:border-[rgba(145,162,184,0.28)] p-5 transition-colors space-y-2.5"
              >
                <div className="w-9 h-9 rounded-lg bg-[#121E2E] border border-[rgba(145,162,184,0.16)] flex items-center justify-center text-[#25C9F2]">
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#F5F8FC] group-hover:text-[#25C9F2] transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#91A2B8] mt-0.5">{item.desc}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* QR Modal */}
      <Dialog
        open={qrModalOpen}
        onClose={() => setQrModalOpen(false)}
        title="Profile & UPI QR Code"
        description={`Shareable QR codes for @${user.username}`}
        maxWidth="sm"
      >
        <QrCodePanel
          profileUrl={publicUrl}
          recipientName={user.full_name}
          connections={enabledConnections.map((c) => ({
            id: c.id,
            application_type: c.application_type,
            application_label: c.application_label || c.application_type,
            upi_id: c.upi_id,
            display_order: c.display_order,
          }))}
        />
      </Dialog>
    </DashboardLayout>
  );
};
