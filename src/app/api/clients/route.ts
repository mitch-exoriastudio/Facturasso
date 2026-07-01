import { NextResponse } from 'next/server';
import { protege } from '@/lib/handler';
import { listerClients, creerClient, trouverClientParId } from '@/lib/modeles/clientModele';

// GET /api/clients?recherche=…&archives=1
export const GET = protege('droit_consult_clients', async (req) => {
  const { searchParams } = new URL(req.url);
  const clients = await listerClients({
    rechercheTexte: searchParams.get('recherche') || '',
    avecArchives: searchParams.get('archives') === '1',
  });
  return NextResponse.json(clients);
});

// POST /api/clients
export const POST = protege('droit_ajout_clients', async (req, ctx) => {
  const id = await creerClient(await req.json(), ctx.utilisateur.nom_utilisateur);
  const client = await trouverClientParId(id);
  return NextResponse.json(client, { status: 201 });
});
