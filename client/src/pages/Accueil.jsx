// =====================================================================
//  Page d'accueil / tableau de bord.
//  Version minimale pour le lot 1 ; sera enrichie au lot 8
//  (factures impayées, brouillons en cours, pense-bête, etc.).
// =====================================================================
import { useAuth } from '../contextes/ContexteAuth.jsx';

export default function Accueil() {
  const { utilisateur } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Tableau de bord</h1>
      <p className="text-slate-600">
        Bienvenue <strong>{utilisateur?.nom_utilisateur}</strong>.
      </p>
      <p className="text-slate-400 mt-4 text-sm">
        Le tableau de bord complet (factures impayées, brouillons, pense-bête) sera ajouté au lot 8.
      </p>
    </div>
  );
}
