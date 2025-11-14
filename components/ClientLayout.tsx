'use client';

import { useState, useEffect } from 'react';
import ModernSidebar from '@/components/ModernSidebar';
import TopNavbar from '@/components/TopNavbar';
import WelcomePage from '@/components/WelcomePage';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useDashboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsModal, useKeyboardShortcutsModal } from '@/components/KeyboardShortcutsModal';
import { ToastProvider } from '@/components/Toast';
import { LoadingBar } from '@/components/LoadingBar';
import { BackToTop } from '@/components/BackToTop';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Enable keyboard shortcuts
  useDashboardShortcuts();

  // Keyboard shortcuts modal
  const shortcutsModal = useKeyboardShortcutsModal();

  useEffect(() => {
    setIsClient(true);
    checkToken();
  }, []);

  const checkToken = () => {
    const token = localStorage.getItem('oura_api_token');
    setHasToken(!!token);
  };

  const handleWelcomeComplete = () => {
    checkToken();
  };

  // Prevent hydration mismatch by not rendering until client-side
  if (!isClient) {
    return (
      <div className="flex h-screen bg-stone-100">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-stone-200 border-t-blue-600"></div>
        </div>
      </div>
    );
  }

  if (hasToken === false) {
    return <WelcomePage onComplete={handleWelcomeComplete} />;
  }

  return (
    <ToastProvider>
      <ErrorBoundary>
        <LoadingBar />

        <div className="flex h-screen bg-gradient-to-br from-stone-50 via-slate-50 to-stone-100">
          {/* Modern Sidebar */}
          <ModernSidebar />

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Navbar */}
            <TopNavbar />

            {/* Page Content */}
            <main className="flex-1 overflow-y-auto">
              <ErrorBoundary>
                <div className="container mx-auto px-6 py-8 max-w-[1800px]">
                  {children}
                </div>
              </ErrorBoundary>
            </main>
          </div>
        </div>

        <BackToTop />

        {/* Keyboard Shortcuts Modal */}
        <KeyboardShortcutsModal isOpen={shortcutsModal.isOpen} onClose={shortcutsModal.close} />
      </ErrorBoundary>
    </ToastProvider>
  );
}
