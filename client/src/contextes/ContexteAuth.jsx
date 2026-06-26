// =====================================================================
//  Contexte d'authentification — gère utilisateur, dossier et JWT.
// =====================================================================
import { createContext, useContext, useState } from 'react';
import { api } from '../services/api.js';

const ContexteAuth = createContext(null);

export function FournisseurAuth({ children }) {
  const [utilisateur, setUtilisateur] = useState(() => {
    const brut = localStorage.getItem('utilisateur');
    return brut ? JSON.parse(brut) : null;
  });

  const [dossier, setDossier] = useState(() => {
    const brut = localStorage.getItem('dossier');
    return brut ? JSON.parse(brut) : null;
  });

  // Connexion : appelle l'API avec le dossier sélectionné.
  async function seConnecter({ nomUtilisateur, motDePasse, dossierId }) {
    const { data } = await api.post('/auth/connexion', { nomUtilisateur, motDePasse, dossierId });
    localStorage.setItem('jeton',       data.jeton);
    localStorage.setItem('utilisateur', JSON.stringify(data.utilisateur));
    localStorage.setItem('dossier',     JSON.stringify(data.dossier));
    setUtilisateur(data.utilisateur);
    setDossier(data.dossier);
    return data;
  }

  // Déconnexion : libère le seat Exoria puis efface la session locale.
  async function seDeconnecter() {
    try {
      await api.post('/auth/deconnexion');
    } catch { /* ignoré si le jeton est déjà invalide */ }
    localStorage.removeItem('jeton');
    localStorage.removeItem('utilisateur');
    localStorage.removeItem('dossier');
    setUtilisateur(null);
    setDossier(null);
  }

  return (
    <ContexteAuth.Provider value={{ utilisateur, dossier, seConnecter, seDeconnecter }}>
      {children}
    </ContexteAuth.Provider>
  );
}

export function useAuth() {
  return useContext(ContexteAuth);
}
