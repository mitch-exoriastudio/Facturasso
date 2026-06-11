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
export async function liste(req, res) {
  const clients = await listerClients({
    rechercheTexte: req.query.recherche || '',
    avecArchives: req.query.archives === '1',
  });
  res.json(clients);
}

// GET /api/clients/:id
export async function detail(req, res) {
  const client = await trouverClientParId(req.params.id);
  if (!client) return res.status(404).json({ message: 'Client introuvable.' });
  res.json(client);
}

// POST /api/clients
export async function creer(req, res) {
  const id = await creerClient(req.body, req.utilisateur.nom_utilisateur);
  const client = await trouverClientParId(id);
  res.status(201).json(client);
}

// PUT /api/clients/:id
export async function modifier(req, res) {
  const client = await trouverClientParId(req.params.id);
  if (!client) return res.status(404).json({ message: 'Client introuvable.' });
  await modifierClient(req.params.id, req.body, req.utilisateur.nom_utilisateur);
  res.json(await trouverClientParId(req.params.id));
}

// PATCH /api/clients/:id/archiver
export async function archiver(req, res) {
  const client = await trouverClientParId(req.params.id);
  if (!client) return res.status(404).json({ message: 'Client introuvable.' });
  await archiverClient(req.params.id, req.body.archiver, req.utilisateur.nom_utilisateur);
  res.json({ message: req.body.archiver ? 'Client archivé.' : 'Client désarchivé.' });
}

// GET /api/clients/villes?cp=66&nom=perp
export async function villes(req, res) {
  if (req.query.cp) {
    return res.json(await rechercherVilles(req.query.cp));
  }
  if (req.query.nom) {
    return res.json(await rechercherVillesParNom(req.query.nom));
  }
  res.json([]);
}
