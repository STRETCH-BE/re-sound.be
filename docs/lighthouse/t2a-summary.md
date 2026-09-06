# Lighthouse t2a — mobile, simulated slow 4G, performance only

Base: http://localhost:3000 · 3 runs per page · median-LCP run reported (all runs in parentheses)

| Page | Score | LCP | FCP | TBT | CLS | Speed Index |
|---|---|---|---|---|---|---|
| /en | 55 (61 / 55 / 54) | 4.32 s (3.79 s / 4.32 s / 4.37 s) | 1.07 s | 367 ms (258 / 367 / 396) | 0.504 | 3.06 s |
| /en/products/solo-flex | 69 (69 / 69 / 62) | 3.34 s (3.34 s / 3.28 s / 4.14 s) | 1.07 s | 106 ms (106 / 107 / 141) | 0.606 | 1.41 s |
| /en/products/rwood-micro | 50 (50 / 50 / 50) | 8.30 s (8.48 s / 8.12 s / 8.30 s) | 1.09 s | 198 ms (205 / 202 / 198) | 0.577 | 2.90 s |

- LCP element on /en: `<img alt="rWood Micro acoustic panel with natural wood veneer, close-up of the finish" fetchpriority="high" decoding="async" data-nimg="fill" style="position: a`
- LCP element on /en/products/solo-flex: `<p class="jsx-bac31250688cd442 hero-description">`
- LCP element on /en/products/rwood-micro: `<p class="jsx-a94f9bf580d36de7 hero-description">`
