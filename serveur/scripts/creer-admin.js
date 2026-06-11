// =====================================================================
//  Script utilitaire : crée (ou réinitialise) un compte administrateur.
//  À lancer une fois la base créée, pour pouvoir se connecter la 1re fois.
//
//  Usage :  npm run creer-admin -- <nom> <motDePasse>
//  Exemple : npm run creer-admin -- ADMIN monMotDePasse
// =====================================================================
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { pool } from '../src/config/bdd.js';

const [, , nom, motDePasse] = process.argv;

if (!nom || !motDePasse) {
  console.error('Usage : npm run creer-admin -- <nom> <motDePasse>');
  process.exit(1);
}

const hache = await bcrypt.hash(motDePasse, 10);

await pool.query(
  `INSERT INTO utilisateur
     (nom_utilisateur, mot_de_passe_hache, droit_admin,
      droit_consult_fac, droit_ajout_fac, droit_consult_paiem, droit_ajout_paiem,
      droit_consult_clients, droit_ajout_clients, droit_config)
   VALUES (?, ?, 1, 1, 1, 1, 1, 1, 1, 1)
   ON DUPLICATE KEY UPDATE
     mot_de_passe_hache = VALUES(mot_de_passe_hache),
     droit_admin = 1,
     compte_desactive = 0`,
  [nom, hache]
);

console.log(`✔ Administrateur « ${nom} » créé / mis à jour.`);
process.exit(0);
