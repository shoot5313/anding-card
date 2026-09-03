const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const questionFiles = [
  "docs/TRIVIA_QUESTION_BANK.md",
  "docs/TRIVIA_NATURE_ADDITIONS.md",
  "docs/TRIVIA_ANIMAL_ADDITIONS.md",
  "docs/TRIVIA_ART_ADDITIONS.md",
];

const categoryByPrefix = {
  NAT: "nature",
  ANI: "animal",
  ART: "art",
};

function withoutChoicePrefix(value) {
  return value.replace(/^[ABC]\.[ \t]*/, "").trim();
}

function parseQuestionBlock(code, title, block, fallbackVerifiedOn) {
  function field(label) {
    const match = block.match(new RegExp("^- " + label + "：(.+)$", "m"));
    if (!match) throw new Error(`${code} is missing ${label}`);
    return match[1].trim();
  }

  const prefix = code.slice(0, 3);
  const number = Number(code.slice(4));
  const prompt = field("题目");
  const choices = field("选项").split(" / ").map(withoutChoicePrefix);
  const answerChoice = withoutChoicePrefix(field("答案"));
  const answerPage = field("答案页");
  const answerPageMatch = answerPage.match(/^答案是“(.+?)”。(.*)$/);
  const answerIndex = choices.indexOf(answerChoice);
  const sourceMatch = field("来源").match(/^\[(.+)\]\((https?:\/\/.+)\)$/);
  const verifiedMatch = block.match(/^- 核对日期：(.+)$/m);

  if (!categoryByPrefix[prefix]) throw new Error(`${code} has an unknown category`);
  if (!Number.isInteger(number) || number < 1) throw new Error(`${code} has an invalid number`);
  if (choices.length !== 3 || new Set(choices).size !== 3) throw new Error(`${code} must have three distinct choices`);
  if (answerIndex < 0) throw new Error(`${code} answer is not one of its choices`);
  if (!answerPageMatch) throw new Error(`${code} answer page must begin with the canonical answer`);
  if (answerPageMatch[1] !== answerChoice && !answerChoice.startsWith(answerPageMatch[1] + "（")) {
    throw new Error(`${code} answer page does not agree with its answer choice`);
  }
  if (!sourceMatch) throw new Error(`${code} has an invalid source`);

  return {
    id: categoryByPrefix[prefix] + "-" + String(number).padStart(3, "0"),
    code,
    number,
    category: categoryByPrefix[prefix],
    title,
    prompt,
    choices,
    answerIndex,
    answer: answerPageMatch[1],
    explanation: answerPageMatch[2],
    sourceLabel: sourceMatch[1],
    verifiedOn: verifiedMatch ? verifiedMatch[1].trim() : fallbackVerifiedOn,
  };
}

function parseQuestionFile(relative) {
  const markdown = fs.readFileSync(path.join(root, relative), "utf8");
  const fallbackDate = (markdown.match(/^核对日期：(.+)$/m) || [])[1];
  const headingPattern = /^### ((?:NAT|ANI|ART)-\d{3}) (.+)$/gm;
  const headings = Array.from(markdown.matchAll(headingPattern));

  return headings.map((heading, index) => {
    const blockStart = heading.index + heading[0].length;
    const blockEnd = index + 1 < headings.length ? headings[index + 1].index : markdown.length;
    return parseQuestionBlock(
      heading[1],
      heading[2].trim(),
      markdown.slice(blockStart, blockEnd),
      fallbackDate ? fallbackDate.trim() : "2026-09-03"
    );
  });
}

function loadQuestions() {
  const questions = questionFiles.flatMap(parseQuestionFile).sort((left, right) => {
    const categoryOrder = { nature: 0, animal: 1, art: 2 };
    return categoryOrder[left.category] - categoryOrder[right.category] || left.number - right.number;
  });
  const ids = new Set(questions.map((question) => question.id));
  const codes = new Set(questions.map((question) => question.code));
  const categoryCounts = questions.reduce((counts, question) => {
    counts[question.category] = (counts[question.category] || 0) + 1;
    return counts;
  }, {});
  const answerCounts = questions.reduce((counts, question) => {
    counts[question.answerIndex] += 1;
    return counts;
  }, [0, 0, 0]);

  if (questions.length !== 100 || ids.size !== 100 || codes.size !== 100) {
    throw new Error(`expected 100 unique questions, found ${questions.length}`);
  }
  if (categoryCounts.nature !== 34 || categoryCounts.animal !== 33 || categoryCounts.art !== 33) {
    throw new Error(`unexpected category counts: ${JSON.stringify(categoryCounts)}`);
  }
  if (answerCounts.join(",") !== "33,34,33") {
    throw new Error(`unexpected answer distribution: ${answerCounts.join(",")}`);
  }
  return questions;
}

function serializeQuestions(questions) {
  return [
    "/* Generated from docs/TRIVIA_*.md by scripts/build-trivia-data.cjs. */",
    "(function (root, factory) {",
    "  var questions = factory();",
    "  if (root) root.ANDING_TRIVIA = questions;",
    "  if (typeof module === \"object\" && module.exports) module.exports = questions;",
    "}(typeof window !== \"undefined\" ? window : this, function () {",
    "  return " + JSON.stringify(questions, null, 2).split("\n").join("\n  ") + ";",
    "}));",
    "",
  ].join("\n");
}

function buildTriviaData() {
  const questions = loadQuestions();
  fs.writeFileSync(path.join(root, "src", "trivia.js"), serializeQuestions(questions));
  return questions;
}

if (require.main === module) {
  const questions = buildTriviaData();
  const counts = questions.reduce((result, question) => {
    result[question.category] = (result[question.category] || 0) + 1;
    return result;
  }, {});
  process.stdout.write(`Generated ${questions.length} trivia questions ${JSON.stringify(counts)}\n`);
}

module.exports = { buildTriviaData, loadQuestions };
