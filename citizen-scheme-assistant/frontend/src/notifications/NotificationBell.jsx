import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ArrowRight, X } from 'lucide-react';
import { useNotifications } from './NotificationContext';
import { useLanguage } from '../i18n/LanguageContext';

export const NotificationBell = () => {
  const { notifications, unseenCount, dismissNotification, dismissAll } = useNotifications();
  const { t, getLocalized } = useLanguage();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // If zero new matches, show nothing in the navbar (no empty bell state)
  if (!unseenCount || unseenCount === 0) {
    return null;
  }

  // Display top 3-5 notifications
  const displayedNotifications = notifications.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative min-w-[40px] min-h-[40px] inline-flex items-center justify-center rounded-full text-slate-700 hover:text-slate-900 hover:bg-white/60 transition cursor-pointer"
        aria-label={`${t('notificationsTitle', 'Notifications')} (${unseenCount})`}
        aria-expanded={open}
      >
        <Bell className="w-4 h-4 text-orange-600" />
        <span className="absolute 0 top-1 right-1 bg-orange-600 text-white rounded-full text-[10px] w-4 h-4 flex items-center justify-center font-bold shadow-xs ring-2 ring-white">
          {unseenCount}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 glass-panel rounded-2xl p-4 shadow-glass-lg border border-white/90 z-50 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900">
                {t('notificationsTitle', 'Notifications')}
              </span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">
                {unseenCount}
              </span>
            </div>
            <button
              type="button"
              onClick={dismissAll}
              className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition"
            >
              {t('markAllAsRead', 'Mark as read')}
            </button>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto">
            {displayedNotifications.map((item) => {
              const name = getLocalized(item.scheme_name) || item.scheme_id;
              const message = t(
                'notificationSchemeEligible',
                'Based on your profile, you may qualify for {name}.'
              ).replace('{name}', name);

              return (
                <div
                  key={item.id}
                  className="glass-card-subtle rounded-xl p-3 flex flex-col gap-2 relative group"
                >
                  <button
                    type="button"
                    onClick={() => dismissNotification(item.id)}
                    className="absolute top-2.5 right-2.5 text-slate-400 hover:text-slate-700 p-0.5 rounded-full"
                    aria-label={t('dismissNotification', 'Dismiss')}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>

                  <p className="text-xs text-slate-700 leading-snug pr-4">
                    {message}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <Link
                      to={`/schemes/${item.scheme_id}`}
                      onClick={() => {
                        dismissNotification(item.id);
                        setOpen(false);
                      }}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-700 hover:text-orange-800 hover:underline"
                    >
                      <span>{t('viewSchemeDetails', 'View Details')}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

