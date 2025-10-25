import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation, Outlet } from 'react-router-dom';
import LogoutButton from './auth/LogoutButton';
import { cn } from '@/utils/cn';
import Logo from '@/components/ui/Logo';
import { MobileMenu } from './MobileMenu';
import { Header } from '@/components/layout/Header';

const navigation = {
  public: [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Pricing', href: '/pricing' },
  ],
  private: [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Analysis', href: '/analysis' },
    { name: 'History', href: '/history' },
  ],
  account: [
    { 
      name: 'Profile',
      href: '/profile',
      description: 'View and edit your profile',
      icon: 'user'
    },
    {
      name: 'Settings',
      href: '/settings',
      description: 'Manage your preferences',
      icon: 'settings'
    },
    {
      name: 'API Keys',
      href: '/api-keys',
      description: 'Manage your API keys',
      icon: 'key'
    },
    {
      name: 'Billing',
      href: '/billing',
      description: 'Manage your subscription',
      icon: 'credit-card'
    },
  ],
  userMenu: [
    { name: 'Profile', href: '/profile' },
    { name: 'Settings', href: '/settings' },
    { name: 'API Keys', href: '/api-keys' },
    { name: 'Billing', href: '/billing' },
  ],
  footer: {
    forEveryone: [
      { name: 'Home', href: '/' },
      { name: 'About Us', href: '/about' },
      { name: 'How It Works', href: '/how-it-works' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'Contact', href: '/contact' }
    ],
    advanced: [
      { name: 'AI Detection API', href: '/api-docs', requiresAuth: true },
      { name: 'Bulk Analysis', href: '/bulk-analysis', requiresAuth: true },
      { name: 'Custom Integration', href: '/integration', requiresAuth: true },
      { name: 'Enterprise Solutions', href: '/enterprise' },
      { name: 'Developer Docs', href: '/docs', requiresAuth: true }
    ],
    userFeatures: [
      { name: 'Dashboard', href: '/dashboard', requiresAuth: true },
      { name: 'Analysis', href: '/analysis', requiresAuth: true },
      { name: 'History', href: '/history', requiresAuth: true },
      { name: 'API Keys', href: '/api-keys', requiresAuth: true },
      { name: 'Usage Stats', href: '/dashboard', requiresAuth: true }
    ],
    resources: [
      { name: 'Documentation', href: '/documentation' },
      { name: 'API Guidelines', href: '/api-guidelines', requiresAuth: true },
      { name: 'Best Practices', href: '/best-practices' },
      { name: 'Case Studies', href: '/case-studies' },
      { name: 'Integration Examples', href: '/examples', requiresAuth: true }
    ],
    product: [
      { name: 'Features', href: '/features' },
      { name: 'Pricing', href: '/pricing' },
      { name: 'API', href: '/api-access' },
      { name: 'Documentation', href: '/docs' }
    ],
    company: [
      { name: 'About', href: '/about' },
      { name: 'Blog', href: '/blog' },
      { name: 'Contact', href: '/contact' },
      { name: 'Careers', href: '/careers' }
    ],
    legal: [
      { name: 'Privacy', href: '/privacy' },
      { name: 'Terms', href: '/terms' },
      { name: 'Security', href: '/security' },
      { name: 'Cookies', href: '/cookies' }
    ],
    social: [
      { name: 'Twitter', href: '#', icon: 'twitter' },
      { name: 'GitHub', href: '#', icon: 'github' },
      { name: 'LinkedIn', href: '#', icon: 'linkedin' }
    ]
  }
};

export function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen text-foreground bg-background overflow-hidden">
      <Header />

      {/* Mobile Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 backdrop-blur-lg">
        <div className="grid grid-cols-5 gap-1 px-2 py-1">
          <Link
            to="/dashboard"
            className={cn(
              'flex flex-col items-center justify-center py-2 px-1 text-xs transition-colors',
              location.pathname === '/dashboard'
                ? 'text-accent-500'
                : 'text-white/70 hover:text-white'
            )}
          >
            <svg className="w-5 h-5 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            <span className="font-medium">Dashboard</span>
          </Link>

          <Link
            to="/analysis"
            className={cn(
              'flex flex-col items-center justify-center py-2 px-1 text-xs transition-colors',
              location.pathname.startsWith('/analysis')
                ? 'text-accent-500'
                : 'text-white/70 hover:text-white'
            )}
          >
            <svg className="w-5 h-5 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 3v2m0 14v2M9 17l-2 2m10 0l2-2M3 12h2m14 0h2M7 7L5 5m14 0l-2 2" />
            </svg>
            <span className="font-medium">Analyze</span>
          </Link>

          <Link
            to="/analysis/history"
            className={cn(
              'flex flex-col items-center justify-center py-2 px-1 text-xs transition-colors',
              location.pathname === '/analysis/history'
                ? 'text-accent-500'
                : 'text-white/70 hover:text-white'
            )}
          >
            <svg className="w-5 h-5 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">History</span>
          </Link>

          <Link
            to="/docs"
            className={cn(
              'flex flex-col items-center justify-center py-2 px-1 text-xs transition-colors',
              location.pathname.startsWith('/docs')
                ? 'text-accent-500'
                : 'text-white/70 hover:text-white'
            )}
          >
            <svg className="w-5 h-5 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <span className="font-medium">Docs</span>
          </Link>

          <button
            onClick={() => setMobileMenuOpen(true)}
            className="flex flex-col items-center justify-center py-2 px-1 text-xs text-white/70 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
            <span className="font-medium">Menu</span>
          </button>
        </div>
        </div>

      {/* Mobile Menu Dialog */}
      <MobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        navigation={navigation}
        user={user}
      />

      {/* Main content */}
      <main className="pt-16 pb-20 md:pb-8 min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Content */}
          <div className="pb-8">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-card/50 border-t border-border backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Main Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            {/* For Everyone */}
            <div>
              <h3 className="text-white font-semibold mb-6 text-lg">For Everyone</h3>
              <ul className="space-y-4">
                {navigation.footer.forEveryone.map((item) => (
                  <li key={item.name}>
                    <Link 
                      to={item.href} 
                      className="text-white/60 hover:text-accent-300 transition-colors text-sm"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Advanced Features */}
            <div>
              <h3 className="text-white font-semibold mb-6 text-lg">Advanced Features</h3>
              <ul className="space-y-4">
                {navigation.footer.advanced.map((item) => (
                  <li key={item.name}>
                    <Link 
                      to={item.requiresAuth ? '/login' : item.href}
                      className={cn(
                        "text-sm transition-colors",
                        item.requiresAuth 
                          ? "text-white/40 hover:text-accent-300 cursor-pointer" 
                          : "text-white/60 hover:text-accent-300"
                      )}
                    >
                      {item.name}
                      {item.requiresAuth && (
                        <span className="ml-2 text-accent-500 text-xs">Login Required</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* User Features */}
            <div>
              <h3 className="text-white font-semibold mb-6 text-lg">User Features</h3>
              <ul className="space-y-4">
                {navigation.footer.userFeatures.map((item) => (
                  <li key={item.name}>
                    <Link 
                      to={item.requiresAuth ? '/login' : item.href}
                      className={cn(
                        "text-sm transition-colors",
                        item.requiresAuth 
                          ? "text-white/40 hover:text-accent-300 cursor-pointer" 
                          : "text-white/60 hover:text-accent-300"
                      )}
                    >
                      {item.name}
                      {item.requiresAuth && (
                        <span className="ml-2 text-accent-500 text-xs">Login Required</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-white font-semibold mb-6 text-lg">Resources</h3>
              <ul className="space-y-4">
                {navigation.footer.resources.map((item) => (
                  <li key={item.name}>
                    <Link 
                      to={item.requiresAuth ? '/login' : item.href}
                      className={cn(
                        "text-sm transition-colors",
                        item.requiresAuth 
                          ? "text-white/40 hover:text-accent-300 cursor-pointer" 
                          : "text-white/60 hover:text-accent-300"
                      )}
                    >
                      {item.name}
                      {item.requiresAuth && (
                        <span className="ml-2 text-accent-500 text-xs">Login Required</span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom Footer */}
          <div className="border-t border-accent-500/10 pt-8">
            <div className="grid grid-cols-3 gap-8 items-center">
              {/* Social Icons */}
              <div className="flex space-x-6">
                <a href="#" className="text-white/40 hover:text-accent-300 transition-colors">
                  <span className="sr-only">Twitter</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-white/40 hover:text-accent-300 transition-colors">
                  <span className="sr-only">GitHub</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                  </svg>
                </a>
                <a href="#" className="text-white/40 hover:text-accent-300 transition-colors">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.784 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                  </svg>
                </a>
              </div>

              {/* Center Logo */}
              <div className="flex justify-center items-center">
                <Link to="/" className="group inline-flex items-center">
                  <Logo className="w-36 h-36 text-accent-500 transition-colors group-hover:text-accent-400" />
                  <div className="ml-1 flex flex-col justify-center h-36">
                    <div className="text-5xl font-bold leading-[1.1] tracking-tight text-white group-hover:text-accent-300 transition-colors">
                      THE AI
                    </div>
                    <div className="text-5xl font-bold leading-[1.1] mt-2 tracking-tight text-white group-hover:text-accent-300 transition-colors">
                      DETECTOR
                    </div>
                  </div>
                </Link>
              </div>

              {/* Copyright */}
              <div className="text-right">
                <p className="text-white/40 text-sm">
                  © {new Date().getFullYear()} THE AI Detector
                </p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}