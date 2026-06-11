// =====================================================================
//  Routes configuration (préfixe : /api/config)
//  Toutes nécessitent d'être connecté + droit_config (ou admin).
// =====================================================================
import { Router } from 'express';
import { verifierJeton, exigerDroit } from '../middlewares/authentification.js';
import {
  getParametres, putParametres, patchDernierNumero,
  getUtilisateurs, postUtilisateur, putUtilisateur,
  getEmailConfig, putEmailConfig,
  getPrestations, sauvegarderPrestationCtrl, supprimerPrestationCtrl,
  getModesPaiement, sauvegarderModePaiementCtrl, supprimerModePaiementCtrl,
  importerVillesCtrl,
} from '../controleurs/configControleur.js';

const routeur = Router();
routeur.use(verifierJeton, exigerDroit('droit_config'));

routeur.get('/parametres', getParametres);
routeur.put('/parametres', putParametres);
routeur.patch('/dernier-numero', patchDernierNumero);

routeur.get('/utilisateurs', getUtilisateurs);
routeur.post('/utilisateurs', postUtilisateur);
routeur.put('/utilisateurs/:id', putUtilisateur);

routeur.get('/email/:id', getEmailConfig);
routeur.put('/email/:id', putEmailConfig);

routeur.get('/prestations', getPrestations);
routeur.post('/prestations', sauvegarderPrestationCtrl);
routeur.put('/prestations/:id', sauvegarderPrestationCtrl);
routeur.delete('/prestations/:id', supprimerPrestationCtrl);

routeur.get('/modes-paiement', getModesPaiement);
routeur.post('/modes-paiement', sauvegarderModePaiementCtrl);
routeur.put('/modes-paiement/:id', sauvegarderModePaiementCtrl);
routeur.delete('/modes-paiement/:id', supprimerModePaiementCtrl);

routeur.post('/importer-villes', importerVillesCtrl);

export default routeur;
