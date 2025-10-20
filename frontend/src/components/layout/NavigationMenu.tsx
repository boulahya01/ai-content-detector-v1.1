import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import {
  FiHome,
  FiFileText,
  FiClock,
  FiSettings,
  FiBook,
  FiTrendingUp,
  FiZap,
  FiChevronRight,
  FiMenu,
  FiX
} from 'react-icons/fi';
import { useState } from 'react';

const publicNavItems = [
  {
    title: "Home",
    href: "/",
    icon: FiHome,
  },
  {
    title: "Analyze",
    href: "/analyze",
    icon: FiFileText,
  },
  {
    title: "Pricing",
    href: "/pricing",
    icon: FiZap,
  },
  {
    title: "About",
    href: "/about",
    icon: FiBook,
  },
];

const authenticatedNavItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: FiHome,
  },
  {
    title: "Analysis",
    href: "/analysis",
    icon: FiFileText,
  },
  {
    title: "History",
    href: "/history",
    icon: FiClock,
  },
  {
    title: "Analytics",
    href: "/dashboard",
    icon: FiTrendingUp,
    isPro: true,
  },
  {
    title: "Documentation",
    href: "/docs",
    icon: FiBook,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: FiSettings,
  },
];

export function NavigationMenu() {
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const navItems = isAuthenticated ? authenticatedNavItems : publicNavItems;

  if (!isAuthenticated) {
    return (
      <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "transition-colors hover:text-foreground/80",
              location.pathname === item.href
                ? "text-foreground"
                : "text-foreground/60"
            )}
          >
            {item.title}
          </Link>
        ))}
      </nav>
    );
  }

  return (
    <>
      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-gray-800 text-white/70 hover:text-white lg:hidden"
      >
        {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {/* Navigation Sidebar */}
      <nav
        className={cn(
          'fixed inset-y-0 left-0 w-64 bg-gray-900/95 backdrop-blur-xl border-r border-white/10',
          'transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static',
          'flex flex-col z-40',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-white/10">
          <Link to="/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-accent-500 flex items-center justify-center">
              <FiZap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white">AI Detector</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            const isProFeature = item.isPro && (!user?.role || user.role === 'free');

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors relative group',
                  isActive
                    ? 'bg-accent-500/20 text-accent-300'
                    : 'text-white/70 hover:text-white hover:bg-white/5'
                )}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </div>
                {isProFeature && (
                  <span className="px-1.5 py-0.5 text-xs font-medium text-accent-300 bg-accent-500/20 rounded">
                    PRO
                  </span>
                )}
                <FiChevronRight
                  className={cn(
                    'w-4 h-4 absolute right-2 transition-transform',
                    'opacity-0 group-hover:opacity-100',
                    isActive ? 'opacity-100' : ''
                  )}
                />
              </Link>
            );
          })}
        </div>

        {/* User Stats */}
        {isAuthenticated && (
          <div className="p-4 border-t border-white/10">
            <div className="p-3 rounded-lg bg-white/5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">Credits</span>
                <span className="font-medium text-white">{user?.credits || 0}</span>
              </div>
              <div className="mt-3">
                <div className="h-2 rounded-full bg-white/10">
                  <div
                    className="h-2 rounded-full bg-accent-500"
                    style={{ width: '60%' }}
                  />
                </div>
                <p className="mt-2 text-xs text-white/60">
                  {user?.credits || 0} credits remaining this month
                </p>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}