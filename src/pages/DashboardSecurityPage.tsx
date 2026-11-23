import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, Eye, EyeOff, AlertCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../components/DashboardLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { StatusIndicator } from '../components/ui/StatusIndicator';
import { useToast } from '../components/ui/Toast';
import { apiClient, ApiError } from '../lib/api';
import { cn } from '../lib/utils';

export const DashboardSecurityPage: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordStrength =
    newPassword.length >= 10 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword)
      ? 3
      : newPassword.length >= 6
        ? 2
        : newPassword.length > 0
          ? 1
          : 0;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.put('/api/user/password', {
        current_password: currentPassword,
        new_password: newPassword,
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated', 'Your account credentials have been changed.');
    } catch (err: any) {
      const msg =
        err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
      toast.error('Password update failed', msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await logout();
    toast.info('Signed out', 'Your current session has been terminated.');
    navigate('/login');
  };

  return (
    <DashboardLayout pageTitle="Security">
      <div className="max-w-3xl space-y-8 animate-fade-in">
        <div className="space-y-1 pb-6 border-b border-[rgba(145,162,184,0.12)]">
          <p className="font-mono text-[11px] uppercase tracking-wider text-[#25C9F2]">
            Credentials & Sessions
          </p>
          <h2 className="font-display text-2xl font-bold text-[#F5F8FC] tracking-tight">
            Security
          </h2>
          <p className="text-sm text-[#91A2B8]">
            Update your password and manage your authenticated browser session.
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

        <form onSubmit={handlePasswordChange}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>
                  Passwords are hashed server-side with bcrypt before storage.
                </CardDescription>
              </div>
              <div className="w-9 h-9 rounded-lg bg-[#121E2E] border border-[rgba(145,162,184,0.16)] flex items-center justify-center text-[#25C9F2]">
                <Shield className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                label="Current Password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
                leftIcon={<Lock className="w-4 h-4" />}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide passwords' : 'Show passwords'}
                    className="text-[#64748B] hover:text-[#F5F8FC] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />

              <div className="space-y-2">
                <Input
                  label="New Password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  leftIcon={<Lock className="w-4 h-4" />}
                />
                {newPassword.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3].map((level) => (
                      <span
                        key={level}
                        className={cn(
                          'h-1 flex-1 rounded-full transition-colors',
                          passwordStrength >= level
                            ? passwordStrength === 3
                              ? 'bg-[#28C987]'
                              : passwordStrength === 2
                                ? 'bg-[#25C9F2]'
                                : 'bg-[#F06473]'
                            : 'bg-[#121E2E]'
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>

              <Input
                label="Confirm New Password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                leftIcon={<Lock className="w-4 h-4" />}
              />

              <div className="pt-2 flex justify-end">
                <Button type="submit" size="lg" loading={loading}>
                  {loading ? 'Updating password...' : 'Update password'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <div>
              <CardTitle>Active Session</CardTitle>
              <CardDescription>
                Authenticated via HTTP-only cookie valid for 7 days.
              </CardDescription>
            </div>
            <StatusIndicator tone="success" label="Active" />
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <p className="text-xs text-[#91A2B8] leading-relaxed">
              Signing out immediately invalidates your current session token on the server.
            </p>
            <Button
              variant="secondary"
              size="md"
              onClick={handleSignOut}
              leftIcon={<LogOut className="w-3.5 h-3.5" />}
            >
              Sign out
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};
