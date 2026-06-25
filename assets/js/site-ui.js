(function(){
  const $=(s,root=document)=>root.querySelector(s); const $$=(s,root=document)=>Array.from(root.querySelectorAll(s));
  const more=$('[data-bottom-more]'); const panel=$('[data-more-panel]');
  more?.addEventListener('click',()=>{const open=panel?.classList.toggle('is-open'); more.setAttribute('aria-expanded',String(!!open));});
  document.addEventListener('click',(e)=>{ if(panel && !panel.contains(e.target) && more && !more.contains(e.target)) { panel.classList.remove('is-open'); more.setAttribute('aria-expanded','false'); }});
  const y=$('[data-year]'); if(y) y.textContent=new Date().getFullYear();
})();
