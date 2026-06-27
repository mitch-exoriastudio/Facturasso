// =====================================================================
//  Contrôleur d'authentification : connexion et récupération du profil.
// =====================================================================
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDossierClient } from '../config/prisma.js';
import { trouverDossier, acquirirSeat, heartbeatSeat, releaserSeat } from '../licence/index.js';

// Construit l'objet de droits inséré dans le jeton et renvoyé au front.
function extraireDroits(u) {
  return {
    id_utilisateur:       u.id_utilisateur,
    nom_utilisateur:      u.nom_utilisateur,
    droit_admin:          !!u.droit_admin,
    droit_consult_fac:    !!u.droit_consult_fac,
    droit_ajout_fac:      !!u.droit_ajout_fac,
    droit_consult_paiem:  !!u.droit_consult_paiem,
    droit_ajout_paiem:    !!u.droit_ajout_paiem,
    droit_consult_clients:!!u.droit_consult_clients,
    droit_ajout_clients:  !!u.droit_ajout_clients,
    droit_config:         !!u.droit_config,
  };
}

// POST /api/auth/connexion
// Corps : { nomUtilisateur, motDePasse, dossierId }
// En mode dev bypass, dossierId est optionnel (défaut : "dev").
export async function connexion(req, res, next) {
  try {
    const { nomUtilisateur, motDePasse, dossierId = 'dev' } = req.body;

    if (!nomUtilisateur || !motDePasse) {
      return res.status(400).json({ message: 'Identifiant et mot de passe requis.' });
    }

    const dossier = trouverDossier(dossierId);
    if (!dossier) {
      return res.status(400).json({ message: 'Dossier inconnu ou accès non autorisé.' });
    }

    const client = getDossierClient(dossier.database_url);
    const utilisateur = await client.utilisateur.findUnique({
      where: { nom_utilisateur: nomUtilisateur },
    });

    if (!utilisateur || utilisateur.compte_desactive) {
      return res.status(401).json({ message: 'Identifiants incorrects.' });
    }

    const motDePasseValide = await bcrypt.compare(motDePasse, utilisateur.mot_de_passe_hache);
    if (!motDePasseValide) {
      return res.status(401).json({ message: 'Identifiants incorrects.' });
    }

    const droits = extraireDroits(utilisateur);
    const payload = {
      ...droits,
      dossier_id:  dossier.id,
      dossier_nom: dossier.nom,
    };

    const jeton = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_DUREE || '8h',
    });

    res.json({
      jeton,
      utilisateur: droits,
      dossier: { id: dossier.id, nom: dossier.nom },
    });
  } catch (err) { next(err); }
}

// GET /api/auth/moi — renvoie l'utilisateur courant (jeton déjà vérifié).
export async function moi(req, res) {
  res.json({ utilisateur: req.utilisateur });
}

// POST /api/auth/deconnexion — libère le seat Exoria (no-op en dev bypass).
export async function deconnexion(req, res, next) {
  try {
    const token = req.utilisateur?.exoria_session_token ?? null;
    await releaserSeat(token);
    res.json({ message: 'Déconnecté.' });
  } catch (err) { next(err); }
}

// POST /api/auth/heartbeat — maintient le seat Exoria actif.
// Le front doit appeler cet endpoint périodiquement (ex. toutes les 2 min).
export async function heartbeat(req, res, next) {
  try {
    const token = req.utilisateur?.exoria_session_token ?? null;
    const { valid, revoked } = await heartbeatSeat(token);
    if (revoked) {
      return res.status(401).json({ message: 'Session révoquée par l\'administrateur.', revoque: true });
    }
    res.json({ valid });
  } catch (err) { next(err); }
}
