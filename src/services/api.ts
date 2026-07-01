// =====================================================================
//  Client HTTP centralisé (axios) pour tous les appels à l'API.
// =====================================================================
import axios from 'axios';
import type { InternalAxiosRequestConfig, AxiosError } from 'axios';

export const api = axios.create({
  baseURL: '/api', // même origine : Next sert le front et l'API
});

// Avant chaque requête : ajoute le jeton de connexion s'il existe.
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const jeton = localStorage.getItem('jeton');
  if (jeton) {
    config.headers.Authorization = `Bearer ${jeton}`;
  }
  return config;
});

// Si le serveur répond 401 (session expirée) : on nettoie et on renvoie
// vers la page de connexion.
api.interceptors.response.use(
  (reponse) => reponse,
  (erreur: AxiosError) => {
    if (erreur.response?.status === 401) {
      localStorage.removeItem('jeton');
      localStorage.removeItem('utilisateur');
      if (window.location.pathname !== '/connexion') {
        window.location.href = '/connexion';
      }
    }
    return Promise.reject(erreur);
  },
);
