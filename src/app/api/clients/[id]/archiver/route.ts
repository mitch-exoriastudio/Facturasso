import { NextResponse } from 'next/server';
import { protege } from '@/lib/handler';
import { trouverClientParId, archiverClient } from '@/lib/modeles/clientModele';

// PATCH /api/clients/:id/archiver
export const PATCH = protege('droit_ajout_clients', async (req, ctx) => {
  const { id } = await ctx.params;
  const idClient = parseInt(id, 10);
  const client = await trouverClientParId(idClient);
  if (!client) return NextResponse.json({ message: 'Client introuvable.' }, { status: 404 });
  const body = await req.json();
  await archiverClient(idClient, body.archiver, ctx.utilisateur.nom_utilisateur);
  return NextResponse.json({ message: body.archiver ? 'Client archivé.' : 'Client désarchivé.' });
});
