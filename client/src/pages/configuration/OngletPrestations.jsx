// =====================================================================
//  Onglet 4 — Liste des prestations (catalogue)
// =====================================================================
import { useState, useEffect } from 'react';
import { configService } from '../../services/configService.js';
import ModalConfirmation from '../../composants/ModalConfirmation.jsx';
import ChampNumerique from '../../composants/ChampNumerique.jsx';

const CL = 'border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primaire';

export default function OngletPrestations() {
  const [prestations, setPrestations] = useState([]);
  const [avecArchivees, setAvecArchivees] = useState(false);
  const [recherche, setRecherche] = useState('');
  const [message, setMessage] = useState(null); // { texte, ok }
  const [confirmerSuppression, setConfirmerSuppression] = useState(null); // id à supprimer

  useEffect(() => { charger(); }, [avecArchivees]);

  async function charger() {
    const data = await configService.getPrestations(avecArchivees ? { archivees: '1' } : {});
    setPrestations(data);
  }

  // Mise à jour d'un champ directement dans la ligne.
  function majLigne(id, champ, valeur) {
    setPrestations(ps => ps.map(p => p.id_prestation === id ? { ...p, [champ]: valeur } : p));
  }

  async function sauvegarder(p) {
    try {
      if (p.id_prestation) {
        await configService.putPrestation(p.id_prestation, p);
      } else {
        await configService.postPrestation(p);
      }
      setMessage({ texte: 'Enregistré !', ok: true });
      charger();
      setTimeout(() => setMessage(null), 2000);
    } catch (err) {
      setMessage({ texte: err.response?.data?.message || 'Erreur lors de la sauvegarde.', ok: false });
    }
  }

  async function supprimerConfirme() {
    const id = confirmerSuppression;
    setConfirmerSuppression(null);
    await configService.deletePrestation(id);
    charger();
  }

  function ajouterLigne() {
    // Ligne temporaire sans id (sera créée à la sauvegarde).
    setPrestations(ps => [...ps, { id_prestation: null, reference: '', designation: '', prix_unitaire: 0, ne_plus_proposer_presta: false, _nouveau: true }]);
  }

  const filtrees = prestations.filter(p =>
    !recherche || p.designation?.toLowerCase().includes(recherche.toLowerCase()) || p.reference?.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div className="max-w-3xl">
      {message && (
        <div className={`text-sm rounded-lg p-3 mb-3 ${message.ok ? 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20' : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'}`}>
          {message.texte}
        </div>
      )}

      <div className="flex gap-3 mb-4 items-center">
        <input value={recherche} onChange={e => setRecherche(e.target.value)}
          placeholder="Rechercher référence ou désignation…"
          className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primaire" />
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">
          <input type="checkbox" checked={avecArchivees} onChange={e => setAvecArchivees(e.target.checked)}
            className="accent-primaire" />
          Afficher les archivées
        </label>
      </div>

      <div className="space-y-2">
        {filtrees.map((p, i) => (
          <div key={p.id_prestation ?? `new-${i}`}
            className="flex gap-2 items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
            <input value={p.designation ?? ''}
              onChange={e => { const v = e.target.value; majLigne(p.id_prestation, 'designation', v ? v.charAt(0).toUpperCase() + v.slice(1) : v); }}
              placeholder="Désignation" className={CL + ' flex-1 min-w-0'} autoComplete="nope" />
            <input value={p.reference ?? ''}
              onChange={e => majLigne(p.id_prestation, 'reference', e.target.value.toUpperCase())}
              placeholder="Réf." className={CL + ' w-28'} autoComplete="nope" />
            <ChampNumerique step={0.01} value={p.prix_unitaire ?? 0} min={0}
              onChange={e => majLigne(p.id_prestation, 'prix_unitaire', e.target.value)}
              className={CL + ' w-24 text-right'} />
            <span className="text-sm text-gray-400 dark:text-gray-500">€</span>
            <label className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
              <input type="checkbox" checked={!!p.ne_plus_proposer_presta}
                onChange={e => majLigne(p.id_prestation, 'ne_plus_proposer_presta', e.target.checked)}
                className="accent-primaire" />
              Archiver
            </label>
            <button onClick={() => sauvegarder(p)}
              className="text-xs bg-primaire-clair dark:bg-primaire/20 text-primaire-fonce dark:text-primaire px-2 py-1 rounded-lg hover:bg-primaire dark:hover:bg-primaire hover:text-white dark:hover:text-white transition">
              ✓
            </button>
            {p.id_prestation && (
              <button onClick={() => setConfirmerSuppression(p.id_prestation)}
                className="text-xs text-red-400 hover:text-red-600 px-1">✕</button>
            )}
          </div>
        ))}
      </div>

      <button onClick={ajouterLigne}
        className="mt-4 w-full bg-primaire hover:bg-primaire-fonce dark:bg-primaire-fonce dark:hover:bg-primaire text-white font-semibold py-2 rounded-lg transition text-sm">
        + Ajouter une nouvelle prestation
      </button>

      <ModalConfirmation
        ouvert={confirmerSuppression !== null}
        titre="Supprimer cette prestation ?"
        message="Cette action est irréversible."
        labelConfirmer="Supprimer"
        onConfirmer={supprimerConfirme}
        onAnnuler={() => setConfirmerSuppression(null)}
      />
    </div>
  );
}
