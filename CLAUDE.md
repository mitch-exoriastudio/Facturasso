# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Réécriture web d'une application de facturation WinDev pour des associations (multi-tenant). Chaque dossier correspond à une association distincte avec sa propre base **MariaDB**. Les accès aux dossiers sont contrôlés par la licence **Exoria** (bypass en mode DEV via `LICENCE_DEV_BYPASS=true`).

La TVA est **optionnelle** : activée par dossier via `parametre_general.tva_active`. Si inactif, tous les montants sont en HT (comportement par défaut pour les associations exonérées). Référence captures : `Captures/`, exemples PDF : `Editions/`.

## Commands

Stack **unifiée Next.js** : front et back dans un seul projet, un seul `package.json` à la racine, un seul serveur (`npm run dev`, port **3000**). Pas de `concurrently`, pas de sous-projets `client/`/`serveur/`.

```bash
npm install                               # installe tout + génère le client Prisma (postinstall)
cp .env.example .env                      # renseigner DATABASE_URL et JWT_SECRET
npm run db:migrate:dev                    # applique les migrations Prisma
npm run creer-admin -- ADMIN motdepasse   # crée le 1er compte admin
npm run dev                               # front + API sur http://localhost:3000
npm run build                             # build de production (prisma generate + next build)
npm start                                 # démarre le build de production
npm run typecheck                         # vérification TypeScript (tsc --noEmit)
```

No test runner is configured yet.

Le projet est écrit en **TypeScript** (`strict: true`). Seuls les scripts lancés par `node` restent en JavaScript : `scripts/creer-admin.js` et `prisma/seed.js` (voir section TypeScript).

## Architecture

Projet **Next.js (App Router) unifié** — React + route handlers + Prisma dans une seule arborescence `src/` :

```
src/app/         Pages (App Router, .tsx) + route handlers API (.ts) sous src/app/api/
src/lib/         Code serveur (.ts) : prisma (proxy multi-tenant), licence, auth, handler, modeles/
src/composants/  Composants React réutilisables (.tsx, 'use client')
src/vues/        Composants de page (Accueil, Clients, Configuration, Connexion)
src/contextes/   Contextes React (auth, garde de navigation)
src/services/    Client Axios + services d'appel API
src/types/       Types partagés (@/types) + déclarations ambiantes (env.d.ts, assets.d.ts)
prisma/          schema.prisma (canonique) + migrations MariaDB + seed.js
scripts/         creer-admin.js
```

> ⚠️ Le dossier de pages s'appelle `src/vues/` (pas `src/pages/`) : `src/pages/` activerait le Pages Router de Next, en conflit avec l'App Router.

### Backend — route handlers (`src/app/api/`) + `src/lib/`

Architecture en couches — `route.ts (route + contrôleur) → lib/modeles → lib/prisma`.

- Chaque endpoint est un `route.ts` exportant `GET`/`POST`/`PUT`/`PATCH`/`DELETE`. Domaines : `/api/auth`, `/api/public`, `/api/clients`, `/api/config` (+ `/api/sante`).
- `src/lib/handler.ts` fournit `protege(droit, handler)` et `ouvert(handler)` — équivalents de l'ancien middleware Express. `protege` vérifie le JWT, le droit éventuel, établit le contexte Prisma du dossier (AsyncLocalStorage), et centralise la gestion d'erreurs (P2000 → libellé de colonne, etc.). Il expose les types `ContexteProtege`/`ContexteRoute` (le `ctx` des handlers, avec `params: Promise<...>`).
- `src/lib/auth.ts` : lecture/vérif du JWT (en-tête `Authorization: Bearer`), résolution du dossier, contrôle des 9 droits fins. L'admin (`droit_admin`) passe toujours. Le payload JWT est typé `JetonPayload` (`@/types`).
- **Connexion par e-mail** : l'identifiant de connexion est l'**adresse e-mail** (`utilisateur.email`, unique par dossier), pas le `nom_utilisateur`. Le `nom_utilisateur` reste le libellé d'affichage et la valeur de traçabilité (`utilisateur_creation` / `utilisateur_modification`). L'e-mail est obligatoire à la création/modification d'un compte ; `utilisateur.telephone` (mobile) est prévu pour la future double authentification OTP SMS (Lot 9). `creer-admin` exige donc un e-mail : `npm run creer-admin -- <nom> <email> <motDePasse>`.
- `src/lib/licence.ts` : logique Exoria (seats, heartbeat, release). En mode DEV (`LICENCE_DEV_BYPASS=true`), tous les accès sont autorisés sans appel Exoria.
- Les route handlers tournent en runtime Node (défaut) ; pas de limite de taille de corps gênante pour les images logo/signature en base64.
- Variables d'env dans `.env` racine (chargé automatiquement par Next) : `DATABASE_URL`, `JWT_SECRET`, `JWT_DUREE`, `LICENCE_DEV_BYPASS`, `EXORIA_*`.

### Multi-tenant (Dossiers)

- Chaque dossier = une base MariaDB distincte avec ses propres credentials.
- Les credentials de dossier viennent de la licence Exoria décryptée (`database_accesses[]`).
- À la connexion, l'utilisateur choisit un dossier → encodé dans le JWT (`dossier_id`).
- Un `PrismaClient` est instancié dynamiquement par dossier (pool par clé `DATABASE_URL`, dans `src/lib/prisma.ts`). Le proxy `prisma` délègue vers le client du dossier courant via **AsyncLocalStorage** ; `protege` exécute chaque handler dans `avecContexteDossier(...)` → **les modèles n'ont pas connaissance du tenant**.
- En mode DEV bypass, un dossier fictif configuré dans `.env` est utilisé.

### Frontend (App Router)

- `src/app/layout.tsx` : layout racine (html/body), script anti-clignotement du dark mode, enveloppe l'app dans `src/app/providers.tsx` (`FournisseurGardeNav` + `FournisseurAuth` + `FournisseurToast`).
- Groupe de routes `(protege)/` : `src/app/(protege)/layout.tsx` applique `RouteProtegee` + `Disposition` (sidebar) à toutes les pages authentifiées. `/connexion` est hors du groupe (page publique).
- Navigation via `next/navigation` (`useRouter`, `usePathname`). L'auth reste en **localStorage + jeton Bearer** ; `RouteProtegee` attend le drapeau `pret` (session lue côté navigateur) avant de rediriger, pour éviter toute incohérence d'hydratation. Les hooks de contexte (`useAuth`, `useGardeNav`, `useToast`) **lèvent une erreur si utilisés hors de leur fournisseur**.
- `src/services/api.ts` : instance Axios (`baseURL: '/api'`, même origine) qui attache le JWT et gère les redirections 401.
- Couleur Tailwind custom `primaire` : `#16a9bd` (cyan), définie dans `tailwind.config.js`.
- **Icônes** : Lucide React.
- **Dark mode** : détection OS (`prefers-color-scheme`) + toggle manuel (stocké en `localStorage`). Géré via la classe `dark` sur `<html>` (stratégie Tailwind `class`).
- **Anti-autofill (`src/composants/ChampSansAutofill.tsx`)** : Chrome/Firefox ignorent volontairement `autocomplete="off"` pour les adresses et proposent « Enregistrer l'adresse ? » sur les fiches client / config. Ces champs concernent des **tiers**, pas l'utilisateur. `ChampSansAutofill` est un drop-in de `<input>` qui passe le champ en `readOnly` tant qu'il n'a pas le focus (déverrouillé au 1er focus) → le navigateur ne le classe plus comme adresse enregistrable, sans gêner la saisie. Utilisé dans `FicheClient`, `ChampAutoVille` et l'onglet Mentions (composant `Champ`). **Ne pas l'utiliser sur `Connexion.tsx`** : l'enregistrement de l'identifiant y est conservé (`autoComplete="username"`/`"current-password"`).

### TVA

- Activée par dossier : `parametre_general.tva_active` (boolean, défaut `false`).
- Taux TVA configurables dans `taux_tva` (20%, 10%, 5.5%, 0%, taux personnalisé).
- Lignes de facture : `taux_tva_id`, `montant_ht`, `montant_tva`, `montant_ttc`.
- Totaux facture : `total_ht`, `total_tva`, `total_ttc` (affichage conditionnel si TVA inactive).
- Si `tva_active = false` : aucune colonne TVA n'est affichée, comportement identique à l'original.

### TypeScript

- Config `tsconfig.json` en mode **`strict`**, `moduleResolution: "bundler"`, alias `@/* → src/*`. Vérification : `npm run typecheck` (`tsc --noEmit`) ; le `next build` type-check aussi.
- **Imports sans extension** (`@/lib/handler`, `./api`) — résolus par Next/bundler. Ne pas remettre de `.js`/`.ts`.
- **Types partagés dans `@/types`** (`src/types/index.ts`) : `Droits`, `CleDroit`, `JetonPayload`, `Dossier`, `SessionDossier`/`SessionUtilisateur`, `Ville`, `ClientListe`, `UtilisateurConfig`. Les types d'entrée des modèles (`DonneesClient`, `DonneesParametres`, `DonneesUtilisateur`, `DonneesPrestation`, `DonneesModePaiement`, `DonneesEmailConfig`) sont exportés depuis leurs fichiers `lib/modeles/*`.
- **Types Prisma** : importer `Prisma`/les modèles depuis `@prisma/client` (ex. `Prisma.ClientWhereInput`, `ParametreGeneral`) plutôt que de retyper à la main.
- Déclarations ambiantes : `src/types/env.d.ts` (variables d'env requises typées `string`) et `src/types/assets.d.ts` (imports `*.css`).
- **Scripts en JavaScript** : `scripts/creer-admin.js` et `prisma/seed.js` restent en `.js` (lancés directement par `node`, sans loader TS ; ils n'importent que `@prisma/client`/`bcryptjs`).

## Conventions

- **Tout le code, les commentaires, les variables et les textes UI sont en français.** Maintenir cette cohérence.
- Nommage : `camelCase` pour les variables/fonctions JS/TS, mots français (ex. `controleurs`, `modeles`, `composants`).
- Le développement est organisé en **lots** numérotés (voir README). Lots 0 et 2 terminés. Lot 3 (Configuration) est la prochaine étape.
