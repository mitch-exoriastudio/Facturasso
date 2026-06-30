// =====================================================================
//  Champ avec auto-complétion ville / code postal.
// =====================================================================
import { useState, useRef } from 'react';
import { clientService } from '../services/clientService.js';
import ChampSansAutofill from './ChampSansAutofill.jsx';

export default function ChampAutoVille({ codePostal, ville, onChange, disabled }) {
  const [suggestions, setSuggestions] = useState([]);
  const timerRef = useRef(null);

  function rechercherAvecDelai(type, valeur) {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      if (valeur.length < 2) { setSuggestions([]); return; }
      const resultats = await clientService.villes(
        type === 'cp' ? { cp: valeur } : { nom: valeur }
      );
      setSuggestions(resultats);
    }, 300);
  }

  function choisirVille(s) {
    onChange({ codePostal: s.code_postal, ville: s.nom_ville });
    setSuggestions([]);
  }

  const classeInput = `w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm
    bg-white dark:bg-gray-800 dark:text-gray-100
    focus:outline-none focus:ring-2 focus:ring-primaire
    disabled:bg-gray-50 dark:disabled:bg-gray-900 disabled:text-gray-400 dark:disabled:text-gray-600`;

  const classeLabel = 'block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5';

  return (
    <div className="flex gap-3 relative">
      {/* Code postal */}
      <div className="w-28">
        <label className={classeLabel}>Code postal</label>
        <ChampSansAutofill
          value={codePostal}
          disabled={disabled}
          onChange={(e) => {
            onChange({ codePostal: e.target.value, ville });
            rechercherAvecDelai('cp', e.target.value);
          }}
          className={classeInput}
        />
      </div>

      {/* Ville */}
      <div className="flex-1">
        <label className={classeLabel}>Ville</label>
        <ChampSansAutofill
          value={ville}
          disabled={disabled}
          onChange={(e) => {
            onChange({ codePostal, ville: e.target.value });
            rechercherAvecDelai('nom', e.target.value);
          }}
          className={classeInput}
        />
      </div>

      {/* Suggestions */}
      {suggestions.length > 0 && (
        <ul className="absolute top-full left-0 mt-1 z-30 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg max-h-48 overflow-y-auto w-full">
          {suggestions.map((s, i) => (
            <li
              key={i}
              onMouseDown={() => choisirVille(s)}
              className="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-primaire/10 dark:hover:bg-primaire/20 cursor-pointer first:rounded-t-xl last:rounded-b-xl"
            >
              <span className="font-medium">{s.code_postal}</span>
              <span className="text-gray-400 mx-1.5">—</span>
              {s.nom_ville}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
