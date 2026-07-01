// =====================================================================
//  Types partagés du domaine (auth, session, multi-tenant).
//  Utilisés côté serveur (lib, route handlers) et côté client (contextes).
// =====================================================================

// ─── Droits d'un utilisateur ───────────────────────────────────────────
// Correspond à l'objet construit par `extraireDroits` (route de connexion)
// et renvoyé au front. Les booléens reprennent les 9 droits fins + le
// statut administrateur / superviseur.
export interface Droits {
  id_utilisateur: number;
  nom_utilisateur: string;
  email: string | null;
  droit_admin: boolean;
  compte_superviseur: boolean;
  droit_consult_fac: boolean;
  droit_ajout_fac: boolean;
  droit_consult_paiem: boolean;
  droit_ajout_paiem: boolean;
  droit_consult_clients: boolean;
  droit_ajout_clients: boolean;
  droit_config: boolean;
}

// Clés de `Droits` dont la valeur est un booléen : ce sont les seuls droits
// exigibles via `exigerDroit(payload, nomDroit)`.
export type CleDroit = {
  [K in keyof Droits]: Droits[K] extends boolean ? K : never;
}[keyof Droits];

// ─── Jeton JWT ─────────────────────────────────────────────────────────
// Contenu du JWT : les droits + le dossier sélectionné à la connexion.
// `iat` / `exp` sont ajoutés par la bibliothèque jsonwebtoken.
export interface JetonPayload extends Droits {
  dossier_id: string;
  dossier_nom: string;
  // Jeton de session Exoria (seat) — présent uniquement en mode production
  // licence (lot 0e). Absent en mode DEV bypass.
  exoria_session_token?: string | null;
  iat?: number;
  exp?: number;
}

// ─── Multi-tenant ──────────────────────────────────────────────────────
// Dossier tel que résolu depuis la licence Exoria (ou le dossier de dev).
export interface Dossier {
  id: string;
  nom: string;
  database_url: string;
}

// Dossier tel qu'exposé au front (sans les credentials de base).
export interface SessionDossier {
  id: string;
  nom: string;
}

// Session utilisateur côté client : identique aux droits renvoyés par l'API.
export type SessionUtilisateur = Droits;

// ─── Divers ────────────────────────────────────────────────────────────
// Ligne de ville renvoyée par l'auto-complétion (code postal / ville).
export interface Ville {
  code_postal: string;
  nom_ville: string;
}

// Utilisateur tel que renvoyé par la config (cf. select `CHAMPS_UTILISATEUR`).
export interface UtilisateurConfig {
  id_utilisateur: number;
  nom_utilisateur: string;
  email: string | null;
  telephone: string | null;
  droit_admin: boolean;
  compte_desactive: boolean;
  compte_superviseur: boolean;
  droit_consult_fac: boolean;
  droit_ajout_fac: boolean;
  droit_consult_paiem: boolean;
  droit_ajout_paiem: boolean;
  droit_consult_clients: boolean;
  droit_ajout_clients: boolean;
  droit_config: boolean;
}

// Ligne de client renvoyée par la liste (cf. select de `listerClients`).
export interface ClientListe {
  id_client: number;
  civilite: string | null;
  nom: string | null;
  prenom: string | null;
  adresse1: string | null;
  adresse2: string | null;
  adresse3: string | null;
  code_postal: string | null;
  ville: string | null;
  telephone: string | null;
  mobile: string | null;
  email: string | null;
  archive: boolean;
}
