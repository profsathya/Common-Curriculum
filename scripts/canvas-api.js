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
}

module.exports = { CanvasAPI };
