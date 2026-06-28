// =====================================================================
//  Service client : fonctions d'appel à l'API pour les clients.
// =====================================================================
import { api } from './api.js';

export const clientService = {
  lister: (params = {}) => api.get('/clients', { params }).then(r => r.data),
  obtenir: (id) => api.get(`/clients/${id}`).then(r => r.data),
  creer: (donnees) => api.post('/clients', donnees).then(r => r.data),
  modifier: (id, donnees) => api.put(`/clients/${id}`, donnees).then(r => r.data),
  archiver: (id, archiver) => api.patch(`/clients/${id}/archiver`, { archiver }).then(r => r.data),
  // Auto-complétion : recherche par code postal ou par nom de ville
  villes: (params) => api.get('/clients/villes', { params }).then(r => r.data),
};
