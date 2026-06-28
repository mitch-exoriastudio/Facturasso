'use client';
// =====================================================================
//  Fournisseurs de contexte globaux (équivalent de l'ancien main.jsx).
//  En App Router, BrowserRouter disparaît : Next gère le routage.
// =====================================================================
import { FournisseurGardeNav } from '@/contextes/ContexteGardeNav.jsx';
import { FournisseurAuth } from '@/contextes/ContexteAuth.jsx';

export function Providers({ children }) {
  return (
    <FournisseurGardeNav>
      <FournisseurAuth>
        {children}
      </FournisseurAuth>
    </FournisseurGardeNav>
  );
}
