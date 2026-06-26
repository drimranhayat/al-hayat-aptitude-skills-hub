const REPO_NAME = 'al-hayat-aptitude-skills-hub';

export function getBasePath(){
  const path = window.location.pathname;
  return path.includes(`/${REPO_NAME}/`) ? `/${REPO_NAME}/` : '/';
}

export function siteUrl(target=''){
  if(!target || target === '/') return getBasePath();
  if(/^(https?:|mailto:|tel:|#)/i.test(target)) return target;
  return getBasePath() + String(target).replace(/^\/+/, '');
}

export function stripBasePath(pathname=window.location.pathname){
  const base = getBasePath();
  if(base !== '/' && pathname.startsWith(base)) return pathname.slice(base.length);
  return pathname.replace(/^\/+/, '');
}

export function fixInternalLinks(root=document){
  root.querySelectorAll?.('a[href]').forEach((link)=>{
    const href = link.getAttribute('href');
    if(!href || /^(https?:|mailto:|tel:|#|javascript:)/i.test(href)) return;
    link.setAttribute('href', siteUrl(href));
  });
}
