(function () {
  const REPO_NAME = "al-hayat-aptitude-skills-hub";
  const DATA_VERSION = "aptitude-20260626-01";
  const STORAGE_KEY = "ah_aptitude_practice_progress_v1";

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function basePath() {
    return location.pathname.includes(`/${REPO_NAME}/`) ? `/${REPO_NAME}/` : "/";
  }

  function siteUrl(path = "") {
    if (!path || path === "/") return basePath();
    const value = String(path);
    if (/^(https?:|mailto:|tel:|#|javascript:)/i.test(value)) return value;
    return basePath() + value.replace(/^\/+/, "");
  }

  async function fetchJson(path) {
    const url = siteUrl(path.replace(/^\/+/, ""));
    const finalUrl = `${url}${url.includes("?") ? "&" : "?"}v=${encodeURIComponent(DATA_VERSION)}`;
    const response = await fetch(finalUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not load ${finalUrl}. Status: ${response.status}`);
    try {
      return await response.json();
    } catch (error) {
      throw new Error(`Invalid JSON in ${finalUrl}: ${error.message}`);
    }
  }

  function escapeHtml(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function normalizeOption(option, index) {
    const fallbackId = String.fromCharCode(65 + index);
    if (typeof option === "string") return { id: fallbackId, text: option };
    return {
      id: String(option?.id || option?.label || fallbackId).trim(),
      text: String(option?.text || option?.value || option?.answer || "").trim()
    };
  }

  function normalizeQuestion(question, index) {
    const options = Array.isArray(question?.options)
      ? question.options.map(normalizeOption).filter((option) => option.text)
      : [];
    return {
      ...question,
      id: String(question?.id || `question-${index + 1}`).trim(),
      skillCategory: String(question?.skillCategory || "aptitude").trim(),
      skill: String(question?.skill || question?.skillCategory || "general-aptitude").trim(),
      topic: String(question?.topic || "general-practice").trim(),
      subTopic: String(question?.subTopic || question?.topic || "core").trim(),
      level: String(question?.level || "Core").trim(),
      difficulty: String(question?.difficulty || "Medium").trim(),
      questionType: String(question?.questionType || "MCQ").trim(),
      questionText: String(question?.questionText || question?.question || "").trim(),
      options,
      correctAnswer: String(question?.correctAnswer || question?.answer || "").trim(),
      shortExplanation: String(question?.shortExplanation || question?.explanation || "").trim(),
      fullExplanation: question?.fullExplanation || null,
      commonMistake: String(question?.commonMistake || "").trim(),
      examTags: Array.isArray(question?.examTags) ? question.examTags : [],
      keywords: Array.isArray(question?.keywords) ? question.keywords : [],
      status: String(question?.status || "New").trim()
    };
  }

  function isValidQuestion(question) {
    return Boolean(question.questionText && question.options.length >= 2 && question.correctAnswer);
  }

  async function loadQuestionBank() {
    const main = await fetchJson("data/questions.json");
    const all = Array.isArray(main?.questions) ? [...main.questions] : [];
    if (Array.isArray(main?.imports)) {
      for (const importPath of main.imports) {
        const pack = await fetchJson(importPath);
        if (Array.isArray(pack?.questions)) all.push(...pack.questions);
        else if (Array.isArray(pack)) all.push(...pack);
      }
    }
    const seen = new Set();
    return all.map(normalizeQuestion).filter(isValidQuestion).filter((question) => {
      if (seen.has(question.id)) return false;
      seen.add(question.id);
      return true;
    });
  }

  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}"); }
    catch { return {}; }
  }

  function saveProgress(progress) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }

  function uniqueValues(questions, key) {
    return [...new Set(questions.map((question) => question[key]).filter(Boolean))].sort((a, b) => String(a).localeCompare(String(b)));
  }

  function optionList(values, label) {
    return `<option value="all">All ${escapeHtml(label)}</option>${values.map((value) => `<option value="${escapeHtml(value)}">${escapeHtml(value)}</option>`).join("")}`;
  }

  function matchesFilter(question, filters) {
    const text = JSON.stringify(question).toLowerCase();
    return (filters.skillCategory === "all" || question.skillCategory === filters.skillCategory)
      && (filters.skill === "all" || question.skill === filters.skill)
      && (filters.topic === "all" || question.topic === filters.topic)
      && (filters.difficulty === "all" || question.difficulty === filters.difficulty)
      && (!filters.search || text.includes(filters.search.toLowerCase()));
  }

  function explanationHtml(question) {
    const full = question.fullExplanation;
    const steps = Array.isArray(full?.steps) ? full.steps : [];
    const wrong = full?.whyOtherOptionsAreWrong || {};
    return `<div class="ah-explanation" hidden data-explanation>
      ${question.shortExplanation ? `<p><strong>Quick explanation:</strong> ${escapeHtml(question.shortExplanation)}</p>` : ""}
      ${steps.length ? `<div><strong>Step-by-step strategy</strong>${steps.map((step, index) => `<p><b>${index + 1}. ${escapeHtml(step.title || "Step")}</b><br>${escapeHtml(step.text || "")}</p>`).join("")}</div>` : ""}
      ${full?.correctAnswer ? `<p><strong>Correct-answer logic:</strong> ${escapeHtml(full.correctAnswer)}</p>` : ""}
      ${Object.keys(wrong).length ? `<div><strong>Why other options are wrong</strong>${Object.entries(wrong).map(([key, value]) => `<p><b>${escapeHtml(key)}:</b> ${escapeHtml(value)}</p>`).join("")}</div>` : ""}
      ${question.commonMistake ? `<p class="ah-mistake"><strong>Common mistake:</strong> ${escapeHtml(question.commonMistake)}</p>` : ""}
    </div>`;
  }

  function injectStyles() {
    if (document.getElementById("ah-practice-engine-styles")) return;
    const style = document.createElement("style");
    style.id = "ah-practice-engine-styles";
    style.textContent = `
      .ah-practice-wrap{max-width:1180px;margin:0 auto;padding:32px 18px 96px;color:#102033;font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
      .ah-practice-hero{background:linear-gradient(135deg,#0f3159,#123f72);color:white;border-radius:28px;padding:28px;margin-bottom:18px;box-shadow:0 18px 42px rgba(15,49,89,.18)}
      .ah-practice-hero h1{margin:8px 0 8px;font-size:clamp(34px,5vw,64px);line-height:1}.ah-practice-hero p{max-width:820px;margin:0;color:#dcecff;font-size:18px}.ah-kicker{text-transform:uppercase;letter-spacing:.14em;font-weight:900;font-size:13px;color:#b9d7ff}
      .ah-dashboard{display:grid;grid-template-columns:310px 1fr;gap:18px;align-items:start}.ah-panel,.ah-card{background:white;border:1px solid #dbe6f2;border-radius:24px;box-shadow:0 14px 38px rgba(16,32,51,.08)}
      .ah-panel{padding:18px;position:sticky;top:16px}.ah-card{padding:24px}.ah-field{display:grid;gap:7px;margin-bottom:12px}.ah-field label{font-weight:800;font-size:13px;color:#334761}.ah-field input,.ah-field select{width:100%;box-sizing:border-box;border:1px solid #cbd8e6;border-radius:14px;padding:12px;font:inherit;background:#f8fbff;color:#102033}
      .ah-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:14px 0}.ah-stat{background:#f2f7fd;border:1px solid #dbe6f2;border-radius:18px;padding:14px}.ah-stat span{display:block;color:#64748b;font-size:12px;font-weight:800;text-transform:uppercase}.ah-stat strong{font-size:24px;color:#102033}.ah-meta{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}.ah-pill{display:inline-flex;align-items:center;border-radius:999px;padding:7px 11px;background:#edf4ff;color:#163b66;font-weight:800;font-size:12px}.ah-question{font-size:24px;line-height:1.35;font-weight:850;margin:12px 0 18px;white-space:pre-wrap}.ah-options{display:grid;gap:10px}.ah-option{width:100%;text-align:left;border:2px solid #dbe6f2;background:#fff;border-radius:18px;padding:15px 16px;font:inherit;cursor:pointer;transition:.18s}.ah-option:hover{border-color:#123f72;transform:translateY(-1px)}.ah-option.is-selected{border-color:#123f72;background:#eef6ff}.ah-option.is-correct{border-color:#0f8a5f;background:#eafaf4}.ah-option.is-wrong{border-color:#c43d3d;background:#fff0f0}.ah-option b{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#123f72;color:white;margin-right:10px}.ah-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:18px}.ah-btn{border:0;border-radius:16px;background:#102033;color:white;font-weight:900;padding:13px 18px;cursor:pointer;text-decoration:none;display:inline-flex;align-items:center;justify-content:center}.ah-btn.secondary{background:#eef4fb;color:#102033}.ah-btn.ghost{background:white;color:#102033;border:1px solid #dbe6f2}.ah-explanation{margin-top:18px;background:#f8fbff;border:1px solid #dbe6f2;border-radius:18px;padding:16px}.ah-mistake{border-left:4px solid #f4b400;padding-left:12px}.ah-empty,.ah-error{background:#fff;border:1px solid #dbe6f2;border-radius:24px;padding:28px}.ah-error pre{white-space:pre-wrap;background:#102033;color:white;border-radius:14px;padding:14px;overflow:auto}.ah-small{font-size:13px;color:#64748b}.ah-progressbar{height:12px;background:#e5edf6;border-radius:999px;overflow:hidden}.ah-progressbar span{display:block;height:100%;background:#123f72;width:0}.ah-checkline{font-weight:900;margin-top:12px}.ah-checkline.ok{color:#0f7a55}.ah-checkline.no{color:#b33333}
      @media(max-width:880px){.ah-dashboard{grid-template-columns:1fr}.ah-panel{position:static}.ah-stats{grid-template-columns:repeat(2,1fr)}.ah-question{font-size:20px}.ah-practice-wrap{padding-left:12px;padding-right:12px}}
    `;
    document.head.appendChild(style);
  }

  function renderShell(root) {
    root.innerHTML = `<section class="ah-practice-wrap">
      <div class="ah-practice-hero">
        <div class="ah-kicker">Exam-focused aptitude practice</div>
        <h1>Practice</h1>
        <p>One clear question at a time, instant checking, explanations, traps, and progress tracking for entry tests, scholarships, jobs, and competitive exams.</p>
      </div>
      <div class="ah-stats" data-practice-stats></div>
      <div class="ah-dashboard">
        <aside class="ah-panel">
          <div class="ah-field"><label for="ahSearch">Search</label><input id="ahSearch" type="search" placeholder="synonym, assumption, analogy..."></div>
          <div class="ah-field"><label for="ahCategory">Category</label><select id="ahCategory"></select></div>
          <div class="ah-field"><label for="ahSkill">Skill</label><select id="ahSkill"></select></div>
          <div class="ah-field"><label for="ahTopic">Topic</label><select id="ahTopic"></select></div>
          <div class="ah-field"><label for="ahDifficulty">Difficulty</label><select id="ahDifficulty"></select></div>
          <div class="ah-actions"><button class="ah-btn secondary" type="button" data-reset>Reset</button><button class="ah-btn ghost" type="button" data-bookmarked>Bookmarked/Wrong</button></div>
          <p class="ah-small">Tip: first solve, then open explanation. This builds exam speed and accuracy.</p>
        </aside>
        <section class="ah-card" data-question-card></section>
      </div>
    </section>`;
  }

  function renderStats(root, questions, filtered, progress) {
    const attempted = Object.values(progress).filter((item) => item.status === "correct" || item.status === "wrong").length;
    const correct = Object.values(progress).filter((item) => item.status === "correct").length;
    const wrong = Object.values(progress).filter((item) => item.status === "wrong").length;
    const pct = questions.length ? Math.round((attempted / questions.length) * 100) : 0;
    const box = $('[data-practice-stats]', root);
    if (!box) return;
    box.innerHTML = `
      <article class="ah-stat"><span>Total</span><strong>${questions.length}</strong></article>
      <article class="ah-stat"><span>Matching</span><strong>${filtered.length}</strong></article>
      <article class="ah-stat"><span>Correct</span><strong>${correct}</strong></article>
      <article class="ah-stat"><span>Wrong</span><strong>${wrong}</strong></article>
      <div class="ah-progressbar" style="grid-column:1/-1"><span style="width:${pct}%"></span></div>
    `;
  }

  function renderQuestion(card, question, index, total, progress) {
    if (!question) {
      card.innerHTML = `<div class="ah-empty"><h2>No matching question found</h2><p>Reset filters or try a broader search term.</p></div>`;
      return;
    }
    const saved = progress[question.id] || {};
    const selected = saved.selected || "";
    const checked = saved.status === "correct" || saved.status === "wrong";
    card.innerHTML = `
      <div class="ah-meta">
        <span class="ah-pill">${escapeHtml(question.skillCategory)}</span>
        <span class="ah-pill">${escapeHtml(question.skill)}</span>
        <span class="ah-pill">${escapeHtml(question.difficulty)}</span>
        <span class="ah-pill">Question ${index + 1} of ${total}</span>
      </div>
      <h2 class="ah-question">${escapeHtml(question.questionText)}</h2>
      <div class="ah-options">
        ${question.options.map((option) => {
          const isCorrect = option.id === question.correctAnswer;
          const isSelected = selected === option.id;
          const cls = checked && isCorrect ? " is-correct" : checked && isSelected && !isCorrect ? " is-wrong" : isSelected ? " is-selected" : "";
          return `<button class="ah-option${cls}" type="button" data-option="${escapeHtml(option.id)}"><b>${escapeHtml(option.id)}</b>${escapeHtml(option.text)}</button>`;
        }).join("")}
      </div>
      <div data-checkline class="ah-checkline ${checked ? (saved.status === "correct" ? "ok" : "no") : ""}">${checked ? (saved.status === "correct" ? "Correct." : `Review. Correct answer: ${escapeHtml(question.correctAnswer)}`) : "Choose an option, then check your answer."}</div>
      ${explanationHtml(question)}
      <div class="ah-actions">
        <button class="ah-btn" type="button" data-check>Check Answer</button>
        <button class="ah-btn secondary" type="button" data-toggle-explanation>Explanation</button>
        <button class="ah-btn ghost" type="button" data-prev>Previous</button>
        <button class="ah-btn ghost" type="button" data-next>Next</button>
        <button class="ah-btn secondary" type="button" data-bookmark>${saved.bookmarked ? "Bookmarked" : "Bookmark"}</button>
      </div>
    `;
  }

  function initInteractions(root, questions) {
    let filtered = [...questions];
    let index = 0;
    let progress = loadProgress();
    let bookmarkedMode = false;

    const controls = {
      search: $('#ahSearch', root),
      category: $('#ahCategory', root),
      skill: $('#ahSkill', root),
      topic: $('#ahTopic', root),
      difficulty: $('#ahDifficulty', root),
      card: $('[data-question-card]', root)
    };

    controls.category.innerHTML = optionList(uniqueValues(questions, "skillCategory"), "categories");
    controls.skill.innerHTML = optionList(uniqueValues(questions, "skill"), "skills");
    controls.topic.innerHTML = optionList(uniqueValues(questions, "topic"), "topics");
    controls.difficulty.innerHTML = optionList(uniqueValues(questions, "difficulty"), "difficulty");

    const params = new URLSearchParams(location.search);
    const wantedQuestion = params.get("question");
    if (wantedQuestion) {
      const found = questions.findIndex((question) => question.id === wantedQuestion);
      if (found >= 0) index = found;
    }

    function getFilters() {
      return {
        search: controls.search.value.trim(),
        skillCategory: controls.category.value,
        skill: controls.skill.value,
        topic: controls.topic.value,
        difficulty: controls.difficulty.value
      };
    }

    function applyFilters(resetIndex = true) {
      const filters = getFilters();
      filtered = questions.filter((question) => matchesFilter(question, filters));
      if (bookmarkedMode) {
        filtered = filtered.filter((question) => progress[question.id]?.bookmarked || progress[question.id]?.status === "wrong");
      }
      if (resetIndex) index = 0;
      if (index >= filtered.length) index = Math.max(0, filtered.length - 1);
      render();
    }

    function render() {
      renderStats(root, questions, filtered, progress);
      renderQuestion(controls.card, filtered[index], index, filtered.length, progress);
    }

    ['input', 'change'].forEach((eventName) => {
      controls.search.addEventListener(eventName, () => applyFilters(true));
      controls.category.addEventListener(eventName, () => applyFilters(true));
      controls.skill.addEventListener(eventName, () => applyFilters(true));
      controls.topic.addEventListener(eventName, () => applyFilters(true));
      controls.difficulty.addEventListener(eventName, () => applyFilters(true));
    });

    root.addEventListener('click', (event) => {
      const optionButton = event.target.closest('[data-option]');
      const current = filtered[index];
      if (optionButton && current) {
        progress[current.id] = { ...(progress[current.id] || {}), selected: optionButton.dataset.option };
        saveProgress(progress);
        render();
        return;
      }

      if (event.target.closest('[data-check]') && current) {
        const selected = progress[current.id]?.selected;
        if (!selected) return;
        progress[current.id] = {
          ...(progress[current.id] || {}),
          status: selected === current.correctAnswer ? 'correct' : 'wrong',
          answeredAt: new Date().toISOString()
        };
        saveProgress(progress);
        render();
        const explanation = $('[data-explanation]', controls.card);
        if (explanation) explanation.hidden = false;
        return;
      }

      if (event.target.closest('[data-toggle-explanation]')) {
        const explanation = $('[data-explanation]', controls.card);
        if (explanation) explanation.hidden = !explanation.hidden;
        return;
      }

      if (event.target.closest('[data-next]')) {
        index = filtered.length ? (index + 1) % filtered.length : 0;
        render();
        return;
      }

      if (event.target.closest('[data-prev]')) {
        index = filtered.length ? (index - 1 + filtered.length) % filtered.length : 0;
        render();
        return;
      }

      if (event.target.closest('[data-bookmark]') && current) {
        progress[current.id] = { ...(progress[current.id] || {}), bookmarked: !progress[current.id]?.bookmarked };
        saveProgress(progress);
        render();
        return;
      }

      if (event.target.closest('[data-reset]')) {
        bookmarkedMode = false;
        controls.search.value = '';
        controls.category.value = 'all';
        controls.skill.value = 'all';
        controls.topic.value = 'all';
        controls.difficulty.value = 'all';
        applyFilters(true);
        return;
      }

      if (event.target.closest('[data-bookmarked]')) {
        bookmarkedMode = !bookmarkedMode;
        event.target.closest('[data-bookmarked]').textContent = bookmarkedMode ? 'All Questions' : 'Bookmarked/Wrong';
        applyFilters(true);
      }
    });

    applyFilters(false);
  }

  function findRoot() {
    return document.querySelector('[data-practice-app], #practiceApp, #practiceQuizBox, main') || document.body;
  }

  async function init() {
    const isPracticePage = /\/practice\/?(?:index\.html)?$/i.test(location.pathname) || document.querySelector('[data-practice-app], #practiceApp, #practiceQuizBox');
    if (!isPracticePage) return;
    injectStyles();
    const root = findRoot();
    root.innerHTML = `<section class="ah-practice-wrap"><div class="ah-empty"><h2>Loading practice...</h2><p>Please wait while the aptitude question bank opens.</p></div></section>`;
    try {
      const questions = await loadQuestionBank();
      renderShell(root);
      initInteractions(root, questions);
    } catch (error) {
      console.error(error);
      root.innerHTML = `<section class="ah-practice-wrap"><div class="ah-error"><h1>Practice could not load</h1><p>The question bank path or JSON structure needs checking.</p><pre>${escapeHtml(error.message)}</pre></div></section>`;
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
