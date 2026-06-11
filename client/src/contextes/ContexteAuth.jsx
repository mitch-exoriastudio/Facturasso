// =====================================================================
//  Contexte d'authentification : met à disposition de toute l'appli
//  l'utilisateur connecté et les fonctions de connexion / déconnexion.
// =====================================================================
import { createContext, useContext, useState } from 'react';
import { api } from '../services/api.js';

const ContexteAuth = createContext(null);

export function FournisseurAuth({ children }) {
  // On restaure l'utilisateur depuis le navigateur au démarrage
  // (pour rester connecté après un rafraîchissement de page).
  const [utilisateur, setUtilisateur] = useState(() => {
    const brut = localStorage.getItem('utilisateur');
    return brut ? JSON.parse(brut) : null;
  });

  // Connexion : appelle l'API, mémorise le jeton et l'utilisateur.
  async function seConnecter(nomUtilisateur, motDePasse) {
    const { data } = await api.post('/auth/connexion', { nomUtilisateur, motDePasse });
    localStorage.setItem('jeton', data.jeton);
    localStorage.setItem('utilisateur', JSON.stringify(data.utilisateur));
    setUtilisateur(data.utilisateur);
    return data.utilisateur;
  }

  // Déconnexion : oublie le jeton et l'utilisateur.
  function seDeconnecter() {
    localStorage.removeItem('jeton');
    localStorage.removeItem('utilisateur');
    setUtilisateur(null);
  }

  return (
    <ContexteAuth.Provider value={{ utilisateur, seConnecter, seDeconnecter }}>
      {children}
    </ContexteAuth.Provider>
  );
}

// Hook pratique : const { utilisateur, seConnecter } = useAuth();
export function useAuth() {
  return useContext(ContexteAuth);
}
