'use client';
// =====================================================================
//  Contexte de garde de navigation — permet d'intercepter tout clic
//  de navigation (sidebar, onglets) lorsqu'un onglet a des modifications
//  non enregistrées, sans nécessiter un data router.
// =====================================================================
import { createContext, useContext, useRef } from 'react';

const ContexteGardeNav = createContext(null);

export function FournisseurGardeNav({ children }) {
  // La garde est une fonction (action: () => void) => void.
  // Elle reçoit l'action de navigation à exécuter si l'utilisateur confirme.
  const gardeRef = useRef(null);

  function enregistrerGarde(fn) { gardeRef.current = fn; }
  function libererGarde()       { gardeRef.current = null; }

  // Tente de naviguer : si une garde est active, la déclenche et renvoie false.
  // Sinon, exécute l'action immédiatement et renvoie true.
  function tenterNavigation(action) {
    if (gardeRef.current) {
      gardeRef.current(action);
      return false;
    }
    action();
    return true;
  }

  return (
    <ContexteGardeNav.Provider value={{ enregistrerGarde, libererGarde, tenterNavigation }}>
      {children}
    </ContexteGardeNav.Provider>
  );
}

export function useGardeNav() {
  return useContext(ContexteGardeNav);
}
