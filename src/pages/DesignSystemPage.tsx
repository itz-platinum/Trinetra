import React, { useState } from 'react';
import {
  ArrowRight,
  Bell,
  Copy,
  CreditCard,
  Info,
  Mail,
  QrCode,
  ShieldCheck,
  User as UserIcon,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import { Tooltip } from '../components/ui/Tooltip';
import { Skeleton } from '../components/ui/Skeleton';
import { EmptyState } from '../components/ui/EmptyState';
import { Dialog, ConfirmDialog } from '../components/ui/Dialog';
import { Dropdown } from '../components/ui/Dropdown';
import { useToast } from '../components/ui/Toast';
import { ProfileCard } from '../components/ProfileCard';
import { PaymentAppItem } from '../components/PaymentAppItem';
import { QrCodePanel } from '../components/QrCodePanel';

const COLOR_TOKENS = [
  { name: 'Main Canvas', token: '--bg-canvas', hex: '#080C14', role: 'Primary viewport surface' },
  { name: 'Secondary Canvas', token: '--bg-secondary', hex: '#0D1422', role: 'Cards, rails, panels' },
  { name: 'Elevated Surface', token: '--bg-elevated', hex: '#121E2E', role: 'Nested rows, popovers' },
  { name: 'Primary Accent', token: '--accent-primary', hex: '#25C9F2', role: 'Primary actions & handles' },
  { name: 'Secondary Accent', token: '--accent-secondary', hex: '#477BFF', role: 'Technical highlights' },
  { name: 'Violet Accent', token: '--accent-violet', hex: '#8971F7', role: 'UPI destination accent' },
  { name: 'Primary Text', token: '--text-primary', hex: '#F5F8FC', role: 'Headings & key values' },
  { name: 'Secondary Text', token: '--text-secondary', hex: '#91A2B8', role: 'Descriptions & labels' },
  { name: 'Success', token: '--status-success', hex: '#28C987', role: 'Public & confirmed states' },
  { name: 'Error', token: '--status-error', hex: '#F06473', role: 'Validation & danger states' },
];

const SAMPLE_CONNECTIONS = [
  {
    id: 'ds-1',
    application_type: 'gpay' as const,
    application_label: 'Google Pay',
    upi_id: 'aarav.sharma@okaxis',
    display_order: 1,
  },
  {
    id: 'ds-2',
    application_type: 'phonepe' as const,
    application_label: 'PhonePe',
    upi_id: 'aarav@ybl',
    display_order: 2,
  },
];

export const DesignSystemPage: React.FC = () => {
  const toast = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [switchDemo, setSwitchDemo] = useState(true);
  const [selectVal, setSelectVal] = useState('gpay');

  return (
    <div className="min-h-screen bg-transparent text-[#F5F8FC]">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-14 space-y-16">
        {/* Header */}
        <section className="space-y-3 pb-8 border-b border-[rgba(145,162,184,0.14)]">
          <p className="font-mono text-[11px] uppercase tracking-wider text-[#25C9F2]">
            TRINETRA UI Architecture
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F8FC]">
            Design System & Component Primitives
          </h1>
          <p className="text-sm sm:text-base text-[#91A2B8] max-w-2xl leading-relaxed">
            Tokens, typography hierarchy, composable form controls, and domain primitives powering TRINETRA across marketing, public profile, and authenticated dashboard routes.
          </p>
        </section>

        {/* Color Palette */}
        <section className="space-y-6">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#F5F8FC]">Color Tokens</h2>
            <p className="text-xs text-[#91A2B8] mt-1">
              Restrained dark fintech surfaces paired with accessible cyan, cobalt, emerald, and coral accents.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {COLOR_TOKENS.map((item) => (
              <div
                key={item.token}
                className="rounded-xl border border-[rgba(145,162,184,0.16)] bg-[#0D1422] overflow-hidden"
              >
                <div
                  className="h-16 border-b border-[rgba(145,162,184,0.12)]"
                  style={{ backgroundColor: item.hex }}
                />
                <div className="p-3.5 space-y-1">
                  <p className="text-xs font-semibold text-[#F5F8FC]">{item.name}</p>
                  <p className="font-mono text-[11px] text-[#25C9F2]">{item.hex}</p>
                  <p className="text-[11px] text-[#64748B]">{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section className="space-y-6">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#F5F8FC]">Typography Scale</h2>
            <p className="text-xs text-[#91A2B8] mt-1">
              Space Grotesk for editorial display, Inter for interface copy, IBM Plex Mono for VPA handles and technical labels.
            </p>
          </div>
          <Card>
            <CardContent className="divide-y divide-[rgba(145,162,184,0.12)] space-y-5">
              <div className="pb-5">
                <span className="font-mono text-[11px] text-[#64748B]">Display / Space Grotesk · 48px Bold</span>
                <p className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#F5F8FC] mt-1">
                  One Identity. Every Payment Connection.
                </p>
              </div>
              <div className="py-5">
                <span className="font-mono text-[11px] text-[#64748B]">Heading / Space Grotesk · 24px Semibold</span>
                <p className="font-display text-2xl font-semibold tracking-tight text-[#F5F8FC] mt-1">
                  Personal UPI identity without fund custody
                </p>
              </div>
              <div className="py-5">
                <span className="font-mono text-[11px] text-[#64748B]">Body / Inter · 14px–16px Regular</span>
                <p className="text-sm sm:text-base text-[#91A2B8] mt-1 max-w-2xl leading-relaxed">
                  Visitors open your clean public link, inspect available UPI destinations, scan a local QR code, or launch their installed payment app with your VPA pre-filled.
                </p>
              </div>
              <div className="pt-5">
                <span className="font-mono text-[11px] text-[#64748B]">Technical & Numeric / IBM Plex Mono · Tabular</span>
                <p className="font-mono text-sm text-[#25C9F2] tabular-nums mt-1">
                  upi://pay?pa=aarav.sharma@okaxis&amp;pn=Aarav+Sharma&amp;cu=INR&amp;am=500.00
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Buttons & Status */}
        <section className="space-y-6">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#F5F8FC]">Buttons & Indicators</h2>
            <p className="text-xs text-[#91A2B8] mt-1">
              Consistent geometry, crisp focus rings, loading spinners, and paired icon + text indicators.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Button Variants & States</CardTitle>
                <CardDescription>4px–8px border radius discipline with accessible contrast.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Primary
                  </Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                </div>
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-[rgba(145,162,184,0.12)]">
                  <Button size="sm">Small (32px)</Button>
                  <Button size="md">Medium (40px)</Button>
                  <Button size="lg">Large (44px)</Button>
                  <Button loading>Loading</Button>
                  <Button disabled>Disabled</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Status Indicators & Overlays</CardTitle>
                <CardDescription>Live feedback triggers for Dialog, ConfirmDialog, Dropdown, and Toast.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex flex-wrap items-center gap-5">
                  <StatusIndicator tone="success" label="Public" />
                  <StatusIndicator tone="info" label="UPI Intent" icon={<ShieldCheck className="w-3.5 h-3.5" />} />
                  <StatusIndicator tone="warning" label="Pending" />
                  <StatusIndicator tone="danger" label="Invalid VPA" />
                  <StatusIndicator tone="neutral" label="Unpublished" />
                </div>

                <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-[rgba(145,162,184,0.12)]">
                  <Button size="sm" variant="secondary" onClick={() => setDialogOpen(true)}>
                    Open Dialog
                  </Button>
                  <Button size="sm" variant="danger" onClick={() => setConfirmOpen(true)}>
                    Open ConfirmDialog
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => toast.success('Copied VPA', 'aarav.sharma@okaxis')}
                    leftIcon={<Bell className="w-3.5 h-3.5" />}
                  >
                    Trigger Toast
                  </Button>
                  <Dropdown
                    trigger={
                      <Button size="sm" variant="outline">
                        Dropdown Menu
                      </Button>
                    }
                    items={[
                      { label: 'Edit profile', icon: <UserIcon className="w-3.5 h-3.5" />, onClick: () => toast.info('Selected', 'Edit profile') },
                      { label: 'Copy public URL', icon: <Copy className="w-3.5 h-3.5" />, onClick: () => toast.success('Copied', '/u/aarav') },
                    ]}
                  />
                  <Tooltip content="Standard NPCI UPI deep link">
                    <span className="inline-flex items-center gap-1 text-xs text-[#91A2B8] cursor-help px-2">
                      <Info className="w-3.5 h-3.5 text-[#25C9F2]" />
                      Hover tooltip
                    </span>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Form Controls */}
        <section className="space-y-6">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#F5F8FC]">Form Controls</h2>
            <p className="text-xs text-[#91A2B8] mt-1">
              Default, hint, validation error, and disabled input states.
            </p>
          </div>
          <Card>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <Input
                label="Email Address"
                placeholder="name@domain.com"
                leftIcon={<Mail className="w-4 h-4" />}
                hint="Used strictly for account access and recovery."
              />
              <Input
                label="UPI ID (Error Example)"
                defaultValue="invalid-vpa"
                error="Enter a valid UPI ID format such as name@okaxis."
              />
              <Select
                label="Supported UPI Application"
                value={selectVal}
                onChange={(e) => setSelectVal(e.target.value)}
                options={[
                  { value: 'gpay', label: 'Google Pay' },
                  { value: 'phonepe', label: 'PhonePe' },
                  { value: 'paytm', label: 'Paytm' },
                  { value: 'bhim', label: 'BHIM' },
                ]}
              />
              <Input
                label="Disabled Handle"
                value="@aarav"
                disabled
                hint="Read-only preview example"
              />
              <div className="md:col-span-2">
                <Textarea
                  label="Payment Bio"
                  rows={2}
                  defaultValue="Product designer & frontend engineer. Select any UPI app below or scan the QR code."
                />
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Domain Components */}
        <section className="space-y-6">
          <div>
            <h2 className="font-display text-xl font-semibold text-[#F5F8FC]">Domain Primitives</h2>
            <p className="text-xs text-[#91A2B8] mt-1">
              ProfileCard, PaymentAppItem (visitor & management modes), local QR generator, Skeleton, and EmptyState.
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-5">
              <ProfileCard
                fullName="Aarav Sharma"
                username="aarav"
                bio="Product designer & frontend engineer. Tap any connected app to pay via UPI."
                visibility="public"
                connections={SAMPLE_CONNECTIONS}
              />
            </div>

            <div className="lg:col-span-7 space-y-5">
              <Card>
                <CardHeader>
                  <CardTitle>Management Item & QR Generator</CardTitle>
                  <CardDescription>Interactive switch state and vector QR export.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <PaymentAppItem
                    id="manage-demo"
                    applicationType="gpay"
                    label="Google Pay"
                    upiId="aarav.sharma@okaxis"
                    isEnabled={switchDemo}
                    mode="manage"
                    onToggle={() => setSwitchDemo((prev) => !prev)}
                    onEdit={() => toast.info('Edit triggered', 'Google Pay')}
                    onDelete={() => setConfirmOpen(true)}
                  />
                  <QrCodePanel
                    profileUrl="https://trinetra.me/u/aarav"
                    recipientName="Aarav Sharma"
                    connections={SAMPLE_CONNECTIONS}
                    amount="500"
                  />
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card>
                  <CardContent className="space-y-3">
                    <p className="font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
                      Skeleton Loading
                    </p>
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>

                <EmptyState
                  icon={<CreditCard className="w-5 h-5" />}
                  title="Empty State Pattern"
                  description="Clear next action when no UPI destinations exist yet."
                  className="py-6"
                />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Sample Dialog"
        description="Structured modal header, scrollable body, and escape/backdrop dismissal."
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-[#91A2B8] leading-relaxed">
            Dialogs use crisp 1px borders on #0D1422 surfaces with consistent spacing and keyboard escape support.
          </p>
          <div className="flex justify-end">
            <Button onClick={() => setDialogOpen(false)}>Close</Button>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          toast.info('Confirmed', 'Sample destructive confirmation completed.');
        }}
        title="Confirm destructive action?"
        description="This demonstrates the standard ConfirmDialog used instead of browser alert/confirm."
        confirmLabel="Confirm action"
      />
    </div>
  );
};
