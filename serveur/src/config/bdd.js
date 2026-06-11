// =====================================================================
//  Connexion à la base de données MariaDB / MySQL
//  On utilise un « pool » : un ensemble de connexions réutilisables,
//  plus efficace que d'ouvrir/fermer une connexion à chaque requête.
// =====================================================================
import mysql from 'mysql2/promise';
import 'dotenv/config';

export const pool = mysql.createPool({
  host: process.env.BDD_HOTE || 'localhost',
  port: Number(process.env.BDD_PORT || 3306),
  user: process.env.BDD_UTILISATEUR || 'root',
  password: process.env.BDD_MOT_DE_PASSE || '',
  database: process.env.BDD_NOM || 'facturasso',
  waitForConnections: true,
  connectionLimit: 10,
  charset: 'utf8mb4',
  // Renvoie les colonnes DECIMAL sous forme de nombres JS (et non de chaînes).
  decimalNumbers: true,
});

// Vérifie que la base est joignable (appelé au démarrage du serveur).
export async function testerConnexion() {
  const connexion = await pool.getConnection();
  await connexion.ping();
  connexion.release();
}
