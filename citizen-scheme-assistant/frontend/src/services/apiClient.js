/**
 * Base API Client for YojanaMitra
 * Configured with VITE_API_BASE_URL (defaults to http://localhost:8000)
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

class ApiClient {
  constructor(baseUrl = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      // Graceful error logging
      console.warn(`[ApiClient] Request to ${endpoint} failed:`, error.message);
      throw error;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  async checkHealth() {
    try {
      return await this.get('/api/v1/health');
    } catch {
      return { status: 'offline', mock_mode: true };
    }
  }
}

export const apiClient = new ApiClient();

