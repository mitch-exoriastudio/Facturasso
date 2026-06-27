// =====================================================================
//  Configuration de l'application Express (middlewares + routes).
//  Le démarrage du serveur lui-même se trouve dans index.js.
// =====================================================================
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import publicRoutes from './routes/publicRoutes.js';
import authRoutes from './routes/authRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import configRoutes from './routes/configRoutes.js';

export const app = express();

// Autorise le front (autre origine en développement) à appeler l'API.
app.use(cors({ origin: process.env.ORIGINE_CLIENT || 'http://localhost:5173' }));

// Lit le corps JSON des requêtes. Limite élevée car le logo et la
// signature sont transmis en base64 (peuvent peser quelques Mo).
app.use(express.json({ limit: '15mb' }));

// Route de vérification rapide que l'API répond.
app.get('/api/sante', (req, res) => res.json({ statut: 'ok' }));

// Regroupement des routes par domaine.
app.use('/api/public', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/config', configRoutes);

// Libellés français des colonnes pour les erreurs de validation Prisma.
const LIBELLES_COLONNES = {
  asso_siren:                'SIREN (9 caractères max)',
  asso_siret:                'SIRET (14 caractères max)',
  asso_num_tva_intra:        'N° TVA intracommunautaire (20 caractères max)',
  asso_raison_sociale:       'Raison sociale (255 caractères max)',
  asso_statut:               'Statut juridique (100 caractères max)',
  asso_contact_nom:          'Nom du contact (100 caractères max)',
  asso_contact_prenom:       'Prénom du contact (100 caractères max)',
  asso_adresse1:             'Adresse ligne 1 (255 caractères max)',
  asso_adresse2:             'Adresse ligne 2 (255 caractères max)',
  asso_adresse3:             'Adresse ligne 3 (255 caractères max)',
  asso_code_postal:          'Code postal (10 caractères max)',
  asso_ville:                'Ville (165 caractères max)',
  asso_pays:                 'Pays (200 caractères max)',
  asso_email:                'E-mail (260 caractères max)',
  asso_email2:               'E-mail 2 (260 caractères max)',
  asso_tel:                  'Téléphone (20 caractères max)',
  asso_tel2:                 'Téléphone 2 (20 caractères max)',
  asso_naf:                  'Code NAF / APE (10 caractères max)',
  rna:                       'RNA (20 caractères max)',
  asso_autre_mention1:       'Autre mention 1 (400 caractères max)',
  asso_autre_mention2:       'Autre mention 2 (400 caractères max)',
  mention_obligatoire_fact4: 'Mention obligatoire (200 caractères max)',
  com_entete_page_factu:     'Commentaire en-tête (400 caractères max)',
  com_pied_page_factu:       'Commentaire pied de page (400 caractères max)',
  nom_client:                'Nom du client (200 caractères max)',
  prenom_client:             'Prénom du client (100 caractères max)',
  email_client:              'E-mail du client (260 caractères max)',
  telephone_client:          'Téléphone du client (20 caractères max)',
  code_postal_client:        'Code postal du client (10 caractères max)',
  ville_client:              'Ville du client (165 caractères max)',
  reference_prestation:      'Référence prestation (50 caractères max)',
  nom_prestation:            'Nom prestation (200 caractères max)',
  nom_mode_paiement:         'Nom du mode de paiement (100 caractères max)',
  abrege_mode_paiement:      'Abrégé du mode de paiement (10 caractères max)',
};

// Gestion centralisée des erreurs non interceptées.
app.use((err, req, res, next) => {
  // Valeur trop longue pour une colonne (Prisma P2000)
  if (err.code === 'P2000') {
    const colonne = err.meta?.column_name ?? '';
    const libelle = LIBELLES_COLONNES[colonne] ?? `champ « ${colonne} »`;
    return res.status(400).json({ message: `La valeur saisie est trop longue pour le champ : ${libelle}.` });
  }
  console.error('Erreur serveur :', err);
  res.status(500).json({ message: 'Une erreur interne est survenue.' });
});
