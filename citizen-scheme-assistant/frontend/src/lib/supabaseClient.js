import { createClient } from '@supabase/supabase-js';

const rememberKey = 'yojanamitra_auth_remember';
const storage = {
  getItem: (key) => (localStorage.getItem(rememberKey) === 'true' ? localStorage : sessionStorage).getItem(key),
  setItem: (key, value) => (localStorage.getItem(rememberKey) === 'true' ? localStorage : sessionStorage).setItem(key, value),
  removeItem: (key) => { sessionStorage.removeItem(key); localStorage.removeItem(key); },
};

export const supabase = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
  ? createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY, {
      auth: { storage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

export const setRememberDevice = (remember) => {
  if (remember) localStorage.setItem(rememberKey, 'true');
  else {
    localStorage.removeItem(rememberKey);
    Object.keys(localStorage).filter((key) => key.startsWith('sb-')).forEach((key) => localStorage.removeItem(key));
  }
};
