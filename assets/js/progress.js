const $=(s,r=document)=>r.querySelector(s);
function init(){
 const data=JSON.parse(localStorage.getItem('ah_aptitude_progress_v1')||'[]');
 const total=data.length, correct=data.filter(x=>x.correct).length, wrong=total-correct, acc=total?Math.round(correct*100/total):0;
 $('#pTotal') && ($('#pTotal').textContent=total); $('#pCorrect') && ($('#pCorrect').textContent=correct); $('#pWrong') && ($('#pWrong').textContent=wrong); $('#pAccuracy') && ($('#pAccuracy').textContent=acc+'%');
 const table=$('[data-progress-table]'); if(table){
  table.innerHTML=data.slice(-50).reverse().map(r=>`<tr><td>${r.id}</td><td>${r.skill||''}</td><td>${r.difficulty||''}</td><td>${r.correct?'Correct':'Wrong'}</td><td>${new Date(r.at).toLocaleString()}</td></tr>`).join('') || '<tr><td colspan="5">No attempts yet. Start practice first.</td></tr>';
 }
 $('#clearProgress')?.addEventListener('click',()=>{if(confirm('Clear all local progress?')){localStorage.removeItem('ah_aptitude_progress_v1');location.reload();}});
}
document.addEventListener('DOMContentLoaded',init);
