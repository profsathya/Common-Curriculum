/**
 * Canvas LMS API Client
 *
 * Provides methods to interact with the Canvas LMS API.
 * Requires CANVAS_API_TOKEN and CANVAS_BASE_URL environment variables.
 */

class CanvasAPI {
  constructor(baseUrl, token, options = {}) {
    this.baseUrl = baseUrl?.replace(/\/$/, ''); // Remove trailing slash
    this.token = token;
    this.maxRetries = options.maxRetries ?? 3;
    this.baseDelay = options.baseDelay ?? 1000; // ms
    this.maxConcurrent = options.maxConcurrent ?? 5;
    this._activeRequests = 0;

    if (!this.baseUrl || !this.token) {
      throw new Error(
        'Canvas API requires CANVAS_BASE_URL and CANVAS_API_TOKEN environment variables.\n' +
        'Set these in GitHub Secrets (Settings → Secrets → Actions)'
      );
    }
  }

  /**
   * Wait until the number of active requests drops below maxConcurrent.
   */
  async _acquireConcurrencySlot() {
    while (this._activeRequests >= this.maxConcurrent) {
      await new Promise(resolve => setTimeout(resolve, 50));
    }
    this._activeRequests++;
  }

  _releaseConcurrencySlot() {
    this._activeRequests--;
  }

  /**
   * Determine whether a failed response should be retried.
   */
  static isRetryable(status) {
    return status === 403 || status === 429 || status >= 500;
  }

  /**
   * Execute a fetch with exponential backoff retry on transient errors.
   * Respects Canvas Retry-After header when present.
   */
  async fetchWithRetry(url, options = {}) {
    let lastError;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      await this._acquireConcurrencySlot();
      try {
        const response = await fetch(url, options);

        if (response.ok || response.status === 301 || response.status === 302) {
          return response;
        }

        if (!CanvasAPI.isRetryable(response.status) || attempt === this.maxRetries) {
          const error = await response.text();
          throw new Error(`Canvas API error (${response.status}): ${error}`);
        }

        // Determine backoff delay — honour Retry-After if Canvas sends one
        const retryAfter = response.headers.get('Retry-After');
        const delay = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : this.baseDelay * Math.pow(2, attempt);

        lastError = new Error(`Canvas API error (${response.status})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      } catch (err) {
        // Network-level errors (ECONNRESET, timeouts) are retryable
        if (err.message.startsWith('Canvas API error') || attempt === this.maxRetries) {
          throw err;
        }
        lastError = err;
        const delay = this.baseDelay * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      } finally {
        this._releaseConcurrencySlot();
      }
    }

    throw lastError;
  }

  /**
   * Make an authenticated request to the Canvas API
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}/api/v1${endpoint}`;

    const response = await this.fetchWithRetry(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    return response.json();
  }

  /**
   * Fetch all pages of a paginated endpoint
   */
  async requestAllPages(endpoint) {
    const results = [];
    let url = `${this.baseUrl}/api/v1${endpoint}`;

    while (url) {
      const response = await this.fetchWithRetry(url, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

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
      `/courses/${courseId}/assignments/${assignmentId}/submissions?per_page=100&include[]=submission_comments`
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
   * Get a single submission for a student
   */
  async getSubmission(courseId, assignmentId, userId) {
    return this.request(
      `/courses/${courseId}/assignments/${assignmentId}/submissions/${userId}?include[]=submission_comments`
    );
  }

  /**
   * Grade a submission and optionally post a comment
   */
  async gradeSubmission(courseId, assignmentId, userId, { grade, comment } = {}) {
    const url = `${this.baseUrl}/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions/${userId}`;
    const params = new URLSearchParams();
    if (grade !== undefined) params.append('submission[posted_grade]', grade);
    if (comment) params.append('comment[text_comment]', comment);

    const response = await this.fetchWithRetry(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    return response.json();
  }

  /**
   * Download a file by URL (for submission attachments).
   * Handles Canvas's redirect to CDN — the CDN must NOT receive the Bearer token.
   */
  async downloadFileContent(url) {
    const initial = await this.fetchWithRetry(url, {
      headers: { 'Authorization': `Bearer ${this.token}` },
      redirect: 'manual',
    });

    let fileResponse;
    if (initial.status === 301 || initial.status === 302) {
      const cdnUrl = initial.headers.get('location');
      if (!cdnUrl) throw new Error('Redirect with no Location header');
      fileResponse = await this.fetchWithRetry(cdnUrl); // No auth for CDN
    } else {
      fileResponse = initial;
    }

    return fileResponse.text();
  }

  /**
   * Download a file as base64, handling Canvas's redirect to CDN.
   * Canvas file URLs typically 302-redirect to a pre-signed S3 URL.
   * The S3 URL must NOT receive the Bearer token.
   * Returns { base64, mimeType, size }
   */
  async downloadFileAsBase64(url) {
    const initial = await this.fetchWithRetry(url, {
      headers: { 'Authorization': `Bearer ${this.token}` },
      redirect: 'manual',
    });

    let fileResponse;
    if (initial.status === 301 || initial.status === 302) {
      const cdnUrl = initial.headers.get('location');
      if (!cdnUrl) throw new Error('Redirect with no Location header');
      fileResponse = await this.fetchWithRetry(cdnUrl);
    } else {
      fileResponse = initial;
    }

    const buffer = await fileResponse.arrayBuffer();
    const contentType = fileResponse.headers.get('content-type') || '';
    return {
      base64: Buffer.from(buffer).toString('base64'),
      mimeType: contentType,
      size: buffer.byteLength,
    };
  }
}

module.exports = { CanvasAPI };
