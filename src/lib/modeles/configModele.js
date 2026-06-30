// =====================================================================
//  Modèle « config » : paramètres généraux et configuration e-mail.
// =====================================================================
import { prisma, dec } from '../prisma.js';

// ─── Paramètres généraux (ligne unique, id = 1) ───────────────────────────────

export async function lireParametres() {
  return prisma.parametreGeneral.findUnique({ where: { id_parametre_general: 1 } });
}

export async function sauvegarderParametres(donnees) {
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

export async function mettreAJourDernierNumero(numero) {
  await prisma.parametreGeneral.update({
    where: { id_parametre_general: 1 },
    data: { facture_dernier_numero_interne: numero },
  });
}

// ─── Utilisateurs ─────────────────────────────────────────────────────────────

const CHAMPS_UTILISATEUR = {
  id_utilisateur:       true,
  nom_utilisateur:      true,
  droit_admin:          true,
  compte_desactive:     true,
  compte_protege:       true,
  droit_consult_fac:    true,
  droit_ajout_fac:      true,
  droit_consult_paiem:  true,
  droit_ajout_paiem:    true,
  droit_consult_clients:true,
  droit_ajout_clients:  true,
  droit_config:         true,
};

export async function lireUtilisateur(id) {
  return prisma.utilisateur.findUnique({ where: { id_utilisateur: id }, select: CHAMPS_UTILISATEUR });
}

export async function listerUtilisateurs(avecDesactives = false) {
  return prisma.utilisateur.findMany({
    where: avecDesactives ? undefined : { compte_desactive: false },
    select: CHAMPS_UTILISATEUR,
    orderBy: { nom_utilisateur: 'asc' },
  });
}

export async function creerUtilisateur(donnees, motDePasseHache) {
  const utilisateur = await prisma.utilisateur.create({
    data: {
      nom_utilisateur:       donnees.nom_utilisateur,
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

export async function modifierUtilisateur(id, donnees, motDePasseHache) {
  const data = {
    nom_utilisateur:       donnees.nom_utilisateur,
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

// ─── Configuration e-mail (une par utilisateur) ────────────────────────────────

export async function lireEmailConfig(idUtilisateur) {
  const config = await prisma.emailConfig.findUnique({
    where: { id_utilisateur: idUtilisateur },
  });
  if (config) delete config.smtp_mot_de_passe;
  return config || null;
}

export async function sauvegarderEmailConfig(idUtilisateur, donnees) {
  const champs = {
    smtp_adresse:           donnees.smtp_adresse           ?? '',
    smtp_user:              donnees.smtp_user              ?? '',
    smtp_num_port:          donnees.smtp_num_port          ?? 587,
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
  };

  if (donnees.smtp_mot_de_passe) {
    champs.smtp_mot_de_passe = donnees.smtp_mot_de_passe;
  }

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

export async function sauvegarderPrestation(donnees) {
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

export async function supprimerPrestation(id) {
  await prisma.prestation.delete({ where: { id_prestation: id } });
}

// ─── Modes de paiement ────────────────────────────────────────────────────────

export async function listerModesPaiement(avecArchives = false) {
  return prisma.modePaiement.findMany({
    where: avecArchives ? undefined : { ne_plus_proposer: false },
    orderBy: { nom_mode_paiement: 'asc' },
  });
}

export async function sauvegarderModePaiement(donnees) {
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

export async function supprimerModePaiement(id) {
  await prisma.modePaiement.delete({ where: { id_mode_paiement: id } });
}

// ─── Import CSV villes ────────────────────────────────────────────────────────

export async function importerVilles(lignesVilles) {
  // TRUNCATE impossible via Prisma ORM → requête brute.
  await prisma.$executeRaw`TRUNCATE TABLE ville`;
  if (lignesVilles.length === 0) return;
  await prisma.ville.createMany({
    data: lignesVilles.map(v => ({
      code_postal: v.code_postal,
      nom_ville:   v.nom_ville,
    })),
    skipDuplicates: true,
  });
}
