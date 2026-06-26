import { loadQuestionBank } from './data-loader.js';
import { siteUrl } from './path-utils.js';
const $=(s,r=document)=>r.querySelector(s);
async function init(){
 const input=$('#siteSearch'), box=$('[data-search-results]'); if(!input||!box)return;
 const qs=await loadQuestionBank();
 function run(){
  const q=input.value.toLowerCase().trim();
  if(!q){box.innerHTML='<p class="muted">Type a topic, word, exam, or skill.</p>';return;}
  const hits=qs.filter(x=>[x.questionText,x.skill,x.topic,x.subTopic,x.difficulty,(x.examTags||[]).join(' '),(x.keywords||[]).join(' ')].join(' ').toLowerCase().includes(q)).slice(0,30);
  box.innerHTML=hits.length?hits.map(h=>`<div class="result"><strong>${h.questionText}</strong><p class="muted">${h.skill||h.skillCategory} • ${h.difficulty} • ${(h.examTags||[]).join(', ')}</p><a class="pill" href="${siteUrl('practice/index.html')}">Practice</a></div>`).join(''):'<div class="notice">No result found. Try another word.</div>';
 }
 input.addEventListener('input',run); run();
}
document.addEventListener('DOMContentLoaded',init);
