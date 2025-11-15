'use client';

import React, { useState, useEffect } from 'react';
import { Cpu, CheckCircle2, XCircle, Download, ExternalLink, Settings, Zap, AlertCircle } from 'lucide-react';
import { RECOMMENDED_MODELS, type OllamaModel } from '@/lib/ai/ollama-client';

interface OllamaSettingsProps {
  onModelChange?: (model: string) => void;
  onToggleOllama?: (enabled: boolean) => void;
}

export default function OllamaSettings({ onModelChange, onToggleOllama }: OllamaSettingsProps) {
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(true);
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState('llama3.2:3b');
  const [ollamaEnabled, setOllamaEnabled] = useState(true);
  const [showSetupInstructions, setShowSetupInstructions] = useState(false);

  // Check Ollama availability on mount
  useEffect(() => {
    checkOllamaStatus();
  }, []);

  const checkOllamaStatus = async () => {
    setIsChecking(true);
    try {
      const response = await fetch('http://localhost:11434/api/tags', {
        method: 'GET',
        signal: AbortSignal.timeout(2000),
      });

      if (response.ok) {
        setIsAvailable(true);
        const data = await response.json();
        const models = data.models?.map((m: any) => m.name) || [];
        setAvailableModels(models);
      } else {
        setIsAvailable(false);
      }
    } catch (error) {
      setIsAvailable(false);
    } finally {
      setIsChecking(false);
    }
  };

  const handleModelChange = (model: string) => {
    setSelectedModel(model);
    onModelChange?.(model);
  };

  const handleToggleOllama = () => {
    const newState = !ollamaEnabled;
    setOllamaEnabled(newState);
    onToggleOllama?.(newState);
  };

  const downloadModel = (modelName: string) => {
    // This would require Ollama API call
    alert(`To download ${modelName}, run this command in your terminal:\n\nollama pull ${modelName}`);
  };

  return (
    <div className="space-y-4">
      {/* Status Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white">Ollama LLM</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">Local AI Models</p>
            </div>
          </div>

          <button
            onClick={handleToggleOllama}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              ollamaEnabled
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
            }`}
          >
            {ollamaEnabled ? 'Enabled' : 'Disabled'}
          </button>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          {isChecking ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Checking Ollama status...</span>
            </>
          ) : isAvailable ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <span className="text-sm text-green-700 dark:text-green-400 font-semibold">
                Ollama is running • {availableModels.length} model{availableModels.length !== 1 ? 's' : ''} available
              </span>
              <button
                onClick={checkOllamaStatus}
                className="ml-auto text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Refresh
              </button>
            </>
          ) : (
            <>
              <XCircle className="w-5 h-5 text-red-500" />
              <span className="text-sm text-red-700 dark:text-red-400 font-semibold">
                Ollama not detected
              </span>
              <button
                onClick={() => setShowSetupInstructions(!showSetupInstructions)}
                className="ml-auto text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Setup Guide
              </button>
            </>
          )}
        </div>
      </div>

      {/* Setup Instructions (shown when Ollama is not available) */}
      {!isAvailable && showSetupInstructions && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-start gap-3 mb-3">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Quick Setup (2 minutes)</h4>
              <ol className="text-sm space-y-2 text-blue-800 dark:text-blue-200">
                <li className="flex items-start gap-2">
                  <span className="font-bold">1.</span>
                  <div>
                    Download Ollama from{' '}
                    <a
                      href="https://ollama.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                    >
                      ollama.com
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">2.</span>
                  <div>
                    Install Ollama (takes ~30 seconds)
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">3.</span>
                  <div>
                    Open Terminal and run:{' '}
                    <code className="bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded">
                      ollama pull llama3.2:3b
                    </code>
                  </div>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold">4.</span>
                  <div>
                    Refresh this page - you're done!
                  </div>
                </li>
              </ol>
            </div>
          </div>
        </div>
      )}

      {/* Model Selection (shown when Ollama is available) */}
      {isAvailable && availableModels.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Select Model
          </h4>

          <div className="space-y-2">
            {RECOMMENDED_MODELS.map((model) => {
              const isInstalled = availableModels.includes(model.name);
              const isSelected = selectedModel === model.name;

              return (
                <div
                  key={model.name}
                  className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 hover:border-gray-300'
                  }`}
                  onClick={() => isInstalled && handleModelChange(model.name)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-semibold text-gray-900 dark:text-white">
                          {model.displayName}
                        </h5>
                        {model.recommended && (
                          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded-full">
                            Recommended
                          </span>
                        )}
                        {isInstalled && (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{model.description}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500">Size: {model.size}</span>
                        {isSelected && (
                          <span className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            Active
                          </span>
                        )}
                      </div>
                    </div>

                    {!isInstalled && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadModel(model.name);
                        }}
                        className="ml-3 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded-lg flex items-center gap-1 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        Install
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Performance Info */}
      <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-800">
        <h4 className="font-semibold text-purple-900 dark:text-purple-100 mb-2 flex items-center gap-2">
          <Zap className="w-4 h-4" />
          Why Use Ollama?
        </h4>
        <ul className="text-sm text-purple-800 dark:text-purple-200 space-y-1">
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span><strong>10x Better Quality</strong> - True AI understanding vs pattern matching</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span><strong>100% Private</strong> - All processing happens on your computer</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span><strong>Zero Cost</strong> - No API fees, no subscription, completely free</span>
          </li>
          <li className="flex items-start gap-2">
            <span>✅</span>
            <span><strong>Auto Fallback</strong> - Works without Ollama too</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
