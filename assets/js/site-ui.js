(function () {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function setYear() {
    const year = $("[data-year]");
    if (year) year.textContent = new Date().getFullYear();
  }

  function setupBottomMore() {
    const more = $("[data-bottom-more]");
    const panel = $("[data-more-panel]");
    if (!more || !panel) return;

    more.addEventListener("click", () => {
      const open = panel.classList.toggle("is-open");
      more.setAttribute("aria-expanded", String(open));
    });

    document.addEventListener("click", (event) => {
      if (!panel.contains(event.target) && !more.contains(event.target)) {
        panel.classList.remove("is-open");
        more.setAttribute("aria-expanded", "false");
      }
    });
  }

  function setupGenericTabs() {
    $$('[data-tab-button]').forEach((button) => {
      button.addEventListener('click', () => {
        const group = button.dataset.tabGroup || 'default';
        const target = button.dataset.tabButton;
        $$(`[data-tab-button][data-tab-group="${group}"]`).forEach((btn) => btn.classList.toggle('is-active', btn === button));
        $$(`[data-tab-panel][data-tab-group="${group}"]`).forEach((panel) => {
          panel.hidden = panel.dataset.tabPanel !== target;
        });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setYear();
    setupBottomMore();
    setupGenericTabs();
  });
})();
