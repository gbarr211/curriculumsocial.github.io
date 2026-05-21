// Curriculum Social platform model scaffold.
// This file is intentionally read-only data for front-end pages and future planning.

window.CurriculumSocialModel = {
    USER_ROLES: [
        "parent",
        "student",
        "teacher",
        "venue",
        "admin"
    ],

    POD_TYPES: [
        { id: "social", label: "Social" },
        { id: "age-based", label: "Age-Based" },
        { id: "interest-hobby", label: "Interest/Hobby" },
        { id: "subject", label: "Subject" },
        { id: "multi-subject", label: "Multi-Subject" },
        { id: "teacher-led-class", label: "Teacher-Led Class" },
        { id: "parent-led-homeschool", label: "Parent-Led Homeschool" },
        { id: "venue-based", label: "Venue-Based" },
        { id: "school-continuity", label: "School-Continuity" }
    ],

    POD_FEATURES: [
        "members",
        "schedule",
        "materials",
        "announcements",
        "classes",
        "activities",
        "teacher-parent-notes",
        "child-progress-snapshots",
        "school-ready-portfolio"
    ],

    VISIBILITY_OPTIONS: [
        { id: "public", label: "Public" },
        { id: "private", label: "Private" }
    ],

    PROGRESS_VISIBILITY_DEFAULTS: {
        childProgress: ["parent-guardian", "assigned-teachers"],
        portfolioItems: ["parent-guardian", "assigned-teachers"],
        podSummary: ["pod-admins"],
        futureConfigurableBy: ["pod-creator", "pod-admin"]
    },

    MATERIAL_TYPES: [
        "lesson-plan",
        "reading",
        "worksheet",
        "photo",
        "video",
        "project-file",
        "field-note",
        "link"
    ],

    PROGRESS_RECORD_TYPES: [
        "observation",
        "teacher-note",
        "parent-note",
        "skill-milestone",
        "project-completion",
        "attendance",
        "participation",
        "portfolio-evidence"
    ],

    PORTFOLIO_RECORD_TYPES: [
        "learning-history",
        "class-summary",
        "pod-participation",
        "skill-milestone",
        "evidence",
        "teacher-note",
        "parent-note",
        "attendance-summary",
        "export-preview"
    ],

    AI_ASSISTANT_USE_CASES: [
        "lesson plan drafts",
        "portfolio summaries",
        "parent progress summaries",
        "teacher note cleanup",
        "missing evidence suggestions",
        "older student brainstorming/building assistant",
        "internal QA/review"
    ],

    DEMO_DATA: {
        family: {
            id: "demo-family",
            familyName: "Demo",
            location: "Koh Samui",
            bio: "A sample Koh Samui homeschooling family exploring Curriculum Social."
        },

        children: [
            {
                id: "demo-student-1",
                name: "Maya",
                age: 7,
                gradeLevel: "Grade 2",
                interests: ["nature", "art", "science"],
                learningStyle: "hands-on"
            },
            {
                id: "demo-student-2",
                name: "Leo",
                age: 5,
                gradeLevel: "Kindergarten",
                interests: ["music", "animals", "building"],
                learningStyle: "play-based"
            }
        ],

        teachers: [
            {
                id: "demo-teacher-1",
                name: "Nina Hart",
                subjects: ["nature study", "early literacy"],
                location: "Lamai",
                bio: "Supports small-group learning with outdoor observation and gentle project work."
            },
            {
                id: "demo-teacher-2",
                name: "Arun Srisai",
                subjects: ["music", "Thai culture"],
                location: "Bophut",
                bio: "Leads music circles and cultural learning sessions for mixed-age groups."
            }
        ],

        venues: [
            {
                id: "demo-venue-1",
                name: "Lamai Beach Learning Hut",
                location: "Lamai, Koh Samui",
                amenities: ["covered table space", "beach access", "washroom"]
            },
            {
                id: "demo-venue-2",
                name: "Bophut Community Studio",
                location: "Bophut, Koh Samui",
                amenities: ["music room", "art tables", "small library"]
            }
        ],

        activities: [
            {
                id: "demo-activity-1",
                title: "Beach Nature Walk",
                category: "nature",
                location: "Lamai Beach",
                ageRange: "5-9",
                description: "Observe shells, tide pools, and coastal plants during a relaxed family meetup."
            },
            {
                id: "demo-activity-2",
                title: "Beginner Music Circle",
                category: "arts",
                location: "Bophut",
                ageRange: "4-10",
                description: "Sing, clap, play rhythm games, and explore beginner instruments."
            }
        ],

        classes: [
            {
                id: "demo-class-1",
                title: "Island Ecology Foundations",
                subject: "Science",
                teacherId: "demo-teacher-1",
                ageRange: "6-9",
                schedule: "Tuesdays, sample term",
                description: "A structured class on coastal habitats, observation skills, and nature journaling."
            },
            {
                id: "demo-class-2",
                title: "Story, Song, and Rhythm",
                subject: "Music and Language",
                teacherId: "demo-teacher-2",
                ageRange: "4-8",
                schedule: "Fridays, sample term",
                description: "A gentle class combining storytelling, songs, rhythm patterns, and group participation."
            }
        ],

        pods: [
            {
                id: "demo-pod-1",
                title: "Lamai Nature Learners",
                type: "parent-led-homeschool",
                visibility: "public",
                ageRange: "5-9",
                location: "Lamai, Koh Samui",
                features: ["members", "schedule", "activities", "teacher-parent-notes", "child-progress-snapshots"],
                description: "A small parent-led group meeting weekly for beach science, nature journaling, and play."
            },
            {
                id: "demo-pod-2",
                title: "Bophut Music & Story Pod",
                type: "teacher-led-class",
                visibility: "public",
                ageRange: "4-8",
                location: "Bophut, Koh Samui",
                features: ["members", "schedule", "materials", "classes", "school-ready-portfolio"],
                description: "A teacher-supported pod for songs, storytelling, early literacy, and confidence building."
            },
            {
                id: "demo-pod-3",
                title: "Maenam Portfolio Circle",
                type: "school-continuity",
                visibility: "private",
                ageRange: "6-11",
                location: "Maenam, Koh Samui",
                features: ["members", "materials", "teacher-parent-notes", "child-progress-snapshots", "school-ready-portfolio"],
                description: "A small continuity pod focused on organizing evidence, progress notes, and school-ready records."
            },
            {
                id: "demo-pod-4",
                title: "Island Makers Club",
                type: "interest-hobby",
                visibility: "public",
                ageRange: "7-12",
                location: "Fisherman's Village, Koh Samui",
                features: ["members", "materials", "announcements", "activities"],
                description: "A project-based club for building, design challenges, simple coding, and collaborative problem solving."
            }
        ],

        materials: [
            {
                id: "demo-material-1",
                title: "Coastal Plant Observation Sheet",
                type: "worksheet",
                relatedTo: "demo-class-1"
            },
            {
                id: "demo-material-2",
                title: "Rhythm Pattern Cards",
                type: "lesson-plan",
                relatedTo: "demo-class-2"
            }
        ],

        progressRecords: [
            {
                id: "demo-progress-1",
                childId: "demo-student-1",
                type: "skill-milestone",
                title: "Nature observation and labeling",
                summary: "Maya identified three shell types and recorded observations with drawings and short labels.",
                date: "Sample Term",
                relatedPodId: "demo-pod-1"
            },
            {
                id: "demo-progress-2",
                childId: "demo-student-2",
                type: "participation",
                title: "Group music participation",
                summary: "Leo joined call-and-response songs and kept a steady rhythm with hand percussion.",
                date: "Sample Term",
                relatedPodId: "demo-pod-2"
            },
            {
                id: "demo-progress-3",
                childId: "demo-student-1",
                type: "project-completion",
                title: "Mini habitat poster",
                summary: "Created a simple poster comparing beach and jungle habitats with photos and captions.",
                date: "Sample Term",
                relatedPodId: "demo-pod-3"
            }
        ],

        portfolioItems: [
            {
                id: "demo-portfolio-1",
                childId: "demo-student-1",
                type: "learning-history",
                title: "Island Ecology Foundations",
                summary: "Hands-on science learning through observation, discussion, drawing, and field notes."
            },
            {
                id: "demo-portfolio-2",
                childId: "demo-student-1",
                type: "evidence",
                title: "Beach nature journal samples",
                summary: "Selected drawings and labels showing observation growth over the sample term."
            },
            {
                id: "demo-portfolio-3",
                childId: "demo-student-2",
                type: "teacher-note",
                title: "Music circle participation note",
                summary: "Teacher note describing participation, listening, rhythm, and group confidence."
            },
            {
                id: "demo-portfolio-4",
                childId: "demo-student-2",
                type: "attendance-summary",
                title: "Pod participation summary",
                summary: "Sample attendance and participation overview for recurring music and story sessions."
            }
        ]
    }
};

// Future Firestore collections:
// users
// families
// children
// teachers
// venues
// activities
// classes
// pods
// podMembers
// materials
// progressRecords
// portfolioItems
// aiDrafts

// Future record workflow:
// AI Draft -> Human Review -> Approved Record
