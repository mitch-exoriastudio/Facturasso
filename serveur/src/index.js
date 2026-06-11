// =====================================================================
//  Point d'entrée du serveur : teste la base puis démarre l'écoute HTTP.
// =====================================================================
import 'dotenv/config';
import { app } from './app.js';
import { testerConnexion } from './config/bdd.js';

const PORT = process.env.PORT || 4000;

testerConnexion()
  .then(() => {
    console.log('✔ Connexion à la base de données réussie.');
    app.listen(PORT, () => {
      console.log(`✔ Serveur API démarré sur http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('✖ Impossible de se connecter à la base de données :', err.message);
    process.exit(1);
  });
