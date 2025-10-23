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
                  <div className="space-y-6">
                    {/* Main Navigation */}
                    <div className="space-y-1">
                      <Link
                        to="/dashboard"
                        onClick={onClose}
                        className="block px-4 py-2 text-base font-medium text-gray-900 hover:text-accent-500 transition-colors"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/analysis/new"
                        onClick={onClose}
                        className="block px-4 py-2 text-base font-medium text-gray-900 hover:text-accent-500 transition-colors"
                      >
                        Analysis
                      </Link>
                      <Link
                        to="/analysis/history"
                        onClick={onClose}
                        className="block px-4 py-2 text-base font-medium text-gray-900 hover:text-accent-500 transition-colors"
                      >
                        History
                      </Link>
                    </div>

                    {/* Account Settings */}
                    {user && (
                      <div>
                        <div className="mb-2">
                          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4">
                            Account
                          </h3>
                        </div>
                        <div className="space-y-1">
                          <Link
                            to="/profile"
                            onClick={onClose}
                            className="block px-4 py-2 text-base font-medium text-gray-900 hover:text-accent-500 transition-colors"
                          >
                            Profile
                          </Link>
                          <Link
                            to="/settings"
                            onClick={onClose}
                            className="block px-4 py-2 text-base font-medium text-gray-900 hover:text-accent-500 transition-colors"
                          >
                            Settings
                          </Link>
                        </div>
                      </div>
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