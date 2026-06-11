// =====================================================================
//  Contrôleur d'authentification : connexion et récupération du profil.
// =====================================================================
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { trouverParNom } from '../modeles/utilisateurModele.js';

// Construit l'objet de droits inséré dans le jeton et renvoyé au front.
// On convertit les 0/1 de la base en vrais booléens (true/false).
function extraireDroits(u) {
  return {
    id_utilisateur: u.id_utilisateur,
    nom_utilisateur: u.nom_utilisateur,
    droit_admin: !!u.droit_admin,
    droit_consult_fac: !!u.droit_consult_fac,
    droit_ajout_fac: !!u.droit_ajout_fac,
    droit_consult_paiem: !!u.droit_consult_paiem,
    droit_ajout_paiem: !!u.droit_ajout_paiem,
    droit_consult_clients: !!u.droit_consult_clients,
    droit_ajout_clients: !!u.droit_ajout_clients,
    droit_config: !!u.droit_config,
  };
}

// POST /api/auth/connexion
export async function connexion(req, res) {
  const { nomUtilisateur, motDePasse } = req.body;
  if (!nomUtilisateur || !motDePasse) {
    return res.status(400).json({ message: 'Identifiant et mot de passe requis.' });
  }

  const utilisateur = await trouverParNom(nomUtilisateur);
  // Même message d'erreur que le compte existe ou non (pour ne pas révéler d'info).
  if (!utilisateur || utilisateur.compte_desactive) {
    return res.status(401).json({ message: 'Identifiants incorrects.' });
  }

  const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.mot_de_passe_hache);
  if (!motDePasseValide) {
    return res.status(401).json({ message: 'Identifiants incorrects.' });
  }

  const droits = extraireDroits(utilisateur);
  const jeton = jwt.sign(droits, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_DUREE || '8h',
  });

  res.json({ jeton, utilisateur: droits });
}

// GET /api/auth/moi  — renvoie l'utilisateur courant (jeton déjà vérifié).
export async function moi(req, res) {
  res.json({ utilisateur: req.utilisateur });
}
