// =====================================================================
//  Page d'accueil — tableau de bord (sera enrichi au lot 8).
// =====================================================================
import { LayoutDashboard, FileText, CreditCard, Users, Clock } from 'lucide-react';
import { useAuth } from '../contextes/ContexteAuth.jsx';

function CarteStatut({ Icone, libelle, valeur, couleur }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700/50 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${couleur}`}>
        <Icone size={20} className="text-white" />
      </div>
      <div>
        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">{libelle}</p>
        <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">{valeur}</p>
      </div>
    </div>
  );
}

export default function Accueil() {
  const { utilisateur, dossier } = useAuth();

  return (
    <div className="space-y-6 max-w-5xl">
      {/* En-tête */}
      <div className="flex items-center gap-3">
        <LayoutDashboard size={24} className="text-primaire" />
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Tableau de bord</h1>
          {dossier && (
            <p className="text-sm text-gray-400 dark:text-gray-500">{dossier.nom}</p>
          )}
        </div>
      </div>

      <p className="text-gray-600 dark:text-gray-400">
        Bienvenue, <span className="font-semibold text-gray-800 dark:text-gray-200">{utilisateur?.nom_utilisateur}</span>.
      </p>

      {/* Cartes placeholder */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <CarteStatut Icone={FileText}   libelle="Factures impayées" valeur="—" couleur="bg-primaire" />
        <CarteStatut Icone={Clock}      libelle="Brouillons"         valeur="—" couleur="bg-amber-400" />
        <CarteStatut Icone={CreditCard} libelle="Paiements du mois"  valeur="—" couleur="bg-emerald-500" />
        <CarteStatut Icone={Users}      libelle="Clients actifs"     valeur="—" couleur="bg-violet-500" />
      </div>

      <p className="text-sm text-gray-400 dark:text-gray-600 italic">
        Les statistiques seront disponibles au lot 8.
      </p>
    </div>
  );
}
