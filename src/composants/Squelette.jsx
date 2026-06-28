// Squelettes de chargement (skeleton screens) — style animate-pulse Tailwind.
// Chaque export correspond au layout d'une page précise.

const B = ({ className }) => (
  <div className={`bg-gray-200 dark:bg-gray-700 rounded ${className}`} />
);

// ── Clients ────────────────────────────────────────────────────────────────

function CarteClientSquelette() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700/50 px-4 py-3.5 flex items-center gap-4">
      <div className="shrink-0 w-10 h-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
      <div className="flex-1 space-y-2">
        <B className="h-4 w-2/5" />
        <B className="h-3 w-3/5" />
        <B className="h-3 w-1/4" />
      </div>
    </div>
  );
}

export function SqueletteClients({ n = 6 }) {
  return (
    <div className="animate-pulse space-y-2">
      {Array.from({ length: n }).map((_, i) => <CarteClientSquelette key={i} />)}
    </div>
  );
}

// ── Configuration (onglets + contenu) ─────────────────────────────────────

export function SqueletteConfiguration() {
  return (
    <div className="animate-pulse">
      <B className="h-8 w-44 mb-5" />

      {/* Barre d'onglets */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 mb-6">
        {[120, 148, 112, 132, 140].map((w, i) => (
          <div key={i} className="h-9 rounded-t-lg bg-gray-200 dark:bg-gray-700 mb-0" style={{ width: w }} />
        ))}
      </div>

      {/* Contenu simulé */}
      <div className="space-y-4 max-w-2xl">
        <B className="h-4 w-32" />
        <B className="h-10 w-full" />
        <B className="h-4 w-40" />
        <B className="h-10 w-full" />
        <B className="h-4 w-36" />
        <B className="h-10 w-full" />
        <B className="h-10 w-full" />
        <B className="h-9 w-28 mt-2" />
      </div>
    </div>
  );
}

// ── Ligne de liste (prestations / modes de paiement) ─────────────────────

function LigneSquelette({ colonnes }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-3 py-2 flex items-center gap-2">
      {colonnes.map((cls, i) => <B key={i} className={`h-8 ${cls}`} />)}
      <div className="flex gap-1 ml-auto">
        <B className="h-7 w-7 rounded-lg" />
        <B className="h-7 w-7 rounded-lg" />
      </div>
    </div>
  );
}

export function SquelettePrestations({ n = 5 }) {
  return (
    <div className="animate-pulse space-y-2 max-w-3xl">
      {Array.from({ length: n }).map((_, i) => (
        <LigneSquelette key={i} colonnes={['flex-1', 'w-28', 'w-24']} />
      ))}
    </div>
  );
}

export function SqueletteModesPaiement({ n = 4 }) {
  return (
    <div className="animate-pulse space-y-2 max-w-xl">
      {Array.from({ length: n }).map((_, i) => (
        <LigneSquelette key={i} colonnes={['flex-1', 'w-24']} />
      ))}
    </div>
  );
}
