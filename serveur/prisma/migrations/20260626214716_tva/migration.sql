-- AlterTable
ALTER TABLE `brouillon` ADD COLUMN `montant_ht` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `montant_tva` DECIMAL(12, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `brouillon_ligne` ADD COLUMN `id_taux_tva` INTEGER NULL,
    ADD COLUMN `montant_ttc` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `montant_tva` DECIMAL(12, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `facture` ADD COLUMN `montant_ht` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `montant_tva` DECIMAL(12, 2) NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `facture_ligne` ADD COLUMN `id_taux_tva` INTEGER NULL,
    ADD COLUMN `montant_ttc` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `montant_tva` DECIMAL(12, 2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `taux_tva` (
    `id_taux_tva` INTEGER NOT NULL AUTO_INCREMENT,
    `libelle` VARCHAR(50) NOT NULL,
    `taux` DECIMAL(5, 4) NOT NULL,
    `est_defaut` BOOLEAN NOT NULL DEFAULT false,
    `ne_plus_proposer` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id_taux_tva`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `brouillon_ligne` ADD CONSTRAINT `brouillon_ligne_id_taux_tva_fkey` FOREIGN KEY (`id_taux_tva`) REFERENCES `taux_tva`(`id_taux_tva`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `facture_ligne` ADD CONSTRAINT `facture_ligne_id_taux_tva_fkey` FOREIGN KEY (`id_taux_tva`) REFERENCES `taux_tva`(`id_taux_tva`) ON DELETE SET NULL ON UPDATE CASCADE;
