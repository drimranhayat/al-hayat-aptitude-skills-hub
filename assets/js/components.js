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
  return `<div class="progress"><span style="width:${safeValue}%"></span><strong>${safeValue}%</strong></div>`;
}

export function pill(text, tone = "") {
  return `<span class="pill ${tone ? `pill-${escapeHtml(tone)}` : ""}">${escapeHtml(text)}</span>`;
}

export function actionLink(label, href, variant = "") {
  return `<a class="btn ${variant ? `btn-${escapeHtml(variant)}` : ""}" href="${siteUrl(href)}">${escapeHtml(label)}</a>`;
}

function isMobileViewport() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 768px)").matches;
}

export function setupMobileOnlyCollapsibles() {
  const mobileQuery = window.matchMedia("(max-width: 768px)");
  function syncDetails(details, forceDefault = false) {
    const summary = details.querySelector("summary");
    const icon = details.querySelector(".collapse-icon");
    const label = details.dataset.label || "section";
    const isMobile = mobileQuery.matches;
    if (forceDefault) {
      if (isMobile) details.removeAttribute("open");
      else details.setAttribute("open", "");
    }
    const isOpen = details.hasAttribute("open");
    if (icon) icon.textContent = isOpen ? "−" : "+";
    if (summary) {
      summary.setAttribute("aria-expanded", String(isOpen));
      summary.setAttribute("aria-label", isOpen ? `Collapse ${label}` : `Expand ${label}`);
    }
  }
  document.querySelectorAll("details.mobile-only-collapse").forEach((details) => {
    if (details.dataset.collapsibleReady === "true") return;
    details.dataset.collapsibleReady = "true";
    syncDetails(details, true);
    details.addEventListener("toggle", () => syncDetails(details, false));
  });
  mobileQuery.addEventListener?.("change", () => {
    document.querySelectorAll("details.mobile-only-collapse").forEach((details) => syncDetails(details, true));
  });
}

document.addEventListener("DOMContentLoaded", setupMobileOnlyCollapsibles);

export function skillCard(category) {
  return `<article class="skill-card">
    <div>${pill(category.level || "Starter", "gold")} ${pill(`${category.questionCount || 0} questions`)}</div>
    <h3>${escapeHtml(category.name)}</h3>
    <p>${escapeHtml(category.description || "")}</p>
    ${progressBar(category.progress || 0)}
    <div class="card-actions">${actionLink(category.progress > 0 ? "Continue" : "Start", category.url || "skills/")} ${actionLink("Practice", category.practiceUrl || "practice/", "secondary")}</div>
  </article>`;
}

export function topicCard(topic, label = "Study Topic") {
  return `<article class="topic-card">
    <div>${pill(topic.level || "Starter", "gold")} ${pill(`${topic.questionCount || 0} questions`)}</div>
    <h3>${escapeHtml(topic.name)}</h3>
    <p>${escapeHtml(topic.description || "")}</p>
    ${progressBar(topic.progress || 0)}
    <div class="card-actions">${actionLink(label, topic.url || "skills/")} ${actionLink("Practice Questions", topic.practiceUrl || "practice/", "secondary")}</div>
  </article>`;
}

export function searchResultCard(result) {
  const actions = (result.actions || [])
    .map((action, index) => actionLink(action.label, action.href, index === 0 ? "" : "secondary"))
    .join(" ");
  return `<article class="search-result-card">
    ${pill(result.type || "Result")}
    <h3>${escapeHtml(result.title || "Untitled")}</h3>
    <p class="muted">${escapeHtml(result.skillPath || "Al-Hayat Aptitude Skills Hub")}</p>
    <p>${escapeHtml(result.description || "")}</p>
    <div class="card-actions">${actions}</div>
  </article>`;
}

export function statCard(label, value, help = "") {
  return `<article class="stat-card"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong>${help ? `<p>${escapeHtml(help)}</p>` : ""}</article>`;
}
