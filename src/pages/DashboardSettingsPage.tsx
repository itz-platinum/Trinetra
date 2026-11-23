import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, EyeOff, Trash2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../components/DashboardLayout';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { ConfirmDialog } from '../components/ui/Dialog';
import { useToast } from '../components/ui/Toast';
import { apiClient, ApiError } from '../lib/api';
import { formatDate, cn } from '../lib/utils';

export const DashboardSettingsPage: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [profileVisibility, setProfileVisibility] = useState<'public' | 'unpublished'>(
    user?.profile_visibility || 'public'
  );
  const [allowCustomAmount, setAllowCustomAmount] = useState(
    user?.allow_custom_amount === 1
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await apiClient.put('/api/user/profile', {
        profile_visibility: profileVisibility,
        allow_custom_amount: allowCustomAmount ? 1 : 0,
      });

      await refreshUser();
      toast.success('Settings saved', 'Your privacy and payment preferences are live.');
    } catch (err: any) {
      const msg =
        err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
      toast.error('Unable to save settings', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      await apiClient.delete('/api/user/account');
      await logout();
      toast.info('Account deleted', 'Your TRINETRA profile and connections have been removed.');
      navigate('/');
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : 'Unable to delete account.';
      toast.error('Deletion failed', msg);
      setDeleting(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout pageTitle="Settings">
      <div className="max-w-3xl space-y-8 animate-fade-in">
        <div className="space-y-1 pb-6 border-b border-[rgba(145,162,184,0.12)]">
          <p className="font-mono text-[11px] uppercase tracking-wider text-[#25C9F2]">
            Preferences
          </p>
          <h2 className="font-display text-2xl font-bold text-[#F5F8FC] tracking-tight">
            Account Settings & Privacy
          </h2>
          <p className="text-sm text-[#91A2B8]">
            Control public visibility, visitor amount options, and account lifecycle.
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg bg-[#F06473]/10 border border-[#F06473]/30 px-4 py-3 flex items-center gap-2.5 text-xs text-[#F06473]"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Account Metadata */}
        <Card>
          <CardHeader>
            <CardTitle>Account Summary</CardTitle>
            <CardDescription>Read-only identity registration details.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="rounded-lg bg-[#080C14] border border-[rgba(145,162,184,0.14)] p-3.5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">Email</p>
              <p className="text-sm text-[#F5F8FC] truncate mt-1">{user.email}</p>
            </div>
            <div className="rounded-lg bg-[#080C14] border border-[rgba(145,162,184,0.14)] p-3.5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">Handle</p>
              <p className="text-sm font-mono text-[#25C9F2] truncate mt-1">@{user.username}</p>
            </div>
            <div className="rounded-lg bg-[#080C14] border border-[rgba(145,162,184,0.14)] p-3.5">
              <p className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
                Member Since
              </p>
              <p className="text-sm text-[#F5F8FC] mt-1">{formatDate(user.created_at)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Visibility & Payment Experience Form */}
        <form onSubmit={handleSaveSettings}>
          <Card>
            <CardHeader>
              <CardTitle>Public Profile & Payment Options</CardTitle>
              <CardDescription>
                Choose whether visitors can view your page and enter custom payment amounts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <label
                  className={cn(
                    'flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors',
                    profileVisibility === 'public'
                      ? 'bg-[#121E2E] border-[#25C9F2]/50'
                      : 'bg-[#080C14] border-[rgba(145,162,184,0.14)] hover:border-[rgba(145,162,184,0.28)]'
                  )}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value="public"
                    checked={profileVisibility === 'public'}
                    onChange={() => setProfileVisibility('public')}
                    className="mt-1 accent-[#25C9F2]"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-[#F5F8FC]">
                      <Globe className="w-3.5 h-3.5 text-[#28C987]" />
                      <span>Public</span>
                    </div>
                    <p className="text-xs text-[#91A2B8] leading-relaxed">
                      Anyone with your TRINETRA link can view your enabled UPI destinations.
                    </p>
                  </div>
                </label>

                <label
                  className={cn(
                    'flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors',
                    profileVisibility === 'unpublished'
                      ? 'bg-[#121E2E] border-[#25C9F2]/50'
                      : 'bg-[#080C14] border-[rgba(145,162,184,0.14)] hover:border-[rgba(145,162,184,0.28)]'
                  )}
                >
                  <input
                    type="radio"
                    name="visibility"
                    value="unpublished"
                    checked={profileVisibility === 'unpublished'}
                    onChange={() => setProfileVisibility('unpublished')}
                    className="mt-1 accent-[#25C9F2]"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-[#F5F8FC]">
                      <EyeOff className="w-3.5 h-3.5 text-[#91A2B8]" />
                      <span>Unpublished</span>
                    </div>
                    <p className="text-xs text-[#91A2B8] leading-relaxed">
                      Hide your public page and QR endpoints while keeping your account intact.
                    </p>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-between gap-4 p-4 rounded-xl bg-[#080C14] border border-[rgba(145,162,184,0.14)]">
                <div>
                  <p className="text-sm font-medium text-[#F5F8FC]">
                    Allow custom visitor amount
                  </p>
                  <p className="text-xs text-[#91A2B8] mt-0.5">
                    Display an optional INR amount input on your public profile and QR generator.
                  </p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={allowCustomAmount}
                  aria-label="Allow custom visitor amount"
                  onClick={() => setAllowCustomAmount((prev) => !prev)}
                  className={cn(
                    'relative inline-flex h-6 w-10 shrink-0 items-center rounded-full border transition-colors cursor-pointer',
                    allowCustomAmount
                      ? 'bg-[#25C9F2]/25 border-[#25C9F2]/60'
                      : 'bg-[#121E2E] border-[rgba(145,162,184,0.25)]'
                  )}
                >
                  <span
                    className={cn(
                      'inline-block h-4 w-4 rounded-full transition-transform',
                      allowCustomAmount
                        ? 'translate-x-5 bg-[#25C9F2]'
                        : 'translate-x-1 bg-[#64748B]'
                    )}
                  />
                </button>
              </div>

              <div className="flex justify-end">
                <Button type="submit" size="lg" loading={loading}>
                  {loading ? 'Saving...' : 'Save settings'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Danger Zone */}
        <Card className="border-[#F06473]/30">
          <CardHeader>
            <CardTitle className="text-[#F06473]">Danger Zone</CardTitle>
            <CardDescription>
              Permanently delete your TRINETRA account, sessions, and all connected UPI handles.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="danger"
              size="md"
              onClick={() => setDeleteDialogOpen(true)}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Delete account permanently
            </Button>
          </CardContent>
        </Card>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Delete your TRINETRA account?"
        description="This action permanently deletes your profile, public handle, and all saved payment connections. This cannot be undone."
        confirmLabel="Delete account"
        requireTypedText="DELETE"
        loading={deleting}
      />
    </DashboardLayout>
  );
};
