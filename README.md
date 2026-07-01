# Facturasso — version web

Réécriture web d'une application de facturation WinDev pour des **associations** (multi-tenant).

Stack **unifiée Next.js** : front-end et back-end dans un seul projet, un seul `package.json`, un seul serveur.

- **Langage** : TypeScript (mode `strict`) — vérification via `npm run typecheck`
- **Framework** : Next.js (App Router) + React + Tailwind CSS
- **API** : route handlers Next.js (`src/app/api/`) + Prisma
- **Base de données** : MariaDB / MySQL — schéma géré via Prisma (`prisma/schema.prisma`)

> La TVA est **optionnelle** par dossier (`tva_active` dans `parametre_general`). Par défaut, tous les montants sont en HT (pour les associations exonérées de TVA).

---

## Prérequis (à installer une seule fois)

1. **Node.js LTS** (v20 ou v22) : https://nodejs.org
2. **MariaDB / MySQL** en local. Le plus simple sous Windows : **Laragon** ou **XAMPP**
   (incluent MariaDB + phpMyAdmin pour visualiser les bases).

---

## Mise en route (développement)

### 1. Installer et configurer

```bash
npm install               # installe tout + génère le client Prisma
cp .env.example .env      # adapter DATABASE_URL et JWT_SECRET
                          # LICENCE_DEV_BYPASS=true pour bypasser Exoria en dev
```

### 2. Initialiser la base de données

```bash
npm run db:migrate:dev    # crée la base et applique les migrations Prisma
npm run creer-admin -- ADMIN admin@asso.fr motdepasse   # crée le 1er compte administrateur (connexion par e-mail)
```

### 3. Démarrer l'application

```bash
npm run dev               # front + API sur http://localhost:3000
```

Ouvrir http://localhost:3000 et se connecter avec le compte créé à l'étape 2.

> Build de production : `npm run build` puis `npm start`.

---

## Avancement (développement par lots)

- [x] **Lot 1 — Fondations initiales** : schéma BDD, serveur Express, auth JWT + droits, page de connexion, disposition générale. *(absorbé par Lot 0)*
- [x] **Lot 0 — Refonte des fondations**
  - [x] 0a — Prisma ORM + migrations (remplace mysql2 + schema SQL manuel)
  - [x] 0b — Schéma étendu (champs TVA, identité facture : `client_*`, `asso_*`)
  - [x] 0c — Support TVA optionnel (taux configurables, calculs HT/TVA/TTC)
  - [x] 0d — Multi-tenant Dossiers (login 2 étapes, PrismaClient dynamique par dossier)
  - [x] 0e — Licences Exoria (seats concurrents, heartbeat, release ; bypass DEV)
  - [x] 0f — Modernisation UI (Lucide React, responsive, dark mode auto + toggle)
- [x] **Lot 2 — Clients** : liste, fiche, archivage, auto-complétion ville.
- [ ] **Lot 3 — Configuration** : 6 onglets, dont TVA et champs association.
- [ ] **Lot 4 — Factures / Brouillons** : lignes TVA, calculs conditionnels, champs identité figés.
- [ ] **Lot 5 — Paiements**.
- [ ] **Lot 6 — Génération PDF** : mentions TVA conditionnelles, structure Factur-X.
- [ ] **Lot 7 — Envoi d'e-mails** : unitaire + en masse.
- [ ] **Lot 8 — Facturation électronique** : Factur-X / UBL 2.1, conformité PPF/PDP (obligation 2026), tableau de bord, déploiement o2switch.
- [ ] **Lot 9 — Double authentification par OTP SMS** : second facteur sur les **nouveaux postes** ou les postes **inactifs depuis longtemps**.
  - Identifiant de connexion = adresse e-mail ; le numéro de téléphone (mobile) du compte sert de destinataire de l'OTP. *(champs `utilisateur.email` / `utilisateur.telephone` déjà en base — voir migration `utilisateur_email_telephone`.)*
  - Empreinte d'appareil « connu » (cookie/token signé + table `appareil_connu` : `id_utilisateur`, empreinte, libellé, `derniere_connexion`).
  - Déclenchement de l'OTP si : appareil inconnu **ou** dernière connexion de cet appareil > seuil configurable (ex. 30 jours).
  - Génération d'un code à usage unique (durée de vie courte, nombre d'essais limité, anti-bruteforce), envoi via une passerelle SMS (fournisseur à choisir, ex. OVH SMS / Twilio / Brevo), puis validation et enregistrement de l'appareil.
  - Paramétrage par dossier (activation, seuil d'inactivité) et secret/identifiants de la passerelle SMS côté serveur (`.env`).

---

## Structure du projet

```
Facturasso/
├── src/
│   ├── app/         Pages (App Router) + route handlers API (src/app/api/)
│   ├── lib/         Code serveur : prisma, licence, auth, handler, modeles/
│   ├── composants/  Composants React réutilisables
│   ├── vues/        Composants de page (Accueil, Clients, Configuration, Connexion)
│   ├── contextes/   Contextes React (auth, garde de navigation)
│   └── services/    Client Axios + services d'appel API
├── prisma/      Schema Prisma + migrations MariaDB + seed
├── scripts/     Scripts utilitaires (creer-admin)
├── Captures/    Captures d'écran de l'application d'origine
└── Editions/    Exemples de PDF (brouillon, facture à payer, acquittée)
```

---

## Licences (Exoria)

En production, les accès aux dossiers sont contrôlés par l'API **Exoria** (seats concurrents : acquire à la connexion, heartbeat périodique, release à la déconnexion).

En développement, positionner `LICENCE_DEV_BYPASS=true` dans `.env` (racine) pour bypasser Exoria et utiliser un dossier local directement.
