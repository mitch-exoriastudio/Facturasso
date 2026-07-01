import { Mail } from 'lucide-react';

// Route /envoi — module à venir (lot Envoi d'e-mails).
export default function PageEnvoi() {
  return (
    <div>
      <div className="flex items-center gap-3 mb-2">
        <Mail size={24} className="text-primaire" />
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Envoi</h1>
      </div>
      <p className="text-gray-500 dark:text-gray-400">Module à venir.</p>
    </div>
  );
}
