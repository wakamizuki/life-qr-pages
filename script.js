const APP_CONFIG = window.APP_CONFIG || {};
const PASSCODES = Array.isArray(APP_CONFIG.passcodes)
  ? APP_CONFIG.passcodes
  : [APP_CONFIG.passcode || "reset-love"];
const STORAGE_KEY = "conversation-reset-state";
const LOGS_KEY = "conversation-reset-logs";
const CHECKS_KEY = "conversation-reset-checks";
const WEBHOOK_URL = APP_CONFIG.webhookUrl || "";
const WEBHOOK_TOKEN = APP_CONFIG.webhookToken || "";

const defaultChecklist = [
  {
    title: "相手が嫌がっている時に、自分のしたいことを通さない",
    note: "自分にとってはやりたいことでも、相手が今それを嫌だと感じているなら、まず優先すべきなのは自分の希望ではなく相手の気持ち。通したいかどうかより、その行動が相手をしんどくさせていないかを見る。",
  },
  {
    title: "相手の感情を理解する前に、自分の考えを出さない",
    note: "正しい説明をすること、誤解を解くこと、早く前に進めることより先に、まず相手が何を嫌だったのかを受け止める。気持ちを受け止めてもらえていない状態で何を言っても、相手にはわかろうとしていないと伝わりやすい。",
  },
  {
    title: "質問だけで済ませず、自分なりの仮説を持って聞く",
    note: "なんで怒ってるのと相手に全部説明させるのではなく、こういうふうに感じさせたから嫌だった? と、自分の頭で考えたうえで確認する。理解しようとする姿勢は、質問の量ではなく、どれだけ考えて聞いているかに出る。",
  },
  {
    title: "今の気持ちと関係ない話を混ぜて反論しない",
    note: "今向き合うべきなのは、過去の話や行動ではなく、今自分が何をして嫌な気持ちにさせたか。話を広げて言い返すより、まずは自分の原因を減らすことを優先する。",
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
  if (!PASSCODES.includes(passcodeInput.value)) {
    gateMessage.textContent = "パスコードが違います。";
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
