// app.js

// 1. STATE VARIABLES
let currentLessonIndex = 0;
let maxProgress = parseInt(localStorage.getItem('splashPadTrainingProgress')) || 0; // Load saved progress or default to 0
let currentSelectedAnswer = null; // Tracks which button the user just clicked

// 2. DOM ELEMENTS
const moduleList = document.getElementById('module-list');
const lessonTitle = document.getElementById('lesson-title');
const lessonDesc = document.getElementById('lesson-desc');
const videoPlayer = document.getElementById('video-player');
const quizSection = document.getElementById('quiz-section');
const quizQuestion = document.getElementById('quiz-question');
const quizOptions = document.getElementById('quiz-options');
const submitBtn = document.getElementById('submit-answer');
const progressDisplay = document.getElementById('progress-percent');

// 3. INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    updateProgressDisplay();
    renderSidebar();
    
    // Load the furthest unlocked lesson, or the first one
    loadLesson(maxProgress < courseData.length ? maxProgress : 0);
    
    // Attach event listener to the Submit button
    submitBtn.addEventListener('click', handleSubmit);
});

// 4. SIDEBAR LOGIC (With Locking)
function renderSidebar() {
    moduleList.innerHTML = ''; 
    
    courseData.forEach((course, index) => {
        const li = document.createElement('li');
        li.innerText = course.title;
        li.className = 'module-item';

        // Check if this lesson is completed
        if (index < maxProgress) {
            li.classList.add('completed');
        }

        // Check if this lesson is locked (index is higher than progress)
        if (index > maxProgress) {
            li.classList.add('locked');
        } else {
            // Only add click listener if unlocked
            li.addEventListener('click', () => {
                loadLesson(index);
            });
        }

        // Highlight active
        if (index === currentLessonIndex) {
            li.classList.add('active');
        }

        moduleList.appendChild(li);
    });
}

// 5. LOAD LESSON
function loadLesson(index) {
    currentLessonIndex = index;
    const course = courseData[index];

    // UI Updates
    lessonTitle.innerText = course.title;
    lessonDesc.innerText = course.description;
    
    // Video Embed
    videoPlayer.innerHTML = `
        <iframe src="https://www.youtube.com/embed/${course.videoId}" 
        title="Training Video" frameborder="0" allowfullscreen></iframe>`;

    // Reset Quiz Area
    quizSection.classList.remove('hidden'); // Show quiz area
    buildQuiz(course.quiz);
    
    // Re-render sidebar to update the "Active" highlight
    renderSidebar(); 
}

// 6. QUIZ BUILDER
function buildQuiz(quizData) {
    quizQuestion.innerText = quizData.question;
    quizOptions.innerHTML = ''; // Clear old buttons
    currentSelectedAnswer = null;
    submitBtn.innerText = "Submit Answer";
    submitBtn.disabled = false;

    quizData.options.forEach((optionText, index) => {
        const btn = document.createElement('button');
        btn.innerText = optionText;
        btn.className = 'quiz-btn';
        
        btn.addEventListener('click', () => {
            // 1. Remove 'selected' from all other buttons
            document.querySelectorAll('.quiz-btn').forEach(b => b.classList.remove('selected'));
            // 2. Add 'selected' to this one
            btn.classList.add('selected');
            // 3. Update state
            currentSelectedAnswer = index;
        });

        quizOptions.appendChild(btn);
    });
}

// 7. HANDLE SUBMIT
function handleSubmit() {
    if (currentSelectedAnswer === null) {
        alert("Please select an answer first.");
        return;
    }

    const correctIndex = courseData[currentLessonIndex].quiz.correctAnswer;
    const buttons = document.querySelectorAll('.quiz-btn');

    if (currentSelectedAnswer === correctIndex) {
        // --- CORRECT ANSWER ---
        buttons[currentSelectedAnswer].classList.add('correct');
        submitBtn.innerText = "Correct! Next Lesson ->";
        
        // Save Progress (Only if we are at the user's current max level)
        if (currentLessonIndex === maxProgress) {
            maxProgress++;
            localStorage.setItem('splashPadTrainingProgress', maxProgress);
            updateProgressDisplay();
        }

        // Wait 1.5 seconds, then load next lesson
        setTimeout(() => {
            if (currentLessonIndex + 1 < courseData.length) {
                loadLesson(currentLessonIndex + 1);
            } else {
                alert("Congratulations! You have completed the entire training course.");
                renderSidebar(); // Refresh checkmarks
            }
        }, 1500);

    } else {
        // --- WRONG ANSWER ---
        buttons[currentSelectedAnswer].classList.add('wrong');
        alert("Incorrect. Please watch the video and try again.");
    }
}

// 8. UPDATE PROGRESS BAR TEXT
function updateProgressDisplay() {
    const percent = Math.round((maxProgress / courseData.length) * 100);
    progressDisplay.innerText = percent + "% Complete";
}