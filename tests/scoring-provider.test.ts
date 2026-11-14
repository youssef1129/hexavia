import { describe, it, expect } from 'vitest';
import { MockScoringProvider, LlmScoringProvider, getScoringProvider } from '@/lib/scoring-provider';
import { Idea } from '@/types/idea';

const sampleIdea: Idea = {
  id: 'IDEA-001',
  dateDepot: '2026-09-15',
  dateDepotRaw: '2026-09-15',
  prenom: 'Julie',
  nom: 'Marchand',
  direction: 'Maintenance',
  site: 'Lyon',
  theme: 'Énergie',
  titre: 'Capteurs de vibration sur les compresseurs',
  description:
    'Installer des capteurs de vibration connectes sur les 12 compresseurs du site de Lyon pour detecter les signes d usure avant la panne.',
  beneficesAttendus: 'Moins d arrets non planifies, environ 3 jours de production gagnes par an',
  budgetEstimeRaw: '40 000 €',
  budget: { raw: '40 000 €', amount: 40000, isUncertain: false },
  status: 'nouveau',
};

const trivialIdea: Idea = {
  id: 'IDEA-015',
  dateDepot: '2026-09-24',
  dateDepotRaw: '2026-09-24',
  prenom: 'Paul',
  nom: 'Girard',
  direction: 'Production',
  site: 'Grenoble',
  theme: 'Non renseigne',
  titre: 'Café gratuit',
  description: 'Rendre le cafe gratuit dans tous les ateliers.',
  beneficesAttendus: 'Moral des equipes',
  budgetEstimeRaw: '',
  budget: { raw: '', amount: null, isUncertain: false },
  status: 'nouveau',
};

describe('lib/scoring-provider', () => {
  it('evalue une idee industrielle avec des scores coherents et une justification en francais', async () => {
    const provider = new MockScoringProvider();
    const evaluation = await provider.evaluateIdea(sampleIdea);

    expect(evaluation.criteria.businessImpact).toBeGreaterThanOrEqual(1);
    expect(evaluation.criteria.businessImpact).toBeLessThanOrEqual(5);
    expect(evaluation.criteria.feasibility).toBeGreaterThanOrEqual(1);
    expect(evaluation.criteria.feasibility).toBeLessThanOrEqual(5);
    expect(evaluation.criteria.strategicAlignment).toBeGreaterThanOrEqual(1);
    expect(evaluation.criteria.strategicAlignment).toBeLessThanOrEqual(5);
    expect(evaluation.criteria.innovation).toBeGreaterThanOrEqual(1);
    expect(evaluation.criteria.innovation).toBeLessThanOrEqual(5);

    expect(evaluation.total).toBe(
      evaluation.criteria.businessImpact +
        evaluation.criteria.feasibility +
        evaluation.criteria.strategicAlignment +
        evaluation.criteria.innovation
    );

    expect(evaluation.justification).toBeTruthy();
    expect(evaluation.justification.length).toBeGreaterThan(20);
    expect(evaluation.total).toBeGreaterThanOrEqual(14);
  });

  it('attribue un score bas a une idee a faible valeur ("Café gratuit")', async () => {
    const provider = new MockScoringProvider();
    const evaluation = await provider.evaluateIdea(trivialIdea);

    expect(evaluation.criteria.businessImpact).toBe(1);
    expect(evaluation.criteria.innovation).toBe(1);
    expect(evaluation.criteria.strategicAlignment).toBe(1);
    expect(evaluation.total).toBeLessThanOrEqual(8);
    expect(evaluation.justification.toLowerCase()).toContain('faible');
  });

  it('evalue un lot complet d idees', async () => {
    const provider = new MockScoringProvider();
    const map = await provider.evaluateAll([sampleIdea, trivialIdea]);

    expect(map.size).toBe(2);
    expect(map.get('IDEA-001')).toBeDefined();
    expect(map.get('IDEA-015')).toBeDefined();
  });

  it('utilise LlmScoringProvider si une cle d environnement est fournie', () => {
    process.env.LLM_API_KEY = 'test-key-123';
    const provider = getScoringProvider();
    expect(provider).toBeInstanceOf(LlmScoringProvider);
    delete process.env.LLM_API_KEY;

    const defaultProvider = getScoringProvider();
    expect(defaultProvider).toBeInstanceOf(MockScoringProvider);
  });
});
