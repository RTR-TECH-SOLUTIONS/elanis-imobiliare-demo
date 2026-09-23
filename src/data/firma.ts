// Datele de contact vin de pe pagina de Facebook a agenției (septembrie 2026).
// TODO(real): adresa biroului și programul, de confirmat cu clientul.
export const firma = {
  nume: 'Elanis Imobiliare',
  oras: 'Turda',
  zona: 'Turda și împrejurimi',
  telefon: '0755 465 755',
  telefonLink: 'tel:+40755465755',
  whatsapp: '40755465755',
  email: 'elanisimobiliare@gmail.com',
  facebook: 'https://www.facebook.com/profile.php?id=61591701880057',
  tiktok: 'https://www.tiktok.com/@elanis.imobiliare',
  program: [
    { zile: 'Luni – vineri', ore: '09:00 – 18:00' },
    { zile: 'Sâmbătă', ore: '10:00 – 14:00' },
    { zile: 'Duminică', ore: 'doar vizionări programate' },
  ],
} as const;

/** Link wa.me cu mesaj precompletat. */
export function linkWhatsApp(mesaj: string): string {
  return `https://wa.me/${firma.whatsapp}?text=${encodeURIComponent(mesaj)}`;
}
