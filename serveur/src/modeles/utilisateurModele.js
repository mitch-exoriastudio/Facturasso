// =====================================================================
//  Modèle « utilisateur » : accès à la table des comptes.
//  (Les modèles regroupent les requêtes SQL d'une table.)
// =====================================================================
import { pool } from '../config/bdd.js';

// Recherche un utilisateur par son nom (utilisé lors de la connexion).
export async function trouverParNom(nomUtilisateur) {
  const [lignes] = await pool.query(
    'SELECT * FROM utilisateur WHERE nom_utilisateur = ? LIMIT 1',
    [nomUtilisateur]
  );
  return lignes[0] || null;
}

// Recherche un utilisateur par son identifiant.
export async function trouverParId(idUtilisateur) {
  const [lignes] = await pool.query(
    'SELECT * FROM utilisateur WHERE id_utilisateur = ? LIMIT 1',
    [idUtilisateur]
  );
  return lignes[0] || null;
}
