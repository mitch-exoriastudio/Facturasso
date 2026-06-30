// =====================================================================
//  Onglet 4 — Liste des prestations (catalogue)
// =====================================================================
import { useState, useEffect, useRef } from 'react';
import { Plus, Check, Trash2, Package } from 'lucide-react';
import { configService } from '../../services/configService.js';
import ModalConfirmation from '../../composants/ModalConfirmation.jsx';
import ChampNumerique from '../../composants/ChampNumerique.jsx';
import { SquelettePrestations } from '../../composants/Squelette.jsx';
import { useToast } from '../../contextes/ContexteToast.jsx';

const CL = 'border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primaire';

export default function OngletPrestations() {
  const toast = useToast();
  const [prestations, setPrestations] = useState([]);
  const [avecArchivees, setAvecArchivees] = useState(false);
  const [recherche, setRecherche] = useState('');
  const [chargement, setChargement] = useState(true);
  const [confirmerSuppression, setConfirmerSuppression] = useState(null);
  const cleCompteur = useRef(0);

  useEffect(() => { charger(); }, [avecArchivees]);

  async function charger() {
    setChargement(true);
    const data = await configService.getPrestations(avecArchivees ? { archivees: '1' } : {});
    setPrestations(data);
    setChargement(false);
  }

  // Identifie une ligne par son id (existant) ou sa clé temporaire (nouvelle).
  function majLigne(p, champ, valeur) {
    setPrestations(ps => ps.map(x => {
      const meme = p.id_prestation !== null
        ? x.id_prestation === p.id_prestation
        : x._cle === p._cle;
      return meme ? { ...x, [champ]: valeur, _modifie: true } : x;
    }));
  }

  async function sauvegarder(p) {
    try {
      if (p.id_prestation) {
        await configService.putPrestation(p.id_prestation, p);
      } else {
        await configService.postPrestation(p);
      }
      toast.succes('Prestation enregistrée.');
      charger();
    } catch (err) {
      toast.erreur(err.response?.data?.message || 'Erreur lors de la sauvegarde.');
    }
  }

  async function supprimerConfirme() {
    const id = confirmerSuppression;
    setConfirmerSuppression(null);
    try {
      await configService.deletePrestation(id);
      toast.succes('Prestation supprimée.');
      charger();
    } catch (err) {
      toast.erreur(err.response?.data?.message || 'Impossible de supprimer cette prestation.');
    }
  }

  // Les nouvelles lignes sont insérées en tête de liste pour rester visibles.
  function ajouterLigne() {
    cleCompteur.current += 1;
    setPrestations(ps => [
      { id_prestation: null, _cle: cleCompteur.current, reference: '', designation: '', prix_unitaire: 0, ne_plus_proposer_presta: false, _nouveau: true },
      ...ps,
    ]);
  }

  const filtrees = prestations.filter(p =>
    !recherche || p.designation?.toLowerCase().includes(recherche.toLowerCase()) || p.reference?.toLowerCase().includes(recherche.toLowerCase())
  );

  return (
    <div className="max-w-3xl">

      {/* ── Barre d'outils ─────────────────────────────────────────── */}
      <div className="flex gap-2 mb-3">
        <input value={recherche} onChange={e => setRecherche(e.target.value)}
          placeholder="Rechercher référence ou désignation…"
          className="flex-1 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primaire" />
        <button onClick={ajouterLigne}
          className="flex items-center gap-1.5 bg-primaire hover:bg-primaire-fonce dark:bg-primaire-fonce dark:hover:bg-primaire text-white text-sm font-medium px-3 py-2 rounded-lg transition whitespace-nowrap">
          <Plus className="w-4 h-4" /> Nouvelle prestation
        </button>
      </div>

      <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-4 px-1">
        <input type="checkbox" checked={avecArchivees} onChange={e => setAvecArchivees(e.target.checked)}
          className="accent-primaire" />
        Afficher les prestations archivées
      </label>

      {chargement && <SquelettePrestations />}

      {/* ── En-têtes de colonnes (masqués sur mobile) ──────────────── */}
      {!chargement && filtrees.length > 0 && (
        <div className="hidden sm:flex gap-2 px-3 mb-1 text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide select-none">
          <span className="flex-1">Désignation</span>
          <span className="w-28">Référence</span>
          <span className="w-28 text-right pr-5">Prix HT</span>
          <span className="w-20 text-center">Archiver</span>
          <span className="w-16" />
        </div>
      )}

      {/* ── Liste ──────────────────────────────────────────────────── */}
      <div className="space-y-2">

        {!chargement && filtrees.length === 0 && !recherche && (
          <div className="flex flex-col items-center justify-center text-center border border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-gray-400 dark:text-gray-500">
            <Package className="w-8 h-8 mb-2 opacity-60" />
            <p className="text-sm">
              Aucune prestation.{' '}
              <button onClick={ajouterLigne} className="text-primaire hover:underline">
                Créer la première
              </button>
            </p>
          </div>
        )}

        {!chargement && filtrees.length === 0 && recherche && (
          <p className="text-sm text-gray-400 dark:text-gray-500 px-3 py-4">
            Aucun résultat pour « {recherche} ».
          </p>
        )}

        {!chargement && filtrees.map((p, i) => {
          const dirty = p._modifie || p._nouveau;
          return (
            <div key={p.id_prestation ?? `new-${p._cle ?? i}`}
              className={`rounded-xl border px-3 py-2 transition-colors
                ${dirty
                  ? 'border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-amber-900/10'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>

              {/* Désignation seule sur sa propre ligne sur mobile */}
              <input value={p.designation ?? ''}
                onChange={e => { const v = e.target.value; majLigne(p, 'designation', v ? v.charAt(0).toUpperCase() + v.slice(1) : v); }}
                placeholder="Désignation"
                className={CL + ' w-full mb-1.5 sm:hidden'} autoComplete="nope" />

              {/* Ligne horizontale (desktop : tout inline, mobile : contrôles complémentaires) */}
              <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                <input value={p.designation ?? ''}
                  onChange={e => { const v = e.target.value; majLigne(p, 'designation', v ? v.charAt(0).toUpperCase() + v.slice(1) : v); }}
                  placeholder="Désignation"
                  className={CL + ' flex-1 min-w-0 hidden sm:block'} autoComplete="nope" />
                <input value={p.reference ?? ''}
                  onChange={e => majLigne(p, 'reference', e.target.value.replace(/[^A-Za-z0-9-]/g, '').toUpperCase())}
                  placeholder="Réf."
                  title="Lettres, chiffres et tirets uniquement"
                  className={CL + ' w-28'} autoComplete="nope" />
                <div className="flex items-center gap-0.5">
                  <ChampNumerique step={0.01} value={p.prix_unitaire ?? 0} min={0}
                    onChange={e => majLigne(p, 'prix_unitaire', e.target.value)}
                    className={CL + ' w-24 text-right'} />
                  <span className="text-xs text-gray-400 dark:text-gray-500 px-0.5">€</span>
                </div>
                <label className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap w-20 justify-center"
                  title="Archiver cette prestation (ne plus la proposer à la saisie)">
                  <input type="checkbox" checked={!!p.ne_plus_proposer_presta}
                    onChange={e => majLigne(p, 'ne_plus_proposer_presta', e.target.checked)}
                    className="accent-primaire" />
                  <span className="sm:hidden">Archiver</span>
                </label>
                <div className="flex gap-1 ml-auto sm:ml-0">
                  <button onClick={() => sauvegarder(p)} title="Enregistrer cette ligne"
                    className={`p-1.5 rounded-lg transition
                      ${dirty
                        ? 'bg-primaire text-white hover:bg-primaire-fonce dark:hover:bg-primaire'
                        : 'bg-primaire-clair dark:bg-primaire/20 text-primaire-fonce dark:text-primaire hover:bg-primaire hover:text-white'}`}>
                    <Check className="w-4 h-4" />
                  </button>
                  {p.id_prestation && (
                    <button onClick={() => setConfirmerSuppression(p.id_prestation)} title="Supprimer cette prestation"
                      className="p-1.5 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

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
