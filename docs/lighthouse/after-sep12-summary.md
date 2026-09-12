# Lighthouse after-sep12 — mobile, simulated slow 4G, performance only

Base: http://localhost:3999 · 3 runs per page · median-LCP run reported (all runs in parentheses)

| Page | Score | LCP | FCP | TBT | CLS | Speed Index |
|---|---|---|---|---|---|---|
| /en | 93 (88 / 95 / 93) | 3.18 s (3.60 s / 2.75 s / 3.18 s) | 1.37 s | 17 ms (150 / 129 / 17) | 0.000 | 1.37 s |
| /nl | 93 (95 / 93 / 93) | 3.20 s (2.88 s / 3.20 s / 3.21 s) | 1.38 s | 7 ms (37 / 7 / 17) | 0.000 | 1.38 s |
| /en/products/solo-flex | 94 (95 / 94 / 94) | 3.05 s (2.96 s / 3.06 s / 3.05 s) | 1.08 s | 28 ms (19 / 9 / 28) | 0.000 | 1.08 s |
| /en/products/acoustic-phone-booths | 95 (95 / 95 / 95) | 2.85 s (2.86 s / 2.85 s / 2.85 s) | 1.37 s | 37 ms (46 / 37 / 36) | 0.000 | 1.37 s |

- LCP element on /en: `<img alt="rWood Micro acoustic panel with natural wood veneer, close-up of the finish" fetchpriority="high" decoding="async" data-nimg="fill" style="position: a`
- LCP element on /nl: `<img alt="rWood Micro akoestisch paneel met natuurlijk houtfineer, close-up van de a…" fetchpriority="high" decoding="async" data-nimg="fill" style="position: a`
- LCP element on /en/products/solo-flex: `<p class="jsx-c1e3c6f0165886cc hero-description">`
- LCP element on /en/products/acoustic-phone-booths: `<p class="hub-intro">`
