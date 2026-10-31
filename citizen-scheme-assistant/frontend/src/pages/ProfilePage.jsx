import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../i18n/LanguageContext';
import { getAuthErrorKey, useAuth } from '../auth/AuthContext';
import { STATES } from '../constants/states';

export const ProfilePage = () => {
  const { t, language, setLanguage } = useLanguage();
  const { user, profile, updateProfile, signOut, deleteProfileData } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: '', preferred_language: language, state_code: '' });
  const [error, setError] = useState(''); const [saved, setSaved] = useState(false); const [saving, setSaving] = useState(false); const [deleting, setDeleting] = useState(false);

  useEffect(() => { if (profile) setForm({ full_name: profile.full_name || '', preferred_language: profile.preferred_language || language, state_code: profile.state_code || '' }); }, [profile, language]);
  const update = (field) => (event) => { const value = event.target.value; setForm((current) => ({ ...current, [field]: value })); if (field === 'preferred_language') setLanguage(value); };
  const save = async (event) => { event.preventDefault(); setError(''); setSaved(false); setSaving(true); try { await updateProfile(form); setSaved(true); } catch (err) { setError(getAuthErrorKey(err)); } finally { setSaving(false); } };
  const logout = async () => { await signOut(); navigate('/'); };
  const remove = async () => { if (!window.confirm(t('deleteProfileConfirm', 'Delete your profile data and log out?'))) return; setDeleting(true); try { await deleteProfileData(); navigate('/'); } catch (err) { setError(getAuthErrorKey(err)); setDeleting(false); } };

  return <main className="flex-1 py-16 px-4"><div className="max-w-lg mx-auto glass-panel rounded-[32px] p-6 sm:p-8 shadow-glass-lg">
    <h1 className="text-2xl font-black text-slate-900 mb-6">{t('profileTitle', 'Profile')}</h1>
    <form onSubmit={save} className="space-y-5">
      <div><span className="block text-sm font-semibold text-slate-800 mb-2">{t('emailLabel', 'Email')}</span><p className="glass-card-subtle rounded-2xl px-4 py-3 text-sm text-slate-600">{user?.email}</p></div>
      <div><label htmlFor="profile-name" className="block text-sm font-semibold text-slate-800 mb-2">{t('fullNameLabel', 'Full name')}</label><input id="profile-name" value={form.full_name} onChange={update('full_name')} className="glass-input w-full rounded-2xl px-4 py-3 text-sm" /></div>
      <div><label htmlFor="profile-language" className="block text-sm font-semibold text-slate-800 mb-2">{t('preferredLanguageLabel', 'Preferred language')}</label><select id="profile-language" value={form.preferred_language} onChange={update('preferred_language')} className="glass-input w-full rounded-2xl px-4 py-3 text-sm"><option value="hi">हिंदी</option><option value="en">English</option></select></div>
      <div><label htmlFor="profile-state" className="block text-sm font-semibold text-slate-800 mb-2">{t('stateLabel', 'State or Union Territory')}</label><select id="profile-state" value={form.state_code} onChange={update('state_code')} className="glass-input w-full rounded-2xl px-4 py-3 text-sm"><option value="">{t('selectStatePlaceholder', 'Select your state')}</option>{STATES.map(([code, en, hi]) => <option key={code} value={code}>{language === 'hi' ? hi : en}</option>)}</select></div>
      <p className="text-xs text-slate-600 leading-relaxed">{t('profilePrivacy', 'We only save your name, language and state. We never save your income, caste, Aadhaar or your answers.')}</p>
      {saved && <p role="status" className="text-sm text-emerald-700">{t('profileSaved', 'Profile saved.')}</p>}{error && <p role="alert" className="text-sm text-rose-700">{t(error, 'Something went wrong. Please try again.')}</p>}
      <div className="flex flex-wrap gap-3"><button type="submit" disabled={saving} className="glass-dark-pill rounded-full px-5 py-3 text-sm font-semibold disabled:opacity-60">{saving ? t('working', 'Please wait...') : t('saveProfile', 'Save')}</button><button type="button" onClick={logout} className="glass-card-subtle rounded-full px-5 py-3 text-sm font-semibold text-slate-700">{t('logoutButton', 'Logout')}</button></div>
      <button type="button" onClick={remove} disabled={deleting} className="text-xs font-semibold text-rose-700 hover:underline disabled:opacity-60">{deleting ? t('working', 'Please wait...') : t('deleteProfile', 'Delete my profile data')}</button><p className="text-[11px] text-slate-500">{t('deleteProfileHint', 'This cannot be undone.')}</p>
    </form>
  </div></main>;
};
