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
import type { ReactNode } from 'react';
import { api } from '@/services/api';
import type { SessionUtilisateur, SessionDossier } from '@/types';

interface IdentifiantsConnexion {
  email: string;
  motDePasse: string;
  dossierId?: string;
}

interface ContexteAuthValeur {
  utilisateur: SessionUtilisateur | null;
  dossier: SessionDossier | null;
  pret: boolean;
  seConnecter: (identifiants: IdentifiantsConnexion) => Promise<unknown>;
  seDeconnecter: () => Promise<void>;
}

const ContexteAuth = createContext<ContexteAuthValeur | null>(null);

export function FournisseurAuth({ children }: { children: ReactNode }) {
  const [utilisateur, setUtilisateur] = useState<SessionUtilisateur | null>(null);
  const [dossier, setDossier]         = useState<SessionDossier | null>(null);
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
  async function seConnecter({ email, motDePasse, dossierId }: IdentifiantsConnexion) {
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

export function useAuth(): ContexteAuthValeur {
  const ctx = useContext(ContexteAuth);
  if (!ctx) throw new Error('useAuth doit être utilisé à l’intérieur de <FournisseurAuth>.');
  return ctx;
}
