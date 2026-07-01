const APP_CONFIG = window.APP_CONFIG || {};
const PASSCODE = APP_CONFIG.passcode || "reset-love";
const STORAGE_KEY = "conversation-reset-state";
const LOGS_KEY = "conversation-reset-logs";
const CHECKS_KEY = "conversation-reset-checks";
const WEBHOOK_URL = APP_CONFIG.webhookUrl || "";
const WEBHOOK_TOKEN = APP_CONFIG.webhookToken || "";

const defaultChecklist = [
  {
    title: "反論より理解を先に置く",
    note: "キレないでと言う前に、なぜその感情になったのかを見にいく。",
  },
  {
    title: "質問だけで済ませない",
    note: "ただ聞くのではなく、自分なりの仮説を添えて確認する。",
  },
  {
    title: "好意は行動で見られている",
    note: "自分のために何をしてくれたかで評価される前提を忘れない。",
  },
  {
    title: "比較で相手を下げない",
    note: "他人との比較は絶対NG。伝え方の雑さにも注意する。",
  },
];

const fieldIds = [
  "hypothesis-input",
  "question-input",
  "her-priorities",
  "action-signals",
  "my-priorities",
  "gap-input",
  "summary-input",
  "reflection-input",
  "next-action-input",
];

const gate = document.getElementById("gate");
const app = document.getElementById("app");
const passcodeInput = document.getElementById("passcode-input");
const gateMessage = document.getElementById("gate-message");
const logsContainer = document.getElementById("logs");
const saveMessage = document.getElementById("save-message");

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  } catch {
    return {};
  }
}

function persistState() {
  const nextState = {};
  for (const id of fieldIds) {
    nextState[id] = document.getElementById(id).value;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextState));
}

function restoreState() {
  const state = loadState();
  for (const id of fieldIds) {
    const field = document.getElementById(id);
    field.value = state[id] || "";
    field.addEventListener("input", persistState);
  }
}

function loadLogs() {
  try {
    return JSON.parse(localStorage.getItem(LOGS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveLogs(logs) {
  localStorage.setItem(LOGS_KEY, JSON.stringify(logs));
}

function renderLogs() {
  const logs = loadLogs();
  if (!logs.length) {
    logsContainer.innerHTML = '<p class="hint">まだ記録はありません。最初の1回を残しておくと、次からズレが見えやすくなります。</p>';
    return;
  }

  logsContainer.innerHTML = logs
    .slice()
    .reverse()
    .map(
      (log) => `
        <article class="log-item">
          <time>${new Date(log.savedAt).toLocaleString("ja-JP")}</time>
          <p><strong>要点:</strong> ${escapeHtml(log.summary || "未入力")}</p>
          <p><strong>振り返り:</strong> ${escapeHtml(log.reflection || "未入力")}</p>
          <p><strong>次のアクション:</strong> ${escapeHtml(log.nextAction || "未入力")}</p>
        </article>
      `,
    )
    .join("");
}

function renderChecklist() {
  const savedChecks = loadChecks();
  const container = document.getElementById("entry-checklist");
  container.innerHTML = defaultChecklist
    .map((item, index) => {
      const checked = savedChecks[index] ? "checked" : "";
      return `
        <label class="check-item">
          <input type="checkbox" data-check-index="${index}" ${checked} />
          <span>
            <strong>${item.title}</strong>
            <p>${item.note}</p>
          </span>
        </label>
      `;
    })
    .join("");

  container.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const nextChecks = [...container.querySelectorAll("input[type='checkbox']")].map((input) => input.checked);
      localStorage.setItem(CHECKS_KEY, JSON.stringify(nextChecks));
    });
  });
}

function loadChecks() {
  try {
    return JSON.parse(localStorage.getItem(CHECKS_KEY) || "[]");
  } catch {
    return [];
  }
}

function escapeHtml(text) {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;")
    .replaceAll("\n", "<br>");
}

function unlock() {
  if (passcodeInput.value !== PASSCODE) {
    gateMessage.textContent = "パスコードが違います。`script.js` の PASSCODE を自分用に変えて使ってください。";
    return;
  }

  sessionStorage.setItem("conversation-reset-unlocked", "true");
  gate.classList.add("hidden");
  app.classList.remove("hidden");
}

function lock() {
  sessionStorage.removeItem("conversation-reset-unlocked");
  app.classList.add("hidden");
  gate.classList.remove("hidden");
  passcodeInput.value = "";
}

async function sendToWebhook(log) {
  if (!WEBHOOK_URL) {
    return { skipped: true };
  }

  await fetch(WEBHOOK_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "text/plain;charset=utf-8",
    },
    body: JSON.stringify({
      token: WEBHOOK_TOKEN,
      payload: log,
    }),
  });

  return { skipped: false };
}

async function saveLog() {
  const checks = loadChecks();
  const log = {
    savedAt: new Date().toISOString(),
    pageUrl: window.location.href,
    summary: document.getElementById("summary-input").value.trim(),
    reflection: document.getElementById("reflection-input").value.trim(),
    nextAction: document.getElementById("next-action-input").value.trim(),
    hypothesis: document.getElementById("hypothesis-input").value.trim(),
    question: document.getElementById("question-input").value.trim(),
    herPriorities: document.getElementById("her-priorities").value.trim(),
    actionSignals: document.getElementById("action-signals").value.trim(),
    myPriorities: document.getElementById("my-priorities").value.trim(),
    gap: document.getElementById("gap-input").value.trim(),
    checklistStatus: defaultChecklist.map((item, index) => ({
      title: item.title,
      checked: Boolean(checks[index]),
    })),
  };

  const logs = loadLogs();
  logs.push(log);
  saveLogs(logs);
  renderLogs();

  try {
    const webhookResult = await sendToWebhook(log);
    saveMessage.textContent = webhookResult.skipped
      ? "今日の記録をブラウザ内に保存しました。Webhook URL を設定するとスプレッドシート連携もできます。"
      : "今日の記録をブラウザ内に保存し、スプレッドシートにも送信しました。";
  } catch (error) {
    console.error(error);
    saveMessage.textContent = "ブラウザ内には保存しました。Webhook 送信は失敗したので URL 設定を確認してください。";
  }
}

function clearInputs() {
  for (const id of ["summary-input", "reflection-input", "next-action-input"]) {
    document.getElementById(id).value = "";
  }
  persistState();
  saveMessage.textContent = "会話後の入力欄だけ空にしました。";
}

function exportLogs() {
  const logs = loadLogs();
  const lines = [
    ["savedAt", "summary", "reflection", "nextAction", "hypothesis"].join(","),
    ...logs.map((log) =>
      [log.savedAt, log.summary, log.reflection, log.nextAction, log.hypothesis]
        .map((value) => `"${String(value || "").replaceAll('"', '""')}"`)
        .join(","),
    ),
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "conversation-reset-logs.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

document.getElementById("unlock-button").addEventListener("click", unlock);
document.getElementById("lock-button").addEventListener("click", lock);
document.getElementById("save-button").addEventListener("click", saveLog);
document.getElementById("clear-button").addEventListener("click", clearInputs);
document.getElementById("export-button").addEventListener("click", exportLogs);
passcodeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    unlock();
  }
});

restoreState();
renderChecklist();
renderLogs();

if (sessionStorage.getItem("conversation-reset-unlocked") === "true") {
  gate.classList.add("hidden");
  app.classList.remove("hidden");
}
