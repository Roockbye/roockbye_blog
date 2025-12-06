(() => {
  'use strict';

  // Fallback data si l'API est indisponible
  const fallbackWriteups = [
    {
      id: 'hypervisor',
      title: 'Hypervisor Poisoning',
      category: 'Cloud isolation',
      difficulty: 'hard',
      summary: 'Chaîne d’attaque visant la mémoire partagée et la remontée de privilèges invités → host.',
      tags: ['cloud', 'reverse'],
      hash: 'sha512:6f1f347b7d69',
      mitigations: ['Strict micro-segmentation', 'Integrity monitoring', 'Firmware attestation']
    },
    {
      id: 'cipher-veins',
      title: 'Cipher Veins',
      category: 'Crypto',
      difficulty: 'medium',
      summary: 'Analyse différentielle sur un protocole maison utilisé dans un IOT industriel.',
      tags: ['crypto'],
      hash: 'sha512:a12ae0e8bd30',
      mitigations: ['Remplacer l’algorithme propriétaire', 'Limiter les clés statiques']
    },
    {
      id: 'silo-rain',
      title: 'Silo Rain',
      category: 'Web/SSRF',
      difficulty: 'medium',
      summary: 'SSRF → IAM credentials → persistance dans un worker sans disque.',
      tags: ['web', 'cloud'],
      hash: 'sha512:b932bca71f1e',
      mitigations: ['IAM scoped', 'Metadata proxy filter']
    },
    {
      id: 'signal-pulse',
      title: 'Signal Pulse',
      category: 'RF / OT',
      difficulty: 'hard',
      summary: 'Pivot RF vers réseau interne via passerelle Modbus vulnérable.',
      tags: ['reverse'],
      hash: 'sha512:0d4e12097a22',
      mitigations: ['Isolation protocole', 'Audit firmware']
    },
    {
      id: 'lumen-stage',
      title: 'Lumen Stage',
      category: 'Binary exploitation',
      difficulty: 'init',
      summary: 'Ret2libc pédagogique sous GLIBC 2.31 avec focus sur la préparation des gadgets.',
      tags: ['reverse'],
      hash: 'sha512:4a7812bb1191',
      mitigations: ['ASLR strict', 'Stack canaries', 'RELRO complet']
    },
    {
      id: 'fog-lattice',
      title: 'Fog Lattice',
      category: 'Cloud / IAM',
      difficulty: 'medium',
      summary: 'Escalade de privilèges via mauvaise délégation Terraform.',
      tags: ['cloud'],
      hash: 'sha512:9b2ee871b410',
      mitigations: ['Revue IaC', 'limitation AssumeRole', 'Session MFA']
    }
  ];

  const difficultyLabel = {
    init: 'Init',
    medium: 'Medium',
    hard: 'Hard'
  };

  function init() {
    const toolkit = window.RBToolkit || {
      sanitizeInput: (value = '') => value,
      normalize: (value = '') => value.toLowerCase()
    };

    const nodes = {
      search: document.getElementById('writeup-search'),
      difficulty: document.getElementById('difficulty-filter'),
      chipsContainer: document.getElementById('tag-chips'),
      cards: document.querySelector('[data-writeups]'),
      total: document.querySelector('[data-total-count]')
    };

    if (!nodes.cards) return;

    const state = {
      text: '',
      difficulty: 'all',
      tag: 'all'
    };

    const render = (list) => {
      nodes.cards.innerHTML = '';

      if (nodes.total) {
        nodes.total.textContent = list.length.toString().padStart(2, '0');
      }

      if (!list.length) {
        const empty = document.createElement('div');
        empty.className = 'no-results';
        empty.textContent = 'Aucun writeup ne correspond à ce filtre.';
        nodes.cards.appendChild(empty);
        return;
      }

      list.forEach((item) => {
        const card = document.createElement('article');
        card.className = 'writeup-card';
        card.id = item.id;

        const title = document.createElement('h3');
        title.textContent = item.title;
        card.appendChild(title);

        const meta = document.createElement('div');
        meta.className = 'card-meta';
        
        const categorySpan = document.createElement('span');
        categorySpan.textContent = item.category;
        meta.appendChild(categorySpan);
        
        const difficultySpan = document.createElement('span');
        difficultySpan.textContent = difficultyLabel[item.difficulty] || item.difficulty;
        meta.appendChild(difficultySpan);
        
        const hashSpan = document.createElement('span');
        hashSpan.textContent = item.hash;
        meta.appendChild(hashSpan);
        
        card.appendChild(meta);

        const summary = document.createElement('p');
        summary.textContent = item.summary;
        card.appendChild(summary);

        const tagsWrap = document.createElement('div');
        tagsWrap.className = 'card-meta';
        item.tags.forEach((tag) => {
          const chip = document.createElement('span');
          chip.className = 'tag';
          chip.textContent = tag;
          tagsWrap.appendChild(chip);
        });
        card.appendChild(tagsWrap);

        if (item.mitigations?.length) {
          const list = document.createElement('ul');
          item.mitigations.forEach((miti) => {
            const li = document.createElement('li');
            li.textContent = miti;
            list.appendChild(li);
          });
          card.appendChild(list);
        }

        const footer = document.createElement('div');
        footer.className = 'post-footer';
        const link = document.createElement('a');
        link.className = 'link-arrow';
        link.href = `blog.html#${item.id}`;
        link.textContent = 'Voir le post';
        link.setAttribute('rel', 'noopener');
        footer.appendChild(link);
        card.appendChild(footer);

        nodes.cards.appendChild(card);
      });
    };

    const applyFilters = () => {
      const filtered = writeups.filter((item) => {
        if (state.difficulty !== 'all' && item.difficulty !== state.difficulty) {
          return false;
        }

        if (state.tag !== 'all' && !item.tags.includes(state.tag)) {
          return false;
        }

        if (state.text) {
          const haystack = toolkit
            .normalize(`${item.title} ${item.summary} ${item.category} ${item.hash}`);
          if (!haystack.includes(state.text)) {
            return false;
          }
        }

        return true;
      });

      render(filtered);
    };

    nodes.search?.addEventListener('input', (event) => {
      const value = event.currentTarget?.value ?? '';
      state.text = toolkit.normalize(toolkit.sanitizeInput(value));
      window.requestAnimationFrame(applyFilters);
    });

    nodes.difficulty?.addEventListener('change', (event) => {
      const value = event.currentTarget?.value ?? 'all';
      state.difficulty = toolkit.sanitizeInput(value) || 'all';
      applyFilters();
    });

    nodes.chipsContainer?.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLButtonElement)) return;
      const value = target.dataset.tag || 'all';
      state.tag = toolkit.sanitizeInput(value) || 'all';

      nodes.chipsContainer
        .querySelectorAll('button')
        .forEach((btn) => btn.setAttribute('aria-pressed', btn === target ? 'true' : 'false'));

      applyFilters();
    });

    // Charger les writeups depuis l'API
    async function loadWriteups() {
      try {
        const api = window.RBApi;
        if (!api) {
          console.warn('API not available, using fallback data');
          render(fallbackWriteups);
          return;
        }

        const response = await api.getWriteups();
        if (response.success && response.data) {
          render(response.data);
        } else {
          render(fallbackWriteups);
        }
      } catch (error) {
        console.error('Failed to load writeups:', error);
        render(fallbackWriteups);
      }
    }

    loadWriteups();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
