import './components.js';
import './site-ui.js';
import { loadQuestionBank, loadSkills } from './data-loader.js';
import { siteUrl } from './path-utils.js';

const $ = (selector, root=document)=>root.querySelector(selector);

const skillCards = [
  {
    title:'Verbal Skills',
    text:'Synonyms, antonyms, context meaning, analogies, sentence completion and correction.',
    tag:'Most important',
    practice:'practice/index.html?skill=verbal'
  },
  {
    title:'Quantitative Aptitude',
    text:'Percentages, ratios, averages, speed, work, number systems, algebra and probability.',
    tag:'Formula + logic',
    practice:'practice/index.html?skill=quantitative'
  },
  {
    title:'Logical Reasoning',
    text:'Series, coding, classification, syllogism, blood relations and direction sense.',
    tag:'Pattern focused',
    practice:'practice/index.html?skill=logical'
  },
  {
    title:'Analytical Reasoning',
    text:'Conditions, grouping, ordering, seating, puzzle sets and deduction-based questions.',
    tag:'High scoring',
    practice:'practice/index.html?skill=analytical'
  },
  {
    title:'Data Interpretation',
    text:'Tables, graphs, averages, comparison, trends, percentages and smart estimation.',
    tag:'Exam practical',
    practice:'practice/index.html?skill=data'
  },
  {
    title:'Mock Tests',
    text:'Timed mixed tests with scoring and review. Use this after skill-wise practice.',
    tag:'Timed mode',
    practice:'mock-tests/index.html'
  }
];

async function homeStats(){
  const el = $('[data-home-stats]');
  if(!el) return;

  try{
    const questions = await loadQuestionBank();
    const skillData = await loadSkills();
    const skillCount = Array.isArray(skillData.skills) ? skillData.skills.length : skillCards.length;
    el.innerHTML = `
      <div class="stat"><strong>${questions.length}</strong><span>Questions</span></div>
      <div class="stat"><strong>${skillCount}</strong><span>Skill areas</span></div>
      <div class="stat"><strong>20</strong><span>Mock items</span></div>
      <div class="stat"><strong>0</strong><span>Distractions</span></div>
    `;
  }catch(error){
    el.innerHTML = `<div class="notice">Data will appear after the question files are uploaded correctly.</div>`;
  }
}

function renderSkillCards(){
  const el = $('[data-skill-cards]');
  if(!el) return;

  el.innerHTML = skillCards.map((card)=>`
    <article class="card">
      <span class="pill">${card.tag}</span>
      <h3>${card.title}</h3>
      <p class="muted">${card.text}</p>
      <div class="card-actions">
        <a class="btn primary" href="${siteUrl(card.practice)}">Practice now</a>
        <a class="btn secondary" href="${siteUrl('resources/index.html')}">Strategy</a>
      </div>
    </article>
  `).join('');
}

document.addEventListener('DOMContentLoaded',()=>{
  homeStats();
  renderSkillCards();
});
