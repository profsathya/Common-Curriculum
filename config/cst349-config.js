/**
 * CST349 Configuration
 * Professional Seminar
 *
 * UPDATE THIS FILE EACH SEMESTER:
 * 1. Change canvasBaseUrl to new course ID
 * 2. Update all assignment canvasId values
 * 3. Update weekDates for new semester
 * 4. Add Loom video URLs as they become available
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
      canvasId: "144469",
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
      canvasId: "144470",
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
      canvasId: "144730",
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
      canvasId: "570033",
      title: "S1: Sprint Plan v1",
      dueDate: "2026-02-05",
      type: "assignment"
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
      canvasId: "570072",
      title: "S1: Learning Log (Week 3)",
      dueDate: "2026-02-04",
      type: "assignment"
    },
    "s1-reflection-3": {
      canvasId: "570069",
      title: "S1: Productive Reflection #3",
      dueDate: "2026-02-07",
      type: "reflection",
      canvasType: "quiz",
      quizType: "graded_survey",
      assignmentGroup: "Sprint 1: Productive Reflections",
      points: 5,
      sprint: 1,
      week: 3,
      htmlFile: "assignments/s1-w3-productive-reflection.html"
    },
    "s1-demonstration": {
      canvasId: "570074",
      title: "S1: Demonstration",
      dueDate: "2026-02-11",
      type: "assignment"
    },
    "s1-peer-eval": {
      canvasId: "570075",
      title: "S1: Peer Evaluation",
      dueDate: "2026-02-12",
      type: "assignment"
    },
    "s1-bridge": {
      canvasId: "570071",
      title: "Bridge Reflection: Beyond Technical → Accountable Growth",
      dueDate: "2026-02-13",
      type: "bridge"
    },

    // Sprint 2
    "s2-outreach": {
      canvasId: "200001",
      title: "S2: Professional Outreach",
      dueDate: "2026-02-19",
      type: "assignment"
    },
    "s2-fallback-plan": {
      canvasId: "200002",
      title: "S2: Fallback Plan",
      dueDate: "2026-02-19",
      type: "assignment"
    },
    "s2-reflection-4": {
      canvasId: "200003",
      title: "S2: Productive Reflection #4",
      dueDate: "2026-02-21",
      type: "reflection"
    },
    "s2-partner-confirmed": {
      canvasId: "200004",
      title: "S2: Accountability Partner Confirmed",
      dueDate: "2026-02-26",
      type: "assignment"
    },
    "s2-first-conversation": {
      canvasId: "200005",
      title: "S2: First Conversation",
      dueDate: "2026-02-26",
      type: "assignment"
    },
    "s2-revised-plan": {
      canvasId: "200006",
      title: "S2: Revised Development Plan",
      dueDate: "2026-02-26",
      type: "assignment"
    },
    "s2-reflection-5": {
      canvasId: "200007",
      title: "S2: Productive Reflection #5",
      dueDate: "2026-02-28",
      type: "reflection"
    },
    "s2-stretch-activity": {
      canvasId: "200008",
      title: "S2: Stretch Activity",
      dueDate: "2026-03-05",
      type: "assignment"
    },
    "s2-checkin-2": {
      canvasId: "200009",
      title: "S2: Check-In #2",
      dueDate: "2026-03-05",
      type: "assignment"
    },
    "s2-reflection-6": {
      canvasId: "200010",
      title: "S2: Productive Reflection #6",
      dueDate: "2026-03-07",
      type: "reflection"
    },
    "s2-demonstration": {
      canvasId: "200011",
      title: "S2: Demonstration with Validation",
      dueDate: "2026-03-12",
      type: "assignment"
    },
    "s2-peer-eval": {
      canvasId: "200012",
      title: "S2: Peer Evaluation",
      dueDate: "2026-03-13",
      type: "assignment"
    },
    "s2-bridge": {
      canvasId: "200013",
      title: "Bridge Reflection: Accountable Growth → Transfer",
      dueDate: "2026-03-14",
      type: "bridge"
    },

    // Sprint 3
    "s3-curiosity-inventory": {
      canvasId: "300001",
      title: "S3: Curiosity Inventory",
      dueDate: "2026-03-26",
      type: "assignment"
    },
    "s3-transfer-plan": {
      canvasId: "300002",
      title: "S3: Transfer Plan",
      dueDate: "2026-03-26",
      type: "assignment"
    },
    "s3-reflection-7": {
      canvasId: "300003",
      title: "S3: Productive Reflection #7",
      dueDate: "2026-03-28",
      type: "reflection"
    },
    "s3-learning-log": {
      canvasId: "300004",
      title: "S3: Learning Log",
      dueDate: "2026-04-02",
      type: "assignment"
    },
    "s3-reflection-8": {
      canvasId: "300005",
      title: "S3: Productive Reflection #8",
      dueDate: "2026-04-04",
      type: "reflection"
    },
    "s3-mini-project": {
      canvasId: "300006",
      title: "S3: Mini-Project",
      dueDate: "2026-04-09",
      type: "assignment"
    },
    "s3-iteration-doc": {
      canvasId: "300007",
      title: "S3: Iteration After Struggle",
      dueDate: "2026-04-09",
      type: "assignment"
    },
    "s3-reflection-9": {
      canvasId: "300008",
      title: "S3: Productive Reflection #9",
      dueDate: "2026-04-11",
      type: "reflection"
    },
    "s3-presentation": {
      canvasId: "300009",
      title: "S3: Transfer Presentation",
      dueDate: "2026-04-16",
      type: "assignment"
    },
    "s3-peer-eval": {
      canvasId: "300010",
      title: "S3: Peer Evaluation",
      dueDate: "2026-04-17",
      type: "assignment"
    },
    "s3-bridge": {
      canvasId: "300011",
      title: "Bridge Reflection: Transfer → Proving It",
      dueDate: "2026-04-18",
      type: "bridge"
    },

    // Sprint 4
    "s4-evidence-inventory": {
      canvasId: "400001",
      title: "S4: Evidence Inventory",
      dueDate: "2026-04-23",
      type: "assignment"
    },
    "s4-gap-analysis": {
      canvasId: "400002",
      title: "S4: Gap Analysis",
      dueDate: "2026-04-23",
      type: "assignment"
    },
    "s4-reflection-10": {
      canvasId: "400003",
      title: "S4: Productive Reflection #10",
      dueDate: "2026-04-25",
      type: "reflection"
    },
    "s4-narrative-arc": {
      canvasId: "400004",
      title: "S4: Narrative Arc Draft",
      dueDate: "2026-04-30",
      type: "assignment"
    },
    "s4-evidence-selection": {
      canvasId: "400005",
      title: "S4: Evidence Selection",
      dueDate: "2026-04-30",
      type: "assignment"
    },
    "s4-reflection-11": {
      canvasId: "400006",
      title: "S4: Productive Reflection #11",
      dueDate: "2026-05-02",
      type: "reflection"
    },
    "s4-defense-draft": {
      canvasId: "400007",
      title: "S4: Defense Draft",
      dueDate: "2026-05-07",
      type: "assignment"
    },
    "s4-practice-defense": {
      canvasId: "400008",
      title: "S4: Practice Defense",
      dueDate: "2026-05-07",
      type: "assignment"
    },
    "s4-reflection-12": {
      canvasId: "400009",
      title: "S4: Productive Reflection #12",
      dueDate: "2026-05-09",
      type: "reflection"
    },
    "s4-final-defense": {
      canvasId: "400010",
      title: "S4: Final Portfolio Defense",
      dueDate: "2026-05-14",
      type: "assignment"
    },
    "s4-peer-eval": {
      canvasId: "400011",
      title: "S4: Peer Evaluations",
      dueDate: "2026-05-15",
      type: "assignment"
    },
    "s4-final-reflection": {
      canvasId: "400012",
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
    5: { start: "2026-02-15", end: "2026-02-21", sprint: 2, title: "Outreach & Accountability Setup" },
    6: { start: "2026-02-22", end: "2026-02-28", sprint: 2, title: "First Conversation" },
    7: { start: "2026-03-01", end: "2026-03-07", sprint: 2, title: "Stretch Challenge" },
    8: { start: "2026-03-08", end: "2026-03-14", sprint: 2, title: "Validated Demonstration" },
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
    const start = new Date(dates.start);
    const end = new Date(dates.end);
    end.setHours(23, 59, 59, 999);

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

  const start = new Date(weekData.start);
  const end = new Date(weekData.end);
  end.setHours(23, 59, 59, 999);

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
