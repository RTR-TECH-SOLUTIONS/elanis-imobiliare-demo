# Elanis Imobiliare, demo de prezentare

Site demo pentru **Elanis Imobiliare** (Turda și împrejurimi), construit pe structura cerută de client
(artemisimobiliare.ro), modernizat și legat de Turda. Astro 7 + Tailwind 4, fără backend.

```bash
npm install
npm run dev      # http://localhost:4321
npm run build    # site static în dist/
npm run preview
```

`npm run dev` și `npm run build` copiază întâi workerul MapLibre în `public/maplibre/` (vezi
`scripts/copiaza-worker.mjs`), altfel harta nu pornește.

## Ce e real și ce e exemplu

| Element | Sursă |
| --- | --- |
| Logo (header, footer, favicon) | vectorizat din pozele de profil de pe Facebook-ul lor (scriptul și materialele brute stau local în `_brief/`, nu în repo) |
| Culori | extrase din logo: navy `#13232E`, alamă `#AE8C55` |
| Telefon, e-mail, TikTok, Facebook | de pe pagina lor de Facebook |
| Oferta **P306249** (2 camere, 30 mp, Micro 3, 39.000 €) | anunțul lor real, cu textul și pozele lor |
| Celelalte 11 oferte | exemple credibile; poze generate (Higgsfield, Seedream 5.0 Flash), fără oameni |
| Fotografia din hero | Turda, turnul Bisericii Reformate și Cheile Turzii, Wikimedia Commons, Cristian Chirita, CC BY 2.5 (atribuirea e în footer) |
| Coordonatele cartierelor | OpenStreetMap / Nominatim |
| Adresa biroului, programul | **lipsesc**, programul e provizoriu |

## Funcționalități care merg în demo

- Căutare în hero (tranzacție, tip, cartier, buget, camere) + **căutare după ID-ul din anunțul de Facebook**.
- Pagina de oferte: filtre sincronizate cu URL-ul, sortare, sertar de filtre pe mobil, stare goală cu
  cerere de căutare pe WhatsApp.
- **Harta ofertelor** (MapLibre + OpenFreeMap, fără cheie): pini cu preț, grupare automată când se
  suprapun, popup cu poza; pe prima pagină, cartierele din listă evidențiază pinii.
- Pagina de ofertă: galerie cu lightbox (tastatură + swipe), fișa proprietății, hartă cu zona
  aproximativă (cerc, nu adresă), calculator de rată, programare vizionare pe WhatsApp cu ID-ul completat,
  bară fixă Sună / WhatsApp pe mobil.
- Oferte salvate (inimă) în `localStorage`, cu numărul în header.
- Formularul „Vinde prin Elanis” compune mesajul și îl deschide în WhatsApp.

## Ce e doar mock (`TODO(real)` în cod)

- `src/data/oferte.ts`: catalogul e un fișier. Anunțurile lor au „ID Extern”, deci folosesc deja un CRM.
- `src/components/VindeForm.astro` și cererile de vizionare: pleacă doar pe WhatsApp.
- `src/components/CalculatorRata.astro`: dobânda de referință e fixă (6,4%).
- `src/lib/harta.ts`: dalele OpenFreeMap sunt bune pentru demo și trafic mic.
- `src/lib/favorite.ts`: favoritele stau doar în browser.
- `src/data/firma.ts`, `src/pages/contact.astro`: adresa biroului lipsește.

## Pentru proiectul real

1. **Sursa ofertelor**: aflăm ce CRM folosesc (ImmoFlux, CRM Imobiliar etc.) și citim exportul lor
   (XML/API), ca agentul să publice o singură dată. Dacă nu au CRM: admin propriu (PocketBase în Coolify).
2. **Hosting**: anunțurile se schimbă zilnic, deci Astro SSR/hybrid pe VPS + Coolify, cu cache pe
   catalog. Paginile de prezentare rămân statice.
3. **SEO local** (după research de keyworduri): pagini pe cartier și tip („apartamente de vânzare Micro 3
   Turda”), JSON-LD `RealEstateAgent` + `RealEstateListing`, sitemap, Google Business Profile.
4. **Lead-uri**: formularele salvează în CRM și trimit e-mail (Resend), pe lângă WhatsApp.
5. **Pachetul legal**: banner cookie/GDPR, Termeni, Confidențialitate, Politica de cookies, credit RTR.
6. **Materialul clientului**: adresa biroului, echipa/agenții, poze proprii în locul celor generate,
   recenzii Google când apar.
