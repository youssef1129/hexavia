import { NextResponse } from 'next/server';
import { setShortlistManualOverride } from '@/lib/storage';
import { buildShortlist } from '@/lib/shortlist';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { ideaId, action } = body as { ideaId: string; action: 'add' | 'remove' | 'reset' };

    if (!ideaId || !['add', 'remove', 'reset'].includes(action)) {
      return NextResponse.json({ error: 'Parametres invalides.' }, { status: 400 });
    }

    const state = setShortlistManualOverride(ideaId, action);
    const shortlist = buildShortlist(state.ideas, state.duplicatePairs, state.shortlistOptions);

    return NextResponse.json({
      success: true,
      shortlist,
      shortlistOptions: state.shortlistOptions,
    });
  } catch (error) {
    console.error('Erreur shortlist toggle :', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
