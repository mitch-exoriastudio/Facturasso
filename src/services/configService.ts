// =====================================================================
//  Service config : appels API pour la page de configuration.
// =====================================================================
import { api } from './api';
import type {
  DonneesParametres,
  DonneesEmailConfig,
  DonneesPrestation,
  DonneesModePaiement,
  DonneesUtilisateur,
} from '@/lib/modeles/configModele';

type Id = number | string;
type Params = Record<string, unknown> | undefined;

export const configService = {
  // Paramètres généraux
  getParametres: () => api.get('/config/parametres').then((r) => r.data),
  putParametres: (d: DonneesParametres) => api.put('/config/parametres', d).then((r) => r.data),
  patchDernierNumero: (n: number) => api.patch('/config/dernier-numero', { numero: n }).then((r) => r.data),

  // Utilisateurs
  getUtilisateurs: (p?: Params) => api.get('/config/utilisateurs', { params: p }).then((r) => r.data),
  postUtilisateur: (d: DonneesUtilisateur) => api.post('/config/utilisateurs', d).then((r) => r.data),
  putUtilisateur: (id: Id, d: DonneesUtilisateur) => api.put(`/config/utilisateurs/${id}`, d).then((r) => r.data),
  supprimerUtilisateur: (id: Id) => api.delete(`/config/utilisateurs/${id}`).then((r) => r.data),

  // E-mail
  getEmail: (id: Id) => api.get(`/config/email/${id}`).then((r) => r.data),
  putEmail: (id: Id, d: DonneesEmailConfig) => api.put(`/config/email/${id}`, d).then((r) => r.data),

  // Prestations
  getPrestations: (p?: Params) => api.get('/config/prestations', { params: p }).then((r) => r.data),
  postPrestation: (d: DonneesPrestation) => api.post('/config/prestations', d).then((r) => r.data),
  putPrestation: (id: Id, d: DonneesPrestation) => api.put(`/config/prestations/${id}`, d).then((r) => r.data),
  deletePrestation: (id: Id) => api.delete(`/config/prestations/${id}`).then((r) => r.data),

  // Modes de paiement
  getModesPaiement: (p?: Params) => api.get('/config/modes-paiement', { params: p }).then((r) => r.data),
  postModePaiement: (d: DonneesModePaiement) => api.post('/config/modes-paiement', d).then((r) => r.data),
  putModePaiement: (id: Id, d: DonneesModePaiement) => api.put(`/config/modes-paiement/${id}`, d).then((r) => r.data),
  deleteModePaiement: (id: Id) => api.delete(`/config/modes-paiement/${id}`).then((r) => r.data),

  // Import CSV villes
  importerVilles: (csv: string) => api.post('/config/importer-villes', { csv }).then((r) => r.data),
};
