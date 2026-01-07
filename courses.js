// courses.js
const courseData = [
    {
        id: 1,
        title: "System Overview & Manifolds",
        description: "An introduction to the splash pad water distribution system. Learn how the manifold divides water into different zones.",
        mediaType: "video",
        source: "dQw4w9WgXcQ", // YouTube ID (Placeholder)
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
        source: "https://images.unsplash.com/photo-1555662772-882255850908?q=80&w=1000&auto=format&fit=crop", // Placeholder schematic image
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
        source: "M7lc1UVf-VE", // YouTube ID (Placeholder)
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
        mediaType: "image", // Using an image of a checklist/slide
        source: "https://images.unsplash.com/photo-1581092921461-eab62e97a783?q=80&w=1000", // Placeholder industrial pump image
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
        description: "Critical steps to prevent freeze damage during the off-season. Ensure all lines are blown out with compressed air.",
        mediaType: "video",
        source: "dQw4w9WgXcQ", 
        quiz: {
            question: "What is the most critical step in winterization?",
            options: [
                "Polishing the stainless steel",
                "Removing all water from lines using compressed air",
                "Turning off the lights",
                "Covering the features with tarps"
            ],
            correctAnswer: 1
        }
    }
];