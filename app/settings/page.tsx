'use client';

import { useState, useEffect } from 'react';
import { Key, CheckCircle, XCircle, RefreshCw, AlertCircle, Eye, EyeOff, Loader2, Shield } from 'lucide-react';
import { storage } from '@/lib/storage';
import { validateOuraToken, VALIDATION_ERRORS } from '@/lib/oura-api';

export default function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [currentKey, setCurrentKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);
  const [saved, setSaved] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Migrate old token key to new one
    if (typeof window !== 'undefined') {
      const oldToken = localStorage.getItem('oura_api_token');
      if (oldToken && !storage.getToken()) {
        storage.setToken(oldToken);
        localStorage.removeItem('oura_api_token');
      }
    }
    loadCurrentKey();
  }, []);

  const loadCurrentKey = () => {
    const key = storage.getToken();
    if (key) {
      // Show first 10 and last 10 characters
      const masked = key.length > 20
        ? `${key.substring(0, 10)}...${key.substring(key.length - 10)}`
        : key;
      setCurrentKey(masked);
      setApiKey(key);
    } else {
      setCurrentKey('No token set');
    }
  };

  const testToken = async (token: string) => {
    setTesting(true);
    setTestResult(null);
    setError(null);

    // Use centralized validation
    const result = await validateOuraToken(token);

    if (result.isValid) {
      setTestResult({
        success: true,
        message: '✓ Token is valid and working!',
        details: result.data,
      });
      setError(null);
    } else {
      setError(result.error || VALIDATION_ERRORS.NETWORK_ERROR);
      setTestResult({
        success: false,
        message: result.error || VALIDATION_ERRORS.NETWORK_ERROR,
      });
    }

    setTesting(false);
  };

  const saveToken = async () => {
    if (!apiKey.trim()) {
      setError(VALIDATION_ERRORS.EMPTY_TOKEN);
      return;
    }

    setTesting(true);
    setError(null);

    // Use centralized validation before saving
    const result = await validateOuraToken(apiKey.trim());

    if (result.isValid) {
      storage.setToken(apiKey.trim());
      loadCurrentKey();
      setSaved(true);
      setTestResult({
        success: true,
        message: '✓ Token validated and saved successfully!',
        details: result.data,
      });
      setTimeout(() => {
        setSaved(false);
        setTestResult(null);
      }, 3000);
    } else {
      setError(result.error || VALIDATION_ERRORS.NETWORK_ERROR);
    }

    setTesting(false);
  };

  const testCurrentToken = () => {
    const token = storage.getToken();
    if (!token) {
      setTestResult({
        success: false,
        message: 'No token found in storage',
      });
      return;
    }
    testToken(token);
  };

  const clearToken = () => {
    if (confirm('Are you sure you want to clear your API token?')) {
      storage.removeToken();
      setCurrentKey('No token set');
      setApiKey('');
      setTestResult(null);
    }
  };

  return (
    <div className="space-y-12 page-transition">
      {/* Header */}
      <header className="animate-fade-in">
        <h1 className="text-4xl sm:text-5xl font-light mb-3">Settings</h1>
        <p className="text-stone-600 text-lg">
          Manage your Oura API token and test connectivity
        </p>
      </header>

      {/* Current Token Status */}
      <section className="bg-white border border-stone-200 rounded-lg p-8 sm:p-12 animate-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-sage-100 flex items-center justify-center">
            <Key className="h-5 w-5 text-sage-700" />
          </div>
          <h2 className="text-2xl font-light">Current API Token</h2>
        </div>

        <div className="space-y-6">
          <div className="p-6 rounded-lg bg-stone-50 border border-stone-200">
            <p className="text-xs uppercase tracking-wide font-medium text-stone-500 mb-3">Token (masked)</p>
            <p className="font-mono text-sm text-stone-900 break-all leading-relaxed">{currentKey}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={testCurrentToken}
              disabled={testing}
              className="btn-refined btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Test Token
                </>
              )}
            </button>

            <button
              onClick={clearToken}
              className="btn-refined bg-rose-900 text-white border-rose-900 hover:bg-rose-800 hover:border-rose-800"
            >
              <XCircle className="h-4 w-4" />
              Clear Token
            </button>

            <button
              onClick={loadCurrentKey}
              className="btn-refined btn-secondary"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>

          {/* Test Result */}
          {testResult && (
            <div className={`p-6 rounded-lg border ${testResult.success ? 'bg-emerald-50/50 border-emerald-200/60' : 'bg-rose-50/50 border-rose-200/60'} animate-scale-in`}>
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${testResult.success ? 'bg-emerald-100/80' : 'bg-rose-100/80'}`}>
                  {testResult.success ? (
                    <CheckCircle className="h-5 w-5 text-emerald-700" />
                  ) : (
                    <XCircle className="h-5 w-5 text-rose-700" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`font-medium text-base mb-3 ${testResult.success ? 'text-emerald-900' : 'text-rose-900'}`}>
                    {testResult.message}
                  </p>
                  {testResult.details && (
                    <pre className="text-xs bg-white/80 border border-stone-200 text-stone-800 p-4 rounded-lg overflow-auto max-h-40 font-mono leading-relaxed">
                      {JSON.stringify(testResult.details, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Update Token */}
      <section className="bg-white border border-stone-200 rounded-lg p-8 sm:p-12 animate-fade-in" style={{ animationDelay: '0.2s' }}>
        <h2 className="text-2xl font-light mb-8">Update API Token</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3 uppercase tracking-wide">
              Oura Personal Access Token
            </label>
            <div className="relative">
              <textarea
                value={showToken ? apiKey : apiKey.replace(/./g, '•')}
                onChange={(e) => {
                  const newValue = showToken ? e.target.value : apiKey + e.target.value.slice(apiKey.length);
                  setApiKey(newValue);
                  setError(null);
                }}
                placeholder="Paste your Oura API token here..."
                rows={3}
                className={`w-full pl-5 pr-14 py-4 border-2 rounded-2xl focus:ring-4 focus:outline-none text-sm resize-none transition-all duration-200 shadow-sm ${
                  showToken ? 'font-mono' : 'font-sans tracking-wider'
                } ${
                  error
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-100 bg-red-50/50'
                    : 'border-gray-200 focus:border-purple-600 focus:ring-purple-100 hover:border-gray-300'
                }`}
                disabled={testing}
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-4 top-4 p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                aria-label={showToken ? 'Hide token' : 'Show token'}
                disabled={testing}
              >
                {showToken ? (
                  <EyeOff className="h-5 w-5" strokeWidth={2.5} />
                ) : (
                  <Eye className="h-5 w-5" strokeWidth={2.5} />
                )}
              </button>
            </div>
            {error && (
              <div className="mt-3 flex items-start gap-2 text-red-600">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" strokeWidth={2.5} />
                <p className="text-sm font-semibold">{error}</p>
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={saveToken}
              disabled={testing || !apiKey.trim()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-2xl hover:shadow-xl hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center gap-2"
            >
              {testing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2.5} />
                  <span>Validating & Saving...</span>
                </>
              ) : (
                <>
                  <Key className="h-5 w-5" strokeWidth={2.5} />
                  <span>Validate & Save Token</span>
                </>
              )}
            </button>

            <button
              onClick={() => {
                if (apiKey.trim()) {
                  testToken(apiKey.trim());
                }
              }}
              disabled={testing || !apiKey.trim()}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {testing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" strokeWidth={2.5} />
                  <span>Testing...</span>
                </>
              ) : (
                <>
                  <Shield className="h-5 w-5" strokeWidth={2.5} />
                  <span>Test Only</span>
                </>
              )}
            </button>
          </div>

          {saved && (
            <div className="p-6 rounded-lg bg-emerald-50/50 border border-emerald-200/60 animate-scale-in">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-emerald-100/80 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="h-5 w-5 text-emerald-700" />
                </div>
                <p className="text-emerald-900 font-medium flex-1 leading-relaxed">Token saved successfully! Navigate to the Dashboard or any other page to load your data.</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Instructions */}
      <section className="bg-white border border-stone-200 rounded-lg p-8 sm:p-12 animate-fade-in" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-slate-700" />
          </div>
          <h2 className="text-2xl font-light">How to Get Your API Token</h2>
        </div>

        <ol className="space-y-4 text-stone-700 mb-8">
          <li className="flex items-start gap-4">
            <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-stone-900 text-white text-sm font-medium flex items-center justify-center">1</span>
            <span className="leading-relaxed pt-0.5">Go to <a href="https://cloud.ouraring.com/personal-access-tokens" target="_blank" rel="noopener noreferrer" className="text-sage-700 underline underline-offset-2 font-medium hover:text-sage-800 transition-colors">Oura Cloud Personal Access Tokens</a></span>
          </li>
          <li className="flex items-start gap-4">
            <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-stone-900 text-white text-sm font-medium flex items-center justify-center">2</span>
            <span className="leading-relaxed pt-0.5">Log in with your Oura account</span>
          </li>
          <li className="flex items-start gap-4">
            <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-stone-900 text-white text-sm font-medium flex items-center justify-center">3</span>
            <span className="leading-relaxed pt-0.5">Click "Create A New Personal Access Token"</span>
          </li>
          <li className="flex items-start gap-4">
            <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-stone-900 text-white text-sm font-medium flex items-center justify-center">4</span>
            <span className="leading-relaxed pt-0.5">Give it a name (e.g., "Dashboard")</span>
          </li>
          <li className="flex items-start gap-4">
            <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-stone-900 text-white text-sm font-medium flex items-center justify-center">5</span>
            <span className="leading-relaxed pt-0.5"><strong className="text-stone-900">Copy the ENTIRE token</strong> - it will be very long (100+ characters). Make sure you select all of it!</span>
          </li>
          <li className="flex items-start gap-4">
            <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-stone-900 text-white text-sm font-medium flex items-center justify-center">6</span>
            <span className="leading-relaxed pt-0.5">Paste it in the "Update API Token" field above and click "Test Before Saving"</span>
          </li>
        </ol>

        <div className="p-6 rounded-lg bg-amber-50/50 border border-amber-200/60">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-amber-100/80 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="h-5 w-5 text-amber-700" />
            </div>
            <p className="text-sm text-amber-900 leading-relaxed flex-1">
              <strong className="font-semibold">Important:</strong> Make sure you copy the ENTIRE token. Oura tokens are typically 100+ characters long. If your token is shorter, you may have missed part of it. Use the "Test Before Saving" button to verify your token works!
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
