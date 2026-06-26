import { siteUrl } from "./path-utils.js";

export const DATA_VERSION = "aptitude-20260626-01";

const cache = new Map();

export async function fetchJson(path, { cacheBust = true } = {}) {
  const cleanPath = String(path || "").replace(/^\/+/, "");
  const url = siteUrl(cleanPath);
  const finalUrl = cacheBust
    ? `${url}${url.includes("?") ? "&" : "?"}v=${encodeURIComponent(DATA_VERSION)}`
    : url;

  if (cache.has(finalUrl)) return cache.get(finalUrl);

  const promise = fetch(finalUrl, { cache: "no-store" }).then(async (response) => {
    if (!response.ok) {
      throw new Error(`Could not load ${finalUrl}. Status: ${response.status}`);
    }
    try {
      return await response.json();
    } catch (error) {
      throw new Error(`Invalid JSON in ${finalUrl}: ${error.message}`);
    }
  });

  cache.set(finalUrl, promise);
  return promise;
}

export function normalizeOption(option, index = 0) {
  const fallbackId = String.fromCharCode(65 + index);
  if (typeof option === "string") return { id: fallbackId, text: option };
  return {
    id: String(option?.id || option?.label || fallbackId).trim(),
    text: String(option?.text || option?.value || option?.answer || "").trim()
  };
}

export function normalizeQuestion(question, index = 0) {
  const options = Array.isArray(question?.options)
    ? question.options.map(normalizeOption).filter((option) => option.text)
    : [];

  const correctAnswer = String(question?.correctAnswer || question?.answer || "").trim();

  return {
    ...question,
    id: String(question?.id || `question-${index + 1}`).trim(),
    skillCategory: String(question?.skillCategory || "aptitude").trim(),
    skill: String(question?.skill || question?.skillCategory || "general-aptitude").trim(),
    topic: String(question?.topic || "general-practice").trim(),
    subTopic: String(question?.subTopic || question?.topic || "core").trim(),
    level: String(question?.level || "Core").trim(),
    difficulty: String(question?.difficulty || "Medium").trim(),
    questionType: String(question?.questionType || "MCQ").trim(),
    questionText: String(question?.questionText || question?.question || "").trim(),
    options,
    correctAnswer,
    shortExplanation: String(question?.shortExplanation || question?.explanation || "").trim(),
    fullExplanation: question?.fullExplanation || null,
    commonMistake: String(question?.commonMistake || "").trim(),
    examTags: Array.isArray(question?.examTags) ? question.examTags : [],
    keywords: Array.isArray(question?.keywords) ? question.keywords : [],
    status: String(question?.status || "New").trim()
  };
}

export function isValidQuestion(question) {
  return Boolean(
    question &&
    question.id &&
    question.questionText &&
    Array.isArray(question.options) &&
    question.options.length >= 2 &&
    question.correctAnswer
  );
}

export async function loadQuestionBank() {
  const main = await fetchJson("data/questions.json");
  const importedQuestions = [];

  if (Array.isArray(main?.imports)) {
    for (const importPath of main.imports) {
      const pack = await fetchJson(importPath);
      if (Array.isArray(pack?.questions)) importedQuestions.push(...pack.questions);
      else if (Array.isArray(pack)) importedQuestions.push(...pack);
    }
  }

  const directQuestions = Array.isArray(main?.questions) ? main.questions : [];
  const merged = [...directQuestions, ...importedQuestions]
    .map(normalizeQuestion)
    .filter(isValidQuestion);

  const unique = [];
  const seen = new Set();
  for (const question of merged) {
    if (seen.has(question.id)) continue;
    seen.add(question.id);
    unique.push(question);
  }
  return unique;
}

export async function loadSkills() {
  const data = await fetchJson("data/skills.json").catch(() => []);
  return Array.isArray(data) ? data : data.skills || data.categories || [];
}

export async function loadTopics() {
  const data = await fetchJson("data/topics.json").catch(() => []);
  return Array.isArray(data) ? data : data.topics || [];
}

export async function loadAllData() {
  const [questions, skills, topics] = await Promise.all([
    loadQuestionBank().catch((error) => {
      console.error(error);
      return [];
    }),
    loadSkills(),
    loadTopics()
  ]);
  return { questions, skills, topics };
}

if (typeof window !== "undefined") {
  window.AHData = { fetchJson, loadQuestionBank, loadSkills, loadTopics, loadAllData, normalizeQuestion };
}
