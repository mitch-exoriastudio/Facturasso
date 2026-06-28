import { NextResponse } from 'next/server';
import { protege } from '@/lib/handler.js';
import { mettreAJourDernierNumero } from '@/lib/modeles/configModele.js';

// PATCH /api/config/dernier-numero
export const PATCH = protege('droit_config', async (req) => {
  const { numero: brut } = await req.json();
  const numero = Number(brut);
  if (!Number.isInteger(numero) || numero < 0) {
    return NextResponse.json({ message: 'Numéro invalide.' }, { status: 400 });
  }
  await mettreAJourDernierNumero(numero);
  return NextResponse.json({ message: 'Dernier numéro mis à jour.' });
});
