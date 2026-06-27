// =====================================================================
//  Onglet 2 — Gestion des utilisateurs et de leurs droits
// =====================================================================
import { useState, useEffect } from 'react';
import { configService } from '../../services/configService.js';

const DROITS = [
  { cle: 'droit_admin',           label: 'Administrateur (tous les droits)' },
  { cle: 'droit_consult_fac',     label: 'Consulter les factures' },
  { cle: 'droit_ajout_fac',       label: 'Ajouter des factures' },
  { cle: 'droit_consult_paiem',   label: 'Consulter les paiements' },
  { cle: 'droit_ajout_paiem',     label: 'Ajouter / modifier des paiements' },
  { cle: 'droit_consult_clients', label: 'Consulter les clients' },
  { cle: 'droit_ajout_clients',   label: 'Ajouter / modifier des clients' },
  { cle: 'droit_config',          label: 'Configuration de l\'application' },
];

const FORM_VIDE = {
  nom_utilisateur: '', mot_de_passe: '', compte_desactive: false,
  droit_admin: false, droit_consult_fac: false, droit_ajout_fac: false,
  droit_consult_paiem: false, droit_ajout_paiem: false,
  droit_consult_clients: false, droit_ajout_clients: false, droit_config: false,
};

export default function OngletUtilisateurs({ utilisateurConnecte }) {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [avecDesactives, setAvecDesactives] = useState(false);
  const [selectionne, setSelectionne] = useState(null); // utilisateur sélectionné
  const [form, setForm] = useState(FORM_VIDE);
  const [message, setMessage] = useState('');
  const [estNouveau, setEstNouveau] = useState(false);
  const [montrerMdp, setMontrerMdp] = useState(false);

  useEffect(() => { charger(); }, [avecDesactives]);

  async function charger() {
    const data = await configService.getUtilisateurs(avecDesactives ? { desactives: '1' } : {});
    setUtilisateurs(data);
  }

  function selectionner(u) {
    setSelectionne(u);
    setEstNouveau(false);
    setForm({ ...u, mot_de_passe: '' });
    setMessage('');
  }

  function nouveau() {
    setSelectionne(null);
    setEstNouveau(true);
    setForm(FORM_VIDE);
    setMessage('');
  }

  const majDroit = (cle) => (e) => {
    let f = { ...form, [cle]: e.target.checked };
    // L'admin coche automatiquement tous les droits.
    if (cle === 'droit_admin' && e.target.checked) {
      DROITS.forEach(d => { f[d.cle] = true; });
    }
    setForm(f);
  };

  async function sauvegarder() {
    setMessage('');
    try {
      if (estNouveau) {
        await configService.postUtilisateur(form);
      } else {
        await configService.putUtilisateur(selectionne.id_utilisateur, form);
      }
      setMessage('Enregistré !');
      charger();
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur lors de la sauvegarde.');
    }
  }

  return (
    <div className="flex gap-6 max-w-4xl">
      {/* Liste des utilisateurs */}
      <div className="w-64 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Comptes utilisateurs</span>
        </div>
        <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
          <input type="checkbox" checked={avecDesactives} onChange={e => setAvecDesactives(e.target.checked)}
            className="accent-primaire" />
          Afficher les désactivés
        </label>
        <div className="space-y-1 mb-3">
          {utilisateurs.map(u => (
            <button key={u.id_utilisateur} onClick={() => selectionner(u)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition
                ${selectionne?.id_utilisateur === u.id_utilisateur
                  ? 'bg-primaire-clair dark:bg-primaire/20 text-primaire-fonce dark:text-primaire font-semibold'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
              {u.nom_utilisateur}
              {!!u.compte_desactive && <span className="ml-1 text-xs text-gray-400 dark:text-gray-500">(désactivé)</span>}
            </button>
          ))}
        </div>
        <button onClick={nouveau}
          className="w-full bg-primaire hover:bg-primaire-fonce dark:bg-primaire-fonce dark:hover:bg-primaire text-white text-sm font-medium py-2 rounded-lg transition">
          + Nouvel utilisateur
        </button>
      </div>

      {/* Formulaire droits */}
      {(selectionne || estNouveau) && (
        <form autoComplete="off" onSubmit={e => { e.preventDefault(); sauvegarder(); }} className="flex-1 space-y-4">
          <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">
            {estNouveau ? 'Nouvel utilisateur' : `Permissions de ${selectionne.nom_utilisateur}`}
          </h3>
          {message && (
            <div className={`text-sm rounded-lg p-3 ${message === 'Enregistré !' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
              {message}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Nom d'utilisateur</label>
              <input value={form.nom_utilisateur}
                onChange={e => setForm(f => ({ ...f, nom_utilisateur: e.target.value.toUpperCase() }))}
                autoComplete="off"
                className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primaire" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Mot de passe {!estNouveau && <span className="text-gray-400 dark:text-gray-500">(laisser vide = inchangé)</span>}
              </label>
              <div className="relative">
                <input type={montrerMdp ? 'text' : 'password'} value={form.mot_de_passe}
                  onChange={e => setForm(f => ({ ...f, mot_de_passe: e.target.value }))}
                  autoComplete="new-password"
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 pr-9 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primaire" />
                <button type="button" onClick={() => setMontrerMdp(v => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-200"
                  title={montrerMdp ? 'Masquer' : 'Afficher'}>
                  {montrerMdp
                    ? <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                    : <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  }
                </button>
              </div>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <input type="checkbox" checked={!!form.compte_desactive}
              onChange={e => setForm(f => ({ ...f, compte_desactive: e.target.checked }))}
              className="accent-primaire" />
            Compte désactivé
          </label>

          <div className="space-y-2 border border-gray-200 dark:border-gray-700 rounded-xl p-4 bg-gray-50 dark:bg-gray-800/50">
            {DROITS.map(d => (
              <label key={d.cle} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                <input type="checkbox" checked={!!form[d.cle]} onChange={majDroit(d.cle)}
                  // On ne peut pas se retirer ses propres droits admin.
                  disabled={d.cle === 'droit_admin' && selectionne?.id_utilisateur === utilisateurConnecte?.id_utilisateur}
                  className="accent-primaire w-4 h-4" />
                {d.label}
              </label>
            ))}
          </div>

          <button type="submit"
            className="bg-primaire hover:bg-primaire-fonce dark:bg-primaire-fonce dark:hover:bg-primaire text-white font-semibold px-6 py-2 rounded-lg transition">
            Enregistrer
          </button>
        </form>
      )}
    </div>
  );
}
