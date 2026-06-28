import { NextResponse } from 'next/server';
import { protege } from '@/lib/handler.js';
import { sauvegarderModePaiement, supprimerModePaiement } from '@/lib/modeles/configModele.js';

// PUT /api/config/modes-paiement/:id
export const PUT = protege('droit_config', async (req, ctx) => {
  const { id } = await ctx.params;
  const body = await req.json();
  if (!body.nom_mode_paiement?.trim() || !body.abrege_mode_paiement?.trim()) {
    return NextResponse.json({ message: 'Le nom et l\'abrégé sont requis.' }, { status: 400 });
  }
  await sauvegarderModePaiement({ ...body, id_mode_paiement: parseInt(id, 10) });
  return NextResponse.json({ message: 'Mode de paiement enregistré.' });
});

// DELETE /api/config/modes-paiement/:id
export const DELETE = protege('droit_config', async (req, ctx) => {
  const { id } = await ctx.params;
  try {
    await supprimerModePaiement(parseInt(id, 10));
    return NextResponse.json({ message: 'Mode de paiement supprimé.' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return NextResponse.json({ message: 'Impossible de supprimer : ce mode est utilisé dans des paiements.' }, { status: 400 });
    }
    throw err;
  }
});
