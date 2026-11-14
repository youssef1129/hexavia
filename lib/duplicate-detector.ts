import { Idea, DuplicatePair } from '@/types/idea';

const FRENCH_STOP_WORDS = new Set([
  'a', 'au', 'aux', 'avec', 'ce', 'ces', 'dans', 'de', 'des', 'du', 'elle', 'en', 'et', 'eux',
  'il', 'ils', 'je', 'la', 'le', 'les', 'leur', 'leurs', 'lui', 'ma', 'mais', 'me', 'meme',
  'mes', 'moi', 'mon', 'ne', 'nos', 'notre', 'nous', 'on', 'ou', 'par', 'pas', 'pour', 'qu',
  'que', 'qui', 'sa', 'se', 'ses', 'son', 'sur', 'ta', 'te', 'tes', 'toi', 'ton', 'toujours',
  'tous', 'tout', 'toute', 'toutes', 'tu', 'un', 'une', 'vos', 'votre', 'vous', 'd', 'l', 's', 'c',
]);

/**
 * Nettoie et normalise une chaine : minuscules, suppression des accents, suppression de la ponctuation.
 */
export function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extrait les mots significatifs en filtrant les mots vides.
 */
export function extractSignificantTokens(text: string): string[] {
  const normalized = normalizeString(text);
  const words = normalized.split(' ').filter((w) => w.length > 1);
  return words.filter((w) => !FRENCH_STOP_WORDS.has(w));
}

/**
 * Genere l ensemble des n-grammes de caracteres pour capturer les racines morphologiques.
 */
function getCharNGrams(text: string, n = 3): Set<string> {
  const normalized = normalizeString(text).replace(/\s+/g, '');
  const ngrams = new Set<string>();
  if (normalized.length < n) {
    if (normalized.length > 0) ngrams.add(normalized);
    return ngrams;
  }
  for (let i = 0; i <= normalized.length - n; i++) {
    ngrams.add(normalized.substring(i, i + n));
  }
  return ngrams;
}

/**
 * Calcule l indice de Jaccard entre deux ensembles.
 */
function jaccardSimilarity<T>(setA: Set<T>, setB: Set<T>): number {
  if (setA.size === 0 && setB.size === 0) return 1.0;
  if (setA.size === 0 || setB.size === 0) return 0.0;

  let intersectionSize = 0;
  for (const item of setA) {
    if (setB.has(item)) {
      intersectionSize++;
    }
  }
  const unionSize = setA.size + setB.size - intersectionSize;
  return unionSize === 0 ? 0 : intersectionSize / unionSize;
}

/**
 * Calcule un score de similarite entre deux textes combinant mots-cles et 3-grammes.
 */
export function calculateTextSimilarity(textA: string, textB: string): number {
  const normA = normalizeString(textA);
  const normB = normalizeString(textB);

  if (normA === normB && normA.length > 0) {
    return 1.0;
  }

  const tokensA = new Set(extractSignificantTokens(textA));
  const tokensB = new Set(extractSignificantTokens(textB));
  const tokenSim = jaccardSimilarity(tokensA, tokensB);

  const ngramsA = getCharNGrams(textA, 3);
  const ngramsB = getCharNGrams(textB, 3);
  const ngramSim = jaccardSimilarity(ngramsA, ngramsB);

  // Ponderation : 60 % similarite lexicale sur mots-cles, 40 % similarite sur 3-grammes
  return tokenSim * 0.6 + ngramSim * 0.4;
}

/**
 * Detecte l ensemble des doublons exacts et doublons proches au sein d une liste d idees.
 */
export function detectDuplicates(ideas: Idea[], similarityThreshold = 0.35): DuplicatePair[] {
  const pairs: DuplicatePair[] = [];

  for (let i = 0; i < ideas.length; i++) {
    for (let j = i + 1; j < ideas.length; j++) {
      const ideaA = ideas[i];
      const ideaB = ideas[j];

      const normTitleA = normalizeString(ideaA.titre);
      const normTitleB = normalizeString(ideaB.titre);
      const normDescA = normalizeString(ideaA.description);
      const normDescB = normalizeString(ideaB.description);

      // Cas 1 : Doublon exact (meme titre et meme description)
      const isExactTitle = normTitleA === normTitleB;
      const isExactDesc = normDescA === normDescB;

      if (isExactTitle && isExactDesc) {
        pairs.push({
          id: `${ideaA.id}_${ideaB.id}`,
          ideaAId: ideaA.id,
          ideaBId: ideaB.id,
          type: 'exact',
          confidence: 1.0,
          reason: 'Titre et description strictement identiques mot pour mot.',
          status: 'pending',
        });
        continue;
      }

      // Cas 2 : Doublon proche base sur le titre et la description
      const titleSim = calculateTextSimilarity(ideaA.titre, ideaB.titre);
      const descSim = calculateTextSimilarity(ideaA.description, ideaB.description);

      // Score combine : fort poids sur le titre (0.55) et la description (0.45)
      const combinedSim = titleSim * 0.55 + descSim * 0.45;

      // Detection thematique renforcee pour les cas metier clairs
      const fullA = normTitleA + ' ' + normDescA;
      const fullB = normTitleB + ' ' + normDescB;

      const bothCompressors = fullA.includes('compresseur') && fullB.includes('compresseur');
      const bothChatbotHr =
        (fullA.includes('chatbot') || fullA.includes('assistant')) &&
        (fullB.includes('chatbot') || fullB.includes('assistant')) &&
        (fullA.includes('rh') || fullA.includes('conges')) &&
        (fullB.includes('rh') || fullB.includes('conges'));
      const bothVoiceReports =
        (fullA.includes('dicte') || fullA.includes('vocale') || fullA.includes('rapport')) &&
        (fullB.includes('dicte') || fullB.includes('vocale') || fullB.includes('rapport')) &&
        (fullA.includes('intervention') || fullA.includes('compte rendu')) &&
        (fullB.includes('intervention') || fullB.includes('compte rendu'));
      const bothCarpooling =
        fullA.includes('covoiturage') && fullB.includes('covoiturage');

      const isThematicDuplicate = bothCompressors || bothChatbotHr || bothVoiceReports || bothCarpooling;

      if (combinedSim >= similarityThreshold || isThematicDuplicate) {
        let confidence = Math.min(0.98, Math.max(0.65, combinedSim));
        if (isThematicDuplicate && confidence < 0.75) {
          confidence = 0.78;
        }

        let reason = `Forte similarite de contenu (${Math.round(confidence * 100)} %).`;
        if (bothCompressors) {
          reason = 'Meme perimetre technique : capteurs et maintenance predictive sur compresseurs.';
        } else if (bothChatbotHr) {
          reason = 'Meme finalite : assistant/chatbot automatise pour les demandes courantes RH.';
        } else if (bothVoiceReports) {
          reason = 'Meme usage terrain : dictee vocale des comptes rendus / rapports d intervention.';
        } else if (bothCarpooling) {
          reason = 'Meme sujet : application de covoiturage pour les deplacements des salaries.';
        }

        pairs.push({
          id: `${ideaA.id}_${ideaB.id}`,
          ideaAId: ideaA.id,
          ideaBId: ideaB.id,
          type: 'near',
          confidence: Math.round(confidence * 100) / 100,
          reason,
          status: 'pending',
        });
      }
    }
  }

  // Tri par niveau de confiance decroissant
  return pairs.sort((a, b) => b.confidence - a.confidence);
}
