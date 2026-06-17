import {
  buildSearchRecords,
  getCategory,
  getQuestions,
  getSubTopic,
  getTopic,
  loadSiteData,
  searchRecords,
  slugFromPathname
} from "./data-loader.js?v=verbal-20260617";

import {
  actionLink,
  bankQuestionCard,
  escapeHtml,
  pill,
  progressBar,
  quietTools,
  searchResultCard,
  skillCard,
  statCard,
  subTopicCard,
  topicCard,
  topicNavigation
} from "./components.js?v=verbal-20260617";

import { fixInternalLinks, navigateTo } from "./path-utils.js?v=verbal-20260617";

const state = {
  data: null,
  searchRecords: [],
  practice: {
    queueKey: "",
    queueIds: [],
    currentIndex: 0,
    selectedAnswer: "",
    answered: false,
    showExplanation: false
  }
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  setupHeader();
  try {
    state.data = await loadSiteData();
    state.searchRecords = buildSearchRecords(state.data);
    renderRoute();
  } catch (error) {
    console.error(error);
    document.querySelector("#app").innerHTML = `
      <section class="notice-card">
        <h1>Site data could not be loaded</h1>
        <p>Please run this website through a local web server so the JSON files can load correctly.</p>
      </section>
    `;
  }
}

function setupHeader() {
  const menuButton = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-site-nav]");
  const searchForm = document.querySelector("[data-header-search]");

  menuButton?.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    document.body.classList.toggle("menu-open", isOpen);
    menuButton.setAttribute("aria-expanded", String(isOpen));
  });

  searchForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = new FormData(searchForm).get("q")?.toString().trim() || "";
    navigateTo(`search/${value ? `?q=${encodeURIComponent(value)}` : ""}`);
  });

  document.addEventListener("submit", handleSubmit);
  document.addEventListener("click", handleClick);
  document.addEventListener("change", handleChange);
}

function renderRoute() {
  const parts = slugFromPathname();
  const app = document.querySelector("#app");
  setActiveNav(parts);
  setTimeout(() => fixInternalLinks(document), 0);

  if (!parts.length) return renderHome(app);
  if (parts[0] === "skills" && parts.length === 1) return renderSkills(app);
  if (parts[0] === "skills" && parts.length === 2) return renderSkillDetail(app, parts[1]);
  if (parts[0] === "skills" && parts.length === 3) return renderTopicDetail(app, parts[1], parts[2]);
  if (parts[0] === "skills" && parts.length === 4) return renderStudyPage(app, parts[1], parts[2], parts[3]);
  if (parts[0] === "practice" && parts.length === 1) return renderPracticeBank(app);
  if (parts[0] === "practice" && parts.length >= 3) return renderPracticeTopic(app, parts[1], parts[2]);
  if (parts[0] === "progress") return renderProgress(app);
  if (parts[0] === "mock-tests") return renderMockTests(app);
  if (parts[0] === "resources") return renderResources(app);
  if (parts[0] === "search") return renderSearch(app);

  app.innerHTML = `
    <section class="notice-card">
      <h1>Page not found</h1>
      <p>This route is ready for future expansion. Start from Skills or Search to continue.</p>
      <div class="card-actions">${actionLink("Explore Skills", "skills/")}${actionLink("Search", "search/", "secondary")}</div>
    </section>
  `;
}

function setActiveNav(parts) {
  const active = parts[0] || "";
  document.querySelectorAll(".site-nav a").forEach((link) => {
    const href = link.getAttribute("href") || "";
    const targetUrl = new URL(href, document.baseURI);
    const target = slugFromPathname(targetUrl.pathname)[0] || "";
    link.classList.toggle("is-active", active === target || (!active && !target));
  });
}

function renderHome(app) {
  const data = state.data;
  const logical = getCategory(data, "logical-reasoning");
  const assumptionTopic = getTopic(data, "assumption-reasoning");
  const necessary = getSubTopic(assumptionTopic, "necessary-assumption");
  const progress = data.progress.overall;

  app.innerHTML = `
    <section class="hero">
      <p class="eyebrow">Guided aptitude learning</p>
      <h1>Master Aptitude Tests Through Core Skills</h1>
      <p>Learn verbal, logical, quantitative, data, and cognitive skills through clear lessons, topic-wise practice, explanations, and progress tracking.</p>
      <form class="search-hero" role="search" data-page-search>
        <label class="sr-only" for="home-search">Search skills, topics, questions</label>
        <input id="home-search" name="q" type="search" placeholder="Search skills, topics, questions...">
        <button type="submit">Search</button>
      </form>
      <div class="hero-actions">
        ${actionLink("Start Free Diagnostic", "mock-tests/#diagnostic")}
        ${actionLink("Explore Skills", "skills/", "secondary")}
      </div>
    </section>

    <section class="dashboard-strip" aria-label="Continue learning and recommendation">
      <article class="continue-card">
        <p class="eyebrow">Continue learning</p>
        <h2>${escapeHtml(necessary.name)}</h2>
        <p class="muted">${escapeHtml(necessary.description)}</p>
        ${progressBar(necessary.progress)}
        <div class="card-actions">
          ${actionLink("Study Topic", necessary.url)}
          ${actionLink("Practice Questions", `${assumptionTopic.practiceUrl}?subTopic=${necessary.id}`, "secondary")}
        </div>
      </article>
      <article class="recommend-card">
        <p class="eyebrow">Recommended skill</p>
        <h2>${escapeHtml(logical.name)}</h2>
        <p class="muted">${escapeHtml(logical.description)}</p>
        <div class="path-map" aria-label="Learning path model">
          <div class="path-step"><span>1</span><div><strong>Study</strong><small>Read the focused lesson.</small></div></div>
          <div class="path-step"><span>2</span><div><strong>Practice</strong><small>Answer topic-linked MCQs.</small></div></div>
          <div class="path-step"><span>3</span><div><strong>Review</strong><small>Open explanations only when needed.</small></div></div>
        </div>
      </article>
    </section>

    <section class="section">
      <div class="section-header">
        <div>
          <h2>Skill Categories</h2>
          <p>Choose a skill area, study the next topic, then practice questions connected to that exact topic.</p>
        </div>
        ${actionLink("All Skills", "skills/", "secondary")}
      </div>
      <div class="grid three">${data.categories.map(skillCard).join("")}</div>
    </section>

    <section class="section">
      <div class="grid three">
        ${statCard("Overall Progress", `${progress.progress}%`, "Mock learner progress")}
        ${statCard("Current Level", progress.currentLevel, "Five-level learner ladder")}
        ${statCard("Accuracy", `${progress.accuracy}%`, "Based on sample attempts")}
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <div>
          <h2>Popular Exams Served</h2>
          <p>Questions are practice-style and tagged for relevance only, not copied from official exams.</p>
        </div>
      </div>
      <div class="meta-row">
        ${["Admissions aptitude", "Scholarship tests", "Corporate hiring", "Military selection", "IQ-style practice", "Professional assessments"].map((tag) => pill(tag)).join("")}
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <div>
          <h2>How It Works</h2>
          <p>The learner always sees where they are, what they are learning, and the next step.</p>
        </div>
      </div>
      <div class="grid four">
        ${["Choose a skill", "Study one topic", "Practice linked MCQs", "Review mistakes"].map((title, index) => `
          <article class="resource-card">
            <span class="pill gold">Step ${index + 1}</span>
            <h3>${title}</h3>
            <p>${["Start from the clean skill menu.", "Use simple explanation and strategy.", "Answer questions tied to the topic.", "Open explanations and repair weak areas."][index]}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderSkills(app) {
  const data = state.data;
  app.innerHTML = `
    <section class="page-hero">
      <p class="eyebrow">Skills</p>
      <h1>Choose a Core Aptitude Skill</h1>
      <p>Each card is connected to topics, practice questions, progress, and future lesson data.</p>
    </section>
    <section class="section">
      <div class="grid three">${data.categories.map(skillCard).join("")}</div>
    </section>
  `;
}

function renderSkillDetail(app, categorySlug) {
  const data = state.data;
  const category = getCategory(data, categorySlug);
  if (!category) return renderMissing(app, "Skill category");
  const topics = data.topics.filter((topic) => topic.skillCategory === category.id);
  const skill = data.skills.find((item) => item.categoryId === category.id);

  app.innerHTML = `
    <section class="page-hero">
      <p class="eyebrow">Skill Detail</p>
      <h1>${escapeHtml(category.name)}</h1>
      <p>${escapeHtml(category.description)}</p>
    </section>
    <section class="learning-layout">
      ${topicNavigation(topics, "")}
      <div>
        <article class="content-card">
          <div class="section-header">
            <div>
              <h2>${escapeHtml(skill?.name || category.name)} Overview</h2>
              <p>${escapeHtml(skill?.description || category.description)}</p>
            </div>
          </div>
          ${progressBar(category.progress)}
          <div class="meta-row">
            ${pill(`Current level: ${category.level}`, "gold")}
            ${pill(`${category.topicCount} topics`, "green")}
            ${pill(`${category.questionCount} sample questions`)}
          </div>
        </article>
        <section class="section">
          <div class="section-header">
            <div>
              <h2>Topic Cards</h2>
              <p>Start with the recommended topic or choose any topic from the list.</p>
            </div>
          </div>
          <div class="grid two">${topics.map((topic) => topicCard(topic)).join("")}</div>
        </section>
      </div>
      ${quietTools([
        { label: "Recommended next topic", value: category.recommendedNextTopic || "Assumption Reasoning" },
        { label: "Accuracy", value: "71%" },
        { label: "Next step", value: "Practice 5 medium questions" }
      ])}
    </section>
  `;
}

function renderTopicDetail(app, categorySlug, topicSlug) {
  const data = state.data;
  const category = getCategory(data, categorySlug);
  const topic = getTopic(data, topicSlug);
  if (!category || !topic) return renderMissing(app, "Topic");
  const topics = data.topics.filter((item) => item.skillCategory === category.id);
  const study = topic.study || topic.subTopics?.[0]?.study;

  if (study) {
    app.innerHTML = `
      <section class="learning-layout">
        ${topicNavigation(topics, topic.id, topic.subTopics?.[0]?.id || "")}
        <article class="study-card">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="skills/">Skills</a><span>/</span><a href="${category.url}">${escapeHtml(category.name)}</a><span>/</span><span>${escapeHtml(topic.name)}</span>
          </nav>
          <h1>${escapeHtml(topic.name)}</h1>
          <p class="muted">${escapeHtml(topic.description)}</p>
          ${studySectionsHtml(study)}
          <div class="bottom-next">
            ${actionLink("Practice This Topic", topic.practiceUrl)}
            ${actionLink("Related Topics", category.url, "secondary")}
            ${topic.nextTopicUrl ? actionLink("Next Topic", topic.nextTopicUrl, "secondary") : ""}
          </div>
        </article>
        ${quietTools([
          { label: "Topic progress", value: `${topic.progress}%` },
          { label: "Question count", value: `${topic.questionCount}` },
          { label: "Next step", value: topic.recommendedSubTopic || "Practice this topic" }
        ])}
      </section>
    `;
    return;
  }

  app.innerHTML = `
    <section class="learning-layout">
      ${topicNavigation(topics, topic.id)}
      <div>
        <article class="study-card">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="skills/">Skills</a><span>/</span><a href="${category.url}">${escapeHtml(category.name)}</a><span>/</span><span>${escapeHtml(topic.name)}</span>
          </nav>
          <h1>${escapeHtml(topic.name)}</h1>
          <p class="muted">${escapeHtml(topic.description)}</p>
          ${progressBar(topic.progress)}
          <div class="bottom-next">
            ${actionLink("Practice Question Bank", topic.practiceUrl)}
            ${actionLink("Mini Test", "mock-tests/#assumption-mini-test", "secondary")}
          </div>
        </article>
        <section class="section">
          <div class="section-header">
            <div>
              <h2>Sub-topics</h2>
              <p>Lessons and questions stay connected by skill, topic, and sub-topic tags.</p>
            </div>
          </div>
          <div class="grid two">${(topic.subTopics || []).map((subTopic) => subTopicCard(topic, subTopic)).join("")}</div>
        </section>
      </div>
      ${quietTools([
        { label: "Topic progress", value: `${topic.progress}%` },
        { label: "Question count", value: `${topic.questionCount}` },
        { label: "Next step", value: topic.recommendedSubTopic || "Necessary Assumption" }
      ])}
    </section>
  `;
}

function renderStudyPage(app, categorySlug, topicSlug, subTopicSlug) {
  const data = state.data;
  const category = getCategory(data, categorySlug);
  const topic = getTopic(data, topicSlug);
  const subTopic = getSubTopic(topic, subTopicSlug);
  if (!category || !topic || !subTopic) return renderMissing(app, "Study topic");
  const topics = data.topics.filter((item) => item.skillCategory === category.id);
  const study = subTopic.study || {};

  app.innerHTML = `
    <section class="learning-layout">
      ${topicNavigation(topics, topic.id, subTopic.id)}
      <article class="study-card">
        <nav class="breadcrumb" aria-label="Breadcrumb">
          <a href="skills/">Skills</a><span>/</span><a href="${category.url}">${escapeHtml(category.name)}</a><span>/</span><a href="${topic.url}">${escapeHtml(topic.name)}</a><span>/</span><span>${escapeHtml(subTopic.name)}</span>
        </nav>
        <h1>${escapeHtml(subTopic.name)}</h1>
        <p class="muted">${escapeHtml(subTopic.description)}</p>

        ${studySectionsHtml(study)}
        <div class="bottom-next">
          ${actionLink("Practice This Topic", `${topic.practiceUrl}?subTopic=${subTopic.id}`)}
          ${actionLink("Mini Test", "mock-tests/#assumption-mini-test", "secondary")}
          ${actionLink("Next Topic", study.nextUrl || topic.url, "secondary")}
        </div>
      </article>
      ${quietTools([
        { label: "Progress", value: `${subTopic.progress}%` },
        { label: "Timer", value: "Off" },
        { label: "Accuracy", value: "71%" },
        { label: "Next Step", value: "Practice this topic" }
      ])}
    </section>
  `;
}

function studySectionsHtml(study) {
  const visualNodes = study.visual?.nodes || [
    { label: "Evidence", text: study.visual?.evidence || "Given facts" },
    { label: "Hidden Assumption", text: study.visual?.assumption || "Must be true" },
    { label: "Conclusion", text: study.visual?.conclusion || "Claim that depends on it" }
  ];

  return `
    <section class="study-section">
      <h2>Simple Meaning</h2>
      <p>${escapeHtml(study.simpleMeaning)}</p>
    </section>
    <section class="study-section">
      <h2>Why It Matters</h2>
      <p>${escapeHtml(study.whyItMatters)}</p>
    </section>
    <section class="study-section">
      <h2>Step-by-Step Strategy</h2>
      <ol class="strategy-list">${(study.strategy || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>
    </section>
    <section class="study-section">
      <h2>Solved Example</h2>
      <p><strong>Prompt:</strong> ${escapeHtml(study.solvedExample?.argument || study.solvedExample?.prompt || "")}</p>
      <p><strong>Answer:</strong> ${escapeHtml(study.solvedExample?.answer || "")}</p>
      <p>${escapeHtml(study.solvedExample?.explanation || "")}</p>
    </section>
    <section class="study-section">
      <h2>Common Traps</h2>
      <ul class="strategy-list">${(study.commonTraps || []).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
    </section>
    <section class="study-section">
      <h2>Tips and Tricks</h2>
      <div class="note-box">${escapeHtml(study.tip || "")}</div>
    </section>
    <section class="study-section">
      <h2>Visual Summary</h2>
      <div class="logic-flow" role="img" aria-label="${escapeHtml(study.visual?.ariaLabel || "Learning flow summary")}">
        ${visualNodes.map((node) => `
          <div class="logic-node"><strong>${escapeHtml(node.label)}</strong><span>${escapeHtml(node.text)}</span></div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderPracticeBank(app) {
  const data = state.data;
  const params = new URLSearchParams(window.location.search);
  const filters = {
    skillCategory: params.get("skillCategory") || "all",
    skill: params.get("skill") || "all",
    level: params.get("level") || "all",
    difficulty: params.get("difficulty") || "all",
    exam: params.get("exam") || "all",
    questionType: params.get("questionType") || "all",
    status: params.get("status") || "all"
  };
  const topicFilter = params.get("topic") || "all";
  let questions = getQuestions(data, filters);
  if (topicFilter !== "all") questions = questions.filter((question) => question.topic === topicFilter);

  app.innerHTML = `
    <section class="page-hero">
      <p class="eyebrow">Practice Question Bank</p>
      <h1>Practice by Topic, Not by Noise</h1>
      <p>Filters are optional. If you arrive from a study topic, the practice flow automatically focuses on that topic.</p>
    </section>
    ${filterPanel(filters, topicFilter)}
    <section class="section">
      <div class="section-header">
        <div>
          <h2>${questions.length} Questions Found</h2>
          <p>Each question is linked to a skill, topic, sub-topic, explanation, mistake label, and learn-more page.</p>
        </div>
      </div>
      <div class="bank-list">
        ${questions.map((question) => bankQuestionCard(question, getTopic(data, question.topic))).join("") || `<p class="muted">No questions match these filters yet.</p>`}
      </div>
    </section>
  `;
}

function filterPanel(filters, topicFilter) {
  const data = state.data;
  const levels = ["all", ...data.levels];
  const difficulties = ["all", "Easy", "Medium", "Hard"];
  const questionTypes = ["all", ...new Set(data.questions.map((question) => question.questionType).filter(Boolean))];
  const statuses = ["all", "New", "Attempted", "Wrong", "Bookmarked", "Mastered"];
  const exams = ["all", ...new Set(data.questions.flatMap((question) => question.examTags || []))];
  const categoryLabels = data.categories.reduce((map, category) => ({ ...map, [category.id]: category.name }), {});
  const skillLabels = data.skills.reduce((map, skill) => ({ ...map, [skill.id]: skill.name }), {});

  return `
    <form class="filter-panel" data-filter-form>
      <h2>Optional Filters</h2>
      <div class="filter-grid">
        ${selectControl("skillCategory", "Skill Category", ["all", ...data.categories.map((category) => category.id)], filters.skillCategory, categoryLabels)}
        ${selectControl("skill", "Skill", ["all", ...data.skills.map((skill) => skill.id)], filters.skill, skillLabels)}
        ${selectControl("topic", "Topic", ["all", ...data.topics.map((topic) => topic.id)], topicFilter, data.topics.reduce((map, topic) => ({ ...map, [topic.id]: topic.name }), {}))}
        ${selectControl("level", "Level", levels, filters.level)}
        ${selectControl("difficulty", "Difficulty", difficulties, filters.difficulty)}
        ${selectControl("exam", "Exam Relevance", exams, filters.exam)}
        ${selectControl("questionType", "Question Type", questionTypes, filters.questionType)}
        ${selectControl("status", "Status", statuses, filters.status)}
      </div>
    </form>
  `;
}

function selectControl(name, label, values, selected, labels = {}) {
  return `
    <div class="field-control">
      <label for="filter-${name}">${label}</label>
      <select id="filter-${name}" name="${name}">
        ${values.map((value) => `<option value="${escapeHtml(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(labels[value] || value)}</option>`).join("")}
      </select>
    </div>
  `;
}

function renderPracticeTopic(app, categorySlug, topicSlug) {
  const data = state.data;
  const category = getCategory(data, categorySlug);
  const topic = getTopic(data, topicSlug);
  if (!category || !topic) return renderMissing(app, "Practice topic");
  const params = new URLSearchParams(window.location.search);
  const requestedQuestionId = params.get("question");
  const subTopic = params.get("subTopic") || "all";
  const filters = {
    skillCategory: category.id,
    topic: topic.id,
    subTopic,
    level: params.get("level") || "all",
    difficulty: params.get("difficulty") || "all",
    questionType: params.get("questionType") || "all",
    status: params.get("status") || "all"
  };
  const queue = getQuestions(data, filters);
  if (requestedQuestionId) {
    const requestedIndex = queue.findIndex((question) => question.id === requestedQuestionId);
    if (requestedIndex >= 0) state.practice.currentIndex = requestedIndex;
  }
  resetPracticeIfNeeded(queue, filters);
  const current = queue[state.practice.currentIndex] || queue[0];
  const topics = data.topics.filter((item) => item.skillCategory === category.id);

  app.innerHTML = `
    <section class="learning-layout">
      ${topicNavigation(topics, topic.id, subTopic === "all" ? "" : subTopic)}
      <div>
        <article class="question-card">
          <nav class="breadcrumb" aria-label="Breadcrumb">
            <a href="skills/">Skills</a><span>/</span><a href="${category.url}">${escapeHtml(category.name)}</a><span>/</span><a href="${topic.url}">${escapeHtml(topic.name)}</a><span>/</span><span>Practice</span>
          </nav>
          <h1>${escapeHtml(topic.name)} Practice</h1>
          ${current ? practiceQuestion(current, queue, topic) : `<p class="muted">No questions are available for this selection yet.</p>`}
        </article>
      </div>
      ${quietTools([
        { label: "Progress", value: `${topic.progress}%` },
        { label: "Timer", value: "Untimed" },
        { label: "Accuracy", value: "71%" },
        { label: "Queue", value: `${queue.length} questions` }
      ])}
    </section>
  `;
}

function resetPracticeIfNeeded(queue, filters) {
  const key = `${queue.map((question) => question.id).join("|")}-${JSON.stringify(filters)}`;
  if (state.practice.queueKey !== key) {
    state.practice.queueKey = key;
    state.practice.queueIds = queue.map((question) => question.id);
    state.practice.currentIndex = 0;
    state.practice.selectedAnswer = "";
    state.practice.answered = false;
    state.practice.showExplanation = false;
  }
  if (state.practice.currentIndex >= queue.length) {
    state.practice.currentIndex = 0;
  }
}

function practiceQuestion(question, queue, topic) {
  const number = state.practice.currentIndex + 1;
  const selected = state.practice.selectedAnswer;
  const isCorrect = selected === question.correctAnswer;
  const subTopic = getSubTopic(topic, question.subTopic);

  return `
    <div class="question-meta">
      ${pill(`Question ${number} of ${queue.length}`, "gold")}
      ${pill(question.skillCategory.replaceAll("-", " "))}
      ${pill(subTopic?.name || question.subTopic)}
      ${pill(question.difficulty)}
    </div>
    <form data-practice-form>
      <p class="question-text">${escapeHtml(question.questionText)}</p>
      <fieldset class="options" ${state.practice.answered ? "disabled" : ""}>
        <legend class="sr-only">Answer options</legend>
        ${question.options.map((option) => `
          <label class="option">
            <input type="radio" name="answer" value="${escapeHtml(option.id)}" ${selected === option.id ? "checked" : ""} required>
            <span><strong>${escapeHtml(option.id)}.</strong> ${escapeHtml(option.text)}</span>
          </label>
        `).join("")}
      </fieldset>
      <div class="bottom-next">
        <button type="submit" ${state.practice.answered ? "disabled" : ""}>Submit Answer</button>
      </div>
    </form>
    ${state.practice.answered ? `
      <section class="result-panel ${isCorrect ? "correct" : "incorrect"}" aria-live="polite">
        <h2>${isCorrect ? "Correct" : "Incorrect"}</h2>
        <p>${escapeHtml(question.shortExplanation)}</p>
        <div class="result-actions">
          <button type="button" class="secondary" data-action="toggle-explanation">${state.practice.showExplanation ? "Hide Explanation" : "See Explanation"}</button>
          <button type="button" class="secondary" data-action="similar-question">Try Similar Question</button>
          ${actionLink("Learn This Topic", question.learnMoreUrl, "secondary")}
          <button type="button" data-action="next-question">Next Question</button>
        </div>
      </section>
      ${state.practice.showExplanation ? explanationCard(question, topic) : ""}
    ` : ""}
  `;
}

function explanationCard(question, topic) {
  const full = question.fullExplanation || {};
  const others = full.whyOtherOptionsAreWrong || {};
  return `
    <section class="explanation-card">
      <h2>Explanation</h2>
      <ol>
        ${(full.steps || []).map((step) => `<li><strong>${escapeHtml(step.title)}:</strong> ${escapeHtml(step.text)}</li>`).join("")}
      </ol>
      <p><strong>Correct answer:</strong> ${escapeHtml(question.correctAnswer)}. ${escapeHtml(full.correctAnswer || "")}</p>
      <h3>Why Other Options Are Wrong</h3>
      <ul>
        ${Object.entries(others).map(([key, value]) => `<li><strong>${escapeHtml(key)}:</strong> ${escapeHtml(value)}</li>`).join("")}
      </ul>
      <p><strong>Common mistake:</strong> ${escapeHtml(question.commonMistake)}</p>
      <div class="result-actions">
        ${actionLink("Practice 5 Similar Questions", `${topic.practiceUrl}?subTopic=${question.subTopic}`, "secondary")}
        ${actionLink("Study Full Topic", question.learnMoreUrl)}
      </div>
    </section>
  `;
}

function renderProgress(app) {
  const data = state.data;
  const progress = data.progress;
  app.innerHTML = `
    <section class="page-hero">
      <p class="eyebrow">Progress</p>
      <h1>Full Analytics Stay Here</h1>
      <p>Question pages stay quiet. Progress, accuracy, speed, weak topics, and badges live in this dedicated view.</p>
    </section>
    <section class="section">
      <div class="analytics-grid">
        ${statCard("Overall Progress", `${progress.overall.progress}%`, progress.overall.currentLevel)}
        ${statCard("Accuracy", `${progress.overall.accuracy}%`, "Sample attempts")}
        ${statCard("Speed", progress.overall.speed, "Normal pace")}
        ${statCard("Badges", String(progress.badges.length), "Mock achievements")}
      </div>
    </section>
    <section class="split-panel">
      <div class="section">
        <div class="section-header"><div><h2>Skill Progress</h2><p>Each row can later connect to saved learner attempts.</p></div></div>
        <div class="bank-list">
          ${progress.skills.map((skill) => `
            <article class="bank-question">
              <div class="section-header">
                <div><h3>${escapeHtml(skill.name)}</h3><p class="muted">Level: ${escapeHtml(skill.level)} | Mistakes: ${skill.mistakes}</p></div>
                <strong>${skill.accuracy}% accuracy</strong>
              </div>
              ${progressBar(skill.progress)}
              <div class="card-actions">${actionLink("Repair Weak Topic", skill.repairUrl, "secondary")}${actionLink("Recommended Practice", skill.practiceUrl)}</div>
            </article>
          `).join("")}
        </div>
      </div>
      <aside class="section">
        <h2>Recommended Next Topic</h2>
        <p class="muted">${escapeHtml(progress.nextStep.description)}</p>
        <div class="card-actions">${actionLink(progress.nextStep.label, progress.nextStep.url)}</div>
        <h2>Mistake Types</h2>
        <div class="bank-list">
          ${progress.mistakeTypes.map((mistake) => `
            <article class="tool-item">
              <strong>${escapeHtml(mistake.label)}</strong>
              <span>${mistake.count} recent mistakes</span>
            </article>
          `).join("")}
        </div>
        <h2>Badges</h2>
        <div class="meta-row">${progress.badges.map((badge) => pill(badge, "green")).join("")}</div>
      </aside>
    </section>
  `;
}

function renderMockTests(app) {
  const assumptionTopic = getTopic(state.data, "assumption-reasoning");
  app.innerHTML = `
    <section class="page-hero">
      <p class="eyebrow">Mock Tests</p>
      <h1>Mini Tests Connected to Topics</h1>
      <p>The sample system includes a mini-test placeholder that uses the same question tags as practice.</p>
    </section>
    <section class="section">
      <div class="grid two">
        <article class="test-card" id="diagnostic">
          <span class="type-label">Diagnostic</span>
          <h3>Starter Diagnostic</h3>
          <p>A future entry test that can recommend the first skill path.</p>
          <div class="card-actions">${actionLink("Start Diagnostic", "practice/")}</div>
        </article>
        <article class="test-card" id="assumption-mini-test">
          <span class="type-label">Mini Test</span>
          <h3>Assumption Reasoning Mini Test</h3>
          <p>Five medium questions from the Assumption Reasoning sample path.</p>
          <div class="card-actions">${actionLink("Start Mini Test", assumptionTopic.practiceUrl)}</div>
        </article>
      </div>
    </section>
  `;
}

function renderResources(app) {
  app.innerHTML = `
    <section class="page-hero">
      <p class="eyebrow">Resources</p>
      <h1>Expandable Learning Resources</h1>
      <p>Worksheets, teacher resources, exam relevance notes, and downloadable packs can be added later as data records.</p>
    </section>
    <section class="section">
      <div class="grid three">
        <article class="resource-card">
          <span class="type-label">Guide</span>
          <h3>How to Use Assumption Practice</h3>
          <p>Study the topic, answer questions, then open explanations only when needed.</p>
          <div class="card-actions">${actionLink("Study Topic", "skills/logical-reasoning/assumption-reasoning/necessary-assumption/")}</div>
        </article>
        <article class="resource-card">
          <span class="type-label">Worksheet</span>
          <h3>Future Printable Worksheet</h3>
          <p>A placeholder for downloadable topic-wise worksheets.</p>
          <div class="card-actions">${actionLink("Practice Online", "practice/logical-reasoning/assumption-reasoning/", "secondary")}</div>
        </article>
        <article class="resource-card">
          <span class="type-label">Teacher Resource</span>
          <h3>Classroom Repair Plan</h3>
          <p>Future teacher guidance can connect weak topics to repair practice.</p>
          <div class="card-actions">${actionLink("View Progress", "progress/", "secondary")}</div>
        </article>
      </div>
    </section>
  `;
}

function renderSearch(app) {
  const params = new URLSearchParams(window.location.search);
  const query = params.get("q") || "";
  const results = searchRecords(state.searchRecords, query);

  app.innerHTML = `
    <section class="page-hero">
      <p class="eyebrow">Site-wide Search</p>
      <h1>Search Skills, Lessons, Questions, and Explanations</h1>
      <p>Search is built from the same JSON data that powers topics, practice, progress, mini tests, and resources.</p>
    </section>
    <section class="section">
      <form class="search-page-form" role="search" data-page-search>
        <label class="sr-only" for="page-search-input">Search skills, topics, questions</label>
        <input id="page-search-input" name="q" type="search" value="${escapeHtml(query)}" placeholder="Search skills, topics, questions...">
        <button type="submit">Search</button>
      </form>
    </section>
    <section class="section">
      <div class="section-header">
        <div>
          <h2>${query ? `${results.length} results for "${escapeHtml(query)}"` : "Recommended search results"}</h2>
          <p>Each result shows a type, skill path, short description, and direct actions.</p>
        </div>
      </div>
      ${results.length ? results.map(searchResultCard).join("") : `<p class="muted">No results yet. Try "assumption", "mistake", "logical", or "mini test".</p>`}
    </section>
  `;
}

function renderMissing(app, label) {
  app.innerHTML = `
    <section class="notice-card">
      <h1>${label} not found</h1>
      <p>The route exists for future expansion, but matching data has not been added yet.</p>
      <div class="card-actions">${actionLink("Back to Skills", "skills/")}${actionLink("Search", "search/", "secondary")}</div>
    </section>
  `;
}

function handleSubmit(event) {
  const pageSearch = event.target.closest("[data-page-search]");
  if (pageSearch) {
    event.preventDefault();
    const value = new FormData(pageSearch).get("q")?.toString().trim() || "";
    navigateTo(`search/${value ? `?q=${encodeURIComponent(value)}` : ""}`);
    return;
  }

  const practiceForm = event.target.closest("[data-practice-form]");
  if (practiceForm) {
    event.preventDefault();
    const value = new FormData(practiceForm).get("answer")?.toString();
    if (!value) return;
    state.practice.selectedAnswer = value;
    state.practice.answered = true;
    state.practice.showExplanation = false;
    renderRoute();
  }
}

function handleClick(event) {
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (!action) return;

  if (action === "toggle-explanation") {
    state.practice.showExplanation = !state.practice.showExplanation;
    renderRoute();
  }

  if (action === "next-question") {
    state.practice.currentIndex += 1;
    state.practice.selectedAnswer = "";
    state.practice.answered = false;
    state.practice.showExplanation = false;
    renderRoute();
  }

  if (action === "similar-question") {
    const currentQueue = state.practice.queueIds;
    const currentQuestion = state.data.questions.find((question) => question.id === currentQueue[state.practice.currentIndex]);
    const targetId = currentQuestion?.similarQuestionIds?.find((id) => currentQueue.includes(id));
    const targetIndex = targetId ? currentQueue.indexOf(targetId) : (state.practice.currentIndex + 1) % Math.max(currentQueue.length, 1);
    state.practice.currentIndex = targetIndex;
    state.practice.selectedAnswer = "";
    state.practice.answered = false;
    state.practice.showExplanation = false;
    renderRoute();
  }
}

function handleChange(event) {
  const form = event.target.closest("[data-filter-form]");
  if (!form) return;

  const params = new URLSearchParams(new FormData(form));
  for (const [key, value] of [...params.entries()]) {
    if (!value || value === "all") params.delete(key);
  }
  navigateTo(`practice/${params.toString() ? `?${params.toString()}` : ""}`);
}
