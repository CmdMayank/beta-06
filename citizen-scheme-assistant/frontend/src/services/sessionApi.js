/**
 * Session API Service for Citizen Questionnaire & Eligibility Evaluation
 * Endpoints:
 * - POST /api/v1/sessions
 * - GET /api/v1/questions/next?sessionId={id}
 * - POST /api/v1/sessions/{id}/answers
 * - POST /api/v1/sessions/{id}/evaluate
 * - GET /api/v1/sessions/{id}/results
 */

import { apiClient } from './apiClient.js';
import { USE_MOCK } from '../config.js';
import { mockAdapter } from '../mock/mockAdapter.js';

export const sessionApi = {
  /**
   * Initializes a new citizen screening session
   */
  async createSession(language = 'hi') {
    if (USE_MOCK) {
      return mockAdapter.createSession(language);
    }

    const data = await apiClient.post('/api/v1/sessions', { language });
    if (data?.session_id) {
      sessionStorage.setItem('yojanamitra_session_id', data.session_id);
    }
    return data;
  },

  /**
   * Retrieves the current session ID
   */
  getSessionId() {
    return sessionStorage.getItem('yojanamitra_session_id');
  },

  /**
   * Fetches the next question for the current session
   */
  async getNextQuestion(sessionId, currentQuestionIndex = 0) {
    if (USE_MOCK) {
      return mockAdapter.getNextQuestion(sessionId, currentQuestionIndex);
    }

    return await apiClient.get(`/api/v1/questions/next?sessionId=${encodeURIComponent(sessionId)}`);
  },

  /**
   * Submits an answer to the current session
   */
  async submitAnswer(sessionId, questionId, answerValue) {
    // Shared-phone privacy: save answers ephemerally in volatile sessionStorage
    const currentAnswers = JSON.parse(sessionStorage.getItem('yojanamitra_answers') || '{}');
    currentAnswers[questionId] = answerValue;
    sessionStorage.setItem('yojanamitra_answers', JSON.stringify(currentAnswers));

    if (USE_MOCK) {
      return mockAdapter.submitAnswer(sessionId, questionId, answerValue);
    }

    return await apiClient.post(`/api/v1/sessions/${encodeURIComponent(sessionId)}/answers`, {
      question_id: questionId,
      answer: answerValue,
    });
  },

  /**
   * Triggers eligibility evaluation
   */
  async evaluateSession(sessionId) {
    if (USE_MOCK) {
      return mockAdapter.evaluateSession(sessionId);
    }

    return await apiClient.post(`/api/v1/sessions/${encodeURIComponent(sessionId)}/evaluate`, {});
  },

  /**
   * Retrieves evaluated eligibility results
   */
  async getResults(sessionId) {
    if (USE_MOCK) {
      return mockAdapter.getResults(sessionId);
    }

    return await apiClient.get(`/api/v1/sessions/${encodeURIComponent(sessionId)}/results`);
  },

  /**
   * Shared-phone privacy wipe: immediately clear all session answers from storage
   */
  clearSession() {
    sessionStorage.removeItem('yojanamitra_session_id');
    sessionStorage.removeItem('yojanamitra_answers');
  },
};
