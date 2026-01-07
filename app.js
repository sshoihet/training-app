// app.js - Supported Types: Multiple Choice & Drag-Sort

// 1. STATE VARIABLES
let currentLessonIndex = 0;
let maxProgress = parseInt(localStorage.getItem('splashPadTrainingProgress')) || 0;
let currentSelectedAnswer = null; // For Multiple Choice
let sortableInstance = null; // For Drag & Drop
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

// 5. LOAD LESSON
function loadLesson(index) {
    currentLessonIndex = index;
    const course = courseData[index];

    lessonTitle.innerText = course.title;
    lessonDesc.innerText = course.description;
    
    quizSection.classList.add('hidden');
    descContainer.style.display = 'block'; 
    
    if (player) { try { player.destroy(); } catch(e) {} player = null; }

    if (course.mediaType === 'video') {
        videoPlayerContainer.innerHTML = '<div id="yt-player-target"></div>';
        player = new YT.Player('yt-player-target', {
            height: '100%', width: '100%', videoId: course.source,
            events: { 'onStateChange': onPlayerStateChange }
        });
    } else if (course.mediaType === 'image') {
        videoPlayerContainer.innerHTML = `
            <div style="height:100%; display:flex; flex-direction:column; justify-content:space-between; background:#000;">
                <div style="flex:1; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                    <img src="${course.source}" style="max-width:100%; max-height:100%; object-fit:contain;">
                </div>
                <div style="width:100%; padding:15px; background:rgba(255,255,255,0.1); border-top:1px solid #333; text-align:center;">
                    <span style="color:#ccc; margin-right:15px; font-size:0.9rem;">Reviewing Diagram...</span>
                    <button id="img-done-btn" class="btn-primary" style="width:auto; display:inline-block; margin:0; padding:8px 20px; font-size:0.9rem;">I'm Ready for the Quiz</button>
                </div>
            </div>`;
        document.getElementById('img-done-btn').addEventListener('click', () => quizSection.classList.remove('hidden'));
    }

    if (index < maxProgress) quizSection.classList.remove('hidden');

    // BUILD QUIZ BASED ON TYPE
    buildQuiz(course.quiz);
    renderSidebar(); 
}

function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) quizSection.classList.remove('hidden');
}

// 6. QUIZ BUILDER (UPDATED)
function buildQuiz(quizData) {
    quizQuestion.innerText = quizData.question;
    quizOptions.innerHTML = ''; 
    currentSelectedAnswer = null;
    submitBtn.innerText = "Submit Answer";
    submitBtn.disabled = false;
    
    // Reset styling classes
    quizOptions.className = "options-grid";

    // --- CASE A: SORTING QUESTION ---
    if (quizData.type === 'sort') {
        quizOptions.className = "sortable-list"; // Change class for styling

        // 1. Create an array of objects with original IDs [0, 1, 2, 3...]
        let items = quizData.options.map((text, index) => ({ id: index, text: text }));
        
        // 2. Shuffle them so the user has to fix it
        items.sort(() => Math.random() - 0.5);

        // 3. Render them
        items.forEach(item => {
            const div = document.createElement('div');
            div.innerText = item.text;
            div.className = 'sortable-item';
            div.setAttribute('data-id', item.id); // Store original index (0 = correct first item)
            quizOptions.appendChild(div);
        });

        // 4. Enable Drag & Drop (using SortableJS)
        sortableInstance = new Sortable(quizOptions, {
            animation: 150,
            ghostClass: 'sortable-ghost'
        });
    } 
    // --- CASE B: STANDARD MULTIPLE CHOICE ---
    else {
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
}

// 7. HANDLE SUBMIT (UPDATED)
function handleSubmit() {
    const course = courseData[currentLessonIndex];
    let isCorrect = false;

    // --- LOGIC A: SORTING CHECK ---
    if (course.quiz.type === 'sort') {
        // Get the current order of IDs in the DOM
        const currentOrder = sortableInstance.toArray(); 
        // We expect them to be "0", "1", "2", "3", "4" in that order
        
        // Check if every item is in its original correct index
        isCorrect = currentOrder.every((val, index) => parseInt(val) === index);
        
        if (!isCorrect) {
            document.querySelector('.sortable-list').classList.add('wrong');
            setTimeout(() => document.querySelector('.sortable-list').classList.remove('wrong'), 1000);
            alert("Order is incorrect. Please try again.");
            return; // Stop here
        } else {
             document.querySelector('.sortable-list').classList.add('correct');
        }
    } 
    // --- LOGIC B: MULTIPLE CHOICE CHECK ---
    else {
        if (currentSelectedAnswer === null) {
            alert("Please select an answer.");
            return;
        }
        const correctIndex = course.quiz.correctAnswer;
        const buttons = document.querySelectorAll('.quiz-btn');
        
        if (currentSelectedAnswer === correctIndex) {
            isCorrect = true;
            buttons[currentSelectedAnswer].classList.add('correct');
        } else {
            buttons[currentSelectedAnswer].classList.add('wrong');
            alert("Incorrect. Try again.");
            return;
        }
    }

    // --- SUCCESS HANDLER (Shared) ---
    if (isCorrect) {
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
    }
}

// 8. CERTIFICATE & UTILS (Unchanged)
function showCompletionScreen() {
    document.getElementById('desc-container').style.display = 'none';
    quizSection.classList.add('hidden');
    document.getElementById('completion-section').classList.remove('hidden');
    
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
    doc.setLineWidth(3); doc.setDrawColor(0, 95, 115); doc.rect(10, 10, 277, 190); 
    doc.setFontSize(40); doc.setTextColor(0, 95, 115); doc.text("Certificate of Completion", 148.5, 50, null, null, "center");
    doc.setFontSize(30); doc.setTextColor(0); doc.text(studentName, 148.5, 105, null, null, "center");
    doc.setFontSize(22); doc.setTextColor(0, 95, 115); doc.text("Splash Pad Systems & Maintenance", 148.5, 145, null, null, "center");
    doc.save("SplashPad-Certificate.pdf");
}

function updateProgressDisplay() {
    const percent = Math.round((maxProgress / courseData.length) * 100);
    progressDisplay.innerText = percent + "% Complete";
}