/**
 * Scheme API Service for YojanaMitra
 * Prepares endpoints for future Python FastAPI backend:
 * - GET /api/v1/schemes
 * - GET /api/v1/schemes/{code}
 */

import { apiClient } from './apiClient';
import { MOCK_SCHEMES } from '../data/mockSchemes';

export const schemeApi = {
  /**
   * Fetches list of schemes with optional filter parameters
   */
  async getSchemes(params = {}) {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.level && params.level !== 'all') query.set('level', params.level);
    if (params.state && params.state !== 'ALL') query.set('state', params.state);

    const queryString = query.toString();
    const endpoint = `/api/v1/schemes${queryString ? `?${queryString}` : ''}`;

    try {
      return await apiClient.get(endpoint);
    } catch {
      // Filter mock schemes locally when backend is offline
      let filtered = [...MOCK_SCHEMES];

      if (params.search) {
        const s = params.search.toLowerCase().trim();
        filtered = filtered.filter(
          (sch) =>
            sch.name.en.toLowerCase().includes(s) ||
            sch.name.hi.toLowerCase().includes(s) ||
            sch.description.en.toLowerCase().includes(s) ||
            sch.description.hi.toLowerCase().includes(s) ||
            sch.category.toLowerCase().includes(s) ||
            (sch.short_name && sch.short_name.toLowerCase().includes(s))
        );
      }

      if (params.category && params.category !== 'all') {
        filtered = filtered.filter((sch) => sch.category === params.category);
      }

      if (params.level && params.level !== 'all') {
        filtered = filtered.filter((sch) => sch.level === params.level);
      }

      if (params.state && params.state !== 'ALL') {
        filtered = filtered.filter(
          (sch) =>
            sch.applicable_states.includes('ALL') ||
            sch.applicable_states.includes(params.state) ||
            sch.state_code === params.state
        );
      }

      return {
        total: filtered.length,
        schemes: filtered,
        is_mock: true,
      };
    }
  },

  /**
   * Fetches a single scheme by its code/id
   */
  async getSchemeByCode(code) {
    try {
      return await apiClient.get(`/api/v1/schemes/${encodeURIComponent(code)}`);
    } catch {
      const found = MOCK_SCHEMES.find((s) => s.code === code || s.id === code);
      if (found) {
        return found;
      }
      throw new Error(`Scheme with code '${code}' not found.`);
    }
  },

  /**
   * Returns featured schemes for homepage
   */
  async getFeaturedSchemes() {
    try {
      const data = await apiClient.get('/api/v1/schemes?featured=true');
      return data.schemes || data;
    } catch {
      return MOCK_SCHEMES.filter((s) => s.featured);
    }
  },
};

