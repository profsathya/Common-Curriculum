/**
 * CST395 Configuration
 * AI-Native Solution Engineering
 *
 * UPDATE THIS FILE EACH SEMESTER:
 * 1. Change canvasBaseUrl to new course ID
 * 2. Update all assignment canvasId values
 * 3. Update weekDates for new semester
 * 4. Add Loom video URLs as they become available
 */

const CST395_CONFIG = {
  // Semester info
  semester: "Spring 2025",
  courseCode: "CST395-01",
  courseName: "AI-Native Solution Engineering",

  // Canvas base URL - UPDATE EACH SEMESTER
  // Find this in your Canvas URL: https://csumb.instructure.com/courses/XXXXX
  canvasBaseUrl: "https://csumb.instructure.com/courses/33084",

  // Canvas assignment URLs - UPDATE EACH SEMESTER
  // To find assignment IDs: Go to assignment in Canvas, look at URL
  // Example: /courses/12345/assignments/67890 -> canvasId: "67890"
  assignments: {
    // Sprint 1: Foundation
    "s1-superagency-challenge": {
      canvasId: "562671",
      title: "Sprint 1: Superagency Challenge",
      dueDate: "2025-01-22",
      type: "assignment"
    },
    "s1-reflection-1": {
      canvasId: "100002",
      title: "Sprint 1: Productive Reflection #1",
      dueDate: "2025-01-24",
      type: "reflection"
    },
    "s1-problem-analysis": {
      canvasId: "100003",
      title: "Sprint 1: Problem Analysis (5 Whys)",
      dueDate: "2025-01-29",
      type: "assignment"
    },
    "s1-reflection-2": {
      canvasId: "100004",
      title: "Sprint 1: Productive Reflection #2",
      dueDate: "2025-01-31",
      type: "reflection"
    },
    "s1-solution-architecture": {
      canvasId: "100005",
      title: "Sprint 1: Solution Architecture",
      dueDate: "2025-02-05",
      type: "assignment"
    },
    "s1-build-log": {
      canvasId: "100006",
      title: "Sprint 1: Build Log Entry",
      dueDate: "2025-02-07",
      type: "reflection"
    },
    "s1-presentation": {
      canvasId: "100007",
      title: "Sprint 1: Solution Presentation",
      dueDate: "2025-02-12",
      type: "assignment"
    },
    "s1-human-value": {
      canvasId: "100008",
      title: "Sprint 1: Human Value Statement",
      dueDate: "2025-02-13",
      type: "reflection"
    },
    "s1-bridge": {
      canvasId: "100009",
      title: "Bridge Reflection: Foundation → Mirror",
      dueDate: "2025-02-14",
      type: "bridge"
    },

    // Sprint 2: Mirror
    "s2-stakeholder-selection": {
      canvasId: "200001",
      title: "Sprint 2: Stakeholder Selection",
      dueDate: "2025-02-19",
      type: "assignment"
    },
    "s2-reflection-1": {
      canvasId: "200002",
      title: "Sprint 2: Productive Reflection #1",
      dueDate: "2025-02-21",
      type: "reflection"
    },
    "s2-domain-learning": {
      canvasId: "200003",
      title: "Sprint 2: Domain Learning Plan",
      dueDate: "2025-02-26",
      type: "assignment"
    },
    "s2-reflection-2": {
      canvasId: "200004",
      title: "Sprint 2: Productive Reflection #2",
      dueDate: "2025-02-28",
      type: "reflection"
    },
    "s2-solution-prototype": {
      canvasId: "200005",
      title: "Sprint 2: Solution Prototype",
      dueDate: "2025-03-05",
      type: "assignment"
    },
    "s2-build-log": {
      canvasId: "200006",
      title: "Sprint 2: Build Log Entry",
      dueDate: "2025-03-07",
      type: "reflection"
    },
    "s2-stakeholder-demo": {
      canvasId: "200007",
      title: "Sprint 2: Stakeholder Demo",
      dueDate: "2025-03-12",
      type: "assignment"
    },
    "s2-human-value": {
      canvasId: "200008",
      title: "Sprint 2: Human Value Statement",
      dueDate: "2025-03-13",
      type: "reflection"
    },
    "s2-bridge": {
      canvasId: "200009",
      title: "Bridge Reflection: Mirror → Complexity",
      dueDate: "2025-03-14",
      type: "bridge"
    },

    // Sprint 3: Complexity
    "s3-domain-selection": {
      canvasId: "300001",
      title: "Sprint 3: Domain Selection",
      dueDate: "2025-03-26",
      type: "assignment"
    },
    "s3-reflection-1": {
      canvasId: "300002",
      title: "Sprint 3: Productive Reflection #1",
      dueDate: "2025-03-28",
      type: "reflection"
    },
    "s3-stakeholder-research": {
      canvasId: "300003",
      title: "Sprint 3: Stakeholder Research",
      dueDate: "2025-04-02",
      type: "assignment"
    },
    "s3-reflection-2": {
      canvasId: "300004",
      title: "Sprint 3: Productive Reflection #2",
      dueDate: "2025-04-04",
      type: "reflection"
    },
    "s3-mvp": {
      canvasId: "300005",
      title: "Sprint 3: Minimum Viable Product",
      dueDate: "2025-04-09",
      type: "assignment"
    },
    "s3-build-log": {
      canvasId: "300006",
      title: "Sprint 3: Build Log Entry",
      dueDate: "2025-04-11",
      type: "reflection"
    },
    "s3-presentation": {
      canvasId: "300007",
      title: "Sprint 3: Solution Presentation",
      dueDate: "2025-04-16",
      type: "assignment"
    },
    "s3-human-value": {
      canvasId: "300008",
      title: "Sprint 3: Human Value Statement",
      dueDate: "2025-04-17",
      type: "reflection"
    },
    "s3-bridge": {
      canvasId: "300009",
      title: "Bridge Reflection: Complexity → Mastery",
      dueDate: "2025-04-18",
      type: "bridge"
    },

    // Sprint 4: Mastery
    "s4-problem-definition": {
      canvasId: "400001",
      title: "Sprint 4: Problem Definition",
      dueDate: "2025-04-23",
      type: "assignment"
    },
    "s4-reflection-1": {
      canvasId: "400002",
      title: "Sprint 4: Productive Reflection #1",
      dueDate: "2025-04-25",
      type: "reflection"
    },
    "s4-execution-plan": {
      canvasId: "400003",
      title: "Sprint 4: Execution Plan",
      dueDate: "2025-04-30",
      type: "assignment"
    },
    "s4-reflection-2": {
      canvasId: "400004",
      title: "Sprint 4: Productive Reflection #2",
      dueDate: "2025-05-02",
      type: "reflection"
    },
    "s4-final-solution": {
      canvasId: "400005",
      title: "Sprint 4: Final Solution",
      dueDate: "2025-05-07",
      type: "assignment"
    },
    "s4-build-log": {
      canvasId: "400006",
      title: "Sprint 4: Build Log Entry",
      dueDate: "2025-05-09",
      type: "reflection"
    },
    "s4-final-presentation": {
      canvasId: "400007",
      title: "Sprint 4: Final Presentation",
      dueDate: "2025-05-14",
      type: "assignment"
    },
    "s4-portfolio": {
      canvasId: "400008",
      title: "Sprint 4: Portfolio Reflection",
      dueDate: "2025-05-15",
      type: "reflection"
    },
    "s4-course-reflection": {
      canvasId: "400009",
      title: "Course Reflection: Full Journey",
      dueDate: "2025-05-16",
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
    myUnderstandingTemplate: "https://docs.google.com/document/d/UNDERSTANDING_DOC_ID",
    syllabus: "https://docs.google.com/document/d/SYLLABUS_DOC_ID"
  },

  // Week dates for determining "current week"
  // UPDATE EACH SEMESTER
  weekDates: {
    1: { start: "2025-01-20", end: "2025-01-24", sprint: 1, title: "Orientation & Problem Discovery" },
    2: { start: "2025-01-27", end: "2025-01-31", sprint: 1, title: "Understanding Before Building" },
    3: { start: "2025-02-03", end: "2025-02-07", sprint: 1, title: "Strategic Building" },
    4: { start: "2025-02-10", end: "2025-02-14", sprint: 1, title: "Reflection & Human Value" },
    5: { start: "2025-02-17", end: "2025-02-21", sprint: 2, title: "Discovering Another's Problem" },
    6: { start: "2025-02-24", end: "2025-02-28", sprint: 2, title: "Rapid Domain Learning" },
    7: { start: "2025-03-03", end: "2025-03-07", sprint: 2, title: "Building for Another" },
    8: { start: "2025-03-10", end: "2025-03-14", sprint: 2, title: "Value Through Another's Eyes" },
    9: { start: "2025-03-24", end: "2025-03-28", sprint: 3, title: "Entering Unfamiliar Territory" },
    10: { start: "2025-03-31", end: "2025-04-04", sprint: 3, title: "Stakeholder Discovery Without Access" },
    11: { start: "2025-04-07", end: "2025-04-11", sprint: 3, title: "Simple Over Sophisticated" },
    12: { start: "2025-04-14", end: "2025-04-18", sprint: 3, title: "Value at the Intersection" },
    13: { start: "2025-04-21", end: "2025-04-25", sprint: 4, title: "Autonomous Problem Definition" },
    14: { start: "2025-04-28", end: "2025-05-02", sprint: 4, title: "Independent Execution" },
    15: { start: "2025-05-05", end: "2025-05-09", sprint: 4, title: "Integration & Refinement" },
    16: { start: "2025-05-12", end: "2025-05-16", sprint: 4, title: "Demonstration & Reflection" }
  },

  // Sprint info
  sprints: {
    1: { name: "Foundation", theme: "Superagency Over Self", stakeholder: "Yourself", scaffolding: "High" },
    2: { name: "Mirror", theme: "Learning Through Others", stakeholder: "Close acquaintance", scaffolding: "Medium-High" },
    3: { name: "Complexity", theme: "Navigating Ambiguity", stakeholder: "External entity", scaffolding: "Medium" },
    4: { name: "Mastery", theme: "Full Autonomy", stakeholder: "Your choice", scaffolding: "Low" }
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
    const start = new Date(dates.start);
    const end = new Date(dates.end);
    end.setHours(23, 59, 59, 999); // Include full end day

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

  const start = new Date(weekData.start);
  const end = new Date(weekData.end);
  end.setHours(23, 59, 59, 999);

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
let TEST_CURRENT_WEEK = 2; // Set to week 2 for demo purposes

function getEffectiveCurrentWeek() {
  return TEST_CURRENT_WEEK !== null ? TEST_CURRENT_WEEK : getCurrentWeek();
}
