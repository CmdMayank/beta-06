/**
 * Scheme API Service for Scheme Sahayak
 * Endpoints:
 * - GET /api/v1/schemes
 * - GET /api/v1/schemes/{code}
 */

import { apiClient } from './apiClient';
import { USE_MOCK } from '../config';
import { mockAdapter } from '../mock/mockAdapter';

export const schemeApi = {
  /**
   * Fetches list of schemes with optional filter parameters
   */
  async getSchemes(params = {}) {
    if (USE_MOCK) {
      return mockAdapter.getSchemes(params);
    }

    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.level && params.level !== 'all') query.set('level', params.level);
    if (params.state && params.state !== 'ALL') query.set('state', params.state);

    const queryString = query.toString();
    const endpoint = `/api/v1/schemes${queryString ? `?${queryString}` : ''}`;

    return await apiClient.get(endpoint);
  },

  /**
   * Fetches a single scheme by its code/id
   */
  async getSchemeByCode(code) {
    if (USE_MOCK) {
      return mockAdapter.getSchemeByCode(code);
    }

    return await apiClient.get(`/api/v1/schemes/${encodeURIComponent(code)}`);
  },

  /**
   * Returns featured schemes for homepage
   */
  async getFeaturedSchemes() {
    if (USE_MOCK) {
      return mockAdapter.getFeaturedSchemes();
    }

    const data = await apiClient.get('/api/v1/schemes?featured=true');
    return data.schemes || data;
  },

  /**
   * Gets total count of available schemes
   */
  async getSchemesCount() {
    if (USE_MOCK) {
      return mockAdapter.getMockSchemesCount();
    }

    try {
      const data = await apiClient.get('/api/v1/schemes');
      return data.total || (data.schemes ? data.schemes.length : 0);
    } catch {
      return 0;
    }
  },
};
