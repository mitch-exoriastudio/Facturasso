import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDossierClient } from '@/lib/prisma.js';
import { trouverDossier } from '@/lib/licence.js';
import { ouvert } from '@/lib/handler.js';

// Construit l'objet de droits inséré dans le jeton et renvoyé au front.
function extraireDroits(u) {
  return {
    id_utilisateur:        u.id_utilisateur,
    nom_utilisateur:       u.nom_utilisateur,
    droit_admin:           !!u.droit_admin,
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
// Corps : { nomUtilisateur, motDePasse, dossierId }
// En mode dev bypass, dossierId est optionnel (défaut : "dev").
export const POST = ouvert(async (req) => {
  const { nomUtilisateur, motDePasse, dossierId = 'dev' } = await req.json();

  if (!nomUtilisateur || !motDePasse) {
    return NextResponse.json({ message: 'Identifiant et mot de passe requis.' }, { status: 400 });
  }

  const dossier = trouverDossier(dossierId);
  if (!dossier) {
    return NextResponse.json({ message: 'Dossier inconnu ou accès non autorisé.' }, { status: 400 });
  }

  const client = getDossierClient(dossier.database_url);
  const utilisateur = await client.utilisateur.findUnique({
    where: { nom_utilisateur: nomUtilisateur },
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
    expiresIn: process.env.JWT_DUREE || '8h',
  });

  return NextResponse.json({
    jeton,
    utilisateur: droits,
    dossier: { id: dossier.id, nom: dossier.nom },
  });
});
