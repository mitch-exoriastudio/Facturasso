import { NextResponse } from 'next/server';
import { protege } from '@/lib/handler.js';
import { listerPrestations, sauvegarderPrestation } from '@/lib/modeles/configModele.js';

// GET /api/config/prestations?archivees=1
export const GET = protege('droit_config', async (req) => {
  const { searchParams } = new URL(req.url);
  return NextResponse.json(await listerPrestations(searchParams.get('archivees') === '1'));
});

// POST /api/config/prestations
export const POST = protege('droit_config', async (req) => {
  try {
    await sauvegarderPrestation({ ...(await req.json()), id_prestation: null });
    return NextResponse.json({ message: 'Prestation enregistrée.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ message: 'Cette référence est déjà utilisée par une autre prestation.' }, { status: 400 });
    }
    throw err;
  }
});
