const REPO_NAME = "al-hayat-aptitude-skills-hub";

export function getBasePath() {
  const path = window.location.pathname;
  if (path.includes(`/${REPO_NAME}/`)) return `/${REPO_NAME}/`;
  return "/";
}

export function stripBasePath(pathname = window.location.pathname) {
  const basePath = getBasePath();
  if (basePath !== "/" && pathname.startsWith(basePath)) {
    return pathname.slice(basePath.length).replace(/^\/+/, "");
  }
  return pathname.replace(/^\/+/, "");
}

export function siteUrl(target = "") {
  if (!target || target === "/") return getBasePath();
  const value = String(target).trim();
  if (/^(https?:|mailto:|tel:|#|javascript:)/i.test(value)) return value;
  const basePath = getBasePath();
  const cleanTarget = value.replace(/^\/+/, "");
  return `${basePath}${cleanTarget}`;
}

export function assetUrl(target = "") {
  return siteUrl(target);
}

export function dataUrl(target = "") {
  return siteUrl(target.startsWith("data/") ? target : `data/${target.replace(/^\/+/, "")}`);
}

export function navigateTo(target) {
  window.location.href = siteUrl(target);
}

export function fixInternalLinks(root = document) {
  root.querySelectorAll?.("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (!href) return;
    if (/^(https?:|mailto:|tel:|#|javascript:)/i.test(href)) return;
    link.setAttribute("href", siteUrl(href));
  });
}

export function pageKey(defaultValue = "home") {
  const clean = stripBasePath().replace(/index\.html$/i, "").replace(/\/+$/g, "");
  return clean || defaultValue;
}

if (typeof window !== "undefined") {
  window.AHPaths = { getBasePath, stripBasePath, siteUrl, assetUrl, dataUrl, navigateTo, fixInternalLinks, pageKey };
}
