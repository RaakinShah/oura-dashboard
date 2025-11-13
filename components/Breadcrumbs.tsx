'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

export function Breadcrumbs() {
  const pathname = usePathname();

  // Don't show on home page
  if (pathname === '/') return null;

  const pathSegments = pathname.split('/').filter(Boolean);

  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = '/' + pathSegments.slice(0, index + 1).join('/');
    const label = segment
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return { href, label };
  });

  return (
    <nav className="flex items-center gap-2 text-sm mb-8" aria-label="Breadcrumb">
      <Link
        href="/"
        className="flex items-center gap-1 text-stone-500 hover:text-stone-900 transition-colors"
      >
        <Home className="h-4 w-4" />
        <span className="hidden sm:inline">Home</span>
      </Link>

      {breadcrumbs.map((crumb, index) => {
        const isLast = index === breadcrumbs.length - 1;

        return (
          <div key={crumb.href} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-stone-400" />
            {isLast ? (
              <span className="text-stone-900 font-medium">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="text-stone-500 hover:text-stone-900 transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
}
