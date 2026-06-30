import { CreditCard } from 'lucide-react';

// Route /paiements — module à venir (lot Paiements).
export default function PagePaiements() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <CreditCard size={24} className="text-primaire" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Paiements</h1>
      </div>
      <p className="text-gray-500 dark:text-gray-400">Module à venir.</p>
    </div>
  );
}
