// =====================================================================
//  Onglet 1 — Mentions documents (informations de l'association + logo)
// =====================================================================
import { useState } from 'react';
import { configService } from '../../services/configService.js';

const CL = 'w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primaire';
const CL_AREA = CL + ' resize-none';

export default function OngletMentions({ params, onMaj }) {
  const [form, setForm] = useState({ ...params });
  const [sauvegarde, setSauvegarde] = useState('');
  const [erreur, setErreur] = useState('');

  const maj = (champ) => (e) => setForm(f => ({ ...f, [champ]: e.target.value }));

  // Chargement du logo depuis le disque local → conversion en base64.
  function chargerLogo(e) {
    const fichier = e.target.files[0];
    if (!fichier) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm(f => ({ ...f, logo_asso: ev.target.result }));
    reader.readAsDataURL(fichier);
  }

  async function sauvegarder(e) {
    e.preventDefault();
    setSauvegarde(''); setErreur('');
    try {
      await configService.putParametres(form);
      onMaj(form);
      setSauvegarde('Enregistré !');
      setTimeout(() => setSauvegarde(''), 3000);
    } catch { setErreur('Erreur lors de la sauvegarde.'); }
  }

  return (
    <form onSubmit={sauvegarder} autoComplete="off" className="space-y-5 max-w-4xl">
      {sauvegarde && <div className="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">{sauvegarde}</div>}
      {erreur && <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">{erreur}</div>}

      <div className="grid grid-cols-2 gap-6">
        {/* Colonne gauche */}
        <div className="space-y-4">
          {/* Logo */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Logo</label>
            <div className="flex items-center gap-3">
              {form.logo_asso
                ? <img src={form.logo_asso} alt="Logo" className="h-16 object-contain border border-gray-200 dark:border-gray-700 rounded" />
                : <div className="h-16 w-24 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded flex items-center justify-center text-xs text-gray-400 dark:text-gray-500">Aucun logo</div>
              }
              <div className="flex flex-col gap-1">
                <label className="cursor-pointer bg-primaire-clair dark:bg-primaire/20 text-primaire-fonce dark:text-primaire text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-primaire hover:text-white dark:hover:bg-primaire dark:hover:text-white transition">
                  Charger un logo
                  <input type="file" accept="image/*" onChange={chargerLogo} className="hidden" />
                </label>
                {form.logo_asso && (
                  <button type="button" onClick={() => setForm(f => ({ ...f, logo_asso: null }))}
                    className="text-xs text-red-500 hover:underline text-left">Supprimer</button>
                )}
              </div>
            </div>
          </div>

          <Champ label="Raison sociale" value={form.raison_sociale_asso} onChange={maj('raison_sociale_asso')} />
          <div className="grid grid-cols-2 gap-3">
            <Champ label="Activité / code NAF" value={form.activite_naf_asso} onChange={maj('activite_naf_asso')} />
            <Champ label="TVA intracommunautaire" value={form.tva_intra_asso} onChange={maj('tva_intra_asso')} />
            <Champ label="SIRET" value={form.siret_asso} onChange={maj('siret_asso')} />
            <Champ label="RNA" value={form.rna} onChange={maj('rna')} />
          </div>
          <Champ label="Adresse" value={form.adresse_asso1} onChange={maj('adresse_asso1')} />
          <Champ label="Adresse (suite)" value={form.adresse_asso2} onChange={maj('adresse_asso2')} />
          <div className="grid grid-cols-2 gap-3">
            <Champ label="Code postal" value={form.code_postal_asso} onChange={maj('code_postal_asso')} />
            <Champ label="Ville" value={form.ville_association} onChange={maj('ville_association')} />
            <Champ label="Téléphone" value={form.tel_asso1} onChange={maj('tel_asso1')} />
            <Champ label="Autre téléphone" value={form.tel_asso2} onChange={maj('tel_asso2')} />
            <Champ label="E-mail" value={form.email_asso1} onChange={maj('email_asso1')} />
            <Champ label="Autre e-mail" value={form.email_asso2} onChange={maj('email_asso2')} />
          </div>
        </div>

        {/* Colonne droite */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Commentaire en-tête de facture</label>
            <textarea value={form.com_entete_page_factu} onChange={maj('com_entete_page_factu')}
              rows={4} className={CL_AREA} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Commentaire bas de page de facture</label>
            <textarea value={form.com_pied_page_factu} onChange={maj('com_pied_page_factu')}
              rows={4} className={CL_AREA} />
          </div>
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Mentions diverses (IBAN, etc.)</label>
            <textarea value={form.mention_obligatoire_fact4} onChange={maj('mention_obligatoire_fact4')}
              rows={3} className={CL_AREA} />
          </div>
        </div>
      </div>

      <button type="submit"
        className="bg-primaire hover:bg-primaire-fonce dark:bg-primaire-fonce dark:hover:bg-primaire text-white font-semibold px-6 py-2 rounded-lg transition">
        Enregistrer
      </button>
    </form>
  );
}

// Petit composant helper pour éviter la répétition.
function Champ({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      <input value={value ?? ''} onChange={onChange} autoComplete="off" className={CL} />
    </div>
  );
}
