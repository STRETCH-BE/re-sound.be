# Lighthouse before — mobile, simulated slow 4G, performance only

Base: http://localhost:3000 · 3 runs per page · median-LCP run reported (all runs in parentheses)

| Page | Score | LCP | FCP | TBT | CLS | Speed Index |
|---|---|---|---|---|---|---|
| /en | 50 (50 / 54 / 53) | 4.59 s (4.59 s / 4.89 s / 4.49 s) | 0.94 s | 485 ms (485 / 333 / 422) | 0.504 | 2.06 s |
| /en/products/solo-flex | 67 (62 / 65 / 67) | 3.51 s (4.26 s / 3.38 s / 3.51 s) | 1.61 s | 75 ms (72 / 229 / 75) | 0.606 | 1.61 s |
| /en/products/rwood-micro | 51 (46 / 51 / 48) | 8.51 s (8.28 s / 8.51 s / 8.55 s) | 1.72 s | 86 ms (321 / 86 / 273) | 0.577 | 2.95 s |

- LCP element on /en: `<img alt="rWood acoustic panel with natural wood veneer" fetchpriority="high" decoding="async" data-nimg="fill" style="position: absolute; height: 100%; width: `
- LCP element on /en/products/solo-flex: `<p class="jsx-bac31250688cd442 hero-description">`
- LCP element on /en/products/rwood-micro: `<p class="jsx-a94f9bf580d36de7 hero-description">`
