(() => {
  'use strict';

  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    if (attrs) {
      Object.entries(attrs).forEach(([k, v]) => {
        if (k === 'className') node.className = v;
        else if (k === 'textContent') node.textContent = v;
        else node.setAttribute(k, v);
      });
    }
    children.forEach(c => {
      if (typeof c === 'string') node.appendChild(document.createTextNode(c));
      else if (c) node.appendChild(c);
    });
    return node;
  }

  function renderContentHtml(container, html) {
    // Content comes from our own blog.json (trusted source)
    const wrapper = el('div', { className: 'detail-content' });
    wrapper.innerHTML = html;
    container.appendChild(wrapper);
  }

  const categoryLabels = {
    redteam: 'Red Team',
    research: 'Recherche',
    blueprint: 'Blueprint',
    blueteam: 'Blue Team',
    hardware: 'Hardware',
    cti: 'CTI'
  };

  async function loadPost() {
    const container = document.getElementById('blog-container');
    if (!container) return;

    const id = window.location.hash.slice(1);

    if (!id) {
      container.textContent = '';
      const err = el('div', { className: 'detail-error' });
      err.textContent = 'Aucun article spécifié. ';
      err.appendChild(el('a', { href: 'blog.html' }, 'Retour au blog'));
      container.appendChild(err);
      return;
    }

    try {
      const response = await fetch('assets/data/blog.json');
      if (!response.ok) throw new Error('Erreur réseau : ' + response.status);

      const posts = await response.json();
      const post = posts.find(p => p.id === id);

      if (!post) {
        container.textContent = '';
        const err = el('div', { className: 'detail-error' });
        err.textContent = 'Article non trouvé. ';
        err.appendChild(el('a', { href: 'blog.html' }, 'Retour au blog'));
        container.appendChild(err);
        return;
      }

      document.title = post.title + ' | Roockbye';

      // Build page with DOM
      container.textContent = '';

      // Header
      const header = el('div', { className: 'detail-header' });
      header.appendChild(el('h1', { textContent: post.title }));

      // Meta
      const meta = el('div', { className: 'detail-meta' });
      const catLabel = categoryLabels[post.category] || post.category;
      meta.appendChild(el('span', null, '📂 ' + catLabel));
      if (post.date) {
        const toolkit = window.RBToolkit;
        const dateStr = toolkit
          ? toolkit.formatDate(post.date)
          : new Date(post.date).toLocaleDateString('fr-FR');
        meta.appendChild(el('span', null, '📅 ' + dateStr));
      }
      header.appendChild(meta);

      // Tags
      if (post.tags?.length) {
        const tagsRow = el('div', { className: 'detail-tags' });
        post.tags.forEach(t => {
          tagsRow.appendChild(el('span', { className: 'tag', textContent: t }));
        });
        header.appendChild(tagsRow);
      }

      container.appendChild(header);

      // Content
      if (post.content) {
        renderContentHtml(container, post.content);
      } else {
        const noContent = el('div', { className: 'detail-content' });
        noContent.appendChild(el('p', { textContent: post.summary || 'Contenu non disponible pour le moment.' }));
        container.appendChild(noContent);
      }

      // Mitigations (some blog posts have them)
      if (post.mitigations?.length) {
        const mitigations = el('div', { className: 'detail-mitigations' });
        mitigations.appendChild(el('h3', { textContent: '🛡️ Mitigations' }));
        const list = el('ul');
        post.mitigations.forEach(m => {
          list.appendChild(el('li', { textContent: m }));
        });
        mitigations.appendChild(list);
        container.appendChild(mitigations);
      }

    } catch (error) {
      container.textContent = '';
      const err = el('div', { className: 'detail-error' });
      err.textContent = 'Erreur lors du chargement : ' + error.message;
      container.appendChild(err);
    }
  }

  document.addEventListener('DOMContentLoaded', loadPost);

  // Handle hash changes (back/forward navigation)
  window.addEventListener('hashchange', loadPost);
})();
