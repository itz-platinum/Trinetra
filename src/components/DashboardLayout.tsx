import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  User as UserIcon,
  CreditCard,
  Settings,
  Shield,
  LogOut,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  Globe,
  EyeOff,
  Menu,
  X,
  Palette,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TrinetraLogo } from './TrinetraLogo';
import { Avatar } from './Avatar';
import { Dropdown } from './ui/Dropdown';
import { StatusIndicator } from './ui/StatusIndicator';
import { useToast } from './ui/Toast';
import { cn } from '../lib/utils';

const NAV_ITEMS = [
  { label: 'Overview', shortLabel: 'Overview', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Profile', shortLabel: 'Profile', path: '/dashboard/profile', icon: UserIcon },
  { label: 'Payment Connections', shortLabel: 'UPI Apps', path: '/dashboard/payment-methods', icon: CreditCard },
  { label: 'Settings', shortLabel: 'Settings', path: '/dashboard/settings', icon: Settings },
  { label: 'Security', shortLabel: 'Security', path: '/dashboard/security', icon: Shield },
];

export const DashboardLayout: React.FC<{
  children: React.ReactNode;
  pageTitle?: string;
}> = ({ children, pageTitle }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    toast.info('Signed out', 'Your session has been closed.');
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  const publicUrl = `${window.location.origin}/u/${user.username}`;
  const activeNav = NAV_ITEMS.find((item) => item.path === location.pathname);
  const breadcrumbLabel = pageTitle || activeNav?.label || 'Dashboard';

  const copyPublicUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopiedUrl(true);
    toast.success('Public link copied', `/u/${user.username}`);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="min-h-screen bg-transparent text-[#F5F8FC] flex">
      {/* Desktop Fixed Sidebar Rail */}
      <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-[#0D1422]/82 backdrop-blur-md border-r border-[rgba(145,162,184,0.14)] sticky top-0 h-screen">
        <div className="h-16 px-5 flex items-center justify-between border-b border-[rgba(145,162,184,0.12)]">
          <Link to="/" className="focus-visible:outline-none">
            <TrinetraLogo size={26} withWordmark />
          </Link>
        </div>

        <div className="p-3 flex-1 overflow-y-auto space-y-6">
          <div>
            <p className="px-3 mb-2 font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
              Workspace
            </p>
            <nav aria-label="Dashboard navigation" className="space-y-0.5">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-[#121E2E] text-[#F5F8FC] border border-[rgba(145,162,184,0.18)]'
                        : 'text-[#91A2B8] hover:text-[#F5F8FC] hover:bg-[#121E2E]/50 border border-transparent'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0',
                        isActive ? 'text-[#25C9F2]' : 'text-[#64748B]'
                      )}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div>
            <p className="px-3 mb-2 font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
              Public Identity
            </p>
            <div className="rounded-lg bg-[#080C14] border border-[rgba(145,162,184,0.14)] p-3 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <StatusIndicator
                  tone={user.profile_visibility === 'public' ? 'success' : 'neutral'}
                  label={user.profile_visibility === 'public' ? 'Public' : 'Unpublished'}
                  icon={
                    user.profile_visibility === 'public' ? (
                      <Globe className="w-3.5 h-3.5" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5" />
                    )
                  }
                />
                <Link
                  to={`/u/${user.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-medium text-[#25C9F2] hover:underline inline-flex items-center gap-1"
                >
                  <span>Open</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
              <p className="text-[11px] font-mono text-[#91A2B8] truncate">
                /u/{user.username}
              </p>
              <button
                type="button"
                onClick={copyPublicUrl}
                className="w-full h-8 inline-flex items-center justify-center gap-1.5 rounded-md bg-[#121E2E] hover:bg-[#172538] border border-[rgba(145,162,184,0.18)] text-xs font-medium text-[#F5F8FC] transition-colors cursor-pointer"
              >
                {copiedUrl ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#28C987]" />
                    <span>Copied link</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[#91A2B8]" />
                    <span>Copy profile URL</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-[rgba(145,162,184,0.12)] space-y-1">
          <Link
            to="/design-system"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-[#91A2B8] hover:text-[#F5F8FC] hover:bg-[#121E2E]/50 transition-colors"
          >
            <Palette className="w-3.5 h-3.5 text-[#64748B]" />
            <span>Design System</span>
          </Link>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-[#F06473] hover:bg-[#F06473]/10 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Shell */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Compact Top Navigation Bar */}
        <header className="sticky top-0 z-30 h-16 bg-[#080C14]/75 backdrop-blur-md border-b border-[rgba(145,162,184,0.14)] px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-lg bg-[#0D1422] border border-[rgba(145,162,184,0.18)] text-[#F5F8FC] cursor-pointer"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="text-[#64748B] hidden sm:inline">TRINETRA</span>
              <span className="text-[#64748B] hidden sm:inline">/</span>
              <h1 className="font-display font-semibold text-[#F5F8FC] truncate">
                {breadcrumbLabel}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to={`/u/${user.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 h-8 px-3 rounded-md bg-[#0D1422] hover:bg-[#121E2E] border border-[rgba(145,162,184,0.18)] text-xs font-medium text-[#F5F8FC] transition-colors"
            >
              <span>View public profile</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#91A2B8]" />
            </Link>

            <Dropdown
              trigger={
                <button
                  type="button"
                  className="flex items-center gap-2.5 h-9 pl-1.5 pr-2.5 rounded-lg bg-[#0D1422] hover:bg-[#121E2E] border border-[rgba(145,162,184,0.18)] transition-colors cursor-pointer"
                >
                  <Avatar src={user.avatar_url} name={user.full_name} size="sm" className="w-6 h-6 text-[10px]" />
                  <span className="text-xs font-medium text-[#F5F8FC] hidden sm:inline max-w-[120px] truncate">
                    @{user.username}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#91A2B8]" />
                </button>
              }
              items={[
                {
                  label: 'My Profile',
                  icon: <UserIcon className="w-3.5 h-3.5" />,
                  onClick: () => navigate('/dashboard/profile'),
                },
                {
                  label: 'Payment Connections',
                  icon: <CreditCard className="w-3.5 h-3.5" />,
                  onClick: () => navigate('/dashboard/payment-methods'),
                },
                {
                  label: 'Account Settings',
                  icon: <Settings className="w-3.5 h-3.5" />,
                  onClick: () => navigate('/dashboard/settings'),
                },
                {
                  label: 'Security',
                  icon: <Shield className="w-3.5 h-3.5" />,
                  onClick: () => navigate('/dashboard/security'),
                },
                {
                  label: 'Sign out',
                  icon: <LogOut className="w-3.5 h-3.5" />,
                  onClick: handleLogout,
                  danger: true,
                  dividerBefore: true,
                },
              ]}
            />
          </div>
        </header>

        {/* Mobile Drawer Overlay */}
        {drawerOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-[#04070C]/80 backdrop-blur-sm"
              onClick={() => setDrawerOpen(false)}
            />
            <div className="relative w-72 max-w-[82vw] bg-[#0D1422] border-r border-[rgba(145,162,184,0.18)] flex flex-col h-full z-10 animate-fade-in">
              <div className="h-16 px-5 flex items-center justify-between border-b border-[rgba(145,162,184,0.12)]">
                <TrinetraLogo size={24} withWordmark />
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close menu"
                  className="p-1.5 text-[#91A2B8] hover:text-[#F5F8FC] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-4 flex-1 space-y-4 overflow-y-auto">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-[#080C14] border border-[rgba(145,162,184,0.14)]">
                  <Avatar src={user.avatar_url} name={user.full_name} size="md" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[#F5F8FC] truncate">{user.full_name}</p>
                    <p className="text-xs font-mono text-[#91A2B8] truncate">@{user.username}</p>
                  </div>
                </div>
                <nav className="space-y-1">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        onClick={() => setDrawerOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium',
                          isActive
                            ? 'bg-[#121E2E] text-[#F5F8FC] border border-[rgba(145,162,184,0.18)]'
                            : 'text-[#91A2B8]'
                        )}
                      >
                        <Icon className={cn('w-4 h-4', isActive ? 'text-[#25C9F2]' : 'text-[#64748B]')} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>
              <div className="p-4 border-t border-[rgba(145,162,184,0.12)] space-y-2">
                <Link
                  to={`/u/${user.username}`}
                  target="_blank"
                  onClick={() => setDrawerOpen(false)}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg bg-[#121E2E] text-xs font-medium text-[#F5F8FC]"
                >
                  <span>Public profile</span>
                  <ExternalLink className="w-3.5 h-3.5 text-[#91A2B8]" />
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium text-[#F06473] bg-[#F06473]/10 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Viewport */}
        <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 pb-24 lg:pb-12">
          {children}
        </main>

        {/* Purpose-built Mobile Bottom Navigation Bar */}
        <nav
          aria-label="Mobile navigation"
          className="lg:hidden fixed bottom-0 inset-x-0 z-30 h-14 bg-[#0D1422]/95 backdrop-blur-md border-t border-[rgba(145,162,184,0.16)] grid grid-cols-5"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors',
                  isActive ? 'text-[#25C9F2]' : 'text-[#91A2B8]'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="truncate max-w-[60px]">{item.shortLabel}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
