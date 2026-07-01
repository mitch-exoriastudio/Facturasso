import { NextResponse } from 'next/server';
import { protege } from '@/lib/handler';
import { releaserSeat } from '@/lib/licence';

// POST /api/auth/deconnexion — libère le seat Exoria (no-op en dev bypass).
export const POST = protege(null, async (req, ctx) => {
  const token = ctx.utilisateur?.exoria_session_token ?? null;
  await releaserSeat(token);
  return NextResponse.json({ message: 'Déconnecté.' });
});
