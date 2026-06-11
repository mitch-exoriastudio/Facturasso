// =====================================================================
//  Onglet 6 — Options superviseur (réservé à l'admin)
//  Dernier numéro de facture + import CSV villes
// =====================================================================
import { useState } from 'react';
import { configService } from '../../services/configService.js';

export default function OngletSuperviseur({ dernierNumero, onMajNumero }) {
  const [numero, setNumero] = useState(dernierNumero ?? 0);
  const [message, setMessage] = useState('');
  const [erreur, setErreur] = useState('');
  const [importMsg, setImportMsg] = useState('');

  async function sauvegarderNumero() {
    setMessage(''); setErreur('');
    try {
      await configService.patchDernierNumero(Number(numero));
      onMajNumero(Number(numero));
      setMessage('Numéro mis à jour !');
      setTimeout(() => setMessage(''), 3000);
    } catch { setErreur('Erreur lors de la mise à jour.'); }
  }

  async function importerCsv(e) {
    const fichier = e.target.files[0];
    if (!fichier) return;
    setImportMsg('Import en cours…');
    const texte = await fichier.text();
    try {
      const res = await configService.importerVilles(texte);
      setImportMsg(res.message);
    } catch (err) {
      setImportMsg('Erreur : ' + (err.response?.data?.message || err.message));
    }
  }

  return (
    <div className="max-w-2xl space-y-8">
      {/* Numéro de facture */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <h3 className="font-semibold text-slate-700">Numéro de facture</h3>
        <p className="text-sm text-slate-500">
          Définit le dernier numéro utilisé. La prochaine facture créée aura le numéro suivant.
          À ajuster lors de la bascule depuis l'ancienne application.
        </p>
        {message && <div className="text-sm text-green-700 bg-green-50 rounded-lg p-3">{message}</div>}
        {erreur && <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3">{erreur}</div>}
        <div className="flex gap-3 items-center">
          <input type="number" value={numero} onChange={e => setNumero(e.target.value)} min={0}
            className="w-36 border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primaire" />
          <button onClick={sauvegarderNumero}
            className="bg-primaire hover:bg-primaire-fonce text-white font-semibold px-4 py-2 rounded-lg text-sm transition">
            Enregistrer
          </button>
        </div>
      </div>

      {/* Import CSV villes */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <h3 className="font-semibold text-slate-700">Importer les villes et codes postaux</h3>
        <p className="text-sm text-slate-500">
          Fichier CSV avec 2 colonnes : <code className="bg-slate-100 px-1 rounded">code_postal ; nom_ville</code>.
          L'import remplace toutes les villes existantes.
        </p>
        {importMsg && <div className="text-sm text-primaire bg-primaire-clair rounded-lg p-3">{importMsg}</div>}
        <label className="cursor-pointer inline-block bg-primaire hover:bg-primaire-fonce text-white font-semibold px-4 py-2 rounded-lg text-sm transition">
          Choisir un fichier CSV
          <input type="file" accept=".csv,.txt" onChange={importerCsv} className="hidden" />
        </label>
      </div>
    </div>
  );
}
