'use client';
// =====================================================================
//  Champ texte anti-autofill (drop-in pour <input>).
//
//  POURQUOI ce composant ?
//  Chrome (et Firefox) IGNORENT volontairement `autocomplete="off"` pour
//  l'enregistrement/remplissage des adresses. Sur nos fiches (client,
//  association), les champs adresse/ville/téléphone/e-mail concernent des
//  TIERS, pas l'utilisateur de l'app : on ne veut donc pas du prompt
//  « Enregistrer l'adresse ? » à chaque saisie.
//
//  ASTUCE : un <input> en lecture seule n'est pas classé par le navigateur
//  comme un champ d'adresse enregistrable. On le déverrouille au premier
//  focus → la saisie reste parfaitement normale, mais le prompt disparaît.
//
//  ⚠️ Ne PAS utiliser sur la page de connexion : l'enregistrement de
//  l'identifiant y est volontairement conservé (autoComplete="username").
// =====================================================================
import { useState } from 'react';
import type { InputHTMLAttributes } from 'react';

export default function ChampSansAutofill({
  onFocus,
  readOnly,
  autoComplete = 'off',
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  const [verrou, setVerrou] = useState(true); // lecture seule tant que pas de focus

  return (
    <input
      {...props}
      autoComplete={autoComplete}
      readOnly={verrou || readOnly}
      onFocus={(e) => { setVerrou(false); onFocus?.(e); }}
    />
  );
}
