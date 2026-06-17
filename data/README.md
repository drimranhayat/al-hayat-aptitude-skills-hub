# Data Guide

This site is data-driven. Add future content in these files instead of rewriting page layouts.

## Main Files

- `skills.json`: learner levels, skill category cards, and skill records.
- `topics.json`: topic cards, sub-topic lessons, study-page content, and URLs.
- `questions.json`: the live question bank.
- `search-index.json`: static search records such as resources, mini tests, and mistake reviews.
- `progress-sample.json`: mock progress data for the progress page.
- `question-import-sample.json`: copyable question format for future uploads.

## Adding Questions

Add new question objects to `data/questions.json` under `questions`.

Required fields:

- `id`
- `skillCategory`
- `skill`
- `topic`
- `subTopic`
- `level`
- `difficulty`
- `questionType`
- `questionText`
- `options`
- `correctAnswer`
- `shortExplanation`
- `fullExplanation`
- `commonMistake`
- `similarQuestionIds`
- `learnMoreUrl`
- `examTags`
- `status`
- `keywords`

The browser validates every question. Broken records are skipped and a clear warning appears in the console, so one bad question should not break the website.

For future bulk packs, create files such as:

- `data/question-packs/logical-reasoning/assumption-reasoning.json`
- `data/question-packs/quantitative-skills/arithmetic.json`

Then add those paths to the `imports` array in `data/questions.json`.
