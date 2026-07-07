const issues = [
  {
    id: "not-charging",
    title: "Device is not charging",
    summary: "Holder or pocket charger does not show expected charging lights.",
    checks: [
      {
        label: "Confirm the cable and adapter are firmly connected.",
        help: "Try a known working USB-C cable and wall adapter if available."
      },
      {
        label: "Clean the charging contacts gently.",
        help: "Remove visible dust or residue before placing the holder back in the charger."
      },
      {
        label: "Leave the device charging for at least 20 minutes.",
        help: "A fully depleted battery may need a few minutes before lights appear."
      }
    ],
    success: "Charging issue is likely resolved after cable, contact, and waiting checks.",
    escalation: "If no charging lights appear after these checks, capture the device model and serial number for support."
  },
  {
    id: "red-light",
    title: "Red light or error light",
    summary: "Device shows a red status light, blinking light, or does not start normally.",
    checks: [
      {
        label: "Restart or reset the device.",
        help: "Hold the power button until the device vibrates or lights cycle."
      },
      {
        label: "Check that the holder is fully inserted in the pocket charger.",
        help: "Misalignment can trigger an error or charging warning."
      },
      {
        label: "Allow the device to cool or warm to room temperature.",
        help: "Temperature outside the normal range can cause temporary error lights."
      }
    ],
    success: "A reset or temperature check usually clears temporary red-light states.",
    escalation: "If the red light returns immediately, log it as a device error and move to replacement assessment."
  },
  {
    id: "no-vapor",
    title: "Weak or no aerosol",
    summary: "The device heats but produces little or no aerosol during use.",
    checks: [
      {
        label: "Confirm the tobacco stick is inserted correctly.",
        help: "It should be inserted to the marked line without twisting excessively."
      },
      {
        label: "Run a cleaning cycle or use the cleaning tool.",
        help: "Residue inside the heating chamber can reduce performance."
      },
      {
        label: "Check that the holder completed preheating.",
        help: "Wait for the vibration or ready indication before use."
      }
    ],
    success: "If aerosol improves after cleaning and correct insertion, advise routine cleaning.",
    escalation: "If performance remains weak across multiple sticks, record the batch and device details."
  },
  {
    id: "physical-damage",
    title: "Physical damage",
    summary: "Device is cracked, wet, dropped, or has a damaged heating blade.",
    checks: [
      {
        label: "Stop using the device if there is visible damage.",
        help: "Damaged heating components or casing should not be used."
      },
      {
        label: "Ask whether the device was exposed to water or impact.",
        help: "This helps route the session to warranty or paid replacement handling."
      },
      {
        label: "Capture photos and serial number.",
        help: "Images and serial details speed up support review."
      }
    ],
    success: "Physical damage requires a support workflow rather than live troubleshooting.",
    escalation: "Escalate to service review and advise the customer not to continue using the damaged device."
  }
];

let step = 0;
let selectedIssueId = "";
let completedChecks = new Set();

const content = document.querySelector("#content");
const stepNumber = document.querySelector("#stepNumber");
const stepTitle = document.querySelector("#stepTitle");
const progressBar = document.querySelector("#progressBar");
const sessionSummary = document.querySelector("#sessionSummary");
const backButton = document.querySelector("#backButton");
const nextButton = document.querySelector("#nextButton");
const resetButton = document.querySelector("#resetButton");

function selectedIssue() {
  return issues.find((issue) => issue.id === selectedIssueId);
}

function updateChrome() {
  const titles = ["Select the issue", "Run quick checks", "Recommended action"];
  stepNumber.textContent = String(step + 1);
  stepTitle.textContent = titles[step];
  progressBar.style.width = `${((step + 1) / 3) * 100}%`;
  backButton.disabled = step === 0;
  nextButton.textContent = step === 2 ? "Start New Session" : "Next";
  nextButton.disabled = step === 0 && !selectedIssueId;

  const issue = selectedIssue();
  sessionSummary.textContent = issue ? issue.title : "No issue selected";
}

function renderIssueChoices() {
  content.innerHTML = `
    <div class="choice-grid">
      ${issues
        .map(
          (issue) => `
            <button class="choice ${issue.id === selectedIssueId ? "selected" : ""}" data-issue="${issue.id}" type="button">
              <strong>${issue.title}</strong>
              <span>${issue.summary}</span>
            </button>
          `
        )
        .join("")}
    </div>
    <p class="note">This sample app is for demo use only and is not an official diagnostic tool.</p>
  `;

  document.querySelectorAll("[data-issue]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedIssueId = button.dataset.issue;
      completedChecks = new Set();
      render();
    });
  });
}

function renderChecks() {
  const issue = selectedIssue();
  content.innerHTML = `
    <div class="checklist">
      ${issue.checks
        .map(
          (check, index) => `
            <label class="check-item">
              <input type="checkbox" data-check="${index}" ${completedChecks.has(index) ? "checked" : ""} />
              <span>
                <strong>${check.label}</strong>
                <span>${check.help}</span>
              </span>
            </label>
          `
        )
        .join("")}
    </div>
  `;

  document.querySelectorAll("[data-check]").forEach((checkbox) => {
    checkbox.addEventListener("change", () => {
      const checkIndex = Number(checkbox.dataset.check);
      if (checkbox.checked) {
        completedChecks.add(checkIndex);
      } else {
        completedChecks.delete(checkIndex);
      }
    });
  });
}

function renderResult() {
  const issue = selectedIssue();
  const allChecksDone = completedChecks.size === issue.checks.length;
  const cardClass = issue.id === "physical-damage" ? "escalate" : allChecksDone ? "" : "warning";
  const heading = issue.id === "physical-damage"
    ? "Escalate to service review"
    : allChecksDone
      ? "Likely next step"
      : "Complete remaining checks";

  content.innerHTML = `
    <div class="result">
      <section class="result-card ${cardClass}">
        <h3>${heading}</h3>
        <p>${allChecksDone ? issue.success : "Some checks are still open. Finish them before closing the demo case."}</p>
      </section>
      <section>
        <h3>Support script</h3>
        <ol class="steps">
          <li>Confirm selected issue: ${issue.title}.</li>
          <li>Review completed checks: ${completedChecks.size} of ${issue.checks.length}.</li>
          <li>${issue.escalation}</li>
        </ol>
      </section>
    </div>
  `;
}

function render() {
  updateChrome();

  if (step === 0) {
    renderIssueChoices();
  }

  if (step === 1) {
    renderChecks();
  }

  if (step === 2) {
    renderResult();
  }
}

function resetSession() {
  step = 0;
  selectedIssueId = "";
  completedChecks = new Set();
  render();
}

backButton.addEventListener("click", () => {
  step = Math.max(0, step - 1);
  render();
});

nextButton.addEventListener("click", () => {
  if (step === 2) {
    resetSession();
    return;
  }

  if (step === 0 && !selectedIssueId) {
    return;
  }

  step += 1;
  render();
});

resetButton.addEventListener("click", resetSession);

render();
