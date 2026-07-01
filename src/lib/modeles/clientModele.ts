// =====================================================================
//  Modèle « client » : toutes les requêtes sur la table client.
// =====================================================================
import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';

// Données de saisie d'un client (issues du corps de requête).
export interface DonneesClient {
  civilite?: string;
  nom?: string;
  prenom?: string;
  adresse1?: string;
  adresse2?: string;
  adresse3?: string;
  code_postal?: string;
  ville?: string;
  pays?: string;
  telephone?: string;
  mobile?: string;
  email?: string;
}

interface OptionsListeClients {
  rechercheTexte?: string;
  avecArchives?: boolean;
}

export async function listerClients({
  rechercheTexte = '',
  avecArchives = false,
}: OptionsListeClients = {}) {
  const where: Prisma.ClientWhereInput = {};

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

export async function trouverClientParId(id: number | string) {
  return prisma.client.findUnique({ where: { id_client: Number(id) } });
}

export async function creerClient(donnees: DonneesClient, nomUtilisateur: string): Promise<number> {
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

export async function modifierClient(
  id: number | string,
  donnees: DonneesClient,
  nomUtilisateur: string,
): Promise<void> {
  await prisma.client.update({
    where: { id_client: Number(id) },
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

export async function archiverClient(
  id: number | string,
  archiver: boolean,
  nomUtilisateur: string,
): Promise<void> {
  await prisma.client.update({
    where: { id_client: Number(id) },
    data: {
      archive:                 archiver,
      utilisateur_modification:nomUtilisateur,
    },
  });
}

export async function rechercherVilles(codePostal: string) {
  return prisma.ville.findMany({
    where: { code_postal: { startsWith: codePostal } },
    select: { code_postal: true, nom_ville: true },
    distinct: ['code_postal', 'nom_ville'],
    orderBy: { nom_ville: 'asc' },
    take: 20,
  });
}

export async function rechercherVillesParNom(nomVille: string) {
  return prisma.ville.findMany({
    where: { nom_ville: { startsWith: nomVille } },
    select: { code_postal: true, nom_ville: true },
    distinct: ['code_postal', 'nom_ville'],
    orderBy: { nom_ville: 'asc' },
    take: 20,
  });
}
