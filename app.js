const steps = Array.from(document.querySelectorAll(".form-step"));
const stepLinks = Array.from(document.querySelectorAll("[data-step-link]"));
const progressLabel = document.querySelector("#progressLabel");
const progressBar = document.querySelector("#progressBar");
const prevBtn = document.querySelector("#prevBtn");
const nextBtn = document.querySelector("#nextBtn");
const generateBtn = document.querySelector("#generateBtn");
const diagnosticList = document.querySelector("#diagnosticList");
const marksGrid = document.querySelector("#marksGrid");
const adaptiveQuestions = document.querySelector("#adaptiveQuestions");
const recommendations = document.querySelector("#recommendations");
const certificateToggle = document.querySelector("#hasCertificate");
const certificateFields = document.querySelector("#certificateFields");

let currentStep = 0;

const diagnostics = [
  ["logic", "I enjoy solving complex problems and finding patterns."],
  ["social", "I learn well by discussing ideas and helping others."],
  ["creative", "I like creating designs, stories, products, or media."],
  ["practical", "I prefer hands-on projects over only theoretical lessons."],
  ["resilience", "I stay focused when a subject becomes difficult."],
  ["leadership", "I feel comfortable organizing people or presenting ideas."]
];

const subjects = [
  ["math", "Mathematics"],
  ["physics", "Physics"],
  ["science", "Life & Earth Sciences"],
  ["languages", "Languages"],
  ["humanities", "Humanities"],
  ["technology", "Technology / Computer Science"]
];

const paths = [
  {
    id: "math_sciences",
    title: "Mathematical Sciences Option",
    schools: ["Future fit: EMI Rabat", "Future fit: ENSIAS Rabat", "Future fit: INPT Rabat", "Future fit: UM6P"],
    weights: { math: 1.4, physics: 1.2, technology: 1.3, logic: 1.3, practical: 0.8, resilience: 0.7 }
  },
  {
    id: "digital_technology",
    title: "Digital Technology and Computer Science Option",
    schools: ["Future fit: 1337 Coding School", "Future fit: ENSIAS Rabat", "Future fit: INPT Rabat", "Future fit: Al Akhawayn University"],
    weights: { math: 1.4, technology: 1.5, logic: 1.4, resilience: 0.6, creative: 0.4 }
  },
  {
    id: "life_sciences",
    title: "Life and Earth Sciences Option",
    schools: ["Faculty of Medicine Rabat", "Faculty of Medicine Casablanca", "IAV Hassan II", "ISPITS"],
    weights: { science: 1.5, physics: 0.7, resilience: 1.1, social: 0.8, practical: 0.7 }
  },
  {
    id: "economics_management",
    title: "Economics and Management Option",
    schools: ["Future fit: ISCAE Casablanca", "Future fit: ENCG Settat", "Future fit: HEM Business School", "Future fit: ESCA"],
    weights: { math: 0.6, languages: 1.0, humanities: 0.8, leadership: 1.4, social: 1.1, creative: 0.5 }
  },
  {
    id: "arts_media",
    title: "Arts, Design, and Media Option",
    schools: ["Future fit: ESAV Marrakech", "Future fit: Art'Com Sup Casablanca", "Future fit: INBA Tetouan", "Future fit: media schools"],
    weights: { creative: 1.5, technology: 0.8, languages: 0.6, practical: 1.0, social: 0.4 }
  },
  {
    id: "humanities_law",
    title: "Humanities, Languages, and Social Studies Option",
    schools: ["Future fit: UM5 Rabat", "Future fit: UIR Rabat", "Future fit: AUI Ifrane", "Future fit: public policy schools"],
    weights: { humanities: 1.4, languages: 1.2, leadership: 1.0, social: 0.9, resilience: 0.5 }
  }
];

function createDiagnostics() {
  diagnosticList.innerHTML = diagnostics.map(([id, text]) => `
    <div class="question-row">
      <strong>${text}</strong>
      <div class="scale" aria-label="${text}">
        ${[1, 2, 3, 4, 5].map(value => `
          <label>
            <input type="radio" name="diag-${id}" value="${value}" ${value === 3 ? "checked" : ""} />
            ${value}
          </label>
        `).join("")}
      </div>
    </div>
  `).join("");
}

function createMarks() {
  marksGrid.innerHTML = subjects.map(([id, label]) => `
    <label>
      ${label}
      <input name="mark-${id}" type="number" min="0" max="20" step="0.25" placeholder="/20" />
    </label>
  `).join("");
}

function profile() {
  const data = {
    name: document.querySelector("#name").value.trim(),
    age: Number(document.querySelector("#age").value || 0),
    grade: document.querySelector("#grade").value,
    level: document.querySelector("input[name='level']:checked")?.value || "school",
    diagnostics: {},
    marks: {},
    certificate: {
      enabled: certificateToggle.checked,
      name: document.querySelector("#certificateName").value.trim(),
      issuer: document.querySelector("#certificateIssuer").value.trim(),
      details: document.querySelector("#certificateDetails").value.trim()
    }
  };

  diagnostics.forEach(([id]) => {
    data.diagnostics[id] = Number(document.querySelector(`input[name="diag-${id}"]:checked`)?.value || 3);
  });

  subjects.forEach(([id]) => {
    data.marks[id] = Number(document.querySelector(`input[name="mark-${id}"]`).value || 0);
  });

  return data;
}

function normalizedMark(mark) {
  return mark > 0 ? (mark / 20) * 5 : 2.5;
}

function generateAdaptiveQuestions() {
  const data = profile();
  const strongestSubject = Object.entries(data.marks).sort((a, b) => b[1] - a[1])[0]?.[0] || "math";
  const strongestTrait = Object.entries(data.diagnostics).sort((a, b) => b[1] - a[1])[0]?.[0] || "logic";
  const gradeLabel = document.querySelector(`#grade option[value="${data.grade}"]`)?.textContent || "this grade";
  const certificateQuestion = data.certificate.enabled
    ? `What did ${data.certificate.name || "this activity"} show about what you enjoy or do well at school?`
    : "Would you like to join a club, competition, project, or certificate that matches your strongest subjects?";

  const questions = [
    `As a ${gradeLabel} student, what option are you currently considering most seriously?`,
    `Your strongest academic signal is ${labelFor(strongestSubject)}. Which school option do you think it could support?`,
    `Your diagnostic highlights ${strongestTrait}. Do you use this strength more in classwork, projects, or exams?`,
    certificateQuestion,
    data.level === "junior"
      ? "When you imagine high school, do you prefer science, technology, economics, languages, or arts?"
      : "For your next option, do you want a scientific, technical, economic, literary, or creative direction?"
  ];

  adaptiveQuestions.innerHTML = questions.map((question, index) => `
    <label>
      ${question}
      <textarea name="adaptive-${index}" rows="3" placeholder="Write your answer here"></textarea>
    </label>
  `).join("");
}

function labelFor(id) {
  return subjects.find(([subjectId]) => subjectId === id)?.[1] || id;
}

function cognitiveIdentity(data) {
  const dataFocus = data.diagnostics.logic + data.diagnostics.practical + normalizedMark(data.marks.math) + normalizedMark(data.marks.technology);
  const peopleFocus = data.diagnostics.social + data.diagnostics.leadership + normalizedMark(data.marks.languages) + normalizedMark(data.marks.humanities);
  const ideasFocus = data.diagnostics.logic + data.diagnostics.creative + normalizedMark(data.marks.math);
  const thingsFocus = data.diagnostics.practical + data.diagnostics.resilience + normalizedMark(data.marks.physics);
  const x = dataFocus - peopleFocus;
  const y = ideasFocus - thingsFocus;

  if (x >= 0 && y >= 0) {
    return {
      name: "Analytical Explorer",
      description: "Strong abstract reasoning with a preference for data, systems, and structured problem solving."
    };
  }

  if (x < 0 && y >= 0) {
    return {
      name: "Visionary Creative",
      description: "Conceptual and expressive, with strength in connecting ideas to human experience."
    };
  }

  if (x < 0 && y < 0) {
    return {
      name: "Human Operator",
      description: "Practical, grounded, and people-focused, with strong fit for support, care, and coordination options."
    };
  }

  return {
    name: "Practical Realist",
    description: "Concrete, precise, and execution-oriented, with strength in technical and applied environments."
  };
}

function scorePath(path, data) {
  let score = 0;
  let totalWeight = 0;

  Object.entries(path.weights).forEach(([key, weight]) => {
    const value = data.marks[key] !== undefined ? normalizedMark(data.marks[key]) : data.diagnostics[key] || 2.5;
    score += value * weight;
    totalWeight += weight;
  });

  const certificateBoost = data.certificate.enabled ? 0.35 : 0;
  return Math.min(98, Math.round(((score / totalWeight) / 5) * 100 + certificateBoost * 10));
}

function generateRecommendations() {
  const data = profile();
  const identity = cognitiveIdentity(data);
  const ranked = paths
    .map(path => ({ ...path, score: scorePath(path, data) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  recommendations.innerHTML = `
    <article class="identity-card">
      <span>Cognitive identity</span>
      <strong>${identity.name}</strong>
      <p>${identity.description}</p>
    </article>
  ` + ranked.map(path => `
    <article class="path-card">
      <div class="path-top">
        <div>
          <h3>${path.title}</h3>
          <p>${data.name || "This student"} has a strong fit for this school option based on the current profile.</p>
        </div>
        <span class="match-badge">${path.score}% match</span>
      </div>
      <div class="school-list">
        ${path.schools.map(school => `<div class="school-item">${school}</div>`).join("")}
      </div>
      <ul class="reason-list">
        ${reasonsFor(path, data).map(reason => `<li>${reason}</li>`).join("")}
      </ul>
    </article>
  `).join("");
}

function reasonsFor(path, data) {
  const reasons = [];
  const topWeights = Object.keys(path.weights).slice(0, 3);
  topWeights.forEach(key => {
    if (data.marks[key] !== undefined && data.marks[key] > 0) {
      reasons.push(`${labelFor(key)} mark supports this option.`);
    } else if (data.diagnostics[key]) {
      reasons.push(`Diagnostic response for ${key} aligns with this option.`);
    }
  });
  if (data.certificate.enabled) {
    reasons.push("Activity or certificate evidence strengthens the orientation profile.");
  }
  return reasons.slice(0, 4);
}

function showStep(index) {
  currentStep = Math.max(0, Math.min(index, steps.length - 1));
  steps.forEach((step, stepIndex) => step.classList.toggle("active", stepIndex === currentStep));
  stepLinks.forEach(link => link.classList.toggle("active", Number(link.dataset.stepLink) === currentStep));

  const progress = Math.round((currentStep / (steps.length - 1)) * 100);
  progressLabel.textContent = `${progress}%`;
  progressBar.style.width = `${progress}%`;
  prevBtn.disabled = currentStep === 0;
  nextBtn.classList.toggle("hidden", currentStep === steps.length - 1);
  generateBtn.classList.toggle("hidden", currentStep !== steps.length - 1);

  if (currentStep === 4) {
    generateAdaptiveQuestions();
  }
}

function validateCurrentStep() {
  const activeInputs = Array.from(steps[currentStep].querySelectorAll("input[required]"));
  const invalid = activeInputs.find(input => !input.checkValidity());
  if (invalid) {
    invalid.reportValidity();
    return false;
  }
  return true;
}

createDiagnostics();
createMarks();
showStep(0);

certificateToggle.addEventListener("change", () => {
  certificateFields.classList.toggle("hidden", !certificateToggle.checked);
});

prevBtn.addEventListener("click", () => showStep(currentStep - 1));
nextBtn.addEventListener("click", () => {
  if (!validateCurrentStep()) return;
  showStep(currentStep + 1);
});

generateBtn.addEventListener("click", generateRecommendations);
stepLinks.forEach(link => {
  link.addEventListener("click", () => {
    if (!validateCurrentStep()) return;
    showStep(Number(link.dataset.stepLink));
  });
});
