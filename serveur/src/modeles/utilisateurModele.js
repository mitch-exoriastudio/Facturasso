// =====================================================================
//  Modèle « utilisateur » : accès à la table des comptes.
// =====================================================================
import { prisma } from '../config/prisma.js';

export async function trouverParNom(nomUtilisateur) {
  return prisma.utilisateur.findUnique({
    where: { nom_utilisateur: nomUtilisateur },
  });
}

export async function trouverParId(idUtilisateur) {
  return prisma.utilisateur.findUnique({
    where: { id_utilisateur: idUtilisateur },
  });
}
