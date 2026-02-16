(() => {
  'use strict';

  const root = document.documentElement;
  const navToggle = document.getElementById('nav-toggle');
  const navLinks = document.getElementById('nav-links');
  const themeToggle = document.getElementById('theme-toggle');

  const toolkit = {
    sanitizeInput(value = '') {
      return value.replace(/[<>]/g, '').trim();
    },
    normalize(value = '') {
      return toolkit.sanitizeInput(value).toLowerCase();
    },
    formatDate(isoString) {
      const formatter = new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      });
      return formatter.format(new Date(isoString));
    }
  };

  window.RBToolkit = toolkit;

  const storedTheme = localStorage.getItem('rb-theme');
  if (storedTheme) {
    root.setAttribute('data-theme', storedTheme);
  }

  function toggleTheme() {
    const current = root.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('rb-theme', next);
    if (themeToggle) {
      themeToggle.setAttribute('data-theme', next);
    }
  }

  themeToggle?.addEventListener('click', toggleTheme);

  navToggle?.addEventListener('click', () => {
    const open = navLinks?.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  navLinks?.addEventListener('click', (event) => {
    if (event.target instanceof HTMLElement && event.target.tagName === 'A') {
      navLinks.classList.remove('is-open');
      navToggle?.setAttribute('aria-expanded', 'false');
    }
  });

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!prefersReducedMotion) {
    let rafPending = false;
    document.addEventListener('pointermove', (event) => {
      if (rafPending) return;
      rafPending = true;
      window.requestAnimationFrame(() => {
        root.style.setProperty('--pointer-x', `${event.clientX}px`);
        root.style.setProperty('--pointer-y', `${event.clientY}px`);
        rafPending = false;
      });
    });
  }

  document.body?.classList.add('page-ready');
})();
