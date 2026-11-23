import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { UpiAppType } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface UpiAppMeta {
  type: UpiAppType;
  name: string;
  shortCode: string;
  accentHex: string;
  bgTint: string;
  borderTint: string;
  exampleHandle: string;
  androidPackage?: string;
  schemePrefix: string;
}

export const UPI_APPS: Record<UpiAppType, UpiAppMeta> = {
  gpay: {
    type: 'gpay',
    name: 'Google Pay',
    shortCode: 'GP',
    accentHex: '#25C9F2',
    bgTint: 'bg-[#25C9F2]/10',
    borderTint: 'border-[#25C9F2]/25',
    exampleHandle: 'name@okaxis',
    androidPackage: 'com.google.android.apps.nbu.paisa.user',
    schemePrefix: 'tez://upi/pay',
  },
  phonepe: {
    type: 'phonepe',
    name: 'PhonePe',
    shortCode: 'PE',
    accentHex: '#8971F7',
    bgTint: 'bg-[#8971F7]/10',
    borderTint: 'border-[#8971F7]/25',
    exampleHandle: 'name@ybl',
    androidPackage: 'com.phonepe.app',
    schemePrefix: 'phonepe://pay',
  },
  paytm: {
    type: 'paytm',
    name: 'Paytm',
    shortCode: 'PT',
    accentHex: '#477BFF',
    bgTint: 'bg-[#477BFF]/10',
    borderTint: 'border-[#477BFF]/25',
    exampleHandle: 'name@paytm',
    androidPackage: 'net.one97.paytm',
    schemePrefix: 'paytmmp://pay',
  },
  bhim: {
    type: 'bhim',
    name: 'BHIM',
    shortCode: 'BH',
    accentHex: '#28C987',
    bgTint: 'bg-[#28C987]/10',
    borderTint: 'border-[#28C987]/25',
    exampleHandle: 'mobile@upi',
    androidPackage: 'in.org.npci.upiapp',
    schemePrefix: 'upi://pay',
  },
  amazonpay: {
    type: 'amazonpay',
    name: 'Amazon Pay',
    shortCode: 'AZ',
    accentHex: '#E5A93B',
    bgTint: 'bg-[#E5A93B]/10',
    borderTint: 'border-[#E5A93B]/25',
    exampleHandle: 'name@apl',
    schemePrefix: 'upi://pay',
  },
  other: {
    type: 'other',
    name: 'Other UPI',
    shortCode: 'UP',
    accentHex: '#91A2B8',
    bgTint: 'bg-[#91A2B8]/10',
    borderTint: 'border-[#91A2B8]/25',
    exampleHandle: 'handle@bank',
    schemePrefix: 'upi://pay',
  },
};

export function getUpiAppMeta(type: string): UpiAppMeta {
  return UPI_APPS[(type as UpiAppType) in UPI_APPS ? (type as UpiAppType) : 'other'];
}

export function buildUpiUri(params: {
  vpa: string;
  recipientName: string;
  amount?: string | number;
  note?: string;
  appType?: UpiAppType;
}): string {
  const cleanVpa = params.vpa.trim();
  const query = new URLSearchParams();
  query.set('pa', cleanVpa);
  query.set('pn', params.recipientName.trim() || 'Recipient');
  query.set('cu', 'INR');

  if (params.amount !== undefined && params.amount !== '') {
    const parsed = typeof params.amount === 'number' ? params.amount : parseFloat(params.amount);
    if (!Number.isNaN(parsed) && parsed > 0 && parsed <= 100000) {
      query.set('am', parsed.toFixed(2));
    }
  }

  if (params.note && params.note.trim()) {
    query.set('tn', params.note.trim().slice(0, 60));
  }

  return `upi://pay?${query.toString()}`;
}

export function validateVpa(vpa: string): { valid: boolean; error?: string } {
  const trimmed = vpa.trim();
  if (!trimmed) {
    return { valid: false, error: 'UPI ID is required.' };
  }
  const vpaRegex = /^[\w.\-_]{2,}@[a-zA-Z0-9.\-_]{2,}$/;
  if (!vpaRegex.test(trimmed)) {
    return { valid: false, error: 'Enter a valid UPI ID format such as name@okaxis or 9876543210@ybl.' };
  }
  return { valid: true };
}

export function getInitials(name: string): string {
  const parts = (name || 'U').trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function formatDate(dateString?: string): string {
  if (!dateString) return 'Recently';
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return 'Recently';
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
