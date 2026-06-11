-- =====================================================================
--  Facturasso — Schéma de base de données (MariaDB / MySQL)
--  Réécriture web de l'application WINDEV d'origine.
--  Association ACT — exonérée de TVA (montants en HT, aucune TVA).
--
--  Conventions :
--   - Noms de tables et de colonnes en français (comme l'original).
--   - Moteur InnoDB (transactions + clés étrangères).
--   - Encodage utf8mb4 (accents et emojis gérés correctement).
--   - Une facture est IMMUABLE ; un brouillon est modifiable/supprimable.
-- =====================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------------------------------------------------------------------
--  Table : utilisateur
--  Comptes de connexion + droits fins (cf. onglet « Paramètres utilisateurs »).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `utilisateur` (
    `id_utilisateur`        BIGINT       NOT NULL AUTO_INCREMENT,
    `nom_utilisateur`       VARCHAR(40)  NOT NULL,
    -- Mot de passe haché avec bcrypt (l'ancien hachage WINDEV n'est pas récupérable :
    -- les comptes sont donc à recréer lors de la bascule).
    `mot_de_passe_hache`    VARCHAR(255) NOT NULL,
    `droit_admin`           TINYINT(1)   NOT NULL DEFAULT 0, -- administrateur = tous les droits
    `compte_desactive`      TINYINT(1)   NOT NULL DEFAULT 0,
    `droit_consult_fac`     TINYINT(1)   NOT NULL DEFAULT 0, -- consulter les factures
    `droit_ajout_fac`       TINYINT(1)   NOT NULL DEFAULT 0, -- créer/modifier brouillons
    `droit_consult_paiem`   TINYINT(1)   NOT NULL DEFAULT 0, -- consulter les paiements
    `droit_ajout_paiem`     TINYINT(1)   NOT NULL DEFAULT 0, -- ajouter/modifier paiements
    `droit_consult_clients` TINYINT(1)   NOT NULL DEFAULT 0, -- consulter les clients
    `droit_ajout_clients`   TINYINT(1)   NOT NULL DEFAULT 0, -- ajouter/modifier clients
    `droit_config`          TINYINT(1)   NOT NULL DEFAULT 0, -- accès à la configuration
    PRIMARY KEY (`id_utilisateur`),
    UNIQUE KEY `uq_utilisateur_nom` (`nom_utilisateur`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------
--  Table : client
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `client` (
    `id_client`     BIGINT       NOT NULL AUTO_INCREMENT,
    `civilite`      VARCHAR(10),
    `nom`           VARCHAR(40),
    `prenom`        VARCHAR(40),
    `adresse1`      TEXT,          -- ligne d'adresse principale
    `adresse2`      TEXT,          -- complément
    `adresse3`      TEXT,          -- complément (ex. « Suivi par … »)
    `code_postal`   VARCHAR(10),
    `ville`         VARCHAR(165),
    `pays`          VARCHAR(200),
    `telephone`     VARCHAR(20),
    `mobile`        VARCHAR(20),
    `email`         VARCHAR(260),
    `archive`       TINYINT(1)   NOT NULL DEFAULT 0,
    `date_creation`            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `date_modification`        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `utilisateur_creation`     VARCHAR(50) NOT NULL DEFAULT '',
    `utilisateur_modification` VARCHAR(50) NOT NULL DEFAULT '',
    PRIMARY KEY (`id_client`),
    KEY `idx_client_nom`         (`nom`),
    KEY `idx_client_code_postal` (`code_postal`),
    KEY `idx_client_ville`       (`ville`),
    KEY `idx_client_email`       (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------
--  Table : prestation  (catalogue des prestations « vendues »)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `prestation` (
    `id_prestation`           BIGINT        NOT NULL AUTO_INCREMENT,
    `reference`               VARCHAR(20),
    `designation`             TEXT,
    `prix_unitaire`           DECIMAL(12,2) NOT NULL DEFAULT 0,
    `ne_plus_proposer_presta` TINYINT(1)    NOT NULL DEFAULT 0, -- = archivée
    PRIMARY KEY (`id_prestation`),
    UNIQUE KEY `uq_prestation_reference` (`reference`),
    KEY `idx_prestation_designation` (`designation`(100))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------
--  Table : mode_paiement  (Chèque/CHQ, Virement/VIR, Espèces/ESP, Avoir/AVO…)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `mode_paiement` (
    `id_mode_paiement`     BIGINT      NOT NULL AUTO_INCREMENT,
    `nom_mode_paiement`    VARCHAR(40) NOT NULL,
    `abrege_mode_paiement` VARCHAR(10) NOT NULL,  -- ex. « VIR », imprimé sur la facture
    `ne_plus_proposer`     TINYINT(1)  NOT NULL DEFAULT 0, -- = archivé
    PRIMARY KEY (`id_mode_paiement`),
    KEY `idx_mode_paiement_abrege` (`abrege_mode_paiement`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Données initiales : 4 modes de paiement courants.
INSERT IGNORE INTO `mode_paiement` (`nom_mode_paiement`, `abrege_mode_paiement`) VALUES
    ('Chèque',   'CHQ'),
    ('Virement', 'VIR'),
    ('Espèces',  'ESP'),
    ('Avoir',    'AVO');


-- ---------------------------------------------------------------------
--  Table : ville  (référentiel code postal -> ville, import CSV)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `ville` (
    `id_ville`    BIGINT       NOT NULL AUTO_INCREMENT,
    `code_postal` VARCHAR(10)  NOT NULL,
    `nom_ville`   VARCHAR(160) NOT NULL,
    PRIMARY KEY (`id_ville`),
    KEY `idx_ville_code_postal` (`code_postal`),
    KEY `idx_ville_nom_ville`   (`nom_ville`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------
--  Table : brouillon  (document modifiable ET supprimable)
--  Devient une `facture` lors de l'édition (PDF/impression/mail) ou de la
--  saisie d'un règlement -> conversion avec confirmation utilisateur.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `brouillon` (
    `id_brouillon`          BIGINT        NOT NULL AUTO_INCREMENT,
    `id_client`             BIGINT        NOT NULL,
    `brouillon_date`        DATE          NOT NULL,
    `montant_total`         DECIMAL(12,2) NOT NULL DEFAULT 0,
    `commentaire_entete`    VARCHAR(400)  NOT NULL DEFAULT '',
    `commentaire_pied_page` VARCHAR(400)  NOT NULL DEFAULT '',
    `date_creation`            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `date_modification`        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `utilisateur_creation`     VARCHAR(50) NOT NULL DEFAULT '',
    `utilisateur_modification` VARCHAR(50) NOT NULL DEFAULT '',
    `est_devenu_facture`    TINYINT(1)    NOT NULL DEFAULT 0,
    PRIMARY KEY (`id_brouillon`),
    KEY `idx_brouillon_id_client`      (`id_client`),
    KEY `idx_brouillon_date`           (`brouillon_date`),
    CONSTRAINT `fk_brouillon_client`
        FOREIGN KEY (`id_client`) REFERENCES `client` (`id_client`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------
--  Table : brouillon_ligne
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `brouillon_ligne` (
    `id_brouillon_ligne`    BIGINT        NOT NULL AUTO_INCREMENT,
    `id_brouillon`          BIGINT        NOT NULL,
    `id_prestation`         BIGINT,                 -- référence catalogue (facultative)
    `prestation_date`       DATE          NOT NULL,
    `quantite`              DECIMAL(12,2) NOT NULL DEFAULT 0,
    `prestation_designation` VARCHAR(200) NOT NULL DEFAULT '',
    `prix_unitaire_ht`      DECIMAL(12,2) NOT NULL DEFAULT 0,
    `montant`               DECIMAL(12,2) NOT NULL DEFAULT 0, -- quantite * prix_unitaire_ht
    PRIMARY KEY (`id_brouillon_ligne`),
    KEY `idx_brouillon_ligne_id_brouillon` (`id_brouillon`),
    CONSTRAINT `fk_brouillon_ligne_brouillon`
        FOREIGN KEY (`id_brouillon`) REFERENCES `brouillon` (`id_brouillon`) ON DELETE CASCADE,
    CONSTRAINT `fk_brouillon_ligne_prestation`
        FOREIGN KEY (`id_prestation`) REFERENCES `prestation` (`id_prestation`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------
--  Table : facture  (DÉFINITIVE — ni modifiable ni supprimable)
--  Les données client sont FIGÉES ici : une facture émise ne change pas
--  si le client est modifié par la suite.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `facture` (
    `id_facture`             BIGINT        NOT NULL AUTO_INCREMENT,
    `numero_interne_facture` BIGINT        NOT NULL,  -- numéro séquentiel imprimé (ex. 709)
    `facture_date`           DATE          NOT NULL,
    `id_client`              BIGINT,                   -- lien indicatif (peut être archivé ensuite)
    `montant_total`          DECIMAL(12,2) NOT NULL DEFAULT 0,
    `montant_paye`           DECIMAL(12,2) NOT NULL DEFAULT 0, -- recalculé depuis les paiements
    `commentaire_entete`     VARCHAR(400)  NOT NULL DEFAULT '',
    `commentaire_pied_page`  VARCHAR(400)  NOT NULL DEFAULT '',
    -- Coordonnées client figées au moment de l'émission :
    `client_civilite`   VARCHAR(10)  NOT NULL DEFAULT '',
    `client_nom`        VARCHAR(40)  NOT NULL DEFAULT '',
    `client_prenom`     VARCHAR(40)  NOT NULL DEFAULT '',
    `client_adresse1`   TEXT,
    `client_adresse2`   TEXT,
    `client_adresse3`   TEXT,
    `client_code_postal` VARCHAR(10) NOT NULL DEFAULT '',
    `client_ville`      VARCHAR(165) NOT NULL DEFAULT '',
    `client_pays`       VARCHAR(200) NOT NULL DEFAULT '',
    `date_envoi_email`  DATE         DEFAULT NULL,  -- NULL = jamais envoyée
    `date_creation`            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `date_modification`        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `utilisateur_creation`     VARCHAR(50) NOT NULL DEFAULT '',
    `utilisateur_modification` VARCHAR(50) NOT NULL DEFAULT '',
    PRIMARY KEY (`id_facture`),
    UNIQUE KEY `uq_facture_numero` (`numero_interne_facture`),
    KEY `idx_facture_date`      (`facture_date`),
    KEY `idx_facture_id_client` (`id_client`),
    KEY `idx_facture_client_nom` (`client_nom`),
    CONSTRAINT `fk_facture_client`
        FOREIGN KEY (`id_client`) REFERENCES `client` (`id_client`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------
--  Table : facture_ligne
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `facture_ligne` (
    `id_facture_ligne`      BIGINT        NOT NULL AUTO_INCREMENT,
    `id_facture`            BIGINT        NOT NULL,
    `id_prestation`         BIGINT,
    `prestation_date`       DATE          NOT NULL,
    `quantite`              DECIMAL(12,2) NOT NULL DEFAULT 0,
    `prestation_designation` VARCHAR(200) NOT NULL DEFAULT '',
    `prix_unitaire_ht`      DECIMAL(12,2) NOT NULL DEFAULT 0,
    `montant`               DECIMAL(12,2) NOT NULL DEFAULT 0,
    PRIMARY KEY (`id_facture_ligne`),
    KEY `idx_facture_ligne_id_facture` (`id_facture`),
    CONSTRAINT `fk_facture_ligne_facture`
        FOREIGN KEY (`id_facture`) REFERENCES `facture` (`id_facture`),
    CONSTRAINT `fk_facture_ligne_prestation`
        FOREIGN KEY (`id_prestation`) REFERENCES `prestation` (`id_prestation`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------
--  Table : paiement  (toujours modifiable ; montant pouvant être négatif = avoir)
--  Lié ou non à une facture (un client peut payer d'avance).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `paiement` (
    `id_paiement`          BIGINT        NOT NULL AUTO_INCREMENT,
    `date_paiement`        DATE          NOT NULL,
    `id_facture`           BIGINT        DEFAULT NULL,  -- NULL = paiement non rattaché
    `id_client`            BIGINT        NOT NULL DEFAULT 0,
    `montant_paiement`     DECIMAL(12,2) NOT NULL DEFAULT 0, -- négatif possible (avoir)
    `nom_mode_paiement`    VARCHAR(40)   NOT NULL DEFAULT '',
    `abrege_mode_paiement` VARCHAR(10)   NOT NULL DEFAULT '',
    `observation`          TEXT,
    `date_creation`            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `date_modification`        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    `utilisateur_creation`     VARCHAR(50) NOT NULL DEFAULT '',
    `utilisateur_modification` VARCHAR(50) NOT NULL DEFAULT '',
    PRIMARY KEY (`id_paiement`),
    KEY `idx_paiement_date`       (`date_paiement`),
    KEY `idx_paiement_id_facture` (`id_facture`),
    KEY `idx_paiement_id_client`  (`id_client`),
    CONSTRAINT `fk_paiement_facture`
        FOREIGN KEY (`id_facture`) REFERENCES `facture` (`id_facture`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------
--  Table : parametre_general  (ligne unique = mentions asso + réglages globaux)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `parametre_general` (
    `id_parametre_general`   BIGINT       NOT NULL AUTO_INCREMENT,
    `raison_sociale_asso`    VARCHAR(100) NOT NULL DEFAULT '',
    `activite_naf_asso`      VARCHAR(50)  NOT NULL DEFAULT '',
    `adresse_asso1`          VARCHAR(200) NOT NULL DEFAULT '',
    `adresse_asso2`          VARCHAR(200) NOT NULL DEFAULT '',
    `code_postal_asso`       VARCHAR(10)  NOT NULL DEFAULT '',
    `ville_association`      VARCHAR(50)  NOT NULL DEFAULT '',
    `tel_asso1`              VARCHAR(20)  NOT NULL DEFAULT '',
    `tel_asso2`              VARCHAR(20)  NOT NULL DEFAULT '',
    `email_asso1`            VARCHAR(200) NOT NULL DEFAULT '',
    `email_asso2`            VARCHAR(200) NOT NULL DEFAULT '',
    `siret_asso`             VARCHAR(100) NOT NULL DEFAULT '',
    `tva_intra_asso`         VARCHAR(100) NOT NULL DEFAULT '',
    `rna`                    VARCHAR(100) NOT NULL DEFAULT '',
    `mention_obligatoire_fact4` VARCHAR(200) NOT NULL DEFAULT '', -- « Mentions diverses » (ex. IBAN)
    `com_entete_page_factu`  VARCHAR(400) NOT NULL DEFAULT '',
    `com_pied_page_factu`    VARCHAR(400) NOT NULL DEFAULT '',
    -- Logo stocké en base64 (data URI complet, ex. « data:image/png;base64,iVBOR... ») :
    `logo_asso`              LONGTEXT,
    `facture_dernier_numero_interne` BIGINT NOT NULL DEFAULT 0, -- compteur de n° de facture
    `note_pense_bete`        TEXT,
    PRIMARY KEY (`id_parametre_general`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ---------------------------------------------------------------------
--  Table : email_config  (paramètres d'envoi par utilisateur)
--  SMTP utilisé en premier ; champs OAuth conservés pour une activation future.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `email_config` (
    `id_email_config`        BIGINT       NOT NULL AUTO_INCREMENT,
    `id_utilisateur`         BIGINT       NOT NULL,
    -- --- SMTP (utilisé en priorité) ---
    `smtp_adresse`           VARCHAR(250) NOT NULL DEFAULT '',
    `smtp_user`              VARCHAR(250) NOT NULL DEFAULT '',
    `smtp_mot_de_passe`      VARCHAR(255) NOT NULL DEFAULT '', -- TODO: à chiffrer (amélioration future)
    `smtp_num_port`          INT          NOT NULL DEFAULT 587,
    `smtp_option_secu`       VARCHAR(10)  NOT NULL DEFAULT 'SMTPS', -- AUCUN | SMTPS | TLS
    `email_expediteur`       VARCHAR(250) NOT NULL DEFAULT '',
    `email_cc`               VARCHAR(250) NOT NULL DEFAULT '',
    `email_cci`              VARCHAR(250) NOT NULL DEFAULT '',
    -- --- Modèle d'e-mail d'envoi de facture ---
    `email_envoi_fact_objet` VARCHAR(250) NOT NULL DEFAULT '',
    `email_envoi_fact_corps` LONGTEXT,   -- HTML
    -- --- Signature (image stockée en base64, data URI complet) ---
    `signature_img`          LONGTEXT,
    `signature_hauteur`      VARCHAR(5)   NOT NULL DEFAULT '',
    `signature_largeur`      VARCHAR(5)   NOT NULL DEFAULT '',
    -- --- OAuth (réservé pour plus tard, non utilisé au démarrage) ---
    `oauth_client_id`        VARCHAR(200) NOT NULL DEFAULT '',
    `oauth_client_secret`    VARCHAR(200) NOT NULL DEFAULT '',
    `oauth_url_auth`         VARCHAR(250) NOT NULL DEFAULT '',
    `oauth_url_token`        VARCHAR(250) NOT NULL DEFAULT '',
    `oauth_url_redirect`     VARCHAR(200) NOT NULL DEFAULT '',
    `oauth_scope`            VARCHAR(200) NOT NULL DEFAULT '',
    `oauth_type_reponse`     VARCHAR(10)  NOT NULL DEFAULT '',
    `oauth_refresh_token`    TEXT,        -- jeton obtenu après autorisation (futur)
    PRIMARY KEY (`id_email_config`),
    UNIQUE KEY `uq_email_config_utilisateur` (`id_utilisateur`),
    CONSTRAINT `fk_email_config_utilisateur`
        FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateur` (`id_utilisateur`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

-- =====================================================================
--  Données d'amorçage minimales (modifiables ensuite dans l'appli)
-- =====================================================================

-- Ligne unique de paramètres généraux (créée vide si absente)
INSERT INTO `parametre_general` (`id_parametre_general`, `facture_dernier_numero_interne`)
SELECT 1, 0 FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `parametre_general`);

-- Modes de paiement de base
INSERT INTO `mode_paiement` (`nom_mode_paiement`, `abrege_mode_paiement`) VALUES
    ('Chèque',            'CHQ'),
    ('Virement',          'VIR'),
    ('Espèces',           'ESP'),
    ('Avoir annule facture', 'AVO');
