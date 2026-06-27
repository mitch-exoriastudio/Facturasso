// =====================================================================
//  Page Configuration : 6 onglets (mentions, utilisateurs, e-mail,
//  prestations, modes paiement, superviseur).
// =====================================================================
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contextes/ContexteAuth.jsx';
import { useGardeNav } from '../contextes/ContexteGardeNav.jsx';
import { configService } from '../services/configService.js';
import ModalConfirmation from '../composants/ModalConfirmation.jsx';
import OngletMentions from './configuration/OngletMentions.jsx';
import OngletUtilisateurs from './configuration/OngletUtilisateurs.jsx';
import OngletEmail from './configuration/OngletEmail.jsx';
import OngletPrestations from './configuration/OngletPrestations.jsx';
import OngletModesPaiement from './configuration/OngletModesPaiement.jsx';
import OngletSuperviseur from './configuration/OngletSuperviseur.jsx';

const ONGLETS = [
  { id: 'mentions',     label: 'Mentions documents' },
  { id: 'utilisateurs', label: 'Paramètres utilisateurs' },
  { id: 'email',        label: "Envoi d'e-mails" },
  { id: 'prestations',  label: 'Liste prestations' },
  { id: 'paiements',    label: 'Modes de paiement' },
  { id: 'superviseur',  label: 'Options superviseur', adminSeulement: true },
];

export default function Configuration() {
  const { utilisateur } = useAuth();
  const { enregistrerGarde, libererGarde } = useGardeNav();
  const [onglet, setOnglet] = useState('mentions');
  const [params, setParams] = useState(null);
  const [chargement, setChargement] = useState(true);
  const [modifieEnCours, setModifieEnCours] = useState(false);

  // Action de navigation en attente de confirmation (onglet ou externe)
  const [actionBloquee, setActionBloquee] = useState(null);

  useEffect(() => {
    configService.getParametres()
      .then(p => { setParams(p); setChargement(false); });
  }, []);

  // Enregistre / libère la garde de navigation selon l'état dirty
  useEffect(() => {
    if (modifieEnCours) {
      enregistrerGarde((action) => setActionBloquee(() => action));
    } else {
      libererGarde();
      setActionBloquee(null);
    }
    return () => libererGarde();
  }, [modifieEnCours]);

  const changerOnglet = useCallback((id) => {
    setModifieEnCours(false);
    setOnglet(id);
    setActionBloquee(null);
  }, []);

  function demanderChangementOnglet(id) {
    if (modifieEnCours) {
      setActionBloquee(() => () => changerOnglet(id));
    } else {
      changerOnglet(id);
    }
  }

  if (chargement) return <p className="text-gray-400 dark:text-gray-500 text-sm">Chargement…</p>;
  if (!params) return <p className="text-red-500 text-sm">Erreur de chargement des paramètres.</p>;

  const ongletsVisibles = ONGLETS.filter(o => !o.adminSeulement || utilisateur?.droit_admin);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-5">Configuration</h1>

      {/* Barre d'onglets */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto overflow-y-hidden">
        {ongletsVisibles.map(o => (
          <button key={o.id} onClick={() => demanderChangementOnglet(o.id)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition rounded-t-lg
              ${onglet === o.id
                ? 'bg-white dark:bg-gray-950 border border-b-white dark:border-b-gray-950 border-gray-200 dark:border-gray-700 -mb-px text-primaire-fonce dark:text-primaire'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
            {o.label}
          </button>
        ))}
      </div>

      {/* Contenu de l'onglet actif */}
      <div>
        {onglet === 'mentions' && (
          <OngletMentions
            params={params}
            onMaj={p => setParams({ ...params, ...p })}
            onModifie={setModifieEnCours}
          />
        )}
        {onglet === 'utilisateurs' && (
          <OngletUtilisateurs utilisateurConnecte={utilisateur} />
        )}
        {onglet === 'email' && (
          <OngletEmail onModifie={setModifieEnCours} />
        )}
        {onglet === 'prestations' && (
          <OngletPrestations />
        )}
        {onglet === 'paiements' && (
          <OngletModesPaiement />
        )}
        {onglet === 'superviseur' && utilisateur?.droit_admin && (
          <OngletSuperviseur
            dernierNumero={params.facture_dernier_numero_interne}
            onMajNumero={n => setParams({ ...params, facture_dernier_numero_interne: n })}
          />
        )}
      </div>

      {/* Modale — navigation bloquée (onglet ou menu de gauche) */}
      <ModalConfirmation
        ouvert={actionBloquee !== null}
        variante="avertissement"
        titre="Modifications non enregistrées"
        message="Vous avez des modifications non enregistrées. Si vous continuez, elles seront perdues."
        labelConfirmer="Quitter sans enregistrer"
        labelAnnuler="Rester ici"
        onConfirmer={() => { actionBloquee?.(); setActionBloquee(null); }}
        onAnnuler={() => setActionBloquee(null)}
      />
    </div>
  );
}
