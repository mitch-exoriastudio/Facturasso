// =====================================================================
//  Seed Prisma : données initiales communes à tout nouveau dossier.
//  Lancé automatiquement par `npx prisma migrate dev`.
//  Peut aussi être rejoué manuellement : `npx prisma db seed`
// =====================================================================
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Ligne de configuration générale (id = 1, toujours unique).
  await prisma.parametreGeneral.upsert({
    where: { id_parametre_general: 1 },
    update: {},
    create: { id_parametre_general: 1 },
  });

  // Modes de paiement par défaut.
  const modesPaiement = [
    { nom_mode_paiement: 'Chèque',   abrege_mode_paiement: 'CHQ' },
    { nom_mode_paiement: 'Virement', abrege_mode_paiement: 'VIR' },
    { nom_mode_paiement: 'Espèces',  abrege_mode_paiement: 'ESP' },
    { nom_mode_paiement: 'Avoir',    abrege_mode_paiement: 'AVO' },
  ];

  for (const mode of modesPaiement) {
    const existant = await prisma.modePaiement.findFirst({
      where: { abrege_mode_paiement: mode.abrege_mode_paiement },
    });
    if (!existant) {
      await prisma.modePaiement.create({ data: mode });
    }
  }

  // Taux de TVA par défaut.
  const tauxTva = [
    { libelle: 'TVA 20 %',  taux: 0.2000, est_defaut: true  },
    { libelle: 'TVA 10 %',  taux: 0.1000, est_defaut: false },
    { libelle: 'TVA 5,5 %', taux: 0.0550, est_defaut: false },
    { libelle: 'TVA 2,1 %', taux: 0.0210, est_defaut: false },
    { libelle: 'Exonéré',   taux: 0.0000, est_defaut: false },
  ];

  for (const t of tauxTva) {
    const existant = await prisma.tauxTva.findFirst({ where: { libelle: t.libelle } });
    if (!existant) {
      await prisma.tauxTva.create({ data: t });
    }
  }

  console.log('✔ Seed terminé : parametre_general, modes de paiement et taux de TVA initialisés.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
