import { NextResponse } from 'next/server';
import { listerDossiers } from '@/lib/licence';

// GET /api/public/dossiers
// Retourne la liste des dossiers disponibles pour la page de connexion.
export function GET() {
  try {
    const dossiers = listerDossiers();
    // Ne jamais exposer database_url au client.
    return NextResponse.json(dossiers.map(({ id, nom }) => ({ id, nom })));
  } catch (err) {
    return NextResponse.json(
      { message: 'Impossible de récupérer les dossiers.', detail: (err as Error).message },
      { status: 503 },
    );
  }
}
