// app.js

// 1. STATE VARIABLES
let currentLessonIndex = 0;
// Parse the saved progress from local storage, default to 0 if not found
let maxProgress = parseInt(localStorage.getItem('splashPadTrainingProgress')) || 0;
let currentSelectedAnswer = null;
let player; // This will hold our YouTube player instance

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
    
    // Attach the submit listener once here
    submitBtn.addEventListener('click', handleSubmit);
    
    // Trigger YouTube API loading
    loadYoutubeAPI(); 
});

// Function to handle YouTube API loading securely
function loadYoutubeAPI() {
    // 1. Define the callback function GLOBALLY so YouTube can find it
    window.onYouTubeIframeAPIReady = function() {
        // Once API is ready, load the correct lesson
        loadLesson(maxProgress < courseData.length ? maxProgress : 0);
    };

    // 2. Check if API is already loaded (for page reloads)
    if (window.YT && window.YT.Player) {
        loadLesson(maxProgress < courseData.length ? maxProgress : 0);
    } else {
        // 3. Inject the script tag if not present
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

        // Mark completed lessons
        if (index < maxProgress) {
            li.classList.add('completed');
        }

        // Handle Locked vs Unlocked
        if (index > maxProgress) {
            li.classList.add('locked');
        } else {
            // Only add click listener if unlocked
            li.addEventListener('click', () => {
                loadLesson(index);
            });
        }

        // Highlight active lesson
        if (index === currentLessonIndex) {
            li.classList.add('active');
        }

        moduleList.appendChild(li);
    });
}

// 5. LOAD LESSON (Handles Video OR Image)
function loadLesson(index) {
    currentLessonIndex = index;
    const course = courseData[index];

    // Update Text
    lessonTitle.innerText = course.title;
    lessonDesc.innerText = course.description;
    
    // Reset UI State
    quizSection.classList.add('hidden');
    descContainer.style.display = 'block'; // Ensure description is visible
    
    // Clean up previous video player if exists to prevent errors
    if (player) {
        try { player.destroy(); } catch(e) {}
        player = null;
    }

    // --- MEDIA SWITCHER LOGIC ---
    if (course.mediaType === 'video') {
        // A) RENDER YOUTUBE PLAYER
        videoPlayerContainer.innerHTML = '<div id="yt-player-target"></div>';
        
        player = new YT.Player('yt-player-target', {
            height: '100%',
            width: '100%',
            videoId: course.source,
            events: {
                'onStateChange': onPlayerStateChange
            }
        });

    } else if (course.mediaType === 'image') {
        // B) RENDER IMAGE + TOOLBAR
        videoPlayerContainer.innerHTML = `
            <div style="height:100%; display:flex; flex-direction:column; justify-content:space-between; background:#000;">
                
                <div style="flex:1; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                    <img src="${course.source}" style="max-width:100%; max-height:100%; object-fit:contain;">
                </div>

                <div style="width:100%; padding:15px; background:rgba(255,255,255,0.1); border-top:1px solid #333; text-align:center;">
                    <span style="color:#ccc; margin-right:15px; font-size:0.9rem;">Reviewing Diagram...</span>
                    <button id="img-done-btn" class="btn-primary" style="width:auto; display:inline-block; margin:0; padding:8px 20px; font-size:0.9rem;">
                        I'm Ready for the Quiz
                    </button>
                </div>

            </div>
        `;
        
        // Add click listener to the new button
        document.getElementById('img-done-btn').addEventListener('click', () => {
            quizSection.classList.remove('hidden');
        });
    }

    // CHECK IF ALREADY COMPLETED
    // If user has already passed this level, show quiz immediately
    if (index < maxProgress) {
        quizSection.classList.remove('hidden');
    }

    // Build the quiz buttons
    buildQuiz(course.quiz);
    
    // Refresh sidebar to update highlights
    renderSidebar(); 
}

// 6. DETECT VIDEO END
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) {
        // Video finished! Show the quiz.
        quizSection.classList.remove('hidden');
    }
}

// 7. QUIZ BUILDER
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
            // Remove 'selected' from all other buttons
            document.querySelectorAll('.quiz-btn').forEach(b => b.classList.remove('selected'));
            // Add 'selected' to this one
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
        // --- CORRECT ANSWER ---
        buttons[currentSelectedAnswer].classList.add('correct');
        submitBtn.innerText = "Correct! Next Lesson ->";
        
        // Save Progress
        if (currentLessonIndex === maxProgress) {
            maxProgress++;
            localStorage.setItem('splashPadTrainingProgress', maxProgress);
            updateProgressDisplay();
        }

        // Delay before moving on
        setTimeout(() => {
            if (currentLessonIndex + 1 < courseData.length) {
                loadLesson(currentLessonIndex + 1);
            } else {
                renderSidebar();
                showCompletionScreen();
            }
        }, 1500);

    } else {
        // --- WRONG ANSWER ---
        buttons[currentSelectedAnswer].classList.add('wrong');
        alert("Incorrect. Please review the material and try again.");
    }
}

// 9. CERTIFICATE GENERATION
function showCompletionScreen() {
    // Hide Description and Quiz
    document.getElementById('desc-container').style.display = 'none';
    quizSection.classList.add('hidden');
    
    // Show Completion Section
    const completionSection = document.getElementById('completion-section');
    completionSection.classList.remove('hidden');
    
    // Re-attach listener cleanly
    const btn = document.getElementById('download-cert-btn');
    const newBtn = btn.cloneNode(true); // Helper to strip old listeners
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
    
    // Draw Certificate Border
    doc.setLineWidth(3);
    doc.setDrawColor(0, 95, 115); 
    doc.rect(10, 10, 277, 190); 
    
    // Text Content
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