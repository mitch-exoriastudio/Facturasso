'use client';
// =====================================================================
//  Disposition générale : sidebar + zone de contenu.
//  Responsive (hamburger sur mobile) + dark mode (auto OS + toggle).
// =====================================================================
import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Home, FileText, CreditCard, Users, Mail, Settings,
  LogOut, Menu, X, Sun, Moon, Building2,
} from 'lucide-react';
import { useAuth } from '@/contextes/ContexteAuth';
import { useGardeNav } from '@/contextes/ContexteGardeNav';

// ── Hook dark mode ────────────────────────────────────────────────────
function useModeSombre() {
  const [sombre, setSombre] = useState(
    () => document.documentElement.classList.contains('dark'),
  );

  function basculer() {
    const nouveau = !sombre;
    setSombre(nouveau);
    document.documentElement.classList.toggle('dark', nouveau);
    localStorage.setItem('theme', nouveau ? 'dark' : 'light');
  }

  // Synchronise si l'OS change de préférence.
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      if (!localStorage.getItem('theme')) {
        setSombre(e.matches);
        document.documentElement.classList.toggle('dark', e.matches);
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return { sombre, basculer };
}

// Initiales pour la pastille (1 à 2 caractères).
function initiales(nom: string | null | undefined): string {
  if (!nom) return '?';
  const mots = nom.trim().split(/\s+/);
  if (mots.length > 1) return (mots[0][0] + mots[1][0]).toUpperCase();
  return nom.slice(0, 2).toUpperCase();
}

// ── Composant ─────────────────────────────────────────────────────────
export default function Disposition({ children }: { children: ReactNode }) {
  const { utilisateur, dossier, seDeconnecter } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { tenterNavigation } = useGardeNav();
  const { sombre, basculer } = useModeSombre();
  const [sidebarOuverte, setSidebarOuverte] = useState(false);

  function naviguerAvecGarde(vers: string) {
    setSidebarOuverte(false);
    tenterNavigation(() => router.push(vers));
  }

  async function deconnexion() {
    await seDeconnecter();
    router.push('/connexion');
  }

  const estAdmin = utilisateur?.droit_admin;

  const liens = [
    { vers: '/',              libelle: 'Accueil',       Icone: Home,        visible: true },
    { vers: '/factures',      libelle: 'Factures',      Icone: FileText,    visible: estAdmin || utilisateur?.droit_consult_fac },
    { vers: '/paiements',     libelle: 'Paiements',     Icone: CreditCard,  visible: estAdmin || utilisateur?.droit_consult_paiem },
    { vers: '/clients',       libelle: 'Clients',       Icone: Users,       visible: estAdmin || utilisateur?.droit_consult_clients },
    { vers: '/envoi',         libelle: 'Envoi',         Icone: Mail,        visible: estAdmin || utilisateur?.droit_consult_fac },
  ];

  const lienClasse = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? 'bg-primaire/10 dark:bg-primaire/20 text-primaire border-l-2 border-primaire pl-[10px]'
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/60'
    }`;

  const Sidebar = () => (
    <aside className="flex flex-col h-full w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700/60">
      {/* En-tête */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-100 dark:border-gray-700/60">
        <Building2 size={22} className="text-primaire shrink-0" />
        <span className="text-xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
          Facturasso
        </span>
        {/* Fermer sur mobile */}
        <button
          onClick={() => setSidebarOuverte(false)}
          className="ml-auto lg:hidden text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X size={20} />
        </button>
      </div>

      {/* Dossier actif */}
      {dossier && (
        <div className="px-4 py-2 mx-3 mt-3 rounded-lg bg-primaire/8 dark:bg-primaire/12 text-xs text-primaire font-medium truncate">
          {dossier.nom}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 pt-3 space-y-0.5 overflow-y-auto">
        {liens.filter((l) => l.visible).map(({ vers, libelle, Icone }) => (
          <button
            key={vers}
            onClick={() => naviguerAvecGarde(vers)}
            className={'w-full ' + lienClasse({ isActive: pathname === vers || (vers !== '/' && !!pathname?.startsWith(vers)) })}
          >
            <Icone size={17} />
            {libelle}
          </button>
        ))}
      </nav>

      {/* Pied de sidebar */}
      <div className="px-3 pb-4 space-y-1 border-t border-gray-100 dark:border-gray-700/60 pt-3">
        {(estAdmin || utilisateur?.droit_config) && (
          <button
            onClick={() => naviguerAvecGarde('/configuration')}
            className={'w-full ' + lienClasse({ isActive: pathname === '/configuration' })}
          >
            <Settings size={17} />
            Configuration
          </button>
        )}

        <div className="flex items-center justify-between px-3 pt-2">
          <span className="flex items-center gap-2 min-w-0">
            <span className="shrink-0 w-7 h-7 rounded-full bg-primaire-clair dark:bg-primaire/20 text-primaire-fonce dark:text-primaire flex items-center justify-center text-[10px] font-semibold">
              {initiales(utilisateur?.nom_utilisateur)}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[100px]">
              {utilisateur?.nom_utilisateur}
            </span>
          </span>
          {/* Toggle dark mode */}
          <button
            onClick={basculer}
            title={sombre ? 'Passer en mode clair' : 'Passer en mode sombre'}
            className="p-1.5 rounded-lg text-gray-400 hover:text-primaire hover:bg-primaire/10 transition-colors"
          >
            {sombre ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>

        <button
          onClick={() => tenterNavigation(deconnexion)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <LogOut size={17} />
          Déconnexion
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">

      {/* ── Sidebar desktop (toujours visible ≥ lg) ── */}
      <div className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 z-30">
        <Sidebar />
      </div>

      {/* ── Overlay + Sidebar mobile ── */}
      {sidebarOuverte && (
        <div className="fixed inset-0 z-40 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOuverte(false)}
          />
          <div className="relative flex flex-col w-64 z-50">
            <Sidebar />
          </div>
        </div>
      )}

      {/* ── Zone principale ── */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">

        {/* Barre mobile */}
        <header className="lg:hidden sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur border-b border-gray-200 dark:border-gray-700/60">
          <button
            onClick={() => setSidebarOuverte(true)}
            className="p-1.5 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Menu size={20} />
          </button>
          <Building2 size={19} className="text-primaire" />
          <span className="text-base font-bold text-gray-800 dark:text-gray-100">Facturasso</span>
          <button
            onClick={basculer}
            className="ml-auto p-1.5 rounded-lg text-gray-400 hover:text-primaire hover:bg-primaire/10 transition-colors"
          >
            {sombre ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
