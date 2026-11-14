'use client';

import React from 'react';
import { getThemeColor } from '@/lib/theme';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'theme' | 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'duplicate';
  themeName?: string;
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  themeName,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  }[size];

  if (variant === 'theme' && themeName) {
    const colors = getThemeColor(themeName);
    return (
      <span
        className={`inline-flex items-center font-medium rounded-full border ${colors.bg} ${colors.text} ${colors.border} ${sizeClasses} ${className}`}
      >
        {children}
      </span>
    );
  }

  const variantClasses = {
    theme: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-blue-50 text-blue-700 border-blue-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200',
    duplicate: 'bg-orange-50 text-orange-700 border-orange-300 font-semibold',
  }[variant];

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variantClasses} ${sizeClasses} ${className}`}
    >
      {children}
    </span>
  );
};
