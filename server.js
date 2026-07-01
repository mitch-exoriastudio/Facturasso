// Point d'entrée « Application startup file » pour Phusion Passenger (o2switch — Setup Node.js App).
// Passenger ne sait pas lancer `next start` : il exécute ce fichier avec `node` et lui fournit
// le port d'écoute via la variable d'environnement PORT.
import { createServer } from 'node:http';
import next from 'next';

const port = Number(process.env.PORT) || 3000;

const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => handle(req, res)).listen(port, () => {
    console.log(`Facturasso (Passenger) en écoute sur le port ${port}`);
  });
});
