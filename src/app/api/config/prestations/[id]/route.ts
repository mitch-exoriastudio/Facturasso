import { NextResponse } from 'next/server';
import { protege } from '@/lib/handler';
import { sauvegarderPrestation, supprimerPrestation } from '@/lib/modeles/configModele';

// PUT /api/config/prestations/:id
export const PUT = protege('droit_config', async (req, ctx) => {
  const { id } = await ctx.params;
  const body = await req.json();
  const ref = (body.reference ?? '').trim();
  if (ref && !/^[A-Za-z0-9-]+$/.test(ref)) {
    return NextResponse.json({ message: 'La référence ne peut contenir que des lettres, des chiffres et des tirets.' }, { status: 400 });
  }
  try {
    await sauvegarderPrestation({ ...body, id_prestation: parseInt(id, 10) });
    return NextResponse.json({ message: 'Prestation enregistrée.' });
  } catch (err) {
    if ((err as { code?: string }).code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ message: 'Cette référence est déjà utilisée par une autre prestation.' }, { status: 400 });
    }
    throw err;
  }
});

// DELETE /api/config/prestations/:id
export const DELETE = protege('droit_config', async (req, ctx) => {
  const { id } = await ctx.params;
  await supprimerPrestation(parseInt(id, 10));
  return NextResponse.json({ message: 'Prestation supprimée.' });
});
