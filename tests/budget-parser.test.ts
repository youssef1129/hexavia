import { describe, it, expect } from 'vitest';
import { parseBudget, formatBudget } from '@/lib/budget-parser';

describe('lib/budget-parser', () => {
  it('analyse un montant formate avec euros ("40 000 €")', () => {
    const res = parseBudget('40 000 €');
    expect(res.amount).toBe(40000);
    expect(res.isUncertain).toBe(false);
  });

  it('analyse une notation avec k ("15k€")', () => {
    const res = parseBudget('15k€');
    expect(res.amount).toBe(15000);
    expect(res.isUncertain).toBe(false);
  });

  it('analyse une notation avec k sans symbole monetaire ("35k")', () => {
    const res = parseBudget('35k');
    expect(res.amount).toBe(35000);
    expect(res.isUncertain).toBe(false);
  });

  it('analyse un montant avec le mot euros ("30 000 euros")', () => {
    const res = parseBudget('30 000 euros');
    expect(res.amount).toBe(30000);
    expect(res.isUncertain).toBe(false);
  });

  it('traite le point d interrogation comme un montant incertain ("?")' , () => {
    const res = parseBudget('?');
    expect(res.amount).toBeNull();
    expect(res.isUncertain).toBe(true);
  });

  it('analyse un montant nul ("0" et "0 €")', () => {
    const resZero = parseBudget('0');
    expect(resZero.amount).toBe(0);
    expect(resZero.isUncertain).toBe(false);

    const resZeroEuro = parseBudget('0 €');
    expect(resZeroEuro.amount).toBe(0);
    expect(resZeroEuro.isUncertain).toBe(false);
  });

  it('traite les valeurs vides ou indefinis', () => {
    expect(parseBudget('').amount).toBeNull();
    expect(parseBudget('   ').amount).toBeNull();
    expect(parseBudget(undefined).amount).toBeNull();
    expect(parseBudget(null).amount).toBeNull();
  });

  it('analyse un montant accompagne d un commentaire entre parentheses', () => {
    const res = parseBudget('80 000 € (deplacement des machines et formation)');
    expect(res.amount).toBe(80000);
    expect(res.isUncertain).toBe(false);
    expect(res.note).toBe('deplacement des machines et formation');
  });

  it('analyse un montant avec notation k espacee ("20 k€ par an")', () => {
    const res = parseBudget('20 k€');
    expect(res.amount).toBe(20000);
  });

  it('formate correctement pour Camille', () => {
    expect(formatBudget({ raw: '?', amount: null, isUncertain: true })).toBe('A chiffrer (?)');
    expect(formatBudget({ raw: '', amount: null, isUncertain: false })).toBe('Non renseigne');
    expect(formatBudget({ raw: '0', amount: 0, isUncertain: false })).toBe('0 € (aucun budget)');
    expect(formatBudget({ raw: '15k€', amount: 15000, isUncertain: false })).toContain('15');
  });
});
