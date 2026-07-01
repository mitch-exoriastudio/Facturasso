import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { protege } from '@/lib/handler';
import { listerUtilisateurs, creerUtilisateur } from '@/lib/modeles/configModele';
import { EMAIL_INVALIDE, emailValide, TELEPHONE_REQUIS, telephoneValide } from '@/lib/validation';

// GET /api/config/utilisateurs?desactives=1
export const GET = protege('droit_config', async (req, { utilisateur }) => {
  const { searchParams } = new URL(req.url);
  const liste = await listerUtilisateurs(searchParams.get('desactives') === '1');
  // Les coordonnées du superviseur (e-mail + téléphone) sont confidentielles :
  // personne ne les voit, sauf le superviseur lui-même sur sa propre fiche.
  const liste_filtree = liste.map((u) =>
    u.compte_superviseur && u.id_utilisateur !== utilisateur.id_utilisateur
      ? { ...u, email: null, telephone: null }
      : u,
  );
  return NextResponse.json(liste_filtree);
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
  // Le mobile est obligatoire dès la création (future connexion OTP).
  if (!telephoneValide(body.telephone)) {
    return NextResponse.json({ message: TELEPHONE_REQUIS }, { status: 400 });
  }
  const hache = await bcrypt.hash(body.mot_de_passe, 10);
  const id = await creerUtilisateur(body, hache);
  return NextResponse.json({ id_utilisateur: id }, { status: 201 });
});
