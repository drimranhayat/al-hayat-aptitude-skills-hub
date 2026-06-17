import { siteUrl } from "./path-utils.js";

export function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function progressBar(value = 0) {
  const safeValue = Math.max(0, Math.min(100, Number(value) || 0));
  return `
    <div class="progress-label"><span>Progress</span><span>${safeValue}%</span></div>
    <div class="progress-track" aria-label="Progress ${safeValue}%"><span class="progress-fill" style="width:${safeValue}%"></span></div>
  `;
}

export function pill(text, tone = "") {
  return `<span class="pill ${tone}">${escapeHtml(text)}</span>`;
}

export function actionLink(label, href, variant = "") {
  return `<a class="button ${variant}" href="${escapeHtml(siteUrl(href))}">${escapeHtml(label)}</a>`;
}

export function skillCard(category) {
  return `
    <article class="skill-card">
      <div class="meta-row">
        ${pill(category.level || "Starter", "gold")}
        ${pill(`${category.questionCount || 0} questions`, "")}
      </div>
      <h3>${escapeHtml(category.name)}</h3>
      <p>${escapeHtml(category.description)}</p>
      ${progressBar(category.progress || 0)}
      <div class="meta-row">
        ${pill(`${category.topicCount || 0} topics`, "green")}
        ${pill(`${category.skillCount || 0} skills`, "")}
      </div>
      <div class="card-actions">
        ${actionLink(category.progress > 0 ? "Continue" : "Start", category.url)}
        ${actionLink("Practice", category.practiceUrl || "practice/", "secondary")}
      </div>
    </article>
  `;
}

export function topicCard(topic, label = "Study Topic") {
  return `
    <article class="topic-card">
      <div class="meta-row">
        ${pill(topic.level || "Starter", "gold")}
        ${pill(`${topic.questionCount || 0} questions`, "")}
      </div>
      <h3>${escapeHtml(topic.name)}</h3>
      <p>${escapeHtml(topic.description)}</p>
      ${progressBar(topic.progress || 0)}
      <div class="card-actions">
        ${actionLink(label, topic.url)}
        ${actionLink("Practice Questions", topic.practiceUrl || "practice/", "secondary")}
      </div>
    </article>
  `;
}

export function subTopicCard(topic, subTopic) {
  return `
    <article class="topic-card">
      <div class="meta-row">
        ${pill(subTopic.level || topic.level || "Starter", "gold")}
        ${pill(`${subTopic.questionCount || 0} questions`, "")}
      </div>
      <h3>${escapeHtml(subTopic.name)}</h3>
      <p>${escapeHtml(subTopic.description)}</p>
      ${progressBar(subTopic.progress || 0)}
      <div class="card-actions">
        ${actionLink("Study Topic", subTopic.url)}
        ${actionLink("Practice Questions", `${topic.practiceUrl}?subTopic=${subTopic.id}`, "secondary")}
      </div>
    </article>
  `;
}

export function searchResultCard(result) {
  const actions = (result.actions || [])
    .map((action, index) => actionLink(action.label, action.href, index === 0 ? "" : "secondary"))
    .join("");

  return `
    <article class="search-result">
      <span class="type-label">${escapeHtml(result.type)}</span>
      <h3>${escapeHtml(result.title)}</h3>
      <p><strong>${escapeHtml(result.skillPath || "Al-Hayat Aptitude Skills Hub")}</strong></p>
      <p>${escapeHtml(result.description || "")}</p>
      <div class="card-actions">${actions}</div>
    </article>
  `;
}

export function topicNavigation(topics, activeTopicId, activeSubTopicId = "") {
  return `
    <aside class="topic-nav" aria-label="Topic navigation">
      <details open>
        <summary>Topic Navigation</summary>
        <ul class="topic-list">
          ${topics.map((topic) => `
            <li>
              <a class="${topic.id === activeTopicId && !activeSubTopicId ? "is-active" : ""}" href="${escapeHtml(siteUrl(topic.url))}">${escapeHtml(topic.name)}</a>
              ${(topic.subTopics || []).length ? `
                <ul class="topic-list">
                  ${topic.subTopics.map((subTopic) => `
                    <li><a class="${subTopic.id === activeSubTopicId ? "is-active" : ""}" href="${escapeHtml(siteUrl(subTopic.url))}">${escapeHtml(subTopic.name)}</a></li>
                  `).join("")}
                </ul>
              ` : ""}
            </li>
          `).join("")}
        </ul>
      </details>
    </aside>
  `;
}

export function quietTools(items) {
  return `
    <aside class="tool-panel" aria-label="Quiet learning tools">
      <details open>
        <summary>Quiet Tools</summary>
        <div class="tool-stack">
          ${items.map((item) => `
            <div class="tool-item">
              <strong>${escapeHtml(item.label)}</strong>
              <span>${escapeHtml(item.value)}</span>
            </div>
          `).join("")}
        </div>
      </details>
    </aside>
  `;
}

export function bankQuestionCard(question, topic) {
  return `
    <article class="bank-question">
      <div class="meta-row">
        ${pill(question.level, "gold")}
        ${pill(question.difficulty)}
        ${pill(question.status, question.status === "Wrong" ? "red" : question.status === "Mastered" ? "green" : "")}
      </div>
      <p>${escapeHtml(question.questionText)}</p>
      <div class="card-actions">
        ${actionLink("Practice", `${topic?.practiceUrl || "practice/"}?question=${question.id}`)}
        ${actionLink("Learn This Topic", question.learnMoreUrl, "secondary")}
      </div>
    </article>
  `;
}

export function statCard(label, value, help = "") {
  return `
    <article class="stat-card">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      ${help ? `<p class="muted">${escapeHtml(help)}</p>` : ""}
    </article>
  `;
}
