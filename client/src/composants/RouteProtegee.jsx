// =====================================================================
//  Garde de route : empêche l'accès aux pages si non connecté.
// =====================================================================
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contextes/ContexteAuth.jsx';

export default function RouteProtegee({ children }) {
  const { utilisateur } = useAuth();
  if (!utilisateur) {
    // Pas connecté -> redirection vers la page de connexion.
    return <Navigate to="/connexion" replace />;
  }
  return children;
}
