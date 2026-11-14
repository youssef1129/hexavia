import { NextResponse } from 'next/server';
import { getAppState, importIdeasToState } from '@/lib/storage';
import { parseIdeasCsv } from '@/lib/csv-parser';
import { buildShortlist } from '@/lib/shortlist';
import { MockScoringProvider } from '@/lib/scoring-provider';

export async function GET() {
  const state = getAppState();
  const shortlist = buildShortlist(state.ideas, state.duplicatePairs, state.shortlistOptions);

  return NextResponse.json({
    ideas: state.ideas,
    duplicatePairs: state.duplicatePairs,
    shortlist,
    shortlistOptions: state.shortlistOptions,
    lastImportDate: state.lastImportDate,
    sourceFilename: state.sourceFilename,
  });
}

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get('content-type') || '';

    let csvText = '';
    let filename = 'import_personnalise.csv';

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      if (!file) {
        return NextResponse.json({ error: 'Aucun fichier transmis.' }, { status: 400 });
      }
      filename = file.name;
      csvText = await file.text();
    } else {
      const body = await request.json();
      csvText = body.csvText || '';
      filename = body.filename || filename;
    }

    if (!csvText || csvText.trim() === '') {
      return NextResponse.json({ error: 'Le fichier CSV transmis est vide.' }, { status: 400 });
    }

    const parseResult = parseIdeasCsv(csvText);

    if (parseResult.errors.length > 0 && parseResult.ideas.length === 0) {
      return NextResponse.json(
        {
          error: parseResult.errors[0],
          details: parseResult.errors,
        },
        { status: 400 }
      );
    }

    // Notation IA automatique sur les nouvelles idees
    const mockProvider = new MockScoringProvider();
    for (const idea of parseResult.ideas) {
      idea.aiEvaluation = await mockProvider.evaluateIdea(idea);
      idea.status = 'evalue';
    }

    const updatedState = importIdeasToState(parseResult.ideas, filename);
    const shortlist = buildShortlist(
      updatedState.ideas,
      updatedState.duplicatePairs,
      updatedState.shortlistOptions
    );

    return NextResponse.json({
      success: true,
      ideasCount: updatedState.ideas.length,
      duplicateCount: updatedState.duplicatePairs.length,
      warnings: parseResult.warnings,
      shortlist,
    });
  } catch (error) {
    console.error('Erreur lors de l import CSV :', error);
    return NextResponse.json(
      { error: 'Erreur interne lors du traitement du fichier CSV.' },
      { status: 500 }
    );
  }
}
