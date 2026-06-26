(function () {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const REPO_NAME = "al-hayat-aptitude-skills-hub";

  function basePath() {
    return location.pathname.includes(`/${REPO_NAME}/`) ? `/${REPO_NAME}/` : "/";
  }

  function siteUrl(path = "") {
    if (/^(https?:|mailto:|tel:|#)/i.test(path)) return path;
    return basePath() + String(path || "").replace(/^\/+/, "");
  }

  function setupMenu() {
    const nav = $("[data-site-nav]") || $("#navLinks");
    const menu = $("[data-menu-toggle]") || $("#menuBtn");
    const backdrop = $("[data-nav-backdrop]");
    if (!nav || !menu) return;

    function setNav(open) {
      nav.classList.toggle("is-open", open);
      nav.classList.toggle("open", open);
      backdrop?.classList.toggle("is-open", open);
      document.body.classList.toggle("no-scroll", open);
      menu.setAttribute("aria-expanded", String(open));
    }

    menu.addEventListener("click", () => setNav(!nav.classList.contains("is-open") && !nav.classList.contains("open")));
    backdrop?.addEventListener("click", () => setNav(false));
    $$('a', nav).forEach((link) => link.addEventListener("click", () => setNav(false)));
  }

  function setupHeaderSearch() {
    const form = $("[data-header-search]") || $(".header-search") || $("form[role='search']");
    if (!form) return;
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = form.querySelector("input[name='q'], input[type='search'], input");
      const q = (input?.value || "").trim();
      location.href = siteUrl(`search/${q ? `?q=${encodeURIComponent(q)}` : ""}`);
    });
  }

  function setupPanels() {
    $$('[data-path-button]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.dataset.pathButton;
        $$('[data-path-button]').forEach((btn) => btn.classList.toggle('is-active', btn === button));
        $$('[data-path-panel]').forEach((panel) => { panel.hidden = panel.dataset.pathPanel !== id; });
      });
    });
    $$('[data-skill-tab]').forEach((button) => {
      button.addEventListener('click', () => {
        const id = button.dataset.skillTab;
        $$('[data-skill-tab]').forEach((btn) => btn.classList.toggle('is-active', btn === button));
        $$('[data-skill-panel]').forEach((panel) => { panel.hidden = panel.dataset.skillPanel !== id; });
      });
    });
  }

  function fixLinks() {
    document.querySelectorAll('a[href]').forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || /^(https?:|mailto:|tel:|#|javascript:)/i.test(href)) return;
      if (href.startsWith('../') || href.startsWith('./')) return;
      link.setAttribute('href', siteUrl(href));
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setupMenu();
    setupHeaderSearch();
    setupPanels();
    fixLinks();
    const year = $("[data-year]");
    if (year) year.textContent = new Date().getFullYear();
  });
})();
