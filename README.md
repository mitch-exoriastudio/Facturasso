# Facturasso — version web

Réécriture web d'une application de facturation WinDev pour des **associations** (multi-tenant).

- **Front-end** : React + Vite + Tailwind CSS (dossier `client/`)
- **Back-end** : Node.js + Express + Prisma (dossier `serveur/`)
- **Base de données** : MariaDB / MySQL — schéma géré via Prisma (`serveur/prisma/schema.prisma`)

> La TVA est **optionnelle** par dossier (`tva_active` dans `parametre_general`). Par défaut, tous les montants sont en HT (pour les associations exonérées de TVA).

---

## Prérequis (à installer une seule fois)

1. **Node.js LTS** (v20 ou v22) : https://nodejs.org
2. **MariaDB / MySQL** en local. Le plus simple sous Windows : **Laragon** ou **XAMPP**
   (incluent MariaDB + phpMyAdmin pour visualiser les bases).

---

## Mise en route (développement)

### 1. Configurer le backend

```bash
cd serveur
npm install
cp .env.example .env      # adapter les identifiants DB et JWT_SECRET
                           # mettre LICENCE_DEV_BYPASS=true pour bypasser Exoria en dev
```

### 2. Initialiser la base de données

```bash
# Crée la base et applique les migrations Prisma
npx prisma migrate dev --name init

# Créer le 1er compte administrateur
npm run creer-admin -- ADMIN motdepasse
```

### 3. Démarrer le serveur (API)

```bash
npm run dev               # démarre l'API sur http://localhost:4000
```

### 4. Démarrer le client (interface)

Dans un **second** terminal :

```bash
cd client
npm install
npm run dev               # démarre l'interface sur http://localhost:5173
```

Ouvrir http://localhost:5173 et se connecter avec le compte créé à l'étape 2.

---

## Avancement (développement par lots)

- [x] **Lot 1 — Fondations initiales** : schéma BDD, serveur Express, auth JWT + droits, page de connexion, disposition générale. *(absorbé par Lot 0)*
- [ ] **Lot 0 — Refonte des fondations** *(en cours)*
  - [x] 0a — Prisma ORM + migrations (remplace mysql2 + schema SQL manuel)
  - [ ] 0b — Schéma étendu (champs TVA, identité facture : `client_*`, `asso_*`)
  - [ ] 0c — Support TVA optionnel (taux configurables, calculs HT/TVA/TTC)
  - [ ] 0d — Multi-tenant Dossiers (login 2 étapes, PrismaClient dynamique par dossier)
  - [ ] 0e — Licences Exoria (seats concurrents, heartbeat, release ; bypass DEV)
  - [ ] 0f — Modernisation UI (Lucide React, responsive, dark mode auto + toggle)
- [ ] **Lot 2 — Clients** : liste, fiche, archivage, auto-complétion ville.
- [ ] **Lot 3 — Configuration** : 6 onglets, dont TVA et champs association.
- [ ] **Lot 4 — Factures / Brouillons** : lignes TVA, calculs conditionnels, champs identité figés.
- [ ] **Lot 5 — Paiements**.
- [ ] **Lot 6 — Génération PDF** : mentions TVA conditionnelles, structure Factur-X.
- [ ] **Lot 7 — Envoi d'e-mails** : unitaire + en masse.
- [ ] **Lot 8 — Facturation électronique** : Factur-X / UBL 2.1, conformité PPF/PDP (obligation 2026), tableau de bord, déploiement o2switch.

---

## Structure du projet

```
Facturasso/
├── client/      Front-end React (Vite + Tailwind + Lucide React)
├── serveur/     Back-end Node/Express
│   └── prisma/  Schema Prisma + migrations MariaDB
├── Captures/    Captures d'écran de l'application d'origine
└── Editions/    Exemples de PDF (brouillon, facture à payer, acquittée)
```

---

## Licences (Exoria)

En production, les accès aux dossiers sont contrôlés par l'API **Exoria** (seats concurrents : acquire à la connexion, heartbeat périodique, release à la déconnexion).

En développement, positionner `LICENCE_DEV_BYPASS=true` dans `serveur/.env` pour bypasser Exoria et utiliser un dossier local directement.
