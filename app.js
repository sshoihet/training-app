// app.js

// 1. STATE VARIABLES
let currentLessonIndex = 0;
let maxProgress = parseInt(localStorage.getItem('splashPadTrainingProgress')) || 0;
let currentSelectedAnswer = null;
let player; 

// 2. DOM ELEMENTS
const moduleList = document.getElementById('module-list');
const lessonTitle = document.getElementById('lesson-title');
const lessonDesc = document.getElementById('lesson-desc');
const videoPlayerContainer = document.getElementById('video-player');
const quizSection = document.getElementById('quiz-section');
const quizQuestion = document.getElementById('quiz-question');
const quizOptions = document.getElementById('quiz-options');
const submitBtn = document.getElementById('submit-answer');
const progressDisplay = document.getElementById('progress-percent');

// 3. INITIALIZATION & YOUTUBE LOADING (THE FIX)
document.addEventListener('DOMContentLoaded', () => {
    updateProgressDisplay();
    renderSidebar();
    loadYoutubeAPI(); // Manually trigger the API load
});

function loadYoutubeAPI() {
    // 1. Define the callback function GLOBALLY so YouTube can find it
    window.onYouTubeIframeAPIReady = function() {
        // Once API is ready, load the first lesson
        loadLesson(maxProgress < courseData.length ? maxProgress : 0);
    };

    // 2. Inject the script tag
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

// This function is automatically called by the YouTube API script when it loads
function onYouTubeIframeAPIReady() {
    loadLesson(maxProgress < courseData.length ? maxProgress : 0);
}

// 4. SIDEBAR LOGIC
function renderSidebar() {
    moduleList.innerHTML = ''; 
    courseData.forEach((course, index) => {
        const li = document.createElement('li');
        li.innerText = course.title;
        li.className = 'module-item';

        if (index < maxProgress) li.classList.add('completed');
        if (index > maxProgress) {
            li.classList.add('locked');
        } else {
            li.addEventListener('click', () => loadLesson(index));
        }

        if (index === currentLessonIndex) li.classList.add('active');
        moduleList.appendChild(li);
    });
}

// 5. LOAD LESSON (UPDATED FOR API)
function loadLesson(index) {
    currentLessonIndex = index;
    const course = courseData[index];

    // UI Updates
    lessonTitle.innerText = course.title;
    lessonDesc.innerText = course.description;
    
    // HIDE THE QUIZ INITIALLY
    quizSection.classList.add('hidden');
    
    // CHECK IF ALREADY COMPLETED
    // If user has already passed this level, show quiz immediately
    if (index < maxProgress) {
        quizSection.classList.remove('hidden');
    }

    // LOAD YOUTUBE PLAYER
    // If a player already exists, destroy it so we can create a new one
    if (player) {
        player.destroy();
    }

    // Create a fresh div for the player to latch onto
    videoPlayerContainer.innerHTML = '<div id="yt-player-target"></div>';

    player = new YT.Player('yt-player-target', {
        height: '100%',
        width: '100%',
        videoId: course.videoId,
        events: {
            'onStateChange': onPlayerStateChange
        }
    });

    // Build the quiz (it stays hidden until video ends)
    buildQuiz(course.quiz);
    renderSidebar(); 
}

// 6. DETECT VIDEO END (NEW)
function onPlayerStateChange(event) {
    // YT.PlayerState.ENDED is usually code 0
    if (event.data === YT.PlayerState.ENDED) {
        // Video finished! Show the quiz.
        quizSection.classList.remove('hidden');
    }
}

// 7. QUIZ BUILDER
function buildQuiz(quizData) {
    quizQuestion.innerText = quizData.question;
    quizOptions.innerHTML = ''; 
    currentSelectedAnswer = null;
    submitBtn.innerText = "Submit Answer";
    submitBtn.disabled = false;

    quizData.options.forEach((optionText, index) => {
        const btn = document.createElement('button');
        btn.innerText = optionText;
        btn.className = 'quiz-btn';
        
        btn.addEventListener('click', () => {
            document.querySelectorAll('.quiz-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            currentSelectedAnswer = index;
        });

        quizOptions.appendChild(btn);
    });
}

// 8. HANDLE SUBMIT
function handleSubmit() {
    if (currentSelectedAnswer === null) {
        alert("Please select an answer first.");
        return;
    }

    const correctIndex = courseData[currentLessonIndex].quiz.correctAnswer;
    const buttons = document.querySelectorAll('.quiz-btn');

    if (currentSelectedAnswer === correctIndex) {
        buttons[currentSelectedAnswer].classList.add('correct');
        submitBtn.innerText = "Correct! Next Lesson ->";
        
        if (currentLessonIndex === maxProgress) {
            maxProgress++;
            localStorage.setItem('splashPadTrainingProgress', maxProgress);
            updateProgressDisplay();
        }

        setTimeout(() => {
            if (currentLessonIndex + 1 < courseData.length) {
                loadLesson(currentLessonIndex + 1);
            } else {
                renderSidebar();
                showCompletionScreen();
            }
        }, 1500);

    } else {
        buttons[currentSelectedAnswer].classList.add('wrong');
        alert("Incorrect. Please re-watch the video if needed.");
        // Optional: Rewind video to start if they get it wrong?
        // player.seekTo(0); 
    }
}

// 9. CERTIFICATE GENERATION
function showCompletionScreen() {
    document.getElementById('video-section').classList.add('hidden');
    quizSection.classList.add('hidden');
    
    const completionSection = document.getElementById('completion-section');
    completionSection.classList.remove('hidden');
    
    // Remove old listeners to prevent duplicates if function runs twice
    const btn = document.getElementById('download-cert-btn');
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', () => {
        const name = document.getElementById('user-name').value;
        if(name.trim() === "") {
            alert("Please enter your name for the certificate.");
            return;
        }
        generatePDF(name);
    });
}

function generatePDF(studentName) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'landscape' });
    
    doc.setLineWidth(3);
    doc.setDrawColor(0, 95, 115); 
    doc.rect(10, 10, 277, 190); 
    
    doc.setFontSize(40);
    doc.setTextColor(0, 95, 115);
    doc.text("Certificate of Completion", 148.5, 50, null, null, "center");
    
    doc.setFontSize(16);
    doc.setTextColor(100);
    doc.text("This certifies that", 148.5, 80, null, null, "center");
    
    doc.setFontSize(30);
    doc.setTextColor(0);
    doc.text(studentName, 148.5, 105, null, null, "center");
    doc.setLineWidth(1);
    doc.line(70, 108, 227, 108); 
    
    doc.setFontSize(16);
    doc.setTextColor(100);
    doc.text("has successfully completed the training course:", 148.5, 130, null, null, "center");
    
    doc.setFontSize(22);
    doc.setTextColor(0, 95, 115);
    doc.text("Splash Pad Systems & Maintenance", 148.5, 145, null, null, "center");
    
    const today = new Date().toLocaleDateString();
    doc.setFontSize(12);
    doc.setTextColor(150);
    doc.text(`Date Issued: ${today}`, 148.5, 180, null, null, "center");

    doc.save("SplashPad-Certificate.pdf");
}

function updateProgressDisplay() {
    const percent = Math.round((maxProgress / courseData.length) * 100);
    progressDisplay.innerText = percent + "% Complete";
}