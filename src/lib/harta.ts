import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import '../styles/harta.css';
import { cale } from './oferta';

// Vite mută modulul MapLibre, deci calea dedusă a workerului nu mai există.
// scripts/copiaza-worker.mjs îl pune în public/maplibre/ la dev și la build.
maplibregl.setWorkerUrl(cale('/maplibre/maplibre-gl-worker.mjs'));

/**
 * Harta folosește dalele OpenFreeMap (fără cheie, fără cost) cu stilul
 * Positron, recolorat la încărcare pe hârtia și navy-ul Elanis.
 * TODO(real): pentru trafic mare, MapTiler sau dale proprii pe VPS.
 */
const STIL = 'https://tiles.openfreemap.org/styles/positron';

export const CENTRU_TURDA: [number, number] = [23.795, 46.564];

export interface PinOferta {
  id: string;
  titlu: string;
  pret: string;
  pretScurt: string;
  loc: string;
  poza: string;
  link: string;
  coord: [number, number];
  caracteristici: string;
}

function recoloreaza(map: maplibregl.Map) {
  type Paint = Parameters<maplibregl.Map['setPaintProperty']>;
  const set = (id: string, prop: Paint[1], val: Paint[2]) => {
    if (map.getLayer(id)) map.setPaintProperty(id, prop, val);
  };
  set('background', 'background-color', '#f1ede6');
  set('landuse_residential', 'fill-color', '#ebe5db');
  set('building', 'fill-color', '#e2dbcf');
  set('building', 'fill-outline-color', '#d6cdbf');
  set('park', 'fill-color', '#e1e5d8');
  set('landcover_wood', 'fill-color', '#d8dfd0');
  set('water', 'fill-color', '#c4d0d4');
  set('waterway', 'line-color', '#b9c8cd');
  set('highway_minor', 'line-color', '#fbf9f5');
  set('highway_major_casing', 'line-color', '#d9d1c4');
  set('highway_major_inner', 'line-color', '#fdfcf9');
  for (const id of ['highway-name-minor', 'highway-name-major', 'label_other', 'label_village', 'label_town', 'label_city']) {
    set(id, 'text-color', '#3e4c56');
    set(id, 'text-halo-color', '#f6f3ee');
  }
}

export function creeazaHarta(
  el: HTMLElement,
  opt: { centru?: [number, number]; zoom?: number; cooperativ?: boolean } = {},
): maplibregl.Map {
  const map = new maplibregl.Map({
    container: el,
    style: STIL,
    center: opt.centru ?? CENTRU_TURDA,
    zoom: opt.zoom ?? 12.4,
    minZoom: 9,
    maxZoom: 17.5,
    attributionControl: { compact: true },
    cooperativeGestures: opt.cooperativ ?? true,
    locale: {
      'CooperativeGesturesHandler.WindowsHelpText': 'Ține apăsat Ctrl și folosește rotița ca să mărești harta',
      'CooperativeGesturesHandler.MacHelpText': 'Ține apăsat ⌘ și folosește rotița ca să mărești harta',
      'CooperativeGesturesHandler.MobileHelpText': 'Folosește două degete ca să muți harta',
      'NavigationControl.ZoomIn': 'Mărește',
      'NavigationControl.ZoomOut': 'Micșorează',
    },
  });
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
  map.on('style.load', () => recoloreaza(map));
  return map;
}

function popupHtml(p: PinOferta): string {
  const e = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
  return `<a class="popup-oferta" href="${e(p.link)}">
    <img src="${e(p.poza)}" alt="" width="280" height="210" loading="lazy" />
    <span class="popup-corp">
      <span class="popup-loc">${e(p.loc)}</span>
      <span class="popup-titlu">${e(p.titlu)}</span>
      <span class="popup-car">${e(p.caracteristici)}</span>
      <span class="popup-pret">${e(p.pret)}</span>
    </span>
  </a>`;
}

/** Pune câte un pin cu prețul pentru fiecare ofertă. Întoarce pinii după id. */
export function adaugaPini(map: maplibregl.Map, pini: PinOferta[]) {
  const dupaId = new Map<string, { marker: maplibregl.Marker; el: HTMLButtonElement }>();
  let activ: HTMLButtonElement | null = null;
  const popup = new maplibregl.Popup({ offset: 16, closeButton: true, maxWidth: '290px', className: 'popup-elanis' });
  popup.on('close', () => {
    activ?.classList.remove('activ');
    activ = null;
  });

  for (const p of pini) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'pin-pret';
    el.textContent = p.pretScurt;
    el.setAttribute('aria-label', `${p.titlu}, ${p.pret}`);
    el.addEventListener('click', (ev) => {
      ev.stopPropagation();
      activ?.classList.remove('activ');
      activ = el;
      el.classList.add('activ');
      popup.setLngLat(p.coord).setHTML(popupHtml(p)).addTo(map);
    });
    const marker = new maplibregl.Marker({ element: el, anchor: 'bottom' }).setLngLat(p.coord).addTo(map);
    dupaId.set(p.id, { marker, el });
  }
  return dupaId;
}

/**
 * Grupare simplă în spațiul ecranului: pinii care s-ar suprapune se strâng
 * într-un singur pin „N oferte”, iar click-ul pe el face zoom pe grup.
 * Se recalculează la fiecare oprire a hărții. `activ` spune ce pini sunt
 * permiși de filtre (cei ascunși de filtre nu intră în grupuri).
 */
export function grupeaza(
  map: maplibregl.Map,
  pini: PinOferta[],
  dupaId: ReturnType<typeof adaugaPini>,
  activ: () => Set<string> = () => new Set(pini.map((p) => p.id)),
) {
  const LAT = 64; // lățimea aproximativă a unui pin, px
  const INALT = 34;

  function calculeaza() {
    const ids = activ();
    const grupuri: { x: number; y: number; membri: PinOferta[] }[] = [];
    for (const p of pini) {
      const { el } = dupaId.get(p.id)!;
      el.classList.remove('grup');
      el.textContent = p.pretScurt;
      el.hidden = false;
      if (!ids.has(p.id)) continue;
      const pt = map.project(p.coord);
      const g = grupuri.find((x) => Math.abs(x.x - pt.x) < LAT && Math.abs(x.y - pt.y) < INALT);
      if (g) g.membri.push(p);
      else grupuri.push({ x: pt.x, y: pt.y, membri: [p] });
    }
    for (const g of grupuri) {
      if (g.membri.length < 2) continue;
      const [prim, ...rest] = g.membri;
      const el = dupaId.get(prim.id)!.el;
      el.classList.add('grup');
      el.textContent = `${g.membri.length} oferte`;
      el.dataset.membri = g.membri.map((m) => m.id).join(',');
      rest.forEach((m) => (dupaId.get(m.id)!.el.hidden = true));
    }
  }

  // Click pe un pin de grup: zoom pe membrii lui, în loc de popup.
  for (const p of pini) {
    const { el } = dupaId.get(p.id)!;
    el.addEventListener(
      'click',
      (ev) => {
        if (!el.classList.contains('grup')) return;
        ev.stopImmediatePropagation();
        const membri = (el.dataset.membri || '').split(',');
        incadreaza(map, pini.filter((x) => membri.includes(x.id)).map((x) => x.coord), 90);
      },
      { capture: true },
    );
  }

  map.on('moveend', calculeaza);
  calculeaza();
  return calculeaza;
}

export function incadreaza(map: maplibregl.Map, coord: [number, number][], padding = 60) {
  if (coord.length === 0) return;
  if (coord.length === 1) {
    map.easeTo({ center: coord[0], zoom: 14.5 });
    return;
  }
  const b = new maplibregl.LngLatBounds(coord[0], coord[0]);
  coord.forEach((c) => b.extend(c));
  map.fitBounds(b, { padding, maxZoom: 15, duration: 600 });
}

export { maplibregl };
