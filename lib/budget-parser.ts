import { BudgetParseResult } from '@/types/idea';

/**
 * Analyse et extrait un montant budgetaire numerique a partir d une chaine libre.
 * Gere les cas :
 * - "40 000 €" -> 40000
 * - "15k€" ou "35k" -> 15000 ou 35000
 * - "30 000 euros" -> 30000
 * - "0" ou "0 €" -> 0
 * - "?" -> null (isUncertain: true)
 * - "" ou undefined -> null
 * - "80 000 € (deplacement des machines et formation)" -> 80000 + note extraite
 */
export function parseBudget(raw: string | undefined | null): BudgetParseResult {
  if (raw === undefined || raw === null) {
    return {
      raw: '',
      amount: null,
      isUncertain: false,
    };
  }

  const trimmed = raw.trim();

  if (trimmed === '') {
    return {
      raw: '',
      amount: null,
      isUncertain: false,
    };
  }

  // Marqueurs d incertitude
  if (trimmed === '?' || trimmed.toLowerCase() === 'inconnu' || trimmed.toLowerCase() === 'a definir') {
    return {
      raw: trimmed,
      amount: null,
      isUncertain: true,
    };
  }

  // Extraction d une eventuelle note entre parentheses
  let note: string | undefined;
  const parenMatch = trimmed.match(/\((.*?)\)/);
  if (parenMatch) {
    note = parenMatch[1].trim();
  }

  // Nettoyage de la chaine pour isoler la partie numerique
  // Suppression de la partie entre parentheses pour le calcul
  const withoutParens = trimmed.replace(/\(.*?\)/g, '').trim();

  // Detection du multiplicateur 'k' ou 'k€' ou 'ke' ou 'k euros'
  // Exemples : "15k€", "35k", "20 k€"
  const kMatch = withoutParens.match(/(\d+(?:[.,]\d+)?)\s*k(?:€|e|eur|euros)?/i);
  if (kMatch) {
    const value = parseFloat(kMatch[1].replace(',', '.'));
    return {
      raw: trimmed,
      amount: Math.round(value * 1000),
      isUncertain: false,
      note,
    };
  }

  // Suppression des espaces insecables et normaux entre les chiffres
  // "40 000 €" -> "40000 €"
  const cleanedDigits = withoutParens
    .replace(/\s+/g, '')
    .replace(/[^\d.,]/g, '')
    .replace(',', '.');

  if (cleanedDigits === '') {
    return {
      raw: trimmed,
      amount: null,
      isUncertain: true,
      note,
    };
  }

  const numericValue = parseFloat(cleanedDigits);

  if (isNaN(numericValue)) {
    return {
      raw: trimmed,
      amount: null,
      isUncertain: true,
      note,
    };
  }

  return {
    raw: trimmed,
    amount: Math.round(numericValue),
    isUncertain: false,
    note,
  };
}

/**
 * Formate un montant en euros de facon conviviale pour l affichage.
 */
export function formatBudget(budget: BudgetParseResult): string {
  if (budget.isUncertain) {
    return 'A chiffrer (?)';
  }
  if (budget.amount === null) {
    return 'Non renseigne';
  }
  if (budget.amount === 0) {
    return '0 € (aucun budget)';
  }

  const formatted = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(budget.amount);

  if (budget.note) {
    return `${formatted} (${budget.note})`;
  }

  return formatted;
}
