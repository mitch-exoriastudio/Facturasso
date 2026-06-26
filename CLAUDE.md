# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Réécriture web d'une application de facturation WinDev pour des associations (multi-tenant). Chaque dossier correspond à une association distincte avec sa propre base **MariaDB**. Les accès aux dossiers sont contrôlés par la licence **Exoria** (bypass en mode DEV via `LICENCE_DEV_BYPASS=true`).

La TVA est **optionnelle** : activée par dossier via `parametre_general.tva_active`. Si inactif, tous les montants sont en HT (comportement par défaut pour les associations exonérées). Référence captures : `Captures/`, exemples PDF : `Editions/`.

## Commands

Two servers must run simultaneously in development.

**Backend** (`serveur/`):
```bash
npm install
cp .env.example .env          # renseigner les identifiants DB et JWT_SECRET
npx prisma migrate dev        # appliquer les migrations sur la base principale
npm run creer-admin -- ADMIN motdepasse   # créer le 1er compte admin
npm run dev                   # démarre l'API sur http://localhost:4000 (--watch)
```

**Frontend** (`client/`):
```bash
npm install
npm run dev              # démarre l'UI sur http://localhost:5173
npm run build            # build de production
```

No test runner is configured yet.

## Architecture

Fullstack monorepo avec séparation franche frontend/backend :

```
client/   React + Vite + Tailwind CSS  (port 5173)
serveur/  Node.js + Express + Prisma   (port 4000)
Database/ MariaDB — schéma géré via Prisma (prisma/schema.prisma est canonique)
```

### Backend (`serveur/src/`)

Architecture en couches — `routes → controleurs → modeles → prisma/`.

- `app.js` enregistre les middlewares et monte les modules de routes sous `/api/auth`, `/api/public`, `/api/clients`, `/api/config`, `/api/factures`, `/api/paiements`.
- `index.js` teste la connexion DB puis démarre le serveur.
- `middlewares/` contient la vérification JWT, un vérificateur de droits fins (9 flags booléens par utilisateur dans `utilisateur`), et le middleware multi-tenant (sélection du PrismaClient par session/dossier).
- `licence/` contient la logique Exoria : décryptage AES-256-GCM, quota de seats concurrents, heartbeat, release. En mode DEV (`LICENCE_DEV_BYPASS=true`), tous les accès sont autorisés sans appel Exoria.
- JSON body limit est 15 MB (images logo/signature en base64).
- Toutes les variables d'env sont dans `serveur/.env` (voir `.env.example`) : `DATABASE_URL`, `JWT_SECRET`, `JWT_DUREE`, `ORIGINE_CLIENT`, `LICENCE_DEV_BYPASS`, `EXORIA_API_URL`, `EXORIA_API_TOKEN`, `EXORIA_LICENCE_UUID`, `EXORIA_ENCRYPTION_PASSWORD`.

### Multi-tenant (Dossiers)

- Chaque dossier = une base MariaDB distincte avec ses propres credentials.
- Les credentials de dossier viennent de la licence Exoria décryptée (`database_accesses[]`).
- À la connexion, l'utilisateur choisit un dossier → credentials stockés en session.
- Un `PrismaClient` est instancié dynamiquement par dossier (pool par clé `host:port:db:user`).
- Les migrations Prisma sont appliquées automatiquement à la première sélection d'un dossier.
- En mode DEV bypass, un dossier fictif configuré dans `.env` est utilisé.

### Frontend (`client/src/`)

- `main.jsx` enveloppe l'app dans `ContexteAuth` (état auth + JWT storage) et `BrowserRouter`.
- `App.jsx` définit deux groupes de routes : `/connexion` (public) et tout le reste dans `<RouteProtegee><Disposition>`.
- `Disposition` fournit le layout sidebar pour toutes les pages authentifiées.
- `services/api.js` est une instance Axios qui attache automatiquement le JWT et gère les redirections 401.
- Couleur Tailwind custom `primaire` : `#16a9bd` (cyan), définie dans `tailwind.config.js`.
- Vite proxie `/api/*` vers `http://localhost:4000` en dev.
- **Icônes** : Lucide React.
- **Dark mode** : détection OS (`prefers-color-scheme`) + toggle manuel (stocké en `localStorage`). Géré via la classe `dark` sur `<html>` (stratégie Tailwind `class`).

### TVA

- Activée par dossier : `parametre_general.tva_active` (boolean, défaut `false`).
- Taux TVA configurables dans `taux_tva` (20%, 10%, 5.5%, 0%, taux personnalisé).
- Lignes de facture : `taux_tva_id`, `montant_ht`, `montant_tva`, `montant_ttc`.
- Totaux facture : `total_ht`, `total_tva`, `total_ttc` (affichage conditionnel si TVA inactive).
- Si `tva_active = false` : aucune colonne TVA n'est affichée, comportement identique à l'original.

## Conventions

- **Tout le code, les commentaires, les variables et les textes UI sont en français.** Maintenir cette cohérence.
- Nommage : `camelCase` pour les variables/fonctions JS, mots français (ex. `controleurs`, `modeles`, `composants`).
- Le développement est organisé en **lots** numérotés (voir README). Lot 0 est en cours ; Lot 1 (fondations initiales) est terminé mais sera absorbé/remplacé par Lot 0.
