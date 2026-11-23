import React, { useState, useEffect, useRef } from 'react';
import { AtSign, Upload, CheckCircle2, AlertCircle, Loader2, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../components/DashboardLayout';
import { Avatar } from '../components/Avatar';
import { ProfileCard } from '../components/ProfileCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { useToast } from '../components/ui/Toast';
import { apiClient, ApiError } from '../lib/api';
import { PaymentConnection } from '../types';

export const DashboardProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');
  const [connections, setConnections] = useState<PaymentConnection[]>([]);

  const [usernameStatus, setUsernameStatus] = useState<'idle' | 'checking' | 'available' | 'taken'>('idle');
  const [usernameNote, setUsernameNote] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiClient
      .get<{ connections: PaymentConnection[] }>('/api/payment-connections')
      .then((data) => {
        if (data?.connections) setConnections(data.connections);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!user) return;
    if (username === user.username || username.length < 3) {
      setUsernameStatus('idle');
      setUsernameNote('');
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameStatus('checking');
      try {
        const data = await apiClient.get<{ available: boolean; reason?: string }>(
          `/api/public/check-username/${encodeURIComponent(username)}`
        );
        if (data.available) {
          setUsernameStatus('available');
          setUsernameNote('Available');
        } else {
          setUsernameStatus('taken');
          setUsernameNote(data.reason || 'Unavailable');
        }
      } catch {
        setUsernameStatus('idle');
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [username, user]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Unsupported file', 'Please upload a PNG, JPEG, or WebP image.');
      return;
    }
    if (file.size > 1024 * 1024) {
      toast.error('Image too large', 'Avatar image must be 1 MB or smaller.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarUrl(reader.result);
        toast.info('Avatar ready', 'Save profile changes to publish your new avatar.');
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (usernameStatus === 'taken') {
      setError(usernameNote || 'Please choose an available username.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.put('/api/user/profile', {
        full_name: fullName.trim(),
        username: username.trim(),
        bio: bio.trim(),
        avatar_url: avatarUrl.trim(),
      });

      await refreshUser();
      toast.success('Profile saved', 'Your public TRINETRA identity is updated.');
    } catch (err: any) {
      const msg =
        err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
      setError(msg);
      toast.error('Unable to save profile', msg);
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const enabledConnections = connections.filter((c) => c.is_enabled === 1);

  return (
    <DashboardLayout pageTitle="Profile">
      <div className="space-y-8 animate-fade-in">
        <div className="space-y-1 pb-6 border-b border-[rgba(145,162,184,0.12)]">
          <p className="font-mono text-[11px] uppercase tracking-wider text-[#25C9F2]">
            Public Identity
          </p>
          <h2 className="font-display text-2xl font-bold text-[#F5F8FC] tracking-tight">
            Profile & Identity
          </h2>
          <p className="text-sm text-[#91A2B8]">
            Customize how your name, handle, avatar, and payment note appear to visitors.
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

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Edit Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Avatar</CardTitle>
                <CardDescription>
                  Upload a square image (up to 1 MB), paste an image URL, or fall back to initials.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                  <Avatar src={avatarUrl} name={fullName || user.full_name} size="xl" />
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        leftIcon={<Upload className="w-3.5 h-3.5" />}
                      >
                        Upload image
                      </Button>
                      {avatarUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setAvatarUrl('')}
                          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                        >
                          Use initials
                        </Button>
                      )}
                    </div>
                    <Input
                      type="text"
                      value={avatarUrl.startsWith('data:') ? '' : avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder={
                        avatarUrl.startsWith('data:')
                          ? 'Uploaded local image selected'
                          : 'Or paste image URL (https://...)'
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Identity Details</CardTitle>
                <CardDescription>
                  Shown at the top of your public payment page and in UPI payee metadata.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  label="Display Name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Aarav Sharma"
                />

                <Input
                  label="Username (Public Handle)"
                  type="text"
                  required
                  value={username}
                  onChange={(e) =>
                    setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                  }
                  leftIcon={<AtSign className="w-4 h-4" />}
                  rightSlot={
                    usernameStatus === 'checking' ? (
                      <Loader2 className="w-4 h-4 text-[#91A2B8] animate-spin" />
                    ) : usernameStatus === 'available' ? (
                      <CheckCircle2 className="w-4 h-4 text-[#28C987]" />
                    ) : usernameStatus === 'taken' ? (
                      <AlertCircle className="w-4 h-4 text-[#F06473]" />
                    ) : null
                  }
                  error={usernameStatus === 'taken' ? usernameNote : undefined}
                  hint={
                    usernameStatus === 'available'
                      ? `trinetra.me/u/${username} is available`
                      : `Public link: trinetra.me/u/${username || 'username'}`
                  }
                />

                {username !== user.username && (
                  <p className="text-xs text-[#E5A93B] bg-[#E5A93B]/10 border border-[#E5A93B]/25 rounded-lg px-3.5 py-2.5">
                    Changing your username updates your public URL. Previous links to @{user.username} will stop resolving.
                  </p>
                )}

                <Textarea
                  label="Bio / Payment Note"
                  rows={3}
                  maxLength={160}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Freelance designer & developer. Select any UPI app below or scan QR to pay."
                  hint={`${bio.length}/160 characters`}
                />

                <div className="pt-2 flex justify-end">
                  <Button type="submit" size="lg" loading={loading}>
                    {loading ? 'Saving changes...' : 'Save profile changes'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>

          {/* Sticky Live Preview */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-3">
            <p className="font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
              Live Card Preview
            </p>
            <ProfileCard
              fullName={fullName}
              username={username}
              avatarUrl={avatarUrl}
              bio={bio}
              visibility={user.profile_visibility}
              connections={enabledConnections}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
