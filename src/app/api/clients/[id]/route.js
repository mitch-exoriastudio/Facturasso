import { NextResponse } from 'next/server';
import { protege } from '@/lib/handler.js';
import { trouverClientParId, modifierClient } from '@/lib/modeles/clientModele.js';

// GET /api/clients/:id
export const GET = protege('droit_consult_clients', async (req, ctx) => {
  const { id } = await ctx.params;
  const client = await trouverClientParId(parseInt(id, 10));
  if (!client) return NextResponse.json({ message: 'Client introuvable.' }, { status: 404 });
  return NextResponse.json(client);
});

// PUT /api/clients/:id
export const PUT = protege('droit_ajout_clients', async (req, ctx) => {
  const { id } = await ctx.params;
  const idClient = parseInt(id, 10);
  const client = await trouverClientParId(idClient);
  if (!client) return NextResponse.json({ message: 'Client introuvable.' }, { status: 404 });
  await modifierClient(idClient, await req.json(), ctx.utilisateur.nom_utilisateur);
  return NextResponse.json(await trouverClientParId(idClient));
});
