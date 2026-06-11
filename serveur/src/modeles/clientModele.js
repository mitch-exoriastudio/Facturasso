// =====================================================================
//  Modèle « client » : toutes les requêtes SQL sur la table client.
// =====================================================================
import { pool } from '../config/bdd.js';

// Retourne la liste des clients selon les filtres demandés.
// rechercheTexte : cherche dans nom, prénom, code postal, ville, téléphone, e-mail.
// avecArchives   : si false (par défaut), n'affiche que les clients actifs.
export async function listerClients({ rechercheTexte = '', avecArchives = false } = {}) {
  let sql = `
    SELECT id_client, civilite, nom, prenom,
           adresse1, adresse2, adresse3,
           code_postal, ville, telephone, mobile, email, archive
    FROM client
    WHERE 1=1
  `;
  const params = [];

  if (!avecArchives) {
    sql += ' AND archive = 0';
  }

  if (rechercheTexte.trim()) {
    const motif = `%${rechercheTexte.trim()}%`;
    sql += ` AND (nom LIKE ? OR prenom LIKE ? OR code_postal LIKE ?
                 OR ville LIKE ? OR telephone LIKE ? OR mobile LIKE ? OR email LIKE ?)`;
    params.push(motif, motif, motif, motif, motif, motif, motif);
  }

  sql += ' ORDER BY nom ASC, prenom ASC';

  const [lignes] = await pool.query(sql, params);
  return lignes;
}

// Retourne un seul client par son identifiant.
export async function trouverClientParId(id) {
  const [lignes] = await pool.query(
    `SELECT * FROM client WHERE id_client = ? LIMIT 1`,
    [id]
  );
  return lignes[0] || null;
}

// Crée un nouveau client et retourne son identifiant généré.
export async function creerClient(donnees, nomUtilisateur) {
  const [resultat] = await pool.query(
    `INSERT INTO client
       (civilite, nom, prenom, adresse1, adresse2, adresse3,
        code_postal, ville, pays, telephone, mobile, email,
        utilisateur_creation, utilisateur_modification)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      donnees.civilite ?? '',
      donnees.nom ?? '',
      donnees.prenom ?? '',
      donnees.adresse1 ?? '',
      donnees.adresse2 ?? '',
      donnees.adresse3 ?? '',
      donnees.code_postal ?? '',
      donnees.ville ?? '',
      donnees.pays ?? '',
      donnees.telephone ?? '',
      donnees.mobile ?? '',
      donnees.email ?? '',
      nomUtilisateur,
      nomUtilisateur,
    ]
  );
  return resultat.insertId;
}

// Met à jour un client existant.
export async function modifierClient(id, donnees, nomUtilisateur) {
  await pool.query(
    `UPDATE client SET
       civilite = ?, nom = ?, prenom = ?,
       adresse1 = ?, adresse2 = ?, adresse3 = ?,
       code_postal = ?, ville = ?, pays = ?,
       telephone = ?, mobile = ?, email = ?,
       utilisateur_modification = ?
     WHERE id_client = ?`,
    [
      donnees.civilite ?? '',
      donnees.nom ?? '',
      donnees.prenom ?? '',
      donnees.adresse1 ?? '',
      donnees.adresse2 ?? '',
      donnees.adresse3 ?? '',
      donnees.code_postal ?? '',
      donnees.ville ?? '',
      donnees.pays ?? '',
      donnees.telephone ?? '',
      donnees.mobile ?? '',
      donnees.email ?? '',
      nomUtilisateur,
      id,
    ]
  );
}

// Archive ou désarchive un client (archive = 1 ou 0).
export async function archiverClient(id, archiver, nomUtilisateur) {
  await pool.query(
    `UPDATE client SET archive = ?, utilisateur_modification = ? WHERE id_client = ?`,
    [archiver ? 1 : 0, nomUtilisateur, id]
  );
}

// Recherche de villes par code postal (auto-complétion).
export async function rechercherVilles(codePostal) {
  const [lignes] = await pool.query(
    `SELECT DISTINCT code_postal, nom_ville
     FROM ville
     WHERE code_postal LIKE ?
     ORDER BY nom_ville ASC
     LIMIT 20`,
    [`${codePostal}%`]
  );
  return lignes;
}

// Recherche de villes par nom (auto-complétion depuis le champ ville).
export async function rechercherVillesParNom(nomVille) {
  const [lignes] = await pool.query(
    `SELECT DISTINCT code_postal, nom_ville
     FROM ville
     WHERE nom_ville LIKE ?
     ORDER BY nom_ville ASC
     LIMIT 20`,
    [`${nomVille}%`]
  );
  return lignes;
}
