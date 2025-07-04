// --- Configuration ---
// PASTE YOUR DEPLOYED GOOGLE APPS SCRIPT WEB APP URL HERE:
const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyIySD4uPAuq1LL9MRHmgF3qh2-R5KZi3iJYYzPAegCkq3_b0kHU5oRgLSAZWDa7uSh/exec";

// --- State Variables ---
let firstName = "";
let currentInitialQuestionIndex = 0;
const initialAnswers = [];
let email = "";
let phone = "";
let currentMcqIndex = 0;
const mcqAnswers = [];
let selectedMcqOption = null; // Stores {id: string, text: string}
let selectedMcqOptionElement = null;

// --- DOM Elements ---
const nameSection = document.getElementById("nameSection");
const initialQuestionsSection = document.getElementById(
  "initialQuestionsSection"
);
const contactSection = document.getElementById("contactSection");
const mcqSection = document.getElementById("mcqSection");
const completionSection = document.getElementById("completionSection");
const errorMessageDiv = document.getElementById("errorMessage");

const firstNameInput = document.getElementById("firstNameInput");
const initialQuestionTitle = document.getElementById("initialQuestionTitle");
const initialQuestionText = document.getElementById("initialQuestionText");
const initialQuestionAnswer = document.getElementById("initialQuestionAnswer");
const contactSectionTitle = document.getElementById("contactSectionTitle");
const emailInput = document.getElementById("emailInput");
const phoneInput = document.getElementById("phoneInput");
const mcqCategory = document.getElementById("mcqCategory");
const mcqQuestionTextElement = document.getElementById("mcqQuestionText");
const mcqOptionsContainer = document.getElementById("mcqOptionsContainer");
const mcqSubmitButton = document.getElementById("mcqSubmitButton");
const completionSectionTitle = document.getElementById(
  "completionSectionTitle"
);
const submissionStatusMessage = document.getElementById(
  "submissionStatusMessage"
);

const alertModal = document.getElementById("alertModal");
const alertModalText = document.getElementById("alertModalText");

document.getElementById("currentYear").textContent = new Date().getFullYear();

const initialQuestions = [
  {
    text: "What's the biggest business dream you're aiming to achieve right now?",
    placeholder: "My biggest dream is...",
  },
  {
    text: "In one sentence, what does 'High Performance' mean to you in your entrepreneurial journey?",
    placeholder: "High performance to me means...",
  },
  {
    text: "How do you see Artificial Intelligence shaping the future of your industry?",
    placeholder: "AI will impact my industry by...",
  },
];

const mcqData = [
  {
    category: "Business Fundamentals",
    question:
      "What is the primary purpose of a Unique Selling Proposition (USP)?",
    options: [
      { text: "To lower product prices", id: "a" },
      { text: "To differentiate your business from competitors", id: "b" },
      { text: "To increase marketing budget", id: "c" },
      { text: "To copy successful businesses", id: "d" },
    ],
    correctAnswer: "b",
  },
  {
    category: "Marketing Strategy",
    question:
      "Which of these is a crucial first step in developing a robust marketing strategy?",
    options: [
      { text: "Designing a visually stunning logo", id: "a" },
      { text: "Hiring a large sales team immediately", id: "b" },
      { text: "Clearly identifying your target audience", id: "c" },
      { text: "Opening multiple physical store locations", id: "d" },
    ],
    correctAnswer: "c",
  },
  {
    category: "Artificial Intelligence Concepts",
    question:
      "Which AI concept involves systems learning from data without being explicitly programmed for each task?",
    options: [
      { text: "Augmented Reality (AR)", id: "a" },
      { text: "Machine Learning (ML)", id: "b" },
      { text: "Blockchain Technology", id: "c" },
      { text: "Quantum Computing", id: "d" },
    ],
    correctAnswer: "b",
  },
  {
    category: "AI Applications",
    question:
      "What is a common and impactful application of AI in enhancing customer service?",
    options: [
      { text: "Manual data entry and spreadsheet management", id: "a" },
      { text: "Designing website aesthetics and color palettes", id: "b" },
      { text: "AI-powered chatbots for 24/7 instant support", id: "c" },
      { text: "Sending physical promotional mailers", id: "d" },
    ],
    correctAnswer: "c",
  },
  {
    category: "High Performance Mindset",
    question:
      "What does the 'SMART' criteria for effective goal setting stand for?",
    options: [
      { text: "Simple, Measurable, Achievable, Relevant, Time-bound", id: "a" },
      { text: "Specific, Meaningful, Actionable, Rewarding, Timely", id: "b" },
      {
        text: "Strategic, Motivating, Ambitious, Realistic, Thoughtful",
        id: "c",
      },
      {
        text: "Specific, Measurable, Achievable, Relevant, Time-bound",
        id: "d",
      },
    ],
    correctAnswer: "d",
  },
  {
    category: "Productivity Habits",
    question:
      "Which of the following is a key habit for maintaining high productivity as an entrepreneur?",
    options: [
      { text: "Constantly multitasking on several complex projects", id: "a" },
      { text: "Prioritizing tasks based on urgency and importance", id: "b" },
      { text: "Working non-stop for extended periods without breaks", id: "c" },
      {
        text: "Checking emails and social media notifications every 10 minutes",
        id: "d",
      },
    ],
    correctAnswer: "b",
  },
];

function showSection(sectionId) {
  [
    nameSection,
    initialQuestionsSection,
    contactSection,
    mcqSection,
    completionSection,
  ].forEach((s) => s.classList.add("hidden"));
  document.getElementById(sectionId).classList.remove("hidden");
}

function displayError(message) {
  errorMessageDiv.textContent = message;
}

function clearError() {
  errorMessageDiv.textContent = "";
}

function showAlert(message) {
  alertModalText.textContent = message;
  alertModal.style.display = "block";
}

function closeModal() {
  alertModal.style.display = "none";
}

window.onclick = function (event) {
  if (event.target == alertModal) closeModal();
};

function sanitizeInput(input) {
  const div = document.createElement("div");
  div.textContent = input;
  return div.innerHTML;
}

function escapeCSVField(field) {
  if (field === null || typeof field === "undefined") return "";
  let stringField = String(field);
  if (
    stringField.includes(",") ||
    stringField.includes('"') ||
    stringField.includes("\n") ||
    stringField.includes("\r")
  ) {
    stringField = stringField.replace(/"/g, '""');
    return `"${stringField}"`;
  }
  return stringField;
}

function handleNameSubmit() {
  clearError();
  const nameValue = firstNameInput.value.trim();
  if (!nameValue) {
    showAlert("Please enter your first name!");
    return;
  }
  firstName = sanitizeInput(nameValue);
  loadInitialQuestion();
}

function loadInitialQuestion() {
  showSection("initialQuestionsSection");
  const question = initialQuestions[currentInitialQuestionIndex];
  initialQuestionTitle.textContent = `Insight Question ${
    currentInitialQuestionIndex + 1
  } of ${initialQuestions.length}`;
  initialQuestionText.innerHTML = question.text.replace(
    "{firstName}",
    firstName
  );
  initialQuestionAnswer.placeholder = question.placeholder;
  initialQuestionAnswer.value = "";
}

function handleInitialQuestionSubmit() {
  clearError();
  const answer = initialQuestionAnswer.value.trim();
  if (!answer) {
    showAlert("Please share your insight.");
    return;
  }
  initialAnswers.push({
    question: initialQuestions[currentInitialQuestionIndex].text,
    answer: sanitizeInput(answer),
  });
  currentInitialQuestionIndex++;
  if (currentInitialQuestionIndex < initialQuestions.length) {
    loadInitialQuestion();
  } else {
    loadContactSection();
  }
}

function loadContactSection() {
  showSection("contactSection");
  contactSectionTitle.textContent = `Valuable Insights, ${firstName}!`;
}

function handleContactSubmit() {
  clearError();
  email = sanitizeInput(emailInput.value.trim());
  phone = sanitizeInput(phoneInput.value.trim());
  if (!email) {
    showAlert("Please provide your email address.");
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showAlert("Please enter a valid email address.");
    return;
  }
  loadMcqQuestion();
}

function loadMcqQuestion() {
  showSection("mcqSection");
  selectedMcqOption = null;
  selectedMcqOptionElement = null;
  const questionData = mcqData[currentMcqIndex];
  mcqCategory.textContent = `Topic: ${questionData.category}`;
  mcqQuestionTextElement.textContent = questionData.question;
  mcqOptionsContainer.innerHTML = "";
  questionData.options.forEach((option) => {
    const button = document.createElement("button");
    button.className =
      "quiz-option w-full text-left p-3 border border-slate-300 rounded-lg hover:bg-sky-100 focus:outline-none focus:ring-2 focus:ring-sky-400 transition-colors duration-150";
    button.textContent = `${option.id.toUpperCase()}. ${option.text}`;
    button.dataset.optionId = option.id;
    button.dataset.optionText = option.text;
    button.onclick = () => selectMcqOption(button, option.id, option.text);
    mcqOptionsContainer.appendChild(button);
  });
  mcqSubmitButton.textContent =
    currentMcqIndex === mcqData.length - 1
      ? "Finish Quiz & Submit"
      : "Next Question";
}

function selectMcqOption(buttonElement, optionId, optionText) {
  if (selectedMcqOptionElement) {
    selectedMcqOptionElement.classList.remove(
      "selected-option",
      "bg-sky-600",
      "text-white",
      "border-sky-600"
    );
    selectedMcqOptionElement.classList.add(
      "hover:bg-sky-100",
      "border-slate-300"
    );
  }
  buttonElement.classList.add(
    "selected-option",
    "bg-sky-600",
    "text-white",
    "border-sky-600"
  );
  buttonElement.classList.remove("hover:bg-sky-100", "border-slate-300");
  selectedMcqOption = { id: optionId, text: optionText };
  selectedMcqOptionElement = buttonElement;
}

function handleMcqSubmit() {
  clearError();
  if (!selectedMcqOption) {
    showAlert("Please select an answer.");
    return;
  }
  mcqAnswers.push({
    question: mcqData[currentMcqIndex].question,
    selectedAnswer: selectedMcqOption.id,
    selectedAnswerText: selectedMcqOption.text,
    correctAnswer: mcqData[currentMcqIndex].correctAnswer,
  });
  currentMcqIndex++;
  if (currentMcqIndex < mcqData.length) {
    loadMcqQuestion();
  } else {
    loadCompletionSection();
  }
}

// Alternative form submission method (bypasses CORS issues)
async function sendDataToGoogleSheet() {
  if (
    !GOOGLE_APPS_SCRIPT_URL ||
    GOOGLE_APPS_SCRIPT_URL === "YOUR_GOOGLE_APPS_SCRIPT_URL_HERE"
  ) {
    console.warn(
      "Google Apps Script URL is not configured. Skipping data submission."
    );
    submissionStatusMessage.textContent =
      "Data submission to server is not configured.";
    submissionStatusMessage.className = "text-orange-500 font-medium my-3";
    return;
  }

  submissionStatusMessage.textContent = "Submitting your responses...";
  submissionStatusMessage.className = "text-sky-600 font-medium my-3";

  const payload = {
    firstName: firstName,
    email: email,
    phone: phone,
    initialAnswers: initialAnswers,
    mcqAnswers: mcqAnswers,
  };

  try {
    // Create a hidden form and submit it (bypasses CORS)
    const form = document.createElement("form");
    form.method = "POST";
    form.action = GOOGLE_APPS_SCRIPT_URL;
    form.target = "_blank"; // Opens in new tab
    form.style.display = "none";

    // Add the JSON data as a hidden input
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = "data";
    input.value = JSON.stringify(payload);
    form.appendChild(input);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);

    // Since we can't get a direct response with form submission, we assume success
    setTimeout(() => {
      submissionStatusMessage.textContent =
        "Your responses have been submitted successfully! A confirmation window should have opened.";
      submissionStatusMessage.className = "text-green-600 font-medium my-3";
    }, 1000);
  } catch (error) {
    console.error("Error submitting data to Google Sheet:", error);
    submissionStatusMessage.textContent = `Error: ${error.message}. Your data has not been saved to the central sheet. You can still download it as CSV.`;
    submissionStatusMessage.className = "text-red-600 font-medium my-3";
  }
}

function loadCompletionSection() {
  showSection("completionSection");
  completionSectionTitle.textContent = `Thank You, ${firstName}!`;
  sendDataToGoogleSheet(); // Attempt to send data to Google Sheet
}

function restartApp() {
  firstName = "";
  currentInitialQuestionIndex = 0;
  initialAnswers.length = 0;
  email = "";
  phone = "";
  currentMcqIndex = 0;
  mcqAnswers.length = 0;
  selectedMcqOption = null;
  selectedMcqOptionElement = null;

  [firstNameInput, initialQuestionAnswer, emailInput, phoneInput].forEach(
    (el) => (el.value = "")
  );
  submissionStatusMessage.textContent = "";
  clearError();
  showSection("nameSection");
}

function downloadDataAsCSV() {
  let csvContent = "";
  const headers = ["FirstName", "Email", "Phone"];
  initialQuestions.forEach((q, i) => {
    headers.push(`InitialQ${i + 1}_Text`);
    headers.push(`InitialQ${i + 1}_Answer`);
  });
  mcqData.forEach((m, i) => {
    headers.push(`MCQ${i + 1}_Question`);
    headers.push(`MCQ${i + 1}_SelectedID`);
    headers.push(`MCQ${i + 1}_SelectedText`);
    headers.push(`MCQ${i + 1}_CorrectID`);
  });
  csvContent += headers.map((h) => escapeCSVField(h)).join(",") + "\r\n";

  const dataRow = [
    escapeCSVField(firstName),
    escapeCSVField(email),
    escapeCSVField(phone),
  ];
  initialAnswers.forEach((ans) => {
    dataRow.push(escapeCSVField(ans.question));
    dataRow.push(escapeCSVField(ans.answer));
  });
  mcqAnswers.forEach((ans) => {
    dataRow.push(escapeCSVField(ans.question));
    dataRow.push(escapeCSVField(ans.selectedAnswer));
    dataRow.push(escapeCSVField(ans.selectedAnswerText));
    dataRow.push(escapeCSVField(ans.correctAnswer));
  });
  csvContent += dataRow.join(",") + "\r\n";

  const encodedUri =
    "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  link.setAttribute(
    "download",
    `ai_academy_insights_${sanitizeInput(firstName || "user")}_${timestamp}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showAlert("Your insights data has been prepared for download as a CSV file!");
}
