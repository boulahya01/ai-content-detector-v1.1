export { Header } from '@/components/layout/Header';
export default Header;
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