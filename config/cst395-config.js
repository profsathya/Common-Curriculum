// AUTO-GENERATED — Do not edit manually
// Source: config/cst395-assignments.csv
// Run: node scripts/canvas-sync.js --action=generate-config --course=cst395
//
// To update assignments: Edit the CSV file, then run the generate-config command above.
// Canvas IDs are synced via GitHub Actions workflow.

/**
 * CST395 Configuration
 * AI-Native Solution Engineering
 */

const CST395_CONFIG = {
  // Semester info
  semester: "Spring 2026",
  courseCode: "CST395-01",
  courseName: "AI-Native Solution Engineering",

  // Canvas base URL - UPDATE EACH SEMESTER
  // Find this in your Canvas URL: https://csumb.instructure.com/courses/XXXXX
  canvasBaseUrl: "https://csumb.instructure.com/courses/33084",

  // Canvas assignment URLs - UPDATE EACH SEMESTER
  // To find assignment IDs: Go to assignment in Canvas, look at URL
  // Example: /courses/12345/assignments/67890 -> canvasId: "67890"
  assignments: {
    // Sprint 1
    "s1-superagency-challenge": {
      canvasId: "564067",
      title: "S1: Superagency Challenge",
      dueDate: "2026-01-21",
      type: "assignment",
      canvasType: "assignment",
      quizType: "textbox",
      assignmentGroup: "Sprint 1: Goal Setting",
      points: 5,
      sprint: 1,
      week: 1,
      htmlFile: "assignments/s1-w1-superagency-challenge.html"
    },
    "s1-problem-analysis": {
      canvasId: "580903",
      title: "S1: Problem Analysis (5 Whys)",
      dueDate: "2026-01-28",
      type: "quiz",
      canvasType: "quiz",
      quizType: "graded_survey",
      assignmentGroup: "Sprint 1: Goal Setting",
      points: 5,
      sprint: 1,
      week: 2,
      htmlFile: "assignments/s1-w2-five-whys.html",
      questions: [
        {
          "type": "essay",
          "text": "Starting Point: 'I struggle with [your challenge] because...' — Write your first answer. What happens when you try to address this challenge?",
          "points": 1
        },
        {
          "type": "essay",
          "text": "Why #1: Why is that? What causes the problem you described above?",
          "points": 1
        },
        {
          "type": "essay",
          "text": "Why #2: Why does that happen? Go deeper into the cause.",
          "points": 1
        },
        {
          "type": "essay",
          "text": "Why #3: Why is that the case? Keep pushing past surface explanations.",
          "points": 1
        },
        {
          "type": "essay",
          "text": "Why #4/5: What's the design opportunity you found? This should be something about your environment, system, or process you could change — not just 'try harder'.",
          "points": 1
        }
      ]
    },
    "s1-solution-architecture": {
      canvasId: "580904",
      title: "S1: Solution Architecture",
      dueDate: "2026-02-02",
      type: "quiz",
      canvasType: "quiz",
      quizType: "graded_survey",
      assignmentGroup: "Sprint 1: Productive Reflections",
      points: 5,
      sprint: 1,
      week: 3,
      htmlFile: "assignments/s1-w3-solution-architecture.html",
      questions: [
        {
          "type": "essay",
          "text": "Human Process: What behavior or habit needs to change for your challenge to be solved? Describe this without mentioning any technology.",
          "points": 1
        },
        {
          "type": "essay",
          "text": "Friction Points: Where in that process do you typically fail or give up? What makes this hard?",
          "points": 1
        },
        {
          "type": "essay",
          "text": "Tech Support: Where specifically could technology help reduce friction? Be specific about which friction points technology addresses.",
          "points": 1
        },
        {
          "type": "essay",
          "text": "Solution Sketch: What will you actually build or create? Describe the simplest version that could test whether your approach works.",
          "points": 1
        },
        {
          "type": "essay",
          "text": "Architectural Choice: What's one key design decision you made and why? What alternatives did you consider?",
          "points": 1
        }
      ]
    },
    "s1-reflection-1": {
      canvasId: "564070",
      title: "S1: Productive Reflection #1",
      dueDate: "2026-01-24",
      type: "reflection",
      canvasType: "assignment",
      quizType: "textbox",
      assignmentGroup: "Sprint 1: Productive Reflections",
      points: 5,
      sprint: 1,
      week: 1,
      htmlFile: "assignments/s1-w1-productive-reflection.html"
    },
    "s1-reflection-2": {
      canvasId: "580905",
      title: "S1: Productive Reflection #2",
      dueDate: "2026-01-30",
      type: "quiz",
      canvasType: "quiz",
      quizType: "graded_survey",
      assignmentGroup: "Sprint 1: Productive Reflections",
      points: 5,
      sprint: 1,
      week: 2,
      htmlFile: "assignments/s1-w2-productive-reflection.html",
      questions: [
        {
          "type": "file_upload",
          "text": "Upload a photo of your handwritten reflection from today's class session. Your reflection should capture your thinking about your challenge, the design opportunity you found through 5 Whys, and what your solution might look like.",
          "points": 5
        }
      ]
    },
    "s1-demo-discussion": {
      title: "S1: Sprint 1 Demo Discussion",
      dueDate: "2026-02-11",
      type: "quiz",
      canvasType: "quiz",
      quizType: "assignment",
      assignmentGroup: "Sprint 1: Demonstration",
      points: 10,
      sprint: 1,
      week: 4,
      htmlFile: "activities/sprint-1-demo.html"
    },

    // Sprint 2
    "s2-bridge-reflection-1": {
      canvasId: "582024",
      title: "S2: Sprint 1-2 Bridge Reflection",
      dueDate: "2026-02-12",
      type: "reflection",
      canvasType: "quiz",
      quizType: "graded_survey",
      assignmentGroup: "Sprint 2: Productive Reflections",
      points: 5,
      sprint: 2,
      week: 5,
      htmlFile: "assignments/s2-w5-bridge-reflection.html"
    },
    "s2-goal-setting-part1": {
      canvasId: "582027",
      title: "S2: Goal Setting Part I — Preparation",
      dueDate: "2026-02-16",
      type: "assignment",
      canvasType: "quiz",
      quizType: "graded_survey",
      assignmentGroup: "Sprint 2: Goal Setting",
      points: 5,
      sprint: 2,
      week: 5,
      htmlFile: "assignments/s2-w5-goal-setting-part1.html"
    },
    "s2-goal-setting-part2": {
      canvasId: "582028",
      title: "S2: Goal Setting Part II — Partner Goals",
      dueDate: "2026-02-20",
      type: "assignment",
      canvasType: "quiz",
      quizType: "graded_survey",
      assignmentGroup: "Sprint 2: Goal Setting",
      points: 5,
      sprint: 2,
      week: 5,
      htmlFile: "assignments/s2-w5-goal-setting-part2.html"
    },
    "s2-discovery-doc": {
      canvasId: "582025",
      title: "S2: Discovery Documentation",
      dueDate: "2026-02-20",
      type: "assignment",
      canvasType: "quiz",
      quizType: "graded_survey",
      assignmentGroup: "Sprint 2: Check-in/Engagement",
      points: 10,
      sprint: 2,
      week: 6,
      htmlFile: "assignments/s2-w6-discovery-doc.html"
    },
    "s2-assumption-audit": {
      canvasId: "582026",
      title: "S2: Assumption Audit",
      dueDate: "2026-02-22",
      type: "assignment",
      canvasType: "quiz",
      quizType: "graded_survey",
      assignmentGroup: "Sprint 2: Check-in/Engagement",
      points: 5,
      sprint: 2,
      week: 6,
      htmlFile: "assignments/s2-w6-assumption-audit.html"
    },
    "s2-domain-learning": {
      title: "S2: Domain Learning Plan",
      dueDate: "2026-02-22",
      type: "assignment",
      canvasType: "quiz",
      quizType: "graded_survey",
      assignmentGroup: "Sprint 2: Goal Setting",
      points: 5,
      sprint: 2,
      week: 6,
      htmlFile: "assignments/s2-w6-domain-learning.html"
    },
    "s2-reflection-4": {
      title: "S2: Productive Reflection #4",
      dueDate: "2026-02-24",
      type: "reflection",
      canvasType: "quiz",
      quizType: "graded_survey",
      assignmentGroup: "Sprint 2: Productive Reflections",
      points: 5,
      sprint: 2,
      week: 6,
      htmlFile: "assignments/s2-w6-productive-reflection.html"
    },
    "s2-prototype": {
      title: "S2: Prototype + Build Log",
      dueDate: "2026-02-27",
      type: "assignment",
      canvasType: "quiz",
      quizType: "graded_survey",
      assignmentGroup: "Sprint 2: Check-in/Engagement",
      points: 10,
      sprint: 2,
      week: 7,
      htmlFile: "assignments/s2-w7-prototype.html"
    },
    "s2-design-rationale": {
      title: "S2: Design Rationale Log",
      dueDate: "2026-03-01",
      type: "assignment",
      canvasType: "quiz",
      quizType: "graded_survey",
      assignmentGroup: "Sprint 2: Check-in/Engagement",
      points: 5,
      sprint: 2,
      week: 7,
      htmlFile: "assignments/s2-w7-design-rationale.html"
    },
    "s2-partner-feedback": {
      title: "S2: Partner Feedback Documentation",
      dueDate: "2026-03-01",
      type: "assignment",
      canvasType: "quiz",
      quizType: "graded_survey",
      assignmentGroup: "Sprint 2: Check-in/Engagement",
      points: 5,
      sprint: 2,
      week: 7,
      htmlFile: "assignments/s2-w7-partner-feedback.html"
    },
    "s2-reflection-5": {
      title: "S2: Productive Reflection #5",
      dueDate: "2026-03-03",
      type: "reflection",
      canvasType: "quiz",
      quizType: "graded_survey",
      assignmentGroup: "Sprint 2: Productive Reflections",
      points: 5,
      sprint: 2,
      week: 7,
      htmlFile: "assignments/s2-w7-productive-reflection.html"
    },
    "s2-human-value": {
      title: "S2: Human Value Statement",
      dueDate: "2026-03-06",
      type: "assignment",
      canvasType: "quiz",
      quizType: "graded_survey",
      assignmentGroup: "Sprint 2: Demonstration",
      points: 10,
      sprint: 2,
      week: 8,
      htmlFile: "assignments/s2-w8-human-value.html"
    },
    "s2-partner-eval": {
      title: "S2: Partner Evaluation",
      dueDate: "2026-03-08",
      type: "assignment",
      canvasType: "quiz",
      quizType: "graded_survey",
      assignmentGroup: "Sprint 2: Check-in/Engagement",
      points: 5,
      sprint: 2,
      week: 8,
      htmlFile: "assignments/s2-w8-partner-eval.html"
    },
    "s2-bridge-reflection-2": {
      title: "S2: Sprint 2-3 Bridge Reflection",
      dueDate: "2026-03-10",
      type: "reflection",
      canvasType: "quiz",
      quizType: "graded_survey",
      assignmentGroup: "Sprint 2: Productive Reflections",
      points: 5,
      sprint: 2,
      week: 8,
      htmlFile: "assignments/s2-w8-bridge-reflection.html"
    },

    // Sprint 3
    "s3-domain-selection": {
      canvasId: "300001",
      title: "S3: Domain Selection",
      dueDate: "2025-03-26",
      type: "assignment"
    },
    "s3-reflection-1": {
      canvasId: "300002",
      title: "S3: Productive Reflection #1",
      dueDate: "2025-03-28",
      type: "reflection"
    },
    "s3-stakeholder-research": {
      canvasId: "300003",
      title: "S3: Stakeholder Research",
      dueDate: "2025-04-02",
      type: "assignment"
    },
    "s3-reflection-2": {
      canvasId: "300004",
      title: "S3: Productive Reflection #2",
      dueDate: "2025-04-04",
      type: "reflection"
    },
    "s3-mvp": {
      canvasId: "300005",
      title: "S3: Minimum Viable Product",
      dueDate: "2025-04-09",
      type: "assignment"
    },
    "s3-build-log": {
      canvasId: "300006",
      title: "S3: Build Log Entry",
      dueDate: "2025-04-11",
      type: "reflection"
    },
    "s3-presentation": {
      canvasId: "300007",
      title: "S3: Solution Presentation",
      dueDate: "2025-04-16",
      type: "assignment"
    },
    "s3-human-value": {
      canvasId: "300008",
      title: "S3: Human Value Statement",
      dueDate: "2025-04-17",
      type: "reflection"
    },
    "s3-bridge": {
      canvasId: "300009",
      title: "Bridge Reflection: Complexity → Mastery",
      dueDate: "2025-04-18",
      type: "bridge"
    },

    // Sprint 4
    "s4-problem-definition": {
      canvasId: "400001",
      title: "S4: Problem Definition",
      dueDate: "2025-04-23",
      type: "assignment"
    },
    "s4-reflection-1": {
      canvasId: "400002",
      title: "S4: Productive Reflection #1",
      dueDate: "2025-04-25",
      type: "reflection"
    },
    "s4-execution-plan": {
      canvasId: "400003",
      title: "S4: Execution Plan",
      dueDate: "2025-04-30",
      type: "assignment"
    },
    "s4-reflection-2": {
      canvasId: "400004",
      title: "S4: Productive Reflection #2",
      dueDate: "2025-05-02",
      type: "reflection"
    },
    "s4-final-solution": {
      canvasId: "400005",
      title: "S4: Final Solution",
      dueDate: "2025-05-07",
      type: "assignment"
    },
    "s4-build-log": {
      canvasId: "400006",
      title: "S4: Build Log Entry",
      dueDate: "2025-05-09",
      type: "reflection"
    },
    "s4-final-presentation": {
      canvasId: "400007",
      title: "S4: Final Presentation",
      dueDate: "2025-05-14",
      type: "assignment"
    },
    "s4-portfolio": {
      canvasId: "400008",
      title: "S4: Portfolio Reflection",
      dueDate: "2025-05-15",
      type: "reflection"
    },
    "s4-course-reflection": {
      canvasId: "400009",
      title: "Course Reflection: Full Journey",
      dueDate: "2025-05-16",
      type: "bridge"
    },

    // Sprint 1
    "s1-w3-design-decision": {
      canvasId: "581583",
      title: "S1: Design Decision Analysis",
      dueDate: "2026-02-07",
      type: "quiz",
      canvasType: "quiz",
      quizType: "graded_survey",
      assignmentGroup: "Sprint 1: Check-in/Engagement",
      points: 5,
      sprint: 1,
      week: 3,
      htmlFile: "activities/design-decision-analysis.html"
    },
    "s1-w3-dojo-depth": {
      canvasId: "581584",
      title: "S1: Dojo Depth Session",
      dueDate: "2026-02-08",
      type: "quiz",
      canvasType: "quiz",
      quizType: "graded_survey",
      assignmentGroup: "Sprint 1: Productive Reflections",
      points: 5,
      sprint: 1,
      week: 3,
      htmlFile: "assignments/s1-w3-dojo-depth.html",
      questions: [
        {
          "type": "file_upload",
          "text": "Upload your Dojo session JSON file. This should include your Reflector-approved answer demonstrating: (1) a design opportunity (not willpower), (2) stakeholder-informed design, (3) specific rather than generic solution, and (4) progress evidence.",
          "points": 5
        }
      ]
    },
    "s1-w3-reflection": {
      canvasId: "581585",
      title: "S1: Productive Reflection #3",
      dueDate: "2026-02-09",
      type: "quiz",
      canvasType: "quiz",
      quizType: "graded_survey",
      assignmentGroup: "Sprint 1: Productive Reflections",
      points: 5,
      sprint: 1,
      week: 3,
      htmlFile: "assignments/s1-w3-productive-reflection.html",
      questions: [
        {
          "type": "file_upload",
          "text": "Upload a clear photo of your handwritten reflection. Make sure all text is legible. Your reflection should include: (1) draft of your demo answer for the required question, (2) your chosen optional question and draft answer, (3) what you know about yourself that a stranger would miss, and (4) what's still weak in your demo preparation.",
          "points": 5
        }
      ]
    }
  },

  // Class recording Loom videos - ADD URLS AS AVAILABLE
  // Set to null if no recording was made for that week
  loomVideos: {
    1: null,  // Week 1 - no recording yet
    2: null,  // Week 2
    3: null,  // Week 3
    4: null,  // Week 4
    5: null,  // Week 5
    6: null,  // Week 6
    7: null,  // Week 7
    8: null,  // Week 8
    9: null,  // Week 9
    10: null, // Week 10
    11: null, // Week 11
    12: null, // Week 12
    13: null, // Week 13
    14: null, // Week 14
    15: null, // Week 15
    16: null  // Week 16
  },

  // External resource URLs
  resources: {
    umpireGuide: "https://docs.google.com/document/d/UMPIRE_DOC_ID",
    threeCsTemplate: "https://docs.google.com/document/d/3CS_DOC_ID",
    symbioticThinking: "https://symbioticthinking.ai/",
    dojoAccess: "https://dojo.symbioticthinking.ai",
    myUnderstandingTemplate: "https://docs.google.com/document/d/UNDERSTANDING_DOC_ID",
    syllabus: "https://docs.google.com/document/d/SYLLABUS_DOC_ID"
  },

  // Week dates for determining "current week"
  // Each week runs Sunday through Saturday
  // UPDATE EACH SEMESTER
  weekDates: {
    1: { start: "2026-01-18", end: "2026-01-24", sprint: 1, title: "Orientation & Problem Discovery" },
    2: { start: "2026-01-25", end: "2026-01-31", sprint: 1, title: "Understanding Before Building" },
    3: { start: "2026-02-01", end: "2026-02-07", sprint: 1, title: "Strategic Building" },
    4: { start: "2026-02-08", end: "2026-02-14", sprint: 1, title: "Reflection & Human Value" },
    5: { start: "2026-02-09", end: "2026-02-16", sprint: 2, title: "Sprint 1 Demo + Sprint 2 Launch" },
    6: { start: "2026-02-17", end: "2026-02-24", sprint: 2, title: "Discovery & Domain Learning" },
    7: { start: "2026-02-25", end: "2026-03-03", sprint: 2, title: "Building & Iteration" },
    8: { start: "2026-03-04", end: "2026-03-10", sprint: 2, title: "Value Through Another's Eyes" },
    9: { start: "2026-03-22", end: "2026-03-28", sprint: 3, title: "Entering Unfamiliar Territory" },
    10: { start: "2026-03-29", end: "2026-04-04", sprint: 3, title: "Stakeholder Discovery Without Access" },
    11: { start: "2026-04-05", end: "2026-04-11", sprint: 3, title: "Simple Over Sophisticated" },
    12: { start: "2026-04-12", end: "2026-04-18", sprint: 3, title: "Value at the Intersection" },
    13: { start: "2026-04-19", end: "2026-04-25", sprint: 4, title: "Autonomous Problem Definition" },
    14: { start: "2026-04-26", end: "2026-05-02", sprint: 4, title: "Independent Execution" },
    15: { start: "2026-05-03", end: "2026-05-09", sprint: 4, title: "Integration & Refinement" },
    16: { start: "2026-05-10", end: "2026-05-16", sprint: 4, title: "Demonstration & Reflection" }
  },

  // Sprint info
  sprints: {
    1: { name: "Foundation", theme: "Superagency Over Self", stakeholder: "Yourself", scaffolding: "High" },
    2: { name: "Mirror", theme: "Learning Through Others", stakeholder: "Close acquaintance", scaffolding: "Medium-High" },
    3: { name: "Complexity", theme: "Navigating Ambiguity", stakeholder: "External entity", scaffolding: "Medium" },
    4: { name: "Mastery", theme: "Full Autonomy", stakeholder: "Your choice", scaffolding: "Low" }
  },

  // Peer Conversation Settings
  // UPDATE EACH SEMESTER if targets change
  peerConversations: {
    totalConversationsTarget: 16,
    conversationsPerSprint: 4,
    breadthTarget: 9,         // Unique partners (50% of 18-person class)
    depthTarget: 3,           // Deep partnerships (3+ conversations)
    depthThreshold: 3,        // Conversations needed to count as "deep"
    formUrl: "https://forms.gle/Jx2hAnGsxvwRzaZq8",             // Peer conversation check-in form

    // Sprint-by-sprint cumulative targets
    sprintTargets: {
      1: { conversations: 4, uniquePartners: 3, deepPartners: 0 },
      2: { conversations: 8, uniquePartners: 5, deepPartners: 1 },
      3: { conversations: 12, uniquePartners: 7, deepPartners: 2 },
      4: { conversations: 16, uniquePartners: 9, deepPartners: 3 }
    },

    // Professional skills by sprint (for display)
    skills: {
      1: { name: "How to Understand", desc: "Get into someone's perspective, listen before reacting" },
      2: { name: "How to Challenge", desc: "Give direct feedback, receive challenge without defensiveness" },
      3: { name: "How to be a Thought Partner", desc: "Help someone think through a problem" },
      4: { name: "How to Hold Accountable", desc: "Push on quality, mutual ownership of outcomes" }
    },

    // Check-in schedule (CST395: only Sprint 1 required)
    checkIns: {
      1: { required: true, type: "Professor", duration: "5 min" },
      2: { required: false, type: "Optional", duration: null },
      3: { required: false, type: "Optional", duration: null },
      4: { required: false, type: null, duration: null }
    }
  },

  // Instructor info
  instructor: {
    name: "Dr. Sathya Narayanan",
    email: "snarayanan@csumb.edu",
    slack: "@profsathya",
    officeHours: "https://bit.ly/profsathya"
  }
};

// ============================================
// Helper Functions
// ============================================

/**
 * Get Canvas assignment URL
 * @param {string} assignmentKey - Key from assignments object
 * @returns {string} Full Canvas URL or "#" if not found
 */
function getAssignmentUrl(assignmentKey) {
  const assignment = CST395_CONFIG.assignments[assignmentKey];
  if (!assignment) {
    console.warn(`Assignment not found: ${assignmentKey}`);
    return "#";
  }
  return `${CST395_CONFIG.canvasBaseUrl}/assignments/${assignment.canvasId}`;
}

/**
 * Get current week number based on today's date
 * @returns {number|null} Week number (1-16) or null if outside semester
 */
function getCurrentWeek() {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day

  for (const [weekNum, dates] of Object.entries(CST395_CONFIG.weekDates)) {
    // Add time component to ensure local timezone parsing
    const start = new Date(dates.start + 'T00:00:00');
    const end = new Date(dates.end + 'T23:59:59.999');

    if (today >= start && today <= end) {
      return parseInt(weekNum);
    }
  }
  return null; // Outside semester
}

/**
 * Get current sprint based on current week
 * @returns {number|null} Sprint number (1-4) or null
 */
function getCurrentSprint() {
  const week = getCurrentWeek();
  if (!week) return null;
  return CST395_CONFIG.weekDates[week]?.sprint || null;
}

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date like "Wed, Jan 22"
 */
function formatDate(dateString) {
  const date = new Date(dateString + 'T12:00:00'); // Noon to avoid timezone issues
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Get assignments due in a specific week
 * @param {number} weekNum - Week number
 * @returns {Array} Array of assignment objects with keys
 */
function getAssignmentsDueInWeek(weekNum) {
  const weekData = CST395_CONFIG.weekDates[weekNum];
  if (!weekData) return [];

  // Add time component to ensure local timezone parsing
  const start = new Date(weekData.start + 'T00:00:00');
  const end = new Date(weekData.end + 'T23:59:59.999');

  const assignments = [];
  for (const [key, assignment] of Object.entries(CST395_CONFIG.assignments)) {
    const dueDate = new Date(assignment.dueDate + 'T12:00:00');
    if (dueDate >= start && dueDate <= end) {
      assignments.push({ key, ...assignment });
    }
  }

  return assignments.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
}

/**
 * Get Loom video URL for a week
 * @param {number} weekNum - Week number
 * @returns {string|null} Loom URL or null if no recording
 */
function getLoomVideo(weekNum) {
  return CST395_CONFIG.loomVideos[weekNum] || null;
}

// For testing: Override current week (set to null to use real date)
let TEST_CURRENT_WEEK = null; // Set to null to use real date-based calculation

function getEffectiveCurrentWeek() {
  return TEST_CURRENT_WEEK !== null ? TEST_CURRENT_WEEK : getCurrentWeek();
}
