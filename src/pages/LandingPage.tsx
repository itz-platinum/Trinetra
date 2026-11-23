import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  Lock,
  Check,
  Copy,
  ChevronDown,
  QrCode,
  SlidersHorizontal,
  Globe,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/Button';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import { Avatar } from '../components/Avatar';
import { PaymentAppIcon } from '../components/PaymentAppIcon';
import { PaymentAppItem } from '../components/PaymentAppItem';
import { buildUpiUri, cn } from '../lib/utils';

const DEMO_CONNECTIONS = [
  {
    id: 'demo-gpay',
    application_type: 'gpay' as const,
    application_label: 'Google Pay',
    upi_id: 'aarav.sharma@okaxis',
  },
  {
    id: 'demo-phonepe',
    application_type: 'phonepe' as const,
    application_label: 'PhonePe',
    upi_id: 'aarav@ybl',
  },
  {
    id: 'demo-paytm',
    application_type: 'paytm' as const,
    application_label: 'Paytm',
    upi_id: 'aarav.design@paytm',
  },
];

const FAQS = [
  {
    q: 'What is TRINETRA?',
    a: 'TRINETRA is a personal UPI identity and payment-profile platform. It consolidates your active UPI VPAs—such as Google Pay, PhonePe, Paytm, and BHIM—into one structured public page and QR code.',
  },
  {
    q: 'Does TRINETRA process, hold, or verify payments?',
    a: 'No. TRINETRA generates standard UPI payment intent links (upi://pay) and QR codes using your public VPA handle. The payment itself is authorized and settled strictly inside your payer’s banking or UPI application.',
  },
  {
    q: 'Do visitors need an account to pay me?',
    a: 'No. Anyone opening your trinetra.me/u/username link can view your enabled payment destinations, copy a UPI ID, scan a QR code, or launch their preferred UPI app directly.',
  },
  {
    q: 'Can I control visibility and custom amounts?',
    a: 'Yes. From your dashboard you can switch your profile between Public and Unpublished at any time, enable or disable individual UPI apps, and toggle optional visitor amount entry.',
  },
  {
    q: 'Are bank credentials or UPI PINs ever stored?',
    a: 'Never. Only the public Virtual Payment Address (VPA) handle you enter is saved. Account sign-in credentials use bcrypt hashing and HTTP-only session cookies.',
  },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedDemoId, setSelectedDemoId] = useState(DEMO_CONNECTIONS[0].id);
  const [demoAmount, setDemoAmount] = useState('500');
  const [copiedUri, setCopiedUri] = useState(false);
  const [showcaseTab, setShowcaseTab] = useState<'connections' | 'profile'>('connections');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const activeDemo =
    DEMO_CONNECTIONS.find((c) => c.id === selectedDemoId) || DEMO_CONNECTIONS[0];

  const liveIntentUri = buildUpiUri({
    vpa: activeDemo.upi_id,
    recipientName: 'Aarav Sharma',
    amount: demoAmount,
    appType: activeDemo.application_type,
  });

  const handleCopyUri = () => {
    navigator.clipboard.writeText(liveIntentUri);
    setCopiedUri(true);
    setTimeout(() => setCopiedUri(false), 1800);
  };

  return (
    <div className="min-h-screen bg-transparent text-[#F5F8FC] selection:bg-[#25C9F2]/25 selection:text-[#25C9F2]">
      <Navbar />

      {/* 1. Hero Section: 2-Column Split on Precision Grid */}
      <section className="relative bg-precision-grid border-b border-[rgba(145,162,184,0.12)]">
        <div className="max-w-6xl mx-auto px-6 py-20 lg:py-28 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Editorial Positioning */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="lg:col-span-6 space-y-6"
          >
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] uppercase tracking-wider text-[#25C9F2]">
                Personal UPI Identity
              </span>
              <span className="h-px w-8 bg-[rgba(145,162,184,0.25)]" />
              <span className="font-mono text-[11px] text-[#91A2B8]">
                upi://pay standard
              </span>
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-[3.25rem] font-bold tracking-tight leading-[1.08] text-[#F5F8FC]">
              One identity for every UPI connection.
            </h1>

            <p className="text-base sm:text-lg text-[#91A2B8] leading-relaxed max-w-xl">
              Consolidate your Google Pay, PhonePe, Paytm, and BHIM handles into one crisp, shareable profile with instant QR codes and direct UPI intent links.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <Button
                size="lg"
                onClick={() => navigate('/register')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Create your profile
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => navigate('/u/aarav')}
                rightIcon={<ExternalLink className="w-4 h-4 text-[#91A2B8]" />}
              >
                View demo profile
              </Button>
            </div>

            <div className="pt-4 border-t border-[rgba(145,162,184,0.12)] grid grid-cols-3 gap-4 text-xs text-[#91A2B8]">
              <div>
                <p className="font-mono text-[#F5F8FC] font-medium">Non-custodial</p>
                <p className="text-[11px] text-[#64748B] mt-0.5">Never holds funds</p>
              </div>
              <div>
                <p className="font-mono text-[#F5F8FC] font-medium">Native QR + URI</p>
                <p className="text-[11px] text-[#64748B] mt-0.5">Direct app handoff</p>
              </div>
              <div>
                <p className="font-mono text-[#F5F8FC] font-medium">Full visibility</p>
                <p className="text-[11px] text-[#64748B] mt-0.5">Publish on demand</p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Interactive Live Profile & UPI Intent Inspector */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.08, ease: 'easeOut' }}
            className="lg:col-span-6"
          >
            <div className="rounded-xl border border-[rgba(145,162,184,0.18)] bg-[#0D1422]/85 backdrop-blur-md shadow-2xl overflow-hidden">
              {/* Simulated Browser Chrome */}
              <div className="h-10 px-4 bg-[#080C14] border-b border-[rgba(145,162,184,0.12)] flex items-center justify-between gap-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1E293B]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1E293B]" />
                  <span className="w-2.5 h-2.5 rounded-full bg-[#1E293B]" />
                </div>
                <span className="font-mono text-[11px] text-[#91A2B8] truncate">
                  trinetra.me/u/aarav
                </span>
                <StatusIndicator tone="success" label="Public" />
              </div>

              <div className="p-5 sm:p-6 space-y-5">
                {/* Identity Header */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <Avatar name="Aarav Sharma" size="md" />
                    <div className="min-w-0">
                      <p className="font-display text-base font-semibold text-[#F5F8FC] truncate">
                        Aarav Sharma
                      </p>
                      <p className="font-mono text-xs text-[#25C9F2] truncate">@aarav</p>
                    </div>
                  </div>

                  {/* Interactive Amount Pill Input */}
                  <div className="flex items-center gap-1.5 rounded-lg bg-[#080C14] border border-[rgba(145,162,184,0.2)] px-2.5 h-8">
                    <span className="text-xs font-mono text-[#91A2B8]">₹</span>
                    <input
                      type="number"
                      min="1"
                      max="100000"
                      aria-label="Preview payment amount"
                      value={demoAmount}
                      onChange={(e) => setDemoAmount(e.target.value)}
                      className="w-16 bg-transparent text-xs font-mono tabular-nums text-[#F5F8FC] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Clickable Payment Destination Switcher */}
                <div className="space-y-2">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
                    Select a destination to inspect URI
                  </p>
                  <div className="space-y-2">
                    {DEMO_CONNECTIONS.map((conn) => {
                      const isSelected = conn.id === activeDemo.id;
                      return (
                        <button
                          key={conn.id}
                          type="button"
                          onClick={() => setSelectedDemoId(conn.id)}
                          className={cn(
                            'w-full flex items-center justify-between gap-3 p-3 rounded-lg border text-left transition-colors cursor-pointer',
                            isSelected
                              ? 'bg-[#121E2E] border-[#25C9F2]/50'
                              : 'bg-[#080C14]/70 border-[rgba(145,162,184,0.12)] hover:border-[rgba(145,162,184,0.25)]'
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <PaymentAppIcon type={conn.application_type} size="sm" />
                            <div className="min-w-0">
                              <p className="text-xs font-semibold text-[#F5F8FC] truncate">
                                {conn.application_label}
                              </p>
                              <p className="text-[11px] font-mono text-[#91A2B8] truncate">
                                {conn.upi_id}
                              </p>
                            </div>
                          </div>
                          <span
                            className={cn(
                              'text-[11px] font-mono shrink-0',
                              isSelected ? 'text-[#25C9F2]' : 'text-[#64748B]'
                            )}
                          >
                            {isSelected ? 'Selected' : 'Inspect'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Generated UPI Protocol Output */}
                <div className="rounded-lg bg-[#080C14] border border-[rgba(145,162,184,0.14)] p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
                      Generated Intent URI
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyUri}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[#25C9F2] hover:underline cursor-pointer"
                    >
                      {copiedUri ? (
                        <>
                          <Check className="w-3 h-3 text-[#28C987]" />
                          <span className="text-[#28C987]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy URI</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="font-mono text-[11px] text-[#91A2B8] break-all leading-relaxed">
                    {liveIntentUri}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. How It Works: 3-Step Editorial Sequence */}
      <section id="how-it-works" className="py-20 lg:py-24 px-6 border-b border-[rgba(145,162,184,0.12)]">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl space-y-2.5 mb-14">
            <p className="font-mono text-[11px] uppercase tracking-wider text-[#25C9F2]">
              Workflow
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-[#F5F8FC]">
              Three steps from scattered VPAs to one permanent link.
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 border-t border-[rgba(145,162,184,0.14)]">
            <div className="pt-8 pb-6 md:pr-8 md:border-r border-[rgba(145,162,184,0.14)] space-y-3">
              <span className="font-mono text-xs text-[#25C9F2]">01 / Identity</span>
              <h3 className="font-display text-lg font-semibold text-[#F5F8FC]">
                Claim your username
              </h3>
              <p className="text-sm text-[#91A2B8] leading-relaxed">
                Create your account with email or Google Sign-In and reserve a clean handle at{' '}
                <span className="font-mono text-[#F5F8FC]">/u/yourname</span> with avatar and bio.
              </p>
            </div>

            <div className="pt-8 pb-6 md:px-8 border-t md:border-t-0 md:border-r border-[rgba(145,162,184,0.14)] space-y-3">
              <span className="font-mono text-xs text-[#477BFF]">02 / Destinations</span>
              <h3 className="font-display text-lg font-semibold text-[#F5F8FC]">
                Configure UPI apps
              </h3>
              <p className="text-sm text-[#91A2B8] leading-relaxed">
                Add VPA handles for Google Pay, PhonePe, Paytm, BHIM, or Amazon Pay. Enable or pause any connection without changing your public link.
              </p>
            </div>

            <div className="pt-8 pb-6 md:pl-8 border-t md:border-t-0 border-[rgba(145,162,184,0.14)] space-y-3">
              <span className="font-mono text-xs text-[#28C987]">03 / Share & Scan</span>
              <h3 className="font-display text-lg font-semibold text-[#F5F8FC]">
                Receive via link or QR
              </h3>
              <p className="text-sm text-[#91A2B8] leading-relaxed">
                Payers open your link on mobile to launch their UPI app directly, or scan your generated UPI QR code from any desktop screen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Product Showcase: Interactive Dashboard Preview */}
      <section id="showcase" className="py-20 lg:py-24 px-6 bg-[#0D1422]/40 border-b border-[rgba(145,162,184,0.12)]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          <div className="lg:col-span-5 space-y-5">
            <p className="font-mono text-[11px] uppercase tracking-wider text-[#25C9F2]">
              Product Architecture
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-[#F5F8FC]">
              Built for clarity on both sides of the payment.
            </h2>
            <p className="text-sm text-[#91A2B8] leading-relaxed">
              Manage your payment destinations, toggle custom visitor amounts, and preview your public identity in real time before sharing.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <QrCode className="w-4 h-4 text-[#25C9F2] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[#F5F8FC]">Dual-mode QR generation</p>
                  <p className="text-xs text-[#91A2B8] mt-0.5">
                    Switch between a direct UPI Scan & Pay QR and your TRINETRA profile link QR.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <SlidersHorizontal className="w-4 h-4 text-[#477BFF] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[#F5F8FC]">Granular visibility controls</p>
                  <p className="text-xs text-[#91A2B8] mt-0.5">
                    Pause individual UPI apps or unpublish your entire profile in one click.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="w-4 h-4 text-[#28C987] mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-[#F5F8FC]">Zero-friction visitor flow</p>
                  <p className="text-xs text-[#91A2B8] mt-0.5">
                    Clean mobile-first payment chooser with instant VPA copy fallback.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Tabbed Dashboard Preview */}
          <div className="lg:col-span-7 rounded-xl border border-[rgba(145,162,184,0.18)] bg-[#0D1422]/85 backdrop-blur-md overflow-hidden shadow-xl">
            <div className="px-5 py-3.5 bg-[#080C14] border-b border-[rgba(145,162,184,0.12)] flex flex-wrap items-center justify-between gap-3">
              <span className="font-mono text-xs text-[#91A2B8]">
                Workspace Preview
              </span>
              <div className="inline-flex p-0.5 rounded-lg bg-[#0D1422] border border-[rgba(145,162,184,0.16)]">
                <button
                  type="button"
                  onClick={() => setShowcaseTab('connections')}
                  className={cn(
                    'px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer',
                    showcaseTab === 'connections'
                      ? 'bg-[#121E2E] text-[#F5F8FC]'
                      : 'text-[#91A2B8] hover:text-[#F5F8FC]'
                  )}
                >
                  Payment Connections
                </button>
                <button
                  type="button"
                  onClick={() => setShowcaseTab('profile')}
                  className={cn(
                    'px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer',
                    showcaseTab === 'profile'
                      ? 'bg-[#121E2E] text-[#F5F8FC]'
                      : 'text-[#91A2B8] hover:text-[#F5F8FC]'
                  )}
                >
                  Identity Metadata
                </button>
              </div>
            </div>

            {showcaseTab === 'connections' ? (
              <div className="p-5 sm:p-6 space-y-3">
                <div className="flex items-center justify-between pb-2">
                  <div>
                    <p className="text-sm font-semibold text-[#F5F8FC]">Active UPI Handles</p>
                    <p className="text-xs text-[#91A2B8]">
                      Shown to visitors on your public profile
                    </p>
                  </div>
                  <StatusIndicator tone="success" label="3 active" />
                </div>
                {DEMO_CONNECTIONS.map((conn) => (
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
            ) : (
              <div className="p-5 sm:p-6 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="rounded-lg bg-[#080C14] border border-[rgba(145,162,184,0.14)] p-3.5">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
                      Display Name
                    </p>
                    <p className="text-sm font-medium text-[#F5F8FC] mt-1">Aarav Sharma</p>
                  </div>
                  <div className="rounded-lg bg-[#080C14] border border-[rgba(145,162,184,0.14)] p-3.5">
                    <p className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
                      Public Handle
                    </p>
                    <p className="text-sm font-mono text-[#25C9F2] mt-1">@aarav</p>
                  </div>
                </div>
                <div className="rounded-lg bg-[#080C14] border border-[rgba(145,162,184,0.14)] p-3.5">
                  <p className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
                    Payment Note / Bio
                  </p>
                  <p className="text-sm text-[#91A2B8] mt-1 leading-relaxed">
                    Independent product designer & frontend engineer. Select any UPI app below or scan the QR to settle invoices.
                  </p>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-[#121E2E] border border-[rgba(145,162,184,0.16)] px-4 py-3 text-xs">
                  <span className="text-[#91A2B8]">Optional visitor amount entry</span>
                  <StatusIndicator tone="info" label="Enabled" />
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Security & Trust */}
      <section id="security" className="py-20 lg:py-24 px-6 border-b border-[rgba(145,162,184,0.12)]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6 space-y-5">
            <StatusIndicator
              tone="success"
              label="Non-custodial architecture"
              icon={<ShieldCheck className="w-3.5 h-3.5" />}
            />
            <h2 className="font-display text-3xl font-bold tracking-tight text-[#F5F8FC]">
              Zero fund custody. Direct device authorization.
            </h2>
            <p className="text-sm sm:text-base text-[#91A2B8] leading-relaxed">
              TRINETRA does not hold balances, clear transactions, or request banking passwords. Every payment button constructs a standard UPI intent link and hands control directly to the payer’s installed banking application.
            </p>
            <ul className="space-y-3 text-sm text-[#F5F8FC] pt-2">
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#28C987] mt-0.5 shrink-0" />
                <span className="text-[#91A2B8]">
                  <strong className="text-[#F5F8FC] font-medium">Public VPAs only:</strong> Only the handle you publish is visible—never your email or bank account number.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#28C987] mt-0.5 shrink-0" />
                <span className="text-[#91A2B8]">
                  <strong className="text-[#F5F8FC] font-medium">Hardened account sessions:</strong> Passwords hashed with bcrypt and authenticated via HTTP-only cookies.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check className="w-4 h-4 text-[#28C987] mt-0.5 shrink-0" />
                <span className="text-[#91A2B8]">
                  <strong className="text-[#F5F8FC] font-medium">Honest status handoff:</strong> Visitors authorize and confirm payments strictly inside their chosen UPI app.
                </span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6 rounded-xl border border-[rgba(145,162,184,0.18)] bg-[#0D1422]/85 backdrop-blur-md p-6 space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-[rgba(145,162,184,0.12)]">
              <div className="w-10 h-10 rounded-lg bg-[#121E2E] border border-[rgba(145,162,184,0.18)] flex items-center justify-center text-[#25C9F2]">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-display text-sm font-semibold text-[#F5F8FC]">
                  Standard UPI Deep-Link Contract
                </h3>
                <p className="text-xs text-[#91A2B8]">NPCI-compatible URI parameter mapping</p>
              </div>
            </div>

            <div className="rounded-lg bg-[#080C14] border border-[rgba(145,162,184,0.14)] p-4 font-mono text-xs space-y-2">
              <div className="flex justify-between text-[#91A2B8]">
                <span className="text-[#64748B]">pa (Payee VPA)</span>
                <span className="text-[#F5F8FC]">aarav.sharma@okaxis</span>
              </div>
              <div className="flex justify-between text-[#91A2B8]">
                <span className="text-[#64748B]">pn (Payee Name)</span>
                <span className="text-[#F5F8FC]">Aarav Sharma</span>
              </div>
              <div className="flex justify-between text-[#91A2B8]">
                <span className="text-[#64748B]">cu (Currency)</span>
                <span className="text-[#28C987]">INR</span>
              </div>
              <div className="flex justify-between text-[#91A2B8]">
                <span className="text-[#64748B]">am (Optional)</span>
                <span className="text-[#25C9F2] tabular-nums">500.00</span>
              </div>
            </div>

            <p className="text-xs text-[#64748B] leading-relaxed">
              TRINETRA constructs the link client-side and transfers execution to the operating system’s registered UPI handler.
            </p>
          </div>
        </div>
      </section>

      {/* 5. FAQ Accordion */}
      <section id="faq" className="py-20 lg:py-24 px-6 border-b border-[rgba(145,162,184,0.12)]">
        <div className="max-w-3xl mx-auto">
          <div className="space-y-2 mb-10">
            <p className="font-mono text-[11px] uppercase tracking-wider text-[#25C9F2]">
              FAQ
            </p>
            <h2 className="font-display text-3xl font-bold tracking-tight text-[#F5F8FC]">
              Common questions
            </h2>
          </div>

          <div className="divide-y divide-[rgba(145,162,184,0.14)] border-y border-[rgba(145,162,184,0.14)]">
            {FAQS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx}>
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full py-5 flex items-center justify-between gap-4 text-left cursor-pointer group"
                  >
                    <span className="text-sm sm:text-base font-medium text-[#F5F8FC] group-hover:text-[#25C9F2] transition-colors">
                      {item.q}
                    </span>
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 text-[#91A2B8] shrink-0 transition-transform duration-150',
                        isOpen && 'rotate-180 text-[#25C9F2]'
                      )}
                    />
                  </button>
                  {isOpen && (
                    <p className="pb-5 text-sm text-[#91A2B8] leading-relaxed pr-8 animate-fade-in">
                      {item.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. Final CTA Band */}
      <section className="py-20 px-6 bg-[#0D1422]/50">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-[#F5F8FC]">
              Set up your TRINETRA identity in under a minute.
            </h2>
            <p className="text-sm text-[#91A2B8]">
              Claim your handle, connect your UPI handles, and share your link or QR code.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Button
              size="lg"
              onClick={() => navigate('/register')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create profile
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
