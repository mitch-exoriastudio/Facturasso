// =====================================================================
//  Contrôleur public (pas d'authentification requise).
// =====================================================================
import { listerDossiers } from '../licence/index.js';

// GET /api/public/dossiers
// Retourne la liste des dossiers disponibles pour la page de connexion.
export function getDossiers(req, res) {
  try {
    const dossiers = listerDossiers();
    // Ne jamais exposer database_url au client.
    res.json(dossiers.map(({ id, nom }) => ({ id, nom })));
  } catch (err) {
    res.status(503).json({ message: 'Impossible de récupérer les dossiers.', detail: err.message });
  }
}
