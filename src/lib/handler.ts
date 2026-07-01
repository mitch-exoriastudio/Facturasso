// =====================================================================
//  Enrobages des route handlers Next.
//
//  `protege`  : vérifie le JWT + un droit éventuel, établit le contexte
//               Prisma du dossier (AsyncLocalStorage), puis exécute le
//               handler. Équivalent de l'ancien `verifierJeton` Express.
//  `ouvert`   : aucune authentification, juste la gestion d'erreurs.
//
//  Toute exception est convertie en réponse JSON par `gererErreur`,
//  qui reprend la logique du gestionnaire d'erreurs central d'Express.
// =====================================================================
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { avecContexteDossier } from './prisma';
import { ErreurHttp, lireJeton, resoudreClient, exigerDroit } from './auth';
import type { JetonPayload, CleDroit } from '@/types';

// Contexte transmis par Next au route handler (le 2ᵉ argument).
export interface ContexteRoute {
  params: Promise<Record<string, string>>;
}

// Contexte enrichi transmis aux handlers protégés (utilisateur authentifié).
export interface ContexteProtege extends ContexteRoute {
  utilisateur: JetonPayload;
}

export type HandlerProtege = (
  req: NextRequest,
  ctx: ContexteProtege,
) => Promise<Response> | Response;

export type HandlerOuvert = (
  req: NextRequest,
  ctx: ContexteRoute,
) => Promise<Response> | Response;

// Libellés français des colonnes pour les erreurs de validation Prisma (P2000).
const LIBELLES_COLONNES: Record<string, string> = {
  asso_siren:                'SIREN (9 caractères max)',
  asso_siret:                'SIRET (14 caractères max)',
  asso_num_tva_intra:        'N° TVA intracommunautaire (20 caractères max)',
  asso_raison_sociale:       'Raison sociale (255 caractères max)',
  asso_statut:               'Statut juridique (100 caractères max)',
  asso_contact_nom:          'Nom du contact (100 caractères max)',
  asso_contact_prenom:       'Prénom du contact (100 caractères max)',
  asso_adresse1:             'Adresse ligne 1 (255 caractères max)',
  asso_adresse2:             'Adresse ligne 2 (255 caractères max)',
  asso_adresse3:             'Adresse ligne 3 (255 caractères max)',
  asso_code_postal:          'Code postal (10 caractères max)',
  asso_ville:                'Ville (165 caractères max)',
  asso_pays:                 'Pays (200 caractères max)',
  asso_email:                'E-mail (260 caractères max)',
  asso_email2:               'E-mail 2 (260 caractères max)',
  asso_tel:                  'Téléphone (20 caractères max)',
  asso_tel2:                 'Téléphone 2 (20 caractères max)',
  asso_naf:                  'Code NAF / APE (10 caractères max)',
  rna:                       'RNA (20 caractères max)',
  asso_autre_mention1:       'Autre mention 1 (400 caractères max)',
  asso_autre_mention2:       'Autre mention 2 (400 caractères max)',
  mention_obligatoire_fact4: 'Mention obligatoire (200 caractères max)',
  com_entete_page_factu:     'Commentaire en-tête (400 caractères max)',
  com_pied_page_factu:       'Commentaire pied de page (400 caractères max)',
  nom_client:                'Nom du client (200 caractères max)',
  prenom_client:             'Prénom du client (100 caractères max)',
  email_client:              'E-mail du client (260 caractères max)',
  telephone_client:          'Téléphone du client (20 caractères max)',
  code_postal_client:        'Code postal du client (10 caractères max)',
  ville_client:              'Ville du client (165 caractères max)',
  reference_prestation:      'Référence prestation (50 caractères max)',
  nom_prestation:            'Nom prestation (200 caractères max)',
  nom_mode_paiement:         'Nom du mode de paiement (100 caractères max)',
  abrege_mode_paiement:      'Abrégé du mode de paiement (10 caractères max)',
};

// Libellés français pour les violations d'unicité (Prisma P2002).
// La clé est recherchée par inclusion dans le nom de l'index/colonne en conflit.
const LIBELLES_UNICITE: Record<string, string> = {
  email:                'Cette adresse e-mail est déjà utilisée par un autre compte.',
  nom_utilisateur:      'Ce nom d\'utilisateur est déjà utilisé.',
  abrege_mode_paiement: 'Cet abrégé de mode de paiement est déjà utilisé.',
  reference:            'Cette référence est déjà utilisée.',
};

// Forme minimale d'une erreur Prisma connue (P2000, P2002…).
interface ErreurPrisma {
  code?: string;
  meta?: { column_name?: string; target?: unknown };
}

// Convertit une exception en réponse JSON.
export function gererErreur(err: unknown): NextResponse {
  // Erreur métier explicite (auth, droit, validation manuelle…)
  if (err instanceof ErreurHttp) {
    return NextResponse.json({ message: err.message, ...(err.extra || {}) }, { status: err.status });
  }
  const e = err as ErreurPrisma;
  // Valeur trop longue pour une colonne (Prisma P2000)
  if (e?.code === 'P2000') {
    const colonne = e.meta?.column_name ?? '';
    const libelle = LIBELLES_COLONNES[colonne] ?? `champ « ${colonne} »`;
    return NextResponse.json({ message: `La valeur saisie est trop longue pour le champ : ${libelle}.` }, { status: 400 });
  }
  // Violation de contrainte d'unicité (Prisma P2002)
  if (e?.code === 'P2002') {
    const cible = Array.isArray(e.meta?.target) ? e.meta.target.join(',') : String(e.meta?.target ?? '');
    const cle = Object.keys(LIBELLES_UNICITE).find((k) => cible.includes(k));
    return NextResponse.json(
      { message: cle ? LIBELLES_UNICITE[cle] : 'Cette valeur est déjà utilisée.' },
      { status: 409 },
    );
  }
  console.error('Erreur serveur :', err);
  return NextResponse.json({ message: 'Une erreur interne est survenue.' }, { status: 500 });
}

// Enrobe un handler protégé : JWT + droit éventuel + contexte tenant.
// `nomDroit` peut être null pour exiger seulement d'être authentifié.
export function protege(nomDroit: CleDroit | null, handler: HandlerProtege) {
  return async (req: NextRequest, ctx: ContexteRoute): Promise<Response> => {
    try {
      const payload = lireJeton(req);
      if (nomDroit) exigerDroit(payload, nomDroit);
      const client = resoudreClient(payload);
      return await avecContexteDossier(client, () =>
        Promise.resolve(handler(req, { ...ctx, utilisateur: payload })),
      );
    } catch (err) {
      return gererErreur(err);
    }
  };
}

// Enrobe un handler public : pas d'authentification, gestion d'erreurs seule.
export function ouvert(handler: HandlerOuvert) {
  return async (req: NextRequest, ctx: ContexteRoute): Promise<Response> => {
    try {
      return await handler(req, ctx);
    } catch (err) {
      return gererErreur(err);
    }
  };
}
