// Self-hosted Google Fonts via next/font — downloaded and served from our own
// origin at build time (no runtime requests to Google). Archivo ships as a
// single variable font with weight + width (wdth) axes; the "expanded" display
// look is the wdth axis driven up to 125 in CSS (see globals.css). Exposed as
// one CSS variable consumed throughout (--font-archivo).
import { Archivo } from 'next/font/google';

export const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
  fallback: ['system-ui', 'arial'],
});
