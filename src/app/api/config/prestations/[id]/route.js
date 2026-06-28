import { NextResponse } from 'next/server';
import { protege } from '@/lib/handler.js';
import { sauvegarderPrestation, supprimerPrestation } from '@/lib/modeles/configModele.js';

// PUT /api/config/prestations/:id
export const PUT = protege('droit_config', async (req, ctx) => {
  const { id } = await ctx.params;
  try {
    await sauvegarderPrestation({ ...(await req.json()), id_prestation: parseInt(id, 10) });
    return NextResponse.json({ message: 'Prestation enregistrée.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
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
