'use client';
// =====================================================================
//  Layout des routes protégées : garde d'authentification + disposition
//  (barre latérale). S'applique à toutes les pages du groupe (protege).
// =====================================================================
import type { ReactNode } from 'react';
import RouteProtegee from '@/composants/RouteProtegee';
import Disposition from '@/composants/Disposition';

export default function LayoutProtege({ children }: { children: ReactNode }) {
  return (
    <RouteProtegee>
      <Disposition>{children}</Disposition>
    </RouteProtegee>
  );
}
