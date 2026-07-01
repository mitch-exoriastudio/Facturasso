'use client';
// =====================================================================
//  Contexte Toast — notifications éphémères (succès / erreur).
//  useToast() expose .succes(texte) et .erreur(texte). Les toasts
//  s'empilent en bas à gauche (juste à droite de la sidebar) et
//  disparaissent automatiquement. Position unique dans toute l'app.
// =====================================================================
import { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

interface ToastItem {
  id: number;
  texte: string;
  ok: boolean;
}

interface ContexteToastValeur {
  succes: (texte: string, duree?: number) => number;
  erreur: (texte: string, duree?: number) => number;
}

const ContexteToast = createContext<ContexteToastValeur | null>(null);

export function useToast(): ContexteToastValeur {
  const ctx = useContext(ContexteToast);
  if (!ctx) throw new Error('useToast doit être utilisé à l’intérieur de <FournisseurToast>.');
  return ctx;
}

export function FournisseurToast({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const compteur = useRef(0);

  const retirer = useCallback((id: number) => {
    setToasts((ts) => ts.filter((t) => t.id !== id));
  }, []);

  const afficher = useCallback((texte: string, ok: boolean, duree: number) => {
    const id = ++compteur.current;
    setToasts((ts) => [...ts, { id, texte, ok }]);
    if (duree > 0) setTimeout(() => retirer(id), duree);
    return id;
  }, [retirer]);

  // Identité stable : ne re-rend pas les consommateurs à chaque toast.
  const toast = useMemo<ContexteToastValeur>(() => ({
    succes: (texte: string, duree = 3000) => afficher(texte, true, duree),
    erreur: (texte: string, duree = 5000) => afficher(texte, false, duree),
  }), [afficher]);

  return (
    <ContexteToast.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 left-4 lg:left-[17rem] z-[60] flex flex-col gap-2 w-72 max-w-[calc(100vw-2rem)] pointer-events-none">
        {toasts.map((t) => (
          <Toast key={t.id} texte={t.texte} ok={t.ok} onFermer={() => retirer(t.id)} />
        ))}
      </div>
    </ContexteToast.Provider>
  );
}

function Toast({ texte, ok, onFermer }: { texte: string; ok: boolean; onFermer: () => void }) {
  const Icone = ok ? CheckCircle2 : AlertCircle;
  return (
    <div role="status"
      className={`pointer-events-auto flex items-start gap-2.5 rounded-xl shadow-lg border px-3.5 py-3 text-sm animate-glisser bg-white dark:bg-gray-800
        ${ok
          ? 'border-green-200 dark:border-green-800 text-green-700 dark:text-green-300'
          : 'border-red-200 dark:border-red-800 text-red-700 dark:text-red-300'}`}>
      <Icone className={`w-5 h-5 shrink-0 ${ok ? 'text-green-500' : 'text-red-500'}`} />
      <span className="flex-1 leading-snug">{texte}</span>
      <button onClick={onFermer} aria-label="Fermer"
        className="shrink-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
