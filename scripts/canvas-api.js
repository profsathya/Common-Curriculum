/**
 * Canvas LMS API Client
 *
 * Provides methods to interact with the Canvas LMS API.
 * Requires CANVAS_API_TOKEN and CANVAS_BASE_URL environment variables.
 */

class CanvasAPI {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl?.replace(/\/$/, ''); // Remove trailing slash
    this.token = token;

    if (!this.baseUrl || !this.token) {
      throw new Error(
        'Canvas API requires CANVAS_BASE_URL and CANVAS_API_TOKEN environment variables.\n' +
        'Set these in GitHub Secrets (Settings → Secrets → Actions)'
      );
    }
  }

  /**
   * Make an authenticated request to the Canvas API
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}/api/v1${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Canvas API error (${response.status}): ${error}`);
    }

    return response.json();
  }

  /**
   * Fetch all pages of a paginated endpoint
   */
  async requestAllPages(endpoint) {
    const results = [];
    let url = `${this.baseUrl}/api/v1${endpoint}`;

    while (url) {
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Canvas API error (${response.status}): ${error}`);
      }

      const data = await response.json();
      results.push(...data);

      // Parse Link header for pagination
      const linkHeader = response.headers.get('Link');
      url = this.getNextPageUrl(linkHeader);
    }

    return results;
  }

  /**
   * Parse the Link header to get next page URL
   */
  getNextPageUrl(linkHeader) {
    if (!linkHeader) return null;

    const links = linkHeader.split(',');
    for (const link of links) {
      const match = link.match(/<([^>]+)>;\s*rel="next"/);
      if (match) return match[1];
    }
    return null;
  }

  /**
   * List all courses for the authenticated user
   */
  async listCourses() {
    return this.requestAllPages('/courses?per_page=100&include[]=term');
  }

  /**
   * Get a specific course by ID
   */
  async getCourse(courseId) {
    return this.request(`/courses/${courseId}`);
  }

  /**
   * List all assignments in a course
   */
  async listAssignments(courseId) {
    return this.requestAllPages(`/courses/${courseId}/assignments?per_page=100`);
  }

  /**
   * Get a specific assignment
   */
  async getAssignment(courseId, assignmentId) {
    return this.request(`/courses/${courseId}/assignments/${assignmentId}`);
  }

  /**
   * Create a new assignment
   */
  async createAssignment(courseId, assignment) {
    return this.request(`/courses/${courseId}/assignments`, {
      method: 'POST',
      body: JSON.stringify({ assignment }),
    });
  }

  /**
   * Update an existing assignment
   */
  async updateAssignment(courseId, assignmentId, assignment) {
    return this.request(`/courses/${courseId}/assignments/${assignmentId}`, {
      method: 'PUT',
      body: JSON.stringify({ assignment }),
    });
  }

  /**
   * List all modules in a course
   */
  async listModules(courseId) {
    return this.requestAllPages(`/courses/${courseId}/modules?per_page=100`);
  }

  /**
   * List items in a module
   */
  async listModuleItems(courseId, moduleId) {
    return this.requestAllPages(`/courses/${courseId}/modules/${moduleId}/items?per_page=100`);
  }

  /**
   * List all pages in a course
   */
  async listPages(courseId) {
    return this.requestAllPages(`/courses/${courseId}/pages?per_page=100`);
  }

  /**
   * List all quizzes in a course
   */
  async listQuizzes(courseId) {
    return this.requestAllPages(`/courses/${courseId}/quizzes?per_page=100`);
  }

  /**
   * List all assignment groups in a course
   */
  async listAssignmentGroups(courseId) {
    return this.requestAllPages(`/courses/${courseId}/assignment_groups?per_page=100`);
  }

  /**
   * Create a new quiz
   * @param {string} courseId - Course ID
   * @param {object} quiz - Quiz data
   *   - title: Quiz title
   *   - quiz_type: "practice_quiz", "assignment", "graded_survey", "survey"
   *   - points_possible: Total points
   *   - due_at: Due date (ISO 8601)
   *   - published: Boolean
   *   - assignment_group_id: Assignment group ID
   */
  async createQuiz(courseId, quiz) {
    return this.request(`/courses/${courseId}/quizzes`, {
      method: 'POST',
      body: JSON.stringify({ quiz }),
    });
  }

  /**
   * Update an existing quiz
   */
  async updateQuiz(courseId, quizId, quiz) {
    return this.request(`/courses/${courseId}/quizzes/${quizId}`, {
      method: 'PUT',
      body: JSON.stringify({ quiz }),
    });
  }

  /**
   * Add a question to a quiz
   * @param {string} courseId - Course ID
   * @param {string} quizId - Quiz ID
   * @param {object} question - Question data
   *   - question_name: Short name
   *   - question_text: Full question HTML
   *   - question_type: "multiple_choice_question", "essay_question", "short_answer_question", etc.
   *   - points_possible: Points for this question
   *   - answers: Array of answer objects (for multiple choice)
   */
  async addQuizQuestion(courseId, quizId, question) {
    return this.request(`/courses/${courseId}/quizzes/${quizId}/questions`, {
      method: 'POST',
      body: JSON.stringify({ question }),
    });
  }

  /**
   * Get quiz questions
   */
  async listQuizQuestions(courseId, quizId) {
    return this.requestAllPages(`/courses/${courseId}/quizzes/${quizId}/questions?per_page=100`);
  }

  /**
   * List all enrollments (students) in a course
   */
  async listEnrollments(courseId, type = 'StudentEnrollment') {
    return this.requestAllPages(`/courses/${courseId}/enrollments?per_page=100&type[]=${type}&state[]=active`);
  }

  /**
   * List all submissions for an assignment
   */
  async listSubmissions(courseId, assignmentId) {
    return this.requestAllPages(
      `/courses/${courseId}/assignments/${assignmentId}/submissions?per_page=100&include[]=submission_comments&include[]=attachments`
    );
  }

  /**
   * Get quiz submissions with file attachments
   * This is needed because the regular submissions API doesn't return attachments for quizzes
   */
  async listQuizSubmissions(courseId, quizId) {
    return this.requestAllPages(
      `/courses/${courseId}/quizzes/${quizId}/submissions?include[]=submission&include[]=user`
    );
  }

  /**
   * Generate a quiz student analysis report and return the CSV text.
   * This is the reliable way to get all quiz answers for completed submissions.
   */
  async generateQuizReport(courseId, quizId) {
    // Request a student analysis report
    const report = await this.request(
      `/courses/${courseId}/quizzes/${quizId}/reports`,
      {
        method: 'POST',
        body: JSON.stringify({
          quiz_report: { report_type: 'student_analysis', includes_all_versions: false }
        }),
      }
    );

    // If report already has a file ready, return it
    if (report.file && report.file.url) {
      return this.downloadFileContent(report.file.url);
    }

    // Poll for completion
    const reportId = report.id;
    const maxWait = 60000;
    const pollInterval = 2000;
    const startTime = Date.now();

    while (Date.now() - startTime < maxWait) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));

      const status = await this.request(
        `/courses/${courseId}/quizzes/${quizId}/reports/${reportId}`
      );

      if (status.file && status.file.url) {
        return this.downloadFileContent(status.file.url);
      }

      if (status.progress && status.progress.workflow_state === 'failed') {
        throw new Error('Quiz report generation failed');
      }
    }

    throw new Error('Quiz report generation timed out');
  }

  /**
   * Download a file by URL (for submission attachments)
   */
  async downloadFileContent(url) {
    const response = await fetch(url, {
      headers: { 'Authorization': `Bearer ${this.token}` },
    });
    if (!response.ok) {
      throw new Error(`Download failed (${response.status}): ${url}`);
    }
    return response.text();
  }
}

module.exports = { CanvasAPI };
