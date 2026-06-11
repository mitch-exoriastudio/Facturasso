// =====================================================================
//  Champ avec auto-complétion ville / code postal.
//  Quand l'utilisateur tape dans l'un des champs, les suggestions
//  s'affichent et remplissent automatiquement l'autre champ.
// =====================================================================
import { useState, useRef } from 'react';
import { clientService } from '../services/clientService.js';

export default function ChampAutoVille({ codePostal, ville, onChange, disabled }) {
  const [suggestionsVilles, setSuggestionsVilles] = useState([]);
  const timerRef = useRef(null);

  // Déclenche la recherche avec un léger délai pour ne pas surcharger l'API.
  function rechercherAvecDelai(type, valeur) {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      if (valeur.length < 2) { setSuggestionsVilles([]); return; }
      const resultats = await clientService.villes(
        type === 'cp' ? { cp: valeur } : { nom: valeur }
      );
      setSuggestionsVilles(resultats);
    }, 300);
  }

  function choisirVille(suggestion) {
    onChange({ codePostal: suggestion.code_postal, ville: suggestion.nom_ville });
    setSuggestionsVilles([]);
  }

  const classeInput = `w-full border border-slate-300 rounded-lg px-3 py-2 text-sm
    focus:outline-none focus:ring-2 focus:ring-primaire disabled:bg-slate-50 disabled:text-slate-400`;

  return (
    <div className="flex gap-3 relative">
      {/* Champ code postal */}
      <div className="w-28">
        <label className="block text-xs text-slate-500 mb-1">Code postal</label>
        <input
          value={codePostal}
          disabled={disabled}
          onChange={(e) => {
            onChange({ codePostal: e.target.value, ville });
            rechercherAvecDelai('cp', e.target.value);
          }}
          className={classeInput}
        />
      </div>

      {/* Champ ville */}
      <div className="flex-1">
        <label className="block text-xs text-slate-500 mb-1">Ville</label>
        <input
          value={ville}
          disabled={disabled}
          onChange={(e) => {
            onChange({ codePostal, ville: e.target.value });
            rechercherAvecDelai('nom', e.target.value);
          }}
          className={classeInput}
        />
      </div>

      {/* Liste déroulante de suggestions */}
      {suggestionsVilles.length > 0 && (
        <ul className="absolute top-full left-0 mt-1 z-20 bg-white border border-slate-200
                        rounded-lg shadow-lg max-h-48 overflow-y-auto w-full">
          {suggestionsVilles.map((s, i) => (
            <li
              key={i}
              onMouseDown={() => choisirVille(s)}
              className="px-3 py-2 text-sm hover:bg-primaire-clair cursor-pointer"
            >
              {s.code_postal} — {s.nom_ville}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
