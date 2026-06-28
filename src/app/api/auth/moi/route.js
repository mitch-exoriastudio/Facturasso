import { NextResponse } from 'next/server';
import { protege } from '@/lib/handler.js';

// GET /api/auth/moi — renvoie l'utilisateur courant (jeton déjà vérifié).
export const GET = protege(null, async (req, ctx) => {
  return NextResponse.json({ utilisateur: ctx.utilisateur });
});
