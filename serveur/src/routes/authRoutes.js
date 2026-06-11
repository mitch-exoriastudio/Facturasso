// =====================================================================
//  Routes d'authentification (préfixe : /api/auth)
// =====================================================================
import { Router } from 'express';
import { connexion, moi } from '../controleurs/authControleur.js';
import { verifierJeton } from '../middlewares/authentification.js';

const routeur = Router();

routeur.post('/connexion', connexion);     // se connecter
routeur.get('/moi', verifierJeton, moi);   // qui suis-je ?

export default routeur;
