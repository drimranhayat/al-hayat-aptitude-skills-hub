(function(){
  const $=(s,root=document)=>root.querySelector(s);
  const $$=(s,root=document)=>Array.from(root.querySelectorAll(s));
  const nav=$('[data-site-nav]'); const menu=$('[data-menu-toggle]'); const backdrop=$('[data-nav-backdrop]');
  function setNav(open){ if(!nav||!menu) return; nav.classList.toggle('is-open',open); backdrop?.classList.toggle('is-open',open); document.body.classList.toggle('no-scroll',open); menu.setAttribute('aria-expanded',String(open)); }
  menu?.addEventListener('click',()=>setNav(!nav.classList.contains('is-open'))); backdrop?.addEventListener('click',()=>setNav(false));
  $$('[data-site-nav] a').forEach(a=>a.addEventListener('click',()=>setNav(false)));
  const more=$('[data-bottom-more]'); const panel=$('[data-more-panel]'); more?.addEventListener('click',()=>{const open=panel?.classList.toggle('is-open'); more.setAttribute('aria-expanded',String(!!open));});
  const form=$('[data-header-search]'); form?.addEventListener('submit',e=>{e.preventDefault(); const q=(new FormData(form).get('q')||'').toString().trim(); location.href='search/'+(q?`?q=${encodeURIComponent(q)}`:'');});
  $$('[data-path-button]').forEach(btn=>btn.addEventListener('click',()=>{ const id=btn.dataset.pathButton; $$('[data-path-button]').forEach(b=>b.classList.toggle('is-active',b===btn)); $$('[data-path-panel]').forEach(p=>p.hidden=p.dataset.pathPanel!==id); }));
  $$('[data-skill-tab]').forEach(btn=>btn.addEventListener('click',()=>{ const id=btn.dataset.skillTab; $$('[data-skill-tab]').forEach(b=>b.classList.toggle('is-active',b===btn)); $$('[data-skill-panel]').forEach(p=>p.hidden=p.dataset.skillPanel!==id); }));
  const y=$('[data-year]'); if(y) y.textContent=new Date().getFullYear();
})();
