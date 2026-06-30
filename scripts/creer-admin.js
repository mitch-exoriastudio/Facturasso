// =====================================================================
//  Script utilitaire : crée (ou réinitialise) un compte administrateur.
//  À lancer après `npx prisma migrate dev` pour la première connexion.
//
//  La connexion se faisant par e-mail, l'administrateur doit en avoir un.
//
//  Usage :  npm run creer-admin -- <nom> <email> <motDePasse>
//  Exemple : npm run creer-admin -- ADMIN admin@asso.fr monMotDePasse
// =====================================================================
import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const [, , nom, emailBrut, motDePasse] = process.argv;

if (!nom || !emailBrut || !motDePasse) {
  console.error('Usage : npm run creer-admin -- <nom> <email> <motDePasse>');
  process.exit(1);
}

const email = emailBrut.trim().toLowerCase();
if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error(`Adresse e-mail invalide : « ${emailBrut} ».`);
  process.exit(1);
}

const hache = await bcrypt.hash(motDePasse, 10);

await prisma.utilisateur.upsert({
  where: { nom_utilisateur: nom },
  update: {
    email,
    mot_de_passe_hache:    hache,
    droit_admin:           true,
    compte_desactive:      false,
    droit_consult_fac:     true,
    droit_ajout_fac:       true,
    droit_consult_paiem:   true,
    droit_ajout_paiem:     true,
    droit_consult_clients: true,
    droit_ajout_clients:   true,
    droit_config:          true,
  },
  create: {
    nom_utilisateur:       nom,
    email,
    mot_de_passe_hache:    hache,
    droit_admin:           true,
    droit_consult_fac:     true,
    droit_ajout_fac:       true,
    droit_consult_paiem:   true,
    droit_ajout_paiem:     true,
    droit_consult_clients: true,
    droit_ajout_clients:   true,
    droit_config:          true,
  },
});

console.log(`✔ Administrateur « ${nom} » (${email}) créé / mis à jour.`);
await prisma.$disconnect();
process.exit(0);
