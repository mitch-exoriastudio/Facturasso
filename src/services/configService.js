// =====================================================================
//  Service config : appels API pour la page de configuration.
// =====================================================================
import { api } from './api.js';

export const configService = {
  // Paramètres généraux
  getParametres: () => api.get('/config/parametres').then(r => r.data),
  putParametres: (d) => api.put('/config/parametres', d).then(r => r.data),
  patchDernierNumero: (n) => api.patch('/config/dernier-numero', { numero: n }).then(r => r.data),

  // Utilisateurs
  getUtilisateurs: (p) => api.get('/config/utilisateurs', { params: p }).then(r => r.data),
  postUtilisateur: (d) => api.post('/config/utilisateurs', d).then(r => r.data),
  putUtilisateur: (id, d) => api.put(`/config/utilisateurs/${id}`, d).then(r => r.data),

  // E-mail
  getEmail: (id) => api.get(`/config/email/${id}`).then(r => r.data),
  putEmail: (id, d) => api.put(`/config/email/${id}`, d).then(r => r.data),

  // Prestations
  getPrestations: (p) => api.get('/config/prestations', { params: p }).then(r => r.data),
  postPrestation: (d) => api.post('/config/prestations', d).then(r => r.data),
  putPrestation: (id, d) => api.put(`/config/prestations/${id}`, d).then(r => r.data),
  deletePrestation: (id) => api.delete(`/config/prestations/${id}`).then(r => r.data),

  // Modes de paiement
  getModesPaiement: (p) => api.get('/config/modes-paiement', { params: p }).then(r => r.data),
  postModePaiement: (d) => api.post('/config/modes-paiement', d).then(r => r.data),
  putModePaiement: (id, d) => api.put(`/config/modes-paiement/${id}`, d).then(r => r.data),
  deleteModePaiement: (id) => api.delete(`/config/modes-paiement/${id}`).then(r => r.data),

  // Import CSV villes
  importerVilles: (csv) => api.post('/config/importer-villes', { csv }).then(r => r.data),
};
