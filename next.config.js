/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prisma embarque un moteur binaire : il doit rester hors du bundle serveur
  // pour fonctionner correctement dans les route handlers.
  serverExternalPackages: ['@prisma/client', 'prisma'],

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
