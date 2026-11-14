import { NextResponse } from 'next/server';
import { setShortlistTargetCount } from '@/lib/storage';
import { buildShortlist } from '@/lib/shortlist';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const count = Number(body.count || 8);

    const state = setShortlistTargetCount(count);
    const shortlist = buildShortlist(state.ideas, state.duplicatePairs, state.shortlistOptions);

    return NextResponse.json({
      success: true,
      shortlist,
      shortlistOptions: state.shortlistOptions,
    });
  } catch (error) {
    console.error('Erreur shortlist target count :', error);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
