'use client';
// =====================================================================
//  Fournisseurs de contexte globaux (équivalent de l'ancien main.jsx).
//  En App Router, BrowserRouter disparaît : Next gère le routage.
// =====================================================================
import type { ReactNode } from 'react';
import { FournisseurGardeNav } from '@/contextes/ContexteGardeNav';
import { FournisseurAuth } from '@/contextes/ContexteAuth';
import { FournisseurToast } from '@/contextes/ContexteToast';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <FournisseurGardeNav>
      <FournisseurAuth>
        <FournisseurToast>
          {children}
        </FournisseurToast>
      </FournisseurAuth>
    </FournisseurGardeNav>
  );
}
