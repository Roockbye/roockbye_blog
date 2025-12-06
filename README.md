# roockbye_blog

Prototype of a neon hacker-themed personal blog with multiple static pages and client-side filtering for writeups.

## Stack & structure
- Pure HTML + CSS + vanilla JS served as static files (no build step required)
- Shared assets under `assets/` (CSS, JS, media, fonts)
- Pages: `index.html` (home), `about.html`, `writeups.html`, `blog.html`
- Optional dev server: any static HTTP server (e.g., `python -m http.server`)

## Visual direction
- Cyberpunk palette anchored in deep blacks and energetic violets with neon gradients
- Expressive headings (Space Grotesk) mixed with monospaced body text for terminal vibes
- Dynamic glow accents, subtle scan-line background texture, and purposeful micro-animations (nav underline, card hover, page reveals)

## Security posture goals
- Strictly local scripts/styles (no inline event handlers or `eval`)
- Baseline defensive meta tags (CSP, Referrer-Policy, X-UA-Compatible fallbacks)
- Content rendered from curated JSON structures to avoid arbitrary HTML injection
- Clear separation of presentation vs data to simplify future sanitization or server-side hardening

## Pages & core interactions
- **Home:** hero CTA, featured posts carousel, quick links to other sections
- **About:** profile, mission statement, skills grid, security principles
- **Writeups:** searchable/filterable catalog (tags + difficulty) powered by client-side data + secure filter logic
- **Blog:** chronological post feed with threat intel highlights and expandable details

## Next steps
1. Lay down shared layout components (nav/footer) and base styles
2. Implement content JSON + rendering utilities for writeups/blog pages
3. Add progressive enhancements (keyboard navigation cues, reduced-motion guardrails)
4. Document deployment + hardening checklist once the UI ships

## Lancer en local
1. Depuis la racine du projet, servez les fichiers statiques : `python -m http.server 8080`
2. Ouvrez `http://localhost:8080` dans un navigateur moderne
3. Activez HTTPS + en-têtes CSP équivalents côté hébergeur avant toute mise en ligne

Pour un hébergement sécurisé, privilégiez un CDN supportant TLS 1.3, activez les en-têtes `Strict-Transport-Security`, `Permissions-Policy` et ajoutez une pipeline CI pour analyser le HTML/JS (ex: `npm run lint` futur).