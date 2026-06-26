-- CreateTable
CREATE TABLE `utilisateur` (
    `id_utilisateur` INTEGER NOT NULL AUTO_INCREMENT,
    `nom_utilisateur` VARCHAR(40) NOT NULL,
    `mot_de_passe_hache` VARCHAR(255) NOT NULL,
    `droit_admin` BOOLEAN NOT NULL DEFAULT false,
    `compte_desactive` BOOLEAN NOT NULL DEFAULT false,
    `droit_consult_fac` BOOLEAN NOT NULL DEFAULT false,
    `droit_ajout_fac` BOOLEAN NOT NULL DEFAULT false,
    `droit_consult_paiem` BOOLEAN NOT NULL DEFAULT false,
    `droit_ajout_paiem` BOOLEAN NOT NULL DEFAULT false,
    `droit_consult_clients` BOOLEAN NOT NULL DEFAULT false,
    `droit_ajout_clients` BOOLEAN NOT NULL DEFAULT false,
    `droit_config` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `utilisateur_nom_utilisateur_key`(`nom_utilisateur`),
    PRIMARY KEY (`id_utilisateur`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `client` (
    `id_client` INTEGER NOT NULL AUTO_INCREMENT,
    `civilite` VARCHAR(10) NULL,
    `nom` TEXT NOT NULL,
    `prenom` TEXT NULL,
    `adresse1` TEXT NULL,
    `adresse2` TEXT NULL,
    `adresse3` TEXT NULL,
    `code_postal` VARCHAR(10) NULL,
    `ville` VARCHAR(165) NULL,
    `pays` VARCHAR(200) NULL,
    `telephone` VARCHAR(20) NULL,
    `mobile` VARCHAR(20) NULL,
    `email` VARCHAR(260) NULL,
    `archive` BOOLEAN NOT NULL DEFAULT false,
    `date_creation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `date_modification` DATETIME(3) NOT NULL,
    `utilisateur_creation` VARCHAR(50) NULL,
    `utilisateur_modification` VARCHAR(50) NULL,

    PRIMARY KEY (`id_client`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `prestation` (
    `id_prestation` INTEGER NOT NULL AUTO_INCREMENT,
    `reference` VARCHAR(20) NULL,
    `designation` TEXT NOT NULL,
    `prix_unitaire` DECIMAL(12, 2) NOT NULL,
    `ne_plus_proposer_presta` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `prestation_reference_key`(`reference`),
    PRIMARY KEY (`id_prestation`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `mode_paiement` (
    `id_mode_paiement` INTEGER NOT NULL AUTO_INCREMENT,
    `nom_mode_paiement` VARCHAR(40) NOT NULL,
    `abrege_mode_paiement` VARCHAR(10) NOT NULL,
    `ne_plus_proposer` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id_mode_paiement`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ville` (
    `id_ville` INTEGER NOT NULL AUTO_INCREMENT,
    `code_postal` VARCHAR(10) NOT NULL,
    `nom_ville` VARCHAR(160) NOT NULL,

    INDEX `ville_code_postal_idx`(`code_postal`),
    INDEX `ville_nom_ville_idx`(`nom_ville`),
    PRIMARY KEY (`id_ville`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `brouillon` (
    `id_brouillon` INTEGER NOT NULL AUTO_INCREMENT,
    `id_client` INTEGER NULL,
    `brouillon_date` DATE NULL,
    `montant_total` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `commentaire_entete` VARCHAR(400) NULL,
    `commentaire_pied_page` VARCHAR(400) NULL,
    `date_creation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `date_modification` DATETIME(3) NOT NULL,
    `utilisateur_creation` VARCHAR(50) NULL,
    `utilisateur_modification` VARCHAR(50) NULL,
    `est_devenu_facture` BOOLEAN NOT NULL DEFAULT false,

    PRIMARY KEY (`id_brouillon`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `brouillon_ligne` (
    `id_brouillon_ligne` INTEGER NOT NULL AUTO_INCREMENT,
    `id_brouillon` INTEGER NOT NULL,
    `id_prestation` INTEGER NULL,
    `prestation_date` DATE NULL,
    `quantite` DECIMAL(12, 2) NOT NULL,
    `prestation_designation` VARCHAR(200) NOT NULL,
    `prix_unitaire_ht` DECIMAL(12, 2) NOT NULL,
    `montant` DECIMAL(12, 2) NOT NULL,

    PRIMARY KEY (`id_brouillon_ligne`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `facture` (
    `id_facture` INTEGER NOT NULL AUTO_INCREMENT,
    `numero_interne_facture` INTEGER NOT NULL,
    `facture_date` DATE NULL,
    `id_client` INTEGER NULL,
    `montant_total` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `montant_paye` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `commentaire_entete` VARCHAR(400) NULL,
    `commentaire_pied_page` VARCHAR(400) NULL,
    `client_civilite` VARCHAR(10) NULL,
    `client_nom` VARCHAR(255) NULL,
    `client_prenom` VARCHAR(255) NULL,
    `client_adresse1` TEXT NULL,
    `client_adresse2` TEXT NULL,
    `client_adresse3` TEXT NULL,
    `client_code_postal` VARCHAR(10) NULL,
    `client_ville` VARCHAR(165) NULL,
    `client_pays` VARCHAR(200) NULL,
    `client_email` VARCHAR(260) NULL,
    `client_siren` VARCHAR(9) NULL,
    `client_siret` VARCHAR(14) NULL,
    `client_num_tva_intra` VARCHAR(20) NULL,
    `client_autre_mention1` VARCHAR(400) NULL,
    `client_autre_mention2` VARCHAR(400) NULL,
    `asso_raison_sociale` VARCHAR(255) NULL,
    `asso_contact_nom` VARCHAR(100) NULL,
    `asso_contact_prenom` VARCHAR(100) NULL,
    `asso_adresse1` VARCHAR(255) NULL,
    `asso_adresse2` VARCHAR(255) NULL,
    `asso_adresse3` VARCHAR(255) NULL,
    `asso_code_postal` VARCHAR(10) NULL,
    `asso_ville` VARCHAR(165) NULL,
    `asso_email` VARCHAR(260) NULL,
    `asso_tel` VARCHAR(20) NULL,
    `asso_pays` VARCHAR(200) NULL,
    `asso_siren` VARCHAR(9) NULL,
    `asso_siret` VARCHAR(14) NULL,
    `asso_num_tva_intra` VARCHAR(20) NULL,
    `asso_statut` VARCHAR(100) NULL,
    `asso_naf` VARCHAR(10) NULL,
    `asso_autre_mention1` VARCHAR(400) NULL,
    `asso_autre_mention2` VARCHAR(400) NULL,
    `date_envoi_email` DATE NULL,
    `date_creation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `date_modification` DATETIME(3) NOT NULL,
    `utilisateur_creation` VARCHAR(50) NULL,
    `utilisateur_modification` VARCHAR(50) NULL,

    UNIQUE INDEX `facture_numero_interne_facture_key`(`numero_interne_facture`),
    PRIMARY KEY (`id_facture`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `facture_ligne` (
    `id_facture_ligne` INTEGER NOT NULL AUTO_INCREMENT,
    `id_facture` INTEGER NOT NULL,
    `id_prestation` INTEGER NULL,
    `prestation_date` DATE NULL,
    `quantite` DECIMAL(12, 2) NOT NULL,
    `prix_unitaire_ht` DECIMAL(12, 2) NOT NULL,
    `montant` DECIMAL(12, 2) NOT NULL,
    `prestation_designation` VARCHAR(200) NOT NULL,

    PRIMARY KEY (`id_facture_ligne`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `paiement` (
    `id_paiement` INTEGER NOT NULL AUTO_INCREMENT,
    `date_paiement` DATE NULL,
    `id_facture` INTEGER NULL,
    `id_client` INTEGER NOT NULL,
    `montant_paiement` DECIMAL(12, 2) NOT NULL,
    `nom_mode_paiement` VARCHAR(40) NOT NULL,
    `abrege_mode_paiement` VARCHAR(10) NOT NULL,
    `observation` TEXT NULL,
    `date_creation` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `date_modification` DATETIME(3) NOT NULL,
    `utilisateur_creation` VARCHAR(50) NULL,
    `utilisateur_modification` VARCHAR(50) NULL,

    PRIMARY KEY (`id_paiement`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `parametre_general` (
    `id_parametre_general` INTEGER NOT NULL AUTO_INCREMENT,
    `asso_raison_sociale` VARCHAR(255) NULL,
    `asso_contact_nom` VARCHAR(100) NULL,
    `asso_contact_prenom` VARCHAR(100) NULL,
    `asso_adresse1` VARCHAR(255) NULL,
    `asso_adresse2` VARCHAR(255) NULL,
    `asso_adresse3` VARCHAR(255) NULL,
    `asso_code_postal` VARCHAR(10) NULL,
    `asso_ville` VARCHAR(165) NULL,
    `asso_email` VARCHAR(260) NULL,
    `asso_email2` VARCHAR(260) NULL,
    `asso_tel` VARCHAR(20) NULL,
    `asso_tel2` VARCHAR(20) NULL,
    `asso_pays` VARCHAR(200) NULL,
    `asso_siren` VARCHAR(9) NULL,
    `asso_siret` VARCHAR(14) NULL,
    `asso_num_tva_intra` VARCHAR(20) NULL,
    `asso_statut` VARCHAR(100) NULL,
    `asso_naf` VARCHAR(10) NULL,
    `asso_autre_mention1` VARCHAR(400) NULL,
    `asso_autre_mention2` VARCHAR(400) NULL,
    `rna` VARCHAR(20) NULL,
    `tva_active` BOOLEAN NOT NULL DEFAULT false,
    `mention_obligatoire_fact4` VARCHAR(200) NULL,
    `com_entete_page_factu` VARCHAR(400) NULL,
    `com_pied_page_factu` VARCHAR(400) NULL,
    `logo_asso` LONGTEXT NULL,
    `facture_dernier_numero_interne` INTEGER NOT NULL DEFAULT 0,
    `note_pense_bete` TEXT NULL,

    PRIMARY KEY (`id_parametre_general`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `email_config` (
    `id_email_config` INTEGER NOT NULL AUTO_INCREMENT,
    `id_utilisateur` INTEGER NOT NULL,
    `smtp_adresse` VARCHAR(255) NULL,
    `smtp_user` VARCHAR(255) NULL,
    `smtp_mot_de_passe` VARCHAR(255) NULL,
    `smtp_num_port` INTEGER NULL,
    `smtp_option_secu` VARCHAR(10) NULL,
    `email_expediteur` VARCHAR(260) NULL,
    `email_cc` VARCHAR(260) NULL,
    `email_cci` VARCHAR(260) NULL,
    `email_envoi_fact_objet` VARCHAR(255) NULL,
    `email_envoi_fact_corps` LONGTEXT NULL,
    `signature_img` LONGTEXT NULL,
    `signature_hauteur` INTEGER NULL,
    `signature_largeur` INTEGER NULL,
    `oauth_client_id` TEXT NULL,
    `oauth_client_secret` TEXT NULL,
    `oauth_url_auth` TEXT NULL,
    `oauth_url_token` TEXT NULL,
    `oauth_url_redirect` TEXT NULL,
    `oauth_scope` TEXT NULL,
    `oauth_type_reponse` VARCHAR(50) NULL,
    `oauth_refresh_token` TEXT NULL,

    UNIQUE INDEX `email_config_id_utilisateur_key`(`id_utilisateur`),
    PRIMARY KEY (`id_email_config`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `brouillon` ADD CONSTRAINT `brouillon_id_client_fkey` FOREIGN KEY (`id_client`) REFERENCES `client`(`id_client`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `brouillon_ligne` ADD CONSTRAINT `brouillon_ligne_id_brouillon_fkey` FOREIGN KEY (`id_brouillon`) REFERENCES `brouillon`(`id_brouillon`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `brouillon_ligne` ADD CONSTRAINT `brouillon_ligne_id_prestation_fkey` FOREIGN KEY (`id_prestation`) REFERENCES `prestation`(`id_prestation`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `facture` ADD CONSTRAINT `facture_id_client_fkey` FOREIGN KEY (`id_client`) REFERENCES `client`(`id_client`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `facture_ligne` ADD CONSTRAINT `facture_ligne_id_facture_fkey` FOREIGN KEY (`id_facture`) REFERENCES `facture`(`id_facture`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `facture_ligne` ADD CONSTRAINT `facture_ligne_id_prestation_fkey` FOREIGN KEY (`id_prestation`) REFERENCES `prestation`(`id_prestation`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `paiement` ADD CONSTRAINT `paiement_id_facture_fkey` FOREIGN KEY (`id_facture`) REFERENCES `facture`(`id_facture`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `paiement` ADD CONSTRAINT `paiement_id_client_fkey` FOREIGN KEY (`id_client`) REFERENCES `client`(`id_client`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `email_config` ADD CONSTRAINT `email_config_id_utilisateur_fkey` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateur`(`id_utilisateur`) ON DELETE CASCADE ON UPDATE CASCADE;
