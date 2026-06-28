// =====================================================================
//  Onglet 6 — Options superviseur (réservé à l'admin)
//  Dernier numéro de facture + import CSV villes
// =====================================================================
import { useState } from 'react';
import { configService } from '../../services/configService.js';
import ChampNumerique from '../../composants/ChampNumerique.jsx';

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
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-3">
        <h3 className="font-semibold text-gray-700 dark:text-gray-200">Numéro de facture</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Définit le dernier numéro utilisé. La prochaine facture créée aura le numéro suivant.
          À ajuster lors de la bascule depuis l'ancienne application.
        </p>
        {message && <div className="text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg p-3">{message}</div>}
        {erreur && <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">{erreur}</div>}
        <div className="flex gap-3 items-center">
          <ChampNumerique value={numero} onChange={e => setNumero(e.target.value)} min={0}
            className="w-36 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primaire" />
          <button onClick={sauvegarderNumero}
            className="bg-primaire hover:bg-primaire-fonce dark:bg-primaire-fonce dark:hover:bg-primaire text-white font-semibold px-4 py-2 rounded-lg text-sm transition">
            Enregistrer
          </button>
        </div>
      </div>

      {/* Import CSV villes */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 space-y-3">
        <h3 className="font-semibold text-gray-700 dark:text-gray-200">Importer les villes et codes postaux</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Fichier CSV avec 2 colonnes : <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">code_postal ; nom_ville</code>.
          L'import remplace toutes les villes existantes.
        </p>
        {importMsg && <div className="text-sm text-primaire bg-primaire-clair dark:bg-primaire/20 rounded-lg p-3">{importMsg}</div>}
        <label className="cursor-pointer inline-block bg-primaire hover:bg-primaire-fonce dark:bg-primaire-fonce dark:hover:bg-primaire text-white font-semibold px-4 py-2 rounded-lg text-sm transition">
          Choisir un fichier CSV
          <input type="file" accept=".csv,.txt" onChange={importerCsv} className="hidden" />
        </label>
      </div>
    </div>
  );
}
