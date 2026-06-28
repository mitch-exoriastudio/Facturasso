'use client';
// =====================================================================
//  Layout des routes protégées : garde d'authentification + disposition
//  (barre latérale). S'applique à toutes les pages du groupe (protege).
// =====================================================================
import RouteProtegee from '@/composants/RouteProtegee.jsx';
import Disposition from '@/composants/Disposition.jsx';

export default function LayoutProtege({ children }) {
  return (
    <RouteProtegee>
      <Disposition>{children}</Disposition>
    </RouteProtegee>
  );
}
