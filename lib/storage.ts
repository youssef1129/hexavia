import fs from 'fs';
import path from 'path';
import { Idea, DuplicatePair, ConsultantEvaluation, ScoreEvaluation, DuplicateStatus } from '@/types/idea';
import { parseIdeasCsv } from './csv-parser';
import { MockScoringProvider } from './scoring-provider';
import { detectDuplicates } from './duplicate-detector';

export interface AppState {
  ideas: Idea[];
  duplicatePairs: DuplicatePair[];
  shortlistOptions: {
    targetCount: number;
    manuallyAddedIds: string[];
    manuallyRemovedIds: string[];
  };
  lastImportDate?: string;
  sourceFilename?: string;
}

// Fichier de persistance locale pour le developpement et environnement sans Supabase
const STORAGE_FILE = path.resolve(process.cwd(), '.next/hexavia-state.json');

let inMemoryState: AppState | null = null;

/**
 * Initialise l etat par defaut avec les 40 idees d Hexavia.
 */
function createDefaultHexaviaState(): AppState {
  try {
    const csvPath = path.resolve(process.cwd(), 'data/idees_hexavia.csv');
    if (fs.existsSync(csvPath)) {
      const content = fs.readFileSync(csvPath, 'utf-8');
      const { ideas } = parseIdeasCsv(content);

      // Notation automatique par l IA Mock
      const mockProvider = new MockScoringProvider();
      const evaluatedIdeas = ideas.map((idea) => {
        // Calcul synchrone base sur l heuristique deterministe
        const fullText = (
          `${idea.titre} ${idea.description} ${idea.beneficesAttendus} ${idea.theme} ${idea.direction}`
        ).toLowerCase();

        const isTrivial = fullText.includes('cafe gratuit') || fullText.includes('baby foot');
        if (isTrivial) {
          idea.aiEvaluation = {
            criteria: { businessImpact: 1, feasibility: 5, strategicAlignment: 1, innovation: 1 },
            total: 8,
            justification:
              'Proposition a faible valeur : sans impact economique ou operationnel mesurable pour les activites industrielles d Hexavia. Innovation nulle et desalignee avec les priorites strategiques du challenge.',
            evaluatedAt: new Date().toISOString(),
            model: mockProvider.name,
          };
          idea.status = 'evalue';
          return idea;
        }

        let businessImpact = 2;
        const hasQuantified = /\d+\s*[%€k]|jour|heure|minute|an\b|cout|facture|arret|perte|marge|delai/i.test(
          idea.beneficesAttendus + ' ' + idea.description
        );
        const hasStrong =
          fullText.includes('economie') ||
          fullText.includes('baisse de la facture') ||
          fullText.includes('temps de passage divise') ||
          fullText.includes('moins d arret') ||
          fullText.includes('revenus');
        if (hasQuantified && hasStrong) businessImpact = 5;
        else if (hasQuantified || hasStrong) businessImpact = 4;
        else if (idea.beneficesAttendus.trim().length > 15) businessImpact = 3;

        let feasibility = 3;
        const amount = idea.budget.amount;
        if (idea.budget.isUncertain || amount === null) feasibility = 2;
        else if (amount === 0 || amount <= 15000) feasibility = 5;
        else if (amount <= 50000) feasibility = 4;
        else if (amount <= 100000) feasibility = 3;
        else if (amount <= 250000) feasibility = 2;
        else feasibility = 1;

        if (fullText.includes('deplacement de') || fullText.includes('travaux')) {
          feasibility = Math.max(1, feasibility - 1);
        }

        const axes = [
          fullText.includes('securite') || fullText.includes('epi') || fullText.includes('accident') || fullText.includes('qhse'),
          fullText.includes('energie') || fullText.includes('co2') || fullText.includes('carbone') || fullText.includes('dechet') || fullText.includes('solaire'),
          fullText.includes('compresseur') || fullText.includes('maintenance') || fullText.includes('production') || fullText.includes('fournisseur') || fullText.includes('rendement'),
          fullText.includes('digital') || fullText.includes('ia') || fullText.includes('tablette') || fullText.includes('iot') || fullText.includes('automatisation'),
        ].filter(Boolean).length;

        const strategicAlignment = axes >= 3 ? 5 : axes === 2 ? 4 : axes === 1 ? 3 : 2;

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

        const innovation = isDisruptive ? 5 : isModern ? 4 : fullText.includes('tablette') ? 3 : 2;

        const total = businessImpact + feasibility + strategicAlignment + innovation;

        const parts: string[] = [];
        if (businessImpact >= 4) parts.push(`Impact business eleve (${businessImpact}/5) avec gains documentes.`);
        else parts.push(`Impact business modere (${businessImpact}/5).`);

        if (feasibility >= 4) parts.push(`Faisabilite excellente (${feasibility}/5) et budget maitrise.`);
        else if (feasibility <= 2) parts.push(`Faisabilite delicate (${feasibility}/5) compte tenu de l investissement.`);
        else parts.push(`Faisabilite realiste (${feasibility}/5).`);

        if (strategicAlignment >= 4) parts.push(`Fort alignement strategique (${strategicAlignment}/5).`);
        if (innovation >= 4) parts.push(`Caractere novateur marque (${innovation}/5).`);

        idea.aiEvaluation = {
          criteria: { businessImpact, feasibility, strategicAlignment, innovation },
          total,
          justification: parts.join(' '),
          evaluatedAt: new Date().toISOString(),
          model: mockProvider.name,
        };
        idea.status = 'evalue';
        return idea;
      });

      const duplicatePairs = detectDuplicates(evaluatedIdeas);

      return {
        ideas: evaluatedIdeas,
        duplicatePairs,
        shortlistOptions: {
          targetCount: 8,
          manuallyAddedIds: [],
          manuallyRemovedIds: [],
        },
        lastImportDate: new Date().toISOString(),
        sourceFilename: 'idees_hexavia.csv',
      };
    }
  } catch (err) {
    console.error('Erreur lors du chargement des idees par defaut :', err);
  }

  return {
    ideas: [],
    duplicatePairs: [],
    shortlistOptions: {
      targetCount: 8,
      manuallyAddedIds: [],
      manuallyRemovedIds: [],
    },
  };
}

/**
 * Sauvegarde l etat sur le disque local en environnement Node.
 */
function persistLocally(state: AppState): void {
  try {
    const dir = path.dirname(STORAGE_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(state, null, 2), 'utf-8');
  } catch {
    // Si l environnement est en lecture seule (serverless edge), la memoire vive assure la session
  }
}

/**
 * Recupere l etat courant de l application.
 */
export function getAppState(): AppState {
  if (inMemoryState) {
    return inMemoryState;
  }

  // Tentative de lecture du fichier persistant
  try {
    if (fs.existsSync(STORAGE_FILE)) {
      const data = fs.readFileSync(STORAGE_FILE, 'utf-8');
      inMemoryState = JSON.parse(data);
      if (inMemoryState && Array.isArray(inMemoryState.ideas)) {
        return inMemoryState;
      }
    }
  } catch {
    // Fichier corrompu ou inaccessible
  }

  // Initialisation avec le jeu de donnees Hexavia
  inMemoryState = createDefaultHexaviaState();
  persistLocally(inMemoryState);
  return inMemoryState;
}

/**
 * Met a jour l ensemble des idees (ex: lors d un import CSV).
 */
export function importIdeasToState(ideas: Idea[], filename?: string): AppState {
  const current = getAppState();

  // Detection automatique des doublons sur le nouveau jeu de donnees
  const duplicatePairs = detectDuplicates(ideas);

  inMemoryState = {
    ...current,
    ideas,
    duplicatePairs,
    lastImportDate: new Date().toISOString(),
    sourceFilename: filename || 'import_personnalise.csv',
  };

  persistLocally(inMemoryState);
  return inMemoryState;
}

/**
 * Enregistre la notation et les remarques de Camille pour une idee specifique.
 */
export function updateConsultantScore(ideaId: string, evaluation: ConsultantEvaluation): Idea | null {
  const state = getAppState();
  const idea = state.ideas.find((i) => i.id === ideaId);
  if (!idea) return null;

  idea.consultantEvaluation = evaluation;
  idea.status = 'evalue';

  persistLocally(state);
  return idea;
}

/**
 * Met a jour ou force la notation IA d une idee.
 */
export function updateAiScore(ideaId: string, evaluation: ScoreEvaluation): Idea | null {
  const state = getAppState();
  const idea = state.ideas.find((i) => i.id === ideaId);
  if (!idea) return null;

  idea.aiEvaluation = evaluation;
  idea.status = 'evalue';

  persistLocally(state);
  return idea;
}

/**
 * Met a jour le statut d un doublon (confirme / rejete / pending).
 */
export function setDuplicateStatus(pairId: string, status: DuplicateStatus): DuplicatePair | null {
  const state = getAppState();
  const pair = state.duplicatePairs.find((p) => p.id === pairId);
  if (!pair) return null;

  pair.status = status;
  persistLocally(state);
  return pair;
}

/**
 * Ajuste manuellement la presence d une idee dans la shortlist.
 */
export function setShortlistManualOverride(
  ideaId: string,
  action: 'add' | 'remove' | 'reset'
): AppState {
  const state = getAppState();
  const added = new Set(state.shortlistOptions.manuallyAddedIds);
  const removed = new Set(state.shortlistOptions.manuallyRemovedIds);

  if (action === 'add') {
    added.add(ideaId);
    removed.delete(ideaId);
  } else if (action === 'remove') {
    removed.add(ideaId);
    added.delete(ideaId);
  } else {
    added.delete(ideaId);
    removed.delete(ideaId);
  }

  state.shortlistOptions.manuallyAddedIds = Array.from(added);
  state.shortlistOptions.manuallyRemovedIds = Array.from(removed);

  persistLocally(state);
  return state;
}

/**
 * Modifie le nombre cible d idees pour la shortlist (defaut 8).
 */
export function setShortlistTargetCount(count: number): AppState {
  const state = getAppState();
  state.shortlistOptions.targetCount = Math.max(1, Math.min(count, 40));
  persistLocally(state);
  return state;
}

/**
 * Reinitialise completement l etat avec les 40 idees natives d Hexavia.
 */
export function resetAppState(): AppState {
  inMemoryState = createDefaultHexaviaState();
  persistLocally(inMemoryState);
  return inMemoryState;
}

/**
 * Vide completement l etat pour tester les ecrans d etat vide (EmptyState).
 */
export function clearAppState(): AppState {
  inMemoryState = {
    ideas: [],
    duplicatePairs: [],
    shortlistOptions: {
      targetCount: 8,
      manuallyAddedIds: [],
      manuallyRemovedIds: [],
    },
    lastImportDate: undefined,
    sourceFilename: undefined,
  };
  persistLocally(inMemoryState);
  return inMemoryState;
}
