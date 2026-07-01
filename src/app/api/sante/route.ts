import { NextResponse } from 'next/server';

// GET /api/sante — vérification rapide que l'API répond.
export function GET() {
  return NextResponse.json({ statut: 'ok' });
}
