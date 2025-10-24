import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Link } from 'react-router-dom';
import { cn } from '@/utils/cn';

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  navigation: {
    public: Array<{ name: string; href: string; }>;
    private: Array<{ name: string; href: string; }>;
    userMenu: Array<{ name: string; href: string; }>;
    footer: {
      forEveryone: Array<{ name: string; href: string; }>;
      advanced: Array<{ name: string; href: string; requiresAuth?: boolean; }>;
      userFeatures: Array<{ name: string; href: string; requiresAuth?: boolean; }>;
      resources: Array<{ name: string; href: string; requiresAuth?: boolean; }>;
    };
  };
  user: any | null;
}

export function MobileMenu({ isOpen, onClose, navigation, user }: MobileMenuProps) {
  const [activeSection, setActiveSection] = useState('main');

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="min-h-full bg-gray-900/95 w-full backdrop-blur-xl">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4"
              enterTo="opacity-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-4"
            >
              <Dialog.Panel className="w-full h-full">
                {/* Header */}
                <div className="border-b border-white/10 px-4 py-4 flex items-center justify-between">
                  <Dialog.Title className="text-lg font-semibold text-white/90">
                    Menu
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md bg-transparent text-white/60 hover:text-white"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close menu</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Navigation Sections */}
                <div className="px-4 py-6">
                  <div className="space-y-8">
                    {user ? (
                      <>
                        {/* Main Navigation */}
                        <div>
                          <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider px-4 mb-4">
                            Main
                          </h3>
                          <div className="space-y-1">
                            <Link
                              to="/dashboard"
                              onClick={onClose}
                              className="flex items-center px-4 py-3 text-base font-medium text-white/80 hover:text-accent-500 hover:bg-white/5 rounded-lg transition-colors"
                            >
                              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="7" height="7" />
                                <rect x="14" y="3" width="7" height="7" />
                                <rect x="14" y="14" width="7" height="7" />
                                <rect x="3" y="14" width="7" height="7" />
                              </svg>
                              Dashboard
                            </Link>
                            <Link
                              to="/analysis"
                              onClick={onClose}
                              className="flex items-center px-4 py-3 text-base font-medium text-white/80 hover:text-accent-500 hover:bg-white/5 rounded-lg transition-colors"
                            >
                              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 3v2m0 14v2M9 17l-2 2m10 0l2-2M3 12h2m14 0h2M7 7L5 5m14 0l-2 2" />
                              </svg>
                              Analysis
                            </Link>
                            <Link
                              to="/analysis/history"
                              onClick={onClose}
                              className="flex items-center px-4 py-3 text-base font-medium text-white/80 hover:text-accent-500 hover:bg-white/5 rounded-lg transition-colors"
                            >
                              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              History
                            </Link>
                          </div>
                        </div>

                        {/* Account Settings */}
                        <div>
                          <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider px-4 mb-4">
                            Account
                          </h3>
                          <div className="space-y-1">
                            <Link
                              to="/account/profile"
                              onClick={onClose}
                              className="flex items-center px-4 py-3 text-base font-medium text-white/80 hover:text-accent-500 hover:bg-white/5 rounded-lg transition-colors"
                            >
                              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Profile
                            </Link>
                            <Link
                              to="/account/billing"
                              onClick={onClose}
                              className="flex items-center px-4 py-3 text-base font-medium text-white/80 hover:text-accent-500 hover:bg-white/5 rounded-lg transition-colors"
                            >
                              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                              </svg>
                              Billing
                            </Link>
                            <Link
                              to="/account/api-keys"
                              onClick={onClose}
                              className="flex items-center px-4 py-3 text-base font-medium text-white/80 hover:text-accent-500 hover:bg-white/5 rounded-lg transition-colors"
                            >
                              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                              </svg>
                              API Keys
                            </Link>
                            <Link
                              to="/account/settings"
                              onClick={onClose}
                              className="flex items-center px-4 py-3 text-base font-medium text-white/80 hover:text-accent-500 hover:bg-white/5 rounded-lg transition-colors"
                            >
                              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              Settings
                            </Link>
                          </div>
                        </div>

                        {/* Resources */}
                        <div>
                          <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider px-4 mb-4">
                            Resources
                          </h3>
                          <div className="space-y-1">
                            <Link
                              to="/docs"
                              onClick={onClose}
                              className="flex items-center px-4 py-3 text-base font-medium text-white/80 hover:text-accent-500 hover:bg-white/5 rounded-lg transition-colors"
                            >
                              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                              </svg>
                              Documentation
                            </Link>
                            <Link
                              to="/api-docs"
                              onClick={onClose}
                              className="flex items-center px-4 py-3 text-base font-medium text-white/80 hover:text-accent-500 hover:bg-white/5 rounded-lg transition-colors"
                            >
                              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                              </svg>
                              API Documentation
                            </Link>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* Public Navigation */}
                        <div className="space-y-1">
                          <Link
                            to="/"
                            onClick={onClose}
                            className="flex items-center px-4 py-3 text-base font-medium text-white/80 hover:text-accent-500 hover:bg-white/5 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Home
                          </Link>
                          <Link
                            to="/pricing"
                            onClick={onClose}
                            className="flex items-center px-4 py-3 text-base font-medium text-white/80 hover:text-accent-500 hover:bg-white/5 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Pricing
                          </Link>
                          <Link
                            to="/docs"
                            onClick={onClose}
                            className="flex items-center px-4 py-3 text-base font-medium text-white/80 hover:text-accent-500 hover:bg-white/5 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            Documentation
                          </Link>
                          <Link
                            to="/about"
                            onClick={onClose}
                            className="flex items-center px-4 py-3 text-base font-medium text-white/80 hover:text-accent-500 hover:bg-white/5 rounded-lg transition-colors"
                          >
                            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            About
                          </Link>
                        </div>

                        {/* Authentication */}
                        <div>
                          <h3 className="text-xs font-semibold text-white/60 uppercase tracking-wider px-4 mb-4">
                            Account
                          </h3>
                          <div className="space-y-1">
                            <Link
                              to="/login"
                              onClick={onClose}
                              className="flex items-center px-4 py-3 text-base font-medium text-white/80 hover:text-accent-500 hover:bg-white/5 rounded-lg transition-colors"
                            >
                              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                              </svg>
                              Sign In
                            </Link>
                            <Link
                              to="/register"
                              onClick={onClose}
                              className="flex items-center px-4 py-3 text-base font-medium text-white/80 hover:text-accent-500 hover:bg-white/5 rounded-lg transition-colors"
                            >
                              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Sign Up
                            </Link>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}