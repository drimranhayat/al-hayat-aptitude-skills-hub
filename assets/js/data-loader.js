import { siteUrl } from './path-utils.js';

const DATA_VERSION = '2026-06-26-pro-ui-v2';
const cache = new Map();

export async function loadJSON(path){
  const clean = String(path).replace(/^\/+/, '');
  if(cache.has(clean)) return cache.get(clean);

  const url = siteUrl(clean);
  const finalUrl = `${url}${url.includes('?') ? '&' : '?'}v=${encodeURIComponent(DATA_VERSION)}`;

  const request = fetch(finalUrl, { cache:'no-store' }).then(async (response)=>{
    if(!response.ok){
      throw new Error(`Could not load ${finalUrl}. Status: ${response.status}`);
    }
    return response.json();
  });

  cache.set(clean, request);
  return request;
}

export async function loadQuestionBank(){
  const main = await loadJSON('data/questions.json');
  let questions = Array.isArray(main.questions) ? [...main.questions] : [];

  if(Array.isArray(main.imports)){
    for(const importPath of main.imports){
      const pack = await loadJSON(importPath);
      if(Array.isArray(pack.questions)){
        questions.push(...pack.questions);
      }
    }
  }

  return questions.map((question, index)=>({ ...question, _index:index }));
}

export async function loadSkills(){ return loadJSON('data/skills.json'); }
export async function loadTopics(){ return loadJSON('data/topics.json'); }
