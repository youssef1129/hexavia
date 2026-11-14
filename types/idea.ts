// Definitions de types TypeScript stricts pour le domaine Hexavia

export interface ScoreCriteria {
  businessImpact: number; // 1 a 5
  feasibility: number; // 1 a 5
  strategicAlignment: number; // 1 a 5
  innovation: number; // 1 a 5
}

export interface ScoreEvaluation {
  criteria: ScoreCriteria;
  total: number; // somme sur 20
  justification: string;
  evaluatedAt: string;
  model: string;
}

export interface ConsultantEvaluation {
  criteria: ScoreCriteria;
  total: number;
  notes?: string;
  updatedAt: string;
}

export interface BudgetParseResult {
  raw: string;
  amount: number | null; // montant numerique en euros
  isUncertain: boolean; // vrai si '?' ou incertain
  note?: string; // precision textuelle extraite
}

export interface Idea {
  id: string; // ex: IDEA-001
  dateDepot: string; // date normalisee AAAA-MM-JJ
  dateDepotRaw: string; // date brute
  prenom: string;
  nom: string;
  direction: string;
  site: string;
  theme: string;
  titre: string;
  description: string;
  beneficesAttendus: string;
  budgetEstimeRaw: string;
  budget: BudgetParseResult;
  aiEvaluation?: ScoreEvaluation;
  consultantEvaluation?: ConsultantEvaluation;
  status: 'nouveau' | 'evalue' | 'rejete' | 'shortlist';
}

export type DuplicateType = 'exact' | 'near';
export type DuplicateStatus = 'pending' | 'confirmed' | 'rejected';

export interface DuplicatePair {
  id: string; // identifiant de la paire: idA_idB
  ideaAId: string;
  ideaBId: string;
  type: DuplicateType;
  confidence: number; // entre 0.0 et 1.0
  reason: string;
  status: DuplicateStatus;
}

export interface ShortlistItem {
  idea: Idea;
  rank: number;
  effectiveScore: number; // score consultant si present, sinon score IA, sinon 0
  scoreSource: 'consultant' | 'ia' | 'non_evalue';
  isDuplicateFlagged: boolean;
  duplicateClusterId?: string;
  isManuallyAdded: boolean;
  isManuallyExcluded: boolean;
}

export interface FilterOptions {
  search: string;
  direction: string;
  theme: string;
  site: string;
  status: string;
  scoreMin: number;
  scoreMax: number;
  sortBy: 'score' | 'id' | 'date' | 'budget';
  sortOrder: 'asc' | 'desc';
}
