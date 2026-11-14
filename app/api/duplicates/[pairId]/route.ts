import { NextResponse } from 'next/server';
import { setDuplicateStatus } from '@/lib/storage';
import { DuplicateStatus } from '@/types/idea';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ pairId: string }> }
) {
  try {
    const { pairId } = await params;
    const body = await request.json();
    const { status } = body as { status: DuplicateStatus };

    if (!['pending', 'confirmed', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Statut de doublon invalide.' }, { status: 400 });
    }

    const updatedPair = setDuplicateStatus(pairId, status);
    if (!updatedPair) {
      return NextResponse.json({ error: `Paire de doublon introuvable : ${pairId}` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      pair: updatedPair,
    });
  } catch (error) {
    console.error('Erreur lors de la mise a jour du doublon :', error);
    return NextResponse.json(
      { error: 'Erreur lors de la mise a jour du doublon.' },
      { status: 500 }
    );
  }
}
