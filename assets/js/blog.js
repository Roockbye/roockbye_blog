(() => {
  'use strict';

  // Fallback data si l'API est indisponible
  const fallbackPosts = [
    {
      id: 'op-wraith',
      title: 'Opération Wraith Pulse',
      category: 'redteam',
      date: '2025-11-18',
      summary: 'Simulation d’APT multi-cloud avec empreintes numériques minimales et egress sur satellite.',
      tags: ['C2', 'Evasion'],
      mitigations: ['Network baselines', 'UEBA renforcé'],
      link: '#op-wraith'
    },
    {
      id: 'hypervisor',
      title: 'Hypervisor Poisoning Deep Dive',
      category: 'research',
      date: '2025-09-04',
      summary: 'Reverse engineering complet de la VRAM partagée et sideload de payloads persistants.',
      tags: ['Cloud', 'Virtualisation'],
      mitigations: ['Secure boot chain', 'Attestation continue'],
      link: '#hypervisor'
    },
    {
      id: 'blue-glass',
      title: 'Blueprint: SOC anti-mimiKatz',
      category: 'blueprint',
      date: '2025-08-11',
      summary: 'Playbook côté blue team pour détecter les extractions LSASS même chiffrées.',
      tags: ['Detection'],
      mitigations: ['YARA live', 'ETW hardening'],
      link: '#blue-glass'
    },
    {
      id: 'silo-rain',
      title: 'Silo Rain Notes',
      category: 'redteam',
      date: '2025-07-02',
      summary: 'Chaîne SSRF → exfiltration hermétique, avec nouveaux contremesures Terraform.',
      tags: ['Cloud'],
      mitigations: ['Metadata sanitize', 'Secrets rotation'],
      link: '#silo-rain'
    }
  ];

  function init() {
    const toolkit = window.RBToolkit || {
      sanitizeInput: (value = '') => value,
      normalize: (value = '') => value.toLowerCase(),
      formatDate: (value) => value
    };

    const nodes = {
      search: document.getElementById('post-search'),
      category: document.getElementById('category-filter'),
      list: document.querySelector('[data-posts]')
    };

    if (!nodes.list) return;

    const state = { text: '', category: 'all' };

    const render = (items) => {
      nodes.list.innerHTML = '';

      if (!items.length) {
        const empty = document.createElement('div');
        empty.className = 'no-results';
        empty.textContent = 'Aucun post ne correspond à votre recherche.';
        nodes.list.appendChild(empty);
        return;
      }

      items.forEach((post) => {
        const article = document.createElement('article');
        article.className = 'blog-card';
        article.id = post.id;

        const header = document.createElement('div');
        header.className = 'card-meta';
        
        const dateSpan = document.createElement('span');
        dateSpan.textContent = toolkit.formatDate(post.date);
        header.appendChild(dateSpan);
        
        const categorySpan = document.createElement('span');
        categorySpan.textContent = post.category;
        header.appendChild(categorySpan);
        
        article.appendChild(header);

        const title = document.createElement('h3');
        title.textContent = post.title;
        article.appendChild(title);

        const summary = document.createElement('p');
        summary.textContent = post.summary;
        article.appendChild(summary);

        const tagsRow = document.createElement('div');
        tagsRow.className = 'card-meta';
        post.tags.forEach((tag) => {
          const span = document.createElement('span');
          span.className = 'tag';
          span.textContent = tag;
          tagsRow.appendChild(span);
        });
        article.appendChild(tagsRow);

        if (post.mitigations?.length) {
          const list = document.createElement('ul');
          post.mitigations.forEach((miti) => {
            const li = document.createElement('li');
            li.textContent = miti;
            list.appendChild(li);
          });
          article.appendChild(list);
        }

        const footer = document.createElement('div');
        footer.className = 'post-footer';
        const link = document.createElement('a');
        link.href = post.link || '#';
        link.className = 'link-arrow';
        link.textContent = 'Voir les détails';
        footer.appendChild(link);
        article.appendChild(footer);

        nodes.list.appendChild(article);
      });
    };

    const applyFilters = () => {
      const filtered = posts.filter((post) => {
        if (state.category !== 'all' && post.category !== state.category) {
          return false;
        }

        if (state.text) {
          const haystack = toolkit
            .normalize(`${post.title} ${post.summary} ${post.category} ${post.tags.join(' ')}`);
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
      applyFilters();
    });

    nodes.category?.addEventListener('change', (event) => {
      const value = event.currentTarget?.value ?? 'all';
      state.category = toolkit.sanitizeInput(value) || 'all';
      applyFilters();
    });

    // Charger les posts depuis l'API
    async function loadBlogPosts() {
      try {
        const api = window.RBApi;
        if (!api) {
          console.warn('API not available, using fallback data');
          render(fallbackPosts);
          return;
        }

        const response = await api.getBlogPosts();
        if (response.success && response.data) {
          render(response.data);
        } else {
          render(fallbackPosts);
        }
      } catch (error) {
        console.error('Failed to load blog posts:', error);
        render(fallbackPosts);
      }
    }

    loadBlogPosts();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
