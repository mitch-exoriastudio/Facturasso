import { NextResponse } from 'next/server';
import { protege } from '@/lib/handler.js';
import { rechercherVilles, rechercherVillesParNom } from '@/lib/modeles/clientModele.js';

// GET /api/clients/villes?cp=66&nom=perp
// (segment statique « villes » prioritaire sur le segment dynamique [id])
export const GET = protege(null, async (req) => {
  const { searchParams } = new URL(req.url);
  const cp = searchParams.get('cp');
  const nom = searchParams.get('nom');
  if (cp) return NextResponse.json(await rechercherVilles(cp));
  if (nom) return NextResponse.json(await rechercherVillesParNom(nom));
  return NextResponse.json([]);
});
