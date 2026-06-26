import { fixInternalLinks } from './path-utils.js';

document.addEventListener('DOMContentLoaded',()=>{
  fixInternalLinks(document);

  const menuButton = document.querySelector('.menu-btn');
  const nav = document.querySelector('.navlinks');
  menuButton?.addEventListener('click',()=>{
    const open = nav?.classList.toggle('open');
    menuButton.setAttribute('aria-expanded', open ? 'true' : 'false');
  });

  document.addEventListener('click',(event)=>{
    if(!nav || !menuButton) return;
    if(nav.contains(event.target) || menuButton.contains(event.target)) return;
    nav.classList.remove('open');
    menuButton.setAttribute('aria-expanded','false');
  });
});
