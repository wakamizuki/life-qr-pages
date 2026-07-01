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
    title: "仮説つきで聞く",
    note: "ただ聞くのではなく、自分なりの仮説を添えて確認する。",
  },
  {
    title: "行動で示す前提を忘れない",
    note: "自分のために何をしてくれたかで評価される前提を忘れない。",
  },
  {
    title: "比較は絶対に混ぜない",
    note: "他人との比較は絶対NG。伝え方の雑さにも注意する。",
  },
];

const gate = document.getElementById("gate");
const app = document.getElementById("app");
const passcodeInput = document.getElementById("passcode-input");
const gateMessage = document.getElementById("gate-message");

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

function unlock() {
  if (passcodeInput.value !== PASSCODE) {
    gateMessage.textContent = "パスコードが違います。`config.js` の passcode を確認してください。";
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

document.getElementById("unlock-button").addEventListener("click", unlock);
document.getElementById("lock-button").addEventListener("click", lock);
passcodeInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    unlock();
  }
});

renderChecklist();

if (sessionStorage.getItem("conversation-reset-unlocked") === "true") {
  gate.classList.add("hidden");
  app.classList.remove("hidden");
}
