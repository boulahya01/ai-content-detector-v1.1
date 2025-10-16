import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation, Outlet } from 'react-router-dom';
import LogoutButton from './auth/LogoutButton';
import { cn } from '@/utils/cn';
import Logo from '@/components/ui/Logo';
import { MobileMenu } from './MobileMenu';

const navigation = {
  public: [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Pricing', href: '/pricing' },
  ],
  private: [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Analyze', href: '/analyze' },
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
      { name: 'Analysis History', href: '/history', requiresAuth: true },
      { name: 'API Keys', href: '/api-keys', requiresAuth: true },
      { name: 'Usage Stats', href: '/stats', requiresAuth: true },
      { name: 'Custom Reports', href: '/reports', requiresAuth: true }
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
    <div className="min-h-screen text-white overflow-hidden" style={{ background: 'var(--bg-page)' }}>
      {/* Navigation */}
            {/* Navigation */}
      <nav className="bg-black fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Left section - Logo */}
            <div className="flex items-center">
              <Link to="/" className="group inline-flex items-center h-16">
                <Logo className="h-14 w-14 text-accent-500 transition-colors group-hover:text-accent-400" />
                <div className="ml-2 flex flex-col justify-center">
                  <div className="text-base font-bold leading-none tracking-wide text-white group-hover:text-accent-300 transition-colors">
                    THE AI
                  </div>
                  <div className="text-base font-bold leading-none mt-1 tracking-wide text-white group-hover:text-accent-300 transition-colors">
                    DETECTOR
                  </div>
                </div>
              </Link>
            </div>

            {/* Center section - Navigation */}
            <div className="hidden md:flex items-center justify-center flex-1 px-8 gap-8">
              {user ? (
                // Private navigation
                navigation.private.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        'text-sm transition-colors',
                        isActive
                          ? 'text-accent-500 font-semibold'
                          : 'text-white/70 hover:text-white font-medium'
                      )}
                    >
                      {item.name}
                    </Link>
                  );
                })
              ) : (
                // Public navigation
                navigation.public.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        'text-sm transition-colors',
                        isActive
                          ? 'text-accent-500 font-semibold'
                          : 'text-white/70 hover:text-white font-medium'
                      )}
                    >
                      {item.name}
                    </Link>
                  );
                })
              )}
            </div>

            {/* Right side menu */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-4">
                  {/* Credits Badge */}
                  <div className="hidden md:flex items-center">
                    <div className="px-3 py-1.5 rounded-lg bg-accent-500/10 border border-accent-500/20 text-sm font-medium text-accent-300">
                      {user?.credits || 0} Credits
                    </div>
                  </div>

                  {/* Quick Analysis Button */}
                  <Link
                    to="/analyze"
                    className="hidden md:inline-flex items-center px-4 py-2 
                              text-sm font-medium rounded-lg
                              bg-accent-500 text-white
                              hover:bg-accent-600
                              focus:outline-none focus:ring-2 focus:ring-accent-500/50
                              transition-all"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    New Analysis
                  </Link>

                  {/* User Menu */}
                  <div className="relative group">
                    <button 
                      className="flex items-center space-x-2 group rounded-xl 
                                p-1 transition-all duration-200
                                hover:bg-accent-500/10"
                      aria-expanded="false"
                    >
                      <div className="flex items-center">
                        <img
                          src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=e2ccff&color=862ad6`}
                          alt={user.name}
                          className="h-9 w-9 rounded-lg ring-2 ring-accent-500/20 transition-all duration-200 
                                   group-hover:ring-accent-500/40 group-hover:shadow-lg group-hover:shadow-accent-500/10"
                        />
                        <svg className="w-5 h-5 ml-2 text-accent-300/70 transition-colors duration-200 group-hover:text-accent-300" 
                             viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </button>

                    {/* User Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-1 z-50 
                                  opacity-0 invisible transform scale-95 -translate-y-2
                                  group-hover:opacity-100 group-hover:visible group-hover:scale-100 group-hover:translate-y-0
                                  transition-all duration-200">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>

                      <div className="py-1">
                        {navigation.account.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-accent-200/10 hover:text-accent-500"
                            title={item.description}
                          >
                            <span className="w-4 h-4 mr-3 text-gray-400 group-hover:text-accent-500">
                              {item.icon === 'user' && (
                                <svg viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                </svg>
                              )}
                              {item.icon === 'settings' && (
                                <svg viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                                </svg>
                              )}
                              {item.icon === 'key' && (
                                <svg viewBox="0 0 20 20" fill="currentColor">
                                  <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z" clipRule="evenodd" />
                                </svg>
                              )}
                              {item.icon === 'credit-card' && (
                                <svg viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                                </svg>
                              )}
                            </span>
                            {item.name}
                          </Link>
                        ))}
                      </div>

                      <div className="py-1 border-t border-gray-100">
                        <button
                          onClick={logout}
                          className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-accent-200/10 hover:text-accent-500"
                        >
                          <svg className="w-4 h-4 mr-3 text-gray-400 group-hover:text-red-500" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
                          </svg>
                          Sign out
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4">
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium 
                              text-white/70 hover:text-white
                              transition-colors"
                  >
                    Log in
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg
                              bg-accent-500 text-white
                              hover:bg-accent-600
                              focus:outline-none
                              transition-colors"
                  >
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-black border-t border-white/10 z-40">
        <div className="grid grid-cols-4 gap-1 p-2">
            {(user ? navigation.private : navigation.public).map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex flex-col items-center justify-center py-2 px-1 text-xs transition-colors',
                  location.pathname === item.href
                    ? 'text-accent-500'
                    : 'text-white/70 hover:text-white'
                )}
              >
                <span className="font-medium">{item.name}</span>
              </Link>
            ))}

            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex flex-col items-center justify-center py-2 px-1 rounded-md text-xs text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
            >
              <svg className="w-5 h-5 mb-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
              </svg>
              <span className="font-medium">Menu</span>
            </button>
          </div>

        {/* Mobile Quick Action Button */}
        <div className="fixed right-4 bottom-20">
          <Link
            to="/analyze"
            className="flex items-center justify-center w-12 h-12 rounded-full 
                      bg-white text-black shadow-lg 
                      hover:bg-white/90
                      focus:outline-none focus:ring-2 focus:ring-white
                      transition-colors"
          >
            <svg className="w-6 h-6" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </Link>
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
      <main className="pt-16 pb-20 md:pb-8 min-h-screen bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Content */}
          <div className="pb-8">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-accent-500/10">
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