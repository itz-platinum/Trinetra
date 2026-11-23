import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, CheckCircle2, ArrowLeft, AlertCircle } from 'lucide-react';
import { TrinetraLogo } from '../components/TrinetraLogo';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { apiClient, ApiError } from '../lib/api';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await apiClient.post<{ demo_reset_token?: string }>(
        '/api/auth/forgot-password',
        { email },
        { skipUnauthorizedHandler: true }
      );
      if (data.demo_reset_token) {
        setResetToken(data.demo_reset_token);
      }
      setSubmitted(true);
    } catch (err: any) {
      setError(
        err instanceof ApiError ? err.message : 'Failed to send recovery instructions'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent bg-precision-grid flex flex-col justify-between px-6 py-10">
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <Link to="/" className="focus-visible:outline-none">
          <TrinetraLogo size={26} withWordmark />
        </Link>
        <Link
          to="/login"
          className="text-xs font-medium text-[#91A2B8] hover:text-[#F5F8FC] transition-colors"
        >
          Sign in
        </Link>
      </div>

      <div className="w-full max-w-md mx-auto my-auto py-8 space-y-6">
        <div className="space-y-1.5">
          <p className="font-mono text-[11px] uppercase tracking-wider text-[#25C9F2]">
            Account Recovery
          </p>
          <h1 className="font-display text-2xl font-semibold text-[#F5F8FC] tracking-tight">
            Reset your password
          </h1>
          <p className="text-sm text-[#91A2B8]">
            Enter the email address associated with your account to generate a reset token.
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

        {submitted ? (
          <div className="rounded-xl bg-[#0D1422] border border-[rgba(145,162,184,0.18)] p-6 space-y-4 shadow-lg">
            <div className="w-10 h-10 rounded-lg bg-[#28C987]/12 border border-[#28C987]/25 text-[#28C987] flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="space-y-1.5">
              <h2 className="font-display text-base font-semibold text-[#F5F8FC]">
                Recovery instructions issued
              </h2>
              <p className="text-xs text-[#91A2B8] leading-relaxed">
                If an account exists for <span className="text-[#F5F8FC] font-medium">{email}</span>, a secure reset token has been created.
              </p>
            </div>

            {resetToken && (
              <div className="rounded-lg bg-[#080C14] border border-[rgba(145,162,184,0.16)] p-3 space-y-1.5">
                <p className="font-mono text-[10px] uppercase tracking-wider text-[#64748B]">
                  Recovery Token (Local Preview)
                </p>
                <p className="font-mono text-xs text-[#25C9F2] break-all select-all">{resetToken}</p>
              </div>
            )}

            <div className="pt-2 flex flex-col gap-2.5">
              <Link to="/reset-password" state={{ token: resetToken }}>
                <Button className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Continue to Reset Password
                </Button>
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-1.5 text-xs text-[#91A2B8] hover:text-[#F5F8FC] py-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to sign in</span>
              </Link>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="rounded-xl bg-[#0D1422] border border-[rgba(145,162,184,0.18)] p-6 space-y-4 shadow-lg"
          >
            <Input
              label="Email Address"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aarav@example.com"
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Button
              type="submit"
              size="lg"
              loading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full"
            >
              {loading ? 'Issuing token...' : 'Send recovery instructions'}
            </Button>

            <div className="text-center pt-1">
              <Link to="/login" className="text-xs text-[#91A2B8] hover:text-[#F5F8FC] transition-colors">
                Remembered your password? Sign in
              </Link>
            </div>
          </form>
        )}
      </div>

      <div className="max-w-md w-full mx-auto text-center text-[11px] text-[#64748B]">
        Tokens expire automatically after 60 minutes.
      </div>
    </div>
  );
};
