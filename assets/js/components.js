import { siteUrl, stripBasePath } from './path-utils.js';

const navItems = [
  ['Home','index.html'],
  ['Skills','skills/index.html'],
  ['Practice','practice/index.html'],
  ['Mock Tests','mock-tests/index.html'],
  ['Progress','progress/index.html'],
  ['Resources','resources/index.html'],
  ['Search','search/index.html'],
  ['Tools','tools/index.html']
];

function isActive(target){
  const current = stripBasePath() || 'index.html';
  const cleanTarget = target.replace(/^\/+/, '');
  if(cleanTarget === 'index.html') return current === '' || current === 'index.html';
  return current.startsWith(cleanTarget.replace('index.html',''));
}

function renderHeader(){
  const host = document.querySelector('[data-header]');
  if(!host) return;
  host.innerHTML = `
    <header class="topbar">
      <nav class="wrap nav" aria-label="Main navigation">
        <a class="brand" href="${siteUrl('index.html')}">
          <span class="logo">AH</span>
          <span>Al-Hayat Aptitude<small>Skills • Practice • Tests</small></span>
        </a>
        <button class="menu-btn" type="button" aria-expanded="false" aria-controls="siteNav">Menu</button>
        <div class="navlinks" id="siteNav">
          ${navItems.map(([label,target])=>`<a class="${isActive(target) ? 'active' : ''}" href="${siteUrl(target)}">${label}</a>`).join('')}
        </div>
      </nav>
    </header>
  `;
}

function renderFooter(){
  const host = document.querySelector('[data-footer]');
  if(!host) return;
  host.innerHTML = `
    <footer class="footer">
      <div class="wrap">
        <span>Al-Hayat Aptitude Skills Hub</span>
        <span>Clean exam preparation for serious learners.</span>
      </div>
    </footer>
  `;
}

document.addEventListener('DOMContentLoaded',()=>{
  renderHeader();
  renderFooter();
});
