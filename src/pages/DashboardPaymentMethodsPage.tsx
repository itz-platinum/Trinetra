import React, { useState, useEffect } from 'react';
import { Plus, Info, CreditCard, AlertCircle } from 'lucide-react';
import { DashboardLayout } from '../components/DashboardLayout';
import { PaymentAppItem } from '../components/PaymentAppItem';
import { PaymentAppIcon } from '../components/PaymentAppIcon';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Dialog, ConfirmDialog } from '../components/ui/Dialog';
import { EmptyState } from '../components/ui/EmptyState';
import { Skeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';
import { apiClient, ApiError } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { UPI_APPS, getUpiAppMeta, validateVpa } from '../lib/utils';
import { PaymentConnection, UpiAppType } from '../types';

const SUPPORTED_APPS: UpiAppType[] = ['gpay', 'phonepe', 'paytm', 'bhim', 'amazonpay', 'other'];

export const DashboardPaymentMethodsPage: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [connections, setConnections] = useState<PaymentConnection[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingConnection, setEditingConnection] = useState<PaymentConnection | null>(null);
  const [appType, setAppType] = useState<UpiAppType>('gpay');
  const [appLabel, setAppLabel] = useState('Google Pay');
  const [upiId, setUpiId] = useState('');
  const [isEnabled, setIsEnabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteTarget, setDeleteTarget] = useState<PaymentConnection | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    setLoading(true);
    try {
      const data = await apiClient.get<{ connections: PaymentConnection[] }>(
        '/api/payment-connections'
      );
      setConnections(data.connections || []);
    } catch (err) {
      const msg =
        err instanceof ApiError ? err.message : 'Could not retrieve your payment connections.';
      toast.error('Failed to load', msg);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = (presetType: UpiAppType = 'gpay') => {
    const meta = getUpiAppMeta(presetType);
    setEditingConnection(null);
    setAppType(presetType);
    setAppLabel(meta.name);
    setUpiId('');
    setIsEnabled(true);
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (conn: PaymentConnection) => {
    setEditingConnection(conn);
    setAppType(conn.application_type);
    setAppLabel(conn.application_label || getUpiAppMeta(conn.application_type).name);
    setUpiId(conn.upi_id);
    setIsEnabled(conn.is_enabled === 1);
    setFormError('');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!user) {
      setFormError('Your session has expired. Please sign in again.');
      return;
    }

    const vpaCheck = validateVpa(upiId);
    if (!vpaCheck.valid) {
      setFormError(vpaCheck.error || 'Please check the information entered.');
      return;
    }

    const cleanLabel = appLabel.trim() || getUpiAppMeta(appType).name;
    const cleanUpi = upiId.trim();

    setSaving(true);
    try {
      const payload = {
        application_type: appType,
        application_label: cleanLabel,
        upi_id: cleanUpi,
        is_enabled: isEnabled ? 1 : 0,
      };

      if (editingConnection) {
        const res = await apiClient.put<{ connection: PaymentConnection }>(
          `/api/payment-connections/${editingConnection.id}`,
          payload
        );
        setConnections((prev) =>
          prev.map((c) => (c.id === editingConnection.id ? res.connection : c))
        );
        toast.success('Connection updated', `${cleanLabel} (${cleanUpi})`);
      } else {
        const res = await apiClient.post<{ connection: PaymentConnection }>(
          '/api/payment-connections',
          payload
        );
        setConnections((prev) => [...prev, res.connection]);
        toast.success('Connection added', `${cleanLabel} (${cleanUpi})`);
      }

      setModalOpen(false);
    } catch (err: any) {
      const msg =
        err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
      setFormError(msg);
      toast.error('Unable to save connection', msg);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await apiClient.delete(`/api/payment-connections/${deleteTarget.id}`);
      setConnections((prev) => prev.filter((c) => c.id !== deleteTarget.id));
      toast.success('Connection removed', deleteTarget.upi_id);
      setDeleteTarget(null);
    } catch (err: any) {
      const msg =
        err instanceof ApiError ? err.message : 'Could not delete the selected connection.';
      toast.error('Remove failed', msg);
    } finally {
      setDeleting(false);
    }
  };

  const toggleStatus = async (conn: PaymentConnection) => {
    const nextState = conn.is_enabled === 1 ? 0 : 1;
    try {
      const res = await apiClient.put<{ connection: PaymentConnection }>(
        `/api/payment-connections/${conn.id}`,
        { is_enabled: nextState }
      );
      setConnections((prev) => prev.map((c) => (c.id === conn.id ? res.connection : c)));
      toast.info(
        nextState === 1 ? 'Connection enabled' : 'Connection paused',
        conn.application_label || getUpiAppMeta(conn.application_type).name
      );
    } catch (err: any) {
      const msg =
        err instanceof ApiError ? err.message : 'Unable to change connection status.';
      toast.error('Update failed', msg);
    }
  };

  const selectedMeta = getUpiAppMeta(appType);

  return (
    <DashboardLayout pageTitle="Payment Connections">
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(145,162,184,0.12)]">
          <div className="space-y-1">
            <p className="font-mono text-[11px] uppercase tracking-wider text-[#25C9F2]">
              UPI Destinations
            </p>
            <h2 className="font-display text-2xl font-bold text-[#F5F8FC] tracking-tight">
              Payment Connections
            </h2>
            <p className="text-sm text-[#91A2B8]">
              Add, pause, or update VPA handles displayed on your public payment profile.
            </p>
          </div>
          <Button
            size="md"
            onClick={() => openAddModal('gpay')}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Add connection
          </Button>
        </div>

        {/* Supported Apps Quick-Add Strip */}
        <div className="space-y-2.5">
          <p className="font-mono text-[11px] uppercase tracking-wider text-[#64748B]">
            Quick add supported app
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {SUPPORTED_APPS.map((type) => {
              const meta = UPI_APPS[type];
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => openAddModal(type)}
                  className="flex items-center gap-2.5 p-2.5 rounded-lg bg-[#0D1422] hover:bg-[#121E2E] border border-[rgba(145,162,184,0.14)] hover:border-[rgba(145,162,184,0.3)] text-left transition-colors cursor-pointer"
                >
                  <PaymentAppIcon type={type} size="sm" />
                  <span className="text-xs font-medium text-[#F5F8FC] truncate">
                    {meta.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Honest Protocol Notice */}
        <div className="rounded-lg bg-[#0D1422] border border-[rgba(145,162,184,0.14)] px-4 py-3.5 flex items-start gap-3 text-xs text-[#91A2B8]">
          <Info className="w-4 h-4 text-[#25C9F2] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Payment connections store public VPA handles (such as{' '}
            <span className="font-mono text-[#F5F8FC]">name@okaxis</span>) used to build standard UPI intent links. TRINETRA never asks for bank logins or UPI PINs.
          </p>
        </div>

        {/* Connections List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : connections.length === 0 ? (
          <EmptyState
            icon={<CreditCard className="w-5 h-5" />}
            title="No payment connections configured"
            description="Add your first Google Pay, PhonePe, Paytm, or BHIM handle to publish it on your public profile."
            action={
              <Button onClick={() => openAddModal('gpay')} leftIcon={<Plus className="w-4 h-4" />}>
                Add first UPI connection
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connections.map((conn) => (
              <PaymentAppItem
                key={conn.id}
                id={conn.id}
                applicationType={conn.application_type}
                label={conn.application_label}
                upiId={conn.upi_id}
                isEnabled={conn.is_enabled === 1}
                mode="manage"
                onToggle={() => toggleStatus(conn)}
                onEdit={() => openEditModal(conn)}
                onDelete={() => setDeleteTarget(conn)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Connection Dialog */}
      <Dialog
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingConnection ? 'Edit Payment Connection' : 'Add Payment Connection'}
        description="Configure the UPI application and Virtual Payment Address shown to visitors."
        maxWidth="md"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div
              role="alert"
              className="rounded-lg bg-[#F06473]/10 border border-[#F06473]/30 px-3.5 py-2.5 flex items-center gap-2 text-xs text-[#F06473]"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <Select
            label="Application"
            value={appType}
            onChange={(e) => {
              const nextType = e.target.value as UpiAppType;
              setAppType(nextType);
              if (!editingConnection) {
                setAppLabel(getUpiAppMeta(nextType).name);
              }
            }}
            options={SUPPORTED_APPS.map((type) => ({
              value: type,
              label: UPI_APPS[type].name,
            }))}
          />

          <Input
            label="Display Label"
            type="text"
            required
            value={appLabel}
            onChange={(e) => setAppLabel(e.target.value)}
            placeholder="e.g. Google Pay Personal"
          />

          <Input
            label="UPI ID (VPA)"
            type="text"
            required
            value={upiId}
            onChange={(e) => setUpiId(e.target.value)}
            placeholder={`e.g. ${selectedMeta.exampleHandle}`}
            className="font-mono"
            hint={`Standard VPA format: ${selectedMeta.exampleHandle}`}
          />

          <label className="flex items-center gap-3 p-3 rounded-lg bg-[#080C14] border border-[rgba(145,162,184,0.14)] cursor-pointer">
            <input
              type="checkbox"
              checked={isEnabled}
              onChange={(e) => setIsEnabled(e.target.checked)}
              className="w-4 h-4 rounded accent-[#25C9F2]"
            />
            <span className="text-xs font-medium text-[#F5F8FC]">
              Show this payment connection on my public profile
            </span>
          </label>

          <div className="pt-2 flex items-center justify-end gap-3">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {saving ? 'Saving...' : editingConnection ? 'Save changes' : 'Add connection'}
            </Button>
          </div>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Remove payment connection?"
        description={
          deleteTarget
            ? `This will remove ${deleteTarget.application_label || getUpiAppMeta(deleteTarget.application_type).name} (${deleteTarget.upi_id}) from your profile. Visitors will no longer see this destination.`
            : ''
        }
        confirmLabel="Remove connection"
        loading={deleting}
      />
    </DashboardLayout>
  );
};
