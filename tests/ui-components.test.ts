import { describe, it, expect } from 'vitest';
import { themeTokens, getThemeColor } from '@/lib/theme';

describe('UI Design Tokens & Components logic', () => {
  it('fournit des jetons de couleurs valides pour chaque theme metier', () => {
    const energyTheme = getThemeColor('Énergie');
    expect(energyTheme.bg).toContain('emerald');
    expect(energyTheme.text).toContain('emerald');

    const processTheme = getThemeColor('Process');
    expect(processTheme.bg).toContain('blue');

    const fallbackTheme = getThemeColor('ThemeInconnu');
    expect(fallbackTheme.bg).toContain('slate');
  });

  it('valide la presence des couleurs principales et etats', () => {
    expect(themeTokens.colors.primary.DEFAULT).toBe('#2563eb');
    expect(themeTokens.colors.success.text).toBeTruthy();
    expect(themeTokens.colors.danger.text).toBeTruthy();
    expect(themeTokens.colors.warning.text).toBeTruthy();
  });
});
