// =====================================================================
//  Onglet 2 — Gestion des utilisateurs et de leurs droits
//  Interface master-detail : liste des comptes à gauche, formulaire des
//  droits à droite. Responsive (empilement vertical sous lg).
// =====================================================================
import { useState, useEffect, useMemo } from 'react';
import { Plus, ChevronRight, Eye, EyeOff, UserCog, ShieldCheck, Lock, Trash2 } from 'lucide-react';
import { configService } from '../../services/configService.js';
import ModalConfirmation from '../../composants/ModalConfirmation.jsx';
import { useToast } from '../../contextes/ContexteToast.jsx';

// Liste à plat des droits (sert pour le formulaire vide et le « tout cocher » admin).
const DROITS = [
  { cle: 'droit_admin',           label: 'Administrateur (tous les droits)' },
  { cle: 'droit_consult_fac',     label: 'Consulter les factures' },
  { cle: 'droit_ajout_fac',       label: 'Ajouter des factures' },
  { cle: 'droit_consult_paiem',   label: 'Consulter les paiements' },
  { cle: 'droit_ajout_paiem',     label: 'Ajouter / modifier des paiements' },
  { cle: 'droit_consult_clients', label: 'Consulter les clients' },
  { cle: 'droit_ajout_clients',   label: 'Ajouter / modifier des clients' },
  { cle: 'droit_config',          label: 'Configuration de l\'application' },
];

// Droits regroupés par domaine pour l'affichage (hors « admin », traité à part).
const GROUPES = [
  { titre: 'Factures', droits: [
    { cle: 'droit_consult_fac', label: 'Consulter' },
    { cle: 'droit_ajout_fac',   label: 'Ajouter / modifier (brouillons)' },
  ] },
  { titre: 'Paiements', droits: [
    { cle: 'droit_consult_paiem', label: 'Consulter' },
    { cle: 'droit_ajout_paiem',   label: 'Ajouter / modifier' },
  ] },
  { titre: 'Clients', droits: [
    { cle: 'droit_consult_clients', label: 'Consulter' },
    { cle: 'droit_ajout_clients',   label: 'Ajouter / modifier' },
  ] },
  { titre: 'Application', droits: [
    { cle: 'droit_config', label: 'Configuration de l\'application' },
  ] },
];

const FORM_VIDE = {
  nom_utilisateur: '', mot_de_passe: '', compte_desactive: false,
  droit_admin: false, droit_consult_fac: false, droit_ajout_fac: false,
  droit_consult_paiem: false, droit_ajout_paiem: false,
  droit_consult_clients: false, droit_ajout_clients: false, droit_config: false,
};

const CL = 'w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primaire';

function estModifie(a, b) {
  return JSON.stringify(a) !== JSON.stringify(b);
}

// Initiales pour la pastille (1 à 2 caractères).
function initiales(nom) {
  if (!nom) return '?';
  const mots = nom.trim().split(/\s+/);
  if (mots.length > 1) return (mots[0][0] + mots[1][0]).toUpperCase();
  return nom.slice(0, 2).toUpperCase();
}

// Résumé du rôle affiché dans la liste.
function resumeRole(u) {
  if (u.compte_superviseur) return 'Superviseur';
  if (u.droit_admin) return 'Administrateur';
  const nb = DROITS.filter(d => d.cle !== 'droit_admin' && u[d.cle]).length;
  if (nb === 0) return 'Aucun droit';
  return `${nb} droit${nb > 1 ? 's' : ''}`;
}

export default function OngletUtilisateurs({ utilisateurConnecte, onModifie }) {
  const toast = useToast();
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [avecDesactives, setAvecDesactives] = useState(false);
  const [selectionne, setSelectionne] = useState(null); // utilisateur sélectionné
  const [form, setForm] = useState(FORM_VIDE);
  const [reference, setReference] = useState(null);      // état de référence (null = rien d'ouvert)
  const [message, setMessage] = useState('');
  const [estNouveau, setEstNouveau] = useState(false);
  const [montrerMdp, setMontrerMdp] = useState(false);
  const [enCours, setEnCours] = useState(false);
  const [actionEnAttente, setActionEnAttente] = useState(null); // garde changement de sélection
  const [suppressionCible, setSuppressionCible] = useState(null); // utilisateur en attente de suppression
  const [suppressionEnCours, setSuppressionEnCours] = useState(false);

  // Reproduit côté client les règles d'autorisation du back (le back reste l'autorité).
  // Détermine si l'utilisateur connecté peut supprimer/désactiver le compte u.
  function peutSupprimer(u) {
    if (!utilisateurConnecte) return false;
    if (u.id_utilisateur === utilisateurConnecte.id_utilisateur) return false; // pas soi-même
    if (u.compte_superviseur) return false;                                    // jamais le superviseur
    if (utilisateurConnecte.compte_superviseur) return true;                   // superviseur : tout
    if (!utilisateurConnecte.droit_admin) return false;                        // non-admin : rien
    return !u.droit_admin;                                                     // admin : non-admins seulement
  }

  async function confirmerSuppression() {
    if (!suppressionCible) return;
    setSuppressionEnCours(true);
    try {
      const res = await configService.supprimerUtilisateur(suppressionCible.id_utilisateur);
      toast.succes(res.message || 'Compte traité.');
      // Si le compte affiché vient d'être supprimé/désactivé, on referme le détail.
      if (selectionne?.id_utilisateur === suppressionCible.id_utilisateur) {
        setSelectionne(null);
        setEstNouveau(false);
        setReference(null);
        setForm(FORM_VIDE);
      }
      setSuppressionCible(null);
      await charger();
    } catch (err) {
      toast.erreur(err.response?.data?.message || 'Suppression impossible.');
      setSuppressionCible(null);
    } finally {
      setSuppressionEnCours(false);
    }
  }

  const ouvert = selectionne !== null || estNouveau;
  const modifie = useMemo(() => ouvert && reference !== null && estModifie(form, reference), [form, reference, ouvert]);

  useEffect(() => { charger(); }, [avecDesactives]);
  useEffect(() => { onModifie?.(modifie); }, [modifie]);

  async function charger() {
    const data = await configService.getUtilisateurs(avecDesactives ? { desactives: '1' } : {});
    setUtilisateurs(data);
    return data;
  }

  // Bascule réellement la sélection (sans garde).
  function ouvrirUtilisateur(u) {
    const f = { ...u, mot_de_passe: '' };
    setSelectionne(u);
    setEstNouveau(false);
    setForm(f);
    setReference(f);
    setMessage('');
    setMontrerMdp(false);
  }

  function ouvrirNouveau() {
    setSelectionne(null);
    setEstNouveau(true);
    setForm(FORM_VIDE);
    setReference(FORM_VIDE);
    setMessage('');
    setMontrerMdp(false);
  }

  // Les deux entrées passent par la garde anti-perte de modifications.
  function demanderSelection(u) {
    if (selectionne?.id_utilisateur === u.id_utilisateur && !estNouveau) return;
    if (modifie) setActionEnAttente(() => () => ouvrirUtilisateur(u));
    else ouvrirUtilisateur(u);
  }

  function demanderNouveau() {
    if (modifie) setActionEnAttente(() => () => ouvrirNouveau());
    else ouvrirNouveau();
  }

  const majDroit = (cle) => (e) => {
    let f = { ...form, [cle]: e.target.checked };
    // L'admin coche automatiquement tous les droits.
    if (cle === 'droit_admin' && e.target.checked) {
      DROITS.forEach(d => { f[d.cle] = true; });
    }
    setForm(f);
  };

  async function sauvegarder(e) {
    e.preventDefault();
    setMessage('');
    setEnCours(true);
    try {
      if (estNouveau) {
        await configService.postUtilisateur(form);
        const data = await charger();
        // Sélectionne le compte fraîchement créé.
        const cree = data.find(u => u.nom_utilisateur === form.nom_utilisateur);
        if (cree) ouvrirUtilisateur(cree);
      } else {
        await configService.putUtilisateur(selectionne.id_utilisateur, form);
        const data = await charger();
        const maj = data.find(u => u.id_utilisateur === selectionne.id_utilisateur);
        setSelectionne(maj ?? selectionne);
        setReference({ ...form });
      }
      setMessage('Enregistré !');
      setTimeout(() => setMessage(''), 2000);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Erreur lors de la sauvegarde.');
    } finally {
      setEnCours(false);
    }
  }

  const enErreur = message && message !== 'Enregistré !';
  const adminVerrouille = !estNouveau && selectionne?.id_utilisateur === utilisateurConnecte?.id_utilisateur;
  const estProprietaire = selectionne?.id_utilisateur === utilisateurConnecte?.id_utilisateur;
  const formulaireBloque = !estNouveau && !!selectionne?.compte_superviseur && !estProprietaire;

  return (
    <div className="flex flex-col lg:flex-row gap-6 max-w-5xl">

      {/* ── Liste des utilisateurs ───────────────────────────────── */}
      <div className="lg:w-72 shrink-0">
        {/* Bouton épinglé en haut : ne sort jamais de l'écran */}
        <button onClick={demanderNouveau}
          className="w-full flex items-center justify-center gap-2 bg-primaire hover:bg-primaire-fonce dark:bg-primaire-fonce dark:hover:bg-primaire text-white text-sm font-medium py-2 rounded-lg transition mb-3">
          <Plus className="w-4 h-4" /> Nouvel utilisateur
        </button>

        <label className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-2 px-1">
          <input type="checkbox" checked={avecDesactives} onChange={e => setAvecDesactives(e.target.checked)}
            className="accent-primaire" />
          Afficher les comptes désactivés
        </label>

        <div className="space-y-1 lg:max-h-[28rem] overflow-y-auto pr-1">
          {utilisateurs.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500 px-3 py-4">Aucun compte.</p>
          )}
          {utilisateurs.map(u => {
            const actif = selectionne?.id_utilisateur === u.id_utilisateur && !estNouveau;
            return (
              <div key={u.id_utilisateur} role="button" tabIndex={0}
                onClick={() => demanderSelection(u)}
                onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); demanderSelection(u); } }}
                className={`group w-full flex items-center gap-3 text-left px-3 py-2 rounded-lg transition border cursor-pointer
                  ${actif
                    ? 'bg-primaire-clair dark:bg-primaire/20 border-primaire/40 dark:border-primaire/40'
                    : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                {/* Pastille initiales */}
                <span className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold
                  ${u.compte_desactive
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                    : actif
                      ? 'bg-primaire text-white'
                      : 'bg-primaire-clair dark:bg-primaire/20 text-primaire-fonce dark:text-primaire'}`}>
                  {initiales(u.nom_utilisateur)}
                </span>
                {/* Nom + rôle */}
                <span className="min-w-0 flex-1">
                  <span className={`flex items-center gap-1.5 text-sm font-medium truncate
                    ${actif ? 'text-primaire-fonce dark:text-primaire' : 'text-gray-700 dark:text-gray-200'}`}>
                    {u.droit_admin && <ShieldCheck className="w-3.5 h-3.5 shrink-0" />}
                    {u.compte_superviseur && <Lock className="w-3 h-3 shrink-0 text-amber-500" />}
                    {u.nom_utilisateur}
                  </span>
                  <span className="block text-xs text-gray-400 dark:text-gray-500 truncate">
                    {!!u.compte_desactive && <span className="text-amber-500 dark:text-amber-400">Désactivé · </span>}
                    {resumeRole(u)}
                  </span>
                </span>
                {peutSupprimer(u) && (
                  <button type="button"
                    onClick={e => { e.stopPropagation(); setSuppressionCible(u); }}
                    title="Supprimer le compte"
                    className="shrink-0 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 focus:opacity-100 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <ChevronRight className={`w-4 h-4 shrink-0 ${actif ? 'text-primaire' : 'text-gray-300 dark:text-gray-600'}`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Détail / formulaire ──────────────────────────────────── */}
      <div className="flex-1 min-w-0">
        {!ouvert ? (
          // État vide explicite
          <div className="h-full min-h-[16rem] flex flex-col items-center justify-center text-center border border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 text-gray-400 dark:text-gray-500">
            <UserCog className="w-10 h-10 mb-3 opacity-60" />
            <p className="text-sm">Sélectionnez un compte dans la liste<br />ou créez un nouvel utilisateur.</p>
          </div>
        ) : (
          <form autoComplete="off" onSubmit={sauvegarder} className="space-y-5 pb-20">
            <div className="flex items-center gap-3">
              <span className="shrink-0 w-10 h-10 rounded-full bg-primaire-clair dark:bg-primaire/20 text-primaire-fonce dark:text-primaire flex items-center justify-center text-sm font-semibold">
                {estNouveau ? <Plus className="w-5 h-5" /> : initiales(form.nom_utilisateur)}
              </span>
              <div>
                <h3 className="text-base font-semibold text-gray-800 dark:text-gray-100">
                  {estNouveau ? 'Nouvel utilisateur' : form.nom_utilisateur}
                </h3>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {estNouveau ? 'Renseignez les informations puis enregistrez.' : 'Modifiez les informations et les droits du compte.'}
                </p>
              </div>
            </div>

            {formulaireBloque && (
              <div className="flex items-center gap-2 text-sm rounded-lg p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
                <Lock className="w-4 h-4 shrink-0" />
                Ce compte superviseur ne peut être modifié que par lui-même.
              </div>
            )}

            {enErreur && (
              <div className="text-sm rounded-lg p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                {message}
              </div>
            )}

            {/* Identifiants */}
            <Section titre="Identifiants">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Nom d'utilisateur</label>
                  <input value={form.nom_utilisateur}
                    onChange={e => setForm(f => ({ ...f, nom_utilisateur: e.target.value.toUpperCase() }))}
                    autoComplete="off" disabled={formulaireBloque} className={CL} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Mot de passe {!estNouveau && <span className="text-gray-400 dark:text-gray-500">(laisser vide = inchangé)</span>}
                  </label>
                  <div className="relative">
                    {/* type="text" masqué via -webkit-text-security : le navigateur ne le
                        reconnaît pas comme champ de mot de passe → pas de prompt « enregistrer ». */}
                    <input type="text" value={form.mot_de_passe}
                      onChange={e => setForm(f => ({ ...f, mot_de_passe: e.target.value }))}
                      name="mdp-nouveau-compte" autoComplete="off"
                      data-lpignore="true" data-1p-ignore data-form-type="other"
                      disabled={formulaireBloque}
                      style={{ WebkitTextSecurity: montrerMdp ? 'none' : 'disc' }}
                      className={CL + ' pr-9'} />
                    <button type="button" onClick={() => setMontrerMdp(v => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-200"
                      title={montrerMdp ? 'Masquer' : 'Afficher'}>
                      {montrerMdp ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              <label className={`flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 ${formulaireBloque || selectionne?.compte_superviseur ? 'opacity-50 cursor-not-allowed' : ''}`}>
                <input type="checkbox" checked={!!form.compte_desactive}
                  onChange={e => setForm(f => ({ ...f, compte_desactive: e.target.checked }))}
                  disabled={formulaireBloque || !!selectionne?.compte_superviseur}
                  className="accent-primaire" />
                Compte désactivé
              </label>
            </Section>

            {/* Droits */}
            <Section titre="Droits d'accès">
              {/* Toggle administrateur mis en avant */}
              <label className={`flex items-start gap-3 rounded-lg p-3 border cursor-pointer transition
                ${form.droit_admin
                  ? 'border-primaire/40 bg-primaire-clair dark:bg-primaire/10'
                  : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50'}
                ${adminVerrouille || formulaireBloque ? 'opacity-60 cursor-not-allowed' : ''}`}>
                <input type="checkbox" checked={!!form.droit_admin} onChange={majDroit('droit_admin')}
                  disabled={adminVerrouille || formulaireBloque}
                  className="accent-primaire w-4 h-4 mt-0.5" />
                <span>
                  <span className="flex items-center gap-1.5 text-sm font-medium text-gray-800 dark:text-gray-100">
                    <ShieldCheck className="w-4 h-4 text-primaire" /> Administrateur
                  </span>
                  <span className="block text-xs text-gray-500 dark:text-gray-400">
                    Accorde automatiquement tous les droits ci-dessous.
                    {adminVerrouille && ' Vous ne pouvez pas retirer vos propres droits admin.'}
                  </span>
                </span>
              </label>

              {/* Droits fins regroupés par domaine */}
              <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 ${form.droit_admin ? 'opacity-50' : ''}`}>
                {GROUPES.map(g => (
                  <div key={g.titre} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">{g.titre}</p>
                    <div className="space-y-2">
                      {g.droits.map(d => (
                        <label key={d.cle} className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                          <input type="checkbox" checked={!!form[d.cle]} onChange={majDroit(d.cle)}
                            disabled={form.droit_admin || formulaireBloque}
                            className="accent-primaire w-4 h-4" />
                          {d.label}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Barre sticky — modifications non enregistrées */}
            <div className={`fixed bottom-0 left-0 lg:left-64 right-0 z-40 transition-transform duration-300 ${!formulaireBloque && (modifie || message === 'Enregistré !') ? 'translate-y-0' : 'translate-y-full'}`}>
              <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg px-6 py-3 flex items-center gap-4">
                <button type="submit" disabled={enCours || !modifie}
                  className="bg-primaire hover:bg-primaire-fonce dark:bg-primaire-fonce dark:hover:bg-primaire disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-5 py-2 rounded-lg transition whitespace-nowrap">
                  {enCours ? 'Enregistrement…' : 'Enregistrer'}
                </button>
                <span className={`text-sm ${message === 'Enregistré !' ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                  {message === 'Enregistré !' ? 'Enregistré !' : 'Modifications non enregistrées'}
                </span>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Modale — changement de sélection avec modifications en cours */}
      <ModalConfirmation
        ouvert={actionEnAttente !== null}
        variante="avertissement"
        titre="Modifications non enregistrées"
        message="Vous avez des modifications non enregistrées. Si vous changez de compte, elles seront perdues."
        labelConfirmer="Changer quand même"
        labelAnnuler="Rester ici"
        onConfirmer={() => { actionEnAttente?.(); setActionEnAttente(null); }}
        onAnnuler={() => setActionEnAttente(null)}
      />

      {/* Modale — suppression / désactivation d'un compte */}
      <ModalConfirmation
        ouvert={suppressionCible !== null}
        variante="danger"
        titre={`Supprimer « ${suppressionCible?.nom_utilisateur ?? ''} » ?`}
        message="Le compte sera supprimé définitivement s'il n'a aucune activité (factures, brouillons, paiements). Sinon il sera simplement désactivé, pour préserver la traçabilité."
        labelConfirmer={suppressionEnCours ? 'Suppression…' : 'Supprimer'}
        labelAnnuler="Annuler"
        onConfirmer={confirmerSuppression}
        onAnnuler={() => { if (!suppressionEnCours) setSuppressionCible(null); }}
      />
    </div>
  );
}

function Section({ titre, children }) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-700 pb-1">{titre}</h3>
      {children}
    </div>
  );
}
