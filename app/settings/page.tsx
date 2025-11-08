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
        console.log('Migrating token from old key to new key');
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Settings</h1>
        <p className="text-base text-gray-600 dark:text-gray-400">
          Manage your Oura API token and test connectivity
        </p>
      </div>

      {/* Current Token Status */}
      <div className="glass rounded-3xl p-8 bg-white/80 dark:bg-gray-800/80 shadow-xl">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Key className="h-6 w-6 text-purple-500" />
          Current API Token
        </h3>

        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gray-100 dark:bg-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Token (masked)</p>
            <p className="font-mono text-sm text-gray-900 dark:text-gray-100 break-all">{currentKey}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={testCurrentToken}
              disabled={testing}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {testing ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Test Token
                </>
              )}
            </button>

            <button
              onClick={clearToken}
              className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-2"
            >
              <XCircle className="h-5 w-5" />
              Clear Token
            </button>

            <button
              onClick={loadCurrentKey}
              className="px-6 py-3 rounded-xl bg-gray-600 hover:bg-gray-700 text-white font-semibold flex items-center gap-2"
            >
              <RefreshCw className="h-5 w-5" />
              Refresh
            </button>
          </div>

          {/* Test Result */}
          {testResult && (
            <div className={`p-5 rounded-2xl border-2 ${testResult.success ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700'}`}>
              <div className="flex items-start gap-3">
                {testResult.success ? (
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-600 dark:text-red-400 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className={`font-bold text-lg mb-2 ${testResult.success ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100'}`}>
                    {testResult.message}
                  </p>
                  {testResult.details && (
                    <pre className="text-xs bg-white/50 dark:bg-gray-900/50 text-gray-800 dark:text-gray-200 p-3 rounded overflow-auto max-h-40">
                      {JSON.stringify(testResult.details, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Update Token */}
      <div className="glass rounded-3xl p-8 bg-white/80 dark:bg-gray-800/80 shadow-xl">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Update API Token</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Oura Personal Access Token
            </label>
            <textarea
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Paste your Oura API token here..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-purple-500 focus:outline-none font-mono text-sm resize-none"
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={saveToken}
              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center gap-2"
            >
              <Key className="h-5 w-5" />
              Save Token
            </button>

            <button
              onClick={() => {
                if (apiKey.trim()) {
                  testToken(apiKey.trim());
                }
              }}
              disabled={testing || !apiKey.trim()}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {testing ? (
                <>
                  <RefreshCw className="h-5 w-5 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <CheckCircle className="h-5 w-5" />
                  Test Before Saving
                </>
              )}
            </button>
          </div>

          {saved && (
            <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-700">
              <p className="text-green-900 dark:text-green-100 font-semibold">Token saved successfully! Navigate to the Dashboard or any other page to load your data.</p>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="glass rounded-3xl p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 shadow-xl">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <AlertCircle className="h-6 w-6 text-blue-500" />
          How to Get Your API Token
        </h3>

        <ol className="space-y-3 text-base text-gray-700 dark:text-gray-300">
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">1</span>
            <span>Go to <a href="https://cloud.ouraring.com/personal-access-tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 underline font-semibold">Oura Cloud Personal Access Tokens</a></span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">2</span>
            <span>Log in with your Oura account</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">3</span>
            <span>Click "Create A New Personal Access Token"</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">4</span>
            <span>Give it a name (e.g., "Dashboard")</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">5</span>
            <span><strong>Copy the ENTIRE token</strong> - it will be very long (100+ characters). Make sure you select all of it!</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500 text-white text-sm font-bold flex items-center justify-center">6</span>
            <span>Paste it in the "Update API Token" field above and click "Test Before Saving"</span>
          </li>
        </ol>

        <div className="mt-6 p-4 rounded-2xl bg-yellow-100 dark:bg-yellow-900/30 border-2 border-yellow-300 dark:border-yellow-700">
          <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
            ⚠️ <strong>Important:</strong> Make sure you copy the ENTIRE token. Oura tokens are typically 100+ characters long. If your token is shorter, you may have missed part of it. Use the "Test Before Saving" button to verify your token works!
          </p>
        </div>
      </div>
    </div>
  );
}
