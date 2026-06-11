-- Script généré par WINDEV Suite le 09/06/2026 19:02:19
-- Tables de l'analyse Facturasso.wda
-- pour MariaDB

-- --------------------------------------------------------
-- Table : Brouillon
-- --------------------------------------------------------
CREATE TABLE `Brouillon` (
    `id_brouillon`            BIGINT       PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `id_client`               BIGINT       NOT NULL DEFAULT 0,
    `brouillon_date`          DATE         NOT NULL,
    `montant_total`           NUMERIC(24,6) NOT NULL DEFAULT 0,
    `commentaire_entete`      VARCHAR(400) NOT NULL,
    `commentaire_pied_page`   VARCHAR(400) NOT NULL,
`date_creation`           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
`date_modification`       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `utilisateur_creation`    VARCHAR(50)  NOT NULL,
    `utilisateur_modification` VARCHAR(50) NOT NULL,
    `est_devenu_facture`      TINYINT      NOT NULL DEFAULT 0
);
CREATE INDEX `idx_brouillon_id_client`          ON `Brouillon` (`id_client`);
CREATE INDEX `idx_brouillon_brouillon_date`     ON `Brouillon` (`brouillon_date`);
CREATE INDEX `idx_brouillon_est_devenu_facture` ON `Brouillon` (`est_devenu_facture`);


-- --------------------------------------------------------
-- Table : BrouillonLigne
-- --------------------------------------------------------
CREATE TABLE `BrouillonLigne` (
    `id_brouillon_ligne`      BIGINT       PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `id_brouillon`            BIGINT       NOT NULL DEFAULT 0,
    `prestation_date`         DATE         NOT NULL,
    `quantite`                BIGINT       NOT NULL DEFAULT 0,
    `prestation_designation`  VARCHAR(200) NOT NULL,
    `prix_unitaire_ht`        NUMERIC(24,6) NOT NULL DEFAULT 0,
    `montant`                 NUMERIC(24,6) NOT NULL DEFAULT 0,
`date_creation`           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
`date_modification`       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `utilisateur_creation`    VARCHAR(50)  NOT NULL,
    `utilisateur_modification` VARCHAR(50) NOT NULL,
    `id_prestation`           BIGINT       NOT NULL DEFAULT 0
);
CREATE INDEX `idx_brouillon_ligne_id_brouillon`  ON `BrouillonLigne` (`id_brouillon`);
CREATE INDEX `idx_brouillon_ligne_id_prestation` ON `BrouillonLigne` (`id_prestation`);


-- --------------------------------------------------------
-- Table : Client
-- --------------------------------------------------------
CREATE TABLE `Client` (
    `id_client`               BIGINT       PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `civilite`                VARCHAR(10),
    `nom`                     VARCHAR(40),
    `prenom`                  VARCHAR(40),
    `adresse1`                LONGTEXT,
    `adresse2`                LONGTEXT,
    `code_postal`             VARCHAR(10),
    `ville`                   VARCHAR(165),
    `pays`                    VARCHAR(200),
    `telephone`               VARCHAR(20),
    `mobile`                  VARCHAR(20),
    `email`                   VARCHAR(260),
    `adresse3`                LONGTEXT,
    `archive`                 TINYINT      NOT NULL DEFAULT 0,
`date_creation`           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
`date_modification`       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `utilisateur_creation`    VARCHAR(50)  NOT NULL,
    `utilisateur_modification` VARCHAR(50) NOT NULL
);
CREATE INDEX `idx_client_nom`         ON `Client` (`nom`);
CREATE INDEX `idx_client_code_postal` ON `Client` (`code_postal`);
CREATE INDEX `idx_client_ville`       ON `Client` (`ville`);
CREATE INDEX `idx_client_telephone`   ON `Client` (`telephone`);
CREATE INDEX `idx_client_mobile`      ON `Client` (`mobile`);
CREATE INDEX `idx_client_email`       ON `Client` (`email`);


-- --------------------------------------------------------
-- Table : EmailConfig
-- --------------------------------------------------------
CREATE TABLE `EmailConfig` (
    `id_email_config`           BIGINT       PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `smtp_adresse`              VARCHAR(250) NOT NULL,
    `smtp_user`                 VARCHAR(250) NOT NULL,
    `smtp_mot_de_passe`         VARCHAR(100),
    `smtp_num_port`             INTEGER      NOT NULL DEFAULT 0,
    `smtp_option_secu`          TINYINT      NOT NULL DEFAULT 0,
    `email_expediteur`          VARCHAR(250) NOT NULL,
    `email_cc`                  VARCHAR(250) NOT NULL,
    `email_cci`                 VARCHAR(250) NOT NULL,
    `oauth_client_id`           VARCHAR(200) NOT NULL,
    `oauth_client_secret`       VARCHAR(200) NOT NULL,
    `oauth_url_auth`            VARCHAR(250) NOT NULL,
    `oauth_url_token`           VARCHAR(250) NOT NULL,
    `oauth_url_redirect`        VARCHAR(200) NOT NULL,
    `oauth_scope`               VARCHAR(200) NOT NULL,
    `oauth_type_reponse`        VARCHAR(10)  NOT NULL,
    `email_envoi_fact_corps`    LONGTEXT     NOT NULL,
    `email_envoi_fact_objet`    VARCHAR(250) NOT NULL,
    `signature_image`           LONGBLOB     NOT NULL,
    `signature_hauteur`         VARCHAR(5)   NOT NULL,
    `signature_largeur`         VARCHAR(5)   NOT NULL,
    `signature_nom_fichier`     VARCHAR(150) NOT NULL,
    `id_utilisateur`            BIGINT       NOT NULL UNIQUE DEFAULT 0
);


-- --------------------------------------------------------
-- Table : Facture
-- --------------------------------------------------------
CREATE TABLE `Facture` (
    `id_facture`               BIGINT        PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `facture_date`             DATE,
    `numero_interne_facture`   BIGINT        UNIQUE DEFAULT 0,
    `montant_total`            NUMERIC(24,6) DEFAULT 0,
    `id_client`                BIGINT,
    `montant_paye`             NUMERIC(24,6) NOT NULL DEFAULT 0,
    `commentaire_entete`       VARCHAR(400)  NOT NULL,
    `commentaire_pied_page`    VARCHAR(400)  NOT NULL,
    `date_creation`            TIMESTAMP     NOT NULL,
    `date_modification`        TIMESTAMP     NOT NULL,
    `utilisateur_creation`     VARCHAR(50)   NOT NULL,
    `utilisateur_modification` VARCHAR(50)   NOT NULL,
    `client_nom`               VARCHAR(40)   NOT NULL,
    `client_prenom`            VARCHAR(40)   NOT NULL,
    `client_adresse1`          LONGTEXT      NOT NULL,
    `client_adresse2`          LONGTEXT      NOT NULL,
    `client_adresse3`          LONGTEXT      NOT NULL,
    `client_code_postal`       VARCHAR(10)   NOT NULL,
    `client_ville`             VARCHAR(165)  NOT NULL,
    `client_pays`              VARCHAR(200)  NOT NULL,
    `client_civilite`          VARCHAR(10)   NOT NULL,
    `date_envoi_email`         DATE          NOT NULL
);
CREATE INDEX `idx_facture_facture_date` ON `Facture` (`facture_date`);
CREATE INDEX `idx_facture_id_client`    ON `Facture` (`id_client`);
CREATE INDEX `idx_facture_client_nom`   ON `Facture` (`client_nom`);


-- --------------------------------------------------------
-- Table : FactureLigne
-- --------------------------------------------------------
CREATE TABLE `FactureLigne` (
    `id_facture_ligne`         BIGINT        PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `id_facture`               BIGINT        DEFAULT 0,
    `id_prestation`            BIGINT        DEFAULT 0,
    `quantite`                 BIGINT        DEFAULT 0,
    `prestation_designation`   VARCHAR(200),
    `prix_unitaire_ht`         NUMERIC(24,6) DEFAULT 0,
    `montant`                  NUMERIC(24,6) NOT NULL DEFAULT 0,
    `prestation_date`          DATE          NOT NULL,
`date_creation`           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
`date_modification`       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `utilisateur_creation`     VARCHAR(50)   NOT NULL,
    `utilisateur_modification` VARCHAR(50)   NOT NULL
);
CREATE INDEX `idx_facture_ligne_id_facture`    ON `FactureLigne` (`id_facture`);
CREATE INDEX `idx_facture_ligne_id_prestation` ON `FactureLigne` (`id_prestation`);


-- --------------------------------------------------------
-- Table : ModePaiement
-- --------------------------------------------------------
CREATE TABLE `ModePaiement` (
    `id_mode_paiement`     BIGINT      PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `nom_mode_paiement`    VARCHAR(40) NOT NULL,
    `abrege_mode_paiement` VARCHAR(10) NOT NULL,
    `ne_plus_proposer`     TINYINT     NOT NULL DEFAULT 0
);
CREATE INDEX `idx_mode_paiement_nom`           ON `ModePaiement` (`nom_mode_paiement`);
CREATE INDEX `idx_mode_paiement_abrege`        ON `ModePaiement` (`abrege_mode_paiement`);
CREATE INDEX `idx_mode_paiement_ne_plus_prop`  ON `ModePaiement` (`ne_plus_proposer`);


-- --------------------------------------------------------
-- Table : PaiementLigne
-- --------------------------------------------------------
CREATE TABLE `PaiementLigne` (
    `id_paiement`              BIGINT        PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `date_paiement`            DATE,
    `abrege_mode_paiement`     VARCHAR(10)   NOT NULL,
    `id_facture`               BIGINT,
    `observation`              LONGTEXT,
    `montant_paiement`         NUMERIC(24,6) NOT NULL DEFAULT 0,
    `nom_mode_paiement`        VARCHAR(40)   NOT NULL,
    `id_client`                BIGINT        NOT NULL DEFAULT 0,
`date_creation`           TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
`date_modification`       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `utilisateur_creation`     VARCHAR(50)   NOT NULL,
    `utilisateur_modification` VARCHAR(50)   NOT NULL
);
CREATE INDEX `idx_paiement_ligne_date_paiement`    ON `PaiementLigne` (`date_paiement`);
CREATE INDEX `idx_paiement_ligne_abrege_mode_paie` ON `PaiementLigne` (`abrege_mode_paiement`);
CREATE INDEX `idx_paiement_ligne_id_facture`       ON `PaiementLigne` (`id_facture`);
CREATE INDEX `idx_paiement_ligne_nom_mode_paie`    ON `PaiementLigne` (`nom_mode_paiement`);
CREATE INDEX `idx_paiement_ligne_id_client`        ON `PaiementLigne` (`id_client`);


-- --------------------------------------------------------
-- Table : ParametreGeneral
-- --------------------------------------------------------
CREATE TABLE `ParametreGeneral` (
    `id_parametre_general`          BIGINT        PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `raison_sociale_asso`           VARCHAR(50)   NOT NULL,
    `activite_naf_asso`             VARCHAR(50)   NOT NULL,
    `adresse_asso1`                 VARCHAR(200)  NOT NULL,
    `adresse_asso2`                 VARCHAR(200)  NOT NULL,
    `ville_association`             VARCHAR(50)   NOT NULL,
    `code_postal_asso`              VARCHAR(10)   NOT NULL,
    `tel_asso1`                     VARCHAR(20)   NOT NULL,
    `tel_asso2`                     VARCHAR(20)   NOT NULL,
    `email_asso1`                   VARCHAR(200)  NOT NULL,
    `email_asso2`                   VARCHAR(200)  NOT NULL,
    `logo_asso`                     LONGBLOB      NOT NULL,
    `siret_asso`                    VARCHAR(100)  NOT NULL,
    `tva_intra_asso`                VARCHAR(100)  NOT NULL,
    `rna`                           VARCHAR(100)  NOT NULL,
    `mention_obligatoire_fact4`     VARCHAR(100)  NOT NULL,
    `com_entete_page_factu`         VARCHAR(400)  NOT NULL,
    `com_pied_page_factu`           VARCHAR(400)  NOT NULL,
    `facture_dernier_numero_interne` BIGINT       NOT NULL DEFAULT 0,
    `note_pense_bete`               LONGTEXT      NOT NULL
);


-- --------------------------------------------------------
-- Table : Prestation
-- --------------------------------------------------------
CREATE TABLE `Prestation` (
    `id_prestation`          BIGINT        PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `reference`              VARCHAR(20)   UNIQUE,
    `designation`            LONGTEXT,
    `prix_unitaire`          NUMERIC(24,6) DEFAULT 0,
    `ne_plus_proposer_presta` TINYINT      NOT NULL DEFAULT 0
);
CREATE INDEX `idx_prestation_designation` ON `Prestation` (`designation`);


-- --------------------------------------------------------
-- Table : Utilisateur
-- NOTE : La rubrique "mot_de_passe" (type Mot de passe WINDEV) n'est pas
--        supportée nativement — à adapter selon votre implémentation.
-- --------------------------------------------------------
CREATE TABLE `Utilisateur` (
    `id_utilisateur`           BIGINT      PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `nom_utilisateur`          VARCHAR(40),
    `droit_admin`              TINYINT     DEFAULT 0,
    `compte_desactive`         TINYINT     DEFAULT 0,
    `droit_consult_fac`        TINYINT     NOT NULL DEFAULT 0,
    `droit_ajout_fac`          TINYINT     NOT NULL DEFAULT 0,
    `droit_consult_paiem`      TINYINT     NOT NULL DEFAULT 0,
    `droit_ajout_paiem`        TINYINT     NOT NULL DEFAULT 0,
    `droit_consult_clients`    TINYINT     NOT NULL DEFAULT 0,
    `droit_ajout_clients`      TINYINT     NOT NULL DEFAULT 0,
    `droit_config`             TINYINT     NOT NULL DEFAULT 0
);
CREATE INDEX `idx_utilisateur_nom` ON `Utilisateur` (`nom_utilisateur`);


-- --------------------------------------------------------
-- Table : Ville
-- --------------------------------------------------------
CREATE TABLE `Ville` (
    `id_ville`    BIGINT      PRIMARY KEY NOT NULL AUTO_INCREMENT,
    `code_postal` VARCHAR(10)  NOT NULL,
    `nom_ville`   VARCHAR(160) NOT NULL
);
CREATE INDEX `idx_ville_code_postal` ON `Ville` (`code_postal`);
CREATE INDEX `idx_ville_nom_ville`   ON `Ville` (`nom_ville`);


-- --------------------------------------------------------
-- Contraintes d'intégrité référentielle
-- --------------------------------------------------------
ALTER TABLE `PaiementLigne`  ADD FOREIGN KEY (`id_facture`)    REFERENCES `Facture`     (`id_facture`);
ALTER TABLE `Facture`        ADD FOREIGN KEY (`id_client`)     REFERENCES `Client`      (`id_client`);
ALTER TABLE `FactureLigne`   ADD FOREIGN KEY (`id_facture`)    REFERENCES `Facture`     (`id_facture`);
ALTER TABLE `FactureLigne`   ADD FOREIGN KEY (`id_prestation`) REFERENCES `Prestation`  (`id_prestation`);
ALTER TABLE `BrouillonLigne` ADD FOREIGN KEY (`id_brouillon`)  REFERENCES `Brouillon`   (`id_brouillon`) ON DELETE CASCADE;
ALTER TABLE `Brouillon`      ADD FOREIGN KEY (`id_client`)     REFERENCES `Client`      (`id_client`);