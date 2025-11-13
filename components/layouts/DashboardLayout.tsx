import { ReactNode } from 'react';

export interface DashboardLayoutProps {
  header?: ReactNode;
  sidebar?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  sidebarWidth?: number;
  sidebarPosition?: 'left' | 'right';
  stickyHeader?: boolean;
  stickyFooter?: boolean;
  className?: string;
}

export function DashboardLayout({
  header,
  sidebar,
  children,
  footer,
  sidebarWidth = 280,
  sidebarPosition = 'left',
  stickyHeader = true,
  stickyFooter = false,
  className = '',
}: DashboardLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col bg-stone-50 ${className}`}>
      {header && (
        <header className={`${stickyHeader ? 'sticky top-0 z-40' : ''} bg-white border-b border-stone-200`}>
          {header}
        </header>
      )}

      <div className="flex flex-1 overflow-hidden">
        {sidebar && sidebarPosition === 'left' && (
          <aside
            className="bg-white border-r border-stone-200 overflow-y-auto"
            style={{ width: `${sidebarWidth}px` }}
          >
            {sidebar}
          </aside>
        )}

        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {children}
          </div>
        </main>

        {sidebar && sidebarPosition === 'right' && (
          <aside
            className="bg-white border-l border-stone-200 overflow-y-auto"
            style={{ width: `${sidebarWidth}px` }}
          >
            {sidebar}
          </aside>
        )}
      </div>

      {footer && (
        <footer className={`${stickyFooter ? 'sticky bottom-0 z-40' : ''} bg-white border-t border-stone-200`}>
          {footer}
        </footer>
      )}
    </div>
  );
}
