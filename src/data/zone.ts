// Cartierele au coordonatele din OpenStreetMap (Nominatim), ca pinii să cadă
// unde îi știe oricine din Turda. Ordinea e cea din meniul de căutare.
export interface Zona {
  slug: string;
  nume: string;
  localitate: string;
  /** [lng, lat] */
  centru: [number, number];
}

export const zone: Zona[] = [
  { slug: 'centru', nume: 'Centru', localitate: 'Turda', centru: [23.7857, 46.5717] },
  { slug: 'micro-1', nume: 'Micro 1', localitate: 'Turda', centru: [23.8003, 46.5576] },
  { slug: 'micro-2', nume: 'Micro 2', localitate: 'Turda', centru: [23.8062, 46.5586] },
  { slug: 'micro-3', nume: 'Micro 3', localitate: 'Turda', centru: [23.8125, 46.5575] },
  { slug: 'micro-4', nume: 'Micro 4', localitate: 'Turda', centru: [23.8169, 46.5575] },
  { slug: 'primaverii', nume: 'Primăverii', localitate: 'Turda', centru: [23.8147, 46.5528] },
  { slug: 'baile-sarate', nume: 'Băile Sărate', localitate: 'Turda', centru: [23.7929, 46.5762] },
  { slug: 'turda-noua', nume: 'Turda Nouă', localitate: 'Turda', centru: [23.7735, 46.5805] },
  { slug: 'poiana', nume: 'Poiana', localitate: 'Turda', centru: [23.8315, 46.5592] },
  { slug: 'mihai-viteazu', nume: 'Mihai Viteazu', localitate: 'comuna Mihai Viteazu', centru: [23.7459, 46.5403] },
];

export const zonaDupaSlug = Object.fromEntries(zone.map((z) => [z.slug, z])) as Record<string, Zona>;
