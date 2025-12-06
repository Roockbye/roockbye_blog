(() => {
  'use strict';

  // Cache for JSON data
  let writeupsCache = null;
  let blogCache = null;

  const api = {
    async getWriteups() {
      if (writeupsCache) return { success: true, data: writeupsCache, count: writeupsCache.length };
      
      try {
        const response = await fetch('assets/data/writeups.json');
        if (!response.ok) throw new Error('Failed to load writeups');
        writeupsCache = await response.json();
        return { success: true, data: writeupsCache, count: writeupsCache.length };
      } catch (error) {
        console.error('Failed to load writeups:', error);
        return { success: false, data: [], count: 0 };
      }
    },

    async getWriteupById(id) {
      const { data } = await this.getWriteups();
      const writeup = data.find(w => w.id === id);
      if (!writeup) throw new Error('Writeup not found');
      return writeup;
    },

    async getBlogPosts() {
      if (blogCache) return { success: true, data: blogCache, count: blogCache.length };
      
      try {
        const response = await fetch('assets/data/blog.json');
        if (!response.ok) throw new Error('Failed to load blog posts');
        blogCache = await response.json();
        return { success: true, data: blogCache, count: blogCache.length };
      } catch (error) {
        console.error('Failed to load blog posts:', error);
        return { success: false, data: [], count: 0 };
      }
    },

    async getBlogPostById(id) {
      const { data } = await this.getBlogPosts();
      const post = data.find(p => p.id === id);
      if (!post) throw new Error('Blog post not found');
      return post;
    },

    async search(query, limit = 20, offset = 0) {
      if (!query || query.trim().length === 0) {
        return { data: [], count: 0 };
      }

      const [{ data: writeups }, { data: blogPosts }] = await Promise.all([
        this.getWriteups(),
        this.getBlogPosts(),
      ]);

      const q = query.toLowerCase();
      const results = [
        ...writeups.filter(w => w.title.toLowerCase().includes(q) || w.summary.toLowerCase().includes(q)),
        ...blogPosts.filter(p => p.title.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q)),
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      const paginated = results.slice(offset, offset + limit);
      return { data: paginated, count: results.length };
    },
  };

  window.RBApi = api;
})();
