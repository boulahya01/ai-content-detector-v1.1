import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { 
  FiUser, 
  FiShield, 
  FiBell, 
  FiEye, 
  FiCode, 
  FiCreditCard,
  FiActivity,
  FiKey,
  FiFileText,
  FiClock,
  FiDollarSign,
  FiCreditCard as FiPayment
} from 'react-icons/fi';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType;
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    title: 'Account',
    href: '/settings/account',
    icon: FiUser,
    children: [
      {
        title: 'Profile',
        href: '/settings/account/profile',
        icon: FiUser,
      },
      {
        title: 'Subscription',
        href: '/settings/account/subscription',
        icon: FiDollarSign,
      },
      {
        title: 'Activity',
        href: '/settings/account/activity',
        icon: FiActivity,
      },
    ],
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: FiShield,
    children: [
      {
        title: 'Account Settings',
        href: '/settings/account-settings',
        icon: FiUser,
      },
      {
        title: 'Security',
        href: '/settings/security',
        icon: FiShield,
      },
      {
        title: 'Notifications',
        href: '/settings/notifications',
        icon: FiBell,
      },
      {
        title: 'Appearance',
        href: '/settings/appearance',
        icon: FiEye,
      },
      {
        title: 'API Access',
        href: '/settings/api',
        icon: FiCode,
      },
      {
        title: 'Billing & Plans',
        href: '/settings/billing',
        icon: FiCreditCard,
      },
    ],
  },
  {
    title: 'API Access',
    href: '/settings/api-access',
    icon: FiKey,
    children: [
      {
        title: 'API Keys',
        href: '/settings/api-access/keys',
        icon: FiKey,
      },
      {
        title: 'Usage',
        href: '/settings/api-access/usage',
        icon: FiActivity,
      },
      {
        title: 'Documentation',
        href: '/settings/api-access/docs',
        icon: FiFileText,
      },
    ],
  },
  {
    title: 'Billing & Credits',
    href: '/settings/billing',
    icon: FiCreditCard,
    children: [
      {
        title: 'Overview',
        href: '/settings/billing/overview',
        icon: FiDollarSign,
      },
      {
        title: 'Invoices',
        href: '/settings/billing/invoices',
        icon: FiFileText,
      },
      {
        title: 'Payment Method',
        href: '/settings/billing/payment',
        icon: FiPayment,
      },
    ],
  },
];

interface SettingsLayoutProps {
  children: ReactNode;
}

export function SettingsLayout({ children }: SettingsLayoutProps) {
  const location = useLocation();
  const { user } = useAuth();

  const renderNavItem = (item: NavItem, depth = 0) => {
    const isActive = location.pathname === item.href;
    const isParentOfActive = item.children?.some(
      child => location.pathname.startsWith(child.href)
    );
    const Icon = item.icon;

    return (
      <div key={item.href}>
        <Link
          to={item.href}
          className={cn(
            "flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md transition-all duration-200",
            {
              "text-accent-500 bg-accent-500/10": isActive,
              "text-white/70 hover:text-white hover:bg-white/5": !isActive,
              "mb-1": depth === 0,
              "ml-6": depth > 0,
            }
          )}
        >
          <Icon className="h-4 w-4" />
          <span>{item.title}</span>
        </Link>
        {(isActive || isParentOfActive) && item.children && (
          <div className="mb-2">
            {item.children.map(child => renderNavItem(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
          {/* Sidebar */}
          <aside className="space-y-6">
            <Card className="p-4">
              {/* User Profile Section */}
              <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-white/10">
                <div className="relative w-12 h-12">
                  <div className="w-full h-full rounded-full bg-accent-500/20 flex items-center justify-center text-accent-300 text-lg font-semibold">
                    {user?.name?.[0].toUpperCase() || user?.email?.[0].toUpperCase() || 'U'}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background"></div>
                </div>
                <div>
                  <h3 className="font-medium text-white/90">{user?.name}</h3>
                  <p className="text-sm text-white/60">{user?.email}</p>
                </div>
              </div>

              {/* Navigation */}
              <nav className="space-y-1">
                {navigationItems.map(item => renderNavItem(item))}
              </nav>
            </Card>

            {/* Quick Actions Card */}
            <Card className="p-4">
              <h4 className="text-sm font-medium text-white/70 mb-3">Quick Actions</h4>
              <div className="space-y-2">
                <Link
                  to="/settings/api-access/keys/new"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-accent-500 hover:bg-accent-500/10 transition-colors"
                >
                  <FiKey className="h-4 w-4" />
                  <span>Create New API Key</span>
                </Link>
                <Link
                  to="/settings/billing/overview"
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md text-accent-500 hover:bg-accent-500/10 transition-colors"
                >
                  <FiCreditCard className="h-4 w-4" />
                  <span>Manage Subscription</span>
                </Link>
              </div>
            </Card>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <Card className="p-6 backdrop-blur-sm">
              {children}
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}