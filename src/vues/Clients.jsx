'use client';
// =====================================================================
//  Page Clients : liste, recherche, archivage, ouverture de la fiche.
// =====================================================================
import { useState, useEffect, useCallback } from 'react';
import { Users, Plus, Search, Archive, ArchiveRestore, Pencil, Eye, UserCircle2 } from 'lucide-react';
import { useAuth } from '../contextes/ContexteAuth.jsx';
import { clientService } from '../services/clientService.js';
import FicheClient from '../composants/FicheClient.jsx';
import ModalConfirmation from '../composants/ModalConfirmation.jsx';
import { SqueletteClients } from '../composants/Squelette.jsx';

export default function Clients() {
  const { utilisateur } = useAuth();
  const peutModifier = utilisateur?.droit_admin || utilisateur?.droit_ajout_clients;
  const peutConsulter = utilisateur?.droit_admin || utilisateur?.droit_consult_clients;

  const [clients, setClients]         = useState([]);
  const [recherche, setRecherche]     = useState('');
  const [avecArchives, setAvecArchives] = useState(false);
  const [chargement, setChargement]   = useState(false);
  const [erreur, setErreur]           = useState('');

  // Fiche ouverte : null = fermée, 'nouveau' = création, objet = modification.
  const [ficheOuverte, setFicheOuverte] = useState(null);

  // Confirmation d'archivage : null = fermée, sinon { client, e }.
  const [confirmArchive, setConfirmArchive] = useState(null);

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

  function demanderArchivage(client, e) {
    e.stopPropagation();
    setConfirmArchive(client);
  }

  async function confirmerArchivage() {
    const client = confirmArchive;
    setConfirmArchive(null);
    await clientService.archiver(client.id_client, !client.archive);
    chargerClients();
  }

  if (!peutConsulter) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 dark:text-gray-600">
        <UserCircle2 size={48} className="mb-3 opacity-40" />
        <p>Vous n'avez pas accès à cette section.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-4xl">

      {/* En-tête */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Users size={24} className="text-primaire" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Clients</h1>
        </div>
        {peutModifier && (
          <button
            onClick={() => setFicheOuverte('nouveau')}
            className="flex items-center gap-2 bg-primaire hover:bg-primaire-fonce dark:bg-primaire-fonce dark:hover:bg-primaire text-white font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors shadow-sm"
          >
            <Plus size={16} />
            Nouveau client
          </button>
        )}
      </div>

      {/* Barre de filtres */}
      <div className="flex gap-3 items-center flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={recherche}
            onChange={(e) => setRecherche(e.target.value)}
            placeholder="Rechercher par nom, ville, téléphone, e-mail…"
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primaire placeholder:text-gray-400 dark:placeholder:text-gray-600"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap cursor-pointer select-none">
          <input
            type="checkbox"
            checked={avecArchives}
            onChange={(e) => setAvecArchives(e.target.checked)}
            className="accent-primaire w-4 h-4"
          />
          Afficher les archivés
        </label>
      </div>

      {erreur && (
        <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3">
          {erreur}
        </div>
      )}

      {/* Liste */}
      {chargement ? (
        <SqueletteClients />
      ) : clients.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400 dark:text-gray-600">
          <Users size={40} className="mb-3 opacity-40" />
          <p className="text-sm">Aucun client trouvé.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {clients.map((c) => (
            <div
              key={c.id_client}
              className={`group bg-white dark:bg-gray-800 rounded-2xl border px-4 py-3.5 flex items-center gap-4 transition-shadow hover:shadow-md cursor-pointer ${
                c.archive
                  ? 'border-amber-200 dark:border-amber-800/40 opacity-70'
                  : 'border-gray-100 dark:border-gray-700/50'
              }`}
              onClick={() => setFicheOuverte(c)}
            >
              {/* Avatar icône */}
              <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center ${
                c.archive ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-primaire/10 dark:bg-primaire/20'
              }`}>
                <UserCircle2 size={20} className={c.archive ? 'text-amber-500' : 'text-primaire'} />
              </div>

              {/* Infos */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-gray-800 dark:text-gray-100">
                    {[c.civilite, c.nom, c.prenom].filter(Boolean).join(' ')}
                  </span>
                  {!!c.archive && (
                    <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full font-medium">
                      Archivé
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                  {[
                    c.adresse1,
                    c.code_postal && c.ville ? `${c.code_postal} ${c.ville}` : c.ville || c.code_postal,
                  ].filter(Boolean).join(' — ')}
                </div>
                {(c.telephone || c.email) && (
                  <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                    {[c.telephone, c.email].filter(Boolean).join(' · ')}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.stopPropagation(); setFicheOuverte(c); }}
                  title={peutModifier ? 'Modifier' : 'Consulter'}
                  className="p-2 rounded-lg text-primaire hover:bg-primaire/10 dark:hover:bg-primaire/20 transition-colors"
                >
                  {peutModifier ? <Pencil size={15} /> : <Eye size={15} />}
                </button>
                {peutModifier && (
                  <button
                    onClick={(e) => demanderArchivage(c, e)}
                    title={c.archive ? 'Désarchiver' : 'Archiver'}
                    className={`p-2 rounded-lg transition-colors ${
                      c.archive
                        ? 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
                        : 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                    }`}
                  >
                    {c.archive ? <ArchiveRestore size={15} /> : <Archive size={15} />}
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

      {/* Confirmation archivage */}
      <ModalConfirmation
        ouvert={confirmArchive !== null}
        variante="avertissement"
        titre={confirmArchive?.archive ? 'Désarchiver ce client ?' : 'Archiver ce client ?'}
        message={
          confirmArchive
            ? [confirmArchive.civilite, confirmArchive.nom, confirmArchive.prenom].filter(Boolean).join(' ')
            : ''
        }
        labelConfirmer={confirmArchive?.archive ? 'Désarchiver' : 'Archiver'}
        onConfirmer={confirmerArchivage}
        onAnnuler={() => setConfirmArchive(null)}
      />
    </div>
  );
}
