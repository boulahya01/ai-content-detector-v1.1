import { ReactNode, Suspense } from 'react';
import { SettingsLayout } from '@/components/settings/SettingsLayout';
import { useLocation } from 'react-router-dom';
import { FiLoader } from 'react-icons/fi';

interface SectionHeaderProps {
  title: string;
  description: string;
  children?: ReactNode;
}

function SectionHeader({ title, description, children }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 mb-6 pb-6 border-b border-white/10">
      <div>
        <h1 className="text-2xl font-bold text-white/90">{title}</h1>
        <p className="mt-1 text-sm text-white/60">{description}</p>
      </div>
      {children && (
        <div className="flex gap-3">
          {children}
        </div>
      )}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-48">
      <FiLoader className="w-6 h-6 text-accent-500 animate-spin" />
    </div>
  );
}

interface SettingsPageProps {
  children: ReactNode;
}

export default function SettingsPage({ children }: SettingsPageProps) {
  const location = useLocation();
  
  // Get the section title and description based on the current route
  const getSectionInfo = () => {
    const path = location.pathname;
    
    if (path.includes('/settings/account/profile')) {
      return {
        title: 'Profile Settings',
        description: 'Manage your personal information and preferences',
      };
    }
    if (path.includes('/settings/account/subscription')) {
      return {
        title: 'Subscription',
        description: 'View and manage your subscription details',
      };
    }
    if (path.includes('/settings/account/activity')) {
      return {
        title: 'Activity',
        description: 'View your recent account activity',
      };
    }
    if (path.includes('/settings/account-settings')) {
      return {
        title: 'Account Settings',
        description: 'Manage your account settings and preferences',
      };
    }
    if (path.includes('/settings/security')) {
      return {
        title: 'Security',
        description: 'Configure your account security settings',
      };
    }
    if (path.includes('/settings/notifications')) {
      return {
        title: 'Notifications',
        description: 'Customize your notification preferences',
      };
    }
    if (path.includes('/settings/appearance')) {
      return {
        title: 'Appearance',
        description: 'Customize the look and feel of your interface',
      };
    }
    if (path.includes('/settings/api-access/keys')) {
      return {
        title: 'API Keys',
        description: 'Manage your API keys for programmatic access',
      };
    }
    if (path.includes('/settings/api-access/usage')) {
      return {
        title: 'API Usage',
        description: 'Monitor your API usage and quotas',
      };
    }
    if (path.includes('/settings/api-access/docs')) {
      return {
        title: 'API Documentation',
        description: 'Learn how to integrate with our API',
      };
    }
    if (path.includes('/settings/billing/overview')) {
      return {
        title: 'Billing Overview',
        description: 'View your billing summary and usage',
      };
    }
    if (path.includes('/settings/billing/invoices')) {
      return {
        title: 'Invoices',
        description: 'Access your billing history and invoices',
      };
    }
    if (path.includes('/settings/billing/payment')) {
      return {
        title: 'Payment Method',
        description: 'Manage your payment methods and billing information',
      };
    }
    
    // Default section info
    return {
      title: 'Settings',
      description: 'Manage your account settings and preferences',
    };
  };

  const sectionInfo = getSectionInfo();

  return (
    <SettingsLayout>
      <SectionHeader
        title={sectionInfo.title}
        description={sectionInfo.description}
      />
      <Suspense fallback={<LoadingSpinner />}>
        {children}
      </Suspense>
    </SettingsLayout>
  );
}