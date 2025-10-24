import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { cn } from '@/utils/cn';
import { useAuth } from '@/context/AuthContext';

const accountNavigation = [
  { name: 'Account', href: '/account' },
  { name: 'Settings', href: '/account/settings' },
  { name: 'API Access', href: '/account/api' },
  { name: 'Billing & Credits', href: '/account/billing' },
];

export default function AccountLayout() {
  const { user } = useAuth();
  const location = useLocation();

  const currentPage = accountNavigation.find(
    item => item.href === location.pathname
  ) || accountNavigation[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid gap-8 md:grid-cols-[240px_1fr]">
        {/* Left sidebar */}
        <div className="space-y-6">
          <Card className="p-4">
            <div className="flex items-center space-x-3 mb-6">
              <div className="relative w-12 h-12">
                <div className="w-full h-full rounded-full bg-accent-500/20 flex items-center justify-center text-accent-300 text-lg font-semibold">
                  {user?.first_name?.[0].toUpperCase() || user?.email?.[0].toUpperCase() || 'U'}
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-background"></div>
              </div>
              <div>
                <div className="font-medium text-foreground">
                  {user?.first_name || user?.email?.split('@')[0] || 'User'}
                </div>
                <div className="text-sm text-muted-foreground">{user?.email}</div>
              </div>
            </div>

            <nav className="space-y-1">
              {accountNavigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'block px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    item.href === location.pathname
                      ? 'bg-accent-500/10 text-accent-500'
                      : 'text-muted-foreground hover:bg-accent-500/5 hover:text-accent-500'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </Card>
        </div>

        {/* Main content */}
        <main>
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-foreground">
              {currentPage.name}
            </h1>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}