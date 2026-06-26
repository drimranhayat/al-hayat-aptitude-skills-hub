import { siteUrl } from './path-utils.js';

export function renderHeader(){
  const el=document.querySelector('[data-header]');
  if(!el) return;
  el.innerHTML=`
  <header class="topbar"><div class="wrap nav">
    <a class="brand" href="${siteUrl('index.html')}"><span class="logo">AH</span><span>Al-Hayat Aptitude</span></a>
    <button class="menu-btn" data-menu-btn>☰ Menu</button>
    <nav class="navlinks" data-navlinks>
      <a href="${siteUrl('index.html')}">Home</a>
      <a href="${siteUrl('skills/index.html')}">Skills</a>
      <a href="${siteUrl('practice/index.html')}">Practice</a>
      <a href="${siteUrl('mock-tests/index.html')}">Mock Tests</a>
      <a href="${siteUrl('progress/index.html')}">Progress</a>
      <a href="${siteUrl('resources/index.html')}">Resources</a>
      <a href="${siteUrl('search/index.html')}">Search</a>
    </nav>
  </div></header>`;
}
export function renderFooter(){
 const el=document.querySelector('[data-footer]'); if(!el) return;
 el.innerHTML=`<footer class="footer"><div class="wrap"><strong>Al-Hayat Aptitude Skills Hub</strong><br>Clean, exam-oriented preparation for entrance tests, scholarships, and competitive exams.</div></footer>`;
}
document.addEventListener('DOMContentLoaded',()=>{renderHeader();renderFooter();});
