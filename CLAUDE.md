# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Web rewrite of a WinDev invoicing app for association **ACT**. The association is **TVA-exempt** — all amounts are HT (pre-tax), no VAT anywhere in the codebase. Reference screenshots of the original app are in `Captures/`, PDF examples in `Editions/`.

## Commands

Two servers must run simultaneously in development.

**Backend** (`serveur/`):
```bash
npm install
cp .env.example .env     # fill in DB credentials and JWT_SECRET
npm run creer-admin -- ADMIN motdepasse   # create first admin user
npm run dev              # starts API on http://localhost:4000 (--watch mode)
```

**Frontend** (`client/`):
```bash
npm install
npm run dev              # starts UI on http://localhost:5173
npm run build            # production build
```

No test runner is configured yet.

## Architecture

Fullstack monorepo with a clean frontend/backend split:

```
client/   React + Vite + Tailwind CSS  (port 5173)
serveur/  Node.js + Express + mysql2   (port 4000)
Database/ MariaDB schema (schema_mariadb.sql is canonical)
```

### Backend (`serveur/src/`)

Layered Express app — `routes → controleurs → modeles → config/db.js`.

- `app.js` registers middlewares and mounts the three route modules under `/api/auth`, `/api/clients`, `/api/config`.
- `index.js` tests the DB connection then starts the server.
- `middlewares/` contains JWT verification and a fine-grained rights checker (9 boolean flags per user stored in `utilisateur`).
- JSON body limit is 15 MB because logo and signature images are sent as base64.
- All env vars are in `serveur/.env` (see `.env.example`): `BDD_*`, `JWT_SECRET`, `JWT_DUREE`, `ORIGINE_CLIENT`.

### Frontend (`client/src/`)

- `main.jsx` wraps the app in `ContexteAuth` (auth state + JWT storage) and `BrowserRouter`.
- `App.jsx` defines two route groups: `/connexion` (public) and everything else inside `<RouteProtegee><Disposition>`.
- `Disposition` provides the sidebar layout for all authenticated pages.
- `services/api.js` is an Axios instance that auto-attaches the JWT and handles 401 redirects.
- Custom Tailwind color `primaire` is `#16a9bd` (cyan), defined in `tailwind.config.js`.
- Vite proxies `/api/*` to `http://localhost:4000` in dev, so the frontend never hardcodes the API URL.

## Conventions

- **All code, comments, variables, and UI text are in French.** Keep this consistent.
- Naming: `camelCase` for JS variables/functions, French words (e.g., `controleurs`, `modeles`, `composants`).
- Development is organized in numbered **lots** (see README). Lot 1 is complete; Lots 2–8 are pending.
