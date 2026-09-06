# Lighthouse after — mobile, simulated slow 4G, performance only

Base: http://localhost:3000 · 3 runs per page · median-LCP run reported (all runs in parentheses)

| Page | Score | LCP | FCP | TBT | CLS | Speed Index |
|---|---|---|---|---|---|---|
| /en | 92 (91 / 92 / 92) | 3.33 s (3.38 s / 3.33 s / 3.30 s) | 1.38 s | 44 ms (44 / 44 / 32) | 0.000 | 2.53 s |
| /en/products/solo-flex | 96 (95 / 96 / 96) | 2.86 s (2.87 s / 2.85 s / 2.86 s) | 1.07 s | 16 ms (29 / 16 / 16) | 0.000 | 1.07 s |
| /en/products/rwood-micro | 93 (88 / 94 / 93) | 3.10 s (3.11 s / 3.01 s / 3.10 s) | 1.08 s | 86 ms (274 / 45 / 86) | 0.000 | 2.41 s |

- LCP element on /en: `<img alt="rWood Micro acoustic panel with natural wood veneer, close-up of the finish" fetchpriority="high" decoding="async" data-nimg="fill" style="position: a`
- LCP element on /en/products/solo-flex: `<p class="jsx-d6c9b7a7b426690b hero-description">`
- LCP element on /en/products/rwood-micro: `<p class="jsx-a53385f90b666fc hero-description">`
