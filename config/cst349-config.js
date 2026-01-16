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
  canvasBaseUrl: "https://csumb.instructure.com/courses/XXXXX",

  // Canvas assignment URLs - UPDATE EACH SEMESTER
  // To find assignment IDs: Go to assignment in Canvas, look at URL
  // Example: /courses/12345/assignments/67890 -> canvasId: "67890"
  assignments: {
    // Sprint 1: Beyond Technical
    "s1-self-assessment": {
      canvasId: "100001",
      title: "Sprint 1: Skills Self-Assessment",
      dueDate: "2026-01-22",
      type: "assignment"
    },
    "s1-reflection-1": {
      canvasId: "100002",
      title: "Sprint 1: Productive Reflection #1",
      dueDate: "2026-01-24",
      type: "reflection"
    },
    "s1-five-whys": {
      canvasId: "100003",
      title: "Sprint 1: 5 Whys Analysis",
      dueDate: "2026-01-29",
      type: "assignment"
    },
    "s1-sprint-plan": {
      canvasId: "100004",
      title: "Sprint 1: Sprint Plan v1",
      dueDate: "2026-01-29",
      type: "assignment"
    },
    "s1-reflection-2": {
      canvasId: "100005",
      title: "Sprint 1: Productive Reflection #2",
      dueDate: "2026-01-31",
      type: "reflection"
    },
    "s1-learning-log": {
      canvasId: "100006",
      title: "Sprint 1: Learning Log (Week 3)",
      dueDate: "2026-02-05",
      type: "assignment"
    },
    "s1-reflection-3": {
      canvasId: "100007",
      title: "Sprint 1: Productive Reflection #3",
      dueDate: "2026-02-07",
      type: "reflection"
    },
    "s1-demonstration": {
      canvasId: "100008",
      title: "Sprint 1: Demonstration",
      dueDate: "2026-02-12",
      type: "assignment"
    },
    "s1-peer-eval": {
      canvasId: "100009",
      title: "Sprint 1: Peer Evaluation",
      dueDate: "2026-02-13",
      type: "assignment"
    },
    "s1-bridge": {
      canvasId: "100010",
      title: "Bridge Reflection: Beyond Technical → Accountable Growth",
      dueDate: "2026-02-14",
      type: "bridge"
    },

    // Sprint 2: Accountable Growth
    "s2-outreach": {
      canvasId: "200001",
      title: "Sprint 2: Professional Outreach",
      dueDate: "2026-02-19",
      type: "assignment"
    },
    "s2-fallback-plan": {
      canvasId: "200002",
      title: "Sprint 2: Fallback Plan",
      dueDate: "2026-02-19",
      type: "assignment"
    },
    "s2-reflection-4": {
      canvasId: "200003",
      title: "Sprint 2: Productive Reflection #4",
      dueDate: "2026-02-21",
      type: "reflection"
    },
    "s2-partner-confirmed": {
      canvasId: "200004",
      title: "Sprint 2: Accountability Partner Confirmed",
      dueDate: "2026-02-26",
      type: "assignment"
    },
    "s2-first-conversation": {
      canvasId: "200005",
      title: "Sprint 2: First Conversation",
      dueDate: "2026-02-26",
      type: "assignment"
    },
    "s2-revised-plan": {
      canvasId: "200006",
      title: "Sprint 2: Revised Development Plan",
      dueDate: "2026-02-26",
      type: "assignment"
    },
    "s2-reflection-5": {
      canvasId: "200007",
      title: "Sprint 2: Productive Reflection #5",
      dueDate: "2026-02-28",
      type: "reflection"
    },
    "s2-stretch-activity": {
      canvasId: "200008",
      title: "Sprint 2: Stretch Activity",
      dueDate: "2026-03-05",
      type: "assignment"
    },
    "s2-checkin-2": {
      canvasId: "200009",
      title: "Sprint 2: Check-In #2",
      dueDate: "2026-03-05",
      type: "assignment"
    },
    "s2-reflection-6": {
      canvasId: "200010",
      title: "Sprint 2: Productive Reflection #6",
      dueDate: "2026-03-07",
      type: "reflection"
    },
    "s2-demonstration": {
      canvasId: "200011",
      title: "Sprint 2: Demonstration with Validation",
      dueDate: "2026-03-12",
      type: "assignment"
    },
    "s2-peer-eval": {
      canvasId: "200012",
      title: "Sprint 2: Peer Evaluation",
      dueDate: "2026-03-13",
      type: "assignment"
    },
    "s2-bridge": {
      canvasId: "200013",
      title: "Bridge Reflection: Accountable Growth → Transfer",
      dueDate: "2026-03-14",
      type: "bridge"
    },

    // Sprint 3: Transfer
    "s3-curiosity-inventory": {
      canvasId: "300001",
      title: "Sprint 3: Curiosity Inventory",
      dueDate: "2026-03-26",
      type: "assignment"
    },
    "s3-transfer-plan": {
      canvasId: "300002",
      title: "Sprint 3: Transfer Plan",
      dueDate: "2026-03-26",
      type: "assignment"
    },
    "s3-reflection-7": {
      canvasId: "300003",
      title: "Sprint 3: Productive Reflection #7",
      dueDate: "2026-03-28",
      type: "reflection"
    },
    "s3-learning-log": {
      canvasId: "300004",
      title: "Sprint 3: Learning Log",
      dueDate: "2026-04-02",
      type: "assignment"
    },
    "s3-reflection-8": {
      canvasId: "300005",
      title: "Sprint 3: Productive Reflection #8",
      dueDate: "2026-04-04",
      type: "reflection"
    },
    "s3-mini-project": {
      canvasId: "300006",
      title: "Sprint 3: Mini-Project",
      dueDate: "2026-04-09",
      type: "assignment"
    },
    "s3-iteration-doc": {
      canvasId: "300007",
      title: "Sprint 3: Iteration After Struggle",
      dueDate: "2026-04-09",
      type: "assignment"
    },
    "s3-reflection-9": {
      canvasId: "300008",
      title: "Sprint 3: Productive Reflection #9",
      dueDate: "2026-04-11",
      type: "reflection"
    },
    "s3-presentation": {
      canvasId: "300009",
      title: "Sprint 3: Transfer Presentation",
      dueDate: "2026-04-16",
      type: "assignment"
    },
    "s3-peer-eval": {
      canvasId: "300010",
      title: "Sprint 3: Peer Evaluation",
      dueDate: "2026-04-17",
      type: "assignment"
    },
    "s3-bridge": {
      canvasId: "300011",
      title: "Bridge Reflection: Transfer → Proving It",
      dueDate: "2026-04-18",
      type: "bridge"
    },

    // Sprint 4: Proving It
    "s4-evidence-inventory": {
      canvasId: "400001",
      title: "Sprint 4: Evidence Inventory",
      dueDate: "2026-04-23",
      type: "assignment"
    },
    "s4-gap-analysis": {
      canvasId: "400002",
      title: "Sprint 4: Gap Analysis",
      dueDate: "2026-04-23",
      type: "assignment"
    },
    "s4-reflection-10": {
      canvasId: "400003",
      title: "Sprint 4: Productive Reflection #10",
      dueDate: "2026-04-25",
      type: "reflection"
    },
    "s4-narrative-arc": {
      canvasId: "400004",
      title: "Sprint 4: Narrative Arc Draft",
      dueDate: "2026-04-30",
      type: "assignment"
    },
    "s4-evidence-selection": {
      canvasId: "400005",
      title: "Sprint 4: Evidence Selection",
      dueDate: "2026-04-30",
      type: "assignment"
    },
    "s4-reflection-11": {
      canvasId: "400006",
      title: "Sprint 4: Productive Reflection #11",
      dueDate: "2026-05-02",
      type: "reflection"
    },
    "s4-defense-draft": {
      canvasId: "400007",
      title: "Sprint 4: Defense Draft",
      dueDate: "2026-05-07",
      type: "assignment"
    },
    "s4-practice-defense": {
      canvasId: "400008",
      title: "Sprint 4: Practice Defense",
      dueDate: "2026-05-07",
      type: "assignment"
    },
    "s4-reflection-12": {
      canvasId: "400009",
      title: "Sprint 4: Productive Reflection #12",
      dueDate: "2026-05-09",
      type: "reflection"
    },
    "s4-final-defense": {
      canvasId: "400010",
      title: "Sprint 4: Final Portfolio Defense",
      dueDate: "2026-05-14",
      type: "assignment"
    },
    "s4-peer-eval": {
      canvasId: "400011",
      title: "Sprint 4: Peer Evaluations",
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
    dojoAccess: "https://symbioticthinking.ai/dojo",
    syllabus: "https://docs.google.com/document/d/SYLLABUS_DOC_ID"
  },

  // Week dates for determining "current week"
  // UPDATE EACH SEMESTER
  weekDates: {
    1: { start: "2026-01-19", end: "2026-01-23", sprint: 1, title: "Orientation & Self-Assessment" },
    2: { start: "2026-01-26", end: "2026-01-30", sprint: 1, title: "Identifying Your Growth Edge" },
    3: { start: "2026-02-02", end: "2026-02-06", sprint: 1, title: "Active Learning" },
    4: { start: "2026-02-09", end: "2026-02-13", sprint: 1, title: "Demonstration & Synthesis" },
    5: { start: "2026-02-16", end: "2026-02-20", sprint: 2, title: "Outreach & Accountability Setup" },
    6: { start: "2026-02-23", end: "2026-02-27", sprint: 2, title: "First Conversation" },
    7: { start: "2026-03-02", end: "2026-03-06", sprint: 2, title: "Stretch Challenge" },
    8: { start: "2026-03-09", end: "2026-03-13", sprint: 2, title: "Validated Demonstration" },
    9: { start: "2026-03-23", end: "2026-03-27", sprint: 3, title: "Curiosity Mapping" },
    10: { start: "2026-03-30", end: "2026-04-03", sprint: 3, title: "Following the Thread" },
    11: { start: "2026-04-06", end: "2026-04-10", sprint: 3, title: "Building Something" },
    12: { start: "2026-04-13", end: "2026-04-17", sprint: 3, title: "Transfer Demonstration" },
    13: { start: "2026-04-20", end: "2026-04-24", sprint: 4, title: "Evidence Audit" },
    14: { start: "2026-04-27", end: "2026-05-01", sprint: 4, title: "Portfolio Construction" },
    15: { start: "2026-05-04", end: "2026-05-08", sprint: 4, title: "Defense Preparation" },
    16: { start: "2026-05-11", end: "2026-05-15", sprint: 4, title: "Final Defense" }
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
    formUrl: "#",             // UPDATE: Google Form URL when available

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
