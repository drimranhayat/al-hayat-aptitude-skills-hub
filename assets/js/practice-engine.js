import { loadQuestionBank } from './data-loader.js';
import { siteUrl } from './path-utils.js';

const state = {
  questions:[],
  filtered:[],
  i:0,
  selected:null,
  checked:false,
  stats:{attempted:0,correct:0,wrong:0,bookmarked:0}
};

const $ = (selector, root=document)=>root.querySelector(selector);
const $$ = (selector, root=document)=>Array.from(root.querySelectorAll(selector));
const text = (value)=>value == null ? '' : String(value);

function normaliseOptions(question){
  if(!Array.isArray(question.options)) return [];
  return question.options.map((option, index)=>{
    if(typeof option === 'string'){
      return { id:String.fromCharCode(65 + index), text:option };
    }
    return option;
  });
}

function answerId(question){
  return text(question.correctAnswer || question.answer).trim();
}

function searchableText(question){
  return [
    question.skillCategory,
    question.skill,
    question.topic,
    question.subTopic,
    question.questionType,
    question.questionText,
    Array.isArray(question.keywords) ? question.keywords.join(' ') : '',
    Array.isArray(question.examTags) ? question.examTags.join(' ') : ''
  ].join(' ').toLowerCase();
}

function getFilters(){
  return {
    skill:$('#skillFilter')?.value || '',
    difficulty:$('#difficultyFilter')?.value || '',
    exam:$('#examFilter')?.value || '',
    query:($('#practiceSearch')?.value || '').toLowerCase().trim()
  };
}

function applyFilters(){
  const filters = getFilters();
  state.filtered = state.questions.filter((question)=>{
    const haystack = searchableText(question);
    const exams = (question.examTags || []).join(' ').toLowerCase();
    return (!filters.skill || haystack.includes(filters.skill.toLowerCase()))
      && (!filters.difficulty || text(question.difficulty).toLowerCase() === filters.difficulty.toLowerCase())
      && (!filters.exam || exams.includes(filters.exam.toLowerCase()))
      && (!filters.query || haystack.includes(filters.query));
  });
  state.i = 0;
  state.selected = null;
  state.checked = false;
  render();
}

function saveProgress(question, correct){
  const key = 'ah_aptitude_progress_v2';
  const current = JSON.parse(localStorage.getItem(key) || '[]');
  current.push({
    id:question.id,
    correct,
    skill:question.skill || question.skillCategory,
    difficulty:question.difficulty,
    at:new Date().toISOString()
  });
  localStorage.setItem(key, JSON.stringify(current.slice(-1200)));
}

function setOptions(selectId, items, label){
  const select = $(selectId);
  if(!select) return;
  select.innerHTML = `<option value="">${label}</option>` + items.map((item)=>`<option value="${item}">${item}</option>`).join('');
}

function populateFilters(){
  const skills = [...new Set(state.questions.map((q)=>q.skill || q.skillCategory).filter(Boolean))].sort();
  const difficulties = [...new Set(state.questions.map((q)=>q.difficulty).filter(Boolean))].sort();
  const exams = [...new Set(state.questions.flatMap((q)=>q.examTags || []).filter(Boolean))].sort();

  setOptions('#skillFilter', skills, 'All skills');
  setOptions('#difficultyFilter', difficulties, 'All levels');
  setOptions('#examFilter', exams, 'All exams');

  const params = new URLSearchParams(window.location.search);
  const skillParam = (params.get('skill') || '').toLowerCase();
  if(skillParam){
    const match = skills.find((skill)=>skill.toLowerCase().includes(skillParam));
    if(match && $('#skillFilter')) $('#skillFilter').value = match;
  }
}

function updateStats(){
  if($('#totalQuestions')) $('#totalQuestions').textContent = state.filtered.length || 0;
  if($('#attempted')) $('#attempted').textContent = state.stats.attempted;
  if($('#correct')) $('#correct').textContent = state.stats.correct;
  if($('#wrong')) $('#wrong').textContent = state.stats.wrong;
}

function render(){
  const app = $('[data-practice-app]');
  if(!app) return;

  if(!state.filtered.length){
    app.innerHTML = `
      <div class="card">
        <h2>No questions found</h2>
        <p class="muted">Change filters or add more questions to the data folder.</p>
        <button class="btn secondary" data-clear-empty>Reset filters</button>
      </div>
    `;
    $('[data-clear-empty]', app)?.addEventListener('click', resetFilters);
    updateStats();
    return;
  }

  const question = state.filtered[state.i];
  const options = normaliseOptions(question);
  const answer = answerId(question);
  const explanation = text(question.shortExplanation || question.explanation || question.fullExplanation?.correctAnswer);

  app.innerHTML = `
    <article class="question-card panel">
      <div class="qmeta">
        <span class="pill">Question ${state.i + 1} of ${state.filtered.length}</span>
        <span class="pill">${text(question.skill || question.skillCategory) || 'Aptitude'}</span>
        <span class="pill">${text(question.difficulty) || 'Practice'}</span>
        <span class="pill">${text(question.questionType || question.topic) || 'Mixed'}</span>
      </div>
      <div class="question-text">${text(question.questionText)}</div>
      <div class="options">
        ${options.map((option)=>{
          let cls = 'option';
          if(state.selected === option.id) cls += ' selected';
          if(state.checked && option.id === answer) cls += ' correct';
          if(state.checked && state.selected === option.id && option.id !== answer) cls += ' wrong';
          return `<button class="${cls}" data-opt="${option.id}"><strong>${option.id}.</strong> ${text(option.text)}</button>`;
        }).join('')}
      </div>
      <div class="toolbar">
        <button class="btn primary" data-check ${state.checked ? 'disabled' : ''}>Check Answer</button>
        <button class="btn secondary" data-prev ${state.i === 0 ? 'disabled' : ''}>Previous</button>
        <button class="btn secondary" data-next>Next</button>
        <button class="btn ghost" data-bookmark>Bookmark</button>
      </div>
      <div class="explain ${state.checked ? '' : 'hidden'}">
        <h3>${state.selected === answer ? 'Correct. Keep going.' : 'Review this question.'}</h3>
        <p><strong>Answer:</strong> ${answer}</p>
        <p>${explanation || 'Explanation will appear here when added to the question bank.'}</p>
        ${question.commonMistake ? `<p><strong>Common mistake:</strong> ${text(question.commonMistake)}</p>` : ''}
        ${question.learnMoreUrl ? `<p><a class="btn secondary" href="${siteUrl(question.learnMoreUrl)}">Learn this concept</a></p>` : ''}
      </div>
    </article>
  `;

  $$('.option', app).forEach((button)=>{
    button.addEventListener('click',()=>{
      if(state.checked) return;
      state.selected = button.dataset.opt;
      render();
    });
  });

  $('[data-check]', app)?.addEventListener('click',()=>{
    if(!state.selected){
      window.alert('Please select an option first.');
      return;
    }
    state.checked = true;
    state.stats.attempted += 1;
    const correct = state.selected === answer;
    if(correct) state.stats.correct += 1;
    else state.stats.wrong += 1;
    saveProgress(question, correct);
    render();
  });

  $('[data-prev]', app)?.addEventListener('click',()=>{
    state.i = Math.max(0, state.i - 1);
    state.selected = null;
    state.checked = false;
    render();
  });

  $('[data-next]', app)?.addEventListener('click',()=>{
    state.i = (state.i + 1) % state.filtered.length;
    state.selected = null;
    state.checked = false;
    render();
  });

  $('[data-bookmark]', app)?.addEventListener('click',()=>{
    state.stats.bookmarked += 1;
    localStorage.setItem(`ah_bookmark_${question.id || question._index}`, JSON.stringify(question));
    updateStats();
    window.alert('Bookmarked for revision.');
  });

  updateStats();
}

function resetFilters(){
  ['#skillFilter','#difficultyFilter','#examFilter','#practiceSearch'].forEach((id)=>{
    const el = $(id);
    if(el) el.value = '';
  });
  applyFilters();
}

async function init(){
  const app = $('[data-practice-app]');
  if(!app) return;

  try{
    app.innerHTML = '<div class="loading">Loading practice...</div>';
    state.questions = await loadQuestionBank();
    state.filtered = [...state.questions];
    populateFilters();
    applyFilters();

    ['#skillFilter','#difficultyFilter','#examFilter'].forEach((id)=>{
      $(id)?.addEventListener('change', applyFilters);
    });
    $('#practiceSearch')?.addEventListener('input', applyFilters);
    $('#resetFilters')?.addEventListener('click', resetFilters);
  }catch(error){
    console.error(error);
    app.innerHTML = `
      <div class="card">
        <h2>Practice could not load</h2>
        <p class="muted">${error.message}</p>
        <p>Check that <span class="kbd">data/questions.json</span> and imported question files exist.</p>
      </div>
    `;
  }
}

document.addEventListener('DOMContentLoaded', init);
