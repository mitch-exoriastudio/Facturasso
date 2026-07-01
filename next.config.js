/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prisma embarque un moteur binaire : il doit rester hors du bundle serveur
  // pour fonctionner correctement dans les route handlers.
  serverExternalPackages: ['@prisma/client', 'prisma'],

  // Hébergement mutualisé (o2switch, LVE CloudLinux) : le quota de
  // processus/threads du compte est bien plus bas que ce que `ulimit -u`
  // affiche. Chaque worker de build ouvre en plus son propre pool de threads
  // Rust (SWC) dimensionné sur les CPU physiques de la machine hôte — d'où
  // "pthread_create: Resource temporarily unavailable" en cas de valeur trop
  // haute. On limite le nombre de workers Next ici, et le pool Rust par
  // worker via RAYON_NUM_THREADS=1 au moment du build (voir script
  // `build:passenger`).
  experimental: {
    cpus: 2,
  },

  // Aucune configuration ESLint n'est fournie : on n'interrompt pas le build.
  eslint: {
    ignoreDuringBuilds: true,
  },

  // En développement uniquement : on interdit toute mise en cache navigateur
  // pour que les modifications apparaissent sans avoir à faire CTRL+F5.
  // (En production, on laisse Next.js gérer son cache normal d'assets hashés.)
  async headers() {
    if (process.env.NODE_ENV !== 'development') return [];
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cache-Control', value: 'no-store, must-revalidate' },
        ],
      },
    ];
  },
};

export default nextConfig;
