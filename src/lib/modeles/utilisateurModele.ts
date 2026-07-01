// =====================================================================
//  Modèle « utilisateur » : accès à la table des comptes.
// =====================================================================
import { prisma } from '../prisma';

export async function trouverParNom(nomUtilisateur: string) {
  return prisma.utilisateur.findUnique({
    where: { nom_utilisateur: nomUtilisateur },
  });
}

export async function trouverParId(idUtilisateur: number) {
  return prisma.utilisateur.findUnique({
    where: { id_utilisateur: idUtilisateur },
  });
}
