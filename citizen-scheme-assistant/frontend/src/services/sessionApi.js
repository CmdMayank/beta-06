/**
 * Session API Service for Citizen Questionnaire & Eligibility Evaluation
 * Prepares endpoints for future Python FastAPI backend:
 * - POST /api/v1/sessions
 * - GET /api/v1/questions/next?sessionId={id}
 * - POST /api/v1/sessions/{id}/answers
 * - POST /api/v1/sessions/{id}/evaluate
 * - GET /api/v1/sessions/{id}/results
 */

import { apiClient } from './apiClient.js';
import { MOCK_QUESTIONS } from '../data/mockQuestions.js';
import { MOCK_RESULTS } from '../data/mockResults.js';

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
      // Dynamic local evaluation based on citizen's actual answers in sessionStorage
      const saved = sessionStorage.getItem('yojanamitra_answers');
      const answers = saved ? JSON.parse(saved) : {};

      const evaluatedResults = MOCK_RESULTS.results.map((baseScheme) => {
        const item = JSON.parse(JSON.stringify(baseScheme));

        if (item.scheme_id === 'pm-kisan') {
          const isTaxpayer = answers.q_household_attributes?.includes('pays_income_tax');
          const ownsLand = answers.q_owns_land === true;

          if (answers.q_owns_land === false) {
            item.status = 'NOT_ELIGIBLE_UNDER_SCREENED_RULES';
            item.confidence_score = 1.0;
            item.explanation = {
              en: 'You stated that your family does not own cultivable agricultural land. Ownership of agricultural land is mandatory for PM-KISAN.',
              hi: 'आपने बताया कि आपके परिवार के पास कृषि भूमि नहीं है। पीएम-किसान योजना के लिए कृषि भूमि का स्वामित्व अनिवार्य है.',
            };
          } else if (isTaxpayer) {
            item.status = 'NOT_ELIGIBLE_UNDER_SCREENED_RULES';
            item.confidence_score = 1.0;
            item.explanation = {
              en: 'Income tax-paying families and institutional landholders are excluded from PM-KISAN benefits.',
              hi: 'आयकर भरने वाले परिवार और संस्थागत भूमिधारक पीएम-किसान योजना के दायरे से बाहर हैं।',
            };
          } else if (ownsLand || answers.q_occupation === 'farmer') {
            item.status = 'POTENTIALLY_ELIGIBLE';
            item.confidence_score = 0.95;
          }
        }

        if (item.scheme_id === 'pmay-g') {
          const isUrban = answers.q_area_type === 'urban';
          const hasVehicle = answers.q_household_attributes?.includes('owns_car_tractor');
          const isPucca = answers.q_housing_type === 'pucca';

          if (isUrban) {
            item.status = 'NOT_ELIGIBLE_UNDER_SCREENED_RULES';
            item.confidence_score = 1.0;
            item.explanation = {
              en: 'PMAY-G is strictly targeted for rural village areas. For municipal/city zones, please check PMAY-Urban.',
              hi: 'पीएमएवाई-जी विशेष रूप से ग्रामीण क्षेत्रों के लिए है। शहरी क्षेत्रों हेतु कृपया पीएमएवाई-शहरी देखें।',
            };
          } else if (hasVehicle || isPucca) {
            item.status = 'NOT_ELIGIBLE_UNDER_SCREENED_RULES';
            item.confidence_score = 0.95;
            item.explanation = {
              en: 'Households living in pucca houses or owning a four-wheeler vehicle do not satisfy primary deprivation criteria for PMAY-G.',
              hi: 'पक्के मकान में रहने वाले अथवा चार पहिया वाहन धारक परिवार पीएमएवाई-जी के प्राथमिक पात्रता मानकों में नहीं आते।',
            };
          } else if (
            answers.q_area_type === 'rural' &&
            (answers.q_housing_type === 'kutcha' || answers.q_housing_type === 'homeless_rented')
          ) {
            item.status = 'POTENTIALLY_ELIGIBLE';
            item.confidence_score = 0.9;
          }
        }

        if (item.scheme_id === 'ladli-behna-mp') {
          const isMale = answers.q_gender === 'male';
          const isOutsideMP =
            answers.q_state && answers.q_state !== 'MP' && answers.q_state !== 'OTHER';
          const highIncome =
            answers.q_family_income && Number(answers.q_family_income) > 250000;
          const isTaxpayer = answers.q_household_attributes?.includes('pays_income_tax');

          if (isMale) {
            item.status = 'NOT_ELIGIBLE_UNDER_SCREENED_RULES';
            item.confidence_score = 1.0;
            item.explanation = {
              en: 'Mukhyamantri Ladli Behna Yojana is exclusively for women. Male applicants are not eligible.',
              hi: 'मुख्यमंत्री लाड़ली बहना योजना केवल महिला आवेदकों के लिए है। पुरुष आवेदक इसके लिए अपात्र हैं।',
            };
          } else if (isOutsideMP) {
            item.status = 'NOT_ELIGIBLE_UNDER_SCREENED_RULES';
            item.confidence_score = 1.0;
            item.explanation = {
              en: 'This scheme is strictly for permanent residents of Madhya Pradesh.',
              hi: 'यह योजना केवल मध्य प्रदेश के स्थायी निवासियों के लिए है।',
            };
          } else if (highIncome || isTaxpayer) {
            item.status = 'NOT_ELIGIBLE_UNDER_SCREENED_RULES';
            item.confidence_score = 0.95;
            item.explanation = {
              en: 'Households with annual income exceeding ₹2.5 Lakhs or paying income tax are excluded from Ladli Behna.',
              hi: '₹2.5 लाख से अधिक वार्षिक आय अथवा आयकरदाता परिवार लाड़ली बहना योजना से बाहर हैं।',
            };
          } else if (answers.q_gender === 'female') {
            item.status = 'NEEDS_VERIFICATION';
            item.confidence_score = 0.65;
          }
        }

        if (item.scheme_id === 'pm-vishwakarma') {
          if (answers.q_occupation === 'artisan') {
            item.status = 'POTENTIALLY_ELIGIBLE';
            item.confidence_score = 0.9;
            item.explanation = {
              en: 'As a traditional artisan or craftsperson, you appear eligible for ₹15,000 toolkit support and 5% collateral-free credit.',
              hi: 'पारंपरिक कारीगर / शिल्पकार होने के नाते आप ₹15,000 टूलकिट अनुदान एवं रियायती ऋण पाने हेतु पात्र प्रतीत होते हैं।',
            };
          } else {
            item.status = 'NEEDS_VERIFICATION';
            item.confidence_score = 0.55;
          }
        }

        if (item.scheme_id === 'pm-ujjwala') {
          const isMale = answers.q_gender === 'male';
          const hasLpg = answers.q_household_attributes?.includes('has_existing_lpg');

          if (isMale) {
            item.status = 'NOT_ELIGIBLE_UNDER_SCREENED_RULES';
            item.confidence_score = 1.0;
            item.explanation = {
              en: 'Ujjwala 2.0 connections are released exclusively in the name of an adult woman of the household.',
              hi: 'उज्ज्वला 2.0 गैस कनेक्शन केवल परिवार की वयस्क महिला के नाम पर जारी किया जाता है।',
            };
          } else if (hasLpg) {
            item.status = 'NOT_ELIGIBLE_UNDER_SCREENED_RULES';
            item.confidence_score = 1.0;
            item.explanation = {
              en: 'Your responses indicate an existing active LPG cylinder connection. Ujjwala 2.0 provides connections only to households without any LPG connection.',
              hi: 'आपके घर में पहले से रसोई गैस कनेक्शन उपलब्ध है। उज्ज्वला योजना केवल बिना गैस कनेक्शन वाले परिवारों के लिए है।',
            };
          } else if (
            answers.q_gender === 'female' &&
            (answers.q_household_attributes?.includes('has_bpl_card') ||
              (answers.q_family_income && Number(answers.q_family_income) <= 200000))
          ) {
            item.status = 'POTENTIALLY_ELIGIBLE';
            item.confidence_score = 0.9;
            item.explanation = {
              en: 'As an eligible female applicant from a low-income household without an active LPG connection, you qualify for a deposit-free gas connection.',
              hi: 'बिना गैस कनेक्शन वाले निम्न आय परिवार की महिला होने के नाते आप मुफ्त गैस कनेक्शन पाने हेतु पात्र हैं।',
            };
          }
        }

        return item;
      });

      const eligible = evaluatedResults.filter((r) => r.status === 'POTENTIALLY_ELIGIBLE').length;
      const needsVerification = evaluatedResults.filter((r) => r.status === 'NEEDS_VERIFICATION').length;
      const notEligible = evaluatedResults.filter(
        (r) => r.status === 'NOT_ELIGIBLE_UNDER_SCREENED_RULES'
      ).length;

      return {
        timestamp: new Date().toISOString(),
        schemes_evaluated: evaluatedResults.length,
        summary_counts: {
          potentially_eligible: eligible,
          needs_verification: needsVerification,
          not_eligible: notEligible,
        },
        results: evaluatedResults,
        is_mock: true,
      };
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

