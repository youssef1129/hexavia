import { NextResponse } from 'next/server';
import { resetAppState } from '@/lib/storage';
import { buildShortlist } from '@/lib/shortlist';

export async function POST() {
  const state = resetAppState();
  const shortlist = buildShortlist(state.ideas, state.duplicatePairs, state.shortlistOptions);
  return NextResponse.json({
    success: true,
    ideasCount: state.ideas.length,
    shortlist,
  });
}
