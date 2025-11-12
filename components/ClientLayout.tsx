'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import WelcomePage from '@/components/WelcomePage';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [hasToken, setHasToken] = useState<boolean | null>(null);
  const [isClient, setIsClient] = useState(false);

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
      <div className="flex h-screen bg-gray-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
      </div>
    );
  }

  if (hasToken === false) {
    return <WelcomePage onComplete={handleWelcomeComplete} />;
  }

  return (
    <ErrorBoundary>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <ErrorBoundary>
            <div className="container mx-auto px-6 py-10 md:px-10 md:py-12 lg:px-12 lg:py-14 max-w-7xl">
              {children}
            </div>
          </ErrorBoundary>
        </main>
      </div>
    </ErrorBoundary>
  );
}
