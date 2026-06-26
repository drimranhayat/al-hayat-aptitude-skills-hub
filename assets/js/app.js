(function () {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const REPO_NAME = "al-hayat-aptitude-skills-hub";
  const DATA_VERSION = "aptitude-20260626-01";

  function basePath() {
    return location.pathname.includes(`/${REPO_NAME}/`) ? `/${REPO_NAME}/` : "/";
  }

  function siteUrl(path = "") {
    if (!path || path === "/") return basePath();
    const value = String(path);
    if (/^(https?:|mailto:|tel:|#|javascript:)/i.test(value)) return value;
    return basePath() + value.replace(/^\/+/, "");
  }

  async function loadJSON(path) {
    const url = siteUrl(path.replace(/^\/+/, ""));
    const finalUrl = `${url}${url.includes("?") ? "&" : "?"}v=${encodeURIComponent(DATA_VERSION)}`;
    const response = await fetch(finalUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not load ${finalUrl}. Status: ${response.status}`);
    return response.json();
  }

  function escapeHTML(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function setupMenu() {
    const menu = $("#menuBtn") || $("[data-menu-toggle]");
    const nav = $("#navLinks") || $("[data-site-nav]");
    if (!menu || !nav) return;
    menu.addEventListener("click", () => {
      const open = !nav.classList.contains("open") && !nav.classList.contains("is-open");
      nav.classList.toggle("open", open);
      nav.classList.toggle("is-open", open);
      menu.setAttribute("aria-expanded", String(open));
    });
  }

  function fixLinks() {
    $$('a[href]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || /^(https?:|mailto:|tel:|#|javascript:)/i.test(href)) return;
      if (href.startsWith('../') || href.startsWith('./')) return;
      link.setAttribute('href', siteUrl(href));
    });
  }

  async function renderSocials() {
    const box = $('[data-socials]');
    if (!box) return;
    const items = await loadJSON('data/social-links.json').catch(() => []);
    if (!Array.isArray(items) || !items.length) {
      box.innerHTML = '<p class="muted">Social links will appear here after data is added.</p>';
      return;
    }
    box.innerHTML = items.map((item) => `<a href="${escapeHTML(item.url || '#')}" target="_blank" rel="noopener">${escapeHTML(item.name || 'Link')}</a>`).join(' ');
  }

  async function loadQuestionBank() {
    const main = await loadJSON('data/questions.json');
    const questions = Array.isArray(main.questions) ? [...main.questions] : [];
    if (Array.isArray(main.imports)) {
      for (const importPath of main.imports) {
        const pack = await loadJSON(importPath).catch(() => null);
        if (Array.isArray(pack?.questions)) questions.push(...pack.questions);
        else if (Array.isArray(pack)) questions.push(...pack);
      }
    }
    return questions;
  }

  async function searchSite() {
    const input = $('#siteSearch') || $('[data-site-search]');
    const results = $('#searchResults') || $('[data-search-results]');
    if (!input || !results) return;

    const [questions, skillsData, topicsData] = await Promise.all([
      loadQuestionBank().catch(() => []),
      loadJSON('data/skills.json').catch(() => []),
      loadJSON('data/topics.json').catch(() => [])
    ]);

    const skills = Array.isArray(skillsData) ? skillsData : skillsData.skills || skillsData.categories || [];
    const topics = Array.isArray(topicsData) ? topicsData : topicsData.topics || [];
    const index = [
      ...questions.map((q) => ({ type: 'Question', title: q.questionText || q.id, description: q.shortExplanation || q.topic || '', href: `practice/?question=${encodeURIComponent(q.id || '')}` })),
      ...skills.map((s) => ({ type: 'Skill', title: s.name || s.title || s.id, description: s.description || '', href: s.url || 'skills/' })),
      ...topics.map((t) => ({ type: 'Topic', title: t.name || t.title || t.id, description: t.description || '', href: t.url || 'skills/' }))
    ];

    function render() {
      const q = input.value.toLowerCase().trim();
      if (!q) {
        results.innerHTML = '<p class="muted">Type a term such as synonym, assumption, percentage, analogy, or FAST.</p>';
        return;
      }
      const matches = index.filter((item) => JSON.stringify(item).toLowerCase().includes(q)).slice(0, 40);
      results.innerHTML = matches.map((item) => `
        <article class="search-result-card">
          <span class="pill">${escapeHTML(item.type)}</span>
          <h3>${escapeHTML(item.title)}</h3>
          <p>${escapeHTML(item.description)}</p>
          <a class="btn" href="${siteUrl(item.href)}">Open</a>
        </article>
      `).join('') || '<p class="muted">No result found. Try another keyword.</p>';
    }

    input.addEventListener('input', render);
    render();
  }

  async function renderQuestionCount() {
    const nodes = $$('[data-question-count]');
    if (!nodes.length) return;
    const questions = await loadQuestionBank().catch(() => []);
    nodes.forEach((node) => { node.textContent = String(questions.length); });
  }

  document.addEventListener('DOMContentLoaded', () => {
    setupMenu();
    fixLinks();
    renderSocials();
    searchSite();
    renderQuestionCount();
    const year = $('[data-year]');
    if (year) year.textContent = new Date().getFullYear();
  });
})();
