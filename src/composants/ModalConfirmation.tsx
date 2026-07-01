// =====================================================================
//  Modal de confirmation réutilisable — remplace window.confirm().
//  Variantes : 'danger' (rouge), 'avertissement' (amber), 'info' (cyan).
// =====================================================================
import { useEffect } from 'react';
import { AlertTriangle, HelpCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

type Variante = 'danger' | 'avertissement' | 'info';

const VARIANTES: Record<Variante, {
  Icone: LucideIcon;
  couleurIcone: string;
  fondIcone: string;
  bouton: string;
}> = {
  danger: {
    Icone: AlertTriangle,
    couleurIcone: 'text-red-500',
    fondIcone:    'bg-red-50 dark:bg-red-900/20',
    bouton:       'bg-red-500 hover:bg-red-600 focus:ring-red-500 text-white',
  },
  avertissement: {
    Icone: AlertTriangle,
    couleurIcone: 'text-amber-500',
    fondIcone:    'bg-amber-50 dark:bg-amber-900/20',
    bouton:       'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500 text-white',
  },
  info: {
    Icone: HelpCircle,
    couleurIcone: 'text-primaire',
    fondIcone:    'bg-cyan-50 dark:bg-cyan-900/20',
    bouton:       'bg-primaire hover:bg-primaire-fonce dark:bg-primaire-fonce dark:hover:bg-primaire focus:ring-primaire text-white',
  },
};

interface Props {
  ouvert?: boolean;
  titre?: string;
  message?: string;
  labelConfirmer?: string;
  labelAnnuler?: string;
  variante?: Variante;
  onConfirmer?: () => void;
  onAnnuler?: () => void;
}

export default function ModalConfirmation({
  ouvert          = false,
  titre           = 'Confirmation',
  message         = '',
  labelConfirmer  = 'Confirmer',
  labelAnnuler    = 'Annuler',
  variante        = 'danger',
  onConfirmer,
  onAnnuler,
}: Props) {
  useEffect(() => {
    if (!ouvert) return;
    function onTouche(e: KeyboardEvent) {
      if (e.key === 'Escape') onAnnuler?.();
    }
    document.addEventListener('keydown', onTouche);
    return () => document.removeEventListener('keydown', onTouche);
  }, [ouvert, onAnnuler]);

  if (!ouvert) return null;

  const { Icone, couleurIcone, fondIcone, bouton } = VARIANTES[variante] ?? VARIANTES.danger;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-titre"
    >
      {/* Fond semi-transparent */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fondu"
        onClick={onAnnuler}
      />

      {/* Carte */}
      <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 flex flex-col gap-4 animate-surgir">

        {/* Icône */}
        <div className={`self-start p-3 rounded-xl ${fondIcone}`}>
          <Icone size={22} className={couleurIcone} />
        </div>

        {/* Textes */}
        <div>
          <h3 id="modal-titre" className="font-semibold text-slate-900 dark:text-white text-base leading-snug">
            {titre}
          </h3>
          {message && (
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {message}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2.5 justify-end">
          <button
            onClick={onAnnuler}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            {labelAnnuler}
          </button>
          <button
            onClick={onConfirmer}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${bouton}`}
          >
            {labelConfirmer}
          </button>
        </div>
      </div>
    </div>
  );
}
