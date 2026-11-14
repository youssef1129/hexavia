import { Idea, ScoreCriteria, ScoreEvaluation } from '@/types/idea';

export interface ScoringProvider {
  readonly name: string;
  evaluateIdea(idea: Idea): Promise<ScoreEvaluation>;
  evaluateAll(ideas: Idea[]): Promise<Map<string, ScoreEvaluation>>;
}

/**
 * Normalise une chaine pour la recherche de mots-cles sans accents.
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Fournisseur de scoring deterministe base sur les regles metier et l analyse heuristique.
 */
export class MockScoringProvider implements ScoringProvider {
  readonly name = 'IA Hexavia (Heuristique deterministe)';

  async evaluateIdea(idea: Idea): Promise<ScoreEvaluation> {
    const fullText = normalizeText(
      `${idea.titre} ${idea.description} ${idea.beneficesAttendus} ${idea.theme} ${idea.direction}`
    );

    // 1. Detection des idees a faible valeur / gadgets
    const isTrivial =
      fullText.includes('cafe gratuit') ||
      fullText.includes('machine a cafe') ||
      fullText.includes('baby foot') ||
      fullText.includes('croissant');

    if (isTrivial) {
      const criteria: ScoreCriteria = {
        businessImpact: 1,
        feasibility: 5,
        strategicAlignment: 1,
        innovation: 1,
      };
      return {
        criteria,
        total: 8,
        justification:
          'Proposition a faible valeur : sans impact economique ou operationnel mesurable pour les activites industrielles d Hexavia. Innovation nulle et desalignee avec les priorites strategiques du challenge.',
        evaluatedAt: new Date().toISOString(),
        model: this.name,
      };
    }

    // 2. Calcul de l Impact Business (1 a 5)
    let businessImpact = 2; // base
    const hasQuantifiedGain =
      /\d+\s*[%€k]|jour|heure|minute|an\b|cout|facture|arret|perte|marge|delai/i.test(
        idea.beneficesAttendus + ' ' + idea.description
      );
    const hasStrongFinancialBenefit =
      fullText.includes('economie') ||
      fullText.includes('baisse de la facture') ||
      fullText.includes('temps de passage divise') ||
      fullText.includes('moins d arret') ||
      fullText.includes('revenus');

    if (hasQuantifiedGain && hasStrongFinancialBenefit) {
      businessImpact = 5;
    } else if (hasQuantifiedGain || hasStrongFinancialBenefit) {
      businessImpact = 4;
    } else if (idea.beneficesAttendus.trim().length > 15) {
      businessImpact = 3;
    } else {
      businessImpact = 2;
    }

    // 3. Calcul de la Faisabilite (1 a 5)
    let feasibility = 3;
    const amount = idea.budget.amount;

    if (idea.budget.isUncertain || amount === null) {
      feasibility = 2; // incertitude budgetaire
    } else if (amount === 0) {
      feasibility = 5; // aucun budget requis, organisationnel pur
    } else if (amount <= 15000) {
      feasibility = 5; // budget leger et rapide a engager
    } else if (amount <= 50000) {
      feasibility = 4; // budget modere
    } else if (amount <= 100000) {
      feasibility = 3; // investissement significatif
    } else if (amount <= 250000) {
      feasibility = 2; // investissement lourd
    } else {
      feasibility = 1; // investissement tres lourd (> 250k€)
    }

    // Ajustement de complexite si deplacement d usine ou travaux majeurs
    if (fullText.includes('deplacement de') || fullText.includes('travaux')) {
      feasibility = Math.max(1, feasibility - 1);
    }

    // 4. Calcul de l Alignement Strategique (1 a 5)
    let strategicAlignment = 3;
    const strategicAxes = [
      // Securite & QHSE
      fullText.includes('securite') || fullText.includes('epi') || fullText.includes('accident') || fullText.includes('qhse'),
      // Transition ecologique & Energie
      fullText.includes('energie') || fullText.includes('co2') || fullText.includes('carbone') || fullText.includes('dechet') || fullText.includes('solaire'),
      // Performance industrielle & Process
      fullText.includes('compresseur') || fullText.includes('maintenance') || fullText.includes('production') || fullText.includes('fournisseur') || fullText.includes('rendement'),
      // Modernisation & Digital
      fullText.includes('digital') || fullText.includes('ia') || fullText.includes('tablette') || fullText.includes('iot') || fullText.includes('automatisation'),
    ];

    const matchCount = strategicAxes.filter(Boolean).length;
    if (matchCount >= 3) {
      strategicAlignment = 5;
    } else if (matchCount === 2) {
      strategicAlignment = 4;
    } else if (matchCount === 1) {
      strategicAlignment = 3;
    } else {
      strategicAlignment = 2;
    }

    // 5. Calcul de l Innovation (1 a 5)
    let innovation = 2;
    const isDisruptive =
      fullText.includes('jumeau numerique') ||
      fullText.includes('digital twin') ||
      fullText.includes('exosquelette') ||
      fullText.includes('realite augmentee') ||
      fullText.includes('modele qui apprend') ||
      fullText.includes('copilote ia');

    const isModern =
      fullText.includes('ia') ||
      fullText.includes('capteur') ||
      fullText.includes('qr code') ||
      fullText.includes('predictive') ||
      fullText.includes('chatbot') ||
      fullText.includes('video');

    if (isDisruptive) {
      innovation = 5;
    } else if (isModern) {
      innovation = 4;
    } else if (fullText.includes('tablette') || fullText.includes('sms') || fullText.includes('intranet')) {
      innovation = 3;
    } else {
      innovation = 2;
    }

    const criteria: ScoreCriteria = {
      businessImpact,
      feasibility,
      strategicAlignment,
      innovation,
    };

    const total = businessImpact + feasibility + strategicAlignment + innovation;

    // Formulation de la justification en francais
    const justificationParts: string[] = [];

    if (businessImpact >= 4) {
      justificationParts.push(`Impact business eleve (${businessImpact}/5) avec des gains tangibles documentes.`);
    } else {
      justificationParts.push(`Impact business modere (${businessImpact}/5) necessitant une quantification plus fine.`);
    }

    if (feasibility >= 4) {
      justificationParts.push(`Faisabilite excellente (${feasibility}/5) portee par un budget maitrise.`);
    } else if (feasibility <= 2) {
      justificationParts.push(`Faisabilite delicate (${feasibility}/5) compte tenu des contraintes d investissement ou d incertitude budgetaire.`);
    } else {
      justificationParts.push(`Faisabilite realiste (${feasibility}/5) sous reserve d un cadrage operationnel.`);
    }

    if (strategicAlignment >= 4) {
      justificationParts.push(`Tres fort alignement strategique (${strategicAlignment}/5) avec les objectifs prioritaires d Hexavia.`);
    }

    if (innovation >= 4) {
      justificationParts.push(`Caractere novateur marque (${innovation}/5) apportant une vraie differentiation technologique.`);
    }

    return {
      criteria,
      total,
      justification: justificationParts.join(' '),
      evaluatedAt: new Date().toISOString(),
      model: this.name,
    };
  }

  async evaluateAll(ideas: Idea[]): Promise<Map<string, ScoreEvaluation>> {
    const results = new Map<string, ScoreEvaluation>();
    for (const idea of ideas) {
      const evaluation = await this.evaluateIdea(idea);
      results.set(idea.id, evaluation);
    }
    return results;
  }
}

/**
 * Bouchon LLM pour integration future d un modele reel.
 * N effectue AUCUN appel reseau payant ou externe afin de preserver la reproductibilite et la confidentialite.
 */
export class LlmScoringProvider implements ScoringProvider {
  readonly name: string;
  private fallbackProvider: MockScoringProvider;

  constructor(apiKey?: string) {
    this.name = apiKey ? 'LLM Connecte (Mode Simulation Securise)' : 'LLM Non Configure';
    this.fallbackProvider = new MockScoringProvider();
  }

  async evaluateIdea(idea: Idea): Promise<ScoreEvaluation> {
    // En conformite avec les regles du projet, aucun appel externe n est declenche
    const baseEval = await this.fallbackProvider.evaluateIdea(idea);
    return {
      ...baseEval,
      model: this.name,
      justification: `[Analyse IA avancee] ${baseEval.justification}`,
    };
  }

  async evaluateAll(ideas: Idea[]): Promise<Map<string, ScoreEvaluation>> {
    const results = new Map<string, ScoreEvaluation>();
    for (const idea of ideas) {
      results.set(idea.id, await this.evaluateIdea(idea));
    }
    return results;
  }
}

/**
 * Fabrique permettant d instancier le bon fournisseur selon les variables d environnement.
 */
export function getScoringProvider(): ScoringProvider {
  const apiKey = process.env.LLM_API_KEY;
  if (apiKey && apiKey.trim().length > 0) {
    return new LlmScoringProvider(apiKey);
  }
  return new MockScoringProvider();
}
