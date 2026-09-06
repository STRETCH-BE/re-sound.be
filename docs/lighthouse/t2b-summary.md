# Lighthouse t2b — mobile, simulated slow 4G, performance only

Base: http://localhost:3000 · 3 runs per page · median-LCP run reported (all runs in parentheses)

| Page | Score | LCP | FCP | TBT | CLS | Speed Index |
|---|---|---|---|---|---|---|
| /en | 88 (92 / 88 / 95) | 3.19 s (3.28 s / 3.19 s / 2.86 s) | 0.92 s | 249 ms (55 / 249 / 108) | 0.000 | 1.16 s |
| /en/products/solo-flex | 94 (93 / 94 / 94) | 3.03 s (3.14 s / 3.03 s / 3.02 s) | 1.07 s | 31 ms (63 / 31 / 37) | 0.000 | 1.07 s |
| /en/products/rwood-micro | 76 (76 / 75 / 76) | 6.91 s (6.89 s / 6.95 s / 6.91 s) | 1.07 s | 59 ms (83 / 110 / 59) | 0.000 | 2.40 s |

- LCP element on /en: `<img alt="rWood Micro acoustic panel with natural wood veneer, close-up of the finish" fetchpriority="high" decoding="async" data-nimg="fill" style="position: a`
- LCP element on /en/products/solo-flex: `<p class="jsx-bac31250688cd442 hero-description">`
- LCP element on /en/products/rwood-micro: `<p class="jsx-a94f9bf580d36de7 hero-description">`
