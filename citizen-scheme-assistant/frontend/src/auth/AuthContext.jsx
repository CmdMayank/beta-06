import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase, setRememberDevice } from '../lib/supabaseClient';
import { useLanguage } from '../i18n/LanguageContext';

const AuthContext = createContext(null);

const profileFields = 'id, full_name, preferred_language, state_code';

const AuthProvider = ({ children }) => {
  const { setLanguage } = useLanguage();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(supabase));

  const ensureProfile = async (currentUser, defaults = {}) => {
    const { data, error } = await supabase.from('profiles').select(profileFields).eq('id', currentUser.id).maybeSingle();
    if (error) throw error;
    if (data) {
      setProfile(data);
      if (data.preferred_language) setLanguage(data.preferred_language);
      return data;
    }
    const values = {
      id: currentUser.id,
      full_name: defaults.full_name || currentUser.user_metadata?.full_name || '',
      preferred_language: defaults.preferred_language || currentUser.user_metadata?.preferred_language || 'hi',
      state_code: defaults.state_code || '',
    };
    const result = await supabase.from('profiles').upsert(values, { onConflict: 'id' }).select(profileFields).single();
    if (result.error) throw result.error;
    setProfile(result.data);
    setLanguage(result.data.preferred_language);
    return result.data;
  };

  useEffect(() => {
    let active = true;
    if (!supabase) return () => { active = false; };
    const load = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (active && data.session?.user) {
          setUser(data.session.user);
          await ensureProfile(data.session.user);
        }
      } finally { if (active) setLoading(false); }
    };
    load();
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      setUser(session?.user || null);
      if (!session?.user) { setProfile(null); setLoading(false); }
      else if (event !== 'INITIAL_SESSION') ensureProfile(session.user).catch(() => {}).finally(() => setLoading(false));
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  const signUp = async ({ email, password, fullName, preferredLanguage }) => {
    if (!supabase) return { needsConfirmation: false };
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: fullName, preferred_language: preferredLanguage } } });
    if (error) throw error;
    if (data.session?.user) await ensureProfile(data.session.user, { full_name: fullName, preferred_language: preferredLanguage });
    return { ...data, needsConfirmation: !data.session };
  };

  const signIn = async ({ email, password, remember }) => {
    if (!supabase) return {};
    setRememberDevice(remember);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    if (data.user) await ensureProfile(data.user);
    return data;
  };

  const signOut = async () => {
    try { if (supabase) await supabase.auth.signOut(); }
    finally {
      ['yojanamitra_session_id', 'yojanamitra_answers', 'yojanamitra_results'].forEach((key) => sessionStorage.removeItem(key));
      setUser(null); setProfile(null);
    }
  };

  const updateProfile = async (updates) => {
    const values = { full_name: updates.full_name || '', preferred_language: updates.preferred_language === 'en' ? 'en' : 'hi', state_code: updates.state_code || '' };
    const { data, error } = await supabase.from('profiles').update(values).eq('id', user.id).select(profileFields).single();
    if (error) throw error;
    setProfile(data); setLanguage(data.preferred_language); return data;
  };

  const deleteProfileData = async () => {
    const { error } = await supabase.from('profiles').delete().eq('id', user.id);
    if (error) throw error;
    await signOut();
  };

  return <AuthContext.Provider value={{ user, profile, loading, available: Boolean(supabase), signUp, signIn, signOut, updateProfile, deleteProfileData }}>{children}</AuthContext.Provider>;
};

export { AuthProvider };
export const useAuth = () => useContext(AuthContext);

export const getAuthErrorKey = (error) => {
  const message = String(error?.message || '').toLowerCase();
  if (message.includes('invalid login credentials')) return 'authInvalidCredentials';
  if (message.includes('already registered')) return 'authAlreadyRegistered';
  if (message.includes('password')) return 'authWeakPassword';
  if (message.includes('rate limit')) return 'authRateLimit';
  if (message.includes('network') || message.includes('fetch')) return 'authNetworkError';
  return 'authGenericError';
};
