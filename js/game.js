const params = new URLSearchParams(window.location.search);
const themeId = params.get("theme");

const themeTitle = document.getElementById("themeTitle");
const themeDescription = document.getElementById("themeDescription");
const answerInput = document.getElementById("answerInput");
const judgeButton = document.getElementById("judgeButton");
const giveUpButton = document.getElementById("giveUpButton");
const resumeButton = document.getElementById("resumeButton");
const status = document.getElementById("status");
const count = document.getElementById("count");
const answeredList = document.getElementById("answeredList");
const allAnswersTitle = document.getElementById("allAnswersTitle");
const allAnswers = document.getElementById("allAnswers");
const hintToggle = document.getElementById("hintToggle");

// リザルト表示用
const result = document.getElementById("result");
const resultTitle = document.getElementById("resultTitle");
const resultSummary = document.getElementById("resultSummary");


let correctAnswers = [];
let answeredSet = new Set();
let lastAnswered = null;
let duplicateAnswers = null;
let wrongCount = 0;

let isGameOver = false;

let aliases = {};

function loadTheme(themeId) {
  return fetch("data/index.json")
    .then(res => res.json())
    .then(index => {
      const theme = index.themes.find(t => t.id === themeId);
      if (!theme) throw new Error("Theme not found");
      return theme;
    });
}

loadTheme(themeId)
  .then(theme => {
    themeTitle.textContent = theme.title;
    themeDescription.innerHTML = theme.description || "";

    return fetch(`data/bases/${theme.base}.json`)
      .then(res => res.json())
      .then(base => ({ theme, base }));
  })
  .then(({ theme, base }) => {
    const filtered = applyFilter(base.answers, theme.filter);

    correctAnswers = filtered.map(a => a.name);

    aliases = {};
    filtered.forEach(a => {
      aliases[a.name] = a.aliases || [];
    });

    updateCount();
  });

function applyFilter(answers, filter) {
  if (!filter) return answers;

  return answers.filter(a => {
    if (filter.tags) {
      return a.tags?.some(tag => filter.tags.includes(tag));
    }
    return true;
  });
}

function normalize(str) {
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "");
}

function resolveAnswers(input) {
  const normInput = normalize(input);
  const results = new Set();

  // 正式名一致
  for (const ans of correctAnswers) {
    if (normalize(ans) === normInput) {
      results.add(ans);
    }
  }

  // 別名一致
  for (const [official, aliasList] of Object.entries(aliases)) {
    for (const alias of aliasList) {
      if (normalize(alias) === normInput) {
        results.add(official);
      }
    }
  }

  return Array.from(results);
}


function updateCount() {
  count.textContent =
    `正解数: ${answeredSet.size} / ${correctAnswers.length}　誤答数: ${wrongCount}`;
}

function renderAnsweredList() {
  answeredList.innerHTML = "";

  correctAnswers.forEach(ans => {
    if (answeredSet.has(ans)) {
      const li = document.createElement("li");
      li.textContent = ans;

      if (lastAnswered && lastAnswered.includes(ans)) {
        li.classList.add("recent");
      } else if (duplicateAnswers && duplicateAnswers.includes(ans)) {
        li.classList.add("duplicate");
      }

      answeredList.appendChild(li);
    } else if (hintToggle.checked) {
      // ヒント表示（未解答の項目分スペースを開ける）
      const li = document.createElement("li");
      li.classList.add("hint-placeholder");
      answeredList.appendChild(li);
    }
  });
}

function judge() {
  if (isGameOver) return;

  const input = answerInput.value;
  if (!input.trim()) return;

  const resolvedList = resolveAnswers(input);

  if (resolvedList.length === 0) {
    wrongCount++;
    status.textContent = `不正解… : ${input}`;
    status.className = "status ng";
    answerInput.value = "";
    updateCount();
    return;
  }

  // 新しく正解になったものだけ追加
  const newlyAnswered = resolvedList.filter(
    ans => !answeredSet.has(ans)
  );

  if (newlyAnswered.length === 0) {
    status.innerHTML = `すでに解答済みです : ${input}<br><small>${resolvedList.join("<br>")}</small>`;
    status.className = "status ng";
    duplicateAnswers = resolvedList;
    lastAnswered = null;
    renderAnsweredList();
  } else {
    newlyAnswered.forEach(ans => answeredSet.add(ans));
    lastAnswered = newlyAnswered;
    duplicateAnswers = null;
    renderAnsweredList();
    const resultMsg = newlyAnswered.length > 1
      ? `${newlyAnswered.length} 件正解！ : ${input}`
      : `正解！ : ${input}`;
    status.innerHTML = `${resultMsg}<br><small>${resolvedList.join("<br>")}</small>`;
    status.className = "status ok";
  }

  answerInput.value = "";
  updateCount();

  // 全問正解チェック
  if (answeredSet.size === correctAnswers.length) {
    showResult("clear");
  }
}


let isComposing = false;

// IME変換中フラグ管理
answerInput.addEventListener("compositionstart", () => {
  isComposing = true;
});

answerInput.addEventListener("compositionend", () => {
  isComposing = false;
});

// Enterキー対応（IME考慮）
answerInput.addEventListener("keydown", e => {
  if (e.key === "Enter" && !isComposing) {
    judge();
  }
});

judgeButton.addEventListener("click", judge);

// ヒントトグル
hintToggle.addEventListener("change", renderAnsweredList);

// ギブアップ
giveUpButton.addEventListener("click", () => {
  if (isGameOver) return;
  isGameOver = true;

  // 入力不可に
  answerInput.disabled = true;
  judgeButton.disabled = true;
  hintToggle.disabled = true;

  status.textContent = "ギブアップしました";
  status.className = "status ng";

  allAnswersTitle.style.display = "block";
  allAnswers.style.display = "block";
  allAnswers.innerHTML = "";

  correctAnswers.forEach(a => {
    const li = document.createElement("li");
    li.textContent = a;

    if (answeredSet.has(a)) {
      li.classList.add("answer-ok");
    } else {
      li.classList.add("answer-ng");
    }

    allAnswers.appendChild(li);
  });
  showResult("giveup");
});

// 続きから再開
resumeButton.addEventListener("click", () => {
  isGameOver = false;

  answerInput.disabled = false;
  judgeButton.disabled = false;
  hintToggle.disabled = false;
  answerInput.focus();

  status.textContent = "再開しました。続けて解答してください。";
  status.className = "status ok";

  // 全解答・リザルトを隠す
  allAnswersTitle.style.display = "none";
  allAnswers.style.display = "none";
  result.style.display = "none";
  document.getElementById("answeredSection").style.display = "";
});

function showResult(type) {
  // 入力停止
  isGameOver = true;
  answerInput.disabled = true;
  judgeButton.disabled = true;
  hintToggle.disabled = true;

  result.style.display = "block";
  // ★ 解答済みリストを非表示
  document.getElementById("answeredSection").style.display = "none";

  if (type === "clear") {
    resultTitle.textContent = "🎉 全問正解！";
    resultSummary.textContent =
      `${correctAnswers.length} 問すべて正解！（誤答: ${wrongCount} 回）`;
    resumeButton.style.display = "none";
  }

  if (type === "giveup") {
    resultTitle.textContent = "ギブアップ";
    resultSummary.textContent =
      `${answeredSet.size} / ${correctAnswers.length} 問 正解（誤答: ${wrongCount} 回）`;
    resumeButton.style.display = "inline-block";
  }
}
