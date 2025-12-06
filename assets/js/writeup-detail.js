(() => {
  'use strict';

  function sanitizeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  async function loadWriteup() {
    const container = document.getElementById('writeup-container');
    
    if (!container) {
      console.error('Container not found');
      return;
    }
    
    // Get writeup ID from URL hash
    const id = window.location.hash.slice(1);
    
    if (!id) {
      container.innerHTML = '<div class="error">Aucun writeup spécifié. <a href="writeups.html">Retour aux writeups</a></div>';
      return;
    }

    try {
      console.log('Loading writeup:', id);
      // Fetch writeups directly from JSON
      const response = await fetch('assets/data/writeups.json');
      if (!response.ok) throw new Error('Failed to load writeups: ' + response.status);
      
      const writeups = await response.json();
      console.log('Loaded writeups:', writeups.length);
      
      const writeup = writeups.find(w => w.id === id);
      
      if (!writeup) {
        console.error('Writeup not found:', id);
        container.innerHTML = '<div class="error">Writeup non trouvé. <a href="writeups.html">Retour aux writeups</a></div>';
        return;
      }

      console.log('Found writeup:', writeup.title);
      
      // Update page title
      document.title = `${writeup.title} | Roockbye`;

      // Render writeup
      const html = `
        <header>
          <h1>${sanitizeHtml(writeup.title)}</h1>
          <div class="writeup-meta">
            <span>📁 ${sanitizeHtml(writeup.category)}</span>
            <span>⚔️ ${sanitizeHtml(writeup.difficulty)}</span>
            <span>📅 ${new Date(writeup.date).toLocaleDateString('fr-FR')}</span>
          </div>
          <div class="writeup-tags">
            ${writeup.tags.map(tag => `<span class="tag">${sanitizeHtml(tag)}</span>`).join('')}
          </div>
        </header>

        <div class="writeup-content">
          ${writeup.content || '<p>Contenu non disponible.</p>'}
        </div>

        ${writeup.mitigations && writeup.mitigations.length > 0 ? `
          <div class="mitigations">
            <h3>🛡️ Mitigations</h3>
            <ul>
              ${writeup.mitigations.map(m => `<li>${sanitizeHtml(m)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      `;

      container.innerHTML = html;
      console.log('Writeup loaded successfully');
    } catch (error) {
      console.error('Error loading writeup:', error);
      container.innerHTML = `<div class="error">Erreur lors du chargement du writeup: ${sanitizeHtml(error.message)}</div>`;
    }
  }

  // Load when DOM is ready
  document.addEventListener('DOMContentLoaded', loadWriteup);
})();
