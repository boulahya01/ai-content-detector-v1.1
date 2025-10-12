import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation, Outlet } from 'react-router-dom';
import LogoutButton from './auth/LogoutButton';
import { cn } from '@/utils/cn';
import Logo from '@/components/ui/Logo';
import { Breadcrumb } from './ui/Breadcrumb';
import { MobileMenu } from './MobileMenu';

const navigation = {
  main: [
    { name: 'Home', href: '/', public: true },
    { name: 'Services', href: '/services', public: true },
    { name: 'Pricing', href: '/pricing', public: true },
    { name: 'About', href: '/about', public: true },
    { name: 'Credits', href: '/credits', public: true },
    { name: 'Profile', href: '/profile', public: true },
  ],
  authenticated: [],
  analysis: [],
  account: [],
  footer: {
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
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <nav className="bg-black border-b border-white/10 fixed w-full top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                <Link to="/" className="flex items-center space-x-3 group">
                  <Logo className="w-16 h-16 md:w-20 md:h-20 text-white" />
                  <span className="text-sm md:text-2xl font-extrabold text-white">The Detector</span>
                </Link>
              </div>

              {/* Desktop Main Navigation */}
              <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
                {navigation.main.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={cn(
                        'px-3 py-2 text-sm font-medium rounded-xl transition-colors',
                        'hover:bg-white/10',
                        isActive
                          ? 'bg-white/10 text-white'
                          : 'text-white/70'
                      )}
                      title={item.description}
                    >
                      {item.name}
                    </Link>
                  );
                })}

                {user && (
                  <>
                    {navigation.authenticated.map((item) => {
                      const isActive = location.pathname === item.href;
                      return (
                        <Link
                          key={item.name}
                          to={item.href}
                          className={cn(
                            'px-3 py-2 text-sm font-medium rounded-md transition-all duration-200',
                            'hover:bg-primary-50 hover:text-primary-600',
                            isActive
                              ? 'bg-primary-50 text-primary-600'
                              : 'text-gray-600'
                          )}
                          title={item.description}
                        >
                          {item.name}
                        </Link>
                      );
                    })}
                  </>
                )}
              </div>
            </div>

            {/* Right side menu */}
            <div className="flex items-center space-x-4">
              {user ? (
                <div className="flex items-center space-x-6">
                  {/* Credits Badge */}
                  <div className="hidden md:flex items-center">
                    <div className="px-3 py-1.5 rounded-xl border border-white/10 transition-colors hover:border-white/20">
                      <span className="text-sm font-medium text-white">
                        {user.credits || 0} Credits
                      </span>
                    </div>
                  </div>

                  {/* Quick Analysis Button */}
                  <Link
                    to="/analyze"
                    className="hidden md:inline-flex items-center px-4 py-2 bg-white
                              text-sm font-medium text-black rounded-xl
                              hover:bg-white/90 
                              focus:outline-none focus:ring-2 focus:ring-white
                              transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    New Analysis
                  </Link>

                  {/* User Menu */}
                  <div className="relative group">
                    <button 
                      className="flex items-center space-x-2 group"
                      aria-expanded="false"
                    >
                      <div className="flex items-center">
                        <img
                          src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=e0e7ff&color=4f46e5`}
                          alt={user.name}
                          className="h-8 w-8 rounded-full ring-2 ring-white transition-shadow duration-200 group-hover:ring-primary-100"
                        />
                        <svg className="w-5 h-5 ml-1 text-gray-400 transition-colors duration-200 group-hover:text-primary-500" 
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
                            className="group flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-primary-50 hover:text-primary-600"
                            title={item.description}
                          >
                            <span className="w-4 h-4 mr-3 text-gray-400 group-hover:text-primary-500">
                              {/* Icon component based on item.icon */}
                            </span>
                            {item.name}
                          </Link>
                        ))}
                      </div>

                      <div className="py-1 border-t border-gray-100">
                        <button
                          onClick={logout}
                          className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600"
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
                <div className="flex items-center space-x-3">
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-white/70
                              hover:text-white transition-colors"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register"
                    className="inline-flex items-center px-4 py-2 border border-white text-sm font-medium rounded-xl 
                              text-white hover:bg-white/10
                              focus:outline-none focus:ring-2 focus:ring-white
                              transition-colors"
                  >
                    Sign up
                  </Link>
                  <Link
                    to="/analyze"
                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl text-black 
                              bg-white
                              hover:bg-white/90
                              focus:outline-none focus:ring-2 focus:ring-white
                              transition-colors"
                  >
                    <svg className="w-4 h-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Try it Free
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
            {navigation.main.slice(0,4).map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex flex-col items-center justify-center py-2 px-1 rounded-xl text-xs transition-colors',
                  location.pathname === item.href
                    ? 'text-white bg-white/10'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
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
          {/* Breadcrumb */}
          <div className="py-4">
            <Breadcrumb />
          </div>
          
          {/* Page Content */}
          <div className="pb-8">
            <Outlet />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Footer Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
            {/* Brand Column */}
            <div className="md:col-span-5 space-y-8">
              <Link to="/" className="flex items-center space-x-3 group">
                <div className="bg-white text-black p-2.5 rounded-xl transition-colors group-hover:bg-opacity-90">
                  <span className="text-xl font-bold">AI</span>
                </div>
                <span className="text-2xl font-bold text-white group-hover:text-white/90">
                  Detector
                </span>
              </Link>
              <p className="text-white/60 text-base leading-relaxed max-w-md">
                Our AI content detection tool helps you identify machine-generated content 
                with high accuracy. Perfect for content managers, educators, and publishers.
              </p>
              {/* Social Links */}
              <div className="flex space-x-4">
                {navigation.footer.social.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-white/40 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
                  >
                    <span className="sr-only">{item.name}</span>
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      {item.icon === 'twitter' && (
                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                      )}
                      {item.icon === 'github' && (
                        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      )}
                      {item.icon === 'linkedin' && (
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.784 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                      )}
                    </svg>
                  </a>
                ))}
              </div>
            </div>
            
            {/* Quick Links */}
            <div className="md:col-span-2">
              <h3 className="text-white font-semibold mb-4 text-base">Quick Links</h3>
              <ul className="space-y-3">
                {navigation.footer.product.map((item) => (
                  <li key={item.name}>
                    <Link 
                      to={item.href} 
                      className="text-white/60 hover:text-white transition-colors text-sm"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company */}
            <div className="md:col-span-2">
              <h3 className="text-white font-semibold mb-4 text-base">Company</h3>
              <ul className="space-y-3">
                {navigation.footer.company.map((item) => (
                  <li key={item.name}>
                    <Link 
                      to={item.href} 
                      className="text-white/60 hover:text-white transition-colors text-sm"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div className="md:col-span-3">
              <h3 className="text-white font-semibold mb-4 text-base">Legal</h3>
              <ul className="space-y-3">
                {navigation.footer.legal.map((item) => (
                  <li key={item.name}>
                    <Link 
                      to={item.href} 
                      className="text-white/60 hover:text-white transition-colors text-sm"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-white/10 mt-12 pt-8">
            <p className="text-center text-white/40 text-sm">
              © {new Date().getFullYear()} AI Content Detector. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}