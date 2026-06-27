// =====================================================================
//  Contrôleur « config »
// =====================================================================
import bcrypt from 'bcryptjs';
import { parse as parseCsv } from 'csv-parse/sync';
import {
  lireParametres, sauvegarderParametres, mettreAJourDernierNumero,
  listerUtilisateurs, creerUtilisateur, modifierUtilisateur,
  lireEmailConfig, sauvegarderEmailConfig,
  listerPrestations, sauvegarderPrestation, supprimerPrestation,
  listerModesPaiement, sauvegarderModePaiement, supprimerModePaiement,
  importerVilles,
} from '../modeles/configModele.js';

// GET /api/config/parametres
export async function getParametres(req, res, next) {
  try {
    res.json(await lireParametres());
  } catch (err) { next(err); }
}

// PUT /api/config/parametres
export async function putParametres(req, res, next) {
  try {
    await sauvegarderParametres(req.body);
    res.json({ message: 'Paramètres enregistrés.' });
  } catch (err) { next(err); }
}

// PATCH /api/config/dernier-numero
export async function patchDernierNumero(req, res, next) {
  try {
    const numero = Number(req.body.numero);
    if (!Number.isInteger(numero) || numero < 0) {
      return res.status(400).json({ message: 'Numéro invalide.' });
    }
    await mettreAJourDernierNumero(numero);
    res.json({ message: 'Dernier numéro mis à jour.' });
  } catch (err) { next(err); }
}

// GET /api/config/utilisateurs?desactives=1
export async function getUtilisateurs(req, res, next) {
  try {
    res.json(await listerUtilisateurs(req.query.desactives === '1'));
  } catch (err) { next(err); }
}

// POST /api/config/utilisateurs
export async function postUtilisateur(req, res, next) {
  try {
    if (!req.body.nom_utilisateur || !req.body.mot_de_passe) {
      return res.status(400).json({ message: 'Nom et mot de passe requis.' });
    }
    const hache = await bcrypt.hash(req.body.mot_de_passe, 10);
    const id = await creerUtilisateur(req.body, hache);
    res.status(201).json({ id_utilisateur: id });
  } catch (err) { next(err); }
}

// PUT /api/config/utilisateurs/:id
export async function putUtilisateur(req, res, next) {
  try {
    const hache = req.body.mot_de_passe
      ? await bcrypt.hash(req.body.mot_de_passe, 10)
      : null;
    await modifierUtilisateur(req.params.id, req.body, hache);
    res.json({ message: 'Utilisateur mis à jour.' });
  } catch (err) { next(err); }
}

// GET /api/config/email/:id
export async function getEmailConfig(req, res, next) {
  try {
    res.json(await lireEmailConfig(req.params.id));
  } catch (err) { next(err); }
}

// PUT /api/config/email/:id
export async function putEmailConfig(req, res, next) {
  try {
    await sauvegarderEmailConfig(req.params.id, req.body);
    res.json({ message: 'Configuration e-mail enregistrée.' });
  } catch (err) { next(err); }
}

// GET /api/config/prestations?archivees=1
export async function getPrestations(req, res, next) {
  try {
    res.json(await listerPrestations(req.query.archivees === '1'));
  } catch (err) { next(err); }
}

// POST /api/config/prestations  +  PUT /api/config/prestations/:id
export async function sauvegarderPrestationCtrl(req, res, next) {
  try {
    await sauvegarderPrestation({ ...req.body, id_prestation: req.params.id || null });
    res.json({ message: 'Prestation enregistrée.' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Cette référence est déjà utilisée par une autre prestation.' });
    }
    next(err);
  }
}

// DELETE /api/config/prestations/:id
export async function supprimerPrestationCtrl(req, res, next) {
  try {
    await supprimerPrestation(req.params.id);
    res.json({ message: 'Prestation supprimée.' });
  } catch (err) {
    next(err);
  }
}

// GET /api/config/modes-paiement?archives=1
export async function getModesPaiement(req, res, next) {
  try {
    res.json(await listerModesPaiement(req.query.archives === '1'));
  } catch (err) { next(err); }
}

// POST /api/config/modes-paiement  +  PUT /api/config/modes-paiement/:id
export async function sauvegarderModePaiementCtrl(req, res, next) {
  try {
    if (!req.body.nom_mode_paiement?.trim() || !req.body.abrege_mode_paiement?.trim()) {
      return res.status(400).json({ message: 'Le nom et l\'abrégé sont requis.' });
    }
    await sauvegarderModePaiement({ ...req.body, id_mode_paiement: req.params.id || null });
    res.json({ message: 'Mode de paiement enregistré.' });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/config/modes-paiement/:id
export async function supprimerModePaiementCtrl(req, res, next) {
  try {
    await supprimerModePaiement(req.params.id);
    res.json({ message: 'Mode de paiement supprimé.' });
  } catch (err) {
    if (err.code === 'ER_ROW_IS_REFERENCED_2') {
      return res.status(400).json({ message: 'Impossible de supprimer : ce mode est utilisé dans des paiements.' });
    }
    next(err);
  }
}

// POST /api/config/importer-villes  (body: { csv: "contenu brut du fichier" })
export async function importerVillesCtrl(req, res, next) {
  const { csv } = req.body;
  if (!csv) return res.status(400).json({ message: 'Fichier CSV manquant.' });
  try {
    // On essaie d'abord le séparateur point-virgule (format français),
    // puis la virgule si rien n'est trouvé.
    let lignes = parseCsv(csv, { delimiter: ';', skip_empty_lines: true, from_line: 1 });
    if (lignes[0]?.length < 2) {
      lignes = parseCsv(csv, { delimiter: ',', skip_empty_lines: true, from_line: 1 });
    }
    // On attend deux colonnes : code_postal, nom_ville (dans cet ordre).
    const villes = lignes
      .map(l => ({ code_postal: String(l[0] ?? '').trim(), nom_ville: String(l[1] ?? '').trim() }))
      .filter(v => v.code_postal && v.nom_ville);
    await importerVilles(villes);
    res.json({ message: `${villes.length} villes importées.` });
  } catch (err) {
    res.status(400).json({ message: 'Erreur lors du parsing CSV : ' + err.message });
  }
}
