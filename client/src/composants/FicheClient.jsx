// =====================================================================
//  Modale / panneau de fiche client (création et modification).
//  S'affiche par-dessus la liste, comme dans l'application d'origine.
// =====================================================================
import { useState } from 'react';
import ChampAutoVille from './ChampAutoVille.jsx';

const CIVILITES = ['', 'M.', 'Mme', 'Mlle', 'Dr', 'Me'];

export default function FicheClient({ client, peutModifier, onValider, onFermer }) {
  // Initialise le formulaire avec les données existantes ou des valeurs vides.
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
  const [erreur, setErreur] = useState('');
  const [enCours, setEnCours] = useState(false);

  // Mise à jour générique d'un champ du formulaire.
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

  const classeInput = `w-full border border-slate-300 rounded-lg px-3 py-2 text-sm
    focus:outline-none focus:ring-2 focus:ring-primaire disabled:bg-slate-50 disabled:text-slate-400`;

  const titre = client ? `${client.civilite ?? ''} ${client.nom ?? ''} ${client.prenom ?? ''}`.trim() : 'Nouveau client';

  return (
    // Fond semi-transparent derrière la modale.
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h2 className="text-lg font-semibold">{titre}</h2>
          {/* Affiche le statut archivé si pertinent */}
          {!!client?.archive && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full">Archivé</span>
          )}
        </div>

        {/* autoComplete="off" sur le form + "nope" sur les champs pour bloquer
            la saisie automatique du navigateur (qui confond ce formulaire pro
            avec un formulaire d'inscription grand public). */}
        <form onSubmit={soumettre} autoComplete="off" className="p-5 space-y-4">
          {erreur && <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{erreur}</div>}

          {/* Civilité + Nom + Prénom */}
          <div className="flex gap-3">
            <div className="w-28">
              <label className="block text-xs text-slate-500 mb-1">Civilité</label>
              <select value={form.civilite} onChange={maj('civilite')} disabled={!peutModifier}
                className={classeInput}>
                {CIVILITES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-slate-500 mb-1">Nom <span className="text-red-500">*</span></label>
              <input value={form.nom} onChange={maj('nom')} disabled={!peutModifier} autoComplete="nope" className={classeInput} />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-slate-500 mb-1">Prénom</label>
              <input value={form.prenom} onChange={maj('prenom')} disabled={!peutModifier} autoComplete="nope" className={classeInput} />
            </div>
          </div>

          {/* Adresses */}
          {['adresse1', 'adresse2', 'adresse3'].map((champ, i) => (
            <div key={champ}>
              <label className="block text-xs text-slate-500 mb-1">
                {i === 0 ? 'Adresse' : `Adresse (suite ${i})`}
              </label>
              <input value={form[champ]} onChange={maj(champ)} disabled={!peutModifier} autoComplete="nope" className={classeInput} />
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
            <label className="block text-xs text-slate-500 mb-1">Pays</label>
            <input value={form.pays} onChange={maj('pays')} disabled={!peutModifier} className={classeInput} />
          </div>

          {/* Téléphones */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-xs text-slate-500 mb-1">Téléphone</label>
              <input value={form.telephone} onChange={maj('telephone')} disabled={!peutModifier} autoComplete="nope" className={classeInput} />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-slate-500 mb-1">Autre téléphone</label>
              <input value={form.mobile} onChange={maj('mobile')} disabled={!peutModifier} autoComplete="nope" className={classeInput} />
            </div>
          </div>

          {/* E-mail */}
          <div>
            <label className="block text-xs text-slate-500 mb-1">E-mail</label>
            <input type="email" value={form.email} onChange={maj('email')} disabled={!peutModifier} autoComplete="nope" className={classeInput} />
          </div>

          {/* Boutons */}
          <div className="flex gap-3 pt-2">
            {peutModifier && (
              <button type="submit" disabled={enCours}
                className="flex-1 bg-primaire hover:bg-primaire-fonce text-white font-semibold py-2 rounded-lg transition disabled:opacity-60">
                {enCours ? 'Enregistrement…' : 'Valider'}
              </button>
            )}
            <button type="button" onClick={onFermer}
              className="flex-1 border border-slate-300 text-slate-600 font-medium py-2 rounded-lg hover:bg-slate-50 transition">
              {peutModifier ? 'Annuler et fermer' : 'Fermer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
