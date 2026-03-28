/**
 * Canvas API Tests
 *
 * Tests retry/backoff logic, concurrency limiting, and core request methods
 * using a mock fetch implementation (no real Canvas API calls).
 */

const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');

// Save and restore global fetch
let originalFetch;

function installMockFetch(mockFn) {
  originalFetch = globalThis.fetch;
  globalThis.fetch = mockFn;
}

function restoreFetch() {
  if (originalFetch !== undefined) {
    globalThis.fetch = originalFetch;
    originalFetch = undefined;
  }
}

// Create a mock Response object
function mockResponse(status, body, headers = {}) {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: {
      get(name) { return headers[name.toLowerCase()] || null; },
    },
    json: async () => (typeof body === 'string' ? JSON.parse(body) : body),
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
    arrayBuffer: async () => {
      const str = typeof body === 'string' ? body : JSON.stringify(body);
      return Buffer.from(str).buffer;
    },
  };
}

// Load CanvasAPI fresh (after fetch mock is set up)
const { CanvasAPI } = require('../scripts/canvas-api.js');

describe('CanvasAPI constructor', () => {
  it('throws if baseUrl or token is missing', () => {
    assert.throws(() => new CanvasAPI('', 'token'), /CANVAS_BASE_URL/);
    assert.throws(() => new CanvasAPI('http://canvas.test', ''), /CANVAS_API_TOKEN/);
  });

  it('strips trailing slash from baseUrl', () => {
    installMockFetch(() => {});
    try {
      const api = new CanvasAPI('http://canvas.test/', 'tok');
      assert.equal(api.baseUrl, 'http://canvas.test');
    } finally {
      restoreFetch();
    }
  });

  it('accepts custom retry/concurrency options', () => {
    const api = new CanvasAPI('http://canvas.test', 'tok', {
      maxRetries: 5,
      baseDelay: 500,
      maxConcurrent: 10,
    });
    assert.equal(api.maxRetries, 5);
    assert.equal(api.baseDelay, 500);
    assert.equal(api.maxConcurrent, 10);
  });
});

describe('CanvasAPI.isRetryable', () => {
  it('returns true for 403, 429, and 5xx', () => {
    assert.equal(CanvasAPI.isRetryable(403), true);
    assert.equal(CanvasAPI.isRetryable(429), true);
    assert.equal(CanvasAPI.isRetryable(500), true);
    assert.equal(CanvasAPI.isRetryable(502), true);
    assert.equal(CanvasAPI.isRetryable(503), true);
  });

  it('returns false for 200, 201, 400, 401, 404', () => {
    assert.equal(CanvasAPI.isRetryable(200), false);
    assert.equal(CanvasAPI.isRetryable(201), false);
    assert.equal(CanvasAPI.isRetryable(400), false);
    assert.equal(CanvasAPI.isRetryable(401), false);
    assert.equal(CanvasAPI.isRetryable(404), false);
  });
});

describe('fetchWithRetry', () => {
  let api;

  beforeEach(() => {
    api = new CanvasAPI('http://canvas.test', 'tok', {
      maxRetries: 2,
      baseDelay: 10, // Short for tests
    });
  });

  afterEach(() => {
    restoreFetch();
  });

  it('returns response on first success', async () => {
    installMockFetch(async () => mockResponse(200, { ok: true }));

    const resp = await api.fetchWithRetry('http://canvas.test/api/v1/test');
    const data = await resp.json();
    assert.deepStrictEqual(data, { ok: true });
  });

  it('retries on 429 and succeeds', async () => {
    let attempts = 0;
    installMockFetch(async () => {
      attempts++;
      if (attempts === 1) return mockResponse(429, 'Rate limited');
      return mockResponse(200, { ok: true });
    });

    const resp = await api.fetchWithRetry('http://canvas.test/api/v1/test');
    const data = await resp.json();
    assert.deepStrictEqual(data, { ok: true });
    assert.equal(attempts, 2);
  });

  it('retries on 500 and succeeds', async () => {
    let attempts = 0;
    installMockFetch(async () => {
      attempts++;
      if (attempts <= 2) return mockResponse(500, 'Server error');
      return mockResponse(200, { ok: true });
    });

    const resp = await api.fetchWithRetry('http://canvas.test/api/v1/test');
    const data = await resp.json();
    assert.deepStrictEqual(data, { ok: true });
    assert.equal(attempts, 3);
  });

  it('throws after exhausting retries on 500', async () => {
    installMockFetch(async () => mockResponse(500, 'Server error'));

    await assert.rejects(
      () => api.fetchWithRetry('http://canvas.test/api/v1/test'),
      /Canvas API error \(500\)/
    );
  });

  it('does not retry on 404', async () => {
    let attempts = 0;
    installMockFetch(async () => {
      attempts++;
      return mockResponse(404, 'Not found');
    });

    await assert.rejects(
      () => api.fetchWithRetry('http://canvas.test/api/v1/test'),
      /Canvas API error \(404\)/
    );
    assert.equal(attempts, 1);
  });

  it('respects Retry-After header', async () => {
    let attempts = 0;
    const timestamps = [];
    installMockFetch(async () => {
      attempts++;
      timestamps.push(Date.now());
      if (attempts === 1) {
        return mockResponse(429, 'Rate limited', { 'retry-after': '0' });
      }
      return mockResponse(200, { ok: true });
    });

    await api.fetchWithRetry('http://canvas.test/api/v1/test');
    assert.equal(attempts, 2);
  });

  it('passes through 301/302 redirect responses', async () => {
    installMockFetch(async () =>
      mockResponse(302, '', { location: 'http://cdn.test/file' })
    );

    const resp = await api.fetchWithRetry('http://canvas.test/file', {
      redirect: 'manual',
    });
    assert.equal(resp.status, 302);
  });

  it('retries on network errors (fetch throws)', async () => {
    let attempts = 0;
    installMockFetch(async () => {
      attempts++;
      if (attempts === 1) throw new Error('ECONNRESET');
      return mockResponse(200, { ok: true });
    });

    const resp = await api.fetchWithRetry('http://canvas.test/api/v1/test');
    assert.equal((await resp.json()).ok, true);
    assert.equal(attempts, 2);
  });

  it('throws network error after exhausting retries', async () => {
    installMockFetch(async () => { throw new Error('ECONNRESET'); });

    await assert.rejects(
      () => api.fetchWithRetry('http://canvas.test/api/v1/test'),
      /ECONNRESET/
    );
  });
});

describe('request', () => {
  afterEach(() => restoreFetch());

  it('makes authenticated JSON request', async () => {
    let capturedUrl, capturedHeaders;
    installMockFetch(async (url, opts) => {
      capturedUrl = url;
      capturedHeaders = opts.headers;
      return mockResponse(200, { id: 1 });
    });

    const api = new CanvasAPI('http://canvas.test', 'my-token', { maxRetries: 0 });
    const result = await api.request('/courses/1');
    assert.equal(capturedUrl, 'http://canvas.test/api/v1/courses/1');
    assert.equal(capturedHeaders['Authorization'], 'Bearer my-token');
    assert.deepStrictEqual(result, { id: 1 });
  });
});

describe('requestAllPages', () => {
  afterEach(() => restoreFetch());

  it('follows pagination via Link header', async () => {
    let callCount = 0;
    installMockFetch(async (url) => {
      callCount++;
      if (callCount === 1) {
        return mockResponse(200, [{ id: 1 }, { id: 2 }], {
          link: '<http://canvas.test/api/v1/courses?page=2>; rel="next"',
        });
      }
      return mockResponse(200, [{ id: 3 }]);
    });

    const api = new CanvasAPI('http://canvas.test', 'tok', { maxRetries: 0 });
    const results = await api.requestAllPages('/courses');
    assert.deepStrictEqual(results, [{ id: 1 }, { id: 2 }, { id: 3 }]);
    assert.equal(callCount, 2);
  });

  it('returns single page when no Link header', async () => {
    installMockFetch(async () => mockResponse(200, [{ id: 1 }]));

    const api = new CanvasAPI('http://canvas.test', 'tok', { maxRetries: 0 });
    const results = await api.requestAllPages('/courses');
    assert.deepStrictEqual(results, [{ id: 1 }]);
  });
});

describe('getNextPageUrl', () => {
  it('extracts next URL from Link header', () => {
    const api = new CanvasAPI('http://canvas.test', 'tok');
    const url = api.getNextPageUrl(
      '<http://canvas.test/api/v1/courses?page=2>; rel="next", <http://canvas.test/api/v1/courses?page=1>; rel="prev"'
    );
    assert.equal(url, 'http://canvas.test/api/v1/courses?page=2');
  });

  it('returns null when no next link', () => {
    const api = new CanvasAPI('http://canvas.test', 'tok');
    assert.equal(api.getNextPageUrl('<http://test>; rel="prev"'), null);
    assert.equal(api.getNextPageUrl(null), null);
  });
});

describe('concurrency limiting', () => {
  afterEach(() => restoreFetch());

  it('limits concurrent requests to maxConcurrent', async () => {
    let maxConcurrent = 0;
    let currentConcurrent = 0;

    installMockFetch(async () => {
      currentConcurrent++;
      if (currentConcurrent > maxConcurrent) maxConcurrent = currentConcurrent;
      await new Promise(resolve => setTimeout(resolve, 20));
      currentConcurrent--;
      return mockResponse(200, { ok: true });
    });

    const api = new CanvasAPI('http://canvas.test', 'tok', {
      maxRetries: 0,
      maxConcurrent: 2,
    });

    // Fire 5 concurrent requests
    const promises = Array.from({ length: 5 }, () =>
      api.fetchWithRetry('http://canvas.test/api/v1/test')
    );
    await Promise.all(promises);

    assert.ok(maxConcurrent <= 2, `Expected max 2 concurrent, got ${maxConcurrent}`);
  });
});

describe('downloadFileContent', () => {
  afterEach(() => restoreFetch());

  it('follows redirect and fetches from CDN without auth', async () => {
    const fetchCalls = [];
    installMockFetch(async (url, opts) => {
      fetchCalls.push({ url, hasAuth: !!opts?.headers?.Authorization });
      if (url.includes('canvas.test')) {
        return mockResponse(302, '', { location: 'http://cdn.test/file.txt' });
      }
      return mockResponse(200, 'file contents');
    });

    const api = new CanvasAPI('http://canvas.test', 'tok', { maxRetries: 0 });
    const content = await api.downloadFileContent('http://canvas.test/files/1');
    assert.equal(content, 'file contents');
    assert.equal(fetchCalls.length, 2);
    assert.equal(fetchCalls[0].hasAuth, true);
    assert.equal(fetchCalls[1].hasAuth, false);
  });
});
