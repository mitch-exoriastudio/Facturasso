// =====================================================================
//  Client HTTP centralisé (axios) pour tous les appels à l'API.
// =====================================================================
import axios from 'axios';

export const api = axios.create({
  baseURL: '/api', // en dev, Vite redirige /api vers http://localhost:4000
});

// Avant chaque requête : ajoute le jeton de connexion s'il existe.
api.interceptors.request.use((config) => {
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
  (erreur) => {
    if (erreur.response?.status === 401) {
      localStorage.removeItem('jeton');
      localStorage.removeItem('utilisateur');
      if (window.location.pathname !== '/connexion') {
        window.location.href = '/connexion';
      }
    }
    return Promise.reject(erreur);
  }
);
