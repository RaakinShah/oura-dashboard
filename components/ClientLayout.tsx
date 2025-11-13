'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import WelcomePage from '@/components/WelcomePage';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useDashboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { KeyboardShortcutsModal, useKeyboardShortcutsModal } from '@/components/KeyboardShortcutsModal';

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
      <div className="flex h-screen bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-stone-200 border-t-stone-900"></div>
        </div>
      </div>
    );
  }

  if (hasToken === false) {
    return <WelcomePage onComplete={handleWelcomeComplete} />;
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-background transition-colors duration-200">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-stone-50">
          <ErrorBoundary>
            <div className="container mx-auto px-8 py-12 md:px-12 md:py-16 lg:px-16 lg:py-20 max-w-[1800px]">
              {children}
            </div>
          </ErrorBoundary>
        </main>
      </div>

      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal isOpen={shortcutsModal.isOpen} onClose={shortcutsModal.close} />
    </ErrorBoundary>
  );
}
