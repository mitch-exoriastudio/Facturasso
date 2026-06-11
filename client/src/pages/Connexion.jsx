// =====================================================================
//  Page de connexion.
// =====================================================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contextes/ContexteAuth.jsx';

export default function Connexion() {
  const { seConnecter } = useAuth();
  const navigate = useNavigate();

  const [nomUtilisateur, setNomUtilisateur] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [erreur, setErreur] = useState('');
  const [enCours, setEnCours] = useState(false);

  async function soumettre(e) {
    e.preventDefault();
    setErreur('');
    setEnCours(true);
    try {
      await seConnecter(nomUtilisateur, motDePasse);
      navigate('/');
    } catch (err) {
      setErreur(err.response?.data?.message || 'Connexion impossible.');
    } finally {
      setEnCours(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <form onSubmit={soumettre} className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-3xl font-bold text-primaire text-center mb-6">Facturasso</h1>

        {erreur && (
          <div className="mb-4 text-sm text-red-600 bg-red-50 rounded-lg p-3">{erreur}</div>
        )}

        <label className="block text-sm font-medium text-slate-600 mb-1">Utilisateur</label>
        <input
          value={nomUtilisateur}
          onChange={(e) => setNomUtilisateur(e.target.value.toUpperCase())}
          autoFocus
          className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-primaire"
        />

        <label className="block text-sm font-medium text-slate-600 mb-1">Mot de passe</label>
        <input
          type="password"
          value={motDePasse}
          onChange={(e) => setMotDePasse(e.target.value)}
          className="w-full border border-slate-300 rounded-lg px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-primaire"
        />

        <button
          type="submit"
          disabled={enCours}
          className="w-full bg-primaire hover:bg-primaire-fonce text-white font-semibold py-2 rounded-lg transition disabled:opacity-60"
        >
          {enCours ? 'Connexion…' : 'Connexion'}
        </button>
      </form>
    </div>
  );
}
