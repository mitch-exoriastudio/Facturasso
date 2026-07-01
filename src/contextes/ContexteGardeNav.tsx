'use client';
// =====================================================================
//  Contexte de garde de navigation — permet d'intercepter tout clic
//  de navigation (sidebar, onglets) lorsqu'un onglet a des modifications
//  non enregistrées, sans nécessiter un data router.
// =====================================================================
import { createContext, useContext, useRef } from 'react';
import type { ReactNode } from 'react';

// Action de navigation à exécuter si l'utilisateur confirme.
type Action = () => void;
// Garde : reçoit l'action de navigation et décide quand la déclencher.
type Garde = (action: Action) => void;

interface ContexteGardeNavValeur {
  enregistrerGarde: (fn: Garde) => void;
  libererGarde: () => void;
  tenterNavigation: (action: Action) => boolean;
}

const ContexteGardeNav = createContext<ContexteGardeNavValeur | null>(null);

export function FournisseurGardeNav({ children }: { children: ReactNode }) {
  // La garde est une fonction (action: () => void) => void.
  // Elle reçoit l'action de navigation à exécuter si l'utilisateur confirme.
  const gardeRef = useRef<Garde | null>(null);

  function enregistrerGarde(fn: Garde) { gardeRef.current = fn; }
  function libererGarde()              { gardeRef.current = null; }

  // Tente de naviguer : si une garde est active, la déclenche et renvoie false.
  // Sinon, exécute l'action immédiatement et renvoie true.
  function tenterNavigation(action: Action): boolean {
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

export function useGardeNav(): ContexteGardeNavValeur {
  const ctx = useContext(ContexteGardeNav);
  if (!ctx) throw new Error('useGardeNav doit être utilisé à l’intérieur de <FournisseurGardeNav>.');
  return ctx;
}
