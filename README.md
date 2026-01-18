# Re-Sound Website

Circular acoustic solutions from recycled materials. Designed for the planet, made in Belgium.

🌐 **Live site:** [re-sound.be](https://re-sound.be)

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + CSS-in-JS
- **Internationalization:** next-intl (EN, NL, FR, DE)
- **Output:** Static HTML export
- **Analytics:** Google Analytics, Meta Pixel, Bing UET (GDPR compliant)

## Getting Started

### Prerequisites

- Node.js 18.17 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone git@github.com:STRETCH-BE/re-sound.be.git
cd re-sound.be

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
re-sound.be/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── [locale]/           # Localized pages
│   │   │   ├── page.tsx        # Homepage
│   │   │   ├── products/       # Products pages
│   │   │   ├── about/          # About page
│   │   │   ├── sustainability/ # Sustainability page
│   │   │   ├── contact/        # Contact page
│   │   │   └── blog/           # Blog pages
│   │   ├── api/                # API routes
│   │   └── globals.css         # Global styles
│   │
│   ├── components/
│   │   ├── layout/             # Header, Footer, etc.
│   │   ├── ui/                 # Button, Card, Input, etc.
│   │   ├── sections/           # Page sections
│   │   └── analytics/          # GA, Meta Pixel, Bing
│   │
│   └── i18n/                   # Internationalization config
│
├── messages/                   # Translation files
│   ├── en.json
│   ├── nl.json
│   ├── fr.json
│   └── de.json
│
├── middleware.ts               # Locale detection
├── next.config.mjs             # Next.js config
├── tailwind.config.ts          # Tailwind config
└── tsconfig.json               # TypeScript config
```

## Available Scripts

```bash
npm run dev       # Start development server
npm run build     # Build for production
npm run start     # Start production server
npm run lint      # Run ESLint
npm run type-check # Check TypeScript
```

## Deployment

This site is configured for static export. Build and deploy:

```bash
npm run build
```

The static files will be in the `out/` directory, ready for deployment to any static hosting (Netlify, Vercel, GitHub Pages, etc.).

## Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Brand Blue | `#197FC7` | Primary buttons, links |
| Deep Blue | `#0A1628` | Headings, dark text |
| Accent | `#2DBDA8` | Success states, highlights |
| Cream | `#F8F9FA` | Backgrounds |
| Warm White | `#FDFEFF` | Page background |

## Languages

- 🇬🇧 English (`/en/`)
- 🇳🇱 Nederlands (`/nl/`)
- 🇫🇷 Français (`/fr/`)
- 🇩🇪 Deutsch (`/de/`)

## License

Copyright © 2024 Re-Sound. All rights reserved.
