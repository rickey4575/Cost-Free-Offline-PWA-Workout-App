const DEFAULT_DURATION_SEC = 120;
const STEP_SEC = 15;
const PRESETS = [
  { label: "1 min", seconds: 60 },
  { label: "2 min", seconds: 120 },
  { label: "3 min", seconds: 180 },
];

let enabled = false;
let durationSec = DEFAULT_DURATION_SEC;
let remainingSec = DEFAULT_DURATION_SEC;
let running = false;
let intervalId = null;
let currentEls = null;

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function stopInterval() {
  if (!intervalId) return;
  clearInterval(intervalId);
  intervalId = null;
}

function syncDisplay() {
  if (!currentEls) return;

  currentEls.enabled.checked = enabled;
  currentEls.time.textContent = formatTime(remainingSec);
  currentEls.toggle.textContent = running ? "Pause" : "Start";
  currentEls.toggle.disabled = !enabled || remainingSec <= 0 || currentEls.disabled;
  currentEls.reset.disabled = !enabled || currentEls.disabled;
  currentEls.minus.disabled = !enabled || currentEls.disabled;
  currentEls.plus.disabled = !enabled || currentEls.disabled;

  for (const button of currentEls.presets) {
    button.disabled = !enabled || currentEls.disabled;
    button.style.fontWeight =
      Number(button.dataset.seconds) === durationSec ? "700" : "400";
  }
}

function tick() {
  remainingSec = Math.max(0, remainingSec - 1);

  if (remainingSec === 0) {
    running = false;
    stopInterval();
  }

  syncDisplay();
}

function startTimer({ reset = false } = {}) {
  if (!enabled) return;
  if (reset || remainingSec <= 0) {
    remainingSec = durationSec;
  }

  running = true;
  stopInterval();
  intervalId = setInterval(tick, 1000);
  syncDisplay();
}

function pauseTimer() {
  running = false;
  stopInterval();
  syncDisplay();
}

function resetTimer() {
  running = false;
  stopInterval();
  remainingSec = durationSec;
  syncDisplay();
}

function setDuration(seconds) {
  durationSec = Math.max(STEP_SEC, seconds);
  remainingSec = durationSec;
  running = false;
  stopInterval();
  syncDisplay();
}

export function startRestTimerAfterSet() {
  startTimer({ reset: true });
}

export function renderRestTimer(container, { active }) {
  container.innerHTML = "";

  if (!active) {
    pauseTimer();
    currentEls = null;
    return;
  }

  const wrap = document.createElement("section");
  wrap.style.border = "1px solid #ccc";
  wrap.style.borderRadius = "8px";
  wrap.style.padding = "12px";
  wrap.style.margin = "12px 0";
  wrap.style.maxWidth = "700px";

  const heading = document.createElement("h3");
  heading.textContent = "Rest timer";
  heading.style.marginTop = "0";

  const topRow = document.createElement("div");
  topRow.style.display = "flex";
  topRow.style.alignItems = "center";
  topRow.style.gap = "10px";
  topRow.style.flexWrap = "wrap";

  const enabledLabel = document.createElement("label");
  enabledLabel.style.display = "inline-flex";
  enabledLabel.style.alignItems = "center";
  enabledLabel.style.gap = "6px";

  const enabledInput = document.createElement("input");
  enabledInput.type = "checkbox";
  enabledInput.checked = enabled;
  enabledInput.addEventListener("change", () => {
    enabled = enabledInput.checked;
    if (!enabled) pauseTimer();
    syncDisplay();
  });

  const enabledText = document.createElement("span");
  enabledText.textContent = "Enabled";

  enabledLabel.appendChild(enabledInput);
  enabledLabel.appendChild(enabledText);

  const time = document.createElement("strong");
  time.style.fontSize = "28px";
  time.style.minWidth = "80px";
  time.style.display = "inline-block";
  time.textContent = formatTime(remainingSec);

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.addEventListener("click", () => {
    if (running) {
      pauseTimer();
    } else {
      startTimer();
    }
  });

  const reset = document.createElement("button");
  reset.type = "button";
  reset.textContent = "Reset";
  reset.addEventListener("click", resetTimer);

  topRow.appendChild(enabledLabel);
  topRow.appendChild(time);
  topRow.appendChild(toggle);
  topRow.appendChild(reset);

  const adjustRow = document.createElement("div");
  adjustRow.style.display = "flex";
  adjustRow.style.alignItems = "center";
  adjustRow.style.gap = "8px";
  adjustRow.style.flexWrap = "wrap";
  adjustRow.style.marginTop = "10px";

  const minus = document.createElement("button");
  minus.type = "button";
  minus.textContent = "-15 sec";
  minus.addEventListener("click", () => setDuration(durationSec - STEP_SEC));

  const plus = document.createElement("button");
  plus.type = "button";
  plus.textContent = "+15 sec";
  plus.addEventListener("click", () => setDuration(durationSec + STEP_SEC));

  adjustRow.appendChild(minus);
  adjustRow.appendChild(plus);

  const presetButtons = [];
  for (const preset of PRESETS) {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = preset.label;
    button.dataset.seconds = String(preset.seconds);
    button.addEventListener("click", () => setDuration(preset.seconds));
    presetButtons.push(button);
    adjustRow.appendChild(button);
  }

  const help = document.createElement("p");
  help.textContent = "When enabled, adding a set starts the timer.";
  help.style.margin = "8px 0 0";
  help.style.opacity = "0.7";

  wrap.appendChild(heading);
  wrap.appendChild(topRow);
  wrap.appendChild(adjustRow);
  wrap.appendChild(help);
  container.appendChild(wrap);

  currentEls = {
    disabled: !active,
    enabled: enabledInput,
    time,
    toggle,
    reset,
    minus,
    plus,
    presets: presetButtons,
  };

  syncDisplay();
}
