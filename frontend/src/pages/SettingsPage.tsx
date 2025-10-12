import { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';

const settingsSections = [
  {
    id: 'account',
    name: 'Account Settings',
    icon: 'user',
    description: 'Manage your account details and preferences'
  },
  {
    id: 'security',
    name: 'Security',
    icon: 'shield',
    description: 'Password, two-factor authentication, and security logs'
  },
  {
    id: 'notifications',
    name: 'Notifications',
    icon: 'bell',
    description: 'Choose what notifications you want to receive'
  },
  {
    id: 'appearance',
    name: 'Appearance',
    icon: 'palette',
    description: 'Customize how the application looks and feels'
  },
  {
    id: 'api',
    name: 'API Access',
    icon: 'code',
    description: 'Manage API keys and access tokens'
  },
  {
    id: 'billing',
    name: 'Billing & Plans',
    icon: 'credit-card',
    description: 'Manage your subscription and billing preferences'
  }
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('account');
  const { user } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>

      <div className="grid grid-cols-12 gap-8">
        {/* Sidebar */}
        <nav className="col-span-12 lg:col-span-3">
          <div className="space-y-1">
            {settingsSections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeSection === section.id
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className="truncate">{section.name}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Main content */}
        <main className="col-span-12 lg:col-span-9">
          <Card>
            <div className="px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {settingsSections.find(s => s.id === activeSection)?.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {settingsSections.find(s => s.id === activeSection)?.description}
              </p>
            </div>
            <div className="px-6 py-6">
              {/* Content will be implemented based on active section */}
              <div className="text-sm text-gray-500">
                Settings content for {settingsSections.find(s => s.id === activeSection)?.name} will be implemented here.
              </div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}