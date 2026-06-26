import { loadQuestionBank } from './data-loader.js';
import { siteUrl } from './path-utils.js';

const state={questions:[],filtered:[],i:0,selected:null,checked:false,stats:{attempted:0,correct:0,wrong:0,bookmarked:0}};
const $=(s,r=document)=>r.querySelector(s);
const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
function text(x){return x==null?'':String(x)}
function normOptions(q){
  if(Array.isArray(q.options)) return q.options.map((o,idx)=> typeof o==='string'?{id:String.fromCharCode(65+idx),text:o}:o);
  return [];
}
function answerId(q){return text(q.correctAnswer || q.answer).trim();}
function getFilters(){return {skill:$('#skillFilter')?.value||'',difficulty:$('#difficultyFilter')?.value||'',exam:$('#examFilter')?.value||'',q:($('#practiceSearch')?.value||'').toLowerCase().trim()}}
function applyFilters(){
 const f=getFilters();
 state.filtered=state.questions.filter(q=>{
  const hay=[q.skillCategory,q.skill,q.topic,q.subTopic,q.questionType,q.questionText,q.keywords?.join(' ')].join(' ').toLowerCase();
  const exams=(q.examTags||[]).join(' ').toLowerCase();
  return (!f.skill || hay.includes(f.skill.toLowerCase())) && (!f.difficulty || text(q.difficulty).toLowerCase()===f.difficulty.toLowerCase()) && (!f.exam || exams.includes(f.exam.toLowerCase())) && (!f.q || hay.includes(f.q));
 });
 state.i=0; state.selected=null; state.checked=false; render();
}
function saveProgress(q, correct){
 const key='ah_aptitude_progress_v1';
 const current=JSON.parse(localStorage.getItem(key)||'[]');
 current.push({id:q.id,correct,skill:q.skill||q.skillCategory,difficulty:q.difficulty,at:new Date().toISOString()});
 localStorage.setItem(key,JSON.stringify(current.slice(-1000)));
}
function populateFilters(){
 const skills=[...new Set(state.questions.map(q=>q.skill||q.skillCategory).filter(Boolean))].sort();
 const diffs=[...new Set(state.questions.map(q=>q.difficulty).filter(Boolean))].sort();
 const exams=[...new Set(state.questions.flatMap(q=>q.examTags||[]).filter(Boolean))].sort();
 const fill=(id,items,label)=>{const el=$(id); if(!el)return; el.innerHTML=`<option value="">${label}</option>`+items.map(x=>`<option value="${x}">${x}</option>`).join('')};
 fill('#skillFilter',skills,'All skills'); fill('#difficultyFilter',diffs,'All levels'); fill('#examFilter',exams,'All exams');
}
function render(){
 const app=$('[data-practice-app]'); if(!app)return;
 if(!state.filtered.length){app.innerHTML='<div class="card"><h2>No questions found</h2><p class="muted">Change filters or add more questions to the data folder.</p></div>'; updateStats(); return;}
 const q=state.filtered[state.i]; const options=normOptions(q); const ans=answerId(q);
 app.innerHTML=`<article class="question-card panel">
  <div class="qmeta"><span class="pill">Question ${state.i+1} of ${state.filtered.length}</span><span class="pill">${text(q.skill||q.skillCategory)}</span><span class="pill">${text(q.difficulty)}</span><span class="pill">${text(q.questionType||q.topic)}</span></div>
  <div class="question-text">${text(q.questionText)}</div>
  <div class="options">${options.map(o=>{
    let cls='option'; if(state.selected===o.id) cls+=' selected'; if(state.checked && o.id===ans) cls+=' correct'; if(state.checked && state.selected===o.id && o.id!==ans) cls+=' wrong';
    return `<button class="${cls}" data-opt="${o.id}"><strong>${o.id}.</strong> ${text(o.text)}</button>`
  }).join('')}</div>
  <div class="toolbar">
    <button class="btn primary" data-check ${state.checked?'disabled':''}>Check Answer</button>
    <button class="btn secondary" data-prev ${state.i===0?'disabled':''}>Previous</button>
    <button class="btn secondary" data-next>Next</button>
    <button class="btn ghost" data-bookmark>☆ Bookmark</button>
  </div>
  <div class="explain ${state.checked?'':'hidden'}">
    <h3>${state.selected===ans?'Correct. Well done.':'Review carefully'}</h3>
    <p><strong>Answer:</strong> ${ans}</p>
    <p>${text(q.shortExplanation || q.explanation)}</p>
    ${q.fullExplanation?.correctAnswer?`<p>${text(q.fullExplanation.correctAnswer)}</p>`:''}
    ${q.commonMistake?`<p><strong>Common mistake:</strong> ${text(q.commonMistake)}</p>`:''}
    ${q.learnMoreUrl?`<p><a class="btn secondary" href="${siteUrl(q.learnMoreUrl)}">Learn this concept</a></p>`:''}
  </div>
 </article>`;
 $$('.option',app).forEach(b=>b.addEventListener('click',()=>{if(state.checked)return; state.selected=b.dataset.opt; render();}));
 $('[data-check]',app)?.addEventListener('click',()=>{if(!state.selected){alert('Please select an option first.');return;} state.checked=true; state.stats.attempted++; const ok=state.selected===ans; ok?state.stats.correct++:state.stats.wrong++; saveProgress(q,ok); render();});
 $('[data-prev]',app)?.addEventListener('click',()=>{state.i=Math.max(0,state.i-1);state.selected=null;state.checked=false;render();});
 $('[data-next]',app)?.addEventListener('click',()=>{state.i=(state.i+1)%state.filtered.length;state.selected=null;state.checked=false;render();});
 $('[data-bookmark]',app)?.addEventListener('click',()=>{state.stats.bookmarked++; localStorage.setItem('ah_bookmark_'+q.id,JSON.stringify(q)); updateStats(); alert('Bookmarked for revision.');});
 updateStats();
}
function updateStats(){
 $('#totalQuestions') && ($('#totalQuestions').textContent=state.filtered.length||0);
 $('#attempted') && ($('#attempted').textContent=state.stats.attempted);
 $('#correct') && ($('#correct').textContent=state.stats.correct);
 $('#wrong') && ($('#wrong').textContent=state.stats.wrong);
}
async function init(){
 const app=$('[data-practice-app]'); if(!app)return;
 try{ app.innerHTML='<div class="loading">Loading practice...</div>'; state.questions=await loadQuestionBank(); state.filtered=[...state.questions]; populateFilters(); render(); ['#skillFilter','#difficultyFilter','#examFilter','#practiceSearch'].forEach(id=>$(id)?.addEventListener('input',applyFilters)); $('#resetFilters')?.addEventListener('click',()=>{$$('#skillFilter,#difficultyFilter,#examFilter,#practiceSearch').forEach(x=>x.value='');applyFilters();}); }
 catch(err){ console.error(err); app.innerHTML=`<div class="card"><h2>Practice could not load</h2><p class="muted">${err.message}</p><p>Check that <span class="kbd">data/questions.json</span> and imported question files exist.</p></div>`; }
}
document.addEventListener('DOMContentLoaded',init);
