/**
 * OLLAMA CLIENT
 * Connects to local Ollama instance for true transformer-based LLM responses
 * Falls back gracefully when Ollama is not available
 */

import { SleepData, ActivityData, ReadinessData } from '../oura-api';

export interface OllamaModel {
  name: string;
  displayName: string;
  size: string;
  description: string;
  recommended: boolean;
}

export const RECOMMENDED_MODELS: OllamaModel[] = [
  {
    name: 'llama3.2:3b',
    displayName: 'Llama 3.2 (3B)',
    size: '2.0GB',
    description: 'Fast, efficient, great for health analysis',
    recommended: true,
  },
  {
    name: 'phi3.5:3.8b',
    displayName: 'Phi 3.5 (3.8B)',
    size: '2.3GB',
    description: 'Microsoft model, excellent reasoning',
    recommended: true,
  },
  {
    name: 'gemma2:9b',
    displayName: 'Gemma 2 (9B)',
    size: '5.4GB',
    description: 'Google model, very capable',
    recommended: false,
  },
  {
    name: 'llama3.2:1b',
    displayName: 'Llama 3.2 (1B)',
    size: '1.3GB',
    description: 'Smallest, fastest, lower quality',
    recommended: false,
  },
];

export interface OllamaResponse {
  model: string;
  created_at: string;
  response: string;
  done: boolean;
  context?: number[];
  total_duration?: number;
  load_duration?: number;
  prompt_eval_duration?: number;
  eval_duration?: number;
}

export interface OllamaGenerateRequest {
  model: string;
  prompt: string;
  stream?: boolean;
  options?: {
    temperature?: number;
    top_k?: number;
    top_p?: number;
    num_predict?: number;
  };
}

export class OllamaClient {
  private baseUrl: string = 'http://localhost:11434';
  private defaultModel: string = 'llama3.2:3b';
  private isAvailable: boolean | null = null;
  private lastHealthCheck: number = 0;
  private healthCheckInterval: number = 30000; // 30 seconds

  constructor(baseUrl?: string, defaultModel?: string) {
    if (baseUrl) this.baseUrl = baseUrl;
    if (defaultModel) this.defaultModel = defaultModel;
  }

  /**
   * Check if Ollama is running and available
   */
  async checkHealth(): Promise<boolean> {
    const now = Date.now();

    // Cache health check for 30 seconds
    if (this.isAvailable !== null && (now - this.lastHealthCheck) < this.healthCheckInterval) {
      return this.isAvailable;
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000), // 2 second timeout
      });

      this.isAvailable = response.ok;
      this.lastHealthCheck = now;
      return this.isAvailable;
    } catch (error) {
      this.isAvailable = false;
      this.lastHealthCheck = now;
      return false;
    }
  }

  /**
   * Get list of available models
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000),
      });

      if (!response.ok) return [];

      const data = await response.json();
      return data.models?.map((m: any) => m.name) || [];
    } catch (error) {
      return [];
    }
  }

  /**
   * Generate a response using Ollama
   */
  async generate(
    prompt: string,
    model?: string,
    options?: {
      temperature?: number;
      top_k?: number;
      top_p?: number;
      max_tokens?: number;
    }
  ): Promise<string> {
    const modelToUse = model || this.defaultModel;

    const request: OllamaGenerateRequest = {
      model: modelToUse,
      prompt,
      stream: false,
      options: {
        temperature: options?.temperature || 0.7,
        top_k: options?.top_k || 40,
        top_p: options?.top_p || 0.9,
        num_predict: options?.max_tokens || 500,
      },
    };

    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      if (!response.ok) {
        throw new Error(`Ollama request failed: ${response.statusText}`);
      }

      const data: OllamaResponse = await response.json();
      return data.response;
    } catch (error) {
      console.error('Ollama generation error:', error);
      throw error;
    }
  }

  /**
   * Generate health analysis using Ollama with context
   */
  async generateHealthAnalysis(
    question: string,
    healthData: {
      sleep: SleepData[];
      activity: ActivityData[];
      readiness: ReadinessData[];
    },
    model?: string
  ): Promise<string> {
    // Build context from health data
    const latestSleep = healthData.sleep[healthData.sleep.length - 1];
    const latestReadiness = healthData.readiness[healthData.readiness.length - 1];
    const latestActivity = healthData.activity[healthData.activity.length - 1];

    // Calculate averages
    const avgSleep = healthData.sleep.slice(-7).reduce((sum, s) => sum + s.score, 0) / Math.min(7, healthData.sleep.length);
    const avgReadiness = healthData.readiness.slice(-7).reduce((sum, r) => sum + r.score, 0) / Math.min(7, healthData.readiness.length);

    // Build comprehensive prompt
    const prompt = `You are a knowledgeable health coach analyzing Oura Ring data. Provide a helpful, conversational analysis.

Current Health Data:
- Latest Sleep Score: ${latestSleep.score}/100
- Sleep Duration: ${(latestSleep.total_sleep_duration / 3600).toFixed(1)} hours
- Sleep Efficiency: ${latestSleep.efficiency}%
- Deep Sleep: ${(latestSleep.deep_sleep_duration / 60).toFixed(0)} minutes
- REM Sleep: ${(latestSleep.rem_sleep_duration / 60).toFixed(0)} minutes

- Latest Readiness Score: ${latestReadiness.score}/100
- Resting Heart Rate: ${latestReadiness.resting_heart_rate} bpm
${latestReadiness.average_hrv ? `- HRV: ${latestReadiness.average_hrv.toFixed(0)} ms` : ''}
${latestReadiness.temperature_deviation ? `- Temperature Deviation: ${latestReadiness.temperature_deviation > 0 ? '+' : ''}${latestReadiness.temperature_deviation.toFixed(2)}°C` : ''}

- Latest Activity Score: ${latestActivity.score}/100

7-Day Averages:
- Sleep Score: ${avgSleep.toFixed(0)}/100
- Readiness Score: ${avgReadiness.toFixed(0)}/100

User Question: ${question}

Provide a thoughtful, personalized response that:
1. Directly answers their question
2. Explains WHY based on their specific data
3. Gives actionable advice if relevant
4. Is conversational and empathetic (not robotic)
5. Keeps response under 200 words

Response:`;

    return this.generate(prompt, model, {
      temperature: 0.7,
      top_p: 0.9,
      max_tokens: 300,
    });
  }

  /**
   * Set the default model to use
   */
  setDefaultModel(model: string): void {
    this.defaultModel = model;
  }

  /**
   * Get the current default model
   */
  getDefaultModel(): string {
    return this.defaultModel;
  }

  /**
   * Check if a specific model is available
   */
  async isModelAvailable(modelName: string): Promise<boolean> {
    const models = await this.getAvailableModels();
    return models.includes(modelName);
  }
}

// Export singleton instance
export const ollamaClient = new OllamaClient();
