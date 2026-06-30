import { NextResponse } from 'next/server';
import { protege } from '@/lib/handler.js';
import { listerModesPaiement, sauvegarderModePaiement } from '@/lib/modeles/configModele.js';

// GET /api/config/modes-paiement?archives=1
export const GET = protege('droit_config', async (req) => {
  const { searchParams } = new URL(req.url);
  return NextResponse.json(await listerModesPaiement(searchParams.get('archives') === '1'));
});

// POST /api/config/modes-paiement
export const POST = protege('droit_config', async (req) => {
  const body = await req.json();
  if (!body.nom_mode_paiement?.trim() || !body.abrege_mode_paiement?.trim()) {
    return NextResponse.json({ message: 'Le nom et l\'abrégé sont requis.' }, { status: 400 });
  }
  if (!/^[A-Za-z]+$/.test(body.abrege_mode_paiement.trim())) {
    return NextResponse.json({ message: 'L\'abrégé ne peut contenir que des lettres.' }, { status: 400 });
  }
  try {
    await sauvegarderModePaiement({ ...body, id_mode_paiement: null });
    return NextResponse.json({ message: 'Mode de paiement enregistré.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ message: 'Cet abrégé est déjà utilisé par un autre mode de paiement.' }, { status: 400 });
    }
    throw err;
  }
});
