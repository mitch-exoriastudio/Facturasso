// =====================================================================
//  Service client : fonctions d'appel à l'API pour les clients.
// =====================================================================
import { api } from './api';
import type { DonneesClient } from '@/lib/modeles/clientModele';

type Id = number | string;

export const clientService = {
  lister: (params: Record<string, unknown> = {}) => api.get('/clients', { params }).then((r) => r.data),
  obtenir: (id: Id) => api.get(`/clients/${id}`).then((r) => r.data),
  creer: (donnees: DonneesClient) => api.post('/clients', donnees).then((r) => r.data),
  modifier: (id: Id, donnees: DonneesClient) => api.put(`/clients/${id}`, donnees).then((r) => r.data),
  archiver: (id: Id, archiver: boolean) => api.patch(`/clients/${id}/archiver`, { archiver }).then((r) => r.data),
  // Auto-complétion : recherche par code postal ou par nom de ville
  villes: (params: Record<string, unknown>) => api.get('/clients/villes', { params }).then((r) => r.data),
};
