import type { Eticheta, Oferta, Tip, Tranzactie } from '../data/oferte';
import { zonaDupaSlug } from '../data/zone';

const nr = new Intl.NumberFormat('ro-RO');

/** 92500 -> „92.500 €”, chiria cu „/ lună”. */
export function pretText(o: Pick<Oferta, 'pret' | 'tranzactie'>): string {
  return `${nr.format(o.pret)} €${o.tranzactie === 'inchiriere' ? ' / lună' : ''}`;
}

export function numar(n: number): string {
  return nr.format(n);
}

/** Prețul pe metru pătrat, doar la vânzare și doar unde există suprafață. */
export function pretMp(o: Oferta): string | undefined {
  if (o.tranzactie !== 'vanzare') return undefined;
  const mp = o.tip === 'teren' ? o.teren : o.suprafata;
  if (!mp) return undefined;
  return `${nr.format(Math.round(o.pret / mp))} €/mp${o.tip === 'teren' ? ' teren' : ''}`;
}

/** Eticheta scurtă pentru pinul de pe hartă: „92,5k €”, „350 €/lună”. */
export function pretScurt(o: Oferta): string {
  if (o.tranzactie === 'inchiriere') return `${o.pret} €/lună`;
  if (o.pret >= 1000) {
    const k = o.pret / 1000;
    return `${Number.isInteger(k) ? k : k.toFixed(1).replace('.', ',')}k €`;
  }
  return `${o.pret} €`;
}

export const numeTip: Record<Tip, { unu: string; multe: string }> = {
  apartament: { unu: 'Apartament', multe: 'Apartamente' },
  garsoniera: { unu: 'Garsonieră', multe: 'Garsoniere' },
  casa: { unu: 'Casă', multe: 'Case' },
  teren: { unu: 'Teren', multe: 'Terenuri' },
  spatiu: { unu: 'Spațiu comercial', multe: 'Spații comerciale' },
};

export const numeTranzactie: Record<Tranzactie, string> = {
  vanzare: 'de vânzare',
  inchiriere: 'de închiriat',
};

export const numeEticheta: Record<Eticheta, string> = {
  nou: 'Nou',
  comision0: 'Comision 0%',
  exclusivitate: 'Exclusivitate',
  pretRedus: 'Preț redus',
};

export function numeZona(slug: string): string {
  return zonaDupaSlug[slug]?.nume ?? slug;
}

export function localitate(slug: string): string {
  return zonaDupaSlug[slug]?.localitate ?? 'Turda';
}

/** „Micro 3, Turda” sau „Mihai Viteazu” (unde localitatea e comuna). */
export function locText(slug: string): string {
  const z = zonaDupaSlug[slug];
  if (!z) return 'Turda';
  return z.localitate === 'Turda' ? `${z.nume}, Turda` : z.nume;
}

/** Rândul scurt de caracteristici de pe card: „3 camere · 68 mp · etaj 2 / 4”. */
export function caracteristici(o: Oferta): string[] {
  const r: string[] = [];
  if (o.camere) r.push(o.camere === 1 ? '1 cameră' : `${o.camere} camere`);
  if (o.suprafata) r.push(`${o.suprafata} mp utili`);
  if (o.teren) r.push(`teren ${nr.format(o.teren)} mp`);
  if (o.etaj && o.tip !== 'casa') r.push(o.etaj === 'parter' ? 'parter' : `etaj ${o.etaj}`);
  return r;
}

const luni = ['ian.', 'feb.', 'mar.', 'apr.', 'mai', 'iun.', 'iul.', 'aug.', 'sep.', 'oct.', 'nov.', 'dec.'];
export function dataScurta(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${luni[m - 1]} ${y}`;
}

export function pozaUrl(nume: string, latime: 800 | 1600 = 800): string {
  return `${import.meta.env.BASE_URL.replace(/\/$/, '')}/img/oferte/${nume}-${latime}.webp`;
}

export function cale(p: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');
  return `${base}${p.startsWith('/') ? p : `/${p}`}`;
}

export function linkOferta(o: Pick<Oferta, 'slug'>): string {
  return cale(`/oferte/${o.slug}/`);
}

/** Datele minime pentru pinul de pe hartă, serializate în pagină. */
export function pinOferta(o: Oferta) {
  return {
    id: o.id,
    titlu: o.titlu,
    pret: pretText(o),
    pretScurt: pretScurt(o),
    loc: locText(o.zona),
    poza: pozaUrl(o.poze[0], 800),
    link: linkOferta(o),
    coord: o.coord,
    caracteristici: caracteristici(o).join(' · '),
    zona: o.zona,
  };
}

/** Ofertele cele mai noi primele. */
export function dupaData<T extends Pick<Oferta, 'adaugat'>>(lista: T[]): T[] {
  return [...lista].sort((a, b) => b.adaugat.localeCompare(a.adaugat));
}
