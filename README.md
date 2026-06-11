# Facturasso — version web

Réécriture web de l'application de facturation WINDEV de l'association **ACT**.

- **Front-end** : React + Vite + Tailwind CSS (dossier `client/`)
- **Back-end** : Node.js + Express (dossier `serveur/`)
- **Base de données** : MariaDB / MySQL (schéma dans `Database/schema_mariadb.sql`)

> L'association est **exonérée de TVA** : tous les montants sont en HT, aucune TVA n'apparaît.

---

## Prérequis (à installer une seule fois)

1. **Node.js LTS** (v20 ou v22) : https://nodejs.org
2. **MariaDB / MySQL** en local. Le plus simple sous Windows : **Laragon** ou **XAMPP**
   (incluent MariaDB + phpMyAdmin pour visualiser la base).

---

## Mise en route (développement)

### 1. Créer la base de données
Dans phpMyAdmin (ou en ligne de commande), créer une base nommée `facturasso`,
puis importer/exécuter le fichier `Database/schema_mariadb.sql`.

### 2. Démarrer le serveur (API)
```bash
cd serveur
npm install
cp .env.example .env      # puis adapter les identifiants de la base dans .env
npm run creer-admin -- ADMIN motdepasse   # crée un 1er compte administrateur
npm run dev               # démarre l'API sur http://localhost:4000
```

### 3. Démarrer le client (interface)
Dans un **second** terminal :
```bash
cd client
npm install
npm run dev               # démarre l'interface sur http://localhost:5173
```

Ouvrir http://localhost:5173 et se connecter avec le compte créé à l'étape 2.

---

## Avancement (développement par lots)

- [x] **Lot 1 — Fondations** : schéma BDD, serveur Express, auth JWT + droits, page de connexion, disposition générale.
- [ ] Lot 2 — Clients (liste, fiche, archivage, auto-complétion ville).
- [ ] Lot 3 — Configuration (6 onglets).
- [ ] Lot 4 — Factures / Brouillons.
- [ ] Lot 5 — Paiements.
- [ ] Lot 6 — Génération PDF.
- [ ] Lot 7 — Envoi d'e-mails (unitaire + en masse).
- [ ] Lot 8 — Tableau de bord + finitions + déploiement o2switch.

---

## Structure du projet

```
Facturasso/
├── client/      Front-end React (Vite)
├── serveur/     Back-end Node/Express
├── Database/    Schémas SQL (original WINDEV + nouveau MariaDB)
├── Captures/    Captures d'écran de l'application d'origine
└── Editions/    Exemples de PDF (brouillon, facture à payer, acquittée)
```
