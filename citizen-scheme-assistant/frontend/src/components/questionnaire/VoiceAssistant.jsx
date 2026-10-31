import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import { useLanguage } from '../../i18n/LanguageContext';

export const VoiceAssistant = ({ textToRead = '', onSpeechResult }) => {
  const { t, language } = useLanguage();
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [hasSpeechRecognition, setHasSpeechRecognition] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setHasSpeechRecognition(true);
      }
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
    };
  }, []);

  // Cancel speech whenever the question text or language changes
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
      setIsListening(false);
    }
  }, [textToRead, language]);

  const handleReadAloud = () => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.95;

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleSpeechInput = () => {
    if (!hasSpeechRecognition) return;

    // Stop any previous recognition before starting a new one
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = language === 'hi' ? 'hi-IN' : 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript.trim();
      if (onSpeechResult) {
        onSpeechResult(transcript);
      }
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="flex items-center gap-2">
      {/* Read Aloud button */}
      <button
        type="button"
        onClick={handleReadAloud}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:outline-none ${isSpeaking
            ? 'bg-orange-500 text-white shadow-sm animate-pulse'
            : 'glass-card-subtle text-slate-700 hover:text-slate-900 hover:bg-white'
          }`}
        title={isSpeaking ? t('voiceStop') : t('voiceReadAloud')}
      >
        {isSpeaking ? (
          <>
            <VolumeX className="w-3.5 h-3.5" />
            <span>{t('voiceSpeaking', 'Reading...')}</span>
          </>
        ) : (
          <>
            <Volume2 className="w-3.5 h-3.5 text-slate-500" />
            <span>{t('voiceReadAloud', 'Read Aloud')}</span>
          </>
        )}
      </button>

      {/* Speech Input button (if supported) */}
      {hasSpeechRecognition && onSpeechResult && (
        <button
          type="button"
          onClick={handleSpeechInput}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${isListening
              ? 'bg-rose-500 text-white shadow-sm animate-pulse'
              : 'glass-card-subtle text-slate-700 hover:text-slate-900 hover:bg-white'
            }`}
          title={isListening ? t('voiceListening') : t('voiceInput')}
        >
          {isListening ? (
            <>
              <MicOff className="w-3.5 h-3.5" />
              <span>{t('voiceListening', 'Listening...')}</span>
            </>
          ) : (
            <>
              <Mic className="w-3.5 h-3.5 text-slate-500" />
              <span>{t('voiceInput', 'Speak')}</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};