import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { Utilisateur } from '@prisma/client';
import { getDossierClient } from '@/lib/prisma';
import { trouverDossier } from '@/lib/licence';
import { ouvert } from '@/lib/handler';
import type { Droits } from '@/types';

// Construit l'objet de droits inséré dans le jeton et renvoyé au front.
function extraireDroits(u: Utilisateur): Droits {
  return {
    id_utilisateur:        u.id_utilisateur,
    nom_utilisateur:       u.nom_utilisateur,
    email:                 u.email ?? null,
    droit_admin:           !!u.droit_admin,
    compte_superviseur:    !!u.compte_superviseur,
    droit_consult_fac:     !!u.droit_consult_fac,
    droit_ajout_fac:       !!u.droit_ajout_fac,
    droit_consult_paiem:   !!u.droit_consult_paiem,
    droit_ajout_paiem:     !!u.droit_ajout_paiem,
    droit_consult_clients: !!u.droit_consult_clients,
    droit_ajout_clients:   !!u.droit_ajout_clients,
    droit_config:          !!u.droit_config,
  };
}

// POST /api/auth/connexion
// Corps : { email, motDePasse, dossierId }
// La connexion se fait désormais par adresse e-mail (et non plus par le nom).
// En mode dev bypass, dossierId est optionnel (défaut : "dev").
export const POST = ouvert(async (req) => {
  const { email, motDePasse, dossierId = 'dev' } = await req.json();

  const emailNormalise = (email ?? '').trim().toLowerCase();
  if (!emailNormalise || !motDePasse) {
    return NextResponse.json({ message: 'Adresse e-mail et mot de passe requis.' }, { status: 400 });
  }

  const dossier = trouverDossier(dossierId);
  if (!dossier) {
    return NextResponse.json({ message: 'Dossier inconnu ou accès non autorisé.' }, { status: 400 });
  }

  const client = getDossierClient(dossier.database_url);
  const utilisateur = await client.utilisateur.findUnique({
    where: { email: emailNormalise },
  });

  if (!utilisateur || utilisateur.compte_desactive) {
    return NextResponse.json({ message: 'Identifiants incorrects.' }, { status: 401 });
  }

  const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.mot_de_passe_hache);
  if (!motDePasseValide) {
    return NextResponse.json({ message: 'Identifiants incorrects.' }, { status: 401 });
  }

  const droits = extraireDroits(utilisateur);
  const payload = {
    ...droits,
    dossier_id:  dossier.id,
    dossier_nom: dossier.nom,
  };

  const jeton = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: (process.env.JWT_DUREE || '8h') as jwt.SignOptions['expiresIn'],
  });

  return NextResponse.json({
    jeton,
    utilisateur: droits,
    dossier: { id: dossier.id, nom: dossier.nom },
  });
});
