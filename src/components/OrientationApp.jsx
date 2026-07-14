import { useEffect, useRef, useState } from 'react';

const diagnostics = [
  ['logic', 'I enjoy solving complex problems and finding patterns.'],
  ['social', 'I learn well by discussing ideas and helping others.'],
  ['creative', 'I like creating designs, stories, products, or media.'],
  ['practical', 'I prefer hands-on projects over only theoretical lessons.'],
  ['resilience', 'I stay focused when a subject becomes difficult.'],
  ['leadership', 'I feel comfortable organizing people or presenting ideas.'],
];

const subjects = [
  ['math', 'Mathematics'],
  ['physics', 'Physics'],
  ['science', 'Life & Earth Sciences'],
  ['languages', 'Languages'],
  ['humanities', 'Humanities'],
  ['technology', 'Technology / Computer Science'],
];

const paths = [
  {
    id: 'math_sciences',
    title: 'Mathematical Sciences Option',
    schools: ['EMI Rabat', 'ENSIAS Rabat', 'INPT Rabat', 'UM6P'],
    weights: { math: 1.4, physics: 1.2, technology: 1.3, logic: 1.3, practical: 0.8, resilience: 0.7 },
  },
  {
    id: 'digital_technology',
    title: 'Digital Technology and Computer Science Option',
    schools: ['1337 Coding School', 'ENSIAS Rabat', 'INPT Rabat', 'Al Akhawayn University'],
    weights: { math: 1.4, technology: 1.5, logic: 1.4, resilience: 0.6, creative: 0.4 },
  },
  {
    id: 'life_sciences',
    title: 'Life and Earth Sciences Option',
    schools: ['Faculty of Medicine Rabat', 'Faculty of Medicine Casablanca', 'IAV Hassan II', 'ISPITS'],
    weights: { science: 1.5, physics: 0.7, resilience: 1.1, social: 0.8, practical: 0.7 },
  },
  {
    id: 'economics_management',
    title: 'Economics and Management Option',
    schools: ['ISCAE Casablanca', 'ENCG Settat', 'HEM Business School', 'ESCA'],
    weights: { math: 0.6, languages: 1.0, humanities: 0.8, leadership: 1.4, social: 1.1, creative: 0.5 },
  },
  {
    id: 'arts_media',
    title: 'Arts, Design, and Media Option',
    schools: ['ESAV Marrakech', "Art'Com Sup Casablanca", 'INBA Tetouan', 'Media schools'],
    weights: { creative: 1.5, technology: 0.8, languages: 0.6, practical: 1.0, social: 0.4 },
  },
  {
    id: 'humanities_law',
    title: 'Humanities, Languages, and Social Studies Option',
    schools: ['UM5 Rabat', 'UIR Rabat', 'AUI Ifrane', 'Public policy schools'],
    weights: { humanities: 1.4, languages: 1.2, leadership: 1.0, social: 0.9, resilience: 0.5 },
  },
];

function labelFor(id) {
  return subjects.find(([subjectId]) => subjectId === id)?.[1] || id;
}

function normalizedMark(mark) {
  return mark > 0 ? (mark / 20) * 5 : 2.5;
}

function readValue(formData, name) {
  const value = formData.get(name);
  return typeof value === 'string' ? value : '';
}

export default function OrientationApp() {
  const formRef = useRef(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasCertificate, setHasCertificate] = useState(false);
  const [adaptiveQuestions, setAdaptiveQuestions] = useState([]);
  const [recommendations, setRecommendations] = useState(null);

  function readProfile() {
    const form = formRef.current;

    if (!form) {
      return null;
    }

    const formData = new FormData(form);

    return {
      name: readValue(formData, 'name').trim(),
      age: Number(readValue(formData, 'age') || 0),
      grade: readValue(formData, 'grade'),
      level: readValue(formData, 'level') || 'junior',
      diagnostics: Object.fromEntries(
        diagnostics.map(([id]) => [id, Number(readValue(formData, `diag-${id}`) || 3)]),
      ),
      marks: Object.fromEntries(
        subjects.map(([id]) => [id, Number(readValue(formData, `mark-${id}`) || 0)]),
      ),
      certificate: {
        enabled: hasCertificate,
        name: readValue(formData, 'certificateName').trim(),
        issuer: readValue(formData, 'certificateIssuer').trim(),
        details: readValue(formData, 'certificateDetails').trim(),
      },
    };
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
        name: 'Analytical Explorer',
        description: 'Strong abstract reasoning with a preference for data, systems, and structured problem solving.',
      };
    }

    if (x < 0 && y >= 0) {
      return {
        name: 'Visionary Creative',
        description: 'Conceptual and expressive, with strength in connecting ideas to human experience.',
      };
    }

    if (x < 0 && y < 0) {
      return {
        name: 'Human Operator',
        description: 'Practical, grounded, and people-focused, with strong fit for support, care, and coordination options.',
      };
    }

    return {
      name: 'Practical Realist',
      description: 'Concrete, precise, and execution-oriented, with strength in technical and applied environments.',
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

  function reasonsFor(path, data) {
    const reasons = [];
    const topWeights = Object.keys(path.weights).slice(0, 3);

    topWeights.forEach((key) => {
      if (data.marks[key] !== undefined && data.marks[key] > 0) {
        reasons.push(`${labelFor(key)} mark supports this option.`);
      } else if (data.diagnostics[key]) {
        reasons.push(`Diagnostic response for ${key} aligns with this option.`);
      }
    });

    if (data.certificate.enabled) {
      reasons.push('Activity or certificate evidence strengthens the orientation profile.');
    }

    return reasons.slice(0, 4);
  }

  function buildAdaptiveQuestions(data) {
    const strongestSubject = Object.entries(data.marks).sort((a, b) => b[1] - a[1])[0]?.[0] || 'math';
    const strongestTrait = Object.entries(data.diagnostics).sort((a, b) => b[1] - a[1])[0]?.[0] || 'logic';
    const gradeLabel = data.grade ? data.grade.replace('-', ' ') : 'this grade';
    const certificateQuestion = data.certificate.enabled
      ? `What did ${data.certificate.name || 'this activity'} show about what you enjoy or do well at school?`
      : 'Would you like to join a club, competition, project, or certificate that matches your strongest subjects?';

    return [
      `As a ${gradeLabel} student, what option are you currently considering most seriously?`,
      `Your strongest academic signal is ${labelFor(strongestSubject)}. Which school option do you think it could support?`,
      `Your diagnostic highlights ${strongestTrait}. Do you use this strength more in classwork, projects, or exams?`,
      certificateQuestion,
      data.level === 'junior'
        ? 'When you imagine high school, do you prefer science, technology, economics, languages, or arts?'
        : 'For your next option, do you want a scientific, technical, economic, literary, or creative direction?',
    ];
  }

  function buildRecommendations(data) {
    const identity = cognitiveIdentity(data);
    const ranked = paths
      .map((path) => ({ ...path, score: scorePath(path, data) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    return {
      identity,
      ranked: ranked.map((path) => ({
        ...path,
        reasons: reasonsFor(path, data),
      })),
    };
  }

  function validateCurrentStep() {
    const form = formRef.current;

    if (!form) {
      return false;
    }

    const activeSection = form.querySelector(`[data-step="${currentStep}"]`);

    if (!activeSection) {
      return false;
    }

    const requiredInputs = Array.from(activeSection.querySelectorAll('input[required], select[required], textarea[required]'));
    const invalid = requiredInputs.find((input) => !input.checkValidity());

    if (invalid) {
      invalid.reportValidity();
      return false;
    }

    return true;
  }

  function showStep(index) {
    const nextStep = Math.max(0, Math.min(index, 5));
    setCurrentStep(nextStep);
  }

  function handleNext() {
    if (!validateCurrentStep()) {
      return;
    }

    if (currentStep === 4) {
      const data = readProfile();

      if (data) {
        setAdaptiveQuestions(buildAdaptiveQuestions(data));
      }
    }

    showStep(currentStep + 1);
  }

  function handleGenerate() {
    const data = readProfile();

    if (!data) {
      return;
    }

    setRecommendations(buildRecommendations(data));
  }

  function handleStepLink(index) {
    if (index > currentStep && !validateCurrentStep()) {
      return;
    }

    if (index === 4) {
      const data = readProfile();

      if (data) {
        setAdaptiveQuestions(buildAdaptiveQuestions(data));
      }
    }

    showStep(index);
  }

  useEffect(() => {
    if (currentStep !== 4) {
      return;
    }

    const data = readProfile();

    if (data) {
      setAdaptiveQuestions(buildAdaptiveQuestions(data));
    }
  }, [currentStep]);

  return (
    <form ref={formRef} className="journey-card">
      <section className="summary-strip" aria-label="Product highlights">
        <article className="summary-card accent-card">
          <span>Orientation confidence</span>
          <strong>Structured, not generic</strong>
          <p>Balanced inputs across profile, diagnostics, marks, and certificates.</p>
        </article>
        <article className="summary-card">
          <span>Decision signal</span>
          <strong>More than marks</strong>
          <p>Academic fit is ranked with learning style and evidence of engagement.</p>
        </article>
        <article className="summary-card">
          <span>UX pattern</span>
          <strong>Calm guided flow</strong>
          <p>Clear hierarchy, generous spacing, and a step rail for fast scanning.</p>
        </article>
      </section>

      <div className="flow-shell">
        <section className={`form-step ${currentStep === 0 ? 'active' : ''}`} data-step="0">
          <div className="section-head">
            <p className="eyebrow">Step 01</p>
            <h2>Student Profile</h2>
            <p>Start with the basics so Orien Tech can adapt the diagnostic to the student’s school stage.</p>
          </div>

          <div className="field-grid three-cols">
            <label>
              Full name
              <input id="name" name="name" type="text" placeholder="e.g. Lina Benali" required />
            </label>
            <label>
              Age
              <input id="age" name="age" type="number" min="11" max="19" placeholder="15" required />
            </label>
            <label>
              Current grade
              <select id="grade" name="grade" required>
                <option value="junior-1">Junior high 1</option>
                <option value="junior-2">Junior high 2</option>
                <option value="junior-3">Junior high 3</option>
                <option value="high-1">High school 1</option>
                <option value="high-2">High school 2</option>
                <option value="high-3">High school 3</option>
              </select>
            </label>
          </div>

          <fieldset>
            <legend>Current school stage</legend>
            <div className="choice-grid">
              <label className="choice-card">
                <input type="radio" name="level" value="junior" defaultChecked />
                <span>Junior high</span>
                <small>Orientation before choosing a high school option.</small>
              </label>
              <label className="choice-card">
                <input type="radio" name="level" value="high" />
                <span>High school</span>
                <small>Orientation for stream, option, or baccalaureate pathway.</small>
              </label>
            </div>
          </fieldset>
        </section>

        <section className={`form-step ${currentStep === 1 ? 'active' : ''}`} data-step="1">
          <div className="section-head">
            <p className="eyebrow">Step 02</p>
            <h2>Cognitive Identity Diagnostic</h2>
            <p>Map how the student processes information before matching school options.</p>
          </div>

          <div className="matrix-panel">
            <div>
              <p className="matrix-kicker">Two-axis logic</p>
              <h3>Beyond grades</h3>
              <p>Orien Tech combines marks with cognitive identity: data vs people, and ideas vs concrete execution.</p>
            </div>
            <div className="quadrant-map" aria-label="Cognitive identity map">
              <span className="axis top-axis">Ideas</span>
              <span className="axis bottom-axis">Things</span>
              <span className="axis left-axis">People</span>
              <span className="axis right-axis">Data</span>
              <div className="quadrant">Visionary Creative</div>
              <div className="quadrant">Analytical Explorer</div>
              <div className="quadrant">Human Operator</div>
              <div className="quadrant">Practical Realist</div>
            </div>
          </div>

          <div className="diagnostic-list" id="diagnosticList">
            {diagnostics.map(([id, text]) => (
              <div className="question-row" key={id}>
                <strong>{text}</strong>
                <div className="scale" aria-label={text}>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <label key={value}>
                      <input type="radio" name={`diag-${id}`} value={value} defaultChecked={value === 3} />
                      {value}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className={`form-step ${currentStep === 2 ? 'active' : ''}`} data-step="2">
          <div className="section-head">
            <p className="eyebrow">Step 03</p>
            <h2>Subject Marks</h2>
            <p>Add recent marks to identify academic strengths.</p>
          </div>

          <div className="marks-grid" id="marksGrid">
            {subjects.map(([id, label]) => (
              <label key={id}>
                {label}
                <input name={`mark-${id}`} type="number" min="0" max="20" step="0.25" placeholder="/20" />
              </label>
            ))}
          </div>
        </section>

        <section className={`form-step ${currentStep === 3 ? 'active' : ''}`} data-step="3">
          <div className="section-head">
            <p className="eyebrow">Step 04</p>
            <h2>Certificates</h2>
            <p>Optional, but useful when the student has proof of interests outside ordinary marks.</p>
          </div>

          <label className="toggle-row">
            <input
              id="hasCertificate"
              name="hasCertificate"
              type="checkbox"
              checked={hasCertificate}
              onChange={(event) => setHasCertificate(event.target.checked)}
            />
            <span>I have certificates, awards, clubs, competitions, or projects</span>
          </label>

          {hasCertificate ? (
            <div id="certificateFields" className="certificate-fields">
              <div className="field-grid two-cols">
                <label>
                  Certificate name
                  <input id="certificateName" name="certificateName" type="text" placeholder="e.g. Robotics club, math contest, language certificate" />
                </label>
                <label>
                  Issuer
                  <input id="certificateIssuer" name="certificateIssuer" type="text" placeholder="e.g. School, association, online platform" />
                </label>
              </div>
              <label>
                Details
                <textarea id="certificateDetails" name="certificateDetails" rows="5" placeholder="Mention what the student did, learned, built, won, or enjoyed."></textarea>
              </label>
            </div>
          ) : null}
        </section>

        <section className={`form-step ${currentStep === 4 ? 'active' : ''}`} data-step="4">
          <div className="section-head">
            <p className="eyebrow">Step 05</p>
            <h2>Adaptive AI Questions</h2>
            <p>Answer a few focused questions based on the profile.</p>
          </div>

          <div id="adaptiveQuestions" className="adaptive-list">
            {adaptiveQuestions.length > 0 ? (
              adaptiveQuestions.map((question, index) => (
                <label key={question}>
                  {question}
                  <textarea name={`adaptive-${index}`} rows="3" placeholder="Write your answer here" />
                </label>
              ))
            ) : (
              <div className="empty-state">
                <strong>Answer the earlier steps to unlock AI questions.</strong>
                <span>The prompts will adapt to marks, identity signals, and the student stage.</span>
              </div>
            )}
          </div>
        </section>

        <section className={`form-step ${currentStep === 5 ? 'active' : ''}`} data-step="5">
          <div className="section-head">
            <p className="eyebrow">Step 06</p>
            <h2>Recommended Options</h2>
            <p>Orien Tech ranks the school options using academic fit, learning style, interests, and profile evidence.</p>
          </div>

          <div id="recommendations" className="recommendations">
            {recommendations ? (
              <>
                <article className="identity-card">
                  <span>Cognitive identity</span>
                  <strong>{recommendations.identity.name}</strong>
                  <p>{recommendations.identity.description}</p>
                </article>

                {recommendations.ranked.map((path) => (
                  <article className="path-card" key={path.id}>
                    <div className="path-top">
                      <div>
                        <h3>{path.title}</h3>
                        <p>The current profile shows a strong fit for this school option.</p>
                      </div>
                      <span className="match-badge">{path.score}% match</span>
                    </div>
                    <div className="school-list">
                      {path.schools.map((school) => (
                        <div className="school-item" key={school}>
                          {school}
                        </div>
                      ))}
                    </div>
                    <ul className="reason-list">
                      {path.reasons.map((reason) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </article>
                ))}
              </>
            ) : (
              <div className="empty-state">
                <strong>Ready when your profile is complete.</strong>
                <span>Use Generate options to see the best-fit academic choices.</span>
              </div>
            )}
          </div>
        </section>
      </div>

      <footer className="action-bar">
        <button id="prevBtn" className="secondary-btn" type="button" onClick={() => showStep(currentStep - 1)} disabled={currentStep === 0}>
          Back
        </button>
        <button id="nextBtn" className={`primary-btn ${currentStep === 5 ? 'hidden' : ''}`} type="button" onClick={handleNext}>
          Next
        </button>
        <button id="generateBtn" className={`primary-btn ${currentStep === 5 ? '' : 'hidden'}`} type="button" onClick={handleGenerate}>
          Generate options
        </button>
      </footer>

      <nav className="step-list step-list-inline" aria-label="Application steps">
        {['Profile', 'Diagnostic', 'Marks', 'Certificates', 'AI Questions', 'Options'].map((label, index) => (
          <button
            key={label}
            className={`step-pill ${currentStep === index ? 'active' : ''}`}
            data-step-link={index}
            type="button"
            aria-current={currentStep === index ? 'step' : undefined}
            onClick={() => handleStepLink(index)}
          >
            {label}
          </button>
        ))}
      </nav>
    </form>
  );
}