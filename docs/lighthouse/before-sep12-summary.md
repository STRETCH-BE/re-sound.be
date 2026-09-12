# Lighthouse before-sep12 — mobile, simulated slow 4G, performance only

Base: http://localhost:3999 · 3 runs per page · median-LCP run reported (all runs in parentheses)

| Page | Score | LCP | FCP | TBT | CLS | Speed Index |
|---|---|---|---|---|---|---|
| /en | 92 (88 / 92 / 92) | 3.26 s (3.57 s / 3.26 s / 3.26 s) | 1.37 s | 38 ms (119 / 12 / 38) | 0.000 | 1.37 s |
| /nl | 92 (92 / 92 / 92) | 3.27 s (3.27 s / 3.27 s / 3.26 s) | 1.38 s | 44 ms (17 / 44 / 40) | 0.000 | 1.38 s |
| /en/products/solo-flex | 94 (95 / 94 / 94) | 3.03 s (2.88 s / 3.03 s / 3.04 s) | 1.06 s | 6 ms (21 / 6 / 21) | 0.000 | 1.06 s |
| /en/products/acoustic-phone-booths | 95 (95 / 96 / 95) | 2.83 s (2.83 s / 2.84 s / 2.83 s) | 1.08 s | 11 ms (12 / 12 / 11) | 0.000 | 1.08 s |

- LCP element on /en: `<img alt="rWood Micro acoustic panel with natural wood veneer, close-up of the finish" fetchpriority="high" decoding="async" data-nimg="fill" style="position: a`
- LCP element on /nl: `<img alt="rWood Micro akoestisch paneel met natuurlijk houtfineer, close-up van de a…" fetchpriority="high" decoding="async" data-nimg="fill" style="position: a`
- LCP element on /en/products/solo-flex: `<p class="jsx-db053fc34d3f2b8d hero-description">`
- LCP element on /en/products/acoustic-phone-booths: `<p class="hub-intro">`
