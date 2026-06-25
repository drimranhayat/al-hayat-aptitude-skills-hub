(function(){
  const $=(s,r=document)=>r.querySelector(s); const $$=(s,r=document)=>Array.from(r.querySelectorAll(s));
  function isGitHubPremium(){return location.hostname.endsWith('github.io') && location.pathname.split('/').filter(Boolean)[0]==='premium'}
  function prefix(){const parts=location.pathname.split('/').filter(Boolean); if(isGitHubPremium()) return parts.slice(1).length>0?'../':''; return parts.length>0?'../':'';}
  async function getJSON(file){const r=await fetch(prefix()+'data/'+file); if(!r.ok) throw new Error(file); return r.json();}
  function esc(s){return String(s??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]))}
  async function initPractice(){
    const quizBox=$('#practiceQuizBox'); const drillBox=$('#practiceDrillBox');
    if(!quizBox && !drillBox) return;
    const [quizzes,drills]=await Promise.all([getJSON('vsa-quizzes.json').catch(()=>[]),getJSON('vsa-drills.json').catch(()=>[])]);
    const moduleSel=$('#practiceModule');
    if(moduleSel){
      const mods=[...new Map(quizzes.map(q=>[q.moduleId,q.moduleTitle||q.moduleId])).entries()];
      moduleSel.innerHTML='<option value="all">All modules</option>'+mods.map(([id,t])=>`<option value="${esc(id)}">${esc(t)}</option>`).join('');
    }
    function renderQuiz(){
      if(!quizBox) return;
      const q=($('#practiceSearch')?.value||'').toLowerCase().trim();
      const mod=$('#practiceModule')?.value||'all'; const lev=$('#practiceLevel')?.value||'all'; const limit=parseInt($('#practiceLimit')?.value||'30',10);
      let list=quizzes.filter(x=>(mod==='all'||x.moduleId===mod)&&(lev==='all'||String(x.difficulty).toLowerCase()===lev.toLowerCase()));
      if(q) list=list.filter(x=>JSON.stringify(x).toLowerCase().includes(q));
      const shown=list.slice(0,limit);
      $('#practiceStats').innerHTML=`<span class="pill">${list.length} matching questions</span><span class="pill">${shown.length} shown</span><span class="pill">${quizzes.length} total MCQs</span>`;
      quizBox.innerHTML=shown.map((x,i)=>`<details class="card lesson-card"><summary><span><strong>${esc(x.question)}</strong><small class="muted">${esc(x.difficulty)} • ${esc(x.skillTested||'VSA reasoning')}</small></span><span class="pill">Answer</span></summary><div class="lesson-body"><p class="chart-note"><strong>Chart example:</strong> ${esc(x.chartScenario||'Read the bar in context before naming it.')}</p><div class="option-list">${(x.options||[]).map(o=>`<button class="quiz-choice" data-correct="${esc(x.answer)}">${esc(o)}</button>`).join('')}</div><p class="muted answer-line"></p><h4>Clear explanation</h4><p>${esc(x.explanation)}</p><h4>Strategy</h4><p>${esc(x.clearStrategy||'Use background, level, signal, confirmation, invalidation.')}</p><p class="muted"><strong>Risk note:</strong> ${esc(x.riskNote)}</p></div></details>`).join('')||'<p class="muted">No matching questions.</p>';
      $$('.quiz-choice',quizBox).forEach(b=>b.addEventListener('click',()=>{const ok=b.textContent===b.dataset.correct; b.classList.add(ok?'correct':'wrong'); const line=b.closest('.lesson-body').querySelector('.answer-line'); line.textContent=(ok?'Correct: ':'Review: ') + b.dataset.correct;}));
    }
    function renderDrills(){
      if(!drillBox) return;
      const q=($('#drillSearch')?.value||'').toLowerCase().trim(); const lev=$('#drillLevel')?.value||'all'; const limit=parseInt($('#drillLimit')?.value||'20',10);
      let list=drills.filter(x=>lev==='all'||String(x.difficulty).toLowerCase()===lev.toLowerCase()); if(q) list=list.filter(x=>JSON.stringify(x).toLowerCase().includes(q)); list=list.slice(0,limit);
      drillBox.innerHTML=list.map(x=>`<details class="card"><summary><span><strong>${esc(x.title)}</strong><small class="muted">${esc(x.difficulty)} • ${esc(x.type)}</small></span><span class="pill">Open drill</span></summary><div class="lesson-body"><h4>Chart scenario</h4><p>${esc(x.chartScenario)}</p><h4>Student task</h4><p>${esc(x.studentTask)}</p><h4>Ideal answer</h4><p>${esc(x.idealAnswer)}</p><h4>Common wrong answer</h4><p>${esc(x.commonWrongAnswer)}</p><h4>Teacher note</h4><p>${esc(x.teacherNote)}</p>${Array.isArray(x.practiceChecklist)?`<h4>Checklist</h4><ul>${x.practiceChecklist.map(i=>`<li>${esc(i)}</li>`).join('')}</ul>`:''}<p class="muted"><strong>Risk note:</strong> ${esc(x.riskNote)}</p></div></details>`).join('')||'<p class="muted">No matching drills.</p>';
    }
    ['practiceSearch','practiceModule','practiceLevel','practiceLimit'].forEach(id=>$('#'+id)?.addEventListener('input',renderQuiz));
    ['practiceSearch','practiceModule','practiceLevel','practiceLimit'].forEach(id=>$('#'+id)?.addEventListener('change',renderQuiz));
    ['drillSearch','drillLevel','drillLimit'].forEach(id=>$('#'+id)?.addEventListener('input',renderDrills));
    ['drillSearch','drillLevel','drillLimit'].forEach(id=>$('#'+id)?.addEventListener('change',renderDrills));
    renderQuiz(); renderDrills();
  }
  document.addEventListener('DOMContentLoaded',initPractice);
})();
