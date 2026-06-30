-- AlterTable : renommage compte_protege -> compte_superviseur (préserve les données)
ALTER TABLE `utilisateur`
  CHANGE `compte_protege` `compte_superviseur` BOOLEAN NOT NULL DEFAULT false;
