# roockbye_blog

Blog hacker stylé avec design cyberpunk violet/noir, hosted on **GitHub Pages**. 
Static content (HTML + CSS + vanilla JS) with zero dependencies, automatic deployment via GitHub Actions.

## 🚀 Deployment

This project is configured for **GitHub Pages**:
- ✅ Zero npm dependencies (production)
- ✅ Static content with JSON data
- ✅ Automatic deployment on every push to `main`
- ✅ Security Grade A (strict CSP, HTTPS, no trackers)
- ✅ Accessible at `https://roockbye.github.io/roockbye_blog/` (or custom domain)

### Getting started
1. Push to GitHub: `git push origin main`
2. GitHub Actions automatically deploys to Pages ⚡
3. Wait 2-3 min → site is live ✨

## Stack & architecture
- **Frontend**: HTML5 + CSS3 + vanilla JS (no dependencies)
- **Data**: Static JSON in `assets/data/` (writeups.json, blog.json)
- **Deployment**: GitHub Pages + GitHub Actions
- **Performance**: ~68 KB total, gzipped ~15-20 KB

## Visual direction
- Cyberpunk palette anchored in deep blacks and energetic violets with neon gradients
- Expressive headings (Space Grotesk) mixed with monospaced body text for terminal vibes
- Dynamic glow accents, subtle scan-line background texture, and purposeful micro-animations (nav underline, card hover, page reveals)

## 📁 Project structure

```
roockbye_blog/
├── index.html                      # Home page (hero, featured)
├── about.html                      # About (timeline, skills)
├── writeups.html                   # Writeups with filters
├── blog.html                       # Blog posts with filters
├── assets/
│   ├── css/
│   │   └── main.css               # Cyberpunk design (25 KB)
│   ├── js/
│   │   ├── site.js                # Global utilities (theme toggle, nav)
│   │   ├── api.js                 # API client (loads JSON, caching)
│   │   ├── writeups.js            # Writeups logic (filtering, render)
│   │   └── blog.js                # Blog logic (filtering, render)
│   └── data/
│       ├── writeups.json          # Structured writeups (4+ items)
│       └── blog.json              # Blog posts (6+ items)
├── .github/
│   └── workflows/
│       └── deploy.yml             # GitHub Actions CI/CD
├── .nojekyll                      # Skip Jekyll processing
├── CODE_AUDIT.md                  # Full security audit
├── GITHUB_PAGES_CONFIG.md         # GitHub Pages config
├── README.md                      # This file
└── .gitignore                     # Git ignore patterns
```

## 📝 Content management

### Adding a writeup
Edit `assets/data/writeups.json` and add an object:
```json
{
  "id": "my-writeup",
  "title": "Writeup title",
  "category": "web|kernel|crypto|system",
  "difficulty": "init|medium|hard",
  "summary": "Short description",
  "tags": ["tag1", "tag2"],
  "hash": "sha512:xxxx",
  "mitigations": ["mitigation 1", "mitigation 2"],
  "date": "2025-12-06T14:30:00Z"
}
```

### Adding a blog post
Edit `assets/data/blog.json` and add an object:
```json
{
  "id": "my-post",
  "title": "Post title",
  "category": "redteam|research|blueprint",
  "summary": "Short description",
  "date": "2025-12-06T14:30:00Z",
  "tags": ["tag1", "tag2"]
}
```

After each change, a commit to `main` triggers automatic deployment! 🚀

## 🔒 Security & Standards

### Frontend Security
- ✅ **Strict CSP**: `default-src 'self'` + font whitelist
- ✅ **Forced HTTPS**: GitHub Pages + Enforce HTTPS toggle
- ✅ **XSS Protection**: TextContent + createElement (no dangerous innerHTML)
- ✅ **No tracking**: Zero external scripts (Google Analytics, FB Pixel, etc.)
- ✅ **Input sanitization**: All inputs validated before use
- ✅ **Secure headers**: X-Content-Type-Options, Referrer-Policy, HSTS

### Accessibility (a11y)
- ✅ HTML5 semantics (header, nav, main, article, footer)
- ✅ ARIA labels on buttons
- ✅ 100% keyboard navigation
- ✅ Sufficient contrast (WCAG AA)
- ✅ Reduced motion mode respected

### Code Standards
- ✅ JavaScript strict mode everywhere
- ✅ Modern ES6+ (async/await, optional chaining, etc.)
- ✅ No npm dependencies (for production)
- ✅ Consistent naming conventions
- ✅ Comments on complex logic

See **[CODE_AUDIT.md](CODE_AUDIT.md)** for the full audit.
```

## Running locally for development

Two options:

### Option 1: Python (simple)
```bash
# Python 3
python3 -m http.server 8000

# Access: http://localhost:8000
# Refresh the browser after changes (F5)
```

### Option 2: Node.js http-server
```bash
# Install if needed
npm install -g http-server

# Start
http-server -p 8080

# Access: http://localhost:8080
```

### Editing content
1. Edit the JSON files in `assets/data/`
2. Refresh the browser (F5) to see the changes
3. Commit and push → auto deployment to Pages ✨

## Best practices

### ✅ Do
- Edit content in the JSON files
- Commit regularly: `git add . && git commit -m "feat: add new writeup"`
- Test locally before pushing
- Use clear commit messages

### ❌ Don't
- Don't edit HTML/CSS/JS files without a valid reason
- Don't add lightweight npm dependencies
- Don't commit secrets or sensitive files
- Don't remove CSP or security headers
- Don't use `innerHTML` with dynamic content

## ⚙️ Future improvements

### Content
- [ ] Add more writeups/posts
- [ ] Advanced tag system
- [ ] Secure comment system

### Frontend
- [ ] Admin panel for managing posts (no backend)
- [ ] Dark/Light mode switcher (ready, just enable)
- [ ] PWA support (offline reading)
- [ ] i18n translation

### Advanced (if you want a backend)
- [ ] Database (PostgreSQL/MongoDB)
- [ ] JWT authentication for admin panel
- [ ] API with Zod validation
- [ ] Docker containerization
- [ ] Deploy backend on Railway/Fly.io (separate from Pages)