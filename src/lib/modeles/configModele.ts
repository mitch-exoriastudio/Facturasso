// =====================================================================
//  Modèle « config » : paramètres généraux et configuration e-mail.
// =====================================================================
import { Prisma } from '@prisma/client';
import { prisma, dec } from '../prisma';

// ─── Types d'entrée (corps de requête) ─────────────────────────────────────────

export interface DonneesParametres {
  asso_raison_sociale?: string | null;
  asso_contact_nom?: string | null;
  asso_contact_prenom?: string | null;
  asso_adresse1?: string | null;
  asso_adresse2?: string | null;
  asso_adresse3?: string | null;
  asso_code_postal?: string | null;
  asso_ville?: string | null;
  asso_email?: string | null;
  asso_email2?: string | null;
  asso_tel?: string | null;
  asso_tel2?: string | null;
  asso_pays?: string | null;
  asso_siren?: string | null;
  asso_siret?: string | null;
  asso_num_tva_intra?: string | null;
  asso_statut?: string | null;
  asso_naf?: string | null;
  asso_autre_mention1?: string | null;
  asso_autre_mention2?: string | null;
  rna?: string | null;
  tva_active?: boolean;
  mention_obligatoire_fact4?: string | null;
  com_entete_page_factu?: string | null;
  com_pied_page_factu?: string | null;
  logo_asso?: string | null;
  note_pense_bete?: string | null;
}

export interface DonneesEmailConfig {
  smtp_adresse?: string;
  smtp_user?: string;
  // Le champ de saisie du port peut renvoyer une chaîne.
  smtp_num_port?: number | string;
  smtp_option_secu?: string;
  smtp_mot_de_passe?: string;
  email_expediteur?: string;
  email_cc?: string;
  email_cci?: string;
  email_envoi_fact_objet?: string;
  email_envoi_fact_corps?: string;
  signature_img?: string | null;
  signature_hauteur?: number | null;
  signature_largeur?: number | null;
  oauth_client_id?: string;
  oauth_client_secret?: string;
  oauth_url_auth?: string;
  oauth_url_token?: string;
  oauth_url_redirect?: string;
  oauth_scope?: string;
  oauth_type_reponse?: string;
}

export interface DonneesUtilisateur {
  nom_utilisateur: string;
  email?: string | null;
  telephone?: string | null;
  droit_admin?: boolean;
  compte_desactive?: boolean;
  droit_consult_fac?: boolean;
  droit_ajout_fac?: boolean;
  droit_consult_paiem?: boolean;
  droit_ajout_paiem?: boolean;
  droit_consult_clients?: boolean;
  droit_ajout_clients?: boolean;
  droit_config?: boolean;
}

export interface DonneesPrestation {
  id_prestation?: number | null;
  reference?: string | null;
  designation: string;
  // Les champs de saisie envoient une chaîne ; Prisma (Decimal) l'accepte.
  prix_unitaire: number | string;
  ne_plus_proposer_presta?: boolean;
}

export interface DonneesModePaiement {
  id_mode_paiement?: number | null;
  nom_mode_paiement: string;
  abrege_mode_paiement?: string;
  ne_plus_proposer?: boolean;
}

export interface LigneVille {
  code_postal: string;
  nom_ville: string;
}

// ─── Paramètres généraux (ligne unique, id = 1) ───────────────────────────────

export async function lireParametres() {
  return prisma.parametreGeneral.findUnique({ where: { id_parametre_general: 1 } });
}

export async function sauvegarderParametres(donnees: DonneesParametres): Promise<void> {
  await prisma.parametreGeneral.update({
    where: { id_parametre_general: 1 },
    data: {
      asso_raison_sociale:           donnees.asso_raison_sociale          ?? null,
      asso_contact_nom:              donnees.asso_contact_nom             ?? null,
      asso_contact_prenom:           donnees.asso_contact_prenom          ?? null,
      asso_adresse1:                 donnees.asso_adresse1                ?? null,
      asso_adresse2:                 donnees.asso_adresse2                ?? null,
      asso_adresse3:                 donnees.asso_adresse3                ?? null,
      asso_code_postal:              donnees.asso_code_postal             ?? null,
      asso_ville:                    donnees.asso_ville                   ?? null,
      asso_email:                    donnees.asso_email                   ?? null,
      asso_email2:                   donnees.asso_email2                  ?? null,
      asso_tel:                      donnees.asso_tel                     ?? null,
      asso_tel2:                     donnees.asso_tel2                    ?? null,
      asso_pays:                     donnees.asso_pays                    ?? null,
      asso_siren:                    donnees.asso_siren                   ?? null,
      asso_siret:                    donnees.asso_siret                   ?? null,
      asso_num_tva_intra:            donnees.asso_num_tva_intra           ?? null,
      asso_statut:                   donnees.asso_statut                  ?? null,
      asso_naf:                      donnees.asso_naf                     ?? null,
      asso_autre_mention1:           donnees.asso_autre_mention1          ?? null,
      asso_autre_mention2:           donnees.asso_autre_mention2          ?? null,
      rna:                           donnees.rna                          ?? null,
      tva_active:                    donnees.tva_active                   ?? false,
      mention_obligatoire_fact4:     donnees.mention_obligatoire_fact4    ?? null,
      com_entete_page_factu:         donnees.com_entete_page_factu        ?? null,
      com_pied_page_factu:           donnees.com_pied_page_factu          ?? null,
      logo_asso:                     donnees.logo_asso                    ?? null,
      note_pense_bete:               donnees.note_pense_bete              ?? null,
    },
  });
}

export async function mettreAJourDernierNumero(numero: number): Promise<void> {
  await prisma.parametreGeneral.update({
    where: { id_parametre_general: 1 },
    data: { facture_dernier_numero_interne: numero },
  });
}

// ─── Utilisateurs ─────────────────────────────────────────────────────────────

// Normalise un e-mail (minuscules + sans espaces superflus) ou renvoie null.
export function normaliserEmail(email: string | null | undefined): string | null {
  const v = (email ?? '').trim().toLowerCase();
  return v || null;
}

const CHAMPS_UTILISATEUR = {
  id_utilisateur:       true,
  nom_utilisateur:      true,
  email:                true,
  telephone:            true,
  droit_admin:          true,
  compte_desactive:     true,
  compte_superviseur:   true,
  droit_consult_fac:    true,
  droit_ajout_fac:      true,
  droit_consult_paiem:  true,
  droit_ajout_paiem:    true,
  droit_consult_clients:true,
  droit_ajout_clients:  true,
  droit_config:         true,
} as const;

export async function lireUtilisateur(id: number) {
  return prisma.utilisateur.findUnique({ where: { id_utilisateur: id }, select: CHAMPS_UTILISATEUR });
}

export async function listerUtilisateurs(avecDesactives = false) {
  return prisma.utilisateur.findMany({
    where: avecDesactives ? undefined : { compte_desactive: false },
    select: CHAMPS_UTILISATEUR,
    // Le superviseur (compte_superviseur = true) est toujours relégué en dernier ;
    // ordre alphabétique sur le nom à l'intérieur de chaque groupe.
    orderBy: [{ compte_superviseur: 'asc' }, { nom_utilisateur: 'asc' }],
  });
}

export async function creerUtilisateur(
  donnees: DonneesUtilisateur,
  motDePasseHache: string,
): Promise<number> {
  const utilisateur = await prisma.utilisateur.create({
    data: {
      nom_utilisateur:       donnees.nom_utilisateur,
      email:                 normaliserEmail(donnees.email),
      telephone:             donnees.telephone?.trim() || null,
      mot_de_passe_hache:    motDePasseHache,
      droit_admin:           !!donnees.droit_admin,
      compte_desactive:      !!donnees.compte_desactive,
      droit_consult_fac:     !!donnees.droit_consult_fac,
      droit_ajout_fac:       !!donnees.droit_ajout_fac,
      droit_consult_paiem:   !!donnees.droit_consult_paiem,
      droit_ajout_paiem:     !!donnees.droit_ajout_paiem,
      droit_consult_clients: !!donnees.droit_consult_clients,
      droit_ajout_clients:   !!donnees.droit_ajout_clients,
      droit_config:          !!donnees.droit_config,
    },
  });
  return utilisateur.id_utilisateur;
}

export async function modifierUtilisateur(
  id: number,
  donnees: DonneesUtilisateur,
  motDePasseHache?: string | null,
): Promise<void> {
  const data: Prisma.UtilisateurUpdateInput = {
    nom_utilisateur:       donnees.nom_utilisateur,
    email:                 normaliserEmail(donnees.email),
    telephone:             donnees.telephone?.trim() || null,
    droit_admin:           !!donnees.droit_admin,
    compte_desactive:      !!donnees.compte_desactive,
    droit_consult_fac:     !!donnees.droit_consult_fac,
    droit_ajout_fac:       !!donnees.droit_ajout_fac,
    droit_consult_paiem:   !!donnees.droit_consult_paiem,
    droit_ajout_paiem:     !!donnees.droit_ajout_paiem,
    droit_consult_clients: !!donnees.droit_consult_clients,
    droit_ajout_clients:   !!donnees.droit_ajout_clients,
    droit_config:          !!donnees.droit_config,
  };
  if (motDePasseHache) data.mot_de_passe_hache = motDePasseHache;

  await prisma.utilisateur.update({ where: { id_utilisateur: id }, data });
}

// Vrai si le nom apparaît en création OU modification dans brouillon/facture/paiement.
// Sert à décider entre suppression définitive (aucune activité) et désactivation.
export async function utilisateurAActivite(nomUtilisateur: string): Promise<boolean> {
  const ou = { OR: [{ utilisateur_creation: nomUtilisateur }, { utilisateur_modification: nomUtilisateur }] };
  const [brouillons, factures, paiements] = await Promise.all([
    prisma.brouillon.count({ where: ou }),
    prisma.facture.count({ where: ou }),
    prisma.paiement.count({ where: ou }),
  ]);
  return brouillons + factures + paiements > 0;
}

export async function desactiverUtilisateur(id: number): Promise<void> {
  await prisma.utilisateur.update({
    where: { id_utilisateur: id },
    data: { compte_desactive: true },
  });
}

export async function supprimerUtilisateur(id: number): Promise<void> {
  // La config e-mail liée est supprimée en cascade (EmailConfig.onDelete: Cascade).
  await prisma.utilisateur.delete({ where: { id_utilisateur: id } });
}

// Nombre d'administrateurs encore actifs — pour le garde-fou « dernier admin ».
export async function compterAdminsActifs(): Promise<number> {
  return prisma.utilisateur.count({ where: { droit_admin: true, compte_desactive: false } });
}

// ─── Configuration e-mail (une par utilisateur) ────────────────────────────────

export async function lireEmailConfig(idUtilisateur: number) {
  const config = await prisma.emailConfig.findUnique({
    where: { id_utilisateur: idUtilisateur },
  });
  if (!config) return null;
  // On ne renvoie jamais le mot de passe SMTP au client.
  const { smtp_mot_de_passe: _motDePasse, ...reste } = config;
  return reste;
}

export async function sauvegarderEmailConfig(
  idUtilisateur: number,
  donnees: DonneesEmailConfig,
): Promise<void> {
  const champs = {
    smtp_adresse:           donnees.smtp_adresse           ?? '',
    smtp_user:              donnees.smtp_user              ?? '',
    smtp_num_port:          Number(donnees.smtp_num_port ?? 587) || 587,
    smtp_option_secu:       donnees.smtp_option_secu       ?? 'SMTPS',
    email_expediteur:       donnees.email_expediteur       ?? '',
    email_cc:               donnees.email_cc               ?? '',
    email_cci:              donnees.email_cci              ?? '',
    email_envoi_fact_objet: donnees.email_envoi_fact_objet ?? '',
    email_envoi_fact_corps: donnees.email_envoi_fact_corps ?? '',
    signature_img:          donnees.signature_img          ?? null,
    signature_hauteur:      donnees.signature_hauteur      ?? null,
    signature_largeur:      donnees.signature_largeur      ?? null,
    oauth_client_id:        donnees.oauth_client_id        ?? '',
    oauth_client_secret:    donnees.oauth_client_secret    ?? '',
    oauth_url_auth:         donnees.oauth_url_auth         ?? '',
    oauth_url_token:        donnees.oauth_url_token        ?? '',
    oauth_url_redirect:     donnees.oauth_url_redirect     ?? '',
    oauth_scope:            donnees.oauth_scope            ?? '',
    oauth_type_reponse:     donnees.oauth_type_reponse     ?? '',
    // Le mot de passe n'est mis à jour que s'il est fourni (sinon inchangé).
    ...(donnees.smtp_mot_de_passe ? { smtp_mot_de_passe: donnees.smtp_mot_de_passe } : {}),
  };

  await prisma.emailConfig.upsert({
    where:  { id_utilisateur: idUtilisateur },
    update: champs,
    create: { id_utilisateur: idUtilisateur, ...champs },
  });
}

// ─── Prestations ──────────────────────────────────────────────────────────────

export async function listerPrestations(avecArchivees = false) {
  const lignes = await prisma.prestation.findMany({
    where: avecArchivees ? undefined : { ne_plus_proposer_presta: false },
    orderBy: { designation: 'asc' },
  });
  return dec(lignes);
}

export async function sauvegarderPrestation(donnees: DonneesPrestation): Promise<void> {
  // Référence : lettres/chiffres/tirets, majuscules forcées (filet de sécurité côté serveur).
  const ref = donnees.reference?.replace(/[^A-Za-z0-9-]/g, '').toUpperCase() || null;
  if (donnees.id_prestation) {
    await prisma.prestation.update({
      where: { id_prestation: donnees.id_prestation },
      data: {
        reference:               ref,
        designation:             donnees.designation,
        prix_unitaire:           donnees.prix_unitaire,
        ne_plus_proposer_presta: !!donnees.ne_plus_proposer_presta,
      },
    });
  } else {
    await prisma.prestation.create({
      data: {
        reference:   ref,
        designation: donnees.designation,
        prix_unitaire: donnees.prix_unitaire,
      },
    });
  }
}

export async function supprimerPrestation(id: number): Promise<void> {
  await prisma.prestation.delete({ where: { id_prestation: id } });
}

// ─── Modes de paiement ────────────────────────────────────────────────────────

export async function listerModesPaiement(avecArchives = false) {
  return prisma.modePaiement.findMany({
    where: avecArchives ? undefined : { ne_plus_proposer: false },
    orderBy: { nom_mode_paiement: 'asc' },
  });
}

export async function sauvegarderModePaiement(donnees: DonneesModePaiement): Promise<void> {
  // Abrégé : lettres uniquement, majuscules forcées (filet de sécurité côté serveur).
  const abrege = donnees.abrege_mode_paiement?.replace(/[^A-Za-z]/g, '').toUpperCase() || '';
  if (donnees.id_mode_paiement) {
    await prisma.modePaiement.update({
      where: { id_mode_paiement: donnees.id_mode_paiement },
      data: {
        nom_mode_paiement:    donnees.nom_mode_paiement,
        abrege_mode_paiement: abrege,
        ne_plus_proposer:     !!donnees.ne_plus_proposer,
      },
    });
  } else {
    await prisma.modePaiement.create({
      data: {
        nom_mode_paiement:    donnees.nom_mode_paiement,
        abrege_mode_paiement: abrege,
      },
    });
  }
}

export async function supprimerModePaiement(id: number): Promise<void> {
  await prisma.modePaiement.delete({ where: { id_mode_paiement: id } });
}

// ─── Import CSV villes ────────────────────────────────────────────────────────

export async function importerVilles(lignesVilles: LigneVille[]): Promise<void> {
  // TRUNCATE impossible via Prisma ORM → requête brute.
  await prisma.$executeRaw`TRUNCATE TABLE ville`;
  if (lignesVilles.length === 0) return;
  await prisma.ville.createMany({
    data: lignesVilles.map((v) => ({
      code_postal: v.code_postal,
      nom_ville:   v.nom_ville,
    })),
    skipDuplicates: true,
  });
}
