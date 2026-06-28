import { NextResponse } from 'next/server';
import { protege } from '@/lib/handler.js';
import { heartbeatSeat } from '@/lib/licence.js';

// POST /api/auth/heartbeat — maintient le seat Exoria actif.
// Le front doit appeler cet endpoint périodiquement (ex. toutes les 2 min).
export const POST = protege(null, async (req, ctx) => {
  const token = ctx.utilisateur?.exoria_session_token ?? null;
  const { valid, revoked } = await heartbeatSeat(token);
  if (revoked) {
    return NextResponse.json(
      { message: 'Session révoquée par l\'administrateur.', revoque: true },
      { status: 401 },
    );
  }
  return NextResponse.json({ valid });
});
