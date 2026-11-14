import { Idea, DuplicatePair, ShortlistItem } from '@/types/idea';

export interface ShortlistOptions {
  targetCount?: number; // par defaut 8
  manuallyAddedIds?: string[];
  manuallyRemovedIds?: string[];
}

export interface ShortlistResult {
  items: ShortlistItem[];
  stats: {
    totalIdeas: number;
    shortlistCount: number;
    averageScore: number;
    totalBudget: number;
    unbudgetedCount: number;
  };
}

/**
 * Recupere le score effectif d une idee (note de Camille prioritaire, sinon proposition IA).
 */
export function getEffectiveScore(idea: Idea): { score: number; source: 'consultant' | 'ia' | 'non_evalue' } {
  if (idea.consultantEvaluation && typeof idea.consultantEvaluation.total === 'number') {
    return { score: idea.consultantEvaluation.total, source: 'consultant' };
  }
  if (idea.aiEvaluation && typeof idea.aiEvaluation.total === 'number') {
    return { score: idea.aiEvaluation.total, source: 'ia' };
  }
  return { score: 0, source: 'non_evalue' };
}

/**
 * Regroupe les paires de doublons confirmes en grappes (clusters) disjointes.
 */
function buildConfirmedClusters(confirmedPairs: DuplicatePair[]): Map<string, Set<string>> {
  const clusters = new Map<string, Set<string>>();

  for (const pair of confirmedPairs) {
    if (pair.status !== 'confirmed') continue;

    let clusterA = clusters.get(pair.ideaAId);
    let clusterB = clusters.get(pair.ideaBId);

    if (!clusterA && !clusterB) {
      const newCluster = new Set<string>([pair.ideaAId, pair.ideaBId]);
      clusters.set(pair.ideaAId, newCluster);
      clusters.set(pair.ideaBId, newCluster);
    } else if (clusterA && !clusterB) {
      clusterA.add(pair.ideaBId);
      clusters.set(pair.ideaBId, clusterA);
    } else if (!clusterA && clusterB) {
      clusterB.add(pair.ideaAId);
      clusters.set(pair.ideaAId, clusterB);
    } else if (clusterA && clusterB && clusterA !== clusterB) {
      // Fusion des deux grappes
      for (const id of clusterB) {
        clusterA.add(id);
        clusters.set(id, clusterA);
      }
    }
  }

  return clusters;
}

/**
 * Construit la shortlist des meilleures idees (environ 8) pour le jury Hexavia.
 * Regles appliquees :
 * 1. Calcul du score effectif (Consultant > IA > 0).
 * 2. De-doublonnage : un seul representant retenu par groupe de doublons confirmes.
 * 3. Ordonnancement par score decroissant (puis impact business, puis budget le plus sobre).
 * 4. Prise en compte des ajouts et retraits manuels de Camille.
 */
export function buildShortlist(
  ideas: Idea[],
  duplicatePairs: DuplicatePair[] = [],
  options: ShortlistOptions = {}
): ShortlistResult {
  const targetCount = options.targetCount ?? 8;
  const manuallyAdded = new Set(options.manuallyAddedIds ?? []);
  const manuallyRemoved = new Set(options.manuallyRemovedIds ?? []);

  const confirmedPairs = duplicatePairs.filter((p) => p.status === 'confirmed');
  const clusters = buildConfirmedClusters(confirmedPairs);

  // Map d acces rapide aux idees par ID
  const ideaMap = new Map<string, Idea>();
  ideas.forEach((i) => ideaMap.set(i.id, i));

  // Pour chaque cluster confirme, determiner la meilleure idee
  const clusterBestIdea = new Map<Set<string>, string>();
  for (const [, cluster] of clusters.entries()) {
    if (clusterBestIdea.has(cluster)) continue;

    let bestId = '';
    let bestScore = -1;
    let lowestBudget = Infinity;

    for (const memberId of cluster) {
      const idea = ideaMap.get(memberId);
      if (!idea) continue;
      const { score } = getEffectiveScore(idea);
      const budgetAmount = idea.budget.amount ?? Infinity;

      if (score > bestScore || (score === bestScore && budgetAmount < lowestBudget)) {
        bestScore = score;
        lowestBudget = budgetAmount;
        bestId = memberId;
      }
    }
    clusterBestIdea.set(cluster, bestId);
  }

  // Filtrage des candidats eligibles
  const candidates: {
    idea: Idea;
    effectiveScore: number;
    scoreSource: 'consultant' | 'ia' | 'non_evalue';
    isDuplicateFlagged: boolean;
  }[] = [];

  for (const idea of ideas) {
    if (manuallyRemoved.has(idea.id)) {
      continue; // Exclu manuellement par Camille
    }

    const cluster = clusters.get(idea.id);
    const isBestInCluster = !cluster || clusterBestIdea.get(cluster) === idea.id;

    // Si l idee est dans un cluster confirme et n est pas la meilleure, elle est ecartee sauf si forcee manuellement
    if (!isBestInCluster && !manuallyAdded.has(idea.id)) {
      continue;
    }

    const { score, source } = getEffectiveScore(idea);
    candidates.push({
      idea,
      effectiveScore: score,
      scoreSource: source,
      isDuplicateFlagged: Boolean(cluster),
    });
  }

  // Ordonnancement multicritere
  candidates.sort((a, b) => {
    // 1. Les ajouts manuels prioritaires si necessaire ou tri standard par score
    const aManual = manuallyAdded.has(a.idea.id);
    const bManual = manuallyAdded.has(b.idea.id);
    if (aManual && !bManual) return -1;
    if (!aManual && bManual) return 1;

    // 2. Score effectif decroissant
    if (b.effectiveScore !== a.effectiveScore) {
      return b.effectiveScore - a.effectiveScore;
    }

    // 3. Impact business decroissant
    const impactA = a.idea.consultantEvaluation?.criteria.businessImpact ?? a.idea.aiEvaluation?.criteria.businessImpact ?? 0;
    const impactB = b.idea.consultantEvaluation?.criteria.businessImpact ?? b.idea.aiEvaluation?.criteria.businessImpact ?? 0;
    if (impactB !== impactA) {
      return impactB - impactA;
    }

    // 4. Budget croissant (sobriete)
    const budgetA = a.idea.budget.amount ?? 999999999;
    const budgetB = b.idea.budget.amount ?? 999999999;
    return budgetA - budgetB;
  });

  // Selection des N premieres idees
  const selectedCandidates = candidates.slice(0, targetCount);

  const items: ShortlistItem[] = selectedCandidates.map((c, index) => ({
    idea: c.idea,
    rank: index + 1,
    effectiveScore: c.effectiveScore,
    scoreSource: c.scoreSource,
    isDuplicateFlagged: c.isDuplicateFlagged,
    isManuallyAdded: manuallyAdded.has(c.idea.id),
    isManuallyExcluded: false,
  }));

  // Statistiques de synthese pour Camille et le jury
  let totalScoreSum = 0;
  let totalBudget = 0;
  let unbudgetedCount = 0;

  for (const item of items) {
    totalScoreSum += item.effectiveScore;
    if (item.idea.budget.amount !== null && !item.idea.budget.isUncertain) {
      totalBudget += item.idea.budget.amount;
    } else {
      unbudgetedCount++;
    }
  }

  const averageScore = items.length > 0 ? Math.round((totalScoreSum / items.length) * 10) / 10 : 0;

  return {
    items,
    stats: {
      totalIdeas: ideas.length,
      shortlistCount: items.length,
      averageScore,
      totalBudget,
      unbudgetedCount,
    },
  };
}
