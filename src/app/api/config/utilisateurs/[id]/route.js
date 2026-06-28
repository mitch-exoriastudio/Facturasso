import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { protege } from '@/lib/handler.js';
import { lireUtilisateur, modifierUtilisateur } from '@/lib/modeles/configModele.js';

// PUT /api/config/utilisateurs/:id
export const PUT = protege('droit_config', async (req, ctx) => {
  const { id } = await ctx.params;
  const idCible = parseInt(id, 10);
  const idConnecte = ctx.utilisateur.id_utilisateur;

  const cible = await lireUtilisateur(idCible);
  if (!cible) return NextResponse.json({ message: 'Utilisateur introuvable.' }, { status: 404 });

  const body = await req.json();

  if (cible.compte_protege && idCible !== idConnecte) {
    return NextResponse.json({ message: 'Ce compte est protégé et ne peut être modifié que par son propriétaire.' }, { status: 403 });
  }
  if (cible.compte_protege && body.compte_desactive) {
    return NextResponse.json({ message: 'Un compte protégé ne peut pas être désactivé.' }, { status: 403 });
  }

  const hache = body.mot_de_passe ? await bcrypt.hash(body.mot_de_passe, 10) : null;
  await modifierUtilisateur(idCible, body, hache);
  return NextResponse.json({ message: 'Utilisateur mis à jour.' });
});
