# roockbye_blog

Blog hacker stylé avec design cyberpunk violet/noir, hébergé sur **GitHub Pages**. 
Contenu statique (HTML + CSS + vanilla JS) sans dépendances, déploiement automatique via GitHub Actions.

## 🚀 Déploiement

Ce projet est configuré pour **GitHub Pages** :
- ✅ Zéro dépendances npm (production)
- ✅ Contenu statique avec données JSON
- ✅ Déploiement automatique sur chaque push vers `main`
- ✅ Sécurité Grade A (CSP stricte, HTTPS, no trackers)
- ✅ Accessible à `https://roockbye.github.io/roockbye_blog/` (ou domaine custom)

### Démarrer
1. Push vers GitHub : `git push origin main`
2. GitHub Actions déploie automatiquement sur Pages ⚡
3. Attends 2-3 min → site live ✨

## Stack & architecture
- **Frontend** : HTML5 + CSS3 + vanilla JS (aucune dépendance)
- **Data** : JSON statique dans `assets/data/` (writeups.json, blog.json)
- **Déploiement** : GitHub Pages + GitHub Actions
- **Performance** : ~68 KB total, gzipped ~15-20 KB

## Visual direction
- Cyberpunk palette anchored in deep blacks and energetic violets with neon gradients
- Expressive headings (Space Grotesk) mixed with monospaced body text for terminal vibes
- Dynamic glow accents, subtle scan-line background texture, and purposeful micro-animations (nav underline, card hover, page reveals)

## 📁 Structure du projet

```
roockbye_blog/
├── index.html                      # Page d'accueil (hero, featured)
├── about.html                      # À propos (timeline, skills)
├── writeups.html                   # Writeups avec filtres
├── blog.html                       # Blog posts avec filtres
├── assets/
│   ├── css/
│   │   └── main.css               # Design cyberpunk (25 KB)
│   ├── js/
│   │   ├── site.js                # Utilitaires globaux (theme toggle, nav)
│   │   ├── api.js                 # Client API (charge JSON, caching)
│   │   ├── writeups.js            # Logic writeups (filtrage, render)
│   │   └── blog.js                # Logic blog (filtrage, render)
│   └── data/
│       ├── writeups.json          # Writeups structurées (4+ items)
│       └── blog.json              # Blog posts (6+ items)
├── .github/
│   └── workflows/
│       └── deploy.yml             # GitHub Actions CI/CD
├── .nojekyll                      # Skip Jekyll processing
├── CODE_AUDIT.md                  # Audit de sécurité complet
├── GITHUB_PAGES_CONFIG.md         # Config GitHub Pages
├── README.md                      # Ce fichier
└── .gitignore                     # Git ignore patterns
```

## 📝 Gestion du contenu

### Ajouter un writeup
Édite `assets/data/writeups.json` et ajoute un objet :
```json
{
  "id": "mon-writeup",
  "title": "Titre du writeup",
  "category": "web|kernel|crypto|system",
  "difficulty": "init|medium|hard",
  "summary": "Description courte",
  "tags": ["tag1", "tag2"],
  "hash": "sha512:xxxx",
  "mitigations": ["mitigation 1", "mitigation 2"],
  "date": "2025-12-06T14:30:00Z"
}
```

### Ajouter un blog post
Édite `assets/data/blog.json` et ajoute un objet :
```json
{
  "id": "mon-post",
  "title": "Titre du post",
  "category": "redteam|research|blueprint",
  "summary": "Description courte",
  "date": "2025-12-06T14:30:00Z",
  "tags": ["tag1", "tag2"]
}
```

Après chaque modification, un commit sur `main` déclenche le déploiement automatique ! 🚀

## 🔒 Sécurité & Standards

### Sécurité Frontend
- ✅ **CSP stricte** : `default-src 'self'` + font whitelist
- ✅ **HTTPS forcé** : GitHub Pages + Enforce HTTPS toggle
- ✅ **XSS Protection** : TextContent + createElement (pas d'innerHTML dangereux)
- ✅ **No tracking** : Zéro script externe (Google Analytics, FB Pixel, etc.)
- ✅ **Input sanitization** : Tous les inputs validés avant utilisation
- ✅ **Secure headers** : X-Content-Type-Options, Referrer-Policy, HSTS

### Accessibilité (a11y)
- ✅ Sémantique HTML5 (header, nav, main, article, footer)
- ✅ ARIA labels sur les boutons
- ✅ Navigation au clavier 100% fonctionnelle
- ✅ Contraste suffisant (WCAG AA)
- ✅ Mode réduit de mouvement respecté

### Standards de Code
- ✅ Strict mode JavaScript partout
- ✅ ES6+ modernes (async/await, optional chaining, etc.)
- ✅ Pas de dépendances npm (pour la prod)
- ✅ Conventions de nommage cohérentes
- ✅ Commentaires sur la logique complexe

Voir **[CODE_AUDIT.md](CODE_AUDIT.md)** pour l'audit complet.
```

## Lancer en local pour développer

Deux options :

### Option 1 : Python (simple)
```bash
# Python 3
python3 -m http.server 8000

# Accès : http://localhost:8000
# Rafraîchis le navigateur après les modifications (F5)
```

### Option 2 : Node.js http-server
```bash
# Installe si besoin
npm install -g http-server

# Lance
http-server -p 8080

# Accès : http://localhost:8080
```

### Modifier le contenu
1. Édite les fichiers JSON dans `assets/data/`
2. Rafraîchis le navigateur (F5) pour voir les changements
3. Commit et push → déploiement auto sur Pages ✨

## Bonnes pratiques

### ✅ À faire
- Éditer le contenu dans les fichiers JSON
- Committer régulièrement : `git add . && git commit -m "feat: add new writeup"`
- Tester localement avant de push
- Utiliser des messages de commit clairs

### ❌ À ne pas faire
- Ne pas éditer les fichiers HTML/CSS/JS sans raison valide
- Ne pas ajouter npm dependencies légères
- Ne pas committer de secrets ou fichiers sensibles
- Ne pas supprimer la CSP ou les headers de sécurité
- Ne pas utiliser `innerHTML` avec du contenu dynamique

## ⚙️ Améliorations futures

### Contenu
- [ ] Ajouter plus de writeups/posts
- [ ] Système de tags avancé
- [ ] Système de commentaires sécurisé

### Frontend
- [ ] Admin panel pour gérer les posts (sans backend)
- [ ] Dark/Light mode switcher (prêt, juste activer)
- [ ] PWA support (offline reading)
- [ ] Traduction i18n

### Avancé (si tu veux un backend)
- [ ] Base de données (PostgreSQL/MongoDB)
- [ ] Authentification JWT pour admin panel
- [ ] API avec validation Zod
- [ ] Containerisation Docker
- [ ] Déployer backend sur Railway/Fly.io (séparé de Pages)