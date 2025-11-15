'use client';

import React, { useState, useEffect, useRef } from 'react';
import AIChat from '@/components/AIChat';
import AIProfileDisplay from '@/components/AIProfileDisplay';
import OllamaSettings from '@/components/OllamaSettings';
import { Brain, Sparkles, TrendingUp, Activity, Heart, Zap, MessageSquare, Cpu, Network, User, Download, FileText, Copy, Settings } from 'lucide-react';
import { AIUserProfilingEngine, AIUserProfile } from '@/lib/ai/user-profiling-engine';
import { ConversationalAI } from '@/lib/ai/conversational-engine';
import { useOuraData } from '@/hooks/useOura';
import { DataExporter } from '@/lib/ai/data-export';

export default function AIPage() {
  const [activeView, setActiveView] = useState<'chat' | 'profile' | 'predictions' | 'settings'>('chat');
  const [aiProfile, setAiProfile] = useState<AIUserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [exportNotification, setExportNotification] = useState<string | null>(null);
  const profileGeneratedRef = useRef(false);
  const conversationalAIRef = useRef<ConversationalAI | null>(null);

  // Fetch Oura data using the proper hook
  const { sleep, activity, readiness, loading: dataLoading } = useOuraData();

  // Generate AI profile when data is loaded (only once)
  useEffect(() => {
    if (!dataLoading && !profileGeneratedRef.current && sleep.length >= 14 && readiness.length >= 14) {
      profileGeneratedRef.current = true;
      generateAIProfile();
    }
  }, [dataLoading, sleep.length, readiness.length]);

  const generateAIProfile = async () => {
    setProfileLoading(true);
    try {
      const profiler = new AIUserProfilingEngine();
      const profile = await profiler.buildProfile(sleep, activity, readiness);
      setAiProfile(profile);
      console.log('🎯 AI Profile Generated:', profile);
    } catch (error) {
      console.error('Error generating AI profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleExportMarkdown = () => {
    if (sleep.length === 0) {
      setExportNotification('No data to export');
      return;
    }

    const exportData = DataExporter.exportForClaude(sleep, activity, readiness, aiProfile || undefined);
    const filename = `oura-health-data-${new Date().toISOString().split('T')[0]}.md`;
    DataExporter.downloadExport(exportData.markdown, filename, 'markdown');
    setExportNotification('✅ Markdown exported! Upload to Claude AI for analysis.');
    setTimeout(() => setExportNotification(null), 5000);
  };

  const handleExportJSON = () => {
    if (sleep.length === 0) {
      setExportNotification('No data to export');
      return;
    }

    const exportData = DataExporter.exportForClaude(sleep, activity, readiness, aiProfile || undefined);
    const filename = `oura-health-data-${new Date().toISOString().split('T')[0]}.json`;
    DataExporter.downloadExport(exportData.json, filename, 'json');
    setExportNotification('✅ JSON exported successfully!');
    setTimeout(() => setExportNotification(null), 5000);
  };

  const handleCopyToClipboard = async () => {
    if (sleep.length === 0) {
      setExportNotification('No data to copy');
      return;
    }

    const exportData = DataExporter.exportForClaude(sleep, activity, readiness, aiProfile || undefined);
    const success = await DataExporter.copyToClipboard(exportData.markdown);

    if (success) {
      setExportNotification('✅ Copied to clipboard! Paste into Claude AI for analysis.');
      setTimeout(() => setExportNotification(null), 5000);
    } else {
      setExportNotification('❌ Failed to copy. Try downloading instead.');
      setTimeout(() => setExportNotification(null), 5000);
    }
  };

  // Handle AI engine ready
  const handleAIReady = (ai: ConversationalAI) => {
    conversationalAIRef.current = ai;
  };

  // Handle Ollama model change
  const handleOllamaModelChange = (model: string) => {
    if (conversationalAIRef.current) {
      conversationalAIRef.current.setOllamaModel(model);
      console.log('Ollama model changed to:', model);
    }
  };

  // Handle Ollama toggle
  const handleOllamaToggle = (enabled: boolean) => {
    if (conversationalAIRef.current) {
      conversationalAIRef.current.setOllamaMode(enabled);
      console.log('Ollama mode:', enabled ? 'enabled' : 'disabled');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 p-6">
      {/* Hero Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-700 dark:via-purple-700 dark:to-pink-700 rounded-3xl p-8 shadow-2xl border border-indigo-300 dark:border-indigo-800 overflow-hidden relative">
          {/* Animated background */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-200 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>

          <div className="relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-4 mb-3">
                  <div className="p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                    <Brain className="w-12 h-12 text-white" />
                  </div>
                  <div>
                    <h1 className="text-5xl font-black text-white mb-2 flex items-center gap-3">
                      AI Health Intelligence
                      <Sparkles className="w-10 h-10 text-yellow-300 animate-bounce" />
                    </h1>
                    <p className="text-xl text-indigo-100 font-medium">
                      Claude-level AI powered by advanced NLP, neural networks, and machine learning
                    </p>
                  </div>
                </div>

                {/* Export Buttons */}
                <div className="flex flex-wrap gap-3 mt-6 mb-4">
                  <button
                    onClick={handleCopyToClipboard}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl font-semibold transition-all duration-200 border border-white/30 hover:scale-105 shadow-lg"
                  >
                    <Copy className="w-4 h-4" />
                    Copy for Claude AI
                  </button>
                  <button
                    onClick={handleExportMarkdown}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl font-semibold transition-all duration-200 border border-white/30 hover:scale-105 shadow-lg"
                  >
                    <FileText className="w-4 h-4" />
                    Export Markdown
                  </button>
                  <button
                    onClick={handleExportJSON}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl font-semibold transition-all duration-200 border border-white/30 hover:scale-105 shadow-lg"
                  >
                    <Download className="w-4 h-4" />
                    Export JSON
                  </button>
                </div>

                {/* Export Notification */}
                {exportNotification && (
                  <div className="mb-4 p-3 bg-white/30 backdrop-blur-sm rounded-xl border border-white/40 text-white font-semibold animate-fadeIn">
                    {exportNotification}
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="w-5 h-5 text-white" />
                      <span className="text-white font-semibold text-sm">Natural Language</span>
                    </div>
                    <p className="text-indigo-100 text-xs">Advanced NLP Engine</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Cpu className="w-5 h-5 text-white" />
                      <span className="text-white font-semibold text-sm">Neural Network</span>
                    </div>
                    <p className="text-indigo-100 text-xs">Deep Learning Predictions</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Brain className="w-5 h-5 text-white" />
                      <span className="text-white font-semibold text-sm">Contextual Memory</span>
                    </div>
                    <p className="text-indigo-100 text-xs">Conversation Intelligence</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Network className="w-5 h-5 text-white" />
                      <span className="text-white font-semibold text-sm">Pattern Recognition</span>
                    </div>
                    <p className="text-indigo-100 text-xs">Multi-dimensional Analysis</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex gap-3 p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
          <button
            onClick={() => setActiveView('chat')}
            className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 ${
              activeView === 'chat'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <MessageSquare className="w-5 h-5" />
            <span>AI Chat</span>
          </button>
          <button
            onClick={() => setActiveView('profile')}
            className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 ${
              activeView === 'profile'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <User className="w-5 h-5" />
            <span>AI Profile</span>
          </button>
          <button
            onClick={() => setActiveView('predictions')}
            className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 ${
              activeView === 'predictions'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Cpu className="w-5 h-5" />
            <span>ML Insights</span>
          </button>
          <button
            onClick={() => setActiveView('settings')}
            className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-3 ${
              activeView === 'settings'
                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg scale-105'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto">
        {activeView === 'chat' && (
          <div className="animate-fadeIn">
            <div className="mb-6 p-6 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-indigo-200 dark:border-indigo-800 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-3">
                <Sparkles className="w-7 h-7 text-indigo-600" />
                Conversational AI Health Coach
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Ask me anything about your health data! I understand natural language, remember context, and provide personalized insights powered by advanced machine learning.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <Heart className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div>
                    <div className="font-semibold text-blue-900 dark:text-blue-300">Intent Recognition</div>
                    <div className="text-blue-700 dark:text-blue-400">I understand questions, commands, and feedback</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                  <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400 mt-0.5" />
                  <div>
                    <div className="font-semibold text-purple-900 dark:text-purple-300">Voice Input/Output</div>
                    <div className="text-purple-700 dark:text-purple-400">Talk to me or listen to responses</div>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <Activity className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                  <div>
                    <div className="font-semibold text-green-900 dark:text-green-300">Personalized Learning</div>
                    <div className="text-green-700 dark:text-green-400">I learn what works specifically for YOU</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="h-[calc(100vh-500px)] min-h-[600px]">
              <AIChat className="h-full" onAIReady={handleAIReady} />
            </div>
          </div>
        )}

        {activeView === 'profile' && (
          <div className="animate-fadeIn">
            <AIProfileDisplay profile={aiProfile} loading={profileLoading} />
          </div>
        )}

        {activeView === 'predictions' && (
          <div className="animate-fadeIn space-y-6">
            <div className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-3">
                <Cpu className="w-8 h-8 text-purple-600" />
                Machine Learning Insights
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                True machine learning algorithms analyze your data to discover patterns, build your personalized profile, and make predictions.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <FeatureCard
                  icon={<Brain />}
                  title="K-Means Clustering"
                  description="Identifies your health archetype from behavioral patterns"
                  color="purple"
                />
                <FeatureCard
                  icon={<TrendingUp />}
                  title="PCA Analysis"
                  description="Finds the most important factors affecting your health"
                  color="blue"
                />
                <FeatureCard
                  icon={<Activity />}
                  title="Bayesian Inference"
                  description="Updates beliefs about you as more data comes in"
                  color="green"
                />
                <FeatureCard
                  icon={<Heart />}
                  title="Ensemble Models"
                  description="Combines multiple AI models for better predictions"
                  color="red"
                />
                <FeatureCard
                  icon={<Zap />}
                  title="Anomaly Detection"
                  description="Identifies unusual patterns that need attention"
                  color="yellow"
                />
                <FeatureCard
                  icon={<Network />}
                  title="Knowledge Graph"
                  description="Discovers correlations between your metrics"
                  color="indigo"
                />
              </div>
            </div>

            <div className="p-8 bg-gradient-to-br from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 rounded-2xl shadow-2xl border border-indigo-400 dark:border-indigo-600 text-white">
              <h3 className="text-2xl font-bold mb-4">The ML Pipeline</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-black mb-2">1</div>
                  <div className="font-semibold mb-1">Feature Extraction</div>
                  <div className="text-sm text-indigo-100">15+ health metrics extracted</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-black mb-2">2</div>
                  <div className="font-semibold mb-1">Clustering</div>
                  <div className="text-sm text-indigo-100">K-means++ identifies archetype</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-black mb-2">3</div>
                  <div className="font-semibold mb-1">Dimensionality Reduction</div>
                  <div className="text-sm text-indigo-100">PCA finds key factors</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-black mb-2">4</div>
                  <div className="font-semibold mb-1">Bayesian Learning</div>
                  <div className="text-sm text-indigo-100">Updates probability beliefs</div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                  <div className="text-3xl font-black mb-2">5</div>
                  <div className="font-semibold mb-1">Profile Generation</div>
                  <div className="text-sm text-indigo-100">Creates your AI profile</div>
                </div>
              </div>
            </div>

            <div className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
              <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-3">
                <Cpu className="w-7 h-7 text-indigo-600" />
                Neural Network Architecture
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Custom-built from scratch with backpropagation, Xavier initialization, and mini-batch gradient descent.
              </p>

              <div className="space-y-6 mt-6">
                <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                    <Network className="w-6 h-6 text-blue-600" />
                    Network Architecture
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                      <div className="text-4xl font-black text-blue-600 mb-1">15</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Input Features</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Sleep, HRV, RHR, Activity, etc.</div>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                      <div className="text-4xl font-black text-purple-600 mb-1">20-15-10</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Hidden Layers</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Deep learning architecture</div>
                    </div>
                    <div className="text-center p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
                      <div className="text-4xl font-black text-green-600 mb-1">3</div>
                      <div className="text-sm text-gray-600 dark:text-gray-300">Output Values</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Readiness, Confidence, Trend</div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl border-2 border-purple-200 dark:border-purple-800">
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                    Advanced Features
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold shrink-0">✓</div>
                      <div>
                        <div className="font-semibold text-gray-800 dark:text-white">Backpropagation Learning</div>
                        <div className="text-gray-600 dark:text-gray-300">Learns from YOUR historical data patterns</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold shrink-0">✓</div>
                      <div>
                        <div className="font-semibold text-gray-800 dark:text-white">Monte Carlo Dropout</div>
                        <div className="text-gray-600 dark:text-gray-300">Uncertainty estimation for predictions</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold shrink-0">✓</div>
                      <div>
                        <div className="font-semibold text-gray-800 dark:text-white">Xavier Initialization</div>
                        <div className="text-gray-600 dark:text-gray-300">Optimal weight initialization for fast convergence</div>
                      </div>
                    </div>
                    <div className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-600 dark:text-purple-400 font-bold shrink-0">✓</div>
                      <div>
                        <div className="font-semibold text-gray-800 dark:text-white">Mini-Batch Gradient Descent</div>
                        <div className="text-gray-600 dark:text-gray-300">Efficient training with adaptive learning rate</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'settings' && (
          <div className="animate-fadeIn space-y-6">
            <div className="p-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-3">
                <Settings className="w-8 h-8 text-indigo-600" />
                AI Settings
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Configure your AI experience with local LLM models for enhanced privacy and performance.
              </p>

              <OllamaSettings
                onModelChange={handleOllamaModelChange}
                onToggleOllama={handleOllamaToggle}
              />
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
      `}</style>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'purple' | 'blue' | 'green' | 'red' | 'yellow' | 'indigo';
}

function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  const colorClasses = {
    purple: 'from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800',
    blue: 'from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800',
    green: 'from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800',
    red: 'from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 border-red-200 dark:border-red-800',
    yellow: 'from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 border-yellow-200 dark:border-yellow-800',
    indigo: 'from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 border-indigo-200 dark:border-indigo-800',
  };

  const iconColorClasses = {
    purple: 'text-purple-600 dark:text-purple-400',
    blue: 'text-blue-600 dark:text-blue-400',
    green: 'text-green-600 dark:text-green-400',
    red: 'text-red-600 dark:text-red-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    indigo: 'text-indigo-600 dark:text-indigo-400',
  };

  const iconElement = React.isValidElement(icon) ?
    React.cloneElement(icon, { className: 'w-6 h-6' } as any) :
    icon;

  return (
    <div className={`p-6 bg-gradient-to-br ${colorClasses[color]} rounded-xl border-2 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105`}>
      <div className={`w-12 h-12 rounded-xl bg-white dark:bg-gray-800 flex items-center justify-center mb-4 ${iconColorClasses[color]}`}>
        {iconElement}
      </div>
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
    </div>
  );
}
