import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/utils/cn';

interface BreadcrumbItem {
  label: string;
  path: string;
}

function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const paths = pathname.split('/').filter(Boolean);
  let currentPath = '';
  
  return paths.map(path => {
    currentPath += `/${path}`;
    return {
      label: path.charAt(0).toUpperCase() + path.slice(1).replace(/-/g, ' '),
      path: currentPath
    };
  });
}

export function Breadcrumb() {
  const location = useLocation();
  const items = generateBreadcrumbs(location.pathname);
  
  if (items.length === 0) return null;

  return (
    <nav className="flex mb-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center space-x-1 text-sm">
        <li>
          <Link
            to="/"
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            Home
          </Link>
        </li>
        
        {items.map((item, index) => (
          <li key={item.path} className="flex items-center">
            <svg
              className="w-4 h-4 text-gray-400 mx-1"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
            <Link
              to={item.path}
              className={cn(
                'hover:text-gray-700 transition-colors',
                index === items.length - 1
                  ? 'text-gray-900 font-medium'
                  : 'text-gray-500'
              )}
              aria-current={index === items.length - 1 ? 'page' : undefined}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}