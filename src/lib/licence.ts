// =====================================================================
//  Gestion des dossiers (multi-tenant) et des licences Exoria.
//
//  En mode développement (LICENCE_DEV_BYPASS=true) :
//    - Un seul dossier fictif, configuré via DATABASE_URL dans .env.
//    - Aucun appel Exoria n'est effectué.
//
//  En production :
//    - TODO lot 0e : décrypter la licence Exoria (AES-256-GCM)
//      et extraire le tableau database_accesses[].
// =====================================================================
import type { Dossier } from '@/types';

const DEV_BYPASS = process.env.LICENCE_DEV_BYPASS === 'true';

const DOSSIER_DEV: Dossier = {
  id: 'dev',
  nom: 'Dossier développement',
  database_url: process.env.DATABASE_URL,
};

// Retourne la liste des dossiers autorisés par la licence.
export function listerDossiers(): Dossier[] {
  if (DEV_BYPASS) return [DOSSIER_DEV];

  // TODO lot 0e — remplacer par la lecture Exoria :
  // const licence = await lireExoriaLicence();
  // return licence.database_accesses.map(a => ({
  //   id: a.id,
  //   nom: a.company_name,
  //   database_url: `mysql://${a.db_user}:${a.db_password}@${a.db_host}:${a.db_port}/${a.db_name}`,
  // }));
  throw new Error('Mode production Exoria non encore implémenté (lot 0e).');
}

// Retourne un dossier par son identifiant, ou null s'il est introuvable.
export function trouverDossier(id: string): Dossier | null {
  if (DEV_BYPASS) {
    return id === 'dev' ? DOSSIER_DEV : null;
  }
  const dossiers = listerDossiers();
  return dossiers.find((d) => d.id === id) ?? null;
}

// ─── Gestion des seats Exoria ─────────────────────────────────────────────────
// En mode bypass, toutes ces fonctions sont des no-ops silencieux.
// En production (lot 0e complet), elles appelleront l'API Exoria.

// Appelé à la connexion : acquiert un seat dans Exoria.
// Retourne un sessionToken Exoria (null en bypass).
export async function acquirirSeat(
  dossierId: string,
  identifiantUtilisateur: string,
  ipAddress: string,
): Promise<string | null> {
  if (DEV_BYPASS) return null;
  // TODO lot 0e prod :
  // POST {EXORIA_API_URL}/seat/acquire
  //   { licenceUuid, userIdentifier, deviceType: 'web', ipAddress }
  // → { sessionToken }
  throw new Error('Exoria seat acquire non implémenté (lot 0e).');
}

// Appelé périodiquement par le client pour maintenir le seat actif.
// Retourne { valid, revoked } (toujours { valid: true, revoked: false } en bypass).
export async function heartbeatSeat(
  exoriaSessionToken: string | null,
): Promise<{ valid: boolean; revoked: boolean }> {
  if (DEV_BYPASS || !exoriaSessionToken) return { valid: true, revoked: false };
  // TODO lot 0e prod :
  // POST {EXORIA_API_URL}/seat/heartbeat { sessionToken }
  // → { valid, revoked }
  throw new Error('Exoria seat heartbeat non implémenté (lot 0e).');
}

// Appelé à la déconnexion : libère le seat dans Exoria.
export async function releaserSeat(exoriaSessionToken: string | null): Promise<void> {
  if (DEV_BYPASS || !exoriaSessionToken) return;
  // TODO lot 0e prod :
  // POST {EXORIA_API_URL}/seat/release { sessionToken }
  throw new Error('Exoria seat release non implémenté (lot 0e).');
}
