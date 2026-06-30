-- AlterTable : ajout de l'adresse e-mail (identifiant de connexion) et du téléphone
ALTER TABLE `utilisateur`
  ADD COLUMN `email` VARCHAR(260) NULL,
  ADD COLUMN `telephone` VARCHAR(20) NULL;

-- CreateIndex : l'e-mail sert d'identifiant de connexion → unicité (NULL multiples autorisés)
CREATE UNIQUE INDEX `utilisateur_email_key` ON `utilisateur`(`email`);
