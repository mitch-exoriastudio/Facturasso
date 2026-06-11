// =====================================================================
//  Page Clients : liste, recherche, archivage, ouverture de la fiche.
// =====================================================================
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contextes/ContexteAuth.jsx';
import { clientService } from '../services/clientService.js';
import FicheClient from '../composants/FicheClient.jsx';

export default function Clients() {
  const { utilisateur } = useAuth();
  const peutModifier = utilisateur?.droit_admin || utilisateur?.droit_ajout_clients;
  const peutConsulter = utilisateur?.droit_admin || utilisateur?.droit_consult_clients;

  const [clients, setClients] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [avecArchives, setAvecArchives] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState('');

  // Fiche ouverte : null = fermée, 'nouveau' = création, objet = modification.
  const [ficheOuverte, setFicheOuverte] = useState(null);

  // Chargement de la liste (rappelé à chaque changement de filtre).
  const chargerClients = useCallback(async () => {
    setChargement(true);
    setErreur('');
    try {
      const data = await clientService.lister({
        recherche,
        archives: avecArchives ? '1' : '0',
      });
      setClients(data);
    } catch {
      setErreur('Impossible de charger la liste des clients.');
    } finally {
      setChargement(false);
    }
  }, [recherche, avecArchives]);

  // Rechargement quand les filtres changent, avec délai pour la barre de recherche.
  useEffect(() => {
    const timer = setTimeout(chargerClients, recherche ? 300 : 0);
    return () => clearTimeout(timer);
  }, [chargerClients, recherche]);

  async function validerFiche(donnees) {
    if (ficheOuverte === 'nouveau') {
      await clientService.creer(donnees);
    } else {
      await clientService.modifier(ficheOuverte.id_client, donnees);
    }
    chargerClients();
  }

  async function basculerArchivage(client) {
    const action = client.archive ? 'désarchiver' : 'archiver';
    if (!window.confirm(`Voulez-vous ${action} ${client.civilite ?? ''} ${client.nom} ${client.prenom ?? ''} ?`)) return;
    await clientService.archiver(client.id_client, !client.archive);
    chargerClients();
  }

  if (!peutConsulter) {
    return <p className="text-slate-500">Vous n'avez pas accès à cette section.</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl font-bold">Clients</h1>
        {peutModifier && (
          <button onClick={() => setFicheOuverte('nouveau')}
            className="bg-primaire hover:bg-primaire-fonce text-white font-semibold px-4 py-2 rounded-lg text-sm transition">
            + Nouveau client
          </button>
        )}
      </div>

      {/* Barre de recherche + filtre archives */}
      <div className="flex gap-3 mb-4 items-center">
        <input
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder="Rechercher par nom, ville, téléphone, e-mail…"
          className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm
                     focus:outline-none focus:ring-2 focus:ring-primaire"
        />
        <label className="flex items-center gap-2 text-sm text-slate-600 whitespace-nowrap">
          <input type="checkbox" checked={avecArchives} onChange={(e) => setAvecArchives(e.target.checked)}
            className="accent-primaire" />
          Afficher les archivés
        </label>
      </div>

      {erreur && <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3 mb-4">{erreur}</div>}

      {/* Liste */}
      {chargement ? (
        <p className="text-slate-400 text-sm">Chargement…</p>
      ) : clients.length === 0 ? (
        <p className="text-slate-400 text-sm">Aucun client trouvé.</p>
      ) : (
        <div className="space-y-2">
          {clients.map((c) => (
            <div key={c.id_client}
              className={`bg-white rounded-xl border px-4 py-3 flex items-center gap-4
                          ${c.archive ? 'border-amber-200 opacity-70' : 'border-slate-200'}`}>

              {/* Infos principales */}
              <div className="flex-1 min-w-0">
                <span className="font-semibold text-slate-800">
                  {c.civilite} {c.nom} {c.prenom}
                </span>
                {!!c.archive && (
                  <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Archivé</span>
                )}
                <div className="text-xs text-slate-500 mt-0.5">
                  {[c.adresse1, c.code_postal && c.ville ? `${c.code_postal} ${c.ville}` : null]
                    .filter(Boolean).join(' — ')}
                </div>
                <div className="text-xs text-slate-400">
                  {[c.telephone, c.email].filter(Boolean).join(' · ')}
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <button onClick={() => setFicheOuverte(c)}
                  className="text-sm font-medium text-primaire hover:underline">
                  {peutModifier ? 'Modifier' : 'Consulter'}
                </button>
                {peutModifier && (
                  <button onClick={() => basculerArchivage(c)}
                    className={`text-sm font-medium ${c.archive ? 'text-green-600 hover:underline' : 'text-amber-600 hover:underline'}`}>
                    {c.archive ? 'Désarchiver' : 'Archiver'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fiche client (modale) */}
      {ficheOuverte !== null && (
        <FicheClient
          client={ficheOuverte === 'nouveau' ? null : ficheOuverte}
          peutModifier={peutModifier}
          onValider={validerFiche}
          onFermer={() => setFicheOuverte(null)}
        />
      )}
    </div>
  );
}
