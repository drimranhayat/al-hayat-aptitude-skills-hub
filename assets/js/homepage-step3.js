(function () {
  "use strict";

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var isOpen = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!isOpen));
      nav.classList.toggle("is-open", !isOpen);
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

    group.querySelectorAll(".exam-accordion button").forEach(function (button) {
      button.addEventListener("click", function () {
        var card = button.closest(".exam-accordion");
        var detail = card.querySelector(".accordion-detail");
        var isOpen = card.classList.contains("is-open");

        group.querySelectorAll(".exam-accordion").forEach(function (item) {
          item.classList.remove("is-open");
          var itemButton = item.querySelector("button");
          var itemDetail = item.querySelector(".accordion-detail");
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
          item.classList.toggle("active", item === tab);
          item.setAttribute("aria-selected", item === tab ? "true" : "false");
        });
        panels.forEach(function (panel) {
          var active = panel.getAttribute("data-skill-panel") === key;
          panel.classList.toggle("active", active);
          panel.hidden = !active;
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
