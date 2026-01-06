// app.js

// 1. State Management
// We keep track of which lesson is currently active
let currentLessonIndex = 0;

// 2. DOM Elements
// We select the HTML elements we need to manipulate
const moduleList = document.getElementById('module-list');
const lessonTitle = document.getElementById('lesson-title');
const lessonDesc = document.getElementById('lesson-desc');
const videoPlayer = document.getElementById('video-player');

// 3. Initialization
// This runs when the page first opens
document.addEventListener('DOMContentLoaded', () => {
    renderSidebar();
    loadLesson(0); // Load the first lesson by default
});

// 4. Render the Sidebar Navigation
function renderSidebar() {
    moduleList.innerHTML = ''; // Clear existing list
    
    courseData.forEach((course, index) => {
        // Create the list item
        const li = document.createElement('li');
        li.innerText = course.title;
        li.className = 'module-item';
        
        // Add click event to load this specific lesson
        li.addEventListener('click', () => {
            loadLesson(index);
        });

        moduleList.appendChild(li);
    });
}

// 5. Load a Specific Lesson
function loadLesson(index) {
    currentLessonIndex = index;
    const course = courseData[index];

    // Update Text
    lessonTitle.innerText = course.title;
    lessonDesc.innerText = course.description;

    // Update Video (YouTube Embed)
    // Note: We use the 'videoId' from our data object
    videoPlayer.innerHTML = `
        <iframe 
            width="100%" 
            height="100%" 
            src="https://www.youtube.com/embed/${course.videoId}" 
            title="YouTube video player" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
        </iframe>
    `;

    // Highlight the active item in the sidebar
    updateSidebarHighlight(index);
    
    // Reset the quiz section (we will build this logic in Phase 3)
    document.getElementById('quiz-section').classList.add('hidden');
}

// Helper: Highlight the active lesson in the sidebar
function updateSidebarHighlight(activeIndex) {
    const items = document.querySelectorAll('.module-item');
    items.forEach((item, index) => {
        if (index === activeIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}