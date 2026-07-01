// =====================================================================
//  Authentification & contrôle des droits (côté route handlers Next).
//
//  Remplace l'ancien middleware Express `verifierJeton` / `exigerDroit`.
//  Le jeton JWT est toujours transmis dans l'en-tête `Authorization`.
// =====================================================================
import jwt from 'jsonwebtoken';
import type { PrismaClient } from '@prisma/client';
import { getDossierClient } from './prisma';
import { trouverDossier } from './licence';
import type { JetonPayload, CleDroit } from '@/types';

// Erreur HTTP « métier » : interceptée par le wrapper et convertie en réponse.
export class ErreurHttp extends Error {
  status: number;
  extra: Record<string, unknown> | null;

  constructor(status: number, message: string, extra: Record<string, unknown> | null = null) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}

// Lit et vérifie le jeton JWT de la requête. Renvoie le payload décodé.
export function lireJeton(req: Request): JetonPayload {
  const entete = req.headers.get('authorization') || '';
  const jeton = entete.startsWith('Bearer ') ? entete.slice(7) : null;

  if (!jeton) {
    throw new ErreurHttp(401, 'Non authentifié.');
  }

  try {
    return jwt.verify(jeton, process.env.JWT_SECRET) as JetonPayload;
  } catch {
    throw new ErreurHttp(401, 'Session expirée ou invalide.');
  }
}

// Résout le PrismaClient du dossier porté par le jeton.
export function resoudreClient(payload: JetonPayload): PrismaClient {
  const dossier = trouverDossier(payload.dossier_id);
  if (!dossier) {
    throw new ErreurHttp(401, 'Dossier de session introuvable ou révoqué.');
  }
  return getDossierClient(dossier.database_url);
}

// Vérifie qu'un droit précis est présent. L'administrateur passe toujours.
export function exigerDroit(payload: JetonPayload, nomDroit: CleDroit): void {
  if (payload && (payload.droit_admin || payload[nomDroit])) return;
  throw new ErreurHttp(403, 'Droit insuffisant pour cette action.');
}

// Vérifie strictement le compte superviseur (aucun bypass admin).
// Réservé aux options superviseur.
export function exigerSuperviseur(payload: JetonPayload): void {
  if (payload && payload.compte_superviseur) return;
  throw new ErreurHttp(403, 'Action réservée au compte superviseur.');
}
