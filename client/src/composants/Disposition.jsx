// =====================================================================
//  Disposition générale de l'application : barre latérale de navigation
//  + zone de contenu. Les liens s'affichent selon les droits.
// =====================================================================
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contextes/ContexteAuth.jsx';

export default function Disposition({ children }) {
  const { utilisateur, seDeconnecter } = useAuth();
  const navigate = useNavigate();

  function deconnexion() {
    seDeconnecter();
    navigate('/connexion');
  }

  const estAdmin = utilisateur?.droit_admin;

  // Liste des liens de navigation, avec leur condition d'affichage.
  const liens = [
    { vers: '/', libelle: 'Accueil', icone: '🏠', visible: true },
    { vers: '/factures', libelle: 'Factures', icone: '🧾', visible: estAdmin || utilisateur?.droit_consult_fac },
    { vers: '/paiements', libelle: 'Paiements', icone: '💳', visible: estAdmin || utilisateur?.droit_consult_paiem },
    { vers: '/clients', libelle: 'Clients', icone: '👥', visible: estAdmin || utilisateur?.droit_consult_clients },
    { vers: '/envoi', libelle: 'Envoi', icone: '✉️', visible: estAdmin || utilisateur?.droit_consult_fac },
  ];

  // Style commun appliqué aux liens (avec mise en valeur du lien actif).
  const styleLien = ({ isActive }) =>
    `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
      isActive ? 'bg-primaire-clair text-primaire-fonce' : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <div className="flex min-h-screen">
      {/* ---------- Barre latérale ---------- */}
      <aside className="w-56 bg-white border-r border-slate-200 flex flex-col">
        <div className="p-5 text-2xl font-bold text-primaire">Facturasso</div>

        <nav className="flex-1 px-2 space-y-1">
          {liens
            .filter((l) => l.visible)
            .map((lien) => (
              <NavLink key={lien.vers} to={lien.vers} end={lien.vers === '/'} className={styleLien}>
                <span>{lien.icone}</span>
                {lien.libelle}
              </NavLink>
            ))}
        </nav>

        {/* Bas de la barre : configuration + utilisateur + déconnexion */}
        <div className="px-2 pb-4 space-y-1">
          {(estAdmin || utilisateur?.droit_config) && (
            <NavLink to="/configuration" className={styleLien}>
              <span>⚙️</span> Configuration
            </NavLink>
          )}
          <div className="px-3 pt-2 text-xs text-slate-400">
            Connecté : {utilisateur?.nom_utilisateur}
          </div>
          <button
            onClick={deconnexion}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50"
          >
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ---------- Contenu de la page ---------- */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
