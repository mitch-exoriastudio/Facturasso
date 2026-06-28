/** @type {import('next').NextConfig} */
const nextConfig = {
  // Prisma embarque un moteur binaire : il doit rester hors du bundle serveur
  // pour fonctionner correctement dans les route handlers.
  serverExternalPackages: ['@prisma/client', 'prisma'],

  // Aucune configuration ESLint n'est fournie : on n'interrompt pas le build.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
