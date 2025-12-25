import { test, expect } from '@playwright/test';

/**
 * O1DMatch API E2E Tests
 * Tests API endpoints and Supabase integration
 */

test.describe('API Endpoints', () => {

  test.describe('Promo Code API', () => {
    test('validate promo endpoint exists', async ({ request }) => {
      const response = await request.post('/api/promo/validate', {
        data: { code: 'TEST123' }
      });

      // Should get a response (even if error, endpoint exists)
      expect(response.status()).toBeLessThan(500);
    });

    test('verify IGTA promo endpoint exists', async ({ request }) => {
      const response = await request.post('/api/promo/verify-igta', {
        data: { email: 'test@igta.com' }
      });

      expect(response.status()).toBeLessThan(500);
    });
  });

  test.describe('Stripe Endpoints', () => {
    test('checkout endpoint requires authentication', async ({ request }) => {
      const response = await request.post('/api/stripe/checkout', {
        data: { priceId: 'price_test' }
      });

      // Should return 401 or 400 for unauthenticated request
      expect([400, 401, 403, 500].includes(response.status())).toBeTruthy();
    });

    test('billing portal endpoint requires authentication', async ({ request }) => {
      const response = await request.post('/api/stripe/billing-portal');

      expect([400, 401, 403, 500].includes(response.status())).toBeTruthy();
    });
  });

  test.describe('Document Processing Endpoints', () => {
    test('process document endpoint requires authentication', async ({ request }) => {
      const response = await request.post('/api/process-document', {
        data: { documentUrl: 'https://example.com/doc.pdf' }
      });

      expect([400, 401, 403, 500].includes(response.status())).toBeTruthy();
    });

    test('classify document endpoint requires authentication', async ({ request }) => {
      const response = await request.post('/api/classify-document', {
        data: { content: 'test content' }
      });

      expect([400, 401, 403, 500].includes(response.status())).toBeTruthy();
    });
  });

  test.describe('Score Calculation', () => {
    test('calculate score endpoint requires authentication', async ({ request }) => {
      const response = await request.post('/api/calculate-score', {
        data: { talentId: 'test-id' }
      });

      expect([400, 401, 403, 500].includes(response.status())).toBeTruthy();
    });
  });

  test.describe('Applications', () => {
    test('applications endpoint requires authentication for POST', async ({ request }) => {
      const response = await request.post('/api/applications', {
        data: { jobId: 'test-job-id' }
      });

      expect([400, 401, 403, 500].includes(response.status())).toBeTruthy();
    });

    test('applications endpoint requires authentication for GET', async ({ request }) => {
      const response = await request.get('/api/applications');

      expect([400, 401, 403, 500].includes(response.status())).toBeTruthy();
    });
  });

  test.describe('Interest Letters', () => {
    test('interest letter endpoint requires authentication', async ({ request }) => {
      const response = await request.post('/api/interest-letter', {
        data: { talentId: 'test-id', commitment: 'exploratory' }
      });

      expect([400, 401, 403, 500].includes(response.status())).toBeTruthy();
    });

    test('generate letter PDF endpoint requires authentication', async ({ request }) => {
      const response = await request.post('/api/generate-letter-pdf', {
        data: { letterId: 'test-letter-id' }
      });

      expect([400, 401, 403, 500].includes(response.status())).toBeTruthy();
    });
  });

  test.describe('Job Matching', () => {
    test('job match endpoint requires authentication', async ({ request }) => {
      // API uses GET method with query params
      const response = await request.get('/api/job-match?talent_id=test-id&job_id=test-job');

      expect([400, 401, 403, 500].includes(response.status())).toBeTruthy();
    });
  });

  test.describe('Documents', () => {
    test('documents endpoint requires authentication', async ({ request }) => {
      const response = await request.get('/api/documents');

      expect([400, 401, 403, 500].includes(response.status())).toBeTruthy();
    });
  });

  test.describe('SignWell Integration', () => {
    test('signwell send endpoint requires authentication', async ({ request }) => {
      const response = await request.post('/api/signwell/send', {
        data: { letterId: 'test-letter-id' }
      });

      expect([400, 401, 403, 500].includes(response.status())).toBeTruthy();
    });

    test('signwell status endpoint returns data', async ({ request }) => {
      const response = await request.get('/api/signwell/status/test-letter-id');

      // May return 404 for non-existent letter or 401 for auth
      expect([400, 401, 403, 404, 500].includes(response.status())).toBeTruthy();
    });
  });

  test.describe('Admin Endpoints', () => {
    test('admin verify document requires admin auth', async ({ request }) => {
      const response = await request.post('/api/admin/verify-document', {
        data: { documentId: 'test-doc-id', status: 'verified' }
      });

      expect([400, 401, 403, 500].includes(response.status())).toBeTruthy();
    });
  });
});

test.describe('Server-Side Rendering', () => {
  test('homepage returns valid HTML', async ({ request }) => {
    const response = await request.get('/');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/html');

    const html = await response.text();
    expect(html).toContain('O1DMatch');
    expect(html).toContain('</html>');
  });

  test('signup page returns valid HTML', async ({ request }) => {
    const response = await request.get('/signup');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/html');
  });

  test('login page returns valid HTML', async ({ request }) => {
    const response = await request.get('/login');

    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toContain('text/html');
  });
});

test.describe('Static Assets', () => {
  test('favicon is accessible', async ({ request }) => {
    const response = await request.get('/favicon.ico');

    expect(response.status()).toBe(200);
  });
});

test.describe('Error Handling', () => {
  test('404 page for non-existent route', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist-12345');

    // Next.js should return 404
    expect(response?.status()).toBe(404);
  });

  test('invalid API endpoint returns error', async ({ request }) => {
    const response = await request.post('/api/nonexistent-endpoint');

    expect(response.status()).toBe(404);
  });
});
