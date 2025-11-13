'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    this.setState({
      error,
      errorInfo,
    });

    // Here you could log to an error reporting service
    // e.g., Sentry, LogRocket, etc.
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-stone-50">
          <div className="max-w-2xl w-full">
            <div className="bg-white rounded-xl p-10 shadow-lg border border-stone-200 animate-scale-in">
              {/* Icon */}
              <div className="w-16 h-16 bg-rose-50 rounded-xl flex items-center justify-center mx-auto mb-6 border border-rose-200">
                <AlertTriangle className="h-8 w-8 text-rose-600" />
              </div>

              {/* Title */}
              <h1 className="text-3xl font-light text-stone-900 text-center mb-3">
                Something went wrong
              </h1>

              {/* Description */}
              <p className="text-stone-600 text-center mb-6 leading-relaxed">
                We encountered an unexpected error. This has been logged and we'll look into it.
              </p>

              {/* Error Details (Development Only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-lg">
                  <p className="text-sm font-semibold text-rose-900 mb-2">
                    Error Details (Development Only):
                  </p>
                  <pre className="text-xs text-rose-800 overflow-auto max-h-40 font-mono leading-relaxed">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={this.handleReset}
                  className="btn-refined btn-primary inline-flex"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </button>

                <Link
                  href="/"
                  className="btn-refined btn-secondary inline-flex"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </Link>
              </div>

              {/* Help Text */}
              <p className="text-sm text-stone-500 text-center mt-6">
                If this problem persists, try refreshing the page or clearing your browser cache.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for easier usage
export default function ErrorBoundaryWrapper({ children, fallback }: Props) {
  return <ErrorBoundary fallback={fallback}>{children}</ErrorBoundary>;
}
