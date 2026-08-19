/* =========================================================
   NEXORA — SCRIPT.JS
   Complete Application Logic
   ========================================================= */

"use strict";

/* =========================================================
   STORAGE
========================================================= */

const STORAGE_KEY = "nexora_data_v1";

const defaultData = {
    theme: "dark",

    user: {
        name: "NEXORA User",
        level: "Level 1"
    },

    tasks: [
        {
            id: 1,
            name: "Study English vocabulary",
            priority: "High",
            done: false
        },
        {
            id: 2,
            name: "Complete today's lesson",
            priority: "Medium",
            done: false
        },
        {
            id: 3,
            name: "Review previous notes",
            priority: "Low",
            done: true
        }
    ],

    notes: [
        {
            id: 1,
            title: "Welcome to NEXORA",
            body: "Learn. Focus. Grow. Your personal learning workspace.",
            date: new Date().toLocaleDateString()
        }
    ],

    settings: {
        notifications: true,
        sounds: true,
        autoSave: true
    },

    stats: {
        studyMinutes: 0,
        completedTasks: 0,
        quizzes: 0,
        streak: 1
    }
};

let data = loadData();

function loadData() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);

        if (!saved) {
            return structuredClone(defaultData);
        }

        const parsed = JSON.parse(saved);

        return {
            ...structuredClone(defaultData),
            ...parsed,
            user: {
                ...defaultData.user,
                ...(parsed.user || {})
            },
            settings: {
                ...defaultData.settings,
                ...(parsed.settings || {})
            },
            stats: {
                ...defaultData.stats,
                ...(parsed.stats || {})
            },
            tasks: Array.isArray(parsed.tasks)
                ? parsed.tasks
                : structuredClone(defaultData.tasks),
            notes: Array.isArray(parsed.notes)
                ? parsed.notes
                : structuredClone(defaultData.notes)
        };
    } catch (error) {
        console.error("NEXORA storage error:", error);
        return structuredClone(defaultData);
    }
}

function saveData() {
    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(data)
        );
    } catch (error) {
        console.error("NEXORA save error:", error);
    }
}


/* =========================================================
   HELPERS
========================================================= */

const $ = (selector, parent = document) =>
    parent.querySelector(selector);

const $$ = (selector, parent = document) =>
    [...parent.querySelectorAll(selector)];

function escapeHTML(value) {
    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function generateId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

function formatDate(date = new Date()) {
    return date.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric"
    });
}


/* =========================================================
   THEME
========================================================= */

function applyTheme() {
    document.body.classList.toggle(
        "light",
        data.theme === "light"
    );

    updateThemeButtons();
}

function toggleTheme() {
    data.theme =
        data.theme === "dark"
            ? "light"
            : "dark";

    saveData();
    applyTheme();

    showToast(
        data.theme === "light"
            ? "Light mode enabled"
            : "Dark mode enabled"
    );
}

function updateThemeButtons() {
    const themeButtons = [
        ...$$("[data-theme-toggle]"),
        ...$$("#themeToggle"),
        ...$$("#mobileThemeToggle")
    ];

    themeButtons.forEach(button => {
        button.setAttribute(
            "aria-label",
            data.theme === "dark"
                ? "Switch to light mode"
                : "Switch to dark mode"
        );

        button.textContent =
            data.theme === "dark"
                ? "☀️"
                : "🌙";
    });
}


/* =========================================================
   NAVIGATION
========================================================= */

function navigateTo(pageName) {
    const pages = $$(".page");

    if (!pages.length) return;

    pages.forEach(page => {
        page.classList.toggle(
            "active",
            page.dataset.page === pageName
        );
    });

    const navButtons = $$(
        ".nav button, .bottom-nav button"
    );

    navButtons.forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.page === pageName
        );
    });

    updatePageTitle(pageName);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

function updatePageTitle(pageName) {
    const titles = {
        home: {
            title: "Dashboard",
            subtitle: "Your personal learning workspace."
        },

        tasks: {
            title: "Tasks",
            subtitle: "Organize your work and stay productive."
        },

        notes: {
            title: "Notes",
            subtitle: "Keep your ideas and knowledge organized."
        },

        timer: {
            title: "Focus Timer",
            subtitle: "Focus deeply. Work smarter."
        },

        quiz: {
            title: "Quiz",
            subtitle: "Test your knowledge and improve."
        },

        achievements: {
            title: "Achievements",
            subtitle: "Every milestone matters."
        },

        settings: {
            title: "Settings",
            subtitle: "Customize your NEXORA experience."
        }
    };

    const page = titles[pageName] || titles.home;

    const title = $(".page-title");
    const subtitle = $(".page-subtitle");

    if (title) {
        title.textContent = page.title;
    }

    if (subtitle) {
        subtitle.textContent = page.subtitle;
    }
}


/* =========================================================
   TASKS
========================================================= */

function renderTasks() {
    const containers = $$(
        ".task-list"
    );

    containers.forEach(container => {
        if (!data.tasks.length) {
            container.innerHTML = `
                <div class="empty">
                    <div class="empty-icon">✅</div>
                    <div class="empty-title">
                        No tasks yet
                    </div>
                    <div class="empty-text">
                        Create a task and start making progress.
                    </div>
                </div>
            `;

            return;
        }

        container.innerHTML = data.tasks
            .map(task => `
                <div
                    class="task ${task.done ? "done" : ""}"
                    data-task-id="${task.id}"
                >

                    <button
                        class="task-check"
                        data-action="toggle-task"
                        data-id="${task.id}"
                        aria-label="Complete task"
                    >
                        ${task.done ? "✓" : ""}
                    </button>

                    <div class="task-name">
                        ${escapeHTML(task.name)}
                    </div>

                    <span class="task-priority">
                        ${escapeHTML(task.priority)}
                    </span>

                    <button
                        class="task-delete"
                        data-action="delete-task"
                        data-id="${task.id}"
                        aria-label="Delete task"
                    >
                        ×
                    </button>

                </div>
            `)
            .join("");
    });

    updateStats();
}

function addTask(name, priority = "Medium") {
    const cleanName = name.trim();

    if (!cleanName) {
        showToast("Please enter a task.");
        return;
    }

    data.tasks.unshift({
        id: generateId(),
        name: cleanName,
        priority,
        done: false
    });

    saveData();
    renderTasks();

    showToast("Task added successfully.");
}

function toggleTask(id) {
    const task = data.tasks.find(
        item => Number(item.id) === Number(id)
    );

    if (!task) return;

    task.done = !task.done;

    saveData();
    renderTasks();

    showToast(
        task.done
            ? "Task completed 🎉"
            : "Task marked as active."
    );
}

function deleteTask(id) {
    const before = data.tasks.length;

    data.tasks = data.tasks.filter(
        task => Number(task.id) !== Number(id)
    );

    if (data.tasks.length === before) return;

    saveData();
    renderTasks();

    showToast("Task deleted.");
}


/* =========================================================
   NOTES
========================================================= */

function renderNotes() {
    const containers = $$(".notes-grid");

    containers.forEach(container => {
        if (!data.notes.length) {
            container.innerHTML = `
                <div class="empty">
                    <div class="empty-icon">📝</div>
                    <div class="empty-title">
                        No notes yet
                    </div>
                    <div class="empty-text">
                        Create your first note.
                    </div>
                </div>
            `;

            return;
        }

        container.innerHTML = data.notes
            .map(note => `
                <article
                    class="note"
                    data-note-id="${note.id}"
                >

                    <div class="note-title">
                        ${escapeHTML(note.title)}
                    </div>

                    <div class="note-body">
                        ${escapeHTML(note.body)}
                    </div>

                    <div class="note-footer">

                        <span class="note-date">
                            ${escapeHTML(note.date)}
                        </span>

                        <button
                            class="btn btn-danger"
                            data-action="delete-note"
                            data-id="${note.id}"
                        >
                            Delete
                        </button>

                    </div>

                </article>
            `)
            .join("");
    });
}

function addNote(title, body) {
    title = title.trim();
    body = body.trim();

    if (!title || !body) {
        showToast("Please complete the note.");
        return;
    }

    data.notes.unshift({
        id: generateId(),
        title,
        body,
        date: formatDate()
    });

    saveData();
    renderNotes();

    showToast("Note saved successfully.");
}

function deleteNote(id) {
    data.notes = data.notes.filter(
        note => Number(note.id) !== Number(id)
    );

    saveData();
    renderNotes();

    showToast("Note deleted.");
}


/* =========================================================
   STATS
========================================================= */

function updateStats() {
    const completedTasks =
        data.tasks.filter(task => task.done).length;

    data.stats.completedTasks = completedTasks;

    const statNumbers = $$(".stat-number");

    if (statNumbers.length >= 4) {
        statNumbers[0].textContent =
            data.stats.studyMinutes;

        statNumbers[1].textContent =
            completedTasks;

        statNumbers[2].textContent =
            data.stats.quizzes;

        statNumbers[3].textContent =
            data.stats.streak;
    }

    const completed = completedTasks;
    const total = data.tasks.length;

    const percentage =
        total === 0
            ? 0
            : Math.round(
                (completed / total) * 100
            );

    $$(".progress-bar").forEach(bar => {
        bar.style.width = `${percentage}%`;
    });

    $$(".progress-info").forEach(info => {
        const percentageElement =
            info.querySelector(
                "[data-progress-percentage]"
            );

        if (percentageElement) {
            percentageElement.textContent =
                `${percentage}%`;
        }
    });

    saveData();
}


/* =========================================================
   SEARCH
========================================================= */

function setupSearch() {
    const searchInputs =
        $$(".search input");

    searchInputs.forEach(input => {
        input.addEventListener(
            "input",
            () => {

                const query =
                    input.value
                        .trim()
                        .toLowerCase();

                $$(".task").forEach(task => {
                    const text =
                        task.textContent
                            .toLowerCase();

                    task.style.display =
                        !query ||
                        text.includes(query)
                            ? ""
                            : "none";
                });

                $$(".note").forEach(note => {
                    const text =
                        note.textContent
                            .toLowerCase();

                    note.style.display =
                        !query ||
                        text.includes(query)
                            ? ""
                            : "none";
                });
            }
        );
    });
}


/* =========================================================
   MODALS
========================================================= */

function openModal(id) {
    const modal = document.getElementById(id);

    if (!modal) return;

    modal.classList.add("open");

    document.body.style.overflow = "hidden";

    const firstInput =
        modal.querySelector(
            "input, textarea, select"
        );

    if (firstInput) {
        setTimeout(
            () => firstInput.focus(),
            100
        );
    }
}

function closeModal(modal) {
    if (!modal) return;

    modal.classList.remove("open");

    document.body.style.overflow = "";
}

function closeAllModals() {
    $$(".modal.open").forEach(closeModal);
}


/* =========================================================
   TIMER
========================================================= */

const timerState = {
    mode: "focus",
    durations: {
        focus: 25 * 60,
        short: 5 * 60,
        long: 15 * 60
    },
    remaining: 25 * 60,
    running: false,
    interval: null
};

function initializeTimer() {
    timerState.remaining =
        timerState.durations.focus;

    updateTimerDisplay();
}

function setTimerMode(mode) {
    if (!timerState.durations[mode]) {
        return;
    }

    stopTimer();

    timerState.mode = mode;

    timerState.remaining =
        timerState.durations[mode];

    $$(".timer-mode button").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.mode === mode
        );
    });

    updateTimerDisplay();
}

function updateTimerDisplay() {
    const minutes =
        Math.floor(
            timerState.remaining / 60
        );

    const seconds =
        timerState.remaining % 60;

    const display =
        $(".timer-display");

    if (display) {
        display.textContent =
            `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }

    const status =
        $(".timer-status");

    if (status) {
        if (timerState.running) {
            status.textContent =
                timerState.mode === "focus"
                    ? "Focus session in progress..."
                    : "Break in progress...";
        } else {
            status.textContent =
                timerState.mode === "focus"
                    ? "Ready for a focused session."
                    : "Take a short break.";
        }
    }

    const mainButton =
        $(".timer-main");

    if (mainButton) {
        mainButton.textContent =
            timerState.running
                ? "Pause"
                : "Start";
    }
}

function startTimer() {
    if (timerState.running) {
        stopTimer();
        return;
    }

    timerState.running = true;

    timerState.interval =
        setInterval(() => {

            if (timerState.remaining <= 0) {
                finishTimer();
                return;
            }

            timerState.remaining--;

            updateTimerDisplay();

        }, 1000);

    updateTimerDisplay();
}

function stopTimer() {
    timerState.running = false;

    if (timerState.interval) {
        clearInterval(
            timerState.interval
        );

        timerState.interval = null;
    }

    updateTimerDisplay();
}

function resetTimer() {
    stopTimer();

    timerState.remaining =
        timerState.durations[
            timerState.mode
        ];

    updateTimerDisplay();
}

function finishTimer() {
    stopTimer();

    if (timerState.mode === "focus") {
        data.stats.studyMinutes += 25;
        saveData();
        updateStats();
    }

    playNotificationSound();

    showToast(
        timerState.mode === "focus"
            ? "Focus session completed! 🎉"
            : "Break finished. Ready?"
    );

    resetTimer();
}


/* =========================================================
   SOUND
========================================================= */

function playNotificationSound() {
    if (!data.settings.sounds) {
        return;
    }

    try {
        const AudioContext =
            window.AudioContext ||
            window.webkitAudioContext;

        if (!AudioContext) return;

        const context =
            new AudioContext();

        const oscillator =
            context.createOscillator();

        const gain =
            context.createGain();

        oscillator.frequency.value = 880;
        oscillator.type = "sine";

        gain.gain.setValueAtTime(
            0.0001,
            context.currentTime
        );

        gain.gain.exponentialRampToValueAtTime(
            0.15,
            context.currentTime + 0.02
        );

        gain.gain.exponentialRampToValueAtTime(
            0.0001,
            context.currentTime + 0.5
        );

        oscillator.connect(gain);
        gain.connect(context.destination);

        oscillator.start();

        oscillator.stop(
            context.currentTime + 0.5
        );
    } catch (error) {
        console.warn(
            "Sound unavailable:",
            error
        );
    }
}


/* =========================================================
   QUIZ
========================================================= */

const quizQuestions = [
    {
        question:
            "Which language is mainly used to structure web pages?",
        answers: [
            "HTML",
            "Python",
            "SQL",
            "C++"
        ],
        correct: 0
    },

    {
        question:
            "Which technology is responsible mainly for styling a web page?",
        answers: [
            "JavaScript",
            "CSS",
            "Python",
            "PHP"
        ],
        correct: 1
    },

    {
        question:
            "Which language adds interactivity to web pages?",
        answers: [
            "HTML",
            "CSS",
            "JavaScript",
            "SQL"
        ],
        correct: 2
    },

    {
        question:
            "What does CSS stand for?",
        answers: [
            "Computer Style System",
            "Cascading Style Sheets",
            "Creative Style Syntax",
            "Colorful Style System"
        ],
        correct: 1
    },

    {
        question:
            "Which method converts JSON text into a JavaScript object?",
        answers: [
            "JSON.parse()",
            "JSON.object()",
            "JSON.convert()",
            "JSON.read()"
        ],
        correct: 0
    }
];

let quizState = {
    index: 0,
    score: 0,
    answered: false
};

function renderQuiz() {
    const questionElement =
        $(".quiz-question");

    const answersElement =
        $(".answers");

    const metaElement =
        $(".quiz-meta");

    if (
        !questionElement ||
        !answersElement
    ) {
        return;
    }

    const question =
        quizQuestions[quizState.index];

    if (!question) {
        renderQuizResult();
        return;
    }

    quizState.answered = false;

    questionElement.textContent =
        question.question;

    answersElement.innerHTML =
        question.answers
            .map((answer, index) => `
                <button
                    class="answer"
                    data-quiz-answer="${index}"
                >
                    ${escapeHTML(answer)}
                </button>
            `)
            .join("");

    if (metaElement) {
        metaElement.innerHTML = `
            <span>
                Question ${quizState.index + 1}
                / ${quizQuestions.length}
            </span>

            <span>
                Score: ${quizState.score}
            </span>
        `;
    }
}

function answerQuiz(index) {
    if (quizState.answered) {
        return;
    }

    const question =
        quizQuestions[quizState.index];

    if (!question) return;

    quizState.answered = true;

    const buttons =
        $$(".answer");

    buttons.forEach(button => {
        button.disabled = true;
    });

    const selected =
        buttons[index];

    if (!selected) return;

    if (index === question.correct) {
        selected.classList.add("correct");

        quizState.score++;

        showToast("Correct! 🎉");
    } else {
        selected.classList.add("wrong");

        const correctButton =
            buttons[question.correct];

        if (correctButton) {
            correctButton.classList.add(
                "correct"
            );
        }

        showToast("Not quite. Keep learning!");
    }

    setTimeout(() => {
        quizState.index++;

        if (
            quizState.index >=
            quizQuestions.length
        ) {
            finishQuiz();
        } else {
            renderQuiz();
        }
    }, 900);
}

function finishQuiz() {
    data.stats.quizzes++;

    saveData();
    updateStats();

    renderQuizResult();
}

function renderQuizResult() {
    const questionElement =
        $(".quiz-question");

    const answersElement =
        $(".answers");

    const metaElement =
        $(".quiz-meta");

    if (!questionElement) return;

    const percentage =
        Math.round(
            (quizState.score /
                quizQuestions.length) *
            100
        );

    questionElement.textContent =
        `Quiz complete — ${percentage}%`;

    if (answersElement) {
        answersElement.innerHTML = `
            <div class="empty">
                <div class="empty-icon">🏆</div>

                <div class="empty-title">
                    You scored
                    ${quizState.score}
                    /
                    ${quizQuestions.length}
                </div>

                <div class="empty-text">
                    Great work. Keep improving your knowledge.
                </div>

                <br>

                <button
                    class="btn btn-primary"
                    data-action="restart-quiz"
                >
                    Try Again
                </button>
            </div>
        `;
    }

    if (metaElement) {
        metaElement.innerHTML = `
            <span>Quiz finished</span>
            <span>${percentage}%</span>
        `;
    }
}

function restartQuiz() {
    quizState = {
        index: 0,
        score: 0,
        answered: false
    };

    renderQuiz();
}


/* =========================================================
   SETTINGS
========================================================= */

function renderSettings() {
    $$("[data-setting]").forEach(element => {
        const key =
            element.dataset.setting;

        const enabled =
            Boolean(
                data.settings[key]
            );

        element.classList.toggle(
            "on",
            enabled
        );

        element.setAttribute(
            "aria-checked",
            String(enabled)
        );
    });
}

function toggleSetting(key) {
    if (
        !Object.prototype.hasOwnProperty.call(
            data.settings,
            key
        )
    ) {
        return;
    }

    data.settings[key] =
        !data.settings[key];

    saveData();
    renderSettings();

    showToast(
        `${key} ${data.settings[key] ? "enabled" : "disabled"}`
    );
}


/* =========================================================
   ACHIEVEMENTS
========================================================= */

function updateAchievements() {
    const completed =
        data.tasks.filter(
            task => task.done
        ).length;

    const achievements =
        $$(".achievement");

    achievements.forEach(achievement => {
        const requirement =
            Number(
                achievement.dataset.requirement ||
                0
            );

        if (
            requirement &&
            completed >= requirement
        ) {
            achievement.classList.remove(
                "locked"
            );
        }
    });
}


/* =========================================================
   TOAST
========================================================= */

function showToast(message) {
    let container =
        $(".toast-container");

    if (!container) {
        container =
            document.createElement("div");

        container.className =
            "toast-container";

        document.body.appendChild(
            container
        );
    }

    const toast =
        document.createElement("div");

    toast.className = "toast";

    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform =
            "translateX(20px)";

        setTimeout(() => {
            toast.remove();
        }, 250);
    }, 2800);
}


/* =========================================================
   EVENT DELEGATION
========================================================= */

document.addEventListener(
    "click",
    event => {

        const actionElement =
            event.target.closest(
                "[data-action]"
            );

        if (actionElement) {

            const action =
                actionElement.dataset.action;

            const id =
                actionElement.dataset.id;

            switch (action) {

                case "toggle-task":
                    toggleTask(id);
                    break;

                case "delete-task":
                    deleteTask(id);
                    break;

                case "delete-note":
                    deleteNote(id);
                    break;

                case "restart-quiz":
                    restartQuiz();
                    break;

                case "toggle-theme":
                    toggleTheme();
                    break;

                case "open-task-modal":
                    openModal("taskModal");
                    break;

                case "open-note-modal":
                    openModal("noteModal");
                    break;

                case "close-modal":
                    closeModal(
                        actionElement.closest(
                            ".modal"
                        )
                    );
                    break;

                case "timer-start":
                    startTimer();
                    break;

                case "timer-reset":
                    resetTimer();
                    break;

                default:
                    break;
            }
        }

        const pageButton =
            event.target.closest(
                "[data-page]"
            );

        if (
            pageButton &&
            !event.target.closest(
                "[data-action]"
            )
        ) {
            navigateTo(
                pageButton.dataset.page
            );
        }

        const timerMode =
            event.target.closest(
                "[data-mode]"
            );

        if (
            timerMode &&
            timerMode.closest(".timer-mode")
        ) {
            setTimerMode(
                timerMode.dataset.mode
            );
        }

        const quizAnswer =
            event.target.closest(
                "[data-quiz-answer]"
            );

        if (quizAnswer) {
            answerQuiz(
                Number(
                    quizAnswer.dataset.quizAnswer
                )
            );
        }

        const setting =
            event.target.closest(
                "[data-setting]"
            );

        if (
            setting &&
            !setting.dataset.action
        ) {
            toggleSetting(
                setting.dataset.setting
            );
        }
    }
);


/* =========================================================
   MODAL EVENTS
========================================================= */

document.addEventListener(
    "click",
    event => {

        if (
            event.target.classList.contains(
                "modal"
            )
        ) {
            closeModal(event.target);
        }
    }
);

document.addEventListener(
    "keydown",
    event => {

        if (event.key === "Escape") {
            closeAllModals();
        }
    }
);


/* =========================================================
   TASK FORM
========================================================= */

function setupTaskForm() {
    const form =
        $("#taskForm");

    if (!form) return;

    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const name =
                form.querySelector(
                    "[name='task']"
                );

            const priority =
                form.querySelector(
                    "[name='priority']"
                );

            addTask(
                name
                    ? name.value
                    : "",

                priority
                    ? priority.value
                    : "Medium"
            );

            form.reset();

            closeAllModals();
        }
    );
}


/* =========================================================
   NOTE FORM
========================================================= */

function setupNoteForm() {
    const form =
        $("#noteForm");

    if (!form) return;

    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();

            const title =
                form.querySelector(
                    "[name='title']"
                );

            const body =
                form.querySelector(
                    "[name='body']"
                );

            addNote(
                title
                    ? title.value
                    : "",

                body
                    ? body.value
                    : ""
            );

            form.reset();

            closeAllModals();
        }
    );
}


/* =========================================================
   KEYBOARD SHORTCUTS
========================================================= */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.target.matches(
                "input, textarea, select"
            )
        ) {
            return;
        }

        if (
            event.code === "Space" &&
            $(".page.active")?.dataset.page ===
                "timer"
        ) {
            event.preventDefault();
            startTimer();
        }

        if (
            event.key.toLowerCase() === "r" &&
            $(".page.active")?.dataset.page ===
                "timer"
        ) {
            resetTimer();
        }
    }
);


/* =========================================================
   AUTO SAVE
========================================================= */

setInterval(() => {
    if (data.settings.autoSave) {
        saveData();
    }
}, 5000);


/* =========================================================
   INITIALIZATION
========================================================= */

function initializeNexora() {

    applyTheme();

    renderTasks();

    renderNotes();

    renderSettings();

    updateAchievements();

    updateStats();

    initializeTimer();

    renderQuiz();

    setupSearch();

    setupTaskForm();

    setupNoteForm();

    navigateTo("home");

    console.log(
        "%cNEXORA",
        "color:#7c5cff;font-size:30px;font-weight:900;"
    );

    console.log(
        "%cLearn. Focus. Grow.",
        "color:#9b86ff;font-size:14px;"
    );
}


/* =========================================================
   START APP
========================================================= */

if (
    document.readyState === "loading"
) {
    document.addEventListener(
        "DOMContentLoaded",
        initializeNexora
    );
} else {
    initializeNexora();
}
