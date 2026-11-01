// Vite replaces this configuration at build time. Hosted browsers must never
// default to their own loopback address; an empty base uses a same-origin proxy.
export function resolveApiBase(env = {}) {
  const configured = env.VITE_API_BASE_URL?.trim();
  if (configured) return configured.replace(/\/+$/, '');
  return env.PROD === true || env.MODE === 'production' ? '' : 'http://127.0.0.1:8002';
}

export const API_BASE_URL = resolveApiBase(import.meta.env);
