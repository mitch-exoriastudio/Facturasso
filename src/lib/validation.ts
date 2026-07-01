// =====================================================================
//  Petites validations partagées côté serveur.
// =====================================================================

export const EMAIL_INVALIDE = 'Adresse e-mail invalide.';
export const TELEPHONE_REQUIS = 'Numéro de téléphone mobile requis.';

// Validation simple et tolérante : présence d'un « local@domaine.tld ».
// L'unicité est garantie par la contrainte SQL (P2002), pas ici.
export function emailValide(email: string | null | undefined): boolean {
  const v = (email ?? '').trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

// Validation tolérante d'un mobile : au moins 10 chiffres une fois retirés
// les espaces, points, tirets, parenthèses et l'indicatif « + ».
export function telephoneValide(telephone: string | null | undefined): boolean {
  const chiffres = (telephone ?? '').replace(/[\s.\-()+]/g, '');
  return /^\d{10,15}$/.test(chiffres);
}
