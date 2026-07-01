import { NextResponse } from 'next/server';
import { protege } from '@/lib/handler';
import { lireParametres, sauvegarderParametres } from '@/lib/modeles/configModele';

// GET /api/config/parametres
export const GET = protege('droit_config', async () => {
  return NextResponse.json(await lireParametres());
});

// PUT /api/config/parametres
export const PUT = protege('droit_config', async (req) => {
  await sauvegarderParametres(await req.json());
  return NextResponse.json({ message: 'Paramètres enregistrés.' });
});
