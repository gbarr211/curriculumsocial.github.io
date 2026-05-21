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

    POD_MEMBER_ROLES: [
        "creator",
        "admin",
        "teacher",
        "parent",
        "child",
        "guest"
    ],

    ADMIN_PERMISSIONS: [
        "manageMembers",
        "manageSchedule",
        "manageAnnouncements",
        "manageSettings",
        "manageTeachers",
        "manageLearningPlans",
        "viewProgressRecords",
        "approvePortfolioItems",
        "approveVenuesForPrivatePodUse",
        "reviewIncidentReports"
    ],

    TEACHER_VERIFICATION_STATUSES: [
        { id: "unverified", label: "Unverified" },
        { id: "early_years_facilitator", label: "Early Years Facilitator" },
        { id: "verified_teacher", label: "Verified Teacher" },
        { id: "lead_program_teacher", label: "Lead Program Teacher" }
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

    VENUE_TYPES: [
        "parent_home",
        "teacher_home",
        "shared_homeschool_space",
        "studio_workshop",
        "community_room",
        "outdoor_nature_space",
        "commercial_partner_venue",
        "other_approved_learning_space"
    ],

    VENUE_APPROVAL_STATUSES: [
        "draft",
        "submitted_for_review",
        "approved_private_pod_use",
        "approved_public_platform_use",
        "paused",
        "archived",
        "rejected"
    ],

    VENUE_COMPENSATION_MODELS: [
        "free_community_contribution",
        "hosting_credit",
        "fixed_rental_fee",
        "per_session_fee",
        "per_child_revenue_share",
        "monthly_partnership_fee",
        "custom_arrangement"
    ],

    ALLOWED_ACTIVITY_TYPES: [
        "quiet_study",
        "arts_crafts",
        "music",
        "outdoor_play",
        "science_experiments",
        "cooking",
        "physical_movement",
        "messy_activities",
        "water_activities",
        "group_discussion",
        "tutoring",
        "performances"
    ],

    AGE_SUITABILITY: [
        "nursery_toddler",
        "pre_k",
        "kindergarten",
        "primary",
        "middle",
        "teen"
    ],

    INCIDENT_REPORT_TYPES: [
        "venue_safety",
        "child_safety",
        "inappropriate_communication",
        "activity_incident",
        "injury_or_health",
        "behavior_concern",
        "payment_issue",
        "platform_issue",
        "other"
    ],

    INCIDENT_STATUSES: [
        "submitted",
        "under_review",
        "needs_more_info",
        "resolved",
        "dismissed",
        "escalated",
        "archived"
    ],

    CONTRIBUTION_CREDIT_SOURCES: [
        "hosting",
        "teaching",
        "venue",
        "admin_support",
        "material_contribution",
        "scholarship_donation"
    ],

    CREDIT_STATUSES: [
        "pending",
        "suggested",
        "approved",
        "applied",
        "donated",
        "expired"
    ],

    PAYMENT_CREDIT_MODEL_TYPES: [
        "per_child_subscription",
        "family_credit",
        "hosting_credit",
        "teaching_credit",
        "venue_credit",
        "admin_support_credit",
        "scholarship_pool",
        "teacher_payout",
        "venue_payout",
        "platform_margin"
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
                verificationStatus: "verified_teacher",
                badgeLabel: "Verified Teacher",
                subjects: ["nature study", "early literacy"],
                location: "Lamai",
                bio: "Supports small-group learning with outdoor observation and gentle project work."
            },
            {
                id: "demo-teacher-2",
                name: "Arun Srisai",
                verificationStatus: "early_years_facilitator",
                badgeLabel: "Early Years Facilitator",
                subjects: ["music", "Thai culture"],
                location: "Bophut",
                bio: "Leads music circles and cultural learning sessions for mixed-age groups."
            },
            {
                id: "demo-teacher-3",
                name: "Mara Collins",
                verificationStatus: "lead_program_teacher",
                badgeLabel: "Lead Program Teacher",
                subjects: ["school-ready portfolios", "project-based learning"],
                location: "Maenam",
                bio: "Helps families organize serious learning continuity records and teacher-reviewed portfolios."
            },
            {
                id: "demo-teacher-4",
                name: "Sam Reed",
                verificationStatus: "unverified",
                badgeLabel: "Profile Created",
                subjects: ["coding club", "maker projects"],
                location: "Fisherman's Village",
                bio: "New teacher profile pending verification review."
            }
        ],

        venues: [
            {
                id: "demo-venue-1",
                name: "Lamai Family Garden",
                type: "parent_home",
                generalArea: "Lamai, Koh Samui",
                exactAddressVisibility: "after pod approval",
                capacity: 8,
                indoorOutdoor: "indoor and shaded outdoor",
                bathroomAccess: "Family bathroom available near garden entrance.",
                safetyNotes: "Gated garden, shaded table area, no pool access during sessions.",
                suggestedAgeSuitability: ["pre_k", "kindergarten", "primary"],
                approvedAgeSuitability: ["kindergarten", "primary"],
                allowedActivityTypes: ["quiet_study", "arts_crafts", "outdoor_play", "group_discussion"],
                approvalStatus: "approved_private_pod_use",
                compensationModel: "hosting_credit",
                amenities: ["covered table space", "garden access", "bathroom"]
            },
            {
                id: "demo-venue-2",
                name: "Bophut Home Studio",
                type: "teacher_home",
                generalArea: "Bophut, Koh Samui",
                exactAddressVisibility: "after class enrollment",
                capacity: 6,
                indoorOutdoor: "indoor",
                bathroomAccess: "Guest bathroom available.",
                safetyNotes: "Instrument cables stored before children arrive; parent pickup required.",
                suggestedAgeSuitability: ["pre_k", "kindergarten", "primary"],
                approvedAgeSuitability: ["pre_k", "kindergarten", "primary"],
                allowedActivityTypes: ["music", "group_discussion", "performances"],
                approvalStatus: "approved_public_platform_use",
                compensationModel: "per_session_fee",
                amenities: ["music room", "art tables", "small library"]
            },
            {
                id: "demo-venue-3",
                name: "Maenam Family Veranda",
                type: "parent_home",
                generalArea: "Maenam, Koh Samui",
                exactAddressVisibility: "after private pod approval",
                capacity: 5,
                indoorOutdoor: "covered outdoor",
                bathroomAccess: "Bathroom access through family living area.",
                safetyNotes: "Steps require adult supervision; not suitable for toddlers without parent present.",
                suggestedAgeSuitability: ["primary", "middle"],
                approvedAgeSuitability: [],
                allowedActivityTypes: ["quiet_study", "arts_crafts", "tutoring"],
                approvalStatus: "submitted_for_review",
                compensationModel: "free_community_contribution",
                amenities: ["covered table", "fans", "nearby parking"]
            },
            {
                id: "demo-venue-4",
                name: "Hin Lad Nature Trail Meeting Point",
                type: "outdoor_nature_space",
                generalArea: "Near Hin Lad, Koh Samui",
                exactAddressVisibility: "shared after RSVP",
                capacity: 12,
                indoorOutdoor: "outdoor",
                bathroomAccess: "No onsite bathroom; nearby stop recommended before arrival.",
                safetyNotes: "Requires adult supervision, closed shoes, water, and weather check.",
                suggestedAgeSuitability: ["primary", "middle", "teen"],
                approvedAgeSuitability: ["primary", "middle"],
                allowedActivityTypes: ["outdoor_play", "science_experiments", "physical_movement"],
                approvalStatus: "approved_public_platform_use",
                compensationModel: "custom_arrangement",
                amenities: ["nature access", "shade", "field observation area"]
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
        ],

        incidentReports: [
            {
                id: "demo-incident-1",
                type: "venue_safety",
                urgency: "medium",
                status: "under_review",
                relatedItemType: "venue",
                relatedItemName: "Maenam Family Veranda",
                submittedByRole: "parent",
                summary: "Parent asked for clarification about steps and toddler supervision before approval."
            },
            {
                id: "demo-incident-2",
                type: "activity_incident",
                urgency: "low",
                status: "needs_more_info",
                relatedItemType: "activity",
                relatedItemName: "Beach Nature Walk",
                submittedByRole: "teacher",
                summary: "Facilitator noted a minor schedule mismatch and requested admin review of attendance notes."
            },
            {
                id: "demo-incident-3",
                type: "platform_issue",
                urgency: "high",
                status: "submitted",
                relatedItemType: "message",
                relatedItemName: "Parent communication thread",
                submittedByRole: "parent",
                summary: "Demo report showing how communication issues could be triaged without exposing child messaging."
            }
        ],

        contributionCredits: [
            {
                id: "demo-credit-1",
                source: "hosting",
                status: "suggested",
                contributorName: "Demo",
                amountLabel: "Suggested hosting credit",
                appliedTo: "family subscription",
                note: "Credit suggested for hosting Lamai Nature Learners twice this month."
            },
            {
                id: "demo-credit-2",
                source: "teaching",
                status: "approved",
                contributorName: "Nina Hart",
                amountLabel: "Teacher contribution credit",
                appliedTo: "teacher payout review",
                note: "Credit approved for portfolio note cleanup and parent summaries."
            },
            {
                id: "demo-credit-3",
                source: "scholarship_donation",
                status: "pending",
                contributorName: "Island Makers Club",
                amountLabel: "Optional scholarship pool donation",
                appliedTo: "scholarship pool",
                note: "A future admin can approve donated credits for families needing support."
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
// venueReviews
// incidentReports
// contributionCredits
// creditApplications
// subscriptions
// payouts

// Future record workflow:
// AI Draft -> Human Review -> Approved Record

// Future teacher verification rules:
// Anyone can create a teacher profile.
// Verified badge/status should be visible on teacher-facing cards.
// early_years_facilitator is a lighter verification path for play-based and early years support.
// kindergarten and up structured teaching should require verified_teacher or higher later.
// lead_program_teacher can run serious school-ready pods/programs later.

// Future permissions model:
// Pod creator becomes admin by default.
// Creator can assign other admins.
// One admin role is enough for now.
// Database should support granular admin permissions later through ADMIN_PERMISSIONS.
// Public pods can be joined instantly.
// Pod creators can choose approval or invite-only modes later.
// Child profiles can connect to many pods/classes/activities.
// One primary pod/program should be marked for structure.
// Primary pod provides structure; parent approves/customizes the learning plan.
// Teachers can create private internal notes.
// Private teacher notes are visible to the teacher who wrote them and the pod/program admin.
// Teacher communication with children is blocked for now.
// Teacher communication goes through the parent account.
// Parent-to-parent direct messaging can exist later.
// Child-to-child direct messaging is blocked for now.

// Future payments and credits model:
// Main revenue model is per-child subscriptions.
// Subscription includes basic access.
// Premium/special classes can cost extra.
// Curriculum Social collects subscriptions and pays teachers/programs.
// Premium pricing is suggested by Curriculum Social and adjustable by creator/admin.
// Credits default to reducing the contributor's own child subscription.
// Credits can optionally be donated to a scholarship pool.
// Credit calculation should be hybrid later: platform suggests, admin approves.
// Future payment concepts include family credits, hosting credits, teaching credits, venue credits,
// admin-support credits, scholarship pool, teacher payouts, venue payouts, and platform margin.
