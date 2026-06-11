// =====================================================================
//  Modèle « config » : paramètres généraux et config e-mail.
// =====================================================================
import { pool } from '../config/bdd.js';

// --- Paramètres généraux (ligne unique, id = 1) ---

export async function lireParametres() {
  const [lignes] = await pool.query('SELECT * FROM parametre_general WHERE id_parametre_general = 1');
  return lignes[0] || null;
}

export async function sauvegarderParametres(donnees) {
  await pool.query(
    `UPDATE parametre_general SET
       raison_sociale_asso = ?, activite_naf_asso = ?,
       adresse_asso1 = ?, adresse_asso2 = ?,
       code_postal_asso = ?, ville_association = ?,
       tel_asso1 = ?, tel_asso2 = ?,
       email_asso1 = ?, email_asso2 = ?,
       siret_asso = ?, tva_intra_asso = ?, rna = ?,
       mention_obligatoire_fact4 = ?,
       com_entete_page_factu = ?, com_pied_page_factu = ?,
       logo_asso = ?, note_pense_bete = ?
     WHERE id_parametre_general = 1`,
    [
      donnees.raison_sociale_asso, donnees.activite_naf_asso,
      donnees.adresse_asso1, donnees.adresse_asso2,
      donnees.code_postal_asso, donnees.ville_association,
      donnees.tel_asso1, donnees.tel_asso2,
      donnees.email_asso1, donnees.email_asso2,
      donnees.siret_asso, donnees.tva_intra_asso, donnees.rna,
      donnees.mention_obligatoire_fact4,
      donnees.com_entete_page_factu, donnees.com_pied_page_factu,
      donnees.logo_asso ?? null, donnees.note_pense_bete ?? '',
    ]
  );
}

export async function mettreAJourDernierNumero(numero) {
  await pool.query(
    'UPDATE parametre_general SET facture_dernier_numero_interne = ? WHERE id_parametre_general = 1',
    [numero]
  );
}

// --- Utilisateurs ---

export async function listerUtilisateurs(avecDesactives = false) {
  let sql = 'SELECT id_utilisateur, nom_utilisateur, droit_admin, compte_desactive, droit_consult_fac, droit_ajout_fac, droit_consult_paiem, droit_ajout_paiem, droit_consult_clients, droit_ajout_clients, droit_config FROM utilisateur';
  if (!avecDesactives) sql += ' WHERE compte_desactive = 0';
  sql += ' ORDER BY nom_utilisateur ASC';
  const [lignes] = await pool.query(sql);
  return lignes;
}

export async function creerUtilisateur(donnees, motDePasseHache) {
  const [res] = await pool.query(
    `INSERT INTO utilisateur
       (nom_utilisateur, mot_de_passe_hache, droit_admin, compte_desactive,
        droit_consult_fac, droit_ajout_fac, droit_consult_paiem, droit_ajout_paiem,
        droit_consult_clients, droit_ajout_clients, droit_config)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      donnees.nom_utilisateur, motDePasseHache,
      donnees.droit_admin ? 1 : 0, donnees.compte_desactive ? 1 : 0,
      donnees.droit_consult_fac ? 1 : 0, donnees.droit_ajout_fac ? 1 : 0,
      donnees.droit_consult_paiem ? 1 : 0, donnees.droit_ajout_paiem ? 1 : 0,
      donnees.droit_consult_clients ? 1 : 0, donnees.droit_ajout_clients ? 1 : 0,
      donnees.droit_config ? 1 : 0,
    ]
  );
  return res.insertId;
}

export async function modifierUtilisateur(id, donnees, motDePasseHache) {
  // Si un nouveau mot de passe est fourni, on le met à jour aussi.
  if (motDePasseHache) {
    await pool.query(
      `UPDATE utilisateur SET
         nom_utilisateur = ?, mot_de_passe_hache = ?, droit_admin = ?, compte_desactive = ?,
         droit_consult_fac = ?, droit_ajout_fac = ?, droit_consult_paiem = ?, droit_ajout_paiem = ?,
         droit_consult_clients = ?, droit_ajout_clients = ?, droit_config = ?
       WHERE id_utilisateur = ?`,
      [
        donnees.nom_utilisateur, motDePasseHache,
        donnees.droit_admin ? 1 : 0, donnees.compte_desactive ? 1 : 0,
        donnees.droit_consult_fac ? 1 : 0, donnees.droit_ajout_fac ? 1 : 0,
        donnees.droit_consult_paiem ? 1 : 0, donnees.droit_ajout_paiem ? 1 : 0,
        donnees.droit_consult_clients ? 1 : 0, donnees.droit_ajout_clients ? 1 : 0,
        donnees.droit_config ? 1 : 0, id,
      ]
    );
  } else {
    await pool.query(
      `UPDATE utilisateur SET
         nom_utilisateur = ?, droit_admin = ?, compte_desactive = ?,
         droit_consult_fac = ?, droit_ajout_fac = ?, droit_consult_paiem = ?, droit_ajout_paiem = ?,
         droit_consult_clients = ?, droit_ajout_clients = ?, droit_config = ?
       WHERE id_utilisateur = ?`,
      [
        donnees.nom_utilisateur,
        donnees.droit_admin ? 1 : 0, donnees.compte_desactive ? 1 : 0,
        donnees.droit_consult_fac ? 1 : 0, donnees.droit_ajout_fac ? 1 : 0,
        donnees.droit_consult_paiem ? 1 : 0, donnees.droit_ajout_paiem ? 1 : 0,
        donnees.droit_consult_clients ? 1 : 0, donnees.droit_ajout_clients ? 1 : 0,
        donnees.droit_config ? 1 : 0, id,
      ]
    );
  }
}

// --- Config e-mail (une par utilisateur) ---

export async function lireEmailConfig(idUtilisateur) {
  const [lignes] = await pool.query(
    'SELECT * FROM email_config WHERE id_utilisateur = ? LIMIT 1',
    [idUtilisateur]
  );
  // Ne jamais renvoyer le mot de passe SMTP au front.
  if (lignes[0]) delete lignes[0].smtp_mot_de_passe;
  return lignes[0] || null;
}

export async function sauvegarderEmailConfig(idUtilisateur, donnees) {
  const existant = await pool.query(
    'SELECT id_email_config FROM email_config WHERE id_utilisateur = ?',
    [idUtilisateur]
  );
  const champs = {
    smtp_adresse: donnees.smtp_adresse ?? '',
    smtp_user: donnees.smtp_user ?? '',
    smtp_num_port: donnees.smtp_num_port ?? 587,
    smtp_option_secu: donnees.smtp_option_secu ?? 'SMTPS',
    email_expediteur: donnees.email_expediteur ?? '',
    email_cc: donnees.email_cc ?? '',
    email_cci: donnees.email_cci ?? '',
    email_envoi_fact_objet: donnees.email_envoi_fact_objet ?? '',
    email_envoi_fact_corps: donnees.email_envoi_fact_corps ?? '',
    signature_img: donnees.signature_img ?? null,
    signature_hauteur: donnees.signature_hauteur ?? '',
    signature_largeur: donnees.signature_largeur ?? '',
    oauth_client_id: donnees.oauth_client_id ?? '',
    oauth_client_secret: donnees.oauth_client_secret ?? '',
    oauth_url_auth: donnees.oauth_url_auth ?? '',
    oauth_url_token: donnees.oauth_url_token ?? '',
    oauth_url_redirect: donnees.oauth_url_redirect ?? '',
    oauth_scope: donnees.oauth_scope ?? '',
    oauth_type_reponse: donnees.oauth_type_reponse ?? '',
  };

  if (existant[0].length > 0) {
    // Met à jour le mot de passe seulement s'il est fourni (non vide).
    const setClauses = Object.keys(champs).map(k => `${k} = ?`).join(', ');
    const valeurs = Object.values(champs);
    if (donnees.smtp_mot_de_passe) {
      await pool.query(
        `UPDATE email_config SET ${setClauses}, smtp_mot_de_passe = ? WHERE id_utilisateur = ?`,
        [...valeurs, donnees.smtp_mot_de_passe, idUtilisateur]
      );
    } else {
      await pool.query(
        `UPDATE email_config SET ${setClauses} WHERE id_utilisateur = ?`,
        [...valeurs, idUtilisateur]
      );
    }
  } else {
    await pool.query(
      `INSERT INTO email_config (id_utilisateur, smtp_mot_de_passe, ${Object.keys(champs).join(', ')})
       VALUES (?, ?, ${Object.keys(champs).map(() => '?').join(', ')})`,
      [idUtilisateur, donnees.smtp_mot_de_passe ?? '', ...Object.values(champs)]
    );
  }
}

// --- Prestations ---

export async function listerPrestations(avecArchivees = false) {
  let sql = 'SELECT * FROM prestation';
  if (!avecArchivees) sql += ' WHERE ne_plus_proposer_presta = 0';
  sql += ' ORDER BY designation ASC';
  const [lignes] = await pool.query(sql);
  return lignes;
}

export async function sauvegarderPrestation(donnees) {
  // Référence vide → NULL pour respecter la contrainte UNIQUE (MySQL autorise plusieurs NULL).
  const ref = donnees.reference?.trim() || null;
  if (donnees.id_prestation) {
    await pool.query(
      'UPDATE prestation SET reference = ?, designation = ?, prix_unitaire = ?, ne_plus_proposer_presta = ? WHERE id_prestation = ?',
      [ref, donnees.designation, donnees.prix_unitaire, donnees.ne_plus_proposer_presta ? 1 : 0, donnees.id_prestation]
    );
  } else {
    await pool.query(
      'INSERT INTO prestation (reference, designation, prix_unitaire, ne_plus_proposer_presta) VALUES (?, ?, ?, 0)',
      [ref, donnees.designation, donnees.prix_unitaire]
    );
  }
}

export async function supprimerPrestation(id) {
  await pool.query('DELETE FROM prestation WHERE id_prestation = ?', [id]);
}

// --- Modes de paiement ---

export async function listerModesPaiement(avecArchives = false) {
  let sql = 'SELECT * FROM mode_paiement';
  if (!avecArchives) sql += ' WHERE ne_plus_proposer = 0';
  sql += ' ORDER BY nom_mode_paiement ASC';
  const [lignes] = await pool.query(sql);
  return lignes;
}

export async function sauvegarderModePaiement(donnees) {
  if (donnees.id_mode_paiement) {
    await pool.query(
      'UPDATE mode_paiement SET nom_mode_paiement = ?, abrege_mode_paiement = ?, ne_plus_proposer = ? WHERE id_mode_paiement = ?',
      [donnees.nom_mode_paiement, donnees.abrege_mode_paiement, donnees.ne_plus_proposer ? 1 : 0, donnees.id_mode_paiement]
    );
  } else {
    await pool.query(
      'INSERT INTO mode_paiement (nom_mode_paiement, abrege_mode_paiement, ne_plus_proposer) VALUES (?, ?, 0)',
      [donnees.nom_mode_paiement, donnees.abrege_mode_paiement]
    );
  }
}

export async function supprimerModePaiement(id) {
  await pool.query('DELETE FROM mode_paiement WHERE id_mode_paiement = ?', [id]);
}

// --- Import CSV villes ---
// Insère en masse les villes depuis un tableau { code_postal, nom_ville }.
export async function importerVilles(lignesVilles) {
  // Vide la table avant de réimporter (remplacement complet).
  await pool.query('TRUNCATE TABLE ville');
  if (lignesVilles.length === 0) return;
  const valeurs = lignesVilles.map(v => [v.code_postal, v.nom_ville]);
  await pool.query('INSERT INTO ville (code_postal, nom_ville) VALUES ?', [valeurs]);
}
