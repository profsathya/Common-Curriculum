// AUTO-GENERATED — Do not edit manually
// Source: config/cst349-assignments.csv
// Run: node scripts/canvas-sync.js --action=generate-config --course=cst349
//
// To update assignments: Edit the CSV file, then run the generate-config command above.
// Canvas IDs are synced via GitHub Actions workflow.

/**
 * CST349 Configuration
 * Professional Seminar
 */

const CST349_CONFIG = {
  // Semester info
  semester: "Spring 2026",
  courseCode: "CST349-01",
  courseName: "Professional Seminar",

  // Canvas base URL - UPDATE EACH SEMESTER
  // Find this in your Canvas URL: https://csumb.instructure.com/courses/XXXXX
  canvasBaseUrl: "https://csumb.instructure.com/courses/32911",

  // Canvas assignment URLs - UPDATE EACH SEMESTER
  // To find assignment IDs: Go to assignment in Canvas, look at URL
  // Example: /courses/12345/assignments/67890 -> canvasId: "67890"
  assignments: {
    // Sprint 1
    "s1-self-assessment": {
      canvasId: "578900",
      title: "S1: Skills Self-Assessment",
      dueDate: "2026-01-22",
      type: "quiz",
      canvasType: "quiz",
      quizType: "graded_survey",
      assignmentGroup: "Sprint 1: Goal Setting",
      points: 10,
      sprint: 1,
      week: 1,
      htmlFile: "assignments/s1-w1-skills-self-assessment.html"
    },
    "s1-reflection-1": {
      canvasId: "578902",
      title: "S1: Productive Reflection #1",
      dueDate: "2026-01-24",
      type: "reflection",
      canvasType: "quiz",
      quizType: "graded_survey",
      assignmentGroup: "Sprint 1: Productive Reflections",
      points: 5,
      sprint: 1,
      week: 1,
      htmlFile: "assignments/s1-w1-productive-reflection.html"
    },
    "s1-skills-revision": {
      canvasId: "580893",
      title: "S1: Skills Assessment Revision",
      dueDate: "2026-01-29",
      type: "quiz",
      canvasType: "quiz",
      quizType: "graded_survey",
      assignmentGroup: "Sprint 1: Goal Setting",
      points: 5,
      sprint: 1,
      week: 2,
      htmlFile: "assignments/s1-w2-skills-revision.html",
      questions: [
        {
          "type": "essay",
          "text": "What's underneath your gap? If you said 'communication' or something similarly broad — what's the real barrier? Be specific about what actually happens. (If your gap was already specific, explain why you're confident it's the real issue.)",
          "points": 2
        },
        {
          "type": "essay",
          "text": "Rewrite your friction story with YOU as the protagonist. Focus on what YOU had control over. What could you have done differently? What opportunities did you have that you didn't take?",
          "points": 2
        },
        {
          "type": "essay",
          "text": "What would 'better' look like? Describe a specific future situation where you'd handle it differently. What would you actually DO? Be concrete and observable.",
          "points": 1
        }
      ]
    },
    "s1-five-whys": {
      canvasId: "570032",
      title: "S1: 5 Whys Analysis",
      dueDate: "2026-01-29",
      type: "assignment",
      canvasType: "assignment",
      quizType: "graded_survey",
      assignmentGroup: "Sprint 1: Goal Setting",
      points: 5,
      sprint: 1,
      week: 2,
      htmlFile: "assignments/s1-w2-five-whys.html",
      questions: [
        {
          "type": "essay",
          "text": "Starting Point: 'I struggle with [your skill] because...' — Write your first answer. What happens when you try to use this skill?",
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
          "text": "Why #4/5: What's the root cause you can actually address? This should be something specific, actionable, and honest — something you can actually work on.",
          "points": 1
        }
      ]
    },
    "s1-sprint-plan": {
      canvasId: "581427",
      title: "S1: Sprint Plan v1",
      dueDate: "2026-02-07",
      type: "quiz",
      canvasType: "quiz",
      quizType: "graded_survey",
      assignmentGroup: "Sprint 1: Goal Setting",
      points: 5,
      sprint: 1,
      week: 3,
      htmlFile: "assignments/s1-w3-sprint-plan.html",
      questions: [
        {
          "type": "file_upload",
          "text": "Upload the JSON file downloaded from the Sprint Plan activity. Make sure the file includes your name.",
          "points": 5
        }
      ]
    },
    "s1-reflection-2": {
      canvasId: "570068",
      title: "S1: Productive Reflection #2",
      dueDate: "2026-01-31",
      type: "reflection",
      canvasType: "assignment",
      quizType: "graded_survey",
      assignmentGroup: "Sprint 1: Productive Reflections",
      points: 5,
      sprint: 1,
      week: 2,
      htmlFile: "assignments/s1-w2-productive-reflection.html",
      questions: [
        {
          "type": "file_upload",
          "text": "Upload a photo of your handwritten reflection from today's class session. Your reflection should capture your thinking about your skill gap and root cause analysis.",
          "points": 5
        }
      ]
    },
    "s1-learning-log": {
      canvasId: "581428",
      title: "S1: Learning Log (Week 3)",
      dueDate: "2026-02-07",
      type: "quiz",
      canvasType: "quiz",
      quizType: "graded_survey",
      assignmentGroup: "Sprint 1: Productive Reflections",
      points: 5,
      sprint: 1,
      week: 3,
      htmlFile: "assignments/s1-w3-learning-log.html",
      questions: [
        {
          "type": "file_upload",
          "text": "Upload photos of your 3 handwritten learning log entries from your notebook. Make sure all text is legible in the photos.",
          "points": 5
        }
      ]
    },
    "s1-reflection-3": {
      canvasId: "581429",
      title: "S1: Productive Reflection #3",
      dueDate: "2026-02-09",
      type: "reflection",
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
          "text": "Upload a photo of your handwritten Productive Reflection #3 from your notebook.",
          "points": 5
        }
      ]
    },
    "s1-demo-discussion": {
      canvasId: "582009",
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
      canvasId: "582010",
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
    "s2-orientation": {
      canvasId: "582071",
      title: "S2: Sprint 2 Orientation",
      dueDate: "2026-02-14",
      type: "quiz",
      canvasType: "quiz",
      quizType: "graded_survey",
      assignmentGroup: "Sprint 2: Goal Setting",
      points: 5,
      sprint: 2,
      week: 5,
      htmlFile: "activities/s2-orientation.html"
    },
    "s2-goal-setting": {
      canvasId: "582011",
      title: "S2: Sprint 2 Goal Setting",
      dueDate: "2026-02-16",
      type: "assignment",
      canvasType: "quiz",
      quizType: "graded_survey",
      assignmentGroup: "Sprint 2: Goal Setting",
      points: 10,
      sprint: 2,
      week: 5,
      htmlFile: "assignments/s2-w5-goal-setting.html"
    },
    "s2-outreach": {
      title: "S2: Professional Outreach",
      dueDate: "2026-02-20",
      type: "assignment",
      canvasType: "quiz",
      quizType: "graded_survey",
      assignmentGroup: "Sprint 2: Check-in/Engagement",
      points: 10,
      sprint: 2,
      week: 6,
      htmlFile: "assignments/s2-w6-outreach.html"
    },
    "s2-fallback-plan": {
      title: "S2: Fallback Plan",
      dueDate: "2026-02-22",
      type: "assignment",
      canvasType: "quiz",
      quizType: "graded_survey",
      assignmentGroup: "Sprint 2: Goal Setting",
      points: 5,
      sprint: 2,
      week: 6,
      htmlFile: "assignments/s2-w6-fallback-plan.html"
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
    "s2-stretch": {
      title: "S2: Stretch Challenge",
      dueDate: "2026-02-27",
      type: "assignment",
      canvasType: "quiz",
      quizType: "graded_survey",
      assignmentGroup: "Sprint 2: Check-in/Engagement",
      points: 10,
      sprint: 2,
      week: 7,
      htmlFile: "assignments/s2-w7-stretch.html"
    },
    "s2-checkin-doc": {
      title: "S2: Check-in Documentation",
      dueDate: "2026-03-01",
      type: "assignment",
      canvasType: "quiz",
      quizType: "graded_survey",
      assignmentGroup: "Sprint 2: Check-in/Engagement",
      points: 5,
      sprint: 2,
      week: 7,
      htmlFile: "assignments/s2-w7-checkin-doc.html"
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
    "s2-demo-validation": {
      title: "S2: Demonstration with Validation",
      dueDate: "2026-03-06",
      type: "assignment",
      canvasType: "quiz",
      quizType: "graded_survey",
      assignmentGroup: "Sprint 2: Demonstration",
      points: 10,
      sprint: 2,
      week: 8,
      htmlFile: "assignments/s2-w8-demo-validation.html"
    },
    "s2-peer-eval": {
      title: "S2: Peer Evaluation",
      dueDate: "2026-03-08",
      type: "assignment",
      canvasType: "quiz",
      quizType: "graded_survey",
      assignmentGroup: "Sprint 2: Check-in/Engagement",
      points: 5,
      sprint: 2,
      week: 8,
      htmlFile: "assignments/s2-w8-peer-eval.html"
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
    "s3-curiosity-inventory": {
      title: "S3: Curiosity Inventory",
      dueDate: "2026-03-26",
      type: "assignment"
    },
    "s3-transfer-plan": {
      title: "S3: Transfer Plan",
      dueDate: "2026-03-26",
      type: "assignment"
    },
    "s3-reflection-7": {
      title: "S3: Productive Reflection #7",
      dueDate: "2026-03-28",
      type: "reflection"
    },
    "s3-learning-log": {
      title: "S3: Learning Log",
      dueDate: "2026-04-02",
      type: "assignment"
    },
    "s3-reflection-8": {
      title: "S3: Productive Reflection #8",
      dueDate: "2026-04-04",
      type: "reflection"
    },
    "s3-mini-project": {
      title: "S3: Mini-Project",
      dueDate: "2026-04-09",
      type: "assignment"
    },
    "s3-iteration-doc": {
      title: "S3: Iteration After Struggle",
      dueDate: "2026-04-09",
      type: "assignment"
    },
    "s3-reflection-9": {
      title: "S3: Productive Reflection #9",
      dueDate: "2026-04-11",
      type: "reflection"
    },
    "s3-presentation": {
      title: "S3: Transfer Presentation",
      dueDate: "2026-04-16",
      type: "assignment"
    },
    "s3-peer-eval": {
      title: "S3: Peer Evaluation",
      dueDate: "2026-04-17",
      type: "assignment"
    },
    "s3-bridge": {
      title: "Bridge Reflection: Transfer → Proving It",
      dueDate: "2026-04-18",
      type: "bridge"
    },

    // Sprint 4
    "s4-evidence-inventory": {
      title: "S4: Evidence Inventory",
      dueDate: "2026-04-23",
      type: "assignment"
    },
    "s4-gap-analysis": {
      title: "S4: Gap Analysis",
      dueDate: "2026-04-23",
      type: "assignment"
    },
    "s4-reflection-10": {
      title: "S4: Productive Reflection #10",
      dueDate: "2026-04-25",
      type: "reflection"
    },
    "s4-narrative-arc": {
      title: "S4: Narrative Arc Draft",
      dueDate: "2026-04-30",
      type: "assignment"
    },
    "s4-evidence-selection": {
      title: "S4: Evidence Selection",
      dueDate: "2026-04-30",
      type: "assignment"
    },
    "s4-reflection-11": {
      title: "S4: Productive Reflection #11",
      dueDate: "2026-05-02",
      type: "reflection"
    },
    "s4-defense-draft": {
      title: "S4: Defense Draft",
      dueDate: "2026-05-07",
      type: "assignment"
    },
    "s4-practice-defense": {
      title: "S4: Practice Defense",
      dueDate: "2026-05-07",
      type: "assignment"
    },
    "s4-reflection-12": {
      title: "S4: Productive Reflection #12",
      dueDate: "2026-05-09",
      type: "reflection"
    },
    "s4-final-defense": {
      title: "S4: Final Portfolio Defense",
      dueDate: "2026-05-14",
      type: "assignment"
    },
    "s4-peer-eval": {
      title: "S4: Peer Evaluations",
      dueDate: "2026-05-15",
      type: "assignment"
    },
    "s4-final-reflection": {
      title: "Final Reflection",
      dueDate: "2026-05-16",
      type: "bridge"
    }
  },

  // Class recording Loom videos - ADD URLS AS AVAILABLE
  // Set to null if no recording was made for that week
  loomVideos: {
    1: "https://www.loom.com/share/212ab04d442e4cdf94fadfa026fe9015",  // Week 1
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
    syllabus: "https://docs.google.com/document/d/SYLLABUS_DOC_ID"
  },

  // Week dates for determining "current week"
  // Each week runs Sunday through Saturday
  // UPDATE EACH SEMESTER
  weekDates: {
    1: { start: "2026-01-18", end: "2026-01-24", sprint: 1, title: "Orientation & Self-Assessment" },
    2: { start: "2026-01-25", end: "2026-01-31", sprint: 1, title: "Identifying Your Growth Edge" },
    3: { start: "2026-02-01", end: "2026-02-07", sprint: 1, title: "Active Learning" },
    4: { start: "2026-02-08", end: "2026-02-14", sprint: 1, title: "Demonstration & Synthesis" },
    5: { start: "2026-02-09", end: "2026-02-16", sprint: 2, title: "Sprint 1 Demo + Sprint 2 Launch" },
    6: { start: "2026-02-17", end: "2026-02-24", sprint: 2, title: "Outreach & Accountability Setup" },
    7: { start: "2026-02-25", end: "2026-03-03", sprint: 2, title: "Stretch Challenge" },
    8: { start: "2026-03-04", end: "2026-03-10", sprint: 2, title: "Validated Demonstration" },
    9: { start: "2026-03-22", end: "2026-03-28", sprint: 3, title: "Curiosity Mapping" },
    10: { start: "2026-03-29", end: "2026-04-04", sprint: 3, title: "Following the Thread" },
    11: { start: "2026-04-05", end: "2026-04-11", sprint: 3, title: "Building Something" },
    12: { start: "2026-04-12", end: "2026-04-18", sprint: 3, title: "Transfer Demonstration" },
    13: { start: "2026-04-19", end: "2026-04-25", sprint: 4, title: "Evidence Audit" },
    14: { start: "2026-04-26", end: "2026-05-02", sprint: 4, title: "Portfolio Construction" },
    15: { start: "2026-05-03", end: "2026-05-09", sprint: 4, title: "Defense Preparation" },
    16: { start: "2026-05-10", end: "2026-05-16", sprint: 4, title: "Final Defense" }
  },

  // Sprint info
  sprints: {
    1: { name: "Beyond Technical", theme: "Soft skill gap identification & development", focus: "Goal Setting, Planning", scaffolding: "High" },
    2: { name: "Accountable Growth", theme: "Deepen skill with external accountability", focus: "Ambiguity, Iteration", scaffolding: "Medium" },
    3: { name: "Transfer", theme: "Apply SDL to technical curiosity", focus: "Evaluation, Collaboration", scaffolding: "Low" },
    4: { name: "Proving It", theme: "Portfolio defense & synthesis", focus: "All dimensions integrated", scaffolding: "Full autonomy" }
  },

  // SDL Dimensions
  sdlDimensions: {
    1: { name: "Identify Learning Goals", question: "Can you name what you need to learn?", primarySprints: "Sprint 1" },
    2: { name: "Design Learning Plan", question: "Can you create a path to learning it?", primarySprints: "Sprint 1" },
    3: { name: "Navigate Ambiguity", question: "Can you learn when requirements are unclear?", primarySprints: "Sprints 2-3" },
    4: { name: "Metacognitive Awareness", question: "Do you know what you don't know?", primarySprints: "All Sprints" },
    5: { name: "Learn Through Iteration", question: "Can you improve through failure?", primarySprints: "Sprints 2-4" },
    6: { name: "Evaluate Critically", question: "Can you judge the quality of your learning?", primarySprints: "Sprints 3-4" },
    7: { name: "Collaborate Effectively", question: "Can you learn from and with others?", primarySprints: "Sprint 3" },
    8: { name: "Leverage AI Effectively", question: "Can you use AI without offloading your thinking?", primarySprints: "All Sprints" }
  },

  // Interview skills progression
  interviewSkills: {
    1: { name: "Answer Questions Thoughtfully", description: "Behavioral interview practice: 'Tell me about a time when...'" },
    2: { name: "Ask Good Questions", description: "Informational interview skills: Probe for specifics, challenge without hostility" },
    3: { name: "Explain Technical Concepts", description: "Technical interview practice: Adapt explanations when first attempt doesn't land" },
    4: { name: "Defend Your Work", description: "Portfolio defense: Support claims with evidence, acknowledge weaknesses honestly" }
  },

  // Peer Conversation Settings
  // UPDATE EACH SEMESTER if targets change
  peerConversations: {
    totalConversationsTarget: 16,
    conversationsPerSprint: 4,
    breadthTarget: 12,        // Unique partners
    depthTarget: 4,           // Deep partnerships (3+ conversations)
    depthThreshold: 3,        // Conversations needed to count as "deep"
    formUrl: "https://forms.gle/51Qx66RkuZqyCKj17",             // Peer conversation check-in form

    // Sprint-by-sprint cumulative targets
    sprintTargets: {
      1: { conversations: 4, uniquePartners: 3, deepPartners: 0 },
      2: { conversations: 8, uniquePartners: 6, deepPartners: 1 },
      3: { conversations: 12, uniquePartners: 9, deepPartners: 2 },
      4: { conversations: 16, uniquePartners: 12, deepPartners: 4 }
    },

    // Interview skills by sprint (for display)
    skills: {
      1: { name: "Answer Questions Thoughtfully", desc: "Behavioral interview practice" },
      2: { name: "Ask Good Questions", desc: "Informational interview skills" },
      3: { name: "Explain Technical Concepts", desc: "Technical interview practice" },
      4: { name: "Defend Your Work", desc: "Portfolio defense" }
    },

    // Check-in schedule
    checkIns: {
      1: { required: true, type: "Professor", duration: "5 min" },
      2: { required: true, type: "TA", duration: "10 min" },
      3: { required: true, type: "TA", duration: "10 min" },
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
function getCST349AssignmentUrl(assignmentKey) {
  const assignment = CST349_CONFIG.assignments[assignmentKey];
  if (!assignment) {
    console.warn(`Assignment not found: ${assignmentKey}`);
    return "#";
  }
  return `${CST349_CONFIG.canvasBaseUrl}/assignments/${assignment.canvasId}`;
}

/**
 * Get current week number based on today's date
 * @returns {number|null} Week number (1-16) or null if outside semester
 */
function getCST349CurrentWeek() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const [weekNum, dates] of Object.entries(CST349_CONFIG.weekDates)) {
    // Add time component to ensure local timezone parsing
    const start = new Date(dates.start + 'T00:00:00');
    const end = new Date(dates.end + 'T23:59:59.999');

    if (today >= start && today <= end) {
      return parseInt(weekNum);
    }
  }
  return null;
}

/**
 * Get current sprint based on current week
 * @returns {number|null} Sprint number (1-4) or null
 */
function getCST349CurrentSprint() {
  const week = getCST349CurrentWeek();
  if (!week) return null;
  return CST349_CONFIG.weekDates[week]?.sprint || null;
}

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date like "Wed, Jan 22"
 */
function formatCST349Date(dateString) {
  const date = new Date(dateString + 'T12:00:00');
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
function getCST349AssignmentsDueInWeek(weekNum) {
  const weekData = CST349_CONFIG.weekDates[weekNum];
  if (!weekData) return [];

  // Add time component to ensure local timezone parsing
  const start = new Date(weekData.start + 'T00:00:00');
  const end = new Date(weekData.end + 'T23:59:59.999');

  const assignments = [];
  for (const [key, assignment] of Object.entries(CST349_CONFIG.assignments)) {
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
function getCST349LoomVideo(weekNum) {
  return CST349_CONFIG.loomVideos[weekNum] || null;
}

// For testing: Override current week (set to null to use real date)
let CST349_TEST_CURRENT_WEEK = null;

function getCST349EffectiveCurrentWeek() {
  return CST349_TEST_CURRENT_WEEK !== null ? CST349_TEST_CURRENT_WEEK : getCST349CurrentWeek();
}
