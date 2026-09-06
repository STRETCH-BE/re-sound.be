# Lighthouse t2c — mobile, simulated slow 4G, performance only

Base: http://localhost:3000 · 3 runs per page · median-LCP run reported (all runs in parentheses)

| Page | Score | LCP | FCP | TBT | CLS | Speed Index |
|---|---|---|---|---|---|---|
| /en | 92 (91 / 92 / 91) | 3.33 s (3.32 s / 3.33 s / 3.35 s) | 1.38 s | 36 ms (75 / 36 / 58) | 0.000 | 2.51 s |
| /en/products/solo-flex | 95 (94 / 95 / 95) | 2.87 s (2.96 s / 2.87 s / 2.87 s) | 1.08 s | 25 ms (83 / 32 / 25) | 0.000 | 1.08 s |
| /en/products/rwood-micro | 94 (89 / 94 / 94) | 3.05 s (3.08 s / 3.03 s / 3.05 s) | 1.07 s | 67 ms (236 / 78 / 67) | 0.000 | 2.60 s |

- LCP element on /en: `<img alt="rWood Micro acoustic panel with natural wood veneer, close-up of the finish" fetchpriority="high" decoding="async" data-nimg="fill" style="position: a`
- LCP element on /en/products/solo-flex: `<p class="jsx-d6c9b7a7b426690b hero-description">`
- LCP element on /en/products/rwood-micro: `<p class="jsx-a53385f90b666fc hero-description">`
