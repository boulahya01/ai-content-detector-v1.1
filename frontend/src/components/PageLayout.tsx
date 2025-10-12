import { ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  description?: string;
  actions?: ReactNode;
  wide?: boolean;
  center?: boolean;
  sidebar?: ReactNode;
  className?: string;
}

export function PageLayout({
  children,
  title,
  description,
  actions,
  wide = false,
  sidebar,
  center = false,
  className,
}: PageLayoutProps) {
  return (
    <div className={cn('min-h-screen', className)}>
      <main className="pt-12 pb-16">
        <div className={cn('mx-auto px-4', wide ? 'max-w-7xl' : 'max-w-4xl')}>
          {title && (
            <header className={cn('mb-8', center ? 'text-center' : '')}>
              <h1
                className={cn(
                  'text-4xl sm:text-5xl font-heading font-extrabold tracking-tight mb-3 drop-shadow-lg',
                  center ? 'mx-auto' : ''
                )}
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                {title}
              </h1>
              {description && (
                <p
                  className={cn(
                    'text-lg sm:text-xl text-[color:var(--muted-300)] font-heading font-semibold mt-2 drop-shadow',
                    center ? 'mx-auto' : ''
                  )}
                  style={{ fontFamily: 'var(--font-heading)' }}
                >
                  {description}
                </p>
              )}
            </header>
          )}

          {actions && <div className="mb-6">{actions}</div>}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className={cn(wide ? 'lg:col-span-4' : 'lg:col-span-3')}>{children}</div>
            {sidebar ? <aside className="hidden lg:block lg:col-span-1">{sidebar}</aside> : null}
          </div>
        </div>
      </main>
    </div>
  );
}