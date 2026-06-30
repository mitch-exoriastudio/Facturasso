// =====================================================================
//  Onglet 3 — Paramètres d'envoi d'e-mails (SMTP)
//  L'admin sélectionne un utilisateur et configure son compte e-mail.
// =====================================================================
import { useState, useMemo, useEffect } from 'react';
import { configService } from '../../services/configService.js';
import ChampNumerique from '../../composants/ChampNumerique.jsx';
import ModalConfirmation from '../../composants/ModalConfirmation.jsx';

const IconeOeil = ({ visible }) => visible
  ? <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
  : <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;

const CL = 'w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primaire';

const FORM_VIDE = {
  smtp_adresse: '', smtp_user: '', smtp_mot_de_passe: '',
  smtp_num_port: 587, smtp_option_secu: 'SMTPS',
  email_expediteur: '', email_cc: '', email_cci: '',
  email_envoi_fact_objet: '', email_envoi_fact_corps: '',
  signature_img: null,
};

function normaliserForm(data) {
  return { ...FORM_VIDE, smtp_mot_de_passe: '', ...(data || {}) };
}

function estModifie(a, b) {
  return JSON.stringify(a) !== JSON.stringify(b);
}

export default function OngletEmail({ onModifie }) {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [idSelectionne, setIdSelectionne] = useState(null);
  const [idEnAttente, setIdEnAttente] = useState(null);
  const [form, setForm] = useState(FORM_VIDE);
  const [reference, setReference] = useState(FORM_VIDE);
  const [sauvegarde, setSauvegarde] = useState(false);
  const [erreur, setErreur] = useState('');
  const [montrerMdp, setMontrerMdp] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [enCours, setEnCours] = useState(false);

  const modifie = useMemo(() => estModifie(form, reference), [form, reference]);
  useEffect(() => { onModifie?.(modifie); }, [modifie]);

  useEffect(() => {
    configService.getUtilisateurs({}).then(data => {
      // Le compte superviseur n'est jamais sélectionnable pour l'envoi d'e-mails.
      const liste = data.filter(u => !u.compte_superviseur);
      setUtilisateurs(liste);
      if (liste.length > 0) setIdSelectionne(liste[0].id_utilisateur);
    });
  }, []);

  useEffect(() => {
    if (!idSelectionne) return;
    setChargement(true);
    setSauvegarde(false); setErreur('');
    configService.getEmail(idSelectionne)
      .then(data => {
        const forme = normaliserForm(data);
        setForm(forme);
        setReference(forme);
      })
      .catch(() => {
        setForm(FORM_VIDE);
        setReference(FORM_VIDE);
      })
      .finally(() => setChargement(false));
  }, [idSelectionne]);

  const maj = (champ) => (e) => setForm(f => ({ ...f, [champ]: e.target.value }));

  function demanderChangementUtilisateur(id) {
    if (modifie) {
      setIdEnAttente(id);
    } else {
      setIdSelectionne(id);
    }
  }

  function chargerSignature(e) {
    const fichier = e.target.files[0];
    if (!fichier) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm(f => ({ ...f, signature_img: ev.target.result }));
    reader.readAsDataURL(fichier);
  }

  async function sauvegarder(e) {
    e.preventDefault();
    setSauvegarde(false); setErreur('');
    setEnCours(true);
    try {
      await configService.putEmail(idSelectionne, form);
      setReference({ ...form });
      setSauvegarde(true);
      setTimeout(() => setSauvegarde(false), 2000);
    } catch { setErreur('Erreur lors de la sauvegarde.'); }
    finally { setEnCours(false); }
  }

  const nomSelectionne = utilisateurs.find(u => u.id_utilisateur === idSelectionne)?.nom_utilisateur ?? '';

  return (
    <div className="max-w-5xl">
      {/* Sélecteur d'utilisateur */}
      <div className="flex items-center gap-3 mb-6 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
        <label className="text-sm font-medium text-gray-600 dark:text-gray-300 whitespace-nowrap">
          Compte utilisateur :
        </label>
        <select
          value={idSelectionne ?? ''}
          onChange={e => demanderChangementUtilisateur(Number(e.target.value))}
          className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primaire"
        >
          {utilisateurs.map(u => (
            <option key={u.id_utilisateur} value={u.id_utilisateur}>{u.nom_utilisateur}</option>
          ))}
        </select>
      </div>

      {chargement && <p className="text-gray-400 dark:text-gray-500 text-sm">Chargement…</p>}

      {!chargement && idSelectionne && (
        <form onSubmit={sauvegarder} autoComplete="off" className="space-y-5 pb-20">
          {erreur && <div className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">{erreur}</div>}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* ── Colonne gauche : comment ça part ── */}
            <div className="space-y-4">

              <Section titre={`Compte expéditeur — ${nomSelectionne}`}>
                <Champ label="Identifiant (login)" value={form.smtp_user} onChange={maj('smtp_user')} />
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Mot de passe
                    <span className="ml-1 font-normal text-gray-400 dark:text-gray-500">(laisser vide = inchangé)</span>
                  </label>
                  <div className="relative">
                    <input type={montrerMdp ? 'text' : 'password'} value={form.smtp_mot_de_passe}
                      onChange={maj('smtp_mot_de_passe')} autoComplete="new-password"
                      className={CL + ' pr-9'} />
                    <button type="button" onClick={() => setMontrerMdp(v => !v)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-200"
                      title={montrerMdp ? 'Masquer' : 'Afficher'}>
                      <IconeOeil visible={montrerMdp} />
                    </button>
                  </div>
                </div>
                <Champ label="Adresse e-mail de l'expéditeur" value={form.email_expediteur} onChange={maj('email_expediteur')} />
              </Section>

              <Section titre="Serveur SMTP">
                <Champ label="Adresse du serveur" value={form.smtp_adresse} onChange={maj('smtp_adresse')} />
                <div className="grid grid-cols-3 gap-3 items-end">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Port</label>
                    <ChampNumerique value={form.smtp_num_port} onChange={maj('smtp_num_port')} min={1} max={65535} className={CL} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-2">Protocole de sécurité</label>
                    <div className="flex gap-4 py-2">
                      {['AUCUN', 'SMTPS', 'TLS'].map(s => (
                        <label key={s} className="flex items-center gap-1.5 text-sm cursor-pointer">
                          <input type="radio" value={s} checked={form.smtp_option_secu === s}
                            onChange={() => setForm(f => ({ ...f, smtp_option_secu: s }))}
                            className="accent-primaire" />
                          {s}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </Section>

              <Section titre="Copies automatiques">
                <div className="grid grid-cols-2 gap-3">
                  <Champ label="CC" value={form.email_cc} onChange={maj('email_cc')} />
                  <Champ label="CCI" value={form.email_cci} onChange={maj('email_cci')} />
                </div>
                <button type="button" disabled
                  title="Disponible une fois l'envoi de factures par e-mail implémenté (lot 5)"
                  className="w-full border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-600 font-semibold px-6 py-2 rounded-lg cursor-not-allowed select-none text-sm">
                  Envoyer un e-mail de test
                </button>
              </Section>

            </div>

            {/* ── Colonne droite : ce qui part ── */}
            <div className="space-y-4">

              <Section titre="Modèle de message">
                <Champ label="Objet" value={form.email_envoi_fact_objet} onChange={maj('email_envoi_fact_objet')} />
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Corps du message</label>
                  <textarea value={form.email_envoi_fact_corps} onChange={maj('email_envoi_fact_corps')}
                    rows={10}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-primaire font-mono" />
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    HTML basique accepté : &lt;b&gt;, &lt;br&gt;, &lt;a href="…"&gt;, etc.
                  </p>
                </div>
              </Section>

              <Section titre="Signature">
                <div className="flex flex-col gap-3">
                  {form.signature_img
                    ? <img src={form.signature_img} alt="Signature"
                        className="max-h-36 w-full object-contain border border-gray-200 dark:border-gray-700 rounded-lg p-2 bg-white dark:bg-gray-900" />
                    : <div className="h-36 w-full bg-gray-100 dark:bg-gray-800 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center text-sm text-gray-400 dark:text-gray-500">
                        Aucune signature chargée
                      </div>
                  }
                  <div className="flex justify-end gap-3">
                    <label className="cursor-pointer bg-primaire-clair dark:bg-primaire/20 text-primaire-fonce dark:text-primaire text-xs font-medium px-4 py-2 rounded-lg hover:bg-primaire hover:text-white dark:hover:bg-primaire dark:hover:text-white transition">
                      Charger une signature
                      <input type="file" accept="image/*" onChange={chargerSignature} className="hidden" />
                    </label>
                    {form.signature_img && (
                      <button type="button" onClick={() => setForm(f => ({ ...f, signature_img: null }))}
                        className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400 transition">
                        Supprimer
                      </button>
                    )}
                  </div>
                </div>
              </Section>

            </div>
          </div>

          {/* Barre sticky — modifications non enregistrées */}
          <div className={`fixed bottom-0 left-0 lg:left-64 right-0 z-40 transition-transform duration-300 ${modifie || sauvegarde ? 'translate-y-0' : 'translate-y-full'}`}>
            <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg px-6 py-3 flex items-center gap-4">
              <button type="submit" disabled={enCours || !modifie}
                className="bg-primaire hover:bg-primaire-fonce dark:bg-primaire-fonce dark:hover:bg-primaire disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-5 py-2 rounded-lg transition whitespace-nowrap">
                {enCours ? 'Enregistrement…' : 'Enregistrer'}
              </button>
              <span className={`text-sm ${sauvegarde ? 'text-green-600 dark:text-green-400' : 'text-amber-600 dark:text-amber-400'}`}>
                {sauvegarde ? 'Enregistré !' : 'Modifications non enregistrées'}
              </span>
            </div>
          </div>
        </form>
      )}

      {/* Modale — changement d'utilisateur avec modifications en cours */}
      <ModalConfirmation
        ouvert={idEnAttente !== null}
        variante="avertissement"
        titre="Modifications non enregistrées"
        message="Vous avez des modifications non enregistrées. Si vous changez d'utilisateur, elles seront perdues."
        labelConfirmer="Changer quand même"
        labelAnnuler="Rester ici"
        onConfirmer={() => { setIdSelectionne(idEnAttente); setIdEnAttente(null); }}
        onAnnuler={() => setIdEnAttente(null)}
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

function Champ({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">{label}</label>
      <input value={value ?? ''} onChange={onChange} autoComplete="off"
        className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primaire" />
    </div>
  );
}
