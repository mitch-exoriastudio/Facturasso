// =====================================================================
//  Modale fiche client : création et modification.
// =====================================================================
import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import ChampAutoVille from './ChampAutoVille.jsx';

const CIVILITES = ['', 'M.', 'Mme', 'Mlle', 'Dr', 'Me'];

export default function FicheClient({ client, peutModifier, onValider, onFermer }) {
  const [form, setForm] = useState({
    civilite:    client?.civilite    ?? '',
    nom:         client?.nom         ?? '',
    prenom:      client?.prenom      ?? '',
    adresse1:    client?.adresse1    ?? '',
    adresse2:    client?.adresse2    ?? '',
    adresse3:    client?.adresse3    ?? '',
    code_postal: client?.code_postal ?? '',
    ville:       client?.ville       ?? '',
    pays:        client?.pays        ?? '',
    telephone:   client?.telephone   ?? '',
    mobile:      client?.mobile      ?? '',
    email:       client?.email       ?? '',
  });
  const [erreur, setErreur]   = useState('');
  const [enCours, setEnCours] = useState(false);

  const maj = (champ) => (e) => setForm((f) => ({ ...f, [champ]: e.target.value }));

  async function soumettre(e) {
    e.preventDefault();
    if (!form.nom.trim()) { setErreur('Le nom est obligatoire.'); return; }
    setErreur('');
    setEnCours(true);
    try {
      await onValider(form);
      onFermer();
    } catch {
      setErreur('Une erreur est survenue, veuillez réessayer.');
    } finally {
      setEnCours(false);
    }
  }

  const classeInput = `w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm
    bg-white dark:bg-gray-800 dark:text-gray-100
    focus:outline-none focus:ring-2 focus:ring-primaire
    disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-400 dark:disabled:text-gray-600`;

  const classeLabel = 'block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5';

  const titre = client
    ? [client.civilite, client.nom, client.prenom].filter(Boolean).join(' ')
    : 'Nouveau client';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* En-tête */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700/60">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{titre}</h2>
            {!!client?.archive && (
              <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
                Archivé
              </span>
            )}
          </div>
          <button
            onClick={onFermer}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* autoComplete="off" + "nope" sur les champs pour bloquer la saisie auto du navigateur */}
        <form onSubmit={soumettre} autoComplete="off" className="px-6 py-5 space-y-4">

          {erreur && (
            <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3">
              {erreur}
            </div>
          )}

          {/* Civilité + Nom + Prénom */}
          <div className="flex gap-3">
            <div className="w-28">
              <label className={classeLabel}>Civilité</label>
              <select value={form.civilite} onChange={maj('civilite')} disabled={!peutModifier}
                className={classeInput}>
                {CIVILITES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className={classeLabel}>Nom <span className="text-red-500">*</span></label>
              <input value={form.nom} onChange={maj('nom')} disabled={!peutModifier}
                autoComplete="nope" className={classeInput} />
            </div>
            <div className="flex-1">
              <label className={classeLabel}>Prénom</label>
              <input value={form.prenom} onChange={maj('prenom')} disabled={!peutModifier}
                autoComplete="nope" className={classeInput} />
            </div>
          </div>

          {/* Adresses */}
          {[['adresse1', 'Adresse'], ['adresse2', 'Adresse (suite)'], ['adresse3', 'Adresse (suite 2)']].map(([champ, libelle]) => (
            <div key={champ}>
              <label className={classeLabel}>{libelle}</label>
              <input value={form[champ]} onChange={maj(champ)} disabled={!peutModifier}
                autoComplete="nope" className={classeInput} />
            </div>
          ))}

          {/* Code postal + Ville avec auto-complétion */}
          <ChampAutoVille
            codePostal={form.code_postal}
            ville={form.ville}
            disabled={!peutModifier}
            onChange={({ codePostal, ville }) =>
              setForm((f) => ({ ...f, code_postal: codePostal, ville }))
            }
          />

          {/* Pays */}
          <div>
            <label className={classeLabel}>Pays</label>
            <input value={form.pays} onChange={maj('pays')} disabled={!peutModifier}
              className={classeInput} />
          </div>

          {/* Téléphones */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className={classeLabel}>Téléphone</label>
              <input value={form.telephone} onChange={maj('telephone')} disabled={!peutModifier}
                autoComplete="nope" className={classeInput} />
            </div>
            <div className="flex-1">
              <label className={classeLabel}>Autre téléphone</label>
              <input value={form.mobile} onChange={maj('mobile')} disabled={!peutModifier}
                autoComplete="nope" className={classeInput} />
            </div>
          </div>

          {/* E-mail */}
          <div>
            <label className={classeLabel}>E-mail</label>
            <input type="email" value={form.email} onChange={maj('email')} disabled={!peutModifier}
              autoComplete="nope" className={classeInput} />
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-2">
            {peutModifier && (
              <button type="submit" disabled={enCours}
                className="flex-1 flex items-center justify-center gap-2 bg-primaire hover:bg-primaire-fonce text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-60">
                {enCours && <Loader2 size={15} className="animate-spin" />}
                {enCours ? 'Enregistrement…' : 'Valider'}
              </button>
            )}
            <button type="button" onClick={onFermer}
              className="flex-1 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-medium py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              {peutModifier ? 'Annuler' : 'Fermer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
