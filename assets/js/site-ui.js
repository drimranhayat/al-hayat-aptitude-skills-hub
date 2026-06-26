import { fixInternalLinks } from './path-utils.js';

export function initSiteUI(){
  fixInternalLinks(document);
  const btn=document.querySelector('[data-menu-btn]');
  const nav=document.querySelector('[data-navlinks]');
  btn?.addEventListener('click',()=>nav?.classList.toggle('open'));
  const path = location.pathname.replace(/\/$/,'');
  document.querySelectorAll('.navlinks a').forEach(a=>{
    const href=a.href.replace(/\/$/,'');
    if(href && path && href.endsWith(path.split('/').pop() || 'index.html')) a.classList.add('active');
  });
}

document.addEventListener('DOMContentLoaded', initSiteUI);
