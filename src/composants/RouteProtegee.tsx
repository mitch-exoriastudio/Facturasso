'use client';
// =====================================================================
//  Garde de route : empêche l'accès aux pages si non connecté.
//  Attend que la session soit chargée (`pret`) avant de décider, pour
//  éviter une redirection prématurée au premier rendu.
// =====================================================================
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contextes/ContexteAuth';

export default function RouteProtegee({ children }: { children: ReactNode }) {
  const { utilisateur, pret } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (pret && !utilisateur) {
      router.replace('/connexion');
    }
  }, [pret, utilisateur, router]);

  // Session non encore lue, ou non connecté (redirection en cours) :
  // on n'affiche rien pour éviter tout clignotement de contenu protégé.
  if (!pret || !utilisateur) return null;

  return <>{children}</>;
}
