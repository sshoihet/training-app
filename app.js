// app.js - Full Feature Set (Video, Image, Sort, Valves)

// 1. STATE VARIABLES
let currentLessonIndex = 0;
let maxProgress = parseInt(localStorage.getItem('splashPadTrainingProgress')) || 0;
let currentSelectedAnswer = null;
let sortableInstance = null;
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
        if (index > maxProgress) li.classList.add('locked');
        else li.addEventListener('click', () => loadLesson(index));
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
    
    // Reset UI
    quizSection.classList.add('hidden');
    descContainer.style.display = 'block'; 
    if (player) { try { player.destroy(); } catch(e) {} player = null; }

    // --- MEDIA SWITCHER (The Chain) ---
    
    // CASE A: VIDEO
    if (course.mediaType === 'video') {
        videoPlayerContainer.innerHTML = '<div id="yt-player-target"></div>';
        player = new YT.Player('yt-player-target', {
            height: '100%', width: '100%', videoId: course.source,
            events: { 'onStateChange': onPlayerStateChange }
        });
    } 
    // CASE B: IMAGE
    else if (course.mediaType === 'image') {
        videoPlayerContainer.innerHTML = `
            <div style="height:100%; display:flex; flex-direction:column; justify-content:space-between; background:#000;">
                <div style="flex:1; display:flex; align-items:center; justify-content:center; overflow:hidden;">
                    <img src="${course.source}" style="max-width:100%; max-height:100%; object-fit:contain;">
                </div>
                <div style="width:100%; padding:15px; background:rgba(255,255,255,0.1); border-top:1px solid #333; text-align:center;">
                    <button id="img-done-btn" class="btn-primary" style="width:auto; display:inline-block; margin:0; padding:8px 20px; font-size:0.9rem;">I'm Ready for the Quiz</button>
                </div>
            </div>`;
        document.getElementById('img-done-btn').addEventListener('click', () => quizSection.classList.remove('hidden'));
    }
    // CASE C: VALVE INTERACTION
    else if (course.mediaType === 'interaction_valves') {
        videoPlayerContainer.innerHTML = `
            <div style="height:100%; display:flex; flex-direction:column; justify-content:center; background:#222;">
                <div id="valve-container" class="interaction-container" style="background-image: url('${course.source}');">
                    </div>
                <div style="text-align:center; color:#ccc; margin-top:10px; font-size:0.9rem;">
                    Click valves to toggle Open/Closed
                </div>
            </div>
        `;

        const container = document.getElementById('valve-container');
        
        // valve rendering loop ...
        course.valves.forEach((valve, i) => {
            // 1. Create Valve Element
            const el = document.createElement('div');
            
            // ADD CLASS BASED ON SIZE: 'valve-handle-large' or 'valve-handle-small'
            el.className = `valve-handle valve-handle-${valve.size} ${valve.start}`;
            
            el.style.left = valve.x + '%';
            el.style.top = valve.y + '%';
            el.id = `valve-${i}`;
            el.setAttribute('data-state', valve.start);

            // Click Logic (Unchanged)
            el.addEventListener('click', () => {
                const currentState = el.getAttribute('data-state');
                const newState = currentState === 'open' ? 'closed' : 'open';
                el.classList.remove('open', 'closed');
                el.classList.add(newState);
                el.setAttribute('data-state', newState);
            });

            // 2. Create Label Element
            const label = document.createElement('div');
            
            // ADD OFFSET CLASS BASED ON SIZE: 'label-offset-large' or 'label-offset-small'
            label.className = `valve-label label-offset-${valve.size}`;
            
            label.innerText = valve.label;
            label.style.left = valve.x + '%';
            label.style.top = valve.y + '%';

            container.appendChild(el);
            container.appendChild(label);
        });

        // Show submit button immediately for interactions
        quizSection.classList.remove('hidden');
    }

    // Auto-show quiz if already completed
    if (index < maxProgress) quizSection.classList.remove('hidden');

    buildQuiz(course.quiz);
    renderSidebar(); 
}

// 6. DETECT VIDEO END
function onPlayerStateChange(event) {
    if (event.data === YT.PlayerState.ENDED) quizSection.classList.remove('hidden');
}

// 7. QUIZ BUILDER
function buildQuiz(quizData) {
    quizQuestion.innerText = quizData.question;
    quizOptions.innerHTML = ''; 
    currentSelectedAnswer = null;
    submitBtn.innerText = "Submit Answer";
    submitBtn.disabled = false;
    
    quizOptions.className = "options-grid"; // Reset class

    // TYPE: SORTING
    if (quizData.type === 'sort') {
        quizOptions.className = "sortable-list";
        let items = quizData.options.map((text, index) => ({ id: index, text: text }));
        items.sort(() => Math.random() - 0.5); // Shuffle

        items.forEach(item => {
            const div = document.createElement('div');
            div.innerText = item.text;
            div.className = 'sortable-item';
            div.setAttribute('data-id', item.id);
            quizOptions.appendChild(div);
        });

        sortableInstance = new Sortable(quizOptions, { animation: 150 });
    } 
    // TYPE: INTERACTION (Empty quiz area, just the submit button)
    else if (quizData.type === 'interaction_check') {
        quizOptions.innerHTML = '<p style="text-align:center; color:#666; font-style:italic;">(Perform the task in the window above)</p>';
    }
    // TYPE: MULTIPLE CHOICE
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

// 8. HANDLE SUBMIT
function handleSubmit() {
    const course = courseData[currentLessonIndex];
    let isCorrect = false;

    // LOGIC A: SORTING
    if (course.quiz.type === 'sort') {
        const currentOrder = sortableInstance.toArray(); 
        isCorrect = currentOrder.every((val, index) => parseInt(val) === index);
        if (!isCorrect) alert("Order is incorrect.");
    } 
    // LOGIC B: VALVE INTERACTION
    else if (course.quiz.type === 'interaction_check') {
        isCorrect = true;
        course.valves.forEach((valve, i) => {
            const el = document.getElementById(`valve-${i}`);
            if (el.getAttribute('data-state') !== valve.correct) isCorrect = false;
        });
        if (!isCorrect) alert("Valve configuration incorrect. Check which valves should be Open vs Closed.");
    }
    // LOGIC C: MULTIPLE CHOICE
    else {
        if (currentSelectedAnswer === null) { alert("Select an answer."); return; }
        if (currentSelectedAnswer === course.quiz.correctAnswer) isCorrect = true;
        else alert("Incorrect.");
    }

    // SUCCESS
    if (isCorrect) {
        // Visual Success
        if (course.quiz.type === 'sort') document.querySelector('.sortable-list').classList.add('correct');
        
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

// 9. CERTIFICATE (Same as before)
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