import { NextResponse } from 'next/server';
import { getAppState } from '@/lib/storage';
import { buildShortlist } from '@/lib/shortlist';
import { exportIdeasToCsv } from '@/lib/csv-parser';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'shortlist'; // 'shortlist' ou 'all'

  const state = getAppState();

  let ideasToExport = state.ideas;
  let filename = 'hexavia_toutes_les_idees.csv';

  if (type === 'shortlist') {
    const shortlist = buildShortlist(state.ideas, state.duplicatePairs, state.shortlistOptions);
    ideasToExport = shortlist.items.map((item) => item.idea);
    filename = 'hexavia_shortlist_jury.csv';
  }

  const csvContent = exportIdeasToCsv(ideasToExport);

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
