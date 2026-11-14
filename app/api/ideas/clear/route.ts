import { NextResponse } from 'next/server';
import { clearAppState } from '@/lib/storage';

export async function POST() {
  clearAppState();
  return NextResponse.json({
    success: true,
    ideasCount: 0,
  });
}
