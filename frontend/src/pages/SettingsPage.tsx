import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/hooks/useAuth';
import { FiUser, FiShield, FiBell, FiEye, FiCode, FiCreditCard } from 'react-icons/fi';
import AccountSettings from '@/components/profile/AccountSettings';
import SecuritySettings from '@/components/profile/SecuritySettings';
import NotificationsSettings from '@/components/profile/NotificationsSettings';
import AppearanceSettings from '@/components/profile/AppearanceSettings';
import ApiAccessSettings from '@/components/profile/ApiAccessSettings';
import BillingSettings from '@/components/profile/BillingSettings';

const settingsSections = [
  {
    id: 'account',
    name: 'Account Settings',
    icon: FiUser,
    description: 'Manage your account details and preferences'
  },
  {
    id: 'security',
    name: 'Security',
    icon: FiShield,
    description: 'Password, two-factor authentication, and security logs'
  },
  {
    id: 'notifications',
    name: 'Notifications',
    icon: FiBell,
    description: 'Choose what notifications you want to receive'
  },
  {
    id: 'appearance',
    name: 'Appearance',
    icon: FiEye,
    description: 'Customize how the application looks and feels'
  },
  {
    id: 'api',
    name: 'API Access',
    icon: FiCode,
    description: 'Manage API keys and access tokens'
  },
  {
    id: 'billing',
    name: 'Billing & Plans',
    icon: FiCreditCard,
    description: 'Manage your subscription and billing preferences'
  }
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('account');
  useAuth();

  return (
  <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-6">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--accent-500), var(--accent-600))', boxShadow: '0 8px 18px rgba(94,23,235,0.12)'}}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="white" fillOpacity="0.06"/>
                <path d="M7 12h10" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white/95">Settings</h1>
              <p className="mt-0.5 text-sm text-white/70">Manage your account settings and preferences</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-3 py-1.5 rounded-md text-sm text-white/90 bg-white/5 hover:bg-white/6 transition-colors">Export</button>
          <button className="w-9 h-9 rounded-md flex items-center justify-center bg-white/5 hover:bg-white/6 transition-colors" title="Help">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2a10 10 0 1 0 .001 20.001A10 10 0 0 0 12 2z" fill="white" fillOpacity="0.03"/><path d="M9.09 9a3 3 0 1 1 5.82 1c0 1.5-1.5 2.25-2.25 2.75L12 14" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/><path d="M12 17h.01" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" opacity="0.9"/></svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-4">
        {/* Sidebar */}
        <nav className="col-span-12 lg:col-span-3" aria-label="Settings sidebar">
          <div className="space-y-2">
            {settingsSections.map((section) => {
              const Icon = section.icon as any;
              const active = activeSection === section.id;
              return (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  aria-current={active ? 'page' : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors focus:outline-none ${
                    active
                      ? 'bg-gradient-to-r from-white/[0.02] to-white/[0.01] text-[color:var(--accent-500)] shadow-inner'
                      : 'text-white/70 hover:bg-white/[0.02] hover:text-white/90'
                  }`}
                  style={{ boxShadow: active ? 'inset 0 1px 0 rgba(255,255,255,0.02)' : undefined }}
                >
                  <span className="w-5 h-5 flex items-center justify-center text-white/60">
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="truncate">{section.name}</span>
                </button>
              );
            })}
          </div>
        </nav>

        {/* Main content */}
        <main className="col-span-12 lg:col-span-9">
          <Card>
            <div className="px-4 py-3 border-b border-white/6">
              <h3 className="text-base font-medium leading-6 text-white/95">
                {settingsSections.find(s => s.id === activeSection)?.name}
              </h3>
              <p className="mt-1 text-xs text-white/70">
                {settingsSections.find(s => s.id === activeSection)?.description}
              </p>
            </div>
            <div className="px-4 py-4">
              {/* Render section-specific components */}
              <div>
                {activeSection === 'account' && <AccountSettings />}
                {activeSection === 'security' && <SecuritySettings />}
                {activeSection === 'notifications' && <NotificationsSettings />}
                {activeSection === 'appearance' && <AppearanceSettings />}
                {activeSection === 'api' && <ApiAccessSettings />}
                {activeSection === 'billing' && <BillingSettings />}
              </div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}