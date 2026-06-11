// =====================================================================
//  Routes clients (préfixe : /api/clients)
// =====================================================================
import { Router } from 'express';
import { verifierJeton, exigerDroit } from '../middlewares/authentification.js';
import { liste, detail, creer, modifier, archiver, villes } from '../controleurs/clientControleur.js';

const routeur = Router();

// Toutes les routes clients exigent d'être connecté.
routeur.use(verifierJeton);

// Route villes en premier car sinon /villes serait capturé par /:id
routeur.get('/villes', villes);

routeur.get('/', exigerDroit('droit_consult_clients'), liste);
routeur.get('/:id', exigerDroit('droit_consult_clients'), detail);
routeur.post('/', exigerDroit('droit_ajout_clients'), creer);
routeur.put('/:id', exigerDroit('droit_ajout_clients'), modifier);
routeur.patch('/:id/archiver', exigerDroit('droit_ajout_clients'), archiver);

export default routeur;
