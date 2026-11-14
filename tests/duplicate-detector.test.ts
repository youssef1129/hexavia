import { describe, it, expect } from 'vitest';
import { detectDuplicates, normalizeString, calculateTextSimilarity } from '@/lib/duplicate-detector';
import { parseIdeasCsv } from '@/lib/csv-parser';
import fs from 'fs';
import path from 'path';

describe('lib/duplicate-detector', () => {
  it('normalise les chaines et supprime accents et ponctuation', () => {
    expect(normalizeString('Événement! À vérifier?')).toBe('evenement a verifier');
    expect(normalizeString('Compresseurs (Lyon & Metz)')).toBe('compresseurs lyon metz');
  });

  it('calcule une similarite maximale pour des textes identiques', () => {
    const sim = calculateTextSimilarity('Assistant IA pour les questions RH', 'Assistant IA pour les questions RH');
    expect(sim).toBe(1.0);
  });

  it('detecte le doublon exact IDEA-002 et IDEA-014 sur le fichier reel Hexavia', () => {
    const csvContent = fs.readFileSync(path.resolve(process.cwd(), 'data/idees_hexavia.csv'), 'utf-8');
    const { ideas } = parseIdeasCsv(csvContent);

    const duplicates = detectDuplicates(ideas);
    const exactPair = duplicates.find(
      (p) => (p.ideaAId === 'IDEA-002' && p.ideaBId === 'IDEA-014') ||
             (p.ideaAId === 'IDEA-014' && p.ideaBId === 'IDEA-002')
    );

    expect(exactPair).toBeDefined();
    expect(exactPair?.type).toBe('exact');
    expect(exactPair?.confidence).toBe(1.0);
  });

  it('detecte les doublons proches attendus (compresseurs, chatbot RH, dictee vocale, covoiturage)', () => {
    const csvContent = fs.readFileSync(path.resolve(process.cwd(), 'data/idees_hexavia.csv'), 'utf-8');
    const { ideas } = parseIdeasCsv(csvContent);

    const duplicates = detectDuplicates(ideas);

    // Compresseurs : IDEA-001 et IDEA-007
    const compressorsPair = duplicates.find(
      (p) => (p.ideaAId === 'IDEA-001' && p.ideaBId === 'IDEA-007') ||
             (p.ideaAId === 'IDEA-007' && p.ideaBId === 'IDEA-001')
    );
    expect(compressorsPair).toBeDefined();
    expect(compressorsPair?.type).toBe('near');
    expect(compressorsPair?.confidence).toBeGreaterThanOrEqual(0.7);

    // Chatbot RH : IDEA-003 et IDEA-019
    const hrChatbotPair = duplicates.find(
      (p) => (p.ideaAId === 'IDEA-003' && p.ideaBId === 'IDEA-019') ||
             (p.ideaAId === 'IDEA-019' && p.ideaBId === 'IDEA-003')
    );
    expect(hrChatbotPair).toBeDefined();
    expect(hrChatbotPair?.type).toBe('near');

    // Dictee vocale rapports : IDEA-017 et IDEA-018
    const voicePair = duplicates.find(
      (p) => (p.ideaAId === 'IDEA-017' && p.ideaBId === 'IDEA-018') ||
             (p.ideaAId === 'IDEA-018' && p.ideaBId === 'IDEA-017')
    );
    expect(voicePair).toBeDefined();
    expect(voicePair?.type).toBe('near');

    // Covoiturage : IDEA-008 et IDEA-027
    const carpoolPair = duplicates.find(
      (p) => (p.ideaAId === 'IDEA-008' && p.ideaBId === 'IDEA-027') ||
             (p.ideaAId === 'IDEA-027' && p.ideaBId === 'IDEA-008')
    );
    expect(carpoolPair).toBeDefined();
    expect(carpoolPair?.type).toBe('near');
  });

  it('ne classe pas deux idees completement etrangeres comme doublons', () => {
    const csvContent = fs.readFileSync(path.resolve(process.cwd(), 'data/idees_hexavia.csv'), 'utf-8');
    const { ideas } = parseIdeasCsv(csvContent);

    const duplicates = detectDuplicates(ideas);
    const falsePair = duplicates.find(
      (p) => (p.ideaAId === 'IDEA-006' && p.ideaBId === 'IDEA-015') // Chaleur des fours vs Cafe gratuit
    );
    expect(falsePair).toBeUndefined();
  });
});
