// Jetons de design (design tokens) unifies pour le kit Hexavia

export const themeTokens = {
  colors: {
    primary: {
      light: '#3b82f6',
      DEFAULT: '#2563eb',
      dark: '#1d4ed8',
      contrast: '#ffffff',
    },
    industrial: {
      light: '#f1f5f9',
      DEFAULT: '#0f172a',
      subtle: '#64748b',
    },
    success: {
      bg: '#ecfdf5',
      text: '#065f46',
      border: '#a7f3d0',
    },
    warning: {
      bg: '#fffbeb',
      text: '#92400e',
      border: '#fde68a',
    },
    danger: {
      bg: '#fef2f2',
      text: '#991b1b',
      border: '#fecaca',
    },
    info: {
      bg: '#eff6ff',
      text: '#1e40af',
      border: '#bfdbfe',
    },
  },
  themes: {
    'Énergie': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    'Process': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
    'RH & bien-être': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
    'Sécurité': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
    'Client': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
    'Environnement': { bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
    'Digital': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    'Non renseigné': { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
    'Non renseigne': { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-200' },
  } as Record<string, { bg: string; text: string; border: string }>,
};

export function getThemeColor(themeName: string): { bg: string; text: string; border: string } {
  return (
    themeTokens.themes[themeName] || {
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-300',
    }
  );
}
