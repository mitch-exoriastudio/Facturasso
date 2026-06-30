import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { protege } from '@/lib/handler.js';
import {
  lireUtilisateur,
  modifierUtilisateur,
  utilisateurAActivite,
  desactiverUtilisateur,
  supprimerUtilisateur,
  compterAdminsActifs,
} from '@/lib/modeles/configModele.js';

// PUT /api/config/utilisateurs/:id
export const PUT = protege('droit_config', async (req, ctx) => {
  const { id } = await ctx.params;
  const idCible = parseInt(id, 10);
  const idConnecte = ctx.utilisateur.id_utilisateur;

  const cible = await lireUtilisateur(idCible);
  if (!cible) return NextResponse.json({ message: 'Utilisateur introuvable.' }, { status: 404 });

  const body = await req.json();

  if (cible.compte_superviseur && idCible !== idConnecte) {
    return NextResponse.json({ message: 'Ce compte superviseur ne peut être modifié que par lui-même.' }, { status: 403 });
  }
  if (cible.compte_superviseur && body.compte_desactive) {
    return NextResponse.json({ message: 'Un compte superviseur ne peut pas être désactivé.' }, { status: 403 });
  }

  const hache = body.mot_de_passe ? await bcrypt.hash(body.mot_de_passe, 10) : null;
  await modifierUtilisateur(idCible, body, hache);
  return NextResponse.json({ message: 'Utilisateur mis à jour.' });
});

// DELETE /api/config/utilisateurs/:id
// Supprime définitivement le compte s'il n'a aucune activité (création ou
// modification de facture/brouillon/paiement), sinon le désactive.
export const DELETE = protege('droit_config', async (req, ctx) => {
  const { id } = await ctx.params;
  const idCible = parseInt(id, 10);

  const acteur = await lireUtilisateur(ctx.utilisateur.id_utilisateur);
  const cible = await lireUtilisateur(idCible);
  if (!cible) return NextResponse.json({ message: 'Utilisateur introuvable.' }, { status: 404 });

  // Personne ne peut se supprimer/désactiver soi-même.
  if (cible.id_utilisateur === acteur.id_utilisateur) {
    return NextResponse.json({ message: 'Vous ne pouvez pas supprimer votre propre compte.' }, { status: 403 });
  }
  // Le compte superviseur ne peut être ni supprimé ni désactivé.
  if (cible.compte_superviseur) {
    return NextResponse.json({ message: 'Le compte superviseur ne peut pas être supprimé ni désactivé.' }, { status: 403 });
  }
  // Autorité de l'acteur : le superviseur agit sur tous ; un admin uniquement sur les non-admins.
  if (!acteur.compte_superviseur) {
    if (!acteur.droit_admin) {
      return NextResponse.json({ message: 'Seuls les administrateurs peuvent supprimer ou désactiver un compte.' }, { status: 403 });
    }
    if (cible.droit_admin) {
      return NextResponse.json({ message: 'Seul le superviseur peut supprimer ou désactiver un administrateur.' }, { status: 403 });
    }
  }
  // Garde-fou : ne jamais retirer le dernier administrateur actif.
  if (cible.droit_admin && (await compterAdminsActifs()) <= 1) {
    return NextResponse.json({ message: 'Impossible : c\'est le dernier administrateur actif.' }, { status: 403 });
  }

  if (await utilisateurAActivite(cible.nom_utilisateur)) {
    await desactiverUtilisateur(idCible);
    return NextResponse.json({ desactive: true, message: 'Compte désactivé (activité existante conservée).' });
  }
  await supprimerUtilisateur(idCible);
  return NextResponse.json({ supprime: true, message: 'Compte supprimé définitivement.' });
});
