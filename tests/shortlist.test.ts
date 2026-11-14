import { describe, it, expect } from 'vitest';
import { buildShortlist, getEffectiveScore } from '@/lib/shortlist';
import { Idea, DuplicatePair } from '@/types/idea';

function createDummyIdea(id: string, aiScore: number, consultantScore?: number, budgetAmount = 10000): Idea {
  return {
    id,
    dateDepot: '2026-09-15',
    dateDepotRaw: '2026-09-15',
    prenom: 'Collaborateur',
    nom: 'Test',
    direction: 'Production',
    site: 'Lyon',
    theme: 'Process',
    titre: `Idee ${id}`,
    description: `Description pour ${id}`,
    beneficesAttendus: 'Gains',
    budgetEstimeRaw: `${budgetAmount} €`,
    budget: { raw: `${budgetAmount} €`, amount: budgetAmount, isUncertain: false },
    aiEvaluation: {
      criteria: { businessImpact: 4, feasibility: 4, strategicAlignment: 4, innovation: 4 },
      total: aiScore,
      justification: 'Evaluation test',
      evaluatedAt: '2026-09-15',
      model: 'Mock',
    },
    consultantEvaluation:
      consultantScore !== undefined
        ? {
            criteria: { businessImpact: 5, feasibility: 5, strategicAlignment: 5, innovation: 5 },
            total: consultantScore,
            updatedAt: '2026-09-16',
          }
        : undefined,
    status: 'nouveau',
  };
}

describe('lib/shortlist', () => {
  it('donne priorite au score consultant sur le score IA sans ecraser l IA', () => {
    const idea = createDummyIdea('IDEA-001', 14, 18);
    const effective = getEffectiveScore(idea);

    expect(effective.score).toBe(18);
    expect(effective.source).toBe('consultant');
    expect(idea.aiEvaluation?.total).toBe(14); // preserve
  });

  it('selectionne les 8 meilleures idees classees par score decroissant', () => {
    const ideas = [
      createDummyIdea('I-1', 12),
      createDummyIdea('I-2', 19),
      createDummyIdea('I-3', 17),
      createDummyIdea('I-4', 16),
      createDummyIdea('I-5', 18),
      createDummyIdea('I-6', 14),
      createDummyIdea('I-7', 15),
      createDummyIdea('I-8', 13),
      createDummyIdea('I-9', 20),
      createDummyIdea('I-10', 10),
    ];

    const result = buildShortlist(ideas, [], { targetCount: 8 });

    expect(result.items).toHaveLength(8);
    expect(result.items[0].idea.id).toBe('I-9'); // score 20
    expect(result.items[0].rank).toBe(1);
    expect(result.items[1].idea.id).toBe('I-2'); // score 19
    expect(result.items[2].idea.id).toBe('I-5'); // score 18
  });

  it('exclut le doublon le moins bien note lorsqu un doublon est confirme', () => {
    const ideas = [
      createDummyIdea('IDEA-002', 17, undefined, 15000),
      createDummyIdea('IDEA-014', 15, undefined, 15000), // doublon exact moins bien note
      createDummyIdea('I-3', 16),
      createDummyIdea('I-4', 14),
    ];

    const duplicatePairs: DuplicatePair[] = [
      {
        id: 'IDEA-002_IDEA-014',
        ideaAId: 'IDEA-002',
        ideaBId: 'IDEA-014',
        type: 'exact',
        confidence: 1.0,
        reason: 'Identique',
        status: 'confirmed',
      },
    ];

    const result = buildShortlist(ideas, duplicatePairs, { targetCount: 8 });
    const ids = result.items.map((i) => i.idea.id);

    expect(ids).toContain('IDEA-002');
    expect(ids).not.toContain('IDEA-014');
  });

  it('prend en compte les ajouts et exclusions manuels de Camille', () => {
    const ideas = [
      createDummyIdea('I-1', 20),
      createDummyIdea('I-2', 19),
      createDummyIdea('I-3', 18),
      createDummyIdea('I-4', 10), // note faible
    ];

    // Exclure I-1 et forcer I-4
    const result = buildShortlist(ideas, [], {
      targetCount: 3,
      manuallyRemovedIds: ['I-1'],
      manuallyAddedIds: ['I-4'],
    });

    const ids = result.items.map((i) => i.idea.id);
    expect(ids).not.toContain('I-1');
    expect(ids).toContain('I-4');
  });

  it('calcule des statistiques exactes sur la selection', () => {
    const ideas = [
      createDummyIdea('I-1', 18, undefined, 20000),
      createDummyIdea('I-2', 16, undefined, 30000),
    ];

    const result = buildShortlist(ideas, [], { targetCount: 2 });
    expect(result.stats.totalBudget).toBe(50000);
    expect(result.stats.averageScore).toBe(17);
    expect(result.stats.shortlistCount).toBe(2);
  });
});
