import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Menu } from '@headlessui/react';
import { FiUser, FiLogOut, FiSettings, FiKey } from 'react-icons/fi';

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  
  const isActive = (path: string) => location.pathname === path;

  const navigation = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Analysis', href: '/analysis' },
    { name: 'History', href: '/history' },
  ];

  const profileMenuItems = [
    { name: 'Profile', href: '/profile', icon: FiUser },
    { name: 'API Keys', href: '/api-keys', icon: FiKey },
    { name: 'Settings', href: '/settings', icon: FiSettings },
    { 
      name: 'Logout', 
      href: '#',
      icon: FiLogOut,
      onClick: () => logout(),
      className: 'text-red-400 hover:text-red-300 hover:bg-red-400/10'
    },
  ];

  return (
    <header className="bg-secondary-900/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent-500 flex items-center justify-center">
              <span className="text-white font-bold">AI</span>
            </div>
            <span className="font-semibold text-white">Detector</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={
                  isActive(item.href)
                    ? 'px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-accent-500 text-white'
                    : 'px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white/70 hover:text-white hover:bg-white/5'
                }
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center gap-4">
            {/* Credits */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <span className="text-sm font-medium text-white/90">
                {user?.credits || 0}
              </span>
              <span className="text-xs text-white/60">Credits</span>
            </div>

            {/* Profile Menu */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 border border-white/10 transition-colors">
                <div className="w-6 h-6 rounded-full bg-accent-500 flex items-center justify-center">
                  <span className="text-xs font-medium text-white">
                    {user?.email?.[0].toUpperCase() || 'U'}
                  </span>
                </div>
                <span className="hidden sm:block text-sm text-white/90">
                  {user?.email}
                </span>
              </Menu.Button>

              <Menu.Items className="absolute right-0 mt-2 w-48 py-1 bg-secondary-800 rounded-lg border border-white/10 shadow-lg focus:outline-none">
                {profileMenuItems.map((item) => (
                  <Menu.Item key={item.name}>
                    {({ active }) => (
                      <Link
                        to={item.href}
                        onClick={item.onClick}
                        className={`${
                          active ? 'bg-white/5' : ''
                        } ${
                          item.className || 'text-white/90'
                        } group flex items-center gap-2 px-4 py-2 text-sm`}
                      >
                        <item.icon className="w-4 h-4" />
                        {item.name}
                      </Link>
                    )}
                  </Menu.Item>
                ))}
              </Menu.Items>
            </Menu>
          </div>
        </div>
      </div>
    </header>
  );
}