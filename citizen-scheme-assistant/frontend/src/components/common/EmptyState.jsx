import React from 'react';
import { SearchX } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = SearchX,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`text-center py-12 px-6 bg-white border border-dashed border-slate-300 rounded-2xl max-w-lg mx-auto ${className}`}
    >
      <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-500">
        <Icon className="w-7 h-7" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-2">{title}</h3>
      {description && <p className="text-sm text-slate-600 mb-6 max-w-sm mx-auto">{description}</p>}
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 shadow-sm text-sm font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

