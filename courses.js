// courses.js
const courseData = [
    // ... keep your previous lessons 1-5 ...
    {
        id: 1,
        title: "System Overview & Manifolds",
        description: "An introduction to the splash pad water distribution system.",
        mediaType: "video",
        source: "dQw4w9WgXcQ", 
        quiz: {
            question: "What is the primary function of the manifold?",
            options: ["To heat water", "To distribute water", "To filter debris", "To measure chlorine"],
            correctAnswer: 1
        }
    },
    {
        id: 2,
        title: "Wiring Diagram: Controller",
        description: "Study the wiring schematic for the main PLC controller.",
        mediaType: "image",
        source: "https://placehold.co/800x500/222/fff?text=Wiring+Schematic+Placeholder", 
        quiz: {
            question: "Which input is used for the Activation Bollard?",
            options: ["Input 0", "Input 5", "Output 2", "Power Supply"],
            correctAnswer: 0
        }
    },
    {
        id: 3,
        title: "Water Treatment: UV & Chlorine",
        description: "Understanding the dual-sanitization method.",
        mediaType: "video",
        source: "M7lc1UVf-VE", 
        quiz: {
            question: "Why is UV used in addition to Chlorine?",
            options: ["Sparkle", "Kill Crypto/Giardia", "Cheaper", "Heating"],
            correctAnswer: 1
        }
    },
    {
        id: 4,
        title: "Pump Maintenance Checklist",
        description: "Review the daily and weekly maintenance requirements.",
        mediaType: "image",
        source: "https://placehold.co/800x500/004e64/fff?text=Pump+Maintenance+Checklist", 
        quiz: {
            question: "How often should the pump strainer basket be cleaned?",
            options: ["Yearly", "Daily", "When broken", "Winter"],
            correctAnswer: 1
        }
    },
    {
        id: 5,
        title: "Winterization Procedure",
        description: "Drag the steps into the correct order.",
        mediaType: "video",
        source: "dQw4w9WgXcQ", 
        quiz: {
            type: "sort",
            question: "Arrange the Winterization steps (Top to Bottom):",
            options: [
                "1. Shut off main water supply",
                "2. Open all manifold drain valves",
                "3. Connect compressed air to system",
                "4. Blow out lines until dry",
                "5. Install winter caps on features"
            ]
        }
    },
    // --- NEW LESSON: VALVE SIMULATION ---
    {
        id: 6,
        title: "Simulation: Valve Setup",
        description: "Configure the manifold for WINTER mode. Close Main Supply (Large) and Open Drains (Small).",
        mediaType: "interaction_valves", 
        source: "images/manifold-background.jpg", // Update this to your real background file
        valves: [
            // V1 is the MAIN SUPPLY -> Size: 'large'
            { id: "v1", label: "Main Supply (V1)", size: "large", x: 17, y: 46, start: "open", correct: "closed" },
            
            // V2 & V3 are DRAINS -> Size: 'small'
            { id: "v2", label: "Zone 1 Drain (V2)", size: "small", x: 42, y: 32
             , start: "closed", correct: "open" },
            { id: "v3", label: "Zone 2 Drain (V3)", size: "small", x: 50, y: 35, start: "closed", correct: "open" }
        ],
        quiz: {
            type: "interaction_check", 
            question: "Set the valves to the correct winter configuration.",
            options: [], 
            correctAnswer: 0
        }
    }

];





