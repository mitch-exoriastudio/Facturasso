// =====================================================================
//  Typage des variables d'environnement (voir .env.example).
//  Les variables requises au démarrage sont typées `string` (non
//  optionnelles) : cela documente le contrat et évite d'avoir à gérer
//  `undefined` à chaque accès `process.env.*`.
// =====================================================================
declare namespace NodeJS {
  interface ProcessEnv {
    // ─── Base de données ───────────────────────────────────────────
    DATABASE_URL: string;

    // ─── JWT ───────────────────────────────────────────────────────
    JWT_SECRET: string;
    JWT_DUREE?: string;

    // ─── Licences Exoria ───────────────────────────────────────────
    LICENCE_DEV_BYPASS?: string;
    EXORIA_API_URL?: string;
    EXORIA_API_TOKEN?: string;
    EXORIA_LICENCE_UUID?: string;
    EXORIA_ENCRYPTION_PASSWORD?: string;

    // ─── Seed : compte superviseur ─────────────────────────────────
    SEED_SUPERVISEUR_NOM?: string;
    SEED_SUPERVISEUR_EMAIL?: string;
    SEED_SUPERVISEUR_MOT_DE_PASSE?: string;
  }
}
