import { NextResponse } from 'next/server';
import { protege } from '@/lib/handler';
import { listerPrestations, sauvegarderPrestation } from '@/lib/modeles/configModele';

// GET /api/config/prestations?archivees=1
export const GET = protege('droit_config', async (req) => {
  const { searchParams } = new URL(req.url);
  return NextResponse.json(await listerPrestations(searchParams.get('archivees') === '1'));
});

// POST /api/config/prestations
export const POST = protege('droit_config', async (req) => {
  const body = await req.json();
  const ref = (body.reference ?? '').trim();
  if (ref && !/^[A-Za-z0-9-]+$/.test(ref)) {
    return NextResponse.json({ message: 'La référence ne peut contenir que des lettres, des chiffres et des tirets.' }, { status: 400 });
  }
  try {
    await sauvegarderPrestation({ ...body, id_prestation: null });
    return NextResponse.json({ message: 'Prestation enregistrée.' });
  } catch (err) {
    if ((err as { code?: string }).code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ message: 'Cette référence est déjà utilisée par une autre prestation.' }, { status: 400 });
    }
    throw err;
  }
});
