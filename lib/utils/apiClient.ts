/**
 * Enhanced API client with retries, caching, and error handling
 */

export interface APIClientOptions {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
}

export class APIClient {
  private baseURL: string;
  private timeout: number;
  private retries: number;
  private retryDelay: number;
  private headers: Record<string, string>;

  constructor(options: APIClientOptions = {}) {
    this.baseURL = options.baseURL || '';
    this.timeout = options.timeout || 30000;
    this.retries = options.retries || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.headers = options.headers || {};
  }

  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    attempt = 0
  ): Promise<Response> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok && attempt < this.retries) {
        await new Promise((resolve) =>
          setTimeout(resolve, this.retryDelay * (attempt + 1))
        );
        return this.fetchWithRetry(url, options, attempt + 1);
      }

      return response;
    } catch (error) {
      if (attempt < this.retries) {
        await new Promise((resolve) =>
          setTimeout(resolve, this.retryDelay * (attempt + 1))
        );
        return this.fetchWithRetry(url, options, attempt + 1);
      }
      throw error;
    }
  }

  async get<T>(endpoint: string, config?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await this.fetchWithRetry(url, {
      ...config,
      method: 'GET',
      headers: { ...this.headers, ...config?.headers },
    });

    return response.json();
  }

  async post<T>(endpoint: string, data?: any, config?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await this.fetchWithRetry(url, {
      ...config,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...this.headers,
        ...config?.headers,
      },
      body: JSON.stringify(data),
    });

    return response.json();
  }

  async put<T>(endpoint: string, data?: any, config?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await this.fetchWithRetry(url, {
      ...config,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...this.headers,
        ...config?.headers,
      },
      body: JSON.stringify(data),
    });

    return response.json();
  }

  async delete<T>(endpoint: string, config?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await this.fetchWithRetry(url, {
      ...config,
      method: 'DELETE',
      headers: { ...this.headers, ...config?.headers },
    });

    return response.json();
  }
}

export const apiClient = new APIClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
});
