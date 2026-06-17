import { siteUrl, stripBasePath } from "./path-utils.js";

const DATA_FILES = {
  skills: "data/skills.json",
  topics: "data/topics.json",
  questions: "data/questions.json",
  search: "data/search-index.json",
  progress: "data/progress-sample.json"
};

const REQUIRED_QUESTION_FIELDS = [
  "id",
  "skillCategory",
  "skill",
  "topic",
  "subTopic",
  "level",
  "difficulty",
  "questionType",
  "questionText",
  "options",
  "correctAnswer",
  "shortExplanation",
  "fullExplanation",
  "commonMistake",
  "learnMoreUrl",
  "examTags",
  "status"
];

export async function loadSiteData() {
  const [skillsData, topicsData, questionData, searchIndex, progress] = await Promise.all([
    fetchJson(DATA_FILES.skills),
    fetchJson(DATA_FILES.topics),
    fetchJson(DATA_FILES.questions),
    fetchJson(DATA_FILES.search),
    fetchJson(DATA_FILES.progress)
  ]);

  const importedQuestions = await loadQuestionPacks(questionData.imports || []);
  const questions = validateAndMergeQuestions([...(questionData.questions || []), ...importedQuestions]);
  const enriched = enrichCounts(skillsData, topicsData, questions);

  return {
    ...enriched,
    questions,
    searchSeed: searchIndex.staticRecords || [],
    progress
  };
}

async function fetchJson(path) {
  const response = await fetch(siteUrl(path));
  if (!response.ok) {
    throw new Error(`Could not load ${path}: ${response.status}`);
  }
  return response.json();
}

async function loadQuestionPacks(imports) {
  const packs = await Promise.all(imports.map(async (path) => {
    try {
      const pack = await fetchJson(path);
      return Array.isArray(pack.questions) ? pack.questions : [];
    } catch (error) {
      console.warn(`[question-import] Skipped ${path}.`, error);
      return [];
    }
  }));
  return packs.flat();
}

function validateAndMergeQuestions(items) {
  const seen = new Set();
  const valid = [];

  for (const question of items) {
    const result = validateQuestion(question, seen);
    if (result.ok) {
      seen.add(question.id);
      valid.push(question);
    } else {
      console.warn(`[question-validation] Skipped question ${question?.id || "(missing id)"}: ${result.reason}`);
    }
  }

  return valid;
}

function validateQuestion(question, seen) {
  if (!question || typeof question !== "object") {
    return { ok: false, reason: "Question is not an object." };
  }

  for (const field of REQUIRED_QUESTION_FIELDS) {
    if (question[field] === undefined || question[field] === null || question[field] === "") {
      return { ok: false, reason: `Missing required field: ${field}.` };
    }
  }

  if (seen.has(question.id)) {
    return { ok: false, reason: "Duplicate id." };
  }

  if (!Array.isArray(question.options) || question.options.length < 2) {
    return { ok: false, reason: "At least two options are required." };
  }

  const optionIds = question.options.map((option) => option.id);
  if (!optionIds.includes(question.correctAnswer)) {
    return { ok: false, reason: "correctAnswer must match an option id." };
  }

  if (!question.shortExplanation || typeof question.shortExplanation !== "string") {
    return { ok: false, reason: "shortExplanation must be text." };
  }

  if (!question.learnMoreUrl || /^(https?:|mailto:|tel:)/i.test(question.learnMoreUrl)) {
    return { ok: false, reason: "learnMoreUrl must be a site-relative URL." };
  }

  return { ok: true };
}

function enrichCounts(skillsData, topicsData, questions) {
  const categories = (skillsData.categories || []).map((category) => {
    const relatedSkills = (skillsData.skills || []).filter((skill) => skill.categoryId === category.id);
    const relatedTopics = (topicsData.topics || []).filter((topic) => topic.skillCategory === category.id);
    const relatedQuestions = questions.filter((question) => question.skillCategory === category.id);
    return {
      ...category,
      skillCount: relatedSkills.length,
      topicCount: relatedTopics.length,
      questionCount: relatedQuestions.length
    };
  });

  const skills = (skillsData.skills || []).map((skill) => {
    const relatedTopics = (topicsData.topics || []).filter((topic) => topic.skill === skill.id);
    const relatedQuestions = questions.filter((question) => question.skill === skill.id);
    return {
      ...skill,
      topicCount: relatedTopics.length,
      questionCount: relatedQuestions.length
    };
  });

  const topics = (topicsData.topics || []).map((topic) => {
    const relatedQuestions = questions.filter((question) => question.topic === topic.id);
    const subTopics = (topic.subTopics || []).map((subTopic) => ({
      ...subTopic,
      questionCount: relatedQuestions.filter((question) => question.subTopic === subTopic.id).length
    }));
    return {
      ...topic,
      subTopics,
      questionCount: relatedQuestions.length
    };
  });

  return {
    levels: skillsData.levels || [],
    categories,
    skills,
    topics
  };
}

export function slugFromPathname(pathname = window.location.pathname) {
  return stripBasePath(pathname)
    .replace(/\/index\.html$/, "/")
    .replace(/^\/+|\/+$/g, "")
    .split("/")
    .filter(Boolean);
}

export function getCategory(data, categorySlugOrId) {
  return data.categories.find((category) => category.slug === categorySlugOrId || category.id === categorySlugOrId);
}

export function getTopic(data, topicSlugOrId) {
  return data.topics.find((topic) => topic.slug === topicSlugOrId || topic.id === topicSlugOrId);
}

export function getSubTopic(topic, subTopicSlugOrId) {
  return (topic?.subTopics || []).find((subTopic) => subTopic.slug === subTopicSlugOrId || subTopic.id === subTopicSlugOrId);
}

export function getQuestions(data, filters = {}) {
  return data.questions.filter((question) => {
    return Object.entries(filters).every(([key, value]) => {
      if (!value || value === "all") return true;
      if (key === "exam") return (question.examTags || []).includes(value);
      return question[key] === value;
    });
  });
}

export function buildSearchRecords(data) {
  const records = [];

  for (const category of data.categories) {
    records.push({
      id: `category-${category.id}`,
      type: "Skill",
      title: category.name,
      path: category.url,
      skillPath: category.name,
      description: category.description,
      keywords: [category.name, category.description, category.level, "skill category"],
      actions: [
        { label: "Study Skill", href: category.url },
        { label: "Practice Questions", href: category.practiceUrl || "practice/" }
      ]
    });
  }

  for (const skill of data.skills) {
    const category = getCategory(data, skill.categoryId);
    records.push({
      id: `skill-${skill.id}`,
      type: "Skill",
      title: skill.name,
      path: skill.url,
      skillPath: `${category?.name || skill.categoryId} > ${skill.name}`,
      description: skill.description,
      keywords: [skill.name, skill.description, skill.level, "skill"],
      actions: [
        { label: "Related Skill", href: skill.url },
        { label: "Practice Bank", href: skill.practiceUrl || "practice/" }
      ]
    });
  }

  for (const topic of data.topics) {
    const category = getCategory(data, topic.skillCategory);
    const skill = data.skills.find((item) => item.id === topic.skill);
    records.push({
      id: `topic-${topic.id}`,
      type: "Topic",
      title: topic.name,
      path: topic.url,
      skillPath: `${category?.name || topic.skillCategory} > ${skill?.name || topic.skill} > ${topic.name}`,
      description: topic.description,
      keywords: [topic.name, topic.description, topic.level, "topic", ...(topic.keywords || [])],
      actions: [
        { label: "Study Topic", href: topic.url },
        { label: "Practice Questions", href: topic.practiceUrl }
      ]
    });

    for (const subTopic of topic.subTopics || []) {
      records.push({
        id: `subtopic-${subTopic.id}`,
        type: "Study Lesson",
        title: subTopic.name,
        path: subTopic.url,
        skillPath: `${category?.name || topic.skillCategory} > ${skill?.name || topic.skill} > ${topic.name} > ${subTopic.name}`,
        description: subTopic.description,
        keywords: [
          subTopic.name,
          subTopic.description,
          subTopic.study?.simpleMeaning,
          subTopic.study?.whyItMatters,
          ...(subTopic.study?.strategy || []),
          ...(subTopic.keywords || [])
        ],
        actions: [
          { label: "Study Topic", href: subTopic.url },
          { label: "Practice Questions", href: `${topic.practiceUrl}?subTopic=${subTopic.id}` }
        ]
      });
    }
  }

  for (const question of data.questions) {
    const topic = getTopic(data, question.topic);
    const category = getCategory(data, question.skillCategory);
    const skill = data.skills.find((item) => item.id === question.skill);
    const subTopic = getSubTopic(topic, question.subTopic);
    records.push({
      id: `question-${question.id}`,
      type: "Question",
      title: `Practice question: ${subTopic?.name || question.subTopic}`,
      path: `${topic?.practiceUrl || "practice/"}?question=${question.id}`,
      skillPath: `${category?.name || question.skillCategory} > ${skill?.name || question.skill} > ${topic?.name || question.topic} > ${subTopic?.name || question.subTopic}`,
      description: question.questionText,
      keywords: [
        question.questionText,
        question.shortExplanation,
        question.commonMistake,
        question.difficulty,
        question.level,
        question.status,
        ...(question.keywords || []),
        ...(question.examTags || [])
      ],
      actions: [
        { label: "Practice Questions", href: `${topic?.practiceUrl || "practice/"}?question=${question.id}` },
        { label: "Study Topic", href: question.learnMoreUrl }
      ]
    });
  }

  for (const seed of data.searchSeed) {
    records.push(seed);
  }

  return records;
}

export function searchRecords(records, query) {
  const value = query.trim().toLowerCase();
  if (!value) {
    return records.slice(0, 8);
  }

  const terms = value.split(/\s+/).filter(Boolean);
  return records
    .map((record) => {
      const haystack = [
        record.title,
        record.type,
        record.skillPath,
        record.description,
        ...(record.keywords || [])
      ].join(" ").toLowerCase();
      const score = terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);
      return { record, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.record.title.localeCompare(b.record.title))
    .map((item) => item.record);
}
