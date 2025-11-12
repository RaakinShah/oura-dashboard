'use client';

import { useState, useEffect } from 'react';
import { Key, CheckCircle, XCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { storage } from '@/lib/storage';

export default function Settings() {
  const [apiKey, setApiKey] = useState('');
  const [currentKey, setCurrentKey] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);
  const [saved, setSaved] = useState(false);

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

    try {
      // Test via our API route (which calls Oura API)
      const response = await fetch('/api/oura/test', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setTestResult({
          success: true,
          message: 'Token is valid!',
          details: data,
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || `Token validation failed: ${response.status} ${response.statusText}`,
          details: data.details || 'No additional details',
        });
      }
    } catch (error) {
      setTestResult({
        success: false,
        message: 'Failed to test token',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    } finally {
      setTesting(false);
    }
  };

  const saveToken = () => {
    if (!apiKey.trim()) {
      alert('Please enter a token');
      return;
    }
    storage.setToken(apiKey.trim());
    loadCurrentKey();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
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
            <label className="block text-xs uppercase tracking-wide font-medium text-stone-500 mb-3">
              Oura Personal Access Token
            </label>
            <textarea
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your Oura API token here..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:border-sage-400 focus:ring-2 focus:ring-sage-200/50 focus:outline-none font-mono text-sm resize-none transition-all"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={saveToken}
              className="btn-refined btn-primary"
            >
              <Key className="h-4 w-4" />
              Save Token
            </button>

            <button
              onClick={() => {
                if (apiKey.trim()) {
                  testToken(apiKey.trim());
                }
              }}
              disabled={testing || !apiKey.trim()}
              className="btn-refined btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Test Before Saving
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
