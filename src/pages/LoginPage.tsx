import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Mail, ArrowRight, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { TrinetraLogo } from '../components/TrinetraLogo';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useToast } from '../components/ui/Toast';

export const LoginPage: React.FC = () => {
  const [loginVal, setLoginVal] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(loginVal, password);
      toast.success('Signed in', 'Welcome back to your TRINETRA workspace.');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const fillDemoUser = () => {
    setLoginVal('aarav@trinetra.me');
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-transparent bg-precision-grid flex flex-col justify-between px-6 py-10">
      <div className="max-w-md w-full mx-auto flex items-center justify-between">
        <Link to="/" className="focus-visible:outline-none">
          <TrinetraLogo size={26} withWordmark />
        </Link>
        <Link
          to="/register"
          className="text-xs font-medium text-[#91A2B8] hover:text-[#F5F8FC] transition-colors"
        >
          Create account
        </Link>
      </div>

      <div className="w-full max-w-md mx-auto my-auto py-8 space-y-6">
        <div className="space-y-1.5">
          <p className="font-mono text-[11px] uppercase tracking-wider text-[#25C9F2]">
            Account Access
          </p>
          <h1 className="font-display text-2xl font-semibold text-[#F5F8FC] tracking-tight">
            Sign in to TRINETRA
          </h1>
          <p className="text-sm text-[#91A2B8]">
            Manage your public UPI profile and connected payment destinations.
          </p>
        </div>

        {/* Demo Account Strip */}
        <div className="rounded-xl bg-[#0D1422] border border-[rgba(145,162,184,0.16)] px-4 py-3 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs font-medium text-[#F5F8FC]">Demo account</p>
            <p className="text-[11px] font-mono text-[#91A2B8] truncate">
              aarav@trinetra.me · password123
            </p>
          </div>
          <Button type="button" variant="secondary" size="sm" onClick={fillDemoUser}>
            Use demo
          </Button>
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
          <GoogleSignInButton onError={(err) => setError(err)} />

          <div className="relative flex items-center py-1">
            <div className="flex-grow border-t border-[rgba(145,162,184,0.14)]" />
            <span className="mx-3 font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
              or continue with email
            </span>
            <div className="flex-grow border-t border-[rgba(145,162,184,0.14)]" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email or Username"
              type="text"
              required
              autoComplete="username"
              value={loginVal}
              onChange={(e) => setLoginVal(e.target.value)}
              placeholder="aarav or aarav@trinetra.me"
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-[#91A2B8] tracking-wide">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-[#25C9F2] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <Input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                leftIcon={<Lock className="w-4 h-4" />}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="text-[#64748B] hover:text-[#F5F8FC] transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
            </div>

            <Button
              type="submit"
              size="lg"
              loading={loading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full mt-2"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-[#91A2B8]">
          New to TRINETRA?{' '}
          <Link to="/register" className="text-[#25C9F2] font-medium hover:underline">
            Create your payment profile
          </Link>
        </p>
      </div>

      <div className="max-w-md w-full mx-auto text-center text-[11px] text-[#64748B]">
        Protected by server-side session cookies and bcrypt hashing.
      </div>
    </div>
  );
};
