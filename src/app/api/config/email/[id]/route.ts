import { NextResponse } from 'next/server';
import { protege } from '@/lib/handler';
import { lireEmailConfig, sauvegarderEmailConfig } from '@/lib/modeles/configModele';

// GET /api/config/email/:id
export const GET = protege('droit_config', async (req, ctx) => {
  const { id } = await ctx.params;
  return NextResponse.json(await lireEmailConfig(parseInt(id, 10)));
});

// PUT /api/config/email/:id
export const PUT = protege('droit_config', async (req, ctx) => {
  const { id } = await ctx.params;
  await sauvegarderEmailConfig(parseInt(id, 10), await req.json());
  return NextResponse.json({ message: 'Configuration e-mail enregistrée.' });
});
