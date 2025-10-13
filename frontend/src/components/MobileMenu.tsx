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
          <div className="min-h-full bg-white w-full">
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
                <div className="border-b border-gray-200 px-4 py-4 flex items-center justify-between">
                  <Dialog.Title className="text-lg font-semibold text-gray-900">
                    Menu
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
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
                    <div>
                      <div className="mb-2">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          {user ? 'Main Menu' : 'Navigation'}
                        </h3>
                      </div>
                      <div className="space-y-1">
                        {(user ? navigation.private : navigation.public).map((item) => {
                          const isActive = window.location.pathname === item.href;
                          return (
                            <Link
                              key={item.name}
                              to={item.href}
                              onClick={onClose}
                              className={cn(
                                'block px-4 py-2 text-base font-medium',
                                isActive
                                  ? 'text-accent-500'
                                  : 'text-gray-900 hover:text-accent-500',
                                'transition-colors'
                              )}
                            >
                              {item.name}
                            </Link>
                          );
                        })}
                      </div>
                    </div>

                    {/* User Menu (only for logged in users) */}
                    {user && (
                      <div>
                        <div className="mb-2">
                          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                            Account
                          </h3>
                        </div>
                        <div className="space-y-1">
                          {navigation.userMenu.map((item) => {
                            const isActive = window.location.pathname === item.href;
                            return (
                              <Link
                                key={item.name}
                                to={item.href}
                                onClick={onClose}
                                className={cn(
                                  'block px-4 py-2 text-base font-medium',
                                  isActive
                                    ? 'text-accent-500'
                                    : 'text-gray-900 hover:text-accent-500',
                                  'transition-colors'
                                )}
                              >
                                {item.name}
                              </Link>
                            );
                          })}
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