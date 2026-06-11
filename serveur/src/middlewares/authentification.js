// =====================================================================
//  Middlewares d'authentification et de contrôle des droits
// =====================================================================
import jwt from 'jsonwebtoken';

// Vérifie la présence et la validité du jeton JWT envoyé par le client.
// En cas de succès, place les infos de l'utilisateur dans req.utilisateur.
export function verifierJeton(req, res, next) {
  const entete = req.headers.authorization || '';
  const jeton = entete.startsWith('Bearer ') ? entete.slice(7) : null;

  if (!jeton) {
    return res.status(401).json({ message: 'Non authentifié.' });
  }
  try {
    req.utilisateur = jwt.verify(jeton, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: 'Session expirée ou invalide.' });
  }
}

// Fabrique un middleware qui exige un droit précis.
// L'administrateur (droit_admin) passe toujours.
// Exemple d'utilisation : routeur.post('/', verifierJeton, exigerDroit('droit_ajout_clients'), ...)
export function exigerDroit(nomDroit) {
  return (req, res, next) => {
    const u = req.utilisateur;
    if (u && (u.droit_admin || u[nomDroit])) {
      return next();
    }
    return res.status(403).json({ message: 'Droit insuffisant pour cette action.' });
  };
}
