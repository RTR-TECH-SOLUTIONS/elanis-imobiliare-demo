// Ofertele salvate stau doar în browserul vizitatorului.
// TODO(real): la cont de client se pot sincroniza pe server.
const CHEIE = 'elanis-favorite';

export function citesteFavorite(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(CHEIE) || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function comutaFavorit(id: string): boolean {
  const lista = citesteFavorite();
  const are = lista.includes(id);
  const noua = are ? lista.filter((x) => x !== id) : [...lista, id];
  try {
    localStorage.setItem(CHEIE, JSON.stringify(noua));
  } catch {
    /* navigare privată: rămâne doar pe pagina curentă */
  }
  window.dispatchEvent(new CustomEvent('favorite-schimbat'));
  return !are;
}

/** Leagă toate butoanele [data-favorit="ID"] din pagină. */
export function leagaButoaneFavorite(radacina: ParentNode = document) {
  const salvate = new Set(citesteFavorite());
  radacina.querySelectorAll<HTMLButtonElement>('[data-favorit]').forEach((b) => {
    const id = b.dataset.favorit!;
    b.setAttribute('aria-pressed', String(salvate.has(id)));
    if (b.dataset.legat) return;
    b.dataset.legat = '1';
    b.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      const acum = comutaFavorit(id);
      document.querySelectorAll<HTMLButtonElement>(`[data-favorit="${id}"]`).forEach((x) => x.setAttribute('aria-pressed', String(acum)));
    });
  });
}
