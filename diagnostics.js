const diagnosticSteps = [
  {
    label: "Battery",
    detail: "Checking holder and pocket charger charge levels.",
    result: "Holder 74%, pocket charger 82%"
  },
  {
    label: "Heating system",
    detail: "Testing heater response and temperature readiness.",
    result: "Heating response within normal range"
  },
  {
    label: "Charging contacts",
    detail: "Scanning holder alignment and contact continuity.",
    result: "Minor residue detected on holder contacts"
  },
  {
    label: "Firmware",
    detail: "Validating device status and last error signal.",
    result: "No critical device error found"
  }
];

const supportTips = [
  "Clean holder contacts with the approved cleaning tool.",
  "Charge for 20 minutes before retesting.",
  "If red light returns after cleaning, capture serial number and escalate."
];

let state = "idle";
let progress = 0;
let activeStep = -1;
let timerId = null;
let showChecklist = false;

const phaseLabel = document.querySelector("#phaseLabel");
const screenTitle = document.querySelector("#screenTitle");
const statusDot = document.querySelector("#statusDot");
const sessionState = document.querySelector("#sessionState");
const sessionSummary = document.querySelector("#sessionSummary");
const diagnosticBadge = document.querySelector("#diagnosticBadge");
const diagnosticStatus = document.querySelector("#diagnosticStatus");
const diagnosticMessage = document.querySelector("#diagnosticMessage");
const scanProgress = document.querySelector("#scanProgress");
const signalRing = document.querySelector("#signalRing");
const content = document.querySelector("#content");
const primaryButton = document.querySelector("#primaryButton");
const secondaryButton = document.querySelector("#secondaryButton");
const resetButton = document.querySelector("#resetButton");
const chargerRow = document.querySelector("#chargerRow");
const holderRow = document.querySelector("#holderRow");
const chargerProgress = document.querySelector("#chargerProgress");
const holderProgress = document.querySelector("#holderProgress");

function resetDiagnostics() {
  window.clearInterval(timerId);
  timerId = null;
  state = "idle";
  progress = 0;
  activeStep = -1;
  showChecklist = false;
  render();
}

function connectDevice() {
  progress = 0;
  activeStep = -1;
  state = "connected";
  render();
}

function startDiagnostics() {
  window.clearInterval(timerId);
  state = "scanning";
  progress = 0;
  activeStep = 0;
  render();

  timerId = window.setInterval(() => {
    progress = Math.min(100, progress + 4);
    activeStep = Math.min(diagnosticSteps.length - 1, Math.floor(progress / 26));

    if (progress >= 100) {
      window.clearInterval(timerId);
      timerId = null;
      state = "complete";
      activeStep = diagnosticSteps.length - 1;
    }

    render();
  }, 170);
}

function renderChrome() {
  const isScanning = state === "scanning";
  const isComplete = state === "complete";
  const chargerValue = state === "idle" ? 0 : isComplete ? 100 : Math.min(100, progress + 10);
  const holderValue = state === "idle" ? 0 : isComplete ? 88 : Math.max(0, progress - 8);

  phaseLabel.textContent = isComplete
    ? "Diagnostic result"
    : isScanning
      ? "Diagnostics running"
      : state === "connected"
        ? "Device connected"
        : "Device connection";

  screenTitle.textContent = isComplete
    ? "Service recommendation"
    : isScanning
      ? "Running diagnostics"
      : state === "connected"
        ? "Ready to diagnose"
        : "Connect IQOS device";

  sessionState.textContent = isComplete
    ? "Diagnostics complete"
    : isScanning
      ? "Scanning device"
      : state === "connected"
        ? "Device connected"
        : "Waiting for device";

  sessionSummary.textContent = isComplete
    ? "Cleaning recommended"
    : isScanning
      ? `${progress}% complete`
      : state === "connected"
        ? "IQOS device detected"
        : "No diagnostic started";

  statusDot.className = `status-dot ${state}`;
  signalRing.className = `signal-ring ${state}`;
  scanProgress.style.width = `${progress}%`;
  chargerRow.className = `device-row ${state}`;
  holderRow.className = `device-row ${state}`;
  chargerProgress.style.width = `${chargerValue}%`;
  holderProgress.style.width = `${holderValue}%`;
}

function renderDiagnosticCard() {
  const current = diagnosticSteps[Math.max(activeStep, 0)];

  diagnosticBadge.textContent = state === "idle" ? "USB-C" : state === "complete" ? "Report" : "Live";
  diagnosticStatus.textContent = state === "idle"
    ? "Device not connected"
    : state === "connected"
      ? "IQOS device detected"
      : state === "scanning"
        ? `Checking ${current.label.toLowerCase()}`
        : "Holder contacts need cleaning";

  diagnosticMessage.textContent = state === "idle"
    ? "Attach the IQOS device to begin a simulated diagnostics session."
    : state === "connected"
      ? "Connection established. Start diagnostics to run battery, heater, contact, and firmware checks."
      : state === "scanning"
        ? current.detail
        : "Device is usable, but contact cleaning is recommended before another test cycle.";
}

function renderContent() {
  if (showChecklist) {
    content.innerHTML = `
      <div class="checklist">
        ${supportTips.map((tip) => `<label><input type="checkbox" /> <span>${tip}</span></label>`).join("")}
      </div>
    `;
    return;
  }

  if (state === "complete") {
    content.innerHTML = `
      <div class="result-grid">
        <section class="result-card warning">
          <h3>Recommendation</h3>
          <p>Clean the holder contacts, charge for 20 minutes, then run diagnostics again.</p>
        </section>
        <section class="metric-card">
          <strong>Charger</strong>
          <span>Battery 82%, charging OK</span>
        </section>
        <section class="metric-card">
          <strong>Holder</strong>
          <span>Heater normal, battery 74%</span>
        </section>
        <section class="metric-card alert">
          <strong>Contacts</strong>
          <span>Clean required</span>
        </section>
      </div>
    `;
    return;
  }

  content.innerHTML = `
    <div class="timeline">
      ${diagnosticSteps
        .map((step, index) => {
          const isDone = state === "complete" || (state === "scanning" && index < activeStep);
          const isActive = state === "scanning" && index === activeStep;
          const className = isDone ? "done" : isActive ? "active" : "";
          const detail = isDone || state === "complete" ? step.result : step.detail;

          return `
            <div class="timeline-item ${className}">
              <span>${index + 1}</span>
              <div>
                <strong>${step.label}</strong>
                <p>${detail}</p>
              </div>
            </div>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderActions() {
  secondaryButton.textContent = showChecklist ? "Hide Checklist" : "View Checklist";
  secondaryButton.disabled = state === "scanning";

  if (state === "idle") {
    primaryButton.textContent = "Connect Device";
    primaryButton.disabled = false;
  } else if (state === "connected") {
    primaryButton.textContent = "Run Diagnostics";
    primaryButton.disabled = false;
  } else if (state === "scanning") {
    primaryButton.textContent = "Diagnostics Running";
    primaryButton.disabled = true;
  } else {
    primaryButton.textContent = "Run Again";
    primaryButton.disabled = false;
  }
}

function render() {
  renderChrome();
  renderDiagnosticCard();
  renderContent();
  renderActions();
}

primaryButton.addEventListener("click", () => {
  if (state === "idle") {
    connectDevice();
  } else if (state === "connected" || state === "complete") {
    startDiagnostics();
  }
});

secondaryButton.addEventListener("click", () => {
  showChecklist = !showChecklist;
  render();
});

resetButton.addEventListener("click", resetDiagnostics);

render();
