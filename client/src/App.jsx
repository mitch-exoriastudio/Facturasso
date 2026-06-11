// =====================================================================
//  Composant racine : définit les routes de l'application.
//  - /connexion : accessible sans être connecté
//  - tout le reste : protégé, affiché dans la disposition (barre latérale)
// =====================================================================
import { Routes, Route } from 'react-router-dom';
import Connexion from './pages/Connexion.jsx';
import Accueil from './pages/Accueil.jsx';
import Clients from './pages/Clients.jsx';
import Configuration from './pages/Configuration.jsx';
import Disposition from './composants/Disposition.jsx';
import RouteProtegee from './composants/RouteProtegee.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/connexion" element={<Connexion />} />

      {/* Toutes les autres routes nécessitent une connexion */}
      <Route
        path="/*"
        element={
          <RouteProtegee>
            <Disposition>
              <Routes>
                <Route path="/" element={<Accueil />} />
                <Route path="/clients" element={<Clients />} />
                <Route path="/configuration" element={<Configuration />} />
              </Routes>
            </Disposition>
          </RouteProtegee>
        }
      />
    </Routes>
  );
}
