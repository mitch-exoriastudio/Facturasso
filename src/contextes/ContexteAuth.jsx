'use client';
// =====================================================================
//  Contexte d'authentification — gère utilisateur, dossier et JWT.
//
//  La session (jeton + utilisateur + dossier) reste stockée en localStorage.
//  Elle est lue côté navigateur seulement (dans un effet) : `pret` passe
//  à true une fois la lecture faite, ce qui évite toute incohérence
//  d'hydratation entre le rendu serveur et le rendu client.
// =====================================================================
import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

const ContexteAuth = createContext(null);

export function FournisseurAuth({ children }) {
  const [utilisateur, setUtilisateur] = useState(null);
  const [dossier, setDossier]         = useState(null);
  const [pret, setPret]               = useState(false);

  // Restaure la session depuis le localStorage au montage (navigateur).
  useEffect(() => {
    try {
      const u = localStorage.getItem('utilisateur');
      const d = localStorage.getItem('dossier');
      if (u) setUtilisateur(JSON.parse(u));
      if (d) setDossier(JSON.parse(d));
    } catch {
      /* localStorage indisponible ou JSON corrompu : session vide */
    }
    setPret(true);
  }, []);

  // Connexion : appelle l'API avec le dossier sélectionné (identifiant = e-mail).
  async function seConnecter({ email, motDePasse, dossierId }) {
    const { data } = await api.post('/auth/connexion', { email, motDePasse, dossierId });
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
    <ContexteAuth.Provider value={{ utilisateur, dossier, pret, seConnecter, seDeconnecter }}>
      {children}
    </ContexteAuth.Provider>
  );
}

export function useAuth() {
  return useContext(ContexteAuth);
}
