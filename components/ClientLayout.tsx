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
      <div className="flex h-screen bg-background">
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-muted border-t-violet-500"></div>
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
        <main className="flex-1 overflow-y-auto bg-muted/30">
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
