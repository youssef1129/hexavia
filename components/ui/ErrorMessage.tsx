'use client';

import React from 'react';

export interface ErrorMessageProps {
  title?: string;
  message: string;
  details?: string[];
  onDismiss?: () => void;
  className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'Une erreur est survenue',
  message,
  details,
  onDismiss,
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={`rounded-xl border border-red-200 bg-red-50 p-4 text-red-900 shadow-sm ${className}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 text-red-600 mt-0.5">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <div className="flex-1">
          {title && <h4 className="text-sm font-semibold text-red-800">{title}</h4>}
          <p className="text-sm text-red-700 mt-0.5">{message}</p>
          {details && details.length > 0 && (
            <ul className="mt-2 list-disc list-inside text-xs text-red-600 space-y-1">
              {details.map((detail, idx) => (
                <li key={idx}>{detail}</li>
              ))}
            </ul>
          )}
        </div>
        {onDismiss && (
          <button
            type="button"
            onClick={onDismiss}
            className="flex-shrink-0 text-red-500 hover:text-red-700 p-1"
            aria-label="Fermer l alerte"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
