import './components.js';
import './site-ui.js';
import { loadQuestionBank, loadSkills } from './data-loader.js';
import { siteUrl } from './path-utils.js';

const $=(s,r=document)=>r.querySelector(s);
async function homeStats(){
 const el=$('[data-home-stats]'); if(!el)return;
 try{ const qs=await loadQuestionBank(); const skills=await loadSkills(); const skillCount=Array.isArray(skills.skills)?skills.skills.length:0;
 el.innerHTML=`<div class="stat"><strong>${qs.length}</strong>Questions</div><div class="stat"><strong>${skillCount}</strong>Skill areas</div><div class="stat"><strong>5</strong>Exam modes</div><div class="stat"><strong>100%</strong>Clean aptitude</div>`; }
 catch{ el.innerHTML='<div class="notice">Data will appear after question files are uploaded.</div>'; }
}
function renderSkillCards(){
 const el=$('[data-skill-cards]'); if(!el)return;
 const cards=[['Verbal Skills','Synonyms, antonyms, sentence completion, correction, analogies.','skills/verbal-skills/'],['Quantitative Aptitude','Arithmetic, algebra, percentages, ratios, speed, probability.','skills/quantitative-aptitude/'],['Logical Reasoning','Series, coding, classification, syllogism, arrangements.','skills/logical-reasoning/'],['Analytical Reasoning','Puzzle sets, conditions, grouping, ordering, deductions.','skills/analytical-reasoning/'],['Data Interpretation','Tables, charts, averages, comparison and trends.','skills/data-interpretation/'],['Mock Tests','Timed exam practice with review and progress.','mock-tests/']];
 el.innerHTML=cards.map(c=>`<a class="card" href="${siteUrl(c[2])}"><h3>${c[0]}</h3><p class="muted">${c[1]}</p><span class="pill">Start learning →</span></a>`).join('');
}
document.addEventListener('DOMContentLoaded',()=>{homeStats();renderSkillCards();});
