import { describe, it, expect } from 'vitest';
import { parseIdeasCsv, normalizeDate, exportIdeasToCsv } from '@/lib/csv-parser';
import fs from 'fs';
import path from 'path';

describe('lib/csv-parser', () => {
  it('normalise les dates correctement', () => {
    expect(normalizeDate('03/10/2026')).toBe('2026-10-03');
    expect(normalizeDate('2026-09-15')).toBe('2026-09-15');
    expect(normalizeDate('')).toBe('');
  });

  it('analyse avec succes le fichier reel data/idees_hexavia.csv (40 idees)', () => {
    const csvPath = path.resolve(process.cwd(), 'data/idees_hexavia.csv');
    const content = fs.readFileSync(csvPath, 'utf-8');

    const result = parseIdeasCsv(content);

    expect(result.errors).toHaveLength(0);
    expect(result.ideas).toHaveLength(40);
    expect(result.stats.totalRows).toBe(40);
    expect(result.stats.validRows).toBe(40);

    // Verification du premier enregistrement
    const first = result.ideas[0];
    expect(first.id).toBe('IDEA-001');
    expect(first.titre).toBe('Capteurs de vibration sur les compresseurs');
    expect(first.budget.amount).toBe(40000);
    expect(first.direction).toBe('Maintenance');

    // Verification de l idee IDEA-033 avec date en JJ/MM/AAAA
    const idea33 = result.ideas.find((i) => i.id === 'IDEA-033');
    expect(idea33).toBeDefined();
    expect(idea33?.dateDepot).toBe('2026-10-03');

    // Verification de l idee IDEA-015 avec theme vide
    const idea15 = result.ideas.find((i) => i.id === 'IDEA-015');
    expect(idea15).toBeDefined();
    expect(idea15?.theme).toBe('Non renseigne');
    expect(idea15?.titre).toBe('Café gratuit');

    // Verification de l idee IDEA-040 avec site vide
    const idea40 = result.ideas.find((i) => i.id === 'IDEA-040');
    expect(idea40).toBeDefined();
    expect(idea40?.site).toBe('Non renseigne');
  });

  it('renvoie une erreur claire si des en-tetes obligatoires manquent', () => {
    const badCsv = 'id;titre\nIDEA-001;Mon idee';
    const result = parseIdeasCsv(badCsv);
    expect(result.ideas).toHaveLength(0);
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0]).toContain('Colonnes obligatoires manquantes');
  });

  it('renvoie une erreur si le contenu est vide', () => {
    const result = parseIdeasCsv('');
    expect(result.errors[0]).toContain('vide');
  });

  it('exporte les idees en CSV conforme avec separateur point-virgule et BOM', () => {
    const ideas = [
      {
        id: 'IDEA-001',
        dateDepot: '2026-09-15',
        dateDepotRaw: '2026-09-15',
        prenom: 'Julie',
        nom: 'Marchand',
        direction: 'Maintenance',
        site: 'Lyon',
        theme: 'Énergie',
        titre: 'Capteurs de vibration',
        description: 'Description test',
        beneficesAttendus: 'Gain de temps',
        budgetEstimeRaw: '40 000 €',
        budget: { raw: '40 000 €', amount: 40000, isUncertain: false },
        status: 'nouveau' as const,
      },
    ];

    const exported = exportIdeasToCsv(ideas);
    expect(exported.charCodeAt(0)).toBe(0xfeff); // BOM
    expect(exported).toContain('IDEA-001;2026-09-15;Julie;Marchand');
  });
});
