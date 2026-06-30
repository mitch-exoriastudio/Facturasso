import { FileText } from 'lucide-react';

// Route /factures — module à venir (lot Factures).
export default function PageFactures() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <FileText size={24} className="text-primaire" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Factures</h1>
      </div>
      <p className="text-gray-500 dark:text-gray-400">Module à venir.</p>
    </div>
  );
}
