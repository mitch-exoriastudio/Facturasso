import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { protege } from '@/lib/handler.js';
import { listerUtilisateurs, creerUtilisateur } from '@/lib/modeles/configModele.js';
import { EMAIL_INVALIDE, emailValide } from '@/lib/validation.js';

// GET /api/config/utilisateurs?desactives=1
export const GET = protege('droit_config', async (req) => {
  const { searchParams } = new URL(req.url);
  return NextResponse.json(await listerUtilisateurs(searchParams.get('desactives') === '1'));
});

// POST /api/config/utilisateurs
export const POST = protege('droit_config', async (req) => {
  const body = await req.json();
  if (!body.nom_utilisateur || !body.mot_de_passe) {
    return NextResponse.json({ message: 'Nom et mot de passe requis.' }, { status: 400 });
  }
  // L'e-mail est l'identifiant de connexion → obligatoire et valide.
  if (!emailValide(body.email)) {
    return NextResponse.json({ message: EMAIL_INVALIDE }, { status: 400 });
  }
  const hache = await bcrypt.hash(body.mot_de_passe, 10);
  const id = await creerUtilisateur(body, hache);
  return NextResponse.json({ id_utilisateur: id }, { status: 201 });
});
