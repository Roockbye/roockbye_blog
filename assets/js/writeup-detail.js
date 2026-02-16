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
    // Content comes from our own writeups.json (trusted source)
    const wrapper = el('div', { className: 'detail-content' });
    wrapper.innerHTML = html;
    container.appendChild(wrapper);
  }

  async function loadWriteup() {
    const container = document.getElementById('writeup-container');
    if (!container) return;

    const id = window.location.hash.slice(1);

    if (!id) {
      container.textContent = '';
      const err = el('div', { className: 'detail-error' });
      err.textContent = 'No writeup specified. ';
      err.appendChild(el('a', { href: 'writeups.html' }, 'Back to writeups'));
      container.appendChild(err);
      return;
    }

    try {
      const response = await fetch('assets/data/writeups.json');
      if (!response.ok) throw new Error('Network error: ' + response.status);

      const writeups = await response.json();
      const writeup = writeups.find(w => w.id === id);

      if (!writeup) {
        container.textContent = '';
        const err = el('div', { className: 'detail-error' });
        err.textContent = 'Writeup not found. ';
        err.appendChild(el('a', { href: 'writeups.html' }, 'Back to writeups'));
        container.appendChild(err);
        return;
      }

      document.title = writeup.title + ' | Roockbye';

      // Build the page with DOM
      container.textContent = '';

      // Header
      const header = el('div', { className: 'detail-header' });
      header.appendChild(el('h1', { textContent: writeup.title }));

      // Meta
      const meta = el('div', { className: 'detail-meta' });
      meta.appendChild(el('span', null, '📁 ' + writeup.category));
      meta.appendChild(el('span', null, '⚔️ ' + writeup.difficulty));
      if (writeup.date) {
        meta.appendChild(el('span', null, '📅 ' + new Date(writeup.date).toLocaleDateString('en-US')));
      }
      header.appendChild(meta);

      // Tags
      if (writeup.tags?.length) {
        const tagsRow = el('div', { className: 'detail-tags' });
        writeup.tags.forEach(t => {
          tagsRow.appendChild(el('span', { className: 'tag', textContent: t }));
        });
        header.appendChild(tagsRow);
      }

      container.appendChild(header);

      // Content
      if (writeup.content) {
        renderContentHtml(container, writeup.content);
      } else {
        const noContent = el('div', { className: 'detail-content' });
        noContent.appendChild(el('p', { textContent: writeup.summary || 'Content not available.' }));
        container.appendChild(noContent);
      }

      // Mitigations
      if (writeup.mitigations?.length) {
        const mitigations = el('div', { className: 'detail-mitigations' });
        mitigations.appendChild(el('h3', { textContent: '🛡️ Mitigations' }));
        const list = el('ul');
        writeup.mitigations.forEach(m => {
          list.appendChild(el('li', { textContent: m }));
        });
        mitigations.appendChild(list);
        container.appendChild(mitigations);
      }

      // Hash
      if (writeup.hash) {
        const hashDiv = el('div', { className: 'detail-hash' });
        hashDiv.appendChild(el('strong', { textContent: 'Hash: ' }));
        hashDiv.appendChild(document.createTextNode(writeup.hash));
        container.appendChild(hashDiv);
      }

    } catch (error) {
      container.textContent = '';
      const err = el('div', { className: 'detail-error' });
      err.textContent = 'Error loading: ' + error.message;
      container.appendChild(err);
    }
  }

  document.addEventListener('DOMContentLoaded', loadWriteup);

  // Handle hash changes (back/forward navigation)
  window.addEventListener('hashchange', loadWriteup);
})();
