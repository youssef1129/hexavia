import { Idea } from '@/types/idea';
import { parseBudget } from './budget-parser';

export interface CsvParseResult {
  ideas: Idea[];
  errors: string[];
  warnings: string[];
  stats: {
    totalRows: number;
    validRows: number;
    errorRows: number;
  };
}

const EXPECTED_HEADERS = [
  'id',
  'date_depot',
  'prenom',
  'nom',
  'direction',
  'site',
  'theme',
  'titre',
  'description',
  'benefices_attendus',
  'budget_estime',
];

/**
 * Normalise une date sous le format standard ISO AAAA-MM-JJ.
 * Accepte les formats AAAA-MM-JJ et JJ/MM/AAAA.
 */
export function normalizeDate(dateStr: string): string {
  const trimmed = dateStr.trim();
  if (!trimmed) return '';

  // Format JJ/MM/AAAA -> AAAA-MM-JJ (ex: 03/10/2026 -> 2026-10-03)
  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const day = slashMatch[1].padStart(2, '0');
    const month = slashMatch[2].padStart(2, '0');
    const year = slashMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Format AAAA-MM-JJ
  const isoMatch = trimmed.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (isoMatch) {
    const year = isoMatch[1];
    const month = isoMatch[2].padStart(2, '0');
    const day = isoMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return trimmed;
}

/**
 * Parse un contenu CSV avec separateur point-virgule et encodage UTF-8 avec ou sans BOM.
 */
export function parseIdeasCsv(content: string): CsvParseResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const ideas: Idea[] = [];

  if (!content || typeof content !== 'string') {
    return {
      ideas: [],
      errors: ['Le contenu du fichier est vide ou invalide.'],
      warnings: [],
      stats: { totalRows: 0, validRows: 0, errorRows: 0 },
    };
  }

  // Suppression du caractere BOM (Byte Order Mark) initial
  const cleanContent = content.charCodeAt(0) === 0xfeff ? content.slice(1) : content;

  // Decoupage en lignes en supportant CRLF (\r\n) et LF (\n)
  const rawLines = cleanContent.split(/\r?\n/);
  const lines = rawLines.filter((line) => line.trim().length > 0);

  if (lines.length === 0) {
    return {
      ideas: [],
      errors: ['Le fichier CSV ne contient aucune ligne de donnee.'],
      warnings: [],
      stats: { totalRows: 0, validRows: 0, errorRows: 0 },
    };
  }

  // Verification des en-tetes sur la premiere ligne
  const headerLine = lines[0];
  const headers = headerLine
    .split(';')
    .map((h) => h.trim().toLowerCase().replace(/^[\uFEFF]/, ''));

  // Verification des colonnes obligatoires
  const missingHeaders = EXPECTED_HEADERS.filter(
    (expected) => !headers.includes(expected)
  );

  if (missingHeaders.length > 0) {
    return {
      ideas: [],
      errors: [
        `Colonnes obligatoires manquantes dans l en-tete : ${missingHeaders.join(', ')}. Colonnes detectees : ${headers.join(', ')}`,
      ],
      warnings: [],
      stats: { totalRows: 0, validRows: 0, errorRows: 0 },
    };
  }

  const colIndex: Record<string, number> = {};
  EXPECTED_HEADERS.forEach((header) => {
    colIndex[header] = headers.indexOf(header);
  });

  let errorCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const lineIndex = i + 1; // Numero de ligne pour l utilisateur (1-based)
    const line = lines[i];

    // Decoupage par point-virgule
    const cols = line.split(';').map((c) => c.trim());

    if (cols.length < headers.length) {
      warnings.push(`Ligne ${lineIndex} : nombre insuffisant de colonnes (${cols.length}/${headers.length}).`);
    }

    const id = cols[colIndex['id']] || '';
    const titre = cols[colIndex['titre']] || '';
    const description = cols[colIndex['description']] || '';

    // L id et le titre sont strictement indispensables
    if (!id || !titre) {
      errors.push(`Ligne ${lineIndex} ignoree : identifiant ou titre manquant.`);
      errorCount++;
      continue;
    }

    const prenom = cols[colIndex['prenom']] || '';
    const nom = cols[colIndex['nom']] || '';
    const dateDepotRaw = cols[colIndex['date_depot']] || '';
    const direction = cols[colIndex['direction']] || 'Non renseignee';
    const site = cols[colIndex['site']] || 'Non renseigne';
    const theme = cols[colIndex['theme']] || 'Non renseigne';
    const beneficesAttendus = cols[colIndex['benefices_attendus']] || '';
    const budgetEstimeRaw = cols[colIndex['budget_estime']] || '';

    const dateDepot = normalizeDate(dateDepotRaw);
    const budget = parseBudget(budgetEstimeRaw);

    const idea: Idea = {
      id,
      dateDepot,
      dateDepotRaw,
      prenom,
      nom,
      direction,
      site,
      theme,
      titre,
      description,
      beneficesAttendus,
      budgetEstimeRaw,
      budget,
      status: 'nouveau',
    };

    ideas.push(idea);
  }

  return {
    ideas,
    errors,
    warnings,
    stats: {
      totalRows: lines.length - 1,
      validRows: ideas.length,
      errorRows: errorCount,
    },
  };
}

/**
 * Exporte une liste d idees ou de shortlist au format CSV conforme.
 */
export function exportIdeasToCsv(ideas: Idea[]): string {
  const headers = [
    'id',
    'date_depot',
    'prenom',
    'nom',
    'direction',
    'site',
    'theme',
    'titre',
    'description',
    'benefices_attendus',
    'budget_estime',
    'score_ia',
    'score_consultant',
    'statut',
  ];

  const escapeCol = (val: string | number | undefined | null): string => {
    if (val === undefined || val === null) return '';
    const str = String(val);
    if (str.includes(';') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = ideas.map((idea) => {
    return [
      escapeCol(idea.id),
      escapeCol(idea.dateDepot),
      escapeCol(idea.prenom),
      escapeCol(idea.nom),
      escapeCol(idea.direction),
      escapeCol(idea.site),
      escapeCol(idea.theme),
      escapeCol(idea.titre),
      escapeCol(idea.description),
      escapeCol(idea.beneficesAttendus),
      escapeCol(idea.budgetEstimeRaw),
      escapeCol(idea.aiEvaluation?.total ?? ''),
      escapeCol(idea.consultantEvaluation?.total ?? ''),
      escapeCol(idea.status),
    ].join(';');
  });

  // UTF-8 avec BOM
  return '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
}
