(function () {
  "use strict";

  function isHomePage() {
    var path = window.location.pathname.replace(/\/index\.html$/i, "");
    path = path.replace(/\/$/, "");
    return path === "" || path === "/" || path === "/al-hayat-aptitude-skills-hub";
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, function (char) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char];
    });
  }

  function cardMarkup(items) {
    return items.map(function (item) {
      return '<article class="step2-card">' +
        '<span class="step2-icon" aria-hidden="true">' + item.icon + '</span>' +
        '<h3>' + escapeHtml(item.title) + '</h3>' +
        '<p>' + escapeHtml(item.text) + '</p>' +
        '<a href="' + escapeHtml(item.href) + '">' + escapeHtml(item.cta || "Start Practice") + '</a>' +
      '</article>';
    }).join("");
  }

  function instructorMarkup(src, alt, name, role, text, fallback) {
    return '<article class="step2-instructor-card">' +
      '<div class="step2-instructor-photo-wrap">' +
        '<img src="' + src + '" alt="' + escapeHtml(alt) + '" loading="lazy" width="700" height="700" onerror="this.style.display=\'none\'; this.nextElementSibling.hidden=false;" />' +
        '<div class="step2-image-fallback" hidden>' + escapeHtml(fallback) + '</div>' +
      '</div>' +
      '<div>' +
        '<h3>' + escapeHtml(name) + '</h3>' +
        '<p>' + escapeHtml(role) + '</p>' +
        '<span>' + escapeHtml(text) + '</span>' +
      '</div>' +
    '</article>';
  }

  function renderHomepage() {
    if (!isHomePage()) return;
    var app = document.querySelector("#app");
    if (!app) return;
    if (app.querySelector(".step2-homepage")) return;

    var examCards = [
      { icon: "🎓", title: "FAST Entry Test", text: "Focused verbal, analytical, quantitative, and reasoning practice for competitive university admission.", href: "practice/?exam=FAST", cta: "Practice FAST" },
      { icon: "📝", title: "NTS NAT", text: "Topic-wise aptitude preparation for admission-style assessment patterns and speed-based practice.", href: "practice/?exam=NTS-NAT", cta: "Start NAT" },
      { icon: "📘", title: "GAT General", text: "Graduate-level verbal, quantitative, and analytical reasoning with clear explanations and review.", href: "practice/?exam=GAT", cta: "Prepare GAT" },
      { icon: "🏆", title: "HEC HAT", text: "Scholarship-oriented reasoning practice with structured skill repair and mock-test readiness.", href: "practice/?exam=HAT", cta: "Prepare HAT" },
      { icon: "🌍", title: "SAT / GRE Style", text: "Advanced vocabulary, grammar, reading, logic, and quantitative reasoning for higher-level preparation.", href: "practice/?exam=GRE", cta: "Advanced Practice" },
      { icon: "💼", title: "Jobs & Scholarships", text: "Aptitude preparation for hiring tests, screening exams, scholarships, and professional assessments.", href: "mock-tests/", cta: "Take Mock Test" }
    ];

    var skillCards = [
      { icon: "🧠", title: "Logical Reasoning", text: "Assumptions, conclusions, inferences, syllogisms, and argument evaluation.", href: "skills/logical-reasoning/", cta: "Open Skill" },
      { icon: "➗", title: "Quantitative Reasoning", text: "Arithmetic, ratios, percentages, algebra, series, speed, work, and probability.", href: "skills/quantitative-reasoning/", cta: "Open Skill" },
      { icon: "🔤", title: "Verbal Reasoning", text: "Synonyms, antonyms, analogies, sentence completion, reading, and critical reasoning.", href: "skills/verbal-reasoning/", cta: "Open Skill" },
      { icon: "🧩", title: "Analytical Reasoning", text: "Arrangements, puzzles, blood relations, coding-decoding, and direction sense.", href: "skills/analytical-reasoning/", cta: "Open Skill" },
      { icon: "📊", title: "Data Interpretation", text: "Tables, charts, graphs, caselets, percentage comparison, and data-based reasoning.", href: "skills/data-interpretation/", cta: "Open Skill" },
      { icon: "⭐", title: "Daily Challenge", text: "Short mixed practice to build speed, accuracy, memory, and exam confidence.", href: "practice/", cta: "Start Today" }
    ];

    app.innerHTML = '<div class="step2-homepage">' +
      '<section class="step2-hero">' +
        '<div class="container step2-hero-grid">' +
          '<div>' +
            '<p class="step2-kicker">Professional aptitude preparation</p>' +
            '<h1>Master Aptitude Tests with Confidence</h1>' +
            '<p class="step2-lead">Prepare for entry tests, scholarships, jobs, and competitive exams through structured lessons, topic-wise practice, full explanations, mock tests, and smart progress tracking.</p>' +
            '<div class="step2-actions">' +
              '<a class="step2-btn step2-btn-primary" href="practice/">Start Practice</a>' +
              '<a class="step2-btn step2-btn-secondary" href="mock-tests/">Take a Mock Test</a>' +
            '</div>' +
            '<p class="step2-note">Original practice-style questions for learning. Not copied from official exams.</p>' +
          '</div>' +
          '<aside class="step2-hero-panel" aria-label="Aptitude learning path">' +
            '<div class="step2-panel-top"><span>Today’s Path</span><strong>Diagnosis → Practice → Review</strong></div>' +
            '<div class="step2-mini-steps">' +
              '<div><b>1</b><span>Choose exam path</span></div>' +
              '<div><b>2</b><span>Study one skill</span></div>' +
              '<div><b>3</b><span>Practice MCQs</span></div>' +
              '<div><b>4</b><span>Repair mistakes</span></div>' +
            '</div>' +
          '</aside>' +
        '</div>' +
      '</section>' +
      '<section class="step2-stats-strip" aria-label="Platform highlights">' +
        '<div class="container step2-stats-grid">' +
          '<div><strong>3000+</strong><span>Question bank target</span></div>' +
          '<div><strong>6</strong><span>Exam pathways</span></div>' +
          '<div><strong>8</strong><span>Core skill areas</span></div>' +
          '<div><strong>100%</strong><span>Explanation-focused practice</span></div>' +
        '</div>' +
      '</section>' +
      '<section class="step2-section">' +
        '<div class="container">' +
          '<div class="step2-section-head"><p class="step2-kicker">Choose your target</p><h2>Exam Pathways</h2><p>Select a pathway, then practice the exact skill areas normally tested in that exam style.</p></div>' +
          '<div class="step2-grid step2-grid-3">' + cardMarkup(examCards) + '</div>' +
        '</div>' +
      '</section>' +
      '<section class="step2-section step2-soft-bg">' +
        '<div class="container">' +
          '<div class="step2-section-head"><p class="step2-kicker">Build the skill, not just the answer</p><h2>Core Aptitude Skills</h2><p>Every learner should know what to study, how to practice, and how to correct mistakes after each attempt.</p></div>' +
          '<div class="step2-grid step2-grid-3">' + cardMarkup(skillCards) + '</div>' +
        '</div>' +
      '</section>' +
      '<section class="step2-section">' +
        '<div class="container step2-system-grid">' +
          '<div><p class="step2-kicker">A complete learning cycle</p><h2>From Weakness to Exam Confidence</h2><p class="step2-body">The platform is designed to guide learners through a clean and serious process: diagnostic test, targeted lesson, practice questions, explanation review, weak-area repair, and mock-test performance.</p></div>' +
          '<div class="step2-checklist">' +
            '<div><span>✓</span>Topic-wise practice instead of random question overload</div>' +
            '<div><span>✓</span>Full explanations with common mistakes and reasoning traps</div>' +
            '<div><span>✓</span>Mobile-friendly design for daily practice anywhere</div>' +
            '<div><span>✓</span>Desktop-friendly layout for serious study sessions</div>' +
          '</div>' +
        '</div>' +
      '</section>' +
      '<section class="step2-section step2-instructors-section">' +
        '<div class="container">' +
          '<div class="step2-section-head"><p class="step2-kicker">Guided by experienced teachers</p><h2>Our Instructors</h2><p>Professional guidance for aptitude, reasoning, verbal skills, entry-test preparation, and exam confidence.</p></div>' +
          '<div class="step2-instructors">' +
            instructorMarkup("assets/images/instructors/dr-imran-hayat.jpg", "Portrait of Dr. Imran Hayat", "Dr. Imran Hayat", "Lead Instructor", "Aptitude, English, reasoning, academic writing, and structured exam preparation.", "IH") +
            instructorMarkup("assets/images/instructors/sir-asif-ali.jpg", "Portrait of Sir Asif Ali", "Sir Asif Ali", "Senior Instructor", "Verbal practice, grammar, vocabulary, reasoning support, and learner-focused preparation.", "AA") +
          '</div>' +
        '</div>' +
      '</section>' +
      '<section class="step2-section step2-final-cta">' +
        '<div class="container">' +
          '<div class="step2-final-box">' +
            '<div><p class="step2-kicker">Start with one clear action</p><h2>Begin your aptitude preparation today.</h2><p>Practice one skill, review every mistake, and move gradually toward full mock-test readiness.</p></div>' +
            '<a class="step2-btn step2-btn-primary" href="practice/">Start Practice</a>' +
          '</div>' +
        '</div>' +
      '</section>' +
    '</div>';
  }

  function setupHeader() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-site-nav]");
    if (toggle && nav && !toggle.dataset.ready) {
      toggle.dataset.ready = "true";
      toggle.addEventListener("click", function () {
        var open = toggle.getAttribute("aria-expanded") === "true";
        toggle.setAttribute("aria-expanded", String(!open));
        nav.classList.toggle("is-open", !open);
      });
    }

    var search = document.querySelector("[data-header-search]");
    if (search && !search.dataset.ready) {
      search.dataset.ready = "true";
      search.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = search.querySelector("input[name='q']");
        var query = input ? input.value.trim() : "";
        window.location.href = query ? "search/?q=" + encodeURIComponent(query) : "search/";
      });
    }

    var year = document.querySelector("[data-year]");
    if (year) year.textContent = new Date().getFullYear();
  }

  function boot() {
    setupHeader();
    renderHomepage();
    [150, 600, 1200, 2200].forEach(function (delay) { setTimeout(renderHomepage, delay); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
  window.addEventListener("load", boot);
})();
