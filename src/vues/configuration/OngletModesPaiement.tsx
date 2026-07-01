// =====================================================================
//  Onglet 5 — Liste des modes de paiement
// =====================================================================
import { useState, useEffect, useRef } from 'react';
import { Plus, Check, Trash2, CreditCard } from 'lucide-react';
import type { AxiosError } from 'axios';
import { configService } from '@/services/configService';
import ModalConfirmation from '@/composants/ModalConfirmation';
import { SqueletteModesPaiement } from '@/composants/Squelette';
import { useToast } from '@/contextes/ContexteToast';

const CL = 'border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1.5 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primaire';

// Ligne éditable : données du mode de paiement + champs d'état UI (préfixe _).
interface ModePaiementLigne {
  id_mode_paiement: number | null;
  nom_mode_paiement: string;
  abrege_mode_paiement: string;
  ne_plus_proposer?: boolean;
  _cle?: number;
  _modifie?: boolean;
  _nouveau?: boolean;
}

// Message d'erreur renvoyé par l'API (le cas échéant).
function messageErreur(err: unknown, defaut: string): string {
  return (err as AxiosError<{ message?: string }>).response?.data?.message || defaut;
}

export default function OngletModesPaiement() {
  const toast = useToast();
  const [modes, setModes] = useState<ModePaiementLigne[]>([]);
  const [avecArchives, setAvecArchives] = useState(false);
  const [chargement, setChargement] = useState(true);
  const [confirmerSuppression, setConfirmerSuppression] = useState<number | null>(null);
  const cleCompteur = useRef(0);

  useEffect(() => { charger(); }, [avecArchives]);

  async function charger() {
    setChargement(true);
    const data = await configService.getModesPaiement(avecArchives ? { archives: '1' } : {});
    setModes(data);
    setChargement(false);
  }

  // Identifie une ligne par son id (existant) ou sa clé temporaire (nouvelle).
  function majLigne<K extends keyof ModePaiementLigne>(m: ModePaiementLigne, champ: K, valeur: ModePaiementLigne[K]) {
    setModes((ms) => ms.map((x) => {
      const meme = m.id_mode_paiement !== null
        ? x.id_mode_paiement === m.id_mode_paiement
        : x._cle === m._cle;
      return meme ? { ...x, [champ]: valeur, _modifie: true } : x;
    }));
  }

  async function sauvegarder(m: ModePaiementLigne) {
    try {
      if (m.id_mode_paiement) {
        await configService.putModePaiement(m.id_mode_paiement, m);
      } else {
        await configService.postModePaiement(m);
      }
      toast.succes('Mode de paiement enregistré.');
      charger();
    } catch (err) {
      toast.erreur(messageErreur(err, 'Erreur lors de la sauvegarde.'));
    }
  }

  async function supprimerConfirme() {
    const id = confirmerSuppression;
    setConfirmerSuppression(null);
    if (id == null) return;
    try {
      await configService.deleteModePaiement(id);
      toast.succes('Mode de paiement supprimé.');
      charger();
    } catch (err) {
      toast.erreur(messageErreur(err, 'Impossible de supprimer ce mode.'));
    }
  }

  // Les nouvelles lignes sont insérées en tête de liste pour rester visibles.
  function ajouterLigne() {
    cleCompteur.current += 1;
    setModes((ms) => [
      { id_mode_paiement: null, _cle: cleCompteur.current, nom_mode_paiement: '', abrege_mode_paiement: '', ne_plus_proposer: false, _nouveau: true },
      ...ms,
    ]);
  }

  return (
    <div className="max-w-xl">

      {/* ── Zone d'outils : filtre (à gauche) + action à droite ────── */}
      <div className="flex items-center justify-between gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          <input type="checkbox" checked={avecArchives} onChange={(e) => setAvecArchives(e.target.checked)}
            className="accent-primaire" />
          Afficher les modes archivés
        </label>
        <button onClick={ajouterLigne}
          className="inline-flex items-center justify-center gap-2 bg-primaire hover:bg-primaire-fonce dark:bg-primaire-fonce dark:hover:bg-primaire text-white text-sm font-medium px-3 py-2 rounded-lg transition whitespace-nowrap">
          <Plus className="w-4 h-4" /> Nouveau mode
        </button>
      </div>

      {chargement && <SqueletteModesPaiement />}

      {/* ── En-têtes de colonnes (masqués sur mobile) ──────────────── */}
      {!chargement && modes.length > 0 && (
        <div className="hidden sm:flex gap-2 px-3 mb-1 text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wide select-none">
          <span className="flex-1">Nom</span>
          <span className="w-24">Abrégé</span>
          <span className="w-20 text-center">Archiver</span>
          <span className="w-16" />
        </div>
      )}

      {/* ── Liste ──────────────────────────────────────────────────── */}
      <div className="space-y-2">

        {!chargement && modes.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center border border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-gray-400 dark:text-gray-500">
            <CreditCard className="w-8 h-8 mb-2 opacity-60" />
            <p className="text-sm">
              Aucun mode de paiement.{' '}
              <button onClick={ajouterLigne} className="text-primaire hover:underline">
                Créer le premier
              </button>
            </p>
          </div>
        )}

        {!chargement && modes.map((m, i) => {
          const dirty = m._modifie || m._nouveau;
          return (
            <div key={m.id_mode_paiement ?? `new-${m._cle ?? i}`}
              className={`rounded-xl border px-3 py-2 transition-colors
                ${dirty
                  ? 'border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-amber-900/10'
                  : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>

              <div className="flex items-center gap-1.5 flex-wrap sm:flex-nowrap">
                <input value={m.nom_mode_paiement ?? ''}
                  onChange={(e) => { const v = e.target.value; majLigne(m, 'nom_mode_paiement', v ? v.charAt(0).toUpperCase() + v.slice(1) : v); }}
                  placeholder="Nom (ex. Virement)"
                  className={CL + ' flex-1 min-w-0'} autoComplete="nope" />
                <input value={m.abrege_mode_paiement ?? ''}
                  onChange={(e) => majLigne(m, 'abrege_mode_paiement', e.target.value.replace(/[^A-Za-z]/g, '').toUpperCase())}
                  placeholder="VIR"
                  title="Lettres uniquement"
                  className={CL + ' w-24'} autoComplete="nope" />
                <label className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap w-20 justify-center"
                  title="Archiver ce mode (ne plus le proposer à la saisie)">
                  <input type="checkbox" checked={!!m.ne_plus_proposer}
                    onChange={(e) => majLigne(m, 'ne_plus_proposer', e.target.checked)}
                    className="accent-primaire" />
                  <span className="sm:hidden">Archiver</span>
                </label>
                <div className="flex gap-1 ml-auto sm:ml-0">
                  <button onClick={() => sauvegarder(m)} title="Enregistrer cette ligne"
                    className={`p-1.5 rounded-lg transition
                      ${dirty
                        ? 'bg-primaire text-white hover:bg-primaire-fonce dark:hover:bg-primaire'
                        : 'bg-primaire-clair dark:bg-primaire/20 text-primaire-fonce dark:text-primaire hover:bg-primaire hover:text-white'}`}>
                    <Check className="w-4 h-4" />
                  </button>
                  {m.id_mode_paiement && (
                    <button onClick={() => setConfirmerSuppression(m.id_mode_paiement)} title="Supprimer ce mode de paiement"
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
        titre="Supprimer ce mode de paiement ?"
        message="Cette action est irréversible."
        labelConfirmer="Supprimer"
        onConfirmer={supprimerConfirme}
        onAnnuler={() => setConfirmerSuppression(null)}
      />
    </div>
  );
}
