// =====================================================================
//  Onglet 3 — Paramètres d'envoi d'e-mails (SMTP)
//  L'admin sélectionne un utilisateur et configure son compte e-mail.
// =====================================================================
import { useState, useEffect } from 'react';
import { configService } from '../../services/configService.js';

const IconeOeil = ({ visible }) => visible
  ? <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
  : <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;

const CL = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primaire';

const FORM_VIDE = {
  smtp_adresse: '', smtp_user: '', smtp_mot_de_passe: '',
  smtp_num_port: 587, smtp_option_secu: 'SMTPS',
  email_expediteur: '', email_cc: '', email_cci: '',
  email_envoi_fact_objet: '', email_envoi_fact_corps: '',
  signature_img: null, signature_hauteur: '', signature_largeur: '',
};

export default function OngletEmail() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [idSelectionne, setIdSelectionne] = useState(null);
  const [form, setForm] = useState(FORM_VIDE);
  const [message, setMessage] = useState('');
  const [erreur, setErreur] = useState('');
  const [montrerMdp, setMontrerMdp] = useState(false);
  const [chargement, setChargement] = useState(false);

  useEffect(() => {
    configService.getUtilisateurs({}).then(data => {
      setUtilisateurs(data);
      if (data.length > 0) setIdSelectionne(data[0].id_utilisateur);
    });
  }, []);

  useEffect(() => {
    if (!idSelectionne) return;
    setChargement(true);
    setMessage(''); setErreur('');
    configService.getEmail(idSelectionne)
      .then(data => setForm({ ...FORM_VIDE, smtp_mot_de_passe: '', ...(data || {}) }))
      .catch(() => setForm(FORM_VIDE))
      .finally(() => setChargement(false));
  }, [idSelectionne]);

  const maj = (champ) => (e) => setForm(f => ({ ...f, [champ]: e.target.value }));

  function chargerSignature(e) {
    const fichier = e.target.files[0];
    if (!fichier) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm(f => ({ ...f, signature_img: ev.target.result }));
    reader.readAsDataURL(fichier);
  }

  async function sauvegarder(e) {
    e.preventDefault();
    setMessage(''); setErreur('');
    try {
      await configService.putEmail(idSelectionne, form);
      setMessage('Configuration enregistrée !');
      setTimeout(() => setMessage(''), 3000);
    } catch { setErreur('Erreur lors de la sauvegarde.'); }
  }

  const nomSelectionne = utilisateurs.find(u => u.id_utilisateur === idSelectionne)?.nom_utilisateur ?? '';

  return (
    <div className="max-w-4xl">
      {/* Sélecteur d'utilisateur */}
      <div className="flex items-center gap-3 mb-6 p-3 bg-slate-50 border border-slate-200 rounded-lg">
        <label className="text-sm font-medium text-slate-600 whitespace-nowrap">
          Compte utilisateur :
        </label>
        <select
          value={idSelectionne ?? ''}
          onChange={e => setIdSelectionne(Number(e.target.value))}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primaire bg-white"
        >
          {utilisateurs.map(u => (
            <option key={u.id_utilisateur} value={u.id_utilisateur}>{u.nom_utilisateur}</option>
          ))}
        </select>
      </div>

      {chargement && <p className="text-slate-400 text-sm">Chargement…</p>}

      {!chargement && idSelectionne && (
        <form onSubmit={sauvegarder} autoComplete="off">
          {message && <div className="text-sm text-green-700 bg-green-50 rounded-lg p-3 mb-4">{message}</div>}
          {erreur && <div className="text-sm text-red-600 bg-red-50 rounded-lg p-3 mb-4">{erreur}</div>}

          <div className="grid grid-cols-2 gap-8">
            {/* Colonne gauche : SMTP */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-600">
                Paramètres SMTP — {nomSelectionne}
              </h3>

              <div>
                <label className="block text-xs text-slate-500 mb-1">Identifiant du compte e-mail</label>
                <input value={form.smtp_user} onChange={maj('smtp_user')} autoComplete="off" className={CL} />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Mot de passe <span className="text-slate-400 font-normal">(laisser vide = inchangé)</span>
                </label>
                <div className="relative">
                  <input type={montrerMdp ? 'text' : 'password'} value={form.smtp_mot_de_passe}
                    onChange={maj('smtp_mot_de_passe')} autoComplete="new-password"
                    className={CL + ' pr-9'} />
                  <button type="button" onClick={() => setMontrerMdp(v => !v)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    title={montrerMdp ? 'Masquer' : 'Afficher'}>
                    <IconeOeil visible={montrerMdp} />
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Adresse du serveur SMTP</label>
                <input value={form.smtp_adresse} onChange={maj('smtp_adresse')} autoComplete="off" className={CL} />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Adresse e-mail de l'expéditeur</label>
                <input value={form.email_expediteur} onChange={maj('email_expediteur')} autoComplete="off" className={CL} />
              </div>
              <div className="flex gap-4 items-end">
                <div className="w-24">
                  <label className="block text-xs text-slate-500 mb-1">Port</label>
                  <input type="number" value={form.smtp_num_port} onChange={maj('smtp_num_port')} className={CL} />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-2">Protocole de sécurité</label>
                  <div className="flex gap-4">
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">CC</label>
                  <input value={form.email_cc} onChange={maj('email_cc')} autoComplete="off" className={CL} />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">CCI</label>
                  <input value={form.email_cci} onChange={maj('email_cci')} autoComplete="off" className={CL} />
                </div>
              </div>

              {/* Signature */}
              <div>
                <label className="block text-xs text-slate-500 mb-1">Image de la signature</label>
                <div className="flex items-start gap-3">
                  {form.signature_img
                    ? <img src={form.signature_img} alt="Signature" className="max-h-16 object-contain border rounded" />
                    : <div className="h-12 w-32 bg-slate-100 border rounded flex items-center justify-center text-xs text-slate-400">Aucune</div>
                  }
                  <div className="flex flex-col gap-1">
                    <label className="cursor-pointer bg-primaire-clair text-primaire-fonce text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-primaire hover:text-white transition">
                      Charger une signature
                      <input type="file" accept="image/*" onChange={chargerSignature} className="hidden" />
                    </label>
                    {form.signature_img && (
                      <button type="button" onClick={() => setForm(f => ({ ...f, signature_img: null }))}
                        className="text-xs text-red-500 hover:underline text-left">Supprimer</button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Colonne droite : modèle d'e-mail */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-600">Modèle d'e-mail d'envoi de facture</h3>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Objet</label>
                <input value={form.email_envoi_fact_objet} onChange={maj('email_envoi_fact_objet')}
                  autoComplete="off" className={CL} />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Corps du message</label>
                <textarea value={form.email_envoi_fact_corps} onChange={maj('email_envoi_fact_corps')}
                  rows={12}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primaire font-mono" />
                <p className="text-xs text-slate-400 mt-1">
                  Vous pouvez utiliser du HTML basique (balises &lt;b&gt;, &lt;br&gt;, etc.).
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button type="submit"
              className="bg-primaire hover:bg-primaire-fonce text-white font-semibold px-6 py-2 rounded-lg transition">
              Enregistrer
            </button>
            <button type="button" disabled
              title="Disponible une fois l'envoi de factures par e-mail implémenté (lot 5)"
              className="border border-slate-300 text-slate-400 font-semibold px-6 py-2 rounded-lg cursor-not-allowed select-none">
              Envoyer un e-mail de test
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
