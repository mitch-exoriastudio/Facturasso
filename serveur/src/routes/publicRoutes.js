// =====================================================================
//  Routes publiques (sans authentification, préfixe : /api/public)
// =====================================================================
import { Router } from 'express';
import { getDossiers } from '../controleurs/publicControleur.js';

const routeur = Router();

routeur.get('/dossiers', getDossiers);

export default routeur;
