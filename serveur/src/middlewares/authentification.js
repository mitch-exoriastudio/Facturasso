// =====================================================================
//  Middlewares d'authentification et de contrôle des droits.
// =====================================================================
import jwt from 'jsonwebtoken';
import { getDossierClient, avecContexteDossier } from '../config/prisma.js';
import { trouverDossier } from '../licence/index.js';

// Vérifie le jeton JWT et injecte le contexte du dossier dans la requête.
// Toute la suite de la chaîne Express s'exécute dans ce contexte Prisma.
export function verifierJeton(req, res, next) {
  const entete = req.headers.authorization || '';
  const jeton = entete.startsWith('Bearer ') ? entete.slice(7) : null;

  if (!jeton) {
    return res.status(401).json({ message: 'Non authentifié.' });
  }

  let payload;
  try {
    payload = jwt.verify(jeton, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: 'Session expirée ou invalide.' });
  }

  req.utilisateur = payload;

  // Établit le contexte Prisma du dossier pour toute la suite de la requête.
  const dossier = trouverDossier(payload.dossier_id);
  if (!dossier) {
    return res.status(401).json({ message: 'Dossier de session introuvable ou révoqué.' });
  }

  const client = getDossierClient(dossier.database_url);
  avecContexteDossier(client, () => next());
}

// Fabrique un middleware qui exige un droit précis.
// L'administrateur (droit_admin) passe toujours.
export function exigerDroit(nomDroit) {
  return (req, res, next) => {
    const u = req.utilisateur;
    if (u && (u.droit_admin || u[nomDroit])) return next();
    return res.status(403).json({ message: 'Droit insuffisant pour cette action.' });
  };
}
