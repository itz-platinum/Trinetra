import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  User,
  AtSign,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TrinetraLogo } from '../components/TrinetraLogo';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';
import { apiClient } from '../lib/api';

export const RegisterPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [usernameReason, setUsernameReason] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const hasMinLength = password.length >= 6;
  const hasMixed = /[A-Z]/.test(password) || /[0-9]/.test(password);
  const strengthScore = !password
    ? 0
    : hasMinLength && hasMixed && password.length >= 10
    ? 3
    : hasMinLength && hasMixed
    ? 2
    : 1;

  useEffect(() => {
    if (!username || username.length < 3) {
      setUsernameAvailable(null);
      setUsernameReason('');
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const data = await apiClient.get<{ available: boolean; reason?: string }>(
          `/api/public/check-username/${encodeURIComponent(username)}`
        );
        setUsernameAvailable(data.available);
        setUsernameReason(data.reason || (data.available ? '' : 'Username is already taken'));
      } catch {
        // ignore check failure
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [username]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (usernameAvailable === false) {
      setError(usernameReason || 'Please choose a different username.');
      return;
    }
    if (!hasMinLength) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await register(fullName, email, username, password);
      toast.success('Account created', 'Your TRINETRA payment profile is ready.');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed');
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
            Create Identity
          </p>
          <h1 className="font-display text-2xl font-semibold text-[#F5F8FC] tracking-tight">
            Create your TRINETRA profile
          </h1>
          <p className="text-sm text-[#91A2B8]">
            Claim your personal URL and connect your UPI payment apps.
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

        <div className="rounded-xl bg-[#0D1422]/85 backdrop-blur-md border border-[rgba(145,162,184,0.18)] p-6 space-y-5 shadow-lg">
          <GoogleSignInButton label="Sign up with Google" onError={(err) => setError(err)} />

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-[rgba(145,162,184,0.14)]" />
            <span className="mx-3 font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
              or register with email
            </span>
            <div className="flex-grow border-t border-[rgba(145,162,184,0.14)]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              required
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Aarav Sharma"
              leftIcon={<User className="w-4 h-4" />}
            />

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

            <div className="space-y-1.5">
              <Input
                label="Username"
                type="text"
                required
                value={username}
                onChange={(e) =>
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                }
                placeholder="aarav"
                leftIcon={<AtSign className="w-4 h-4" />}
                error={usernameAvailable === false ? usernameReason : undefined}
                rightSlot={
                  usernameAvailable === true ? (
                    <CheckCircle2 className="w-4 h-4 text-[#28C987]" aria-label="Available" />
                  ) : null
                }
              />
              <p className="text-[11px] font-mono text-[#64748B]">
                Public URL: <span className="text-[#91A2B8]">/u/{username || 'username'}</span>
              </p>
            </div>

            <div className="space-y-2">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {password && (
                <div className="space-y-1.5">
                  <div className="grid grid-cols-3 gap-1.5">
                    {[1, 2, 3].map((step) => (
                      <div
                        key={step}
                        className={`h-1 rounded-full transition-colors ${
                          strengthScore >= step
                            ? strengthScore === 3
                              ? 'bg-[#28C987]'
                              : strengthScore === 2
                              ? 'bg-[#25C9F2]'
                              : 'bg-[#F06473]'
                            : 'bg-[#121E2E]'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] text-[#91A2B8]">
                    {strengthScore === 3
                      ? 'Strong password'
                      : strengthScore === 2
                      ? 'Moderate password'
                      : 'Minimum 6 characters required'}
                  </p>
                </div>
              )}
            </div>

            <Input
              label="Confirm Password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              leftIcon={<Lock className="w-4 h-4" />}
              error={
                confirmPassword && confirmPassword !== password
                  ? 'Passwords do not match'
                  : undefined
              }
            />

            <Button
              type="submit"
              size="lg"
              loading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full mt-2"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-[#91A2B8]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#25C9F2] font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <div className="max-w-md w-full mx-auto text-center text-[11px] text-[#64748B]">
        TRINETRA never asks for or stores your UPI PIN or banking credentials.
      </div>
    </div>
  );
};
