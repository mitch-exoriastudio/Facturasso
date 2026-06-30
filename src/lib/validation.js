// =====================================================================
//  Petites validations partagées côté serveur.
// =====================================================================

export const EMAIL_INVALIDE = 'Adresse e-mail invalide.';

// Validation simple et tolérante : présence d'un « local@domaine.tld ».
// L'unicité est garantie par la contrainte SQL (P2002), pas ici.
export function emailValide(email) {
  const v = (email ?? '').trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
