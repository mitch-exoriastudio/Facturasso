// =====================================================================
//  Contrôleur « client » : logique métier entre les routes et le modèle.
// =====================================================================
import {
  listerClients,
  trouverClientParId,
  creerClient,
  modifierClient,
  archiverClient,
  rechercherVilles,
  rechercherVillesParNom,
} from '../modeles/clientModele.js';

// GET /api/clients?recherche=…&archives=1
export async function liste(req, res, next) {
  try {
    const clients = await listerClients({
      rechercheTexte: req.query.recherche || '',
      avecArchives: req.query.archives === '1',
    });
    res.json(clients);
  } catch (err) { next(err); }
}

// GET /api/clients/:id
export async function detail(req, res, next) {
  try {
    const client = await trouverClientParId(parseInt(req.params.id, 10));
    if (!client) return res.status(404).json({ message: 'Client introuvable.' });
    res.json(client);
  } catch (err) { next(err); }
}

// POST /api/clients
export async function creer(req, res, next) {
  try {
    const id = await creerClient(req.body, req.utilisateur.nom_utilisateur);
    const client = await trouverClientParId(id);
    res.status(201).json(client);
  } catch (err) { next(err); }
}

// PUT /api/clients/:id
export async function modifier(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const client = await trouverClientParId(id);
    if (!client) return res.status(404).json({ message: 'Client introuvable.' });
    await modifierClient(id, req.body, req.utilisateur.nom_utilisateur);
    res.json(await trouverClientParId(id));
  } catch (err) { next(err); }
}

// PATCH /api/clients/:id/archiver
export async function archiver(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const client = await trouverClientParId(id);
    if (!client) return res.status(404).json({ message: 'Client introuvable.' });
    await archiverClient(id, req.body.archiver, req.utilisateur.nom_utilisateur);
    res.json({ message: req.body.archiver ? 'Client archivé.' : 'Client désarchivé.' });
  } catch (err) { next(err); }
}

// GET /api/clients/villes?cp=66&nom=perp
export async function villes(req, res, next) {
  try {
    if (req.query.cp) {
      return res.json(await rechercherVilles(req.query.cp));
    }
    if (req.query.nom) {
      return res.json(await rechercherVillesParNom(req.query.nom));
    }
    res.json([]);
  } catch (err) { next(err); }
}
