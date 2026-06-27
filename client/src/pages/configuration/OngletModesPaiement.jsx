// =====================================================================
//  Onglet 5 — Liste des modes de paiement
// =====================================================================
import { useState, useEffect } from 'react';
import { configService } from '../../services/configService.js';
import ModalConfirmation from '../../composants/ModalConfirmation.jsx';

const CL = 'border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primaire';

export default function OngletModesPaiement() {
  const [modes, setModes] = useState([]);
  const [avecArchives, setAvecArchives] = useState(false);
  const [message, setMessage] = useState(null); // { texte, ok }
  const [confirmerSuppression, setConfirmerSuppression] = useState(null); // id à supprimer

  useEffect(() => { charger(); }, [avecArchives]);

  async function charger() {
    const data = await configService.getModesPaiement(avecArchives ? { archives: '1' } : {});
    setModes(data);
  }

  function majLigne(id, champ, valeur) {
    setModes(ms => ms.map(m => m.id_mode_paiement === id ? { ...m, [champ]: valeur } : m));
  }

  async function sauvegarder(m) {
    try {
      if (m.id_mode_paiement) {
        await configService.putModePaiement(m.id_mode_paiement, m);
      } else {
        await configService.postModePaiement(m);
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
    try {
      await configService.deleteModePaiement(id);
      charger();
    } catch (err) {
      setMessage({ texte: err.response?.data?.message || 'Impossible de supprimer ce mode.', ok: false });
      setTimeout(() => setMessage(null), 4000);
    }
  }

  function ajouterLigne() {
    setModes(ms => [...ms, { id_mode_paiement: null, nom_mode_paiement: '', abrege_mode_paiement: '', ne_plus_proposer: false }]);
  }

  return (
    <div className="max-w-xl">
      {message && (
        <div className={`text-sm rounded-lg p-3 mb-3 ${message.ok ? 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20' : 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20'}`}>
          {message.texte}
        </div>
      )}

      <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 mb-4">
        <input type="checkbox" checked={avecArchives} onChange={e => setAvecArchives(e.target.checked)}
          className="accent-primaire" />
        Afficher les modes archivés
      </label>

      <div className="space-y-2">
        {modes.map((m, i) => (
          <div key={m.id_mode_paiement ?? `new-${i}`}
            className="flex gap-2 items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2">
            <input value={m.nom_mode_paiement ?? ''}
              onChange={e => { const v = e.target.value; majLigne(m.id_mode_paiement, 'nom_mode_paiement', v ? v.charAt(0).toUpperCase() + v.slice(1) : v); }}
              placeholder="Nom (ex. Virement)" className={CL + ' flex-1 min-w-0'} autoComplete="nope" />
            <input value={m.abrege_mode_paiement ?? ''}
              onChange={e => majLigne(m.id_mode_paiement, 'abrege_mode_paiement', e.target.value.toUpperCase())}
              placeholder="VIR" className={CL + ' w-20'} autoComplete="nope" />
            <label className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
              <input type="checkbox" checked={!!m.ne_plus_proposer}
                onChange={e => majLigne(m.id_mode_paiement, 'ne_plus_proposer', e.target.checked)}
                className="accent-primaire" />
              Archiver
            </label>
            <button onClick={() => sauvegarder(m)}
              className="text-xs bg-primaire-clair dark:bg-primaire/20 text-primaire-fonce dark:text-primaire px-2 py-1 rounded-lg hover:bg-primaire dark:hover:bg-primaire hover:text-white dark:hover:text-white transition">
              ✓
            </button>
            {m.id_mode_paiement && (
              <button onClick={() => setConfirmerSuppression(m.id_mode_paiement)}
                className="text-xs text-red-400 hover:text-red-600 px-1">✕</button>
            )}
          </div>
        ))}
      </div>

      <button onClick={ajouterLigne}
        className="mt-4 w-full bg-primaire hover:bg-primaire-fonce dark:bg-primaire-fonce dark:hover:bg-primaire text-white font-semibold py-2 rounded-lg transition text-sm">
        + Ajouter un nouveau mode de paiement
      </button>

      <ModalConfirmation
        ouvert={confirmerSuppression !== null}
        titre="Supprimer ce mode de paiement ?"
        message="Cette action est irréversible."
        labelConfirmer="Supprimer"
        onConfirmer={supprimerConfirme}
        onAnnuler={() => setConfirmerSuppression(null)}
      />
    </div>
  );
}
