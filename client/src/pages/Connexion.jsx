// =====================================================================
//  Page de connexion — sélection du dossier + saisie des identifiants.
// =====================================================================
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, User, Lock, ChevronDown, Loader2 } from 'lucide-react';
import { useAuth } from '../contextes/ContexteAuth.jsx';
import { api } from '../services/api.js';

export default function Connexion() {
  const { seConnecter } = useAuth();
  const navigate = useNavigate();

  const [dossiers, setDossiers]               = useState([]);
  const [dossierId, setDossierId]             = useState('');
  const [chargementDossiers, setChargementDossiers] = useState(true);

  const [nomUtilisateur, setNomUtilisateur]   = useState('');
  const [motDePasse, setMotDePasse]           = useState('');
  const [erreur, setErreur]                   = useState('');
  const [enCours, setEnCours]                 = useState(false);

  // Récupère la liste des dossiers disponibles.
  useEffect(() => {
    api.get('/public/dossiers')
      .then(({ data }) => {
        setDossiers(data);
        if (data.length === 1) setDossierId(data[0].id);
      })
      .catch(() => setErreur('Impossible de contacter le serveur.'))
      .finally(() => setChargementDossiers(false));
  }, []);

  async function soumettre(e) {
    e.preventDefault();
    if (!dossierId) { setErreur('Veuillez sélectionner un dossier.'); return; }
    setErreur('');
    setEnCours(true);
    try {
      await seConnecter({ nomUtilisateur, motDePasse, dossierId });
      navigate('/');
    } catch (err) {
      setErreur(err.response?.data?.message || 'Connexion impossible.');
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primaire via-primaire-fonce to-teal-900 px-4">

      <div className="w-full max-w-sm">
        {/* Logo / Titre */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center mb-3 shadow-lg">
            <Building2 size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Facturasso</h1>
          <p className="text-white/60 text-sm mt-1">Gestion de la facturation</p>
        </div>

        {/* Carte */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-7 space-y-5">

          {erreur && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3">
              {erreur}
            </div>
          )}

          <form onSubmit={soumettre} className="space-y-4">

            {/* Sélection du dossier (masqué si un seul dossier) */}
            {!chargementDossiers && dossiers.length > 1 && (
              <div>
                <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                  Dossier
                </label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <select
                    value={dossierId}
                    onChange={(e) => setDossierId(e.target.value)}
                    className="w-full appearance-none border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-9 py-2.5 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primaire dark:text-gray-100"
                  >
                    <option value="">— Choisir un dossier —</option>
                    {dossiers.map(d => (
                      <option key={d.id} value={d.id}>{d.nom}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Utilisateur */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                Utilisateur
              </label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={nomUtilisateur}
                  onChange={(e) => setNomUtilisateur(e.target.value.toUpperCase())}
                  autoFocus={dossiers.length <= 1}
                  autoComplete="username"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-9 py-2.5 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primaire dark:text-gray-100"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="password"
                  value={motDePasse}
                  onChange={(e) => setMotDePasse(e.target.value)}
                  autoComplete="current-password"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-9 py-2.5 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-primaire dark:text-gray-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={enCours || chargementDossiers}
              className="w-full flex items-center justify-center gap-2 bg-primaire hover:bg-primaire-fonce text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60 mt-2"
            >
              {enCours && <Loader2 size={16} className="animate-spin" />}
              {enCours ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        </div>

        {/* Nom du dossier auto-sélectionné */}
        {dossiers.length === 1 && (
          <p className="text-center text-white/50 text-xs mt-4">{dossiers[0].nom}</p>
        )}
      </div>
    </div>
  );
}
