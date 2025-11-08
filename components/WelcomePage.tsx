'use client';

import { useState } from 'react';
import { Activity, Moon, Heart, Sparkles, Key, ArrowRight, Check, ExternalLink } from 'lucide-react';

interface WelcomePageProps {
  onComplete: () => void;
}

export default function WelcomePage({ onComplete }: WelcomePageProps) {
  const [apiKey, setApiKey] = useState('');
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) return;

    setSaving(true);
    localStorage.setItem('oura_api_token', apiKey.trim());

    setTimeout(() => {
      setSaving(false);
      onComplete();
    }, 500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="pt-16 pb-8 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
              Oura Dashboard
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-4">
            Advanced AI-powered health analytics for your Oura Ring
          </p>
          <p className="text-base text-gray-500 max-w-2xl mx-auto">
            Get deep insights, predictive analytics, and personalized recommendations based on your biometric data
          </p>
        </div>
      </div>

      {/* Features Preview */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl w-fit mb-4">
              <Moon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Sleep Analysis</h3>
            <p className="text-sm text-gray-600">
              Deep dive into your sleep architecture, identify your chronotype, and optimize your rest
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl w-fit mb-4">
              <Activity className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Activity Tracking</h3>
            <p className="text-sm text-gray-600">
              Monitor your movement, energy expenditure, and find optimal workout timing
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-xl w-fit mb-4">
              <Heart className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Recovery Intelligence</h3>
            <p className="text-sm text-gray-600">
              Predictive illness detection, sleep debt tracking, and personalized recovery protocols
            </p>
          </div>
        </div>

        {/* Setup Card */}
        <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
          {/* Progress Steps */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6">
            <div className="flex items-center justify-between max-w-md mx-auto">
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 1 ? 'bg-white text-purple-600' : 'bg-white/20 text-white'
                }`}>
                  {step > 1 ? <Check className="h-5 w-5" /> : '1'}
                </div>
                <span className="text-white font-medium">Get API Key</span>
              </div>
              <div className="w-16 h-0.5 bg-white/20"></div>
              <div className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step >= 2 ? 'bg-white text-purple-600' : 'bg-white/20 text-white'
                }`}>
                  {step > 2 ? <Check className="h-5 w-5" /> : '2'}
                </div>
                <span className="text-white font-medium">Enter Key</span>
              </div>
            </div>
          </div>

          <div className="p-8">
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Get Your Oura API Key</h2>
                  <p className="text-gray-600">Follow these steps to generate your personal access token</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      1
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">Visit Oura Cloud</p>
                      <p className="text-sm text-gray-600 mb-2">
                        Go to the Oura Cloud website and sign in with your Oura account
                      </p>
                      <a
                        href="https://cloud.ouraring.com/personal-access-tokens"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-purple-600 hover:text-purple-700 font-medium"
                      >
                        Open Oura Cloud <ExternalLink className="h-4 w-4" />
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      2
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">Create Personal Access Token</p>
                      <p className="text-sm text-gray-600">
                        Click "Create A New Personal Access Token" and give it a name like "My Dashboard"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                      3
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 mb-1">Copy Your Token</p>
                      <p className="text-sm text-gray-600">
                        Copy the generated token - you'll need to enter it in the next step
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setStep(2)}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
                  >
                    I Have My API Key <ArrowRight className="h-5 w-5" />
                  </button>
                </div>

                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="flex items-start gap-3">
                    <Key className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-blue-900 mb-1">Privacy Note</p>
                      <p className="text-sm text-blue-800">
                        Your API key is stored locally in your browser and never sent to any server except Oura's official API.
                        All data processing happens on your device.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter Your API Key</h2>
                  <p className="text-gray-600">Paste the personal access token you copied from Oura Cloud</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Oura Personal Access Token
                    </label>
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="Paste your API key here..."
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-600 focus:outline-none text-base"
                      autoFocus
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleSaveApiKey}
                      disabled={!apiKey.trim() || saving}
                      className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {saving ? 'Saving...' : (
                        <>
                          Continue <ArrowRight className="h-5 w-5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                  <div className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-green-900 mb-1">You're Almost There!</p>
                      <p className="text-sm text-green-800">
                        Once you enter your API key, you'll have access to all features including chronotype analysis,
                        sleep debt tracking, illness prediction, and personalized insights.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Network Access Info */}
        <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-3">Access from Other Devices</h3>
          <p className="text-sm text-gray-600 mb-4">
            Once set up, you can access this dashboard from any device on your network using:
          </p>
          <div className="bg-gray-50 rounded-lg p-4 font-mono text-sm text-gray-800">
            http://192.168.5.225:3000
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Make sure your devices are on the same WiFi network. You can bookmark this URL on your phone or tablet.
          </p>
        </div>
      </div>
    </div>
  );
}
