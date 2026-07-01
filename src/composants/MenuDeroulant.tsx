'use client';
// =====================================================================
//  Menu déroulant personnalisé — remplace le <select> natif dont la
//  liste ouverte (les <option>) est rendue par l'OS et non stylable
//  (surbrillance bleue système, moche en dark mode).
//  Accessible : navigation clavier (flèches, Entrée, Échap, Home/End),
//  fermeture au clic extérieur, rôle listbox.
// =====================================================================
import { useState, useRef, useEffect, useId } from 'react';
import type { KeyboardEvent } from 'react';
import { ChevronDown, Check } from 'lucide-react';

type OptionValeur = string | number;

interface Option {
  value: OptionValeur;
  label: string;
}

interface Props {
  value: OptionValeur;
  onChange: (valeur: OptionValeur) => void;
  options: Option[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function MenuDeroulant({
  value,
  onChange,
  options,          // [{ value, label }]
  placeholder = '— Choisir —',
  disabled = false,
  className = '',
}: Props) {
  const [ouvert, setOuvert] = useState(false);
  const [survol, setSurvol] = useState(-1); // index survolé au clavier
  const conteneurRef = useRef<HTMLDivElement>(null);
  const listeRef = useRef<HTMLUListElement>(null);
  const idListe = useId();

  const indexSelectionne = options.findIndex((o) => o.value === value);
  const optionSelectionnee = indexSelectionne >= 0 ? options[indexSelectionne] : null;

  // Fermeture au clic extérieur
  useEffect(() => {
    if (!ouvert) return;
    function auClic(e: MouseEvent) {
      if (conteneurRef.current && !conteneurRef.current.contains(e.target as Node)) {
        setOuvert(false);
      }
    }
    document.addEventListener('mousedown', auClic);
    return () => document.removeEventListener('mousedown', auClic);
  }, [ouvert]);

  // À l'ouverture, on se positionne sur l'option sélectionnée
  useEffect(() => {
    if (ouvert) setSurvol(indexSelectionne >= 0 ? indexSelectionne : 0);
  }, [ouvert]);

  // Garde l'option survolée visible dans la liste
  useEffect(() => {
    if (!ouvert || survol < 0 || !listeRef.current) return;
    const el = listeRef.current.children[survol];
    el?.scrollIntoView({ block: 'nearest' });
  }, [survol, ouvert]);

  function choisir(option: Option) {
    onChange(option.value);
    setOuvert(false);
  }

  function auClavier(e: KeyboardEvent<HTMLButtonElement>) {
    if (disabled) return;
    if (!ouvert) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        setOuvert(true);
      }
      return;
    }
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSurvol((i) => Math.min(i + 1, options.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSurvol((i) => Math.max(i - 1, 0));
        break;
      case 'Home':
        e.preventDefault();
        setSurvol(0);
        break;
      case 'End':
        e.preventDefault();
        setSurvol(options.length - 1);
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (options[survol]) choisir(options[survol]);
        break;
      case 'Escape':
        e.preventDefault();
        setOuvert(false);
        break;
      case 'Tab':
        setOuvert(false);
        break;
    }
  }

  return (
    <div ref={conteneurRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setOuvert((o) => !o)}
        onKeyDown={auClavier}
        aria-haspopup="listbox"
        aria-expanded={ouvert}
        aria-controls={idListe}
        className="w-full flex items-center justify-between gap-2 border border-gray-200 dark:border-gray-700 rounded-xl pl-3 pr-2.5 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 text-left focus:outline-none focus:ring-2 focus:ring-primaire disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        <span className={optionSelectionnee ? '' : 'text-gray-400 dark:text-gray-500'}>
          {optionSelectionnee ? optionSelectionnee.label : placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-gray-400 shrink-0 transition-transform ${ouvert ? 'rotate-180' : ''}`}
        />
      </button>

      {ouvert && (
        <ul
          ref={listeRef}
          id={idListe}
          role="listbox"
          tabIndex={-1}
          className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-1 shadow-lg focus:outline-none"
        >
          {options.length === 0 && (
            <li className="px-3 py-2 text-sm text-gray-400 dark:text-gray-500 select-none">
              Aucune option
            </li>
          )}
          {options.map((option, i) => {
            const actif = option.value === value;
            const enSurvol = i === survol;
            return (
              <li
                key={option.value}
                role="option"
                aria-selected={actif}
                onMouseEnter={() => setSurvol(i)}
                onClick={() => choisir(option)}
                className={`flex items-center justify-between gap-2 px-3 py-2 text-sm cursor-pointer select-none ${
                  enSurvol
                    ? 'bg-primaire-clair dark:bg-primaire/20 text-primaire-fonce dark:text-primaire'
                    : 'text-gray-700 dark:text-gray-200'
                }`}
              >
                <span className="truncate">{option.label}</span>
                {actif && <Check size={15} className="text-primaire shrink-0" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
