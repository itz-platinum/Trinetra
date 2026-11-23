import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { KeyRound, Lock, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import { TrinetraLogo } from '../components/TrinetraLogo';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { apiClient, ApiError } from '../lib/api';

export const ResetPasswordPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const initialToken = (location.state as { token?: string } | null)?.token || '';

  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post(
        '/api/auth/reset-password',
        { token: token.trim(), new_password: newPassword },
        { skipUnauthorizedHandler: true }
      );
      setDone(true);
      toast.success('Password reset', 'You can now sign in with your new password.');
    } catch (err: any) {
      setError(
        err instanceof ApiError ? err.message : 'Invalid or expired reset token'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent bg-precision-grid flex flex-col justify-between px-6 py-10">
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <Link to="/">
          <TrinetraLogo size={26} withWordmark />
        </Link>
        <Link to="/login" className="text-xs font-medium text-[#91A2B8] hover:text-[#F5F8FC]">
          Sign in
        </Link>
      </div>

      <div className="w-full max-w-md mx-auto my-auto py-8 space-y-6">
        <div className="space-y-1.5">
          <p className="font-mono text-[11px] uppercase tracking-wider text-[#25C9F2]">
            Set New Credentials
          </p>
          <h1 className="font-display text-2xl font-semibold text-[#F5F8FC] tracking-tight">
            Create a new password
          </h1>
          <p className="text-sm text-[#91A2B8]">
            Existing active sessions will be invalidated once your password is updated.
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

        {done ? (
          <div className="rounded-xl bg-[#0D1422] border border-[rgba(145,162,184,0.18)] p-6 space-y-4">
            <div className="w-10 h-10 rounded-lg bg-[#28C987]/12 border border-[#28C987]/25 text-[#28C987] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h2 className="font-display text-base font-semibold text-[#F5F8FC]">
                Password updated
              </h2>
              <p className="text-xs text-[#91A2B8]">
                Your password has been changed and previous sessions cleared.
              </p>
            </div>
            <Button className="w-full" onClick={() => navigate('/login')}>
              Sign in to dashboard
            </Button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-xl bg-[#0D1422] border border-[rgba(145,162,184,0.18)] p-6 space-y-4 shadow-lg"
          >
            <Input
              label="Recovery Token"
              type="text"
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste recovery token"
              className="font-mono text-xs"
              leftIcon={<KeyRound className="w-4 h-4" />}
            />

            <Input
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              leftIcon={<Lock className="w-4 h-4" />}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="text-[#64748B] hover:text-[#F5F8FC] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <Input
              label="Confirm New Password"
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Button
              type="submit"
              size="lg"
              loading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full"
            >
              {loading ? 'Updating password...' : 'Update password'}
            </Button>
          </form>
        )}
      </div>

      <div className="max-w-md w-full mx-auto text-center text-[11px] text-[#64748B]">
        TRINETRA Account Recovery
      </div>
    </div>
  );
};
