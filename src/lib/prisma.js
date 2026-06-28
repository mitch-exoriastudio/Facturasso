// =====================================================================
//  Client Prisma — accès multi-tenant via AsyncLocalStorage.
//
//  Le Proxy `prisma` délègue automatiquement vers le client du dossier
//  actif dans la requête HTTP courante (via AsyncLocalStorage).
//  Hors contexte de requête (seed, scripts), il utilise le client global.
// =====================================================================
import { PrismaClient } from '@prisma/client';
import { AsyncLocalStorage } from 'async_hooks';

// En développement, Next recharge les modules à chaud (HMR) : sans précaution,
// chaque rechargement créerait de nouveaux PrismaClient et épuiserait les
// connexions. On mémorise donc le client global et le pool sur globalThis.
const _g = globalThis;

// Client global : utilisé pour le seed, les scripts et le healthcheck.
const _globalClient = _g.__prismaGlobal ?? (_g.__prismaGlobal = new PrismaClient());

// Pool des clients par DATABASE_URL — une instance par dossier.
const _pool = _g.__prismaPool ?? (_g.__prismaPool = new Map());

// Stockage du client actif pour la requête HTTP courante.
const _storage = _g.__prismaStorage ?? (_g.__prismaStorage = new AsyncLocalStorage());

// Crée ou récupère un PrismaClient pour une DATABASE_URL donnée.
export function getDossierClient(databaseUrl) {
  if (!_pool.has(databaseUrl)) {
    _pool.set(databaseUrl, new PrismaClient({ datasources: { db: { url: databaseUrl } } }));
  }
  return _pool.get(databaseUrl);
}

// Exécute une callback dans le contexte du client du dossier sélectionné.
export function avecContexteDossier(client, callback) {
  return _storage.run(client, callback);
}

// Proxy transparent : renvoie le client du dossier courant,
// ou le client global si aucun contexte n'est défini (hors requête).
export const prisma = new Proxy(_globalClient, {
  get(target, prop) {
    const client = _storage.getStore() ?? target;
    const value = client[prop];
    return typeof value === 'function' ? value.bind(client) : value;
  },
});

// Vérifie que la base est joignable (appelé au démarrage du serveur).
export async function testerConnexion() {
  await _globalClient.$queryRaw`SELECT 1`;
}

// Convertit récursivement les objets Decimal de Prisma en nombres JS.
export function dec(val) {
  if (val === null || val === undefined) return val;
  if (typeof val.toNumber === 'function') return val.toNumber();
  if (val instanceof Date) return val;
  if (Array.isArray(val)) return val.map(dec);
  if (typeof val === 'object') {
    return Object.fromEntries(Object.entries(val).map(([k, v]) => [k, dec(v)]));
  }
  return val;
}
