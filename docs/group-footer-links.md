# Group-site links to re-sound.be

The Stretch Group stretch-ceiling sites (stretchplafond.be and its 16 sister
domains) currently link to re-sound.be **zero** times. Their code base is not
in this repository, so this document contains everything the other team needs
to paste in. Three placements are proposed, in order of impact:

1. a **group footer block** on every page of every group site (sitewide link,
   the strongest signal);
2. three **contextual in-content links** on stretchplafond.be where acoustics
   is already the topic;
3. an **`Organization` JSON-LD update** on the group / stretch-ceiling sites
   (`sameAs` + `subOrganization`) so search engines connect the entities.

All re-sound.be URLs below are live, locale-prefixed and self-canonical. Use
the URL of the **same language** as the linking page; when a group site runs
in a language re-sound.be does not index (da, sv, no, is are noindex until
their translations are complete), link to the English URL.

---

## 1. Footer block (all group sites)

Ready-to-paste HTML. Keep the `rel` attributes as they are (these are
editorial, same-owner links — no `nofollow`, no `sponsored`).

### English

```html
<nav class="group-footer" aria-label="Stretch Group">
  <span class="group-footer__label">Stretch Group:</span>
  <a href="https://stretchplafond.be/en/">STRETCH stretch ceilings</a> ·
  <a href="https://re-sound.be/en">Re-Sound acoustic panels</a> ·
  <a href="https://stretchmetal.be/">Stretch Metal</a>
</nav>
```

### Dutch

```html
<nav class="group-footer" aria-label="Stretch Group">
  <span class="group-footer__label">Stretch Group:</span>
  <a href="https://stretchplafond.be/nl/">STRETCH spanplafonds</a> ·
  <a href="https://re-sound.be/nl">Re-Sound akoestische panelen</a> ·
  <a href="https://stretchmetal.be/">Stretch Metal</a>
</nav>
```

### French

```html
<nav class="group-footer" aria-label="Stretch Group">
  <span class="group-footer__label">Stretch Group :</span>
  <a href="https://stretchplafond.be/fr/">STRETCH plafonds tendus</a> ·
  <a href="https://re-sound.be/fr">Re-Sound panneaux acoustiques</a> ·
  <a href="https://stretchmetal.be/">Stretch Metal</a>
</nav>
```

### German

```html
<nav class="group-footer" aria-label="Stretch Group">
  <span class="group-footer__label">Stretch Group:</span>
  <a href="https://stretchplafond.be/de/">STRETCH Spanndecken</a> ·
  <a href="https://re-sound.be/de">Re-Sound Akustikpaneele</a> ·
  <a href="https://stretchmetal.be/">Stretch Metal</a>
</nav>
```

### Spanish / Portuguese

```html
<!-- es -->
<a href="https://re-sound.be/es">Re-Sound paneles acústicos</a>
<!-- pt -->
<a href="https://re-sound.be/pt">Re-Sound painéis acústicos</a>
```

> The STRETCH and Stretch Metal URLs above are examples — replace them with
> the group's canonical home URLs per language. Only the re-sound.be URLs are
> authoritative here.

### Localised re-sound.be URLs per locale

| Locale | Home | Products | rPET hub | rWood hub | Booths hub |
|---|---|---|---|---|---|
| en | https://re-sound.be/en | https://re-sound.be/en/products | https://re-sound.be/en/products/pet-acoustic-panels | https://re-sound.be/en/products/wood-acoustic-panels | https://re-sound.be/en/products/acoustic-phone-booths |
| nl | https://re-sound.be/nl | https://re-sound.be/nl/products | https://re-sound.be/nl/products/pet-akoestische-panelen | https://re-sound.be/nl/products/houten-akoestische-panelen | https://re-sound.be/nl/products/akoestische-belcabines |
| fr | https://re-sound.be/fr | https://re-sound.be/fr/products | https://re-sound.be/fr/products/panneaux-acoustiques-pet | https://re-sound.be/fr/products/panneaux-acoustiques-bois | https://re-sound.be/fr/products/cabines-acoustiques |
| de | https://re-sound.be/de | https://re-sound.be/de/products | https://re-sound.be/de/products/pet-akustikpaneele | https://re-sound.be/de/products/holz-akustikpaneele | https://re-sound.be/de/products/telefonboxen |
| es | https://re-sound.be/es | https://re-sound.be/es/products | https://re-sound.be/es/products/pet-acoustic-panels | https://re-sound.be/es/products/wood-acoustic-panels | https://re-sound.be/es/products/acoustic-phone-booths |
| pt | https://re-sound.be/pt | https://re-sound.be/pt/products | https://re-sound.be/pt/products/pet-acoustic-panels | https://re-sound.be/pt/products/wood-acoustic-panels | https://re-sound.be/pt/products/acoustic-phone-booths |
| da / sv / no / is | link to the **en** URLs (these locales are noindex) | | | | |

Minimal CSS suggestion (adapt to the group sites' design system):

```css
.group-footer { font-size: 0.85rem; opacity: 0.8; display: flex; flex-wrap: wrap; gap: 0.4rem; justify-content: center; padding: 1rem 0; }
.group-footer__label { font-weight: 600; }
.group-footer a { text-decoration: underline; text-underline-offset: 2px; }
```

---

## 2. Contextual links on stretchplafond.be

Three placements where a link is editorially natural. Anchor texts use the
market vocabulary re-sound.be targets, so they reinforce the right queries.

### 2a. `/materials/acoustic-panels`

Add one paragraph near the top of the page (after the intro):

> **EN** — For wall and ceiling absorption outside the ceiling membrane, the
> group's own acoustic range is [Re-Sound acoustic panels](https://re-sound.be/en/products):
> [recycled PET acoustic panels](https://re-sound.be/en/products/pet-acoustic-panels),
> [wood acoustic panels in FSC veneer](https://re-sound.be/en/products/wood-acoustic-panels)
> and textile panels, all made in the group's own plants in Beveren-Waas and Częstochowa.
>
> **NL** — Voor wand- en plafondabsorptie buiten het spanplafond is er het eigen
> akoestische gamma van de groep: [Re-Sound akoestische panelen](https://re-sound.be/nl/products):
> [akoestische panelen van gerecycleerd PET](https://re-sound.be/nl/products/pet-akoestische-panelen),
> [houten akoestische panelen met FSC-fineer](https://re-sound.be/nl/products/houten-akoestische-panelen)
> en textielpanelen, allemaal uit de eigen fabrieken in Beveren-Waas en Częstochowa.
>
> **FR** — Pour l'absorption murale et au plafond en dehors de la toile tendue,
> le groupe dispose de sa propre gamme : [les panneaux acoustiques Re-Sound](https://re-sound.be/fr/products) —
> [panneaux acoustiques en PET recyclé](https://re-sound.be/fr/products/panneaux-acoustiques-pet),
> [panneaux acoustiques en bois placage FSC](https://re-sound.be/fr/products/panneaux-acoustiques-bois)
> et panneaux textiles, fabriqués dans nos usines de Beveren-Waas et Częstochowa.
>
> **DE** — Für Wand- und Deckenabsorption außerhalb der Spanndecke gibt es das
> eigene Akustiksortiment der Gruppe: [Re-Sound Akustikpaneele](https://re-sound.be/de/products) —
> [PET-Akustikpaneele aus recycelten Flaschen](https://re-sound.be/de/products/pet-akustikpaneele),
> [Holz-Akustikpaneele mit FSC-Furnier](https://re-sound.be/de/products/holz-akustikpaneele)
> und Textilpaneele, gefertigt in den eigenen Werken in Beveren-Waas und Częstochowa.

### 2b. `/products/acoustic-stretch-system`

In the "combine with" / "related solutions" area, add one sentence:

> **EN** — Combine the acoustic stretch ceiling with
> [office phone booths and meeting pods from Re-Sound](https://re-sound.be/en/products/acoustic-phone-booths)
> where speech privacy is needed, and with
> [rPET Panel](https://re-sound.be/en/products/rpet-panel) on the walls.
>
> **NL** — Combineer het akoestische spanplafond met
> [belcabines en vergaderpods van Re-Sound](https://re-sound.be/nl/products/akoestische-belcabines)
> waar spraakprivacy nodig is, en met [rPET Panel](https://re-sound.be/nl/products/rpet-panel) op de wanden.
>
> **FR** — Combinez le plafond tendu acoustique avec
> [les cabines acoustiques et pods de réunion Re-Sound](https://re-sound.be/fr/products/cabines-acoustiques)
> là où la confidentialité des conversations compte, et avec
> [rPET Panel](https://re-sound.be/fr/products/rpet-panel) sur les murs.
>
> **DE** — Kombinieren Sie die Akustik-Spanndecke mit
> [Telefonboxen und Meeting-Pods von Re-Sound](https://re-sound.be/de/products/telefonboxen),
> wo Sprachprivatsphäre gefragt ist, und mit
> [rPET Panel](https://re-sound.be/de/products/rpet-panel) an den Wänden.

### 2c. The acoustics blog post

In the paragraph that explains absorption vs. insulation (αw / NRC), add:

> **EN** — The difference between absorption and insulation is explained in
> detail in the [Re-Sound FAQ](https://re-sound.be/en/faq); the
> [rWood Micro](https://re-sound.be/en/products/rwood-micro) page shows what a
> micro-perforated wood panel achieves in practice (αw 0.90, B-s1,d0).
>
> **NL** — Het verschil tussen absorptie en isolatie leggen we uit in de
> [Re-Sound FAQ](https://re-sound.be/nl/faq); op de pagina van
> [rWood Micro](https://re-sound.be/nl/products/rwood-micro) ziet u wat een
> microgeperforeerd houtpaneel in de praktijk haalt (αw 0,90, B-s1,d0).
>
> **FR** — La différence entre absorption et isolation est expliquée dans la
> [FAQ Re-Sound](https://re-sound.be/fr/faq) ; la page
> [rWood Micro](https://re-sound.be/fr/products/rwood-micro) montre ce qu'un
> panneau bois microperforé atteint en pratique (αw 0,90, B-s1,d0).
>
> **DE** — Den Unterschied zwischen Absorption und Dämmung erklärt die
> [Re-Sound FAQ](https://re-sound.be/de/faq); die Seite
> [rWood Micro](https://re-sound.be/de/products/rwood-micro) zeigt, was ein
> mikroperforiertes Holzpaneel in der Praxis erreicht (αw 0,90, B-s1,d0).

---

## 3. Organization JSON-LD on the group sites

re-sound.be already declares
`parentOrganization: { name: "STRETCH Group", url: "https://stretchgroup.be" }`
on its `Organization` node (`https://re-sound.be/#organization`). The group
side should declare the reverse relation and list re-sound.be as a related
profile. Add to the group / stretchplafond `Organization` JSON-LD:

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://stretchgroup.be/#organization",
  "name": "STRETCH Group",
  "url": "https://stretchgroup.be",
  "sameAs": [
    "https://re-sound.be",
    "https://www.linkedin.com/company/resoundbe"
  ],
  "subOrganization": [
    {
      "@type": "Organization",
      "@id": "https://re-sound.be/#organization",
      "name": "Re-Sound",
      "url": "https://re-sound.be",
      "description": "Circular acoustic panels and office phone booths, made in the group's own plants in Beveren-Waas (BE) and Częstochowa (PL)."
    }
  ]
}
```

Notes:

- keep the existing `sameAs` entries of the group site and **append** the
  re-sound.be entries;
- if stretchplafond.be uses a different `@id` for its organisation, keep that
  `@id` and only add the `subOrganization` array;
- the LinkedIn URL is the one the re-sound.be footer uses
  (`SOCIAL_LINKS` in `src/config/site.ts`); it is still marked
  *needs confirmation* on the re-sound.be side.
