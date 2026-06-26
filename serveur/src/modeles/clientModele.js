// =====================================================================
//  Modèle « client » : toutes les requêtes sur la table client.
// =====================================================================
import { prisma, dec } from '../config/prisma.js';

export async function listerClients({ rechercheTexte = '', avecArchives = false } = {}) {
  const where = {};

  if (!avecArchives) where.archive = false;

  if (rechercheTexte.trim()) {
    const motif = rechercheTexte.trim();
    where.OR = [
      { nom:        { contains: motif } },
      { prenom:     { contains: motif } },
      { code_postal:{ contains: motif } },
      { ville:      { contains: motif } },
      { telephone:  { contains: motif } },
      { mobile:     { contains: motif } },
      { email:      { contains: motif } },
    ];
  }

  const lignes = await prisma.client.findMany({
    where,
    select: {
      id_client: true, civilite: true, nom: true, prenom: true,
      adresse1: true, adresse2: true, adresse3: true,
      code_postal: true, ville: true, telephone: true,
      mobile: true, email: true, archive: true,
    },
    orderBy: [{ nom: 'asc' }, { prenom: 'asc' }],
  });

  return lignes;
}

export async function trouverClientParId(id) {
  return prisma.client.findUnique({ where: { id_client: id } });
}

export async function creerClient(donnees, nomUtilisateur) {
  const client = await prisma.client.create({
    data: {
      civilite:                donnees.civilite    ?? '',
      nom:                     donnees.nom         ?? '',
      prenom:                  donnees.prenom      ?? '',
      adresse1:                donnees.adresse1    ?? '',
      adresse2:                donnees.adresse2    ?? '',
      adresse3:                donnees.adresse3    ?? '',
      code_postal:             donnees.code_postal ?? '',
      ville:                   donnees.ville       ?? '',
      pays:                    donnees.pays        ?? '',
      telephone:               donnees.telephone   ?? '',
      mobile:                  donnees.mobile      ?? '',
      email:                   donnees.email       ?? '',
      utilisateur_creation:    nomUtilisateur,
      utilisateur_modification:nomUtilisateur,
    },
  });
  return client.id_client;
}

export async function modifierClient(id, donnees, nomUtilisateur) {
  await prisma.client.update({
    where: { id_client: id },
    data: {
      civilite:                donnees.civilite    ?? '',
      nom:                     donnees.nom         ?? '',
      prenom:                  donnees.prenom      ?? '',
      adresse1:                donnees.adresse1    ?? '',
      adresse2:                donnees.adresse2    ?? '',
      adresse3:                donnees.adresse3    ?? '',
      code_postal:             donnees.code_postal ?? '',
      ville:                   donnees.ville       ?? '',
      pays:                    donnees.pays        ?? '',
      telephone:               donnees.telephone   ?? '',
      mobile:                  donnees.mobile      ?? '',
      email:                   donnees.email       ?? '',
      utilisateur_modification:nomUtilisateur,
    },
  });
}

export async function archiverClient(id, archiver, nomUtilisateur) {
  await prisma.client.update({
    where: { id_client: id },
    data: {
      archive:                 archiver,
      utilisateur_modification:nomUtilisateur,
    },
  });
}

export async function rechercherVilles(codePostal) {
  return prisma.ville.findMany({
    where: { code_postal: { startsWith: codePostal } },
    select: { code_postal: true, nom_ville: true },
    distinct: ['code_postal', 'nom_ville'],
    orderBy: { nom_ville: 'asc' },
    take: 20,
  });
}

export async function rechercherVillesParNom(nomVille) {
  return prisma.ville.findMany({
    where: { nom_ville: { startsWith: nomVille } },
    select: { code_postal: true, nom_ville: true },
    distinct: ['code_postal', 'nom_ville'],
    orderBy: { nom_ville: 'asc' },
    take: 20,
  });
}
