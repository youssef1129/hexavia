import { NextResponse } from 'next/server';
import { updateConsultantScore } from '@/lib/storage';
import { ScoreCriteria } from '@/types/idea';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { criteria, notes } = body as { criteria: ScoreCriteria; notes?: string };

    if (!criteria) {
      return NextResponse.json({ error: 'Criteres de notation manquants.' }, { status: 400 });
    }

    const total =
      Number(criteria.businessImpact || 0) +
      Number(criteria.feasibility || 0) +
      Number(criteria.strategicAlignment || 0) +
      Number(criteria.innovation || 0);

    const updatedIdea = updateConsultantScore(id, {
      criteria: {
        businessImpact: Number(criteria.businessImpact),
        feasibility: Number(criteria.feasibility),
        strategicAlignment: Number(criteria.strategicAlignment),
        innovation: Number(criteria.innovation),
      },
      total,
      notes: notes || '',
      updatedAt: new Date().toISOString(),
    });

    if (!updatedIdea) {
      return NextResponse.json({ error: `Idee introuvable : ${id}` }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      idea: updatedIdea,
    });
  } catch (error) {
    console.error('Erreur lors de l enregistrement de la note consultant :', error);
    return NextResponse.json(
      { error: 'Erreur serveur lors de la notation.' },
      { status: 500 }
    );
  }
}
