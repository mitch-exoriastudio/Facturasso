// =====================================================================
//  Onglet 1 — Mentions documents (informations de l'association + logo)
// =====================================================================
import { useState, useMemo, useEffect } from 'react';
import { configService } from '../../services/configService.js';
import ChampSansAutofill from '../../composants/ChampSansAutofill.jsx';

const CL = 'w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primaire';
const CL_AREA = CL + ' resize-none';

function estModifie(a, b) {
  return JSON.stringify(a) !== JSON.stringify(b);
}

export default function OngletMentions({ params, onMaj, onModifie }) {
  const [form, setForm] = useState({ ...params });
  const [reference, setReference] = useState({ ...params });
  const [sauvegarde, setSauvegarde] = useState(false);
  const [erreur, setErreur] = useState('');
  const [enCours, setEnCours] = useState(false);

  const modifie = useMemo(() => estModifie(form, reference), [form, reference]);

  useEffect(() => { onModifie?.(modifie); }, [modifie]);

  const maj = (champ, fmt) => (e) => {
    let v = e.target.value;
    if (fmt === 'MAJ') v = v.toUpperCase();
    else if (fmt === '1ere') v = v.charAt(0).toUpperCase() + v.slice(1);
    setForm(f => ({ ...f, [champ]: v }));
  };

  function chargerLogo(e) {
    const fichier = e.target.files[0];
    if (!fichier) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm(f => ({ ...f, logo_asso: ev.target.result }));
    reader.readAsDataURL(fichier);
  }

  async function sauvegarder(e) {
    e.preventDefault();
    setSauvegarde(false); setErreur('');
    setEnCours(true);
    try {
      await configService.putParametres(form);
      setReference({ ...form });
      onMaj(form);
      setSauvegarde(true);
      setTimeout(() => setSauvegarde(false), 2000);
    } catch (err) { setErreur(err.response?.data?.message ?? 'Erreur lors de la sauvegarde.'); }
    finally { setEnCours(false); }
  }

  return (
    <form onSubmit={sauvegarder} autoComplete="off" className="space-y-5 max-w-5xl pb-20">
      {erreur && <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">{erreur}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* ── Colonne gauche : identité & coordonnées ── */}
        <div className="space-y-4">

          <Section titre="Identité">
            <Champ label="Raison sociale" value={form.asso_raison_sociale} onChange={maj('asso_raison_sociale', '1ere')} maxLength={255} />
            <Champ label="Statut juridique (ex : Association loi 1901)" value={form.asso_statut} onChange={maj('asso_statut', '1ere')} maxLength={100} />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Champ label="Nom du contact" value={form.asso_contact_nom} onChange={maj('asso_contact_nom', '1ere')} maxLength={100} />
              <Champ label="Prénom du contact" value={form.asso_contact_prenom} onChange={maj('asso_contact_prenom', '1ere')} maxLength={100} />
            </div>
          </Section>

          <Section titre="Identifiants légaux">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Champ label="SIREN" value={form.asso_siren} onChange={maj('asso_siren', 'MAJ')} maxLength={9} />
              <Champ label="SIRET" value={form.asso_siret} onChange={maj('asso_siret', 'MAJ')} maxLength={14} />
              <Champ label="RNA (n° de déclaration)" value={form.rna} onChange={maj('rna', 'MAJ')} maxLength={20} />
              <Champ label="Code NAF / APE" value={form.asso_naf} onChange={maj('asso_naf', 'MAJ')} maxLength={10} />
            </div>
            <Champ label="N° TVA intracommunautaire" value={form.asso_num_tva_intra} onChange={maj('asso_num_tva_intra', 'MAJ')} maxLength={20} />
          </Section>

          <Section titre="Adresse">
            <Champ label="Adresse ligne 1" value={form.asso_adresse1} onChange={maj('asso_adresse1', '1ere')} maxLength={255} />
            <Champ label="Adresse ligne 2" value={form.asso_adresse2} onChange={maj('asso_adresse2')} maxLength={255} />
            <Champ label="Adresse ligne 3" value={form.asso_adresse3} onChange={maj('asso_adresse3')} maxLength={255} />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Champ label="Code postal" value={form.asso_code_postal} onChange={maj('asso_code_postal', 'MAJ')} maxLength={10} />
              <div className="sm:col-span-2">
                <Champ label="Ville" value={form.asso_ville} onChange={maj('asso_ville', '1ere')} maxLength={165} />
              </div>
            </div>
            <Champ label="Pays" value={form.asso_pays} onChange={maj('asso_pays', '1ere')} maxLength={200} />
          </Section>

          <Section titre="Contact">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Champ label="Téléphone" value={form.asso_tel} onChange={maj('asso_tel')} maxLength={20} />
              <Champ label="Téléphone 2" value={form.asso_tel2} onChange={maj('asso_tel2')} maxLength={20} />
              <Champ label="E-mail" value={form.asso_email} onChange={maj('asso_email')} maxLength={260} />
              <Champ label="E-mail 2" value={form.asso_email2} onChange={maj('asso_email2')} maxLength={260} />
            </div>
          </Section>

        </div>

        {/* ── Colonne droite : logo + mentions documents ── */}
        <div className="space-y-4">

          <Section titre="Logo">
            <div className="flex flex-col gap-3">
              {form.logo_asso
                ? <img src={form.logo_asso} alt="Logo" className="max-h-48 w-full object-contain border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-900" />
                : <div className="h-48 w-full bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">Aucun logo chargé</div>
              }
              <div className="flex justify-end gap-3">
                <label className="cursor-pointer bg-primaire-clair dark:bg-primaire/20 text-primaire-fonce dark:text-primaire text-xs font-medium px-4 py-2 rounded-lg hover:bg-primaire hover:text-white dark:hover:bg-primaire dark:hover:text-white transition">
                  Charger un logo
                  <input type="file" accept="image/*" onChange={chargerLogo} className="hidden" />
                </label>
                {form.logo_asso && (
                  <button type="button" onClick={() => setForm(f => ({ ...f, logo_asso: null }))}
                    className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 transition">
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          </Section>

          <Section titre="Textes imprimés sur les factures">
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Commentaire en-tête</label>
              <textarea value={form.com_entete_page_factu ?? ''} onChange={maj('com_entete_page_factu')}
                rows={3} maxLength={400} className={CL_AREA} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Commentaire pied de page</label>
              <textarea value={form.com_pied_page_factu ?? ''} onChange={maj('com_pied_page_factu')}
                rows={3} maxLength={400} className={CL_AREA} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Mention obligatoire (IBAN, délai paiement…)</label>
              <textarea value={form.mention_obligatoire_fact4 ?? ''} onChange={maj('mention_obligatoire_fact4')}
                rows={2} maxLength={200} className={CL_AREA} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Autre mention 1</label>
              <textarea value={form.asso_autre_mention1 ?? ''} onChange={maj('asso_autre_mention1')}
                rows={2} maxLength={400} className={CL_AREA} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Autre mention 2</label>
              <textarea value={form.asso_autre_mention2 ?? ''} onChange={maj('asso_autre_mention2')}
                rows={2} maxLength={400} className={CL_AREA} />
            </div>
          </Section>

        </div>
      </div>

      {/* Barre sticky — modifications non enregistrées */}
      <div className={`fixed bottom-0 left-0 lg:left-64 right-0 z-40 transition-transform duration-300 ${modifie || sauvegarde ? 'translate-y-0' : 'translate-y-full'}`}>
        <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg px-6 py-3 flex items-center gap-4">
          <button type="submit" disabled={enCours || !modifie}
            className="bg-primaire hover:bg-primaire-fonce dark:bg-primaire-fonce dark:hover:bg-primaire disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-5 py-2 rounded-lg transition whitespace-nowrap">
            {enCours ? 'Enregistrement…' : 'Enregistrer'}
          </button>
          <span className={`text-sm ${sauvegarde ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
            {sauvegarde ? 'Enregistré !' : 'Modifications non enregistrées'}
          </span>
        </div>
      </div>
    </form>
  );
}

function Section({ titre, children }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-700 pb-1">{titre}</h3>
      {children}
    </div>
  );
}

function Champ({ label, value, onChange, maxLength }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      <ChampSansAutofill value={value ?? ''} onChange={onChange} maxLength={maxLength} className={CL} />
    </div>
  );
}
