export function getBasePath() {
  const fallback = "/";
  if (typeof document === "undefined") return fallback;
  const baseHref = document.querySelector("base")?.getAttribute("href") || fallback;
  try {
    const url = new URL(baseHref, window.location.origin);
    return url.pathname.endsWith("/") ? url.pathname : `${url.pathname}/`;
  } catch {
    return fallback;
  }
}

export function stripBasePath(pathname) {
  const basePath = getBasePath();
  if (basePath !== "/" && pathname.startsWith(basePath)) {
    return pathname.slice(basePath.length);
  }
  return pathname;
}

export function siteUrl(target = "") {
  if (!target || target === "/") return getBasePath();
  if (/^(https?:|mailto:|tel:|#)/i.test(target)) return target;
  const basePath = getBasePath();
  if (target.startsWith(basePath)) return target;
  const cleanTarget = target.startsWith("/") ? target.slice(1) : target;
  return `${basePath}${cleanTarget}`;
}

export function navigateTo(target) {
  window.location.href = siteUrl(target);
}

export function fixInternalLinks(root = document) {
  root.querySelectorAll?.("a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (href?.startsWith("/")) {
      link.setAttribute("href", siteUrl(href));
    }
  });
}
