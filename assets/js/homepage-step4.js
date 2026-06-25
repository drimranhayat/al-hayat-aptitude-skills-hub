(function () {
  "use strict";

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      nav.classList.toggle("is-open", !open);
    });

    nav.addEventListener("click", function (event) {
      if (event.target.tagName === "A") {
        toggle.setAttribute("aria-expanded", "false");
        nav.classList.remove("is-open");
      }
    });
  }

  function setupAccordions() {
    var group = document.querySelector("[data-accordion-group]");
    if (!group) return;

    group.querySelectorAll(".exam-card button").forEach(function (button) {
      button.addEventListener("click", function () {
        var card = button.closest(".exam-card");
        var detail = card.querySelector(".exam-detail");
        var isOpen = card.classList.contains("is-open");

        group.querySelectorAll(".exam-card").forEach(function (item) {
          item.classList.remove("is-open");
          var itemButton = item.querySelector("button");
          var itemDetail = item.querySelector(".exam-detail");
          if (itemButton) itemButton.setAttribute("aria-expanded", "false");
          if (itemDetail) itemDetail.hidden = true;
        });

        if (!isOpen) {
          card.classList.add("is-open");
          button.setAttribute("aria-expanded", "true");
          if (detail) detail.hidden = false;
        }
      });
    });
  }

  function setupSkillTabs() {
    var tabs = document.querySelectorAll("[data-skill-tab]");
    var panels = document.querySelectorAll("[data-skill-panel]");
    if (!tabs.length || !panels.length) return;

    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var key = tab.getAttribute("data-skill-tab");
        tabs.forEach(function (item) {
          var active = item === tab;
          item.classList.toggle("active", active);
          item.setAttribute("aria-selected", active ? "true" : "false");
        });
        panels.forEach(function (panel) {
          var activePanel = panel.getAttribute("data-skill-panel") === key;
          panel.classList.toggle("active", activePanel);
          panel.hidden = !activePanel;
        });
      });
    });
  }

  function setYear() {
    var year = document.querySelector("[data-year]");
    if (year) year.textContent = new Date().getFullYear();
  }

  function boot() {
    setupMenu();
    setupAccordions();
    setupSkillTabs();
    setYear();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
