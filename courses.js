// courses.js
const courseData = [
    {
        id: 1,
        title: "System Overview & Manifolds",
        description: "An introduction to the splash pad water distribution system. Learn how the manifold divides water into different zones.",
        mediaType: "video",
        source: "dQw4w9WgXcQ", // YouTube ID
        quiz: {
            question: "What is the primary function of the manifold?",
            options: [
                "To heat the water",
                "To distribute water to specific feature zones",
                "To filter debris",
                "To measure chlorine levels"
            ],
            correctAnswer: 1
        }
    },
    {
        id: 2,
        title: "Wiring Diagram: Controller",
        description: "Study the wiring schematic for the main PLC controller. Note the inputs for the activation bollard.",
        mediaType: "image",
        // USES GENERATED PLACEHOLDER IMAGE (Guaranteed to load)
        source: "https://placehold.co/800x500/222/fff?text=Wiring+Schematic+Placeholder", 
        quiz: {
            question: "Which input is used for the Activation Bollard?",
            options: [
                "Input 0 (I0)",
                "Input 5 (I5)",
                "Output 2 (O2)",
                "The Power Supply"
            ],
            correctAnswer: 0
        }
    },
    {
        id: 3,
        title: "Water Treatment: UV & Chlorine",
        description: "Understanding the dual-sanitization method. Watch how the UV reactor neutralizes bacteria that chlorine might miss.",
        mediaType: "video",
        source: "M7lc1UVf-VE", 
        quiz: {
            question: "Why is UV used in addition to Chlorine?",
            options: [
                "To make the water sparkle",
                "To kill chlorine-resistant bacteria (Crypto/Giardia)",
                "It is cheaper than chlorine",
                "To warm up the water"
            ],
            correctAnswer: 1
        }
    },
    {
        id: 4,
        title: "Pump Maintenance Checklist",
        description: "Review the daily and weekly maintenance requirements for the feature pump.",
        mediaType: "image",
        // USES GENERATED PLACEHOLDER IMAGE
        source: "https://placehold.co/800x500/004e64/fff?text=Pump+Maintenance+Checklist", 
        quiz: {
            question: "How often should the pump strainer basket be cleaned?",
            options: [
                "Once a year",
                "Daily",
                "Only when it stops working",
                "Every winter"
            ],
            correctAnswer: 1
        }
    },
    {
        id: 5,
        title: "Winterization Procedure",
        description: "Critical steps to prevent freeze damage. Drag the steps into the correct order.",
        mediaType: "video",
        source: "dQw4w9WgXcQ", 
        quiz: {
            type: "sort", // NEW: Tells the app this is a sorting question
            question: "Arrange the Winterization steps in the correct order (Top to Bottom):",
            // LIST THESE IN THE CORRECT ORDER (The code will shuffle them)
            options: [
                "1. Shut off main water supply",
                "2. Open all manifold drain valves",
                "3. Connect compressed air to system",
                "4. Blow out lines until dry",
                "5. Install winter caps on features"
            ]
        }
    }
];