// =====================================================================
//  Routes d'authentification (préfixe : /api/auth)
// =====================================================================
import { Router } from 'express';
import { connexion, moi, deconnexion, heartbeat } from '../controleurs/authControleur.js';
import { verifierJeton } from '../middlewares/authentification.js';

const routeur = Router();

routeur.post('/connexion',    connexion);
routeur.get('/moi',           verifierJeton, moi);
routeur.post('/deconnexion',  verifierJeton, deconnexion);
routeur.post('/heartbeat',    verifierJeton, heartbeat);

export default routeur;
