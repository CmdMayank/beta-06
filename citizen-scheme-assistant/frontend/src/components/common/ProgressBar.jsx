import React from 'react';

export const ProgressBar = ({ current, total, className = '' }) => {
  const percentage = Math.min(100, Math.max(0, Math.round(((current + 1) / total) * 100)));

  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center text-xs font-medium text-slate-500 mb-1.5">
        <span>
          Step {current + 1} of {total}
        </span>
        <span className="font-semibold text-slate-700">{percentage}%</span>
      </div>
      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
        <div
          className="bg-saffron-600 h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={percentage}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>
    </div>
  );
};

