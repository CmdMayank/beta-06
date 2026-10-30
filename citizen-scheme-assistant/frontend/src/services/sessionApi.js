/**
 * Session API Service for Citizen Questionnaire & Eligibility Evaluation
 * Prepares endpoints for future Python FastAPI backend:
 * - POST /api/v1/sessions
 * - GET /api/v1/questions/next?sessionId={id}
 * - POST /api/v1/sessions/{id}/answers
 * - POST /api/v1/sessions/{id}/evaluate
 * - GET /api/v1/sessions/{id}/results
 */

import { apiClient } from './apiClient';
import { MOCK_QUESTIONS } from '../data/mockQuestions';
import { MOCK_RESULTS } from '../data/mockResults';

export const sessionApi = {
  /**
   * Initializes a new citizen screening session
   */
  async createSession(language = 'hi') {
    try {
      const data = await apiClient.post('/api/v1/sessions', { language });
      sessionStorage.setItem('yojanamitra_session_id', data.session_id);
      return data;
    } catch {
      // Mock fallback: create local ephemeral session
      const mockSessionId = 'sess_' + Math.random().toString(36).substring(2, 9);
      sessionStorage.setItem('yojanamitra_session_id', mockSessionId);
      sessionStorage.setItem('yojanamitra_answers', JSON.stringify({}));
      return { session_id: mockSessionId, is_mock: true };
    }
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
    try {
      return await apiClient.get(`/api/v1/questions/next?sessionId=${encodeURIComponent(sessionId)}`);
    } catch {
      // Mock fallback
      if (currentQuestionIndex < MOCK_QUESTIONS.length) {
        return {
          question: MOCK_QUESTIONS[currentQuestionIndex],
          current_index: currentQuestionIndex,
          total_questions: MOCK_QUESTIONS.length,
          has_more: currentQuestionIndex < MOCK_QUESTIONS.length - 1,
        };
      }
      return { question: null, has_more: false };
    }
  },

  /**
   * Submits an answer to the current session
   */
  async submitAnswer(sessionId, questionId, answerValue) {
    // Shared-phone privacy: save answers ephemerally in volatile sessionStorage
    const currentAnswers = JSON.parse(sessionStorage.getItem('yojanamitra_answers') || '{}');
    currentAnswers[questionId] = answerValue;
    sessionStorage.setItem('yojanamitra_answers', JSON.stringify(currentAnswers));

    try {
      return await apiClient.post(`/api/v1/sessions/${encodeURIComponent(sessionId)}/answers`, {
        question_id: questionId,
        answer: answerValue,
      });
    } catch {
      return { success: true, is_mock: true };
    }
  },

  /**
   * Triggers eligibility evaluation
   */
  async evaluateSession(sessionId) {
    try {
      return await apiClient.post(`/api/v1/sessions/${encodeURIComponent(sessionId)}/evaluate`, {});
    } catch {
      return { success: true, evaluated: true, is_mock: true };
    }
  },

  /**
   * Retrieves evaluated eligibility results
   */
  async getResults(sessionId) {
    try {
      return await apiClient.get(`/api/v1/sessions/${encodeURIComponent(sessionId)}/results`);
    } catch {
      // Return structured mock results conforming to contracts
      return MOCK_RESULTS;
    }
  },

  /**
   * Shared-phone privacy wipe: immediately clear all session answers from storage
   */
  clearSession() {
    sessionStorage.removeItem('yojanamitra_session_id');
    sessionStorage.removeItem('yojanamitra_answers');
  },
};

