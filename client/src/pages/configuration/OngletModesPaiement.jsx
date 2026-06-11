// =====================================================================
//  Onglet 5 — Liste des modes de paiement
// =====================================================================
import { useState, useEffect } from 'react';
import { configService } from '../../services/configService.js';

const CL = 'border border-slate-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primaire';

export default function OngletModesPaiement() {
  const [modes, setModes] = useState([]);
  const [avecArchives, setAvecArchives] = useState(false);
  const [message, setMessage] = useState(null); // { texte, ok }

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

  async function supprimer(id) {
    if (!window.confirm('Supprimer ce mode de paiement ?')) return;
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
        <div className={`text-sm rounded-lg p-3 mb-3 ${message.ok ? 'text-green-700 bg-green-50' : 'text-red-600 bg-red-50'}`}>
          {message.texte}
        </div>
      )}

      <label className="flex items-center gap-2 text-sm text-slate-600 mb-4">
        <input type="checkbox" checked={avecArchives} onChange={e => setAvecArchives(e.target.checked)}
          className="accent-primaire" />
        Afficher les modes archivés
      </label>

      <div className="space-y-2">
        {modes.map((m, i) => (
          <div key={m.id_mode_paiement ?? `new-${i}`}
            className="flex gap-2 items-center bg-white border border-slate-200 rounded-xl px-3 py-2">
            <input value={m.nom_mode_paiement ?? ''}
              onChange={e => { const v = e.target.value; majLigne(m.id_mode_paiement, 'nom_mode_paiement', v ? v.charAt(0).toUpperCase() + v.slice(1) : v); }}
              placeholder="Nom (ex. Virement)" className={CL + ' flex-1 min-w-0'} autoComplete="nope" />
            <input value={m.abrege_mode_paiement ?? ''}
              onChange={e => majLigne(m.id_mode_paiement, 'abrege_mode_paiement', e.target.value.toUpperCase())}
              placeholder="VIR" className={CL + ' w-20'} autoComplete="nope" />
            <label className="flex items-center gap-1 text-xs text-slate-500 whitespace-nowrap">
              <input type="checkbox" checked={!!m.ne_plus_proposer}
                onChange={e => majLigne(m.id_mode_paiement, 'ne_plus_proposer', e.target.checked)}
                className="accent-primaire" />
              Archiver
            </label>
            <button onClick={() => sauvegarder(m)}
              className="text-xs bg-primaire-clair text-primaire-fonce px-2 py-1 rounded-lg hover:bg-primaire hover:text-white transition">
              ✓
            </button>
            {m.id_mode_paiement && (
              <button onClick={() => supprimer(m.id_mode_paiement)}
                className="text-xs text-red-400 hover:text-red-600 px-1">✕</button>
            )}
          </div>
        ))}
      </div>

      <button onClick={ajouterLigne}
        className="mt-4 w-full bg-primaire hover:bg-primaire-fonce text-white font-semibold py-2 rounded-lg transition text-sm">
        + Ajouter un nouveau mode de paiement
      </button>
    </div>
  );
}
