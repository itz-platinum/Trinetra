export type UpiAppType = 'gpay' | 'phonepe' | 'paytm' | 'bhim' | 'amazonpay' | 'other';

export interface User {
  id: string;
  full_name: string;
  email: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  profile_visibility: 'public' | 'unpublished';
  allow_custom_amount: number;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentConnection {
  id: string;
  user_id: string;
  application_type: UpiAppType;
  application_label?: string;
  upi_id: string;
  is_enabled: number;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface PublicProfile {
  full_name: string;
  username: string;
  avatar_url?: string;
  bio?: string;
  allow_custom_amount: boolean;
  created_at: string;
}

export interface PublicConnection {
  id: string;
  application_type: UpiAppType;
  application_label: string;
  upi_id: string;
  display_order: number;
}

declare global {
  namespace React {
    namespace JSX {
      interface IntrinsicElements {
        'sakuga-button': React.DetailedHTMLProps<
          React.HTMLAttributes<HTMLElement> & {
            variant?: string;
            disabled?: boolean;
            type?: string;
            onClick?: (e: any) => void;
            ref?: any;
          },
          HTMLElement
        > & {
          done?: () => void;
        };
      }
    }
  }
}
