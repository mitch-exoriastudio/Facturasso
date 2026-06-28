// =====================================================================
//  Layout racine de l'application (App Router).
//  Définit <html>/<body>, le thème anti-clignotement et les fournisseurs
//  de contexte (auth + garde de navigation).
// =====================================================================
import './globals.css';
import { Providers } from './providers.jsx';

export const metadata = {
  title: 'Facturasso',
  description: 'Gestion de la facturation pour associations',
};

// Applique le mode sombre AVANT le rendu React pour éviter le clignotement.
const SCRIPT_THEME = `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark');}}catch(e){}})();`;

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: SCRIPT_THEME }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
