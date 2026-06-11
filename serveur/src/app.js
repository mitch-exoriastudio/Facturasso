// =====================================================================
//  Configuration de l'application Express (middlewares + routes).
//  Le démarrage du serveur lui-même se trouve dans index.js.
// =====================================================================
import express from 'express';
import cors from 'cors';
import 'dotenv/config';

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
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/config', configRoutes);

// Gestion centralisée des erreurs non interceptées.
app.use((err, req, res, next) => {
  console.error('Erreur serveur :', err);
  res.status(500).json({ message: 'Une erreur interne est survenue.' });
});
