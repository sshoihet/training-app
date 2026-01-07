// app.js - Multi-Media Support

// 1. STATE VARIABLES
let currentLessonIndex = 0;
let maxProgress = parseInt(localStorage.getItem('splashPadTrainingProgress')) || 0;
let currentSelectedAnswer = null;
let player; // YouTube player instance

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
const descContainer = document.getElementById('desc-container');

// 3. INITIALIZATION
document.addEventListener('DOMContentLoaded', () => {
    updateProgressDisplay();
    renderSidebar();
    submitBtn.addEventListener('click', handleSubmit);
    loadYoutubeAPI(); 
});

function loadYoutubeAPI() {
    window.onYouTubeIframeAPIReady = function() {
        loadLesson(maxProgress < courseData.length ? maxProgress : 0);
    };
    // Check if API is already loaded (reloads/navigation)
    if (window.YT && window.YT.Player) {
        loadLesson(maxProgress < courseData.length ? maxProgress : 0);
    } else {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
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

// 5. LOAD LESSON (The Big Update)
function loadLesson(index) {
    currentLessonIndex = index;
    const course = courseData[index];

    // Update Text
    lessonTitle.innerText = course.title;
    lessonDesc.innerText = course.description;
    
    // Reset UI
    quizSection.classList.add('hidden');
    descContainer.style.display = 'block'; // Ensure description is visible
    
    // Clean up previous video player if exists
    if (player) {
        // We only destroy if it's a valid YT object to prevent errors
        try { player.destroy(); } catch(e) {}
        player = null;
    }

    // --- MEDIA SWITCHER ---
    if (course.mediaType === 'video') {
        // RENDER YOUTUBE
        videoPlayerContainer.innerHTML = '<div id="yt-player-target"></div>';
        
        player = new YT.Player('yt-player-target', {
            height: '100%',
            width: '100%',
            videoId: course.source,
            events: {
                'onStateChange': onPlayerStateChange
            }
        });
    } 
    else if (course.mediaType === 'image') {
        // RENDER IMAGE + "READY" BUTTON
        videoPlayerContainer.innerHTML = `
            <div style="height:100%; display:flex; flex-direction:column;">
                <img src="${course.source}" style="width:100%; height:auto; max-height:85%; object-fit:contain; background:#f0f0f0;">
                <div style="text-align:center; padding: 10px; background: #eee;">
                    <button id="img-done-btn" class="btn-primary" style="width:auto; display:inline-block;">
                        I have studied this diagram. Start Quiz ->
                    </button>
                </div>
            </div>
        `;
        
        // Add click listener to the new button
        document.getElementById('img-done-btn').addEventListener('click', () => {
            quizSection.classList.remove('hidden');
        });
    }

    // Check if already completed (Show quiz immediately)
    if (index < maxProgress) {
        quizSection.classList.remove('hidden');
    }

    buildQuiz(course.quiz);
    renderSidebar(); 
}

// 6. DETECT VIDEO END
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        quizSection.classList.remove('hidden');
    }
}

// 7. QUIZ BUILDER (Unchanged)
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

// 8. HANDLE SUBMIT (Unchanged)
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
        alert("Incorrect. Review the material and try again.");
    }
}

// 9. CERTIFICATE (Unchanged)
function showCompletionScreen() {
    document.getElementById('desc-container').style.display = 'none';
    quizSection.classList.add('hidden');
    
    const completionSection = document.getElementById('completion-section');
    completionSection.classList.remove('hidden');
    
    const btn = document.getElementById('download-cert-btn');
    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    newBtn.addEventListener('click', () => {
        const name = document.getElementById('user-name').value;
        if(name.trim() === "") { alert("Enter name"); return; }
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
    
    doc.setFontSize(30);
    doc.text(studentName, 148.5, 105, null, null, "center");
    
    doc.setFontSize(22);
    doc.text("Splash Pad Systems & Maintenance", 148.5, 145, null, null, "center");
    
    doc.save("SplashPad-Certificate.pdf");
}

function updateProgressDisplay() {
    const percent = Math.round((maxProgress / courseData.length) * 100);
    progressDisplay.innerText = percent + "% Complete";
}