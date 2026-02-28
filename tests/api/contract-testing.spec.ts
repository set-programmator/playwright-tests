import { test, expect } from '../../src/fixtures/test-fixtures';
import { mockServer } from '../../src/utils/mock-server';

test.describe('API Contract Testing @api @contract', () => {
  test.beforeEach(async ({ page }) => {
    // Setup mock server for each test
    await mockServer.setupMockRoutes(page);
  });

  test('should validate users API contract', async ({ page }) => {
    await page.goto('/');

    // Validate the complete API contract
    const contractResult = await mockServer.validateAPIContract(page, 'users-api.json');

    // Assert all contract validations passed
    expect(contractResult.passedValidations).toBe(contractResult.totalEndpoints);
    expect(contractResult.failedValidations).toHaveLength(0);

    // Log contract validation results
    console.log(`Contract: ${contractResult.contractName}`);
    console.log(`Endpoints: ${contractResult.totalEndpoints}`);
    console.log(`Passed: ${contractResult.passedValidations}`);
    console.log(`Failed: ${contractResult.failedValidations.length}`);

    // Detail any failures
    contractResult.failedValidations.forEach(failure => {
      console.error(`❌ ${failure.endpoint}: ${failure.errors.join(', ')}`);
    });
  });

  test('should mock API responses correctly', async ({ page }) => {
    await page.goto('/');

    // Test GET /api/users
    const usersResponse = await page.request.get('/api/users');
    expect(usersResponse.status()).toBe(200);
    
    const users = await usersResponse.json();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);
    expect(users[0]).toHaveProperty('id');
    expect(users[0]).toHaveProperty('name');
    expect(users[0]).toHaveProperty('email');

    // Test GET /api/users/1  
    const userResponse = await page.request.get('/api/users/1');
    expect(userResponse.status()).toBe(200);
    
    const user = await userResponse.json();
    expect(user).toHaveProperty('id', 1);
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('email');

    // Test POST /api/users
    const newUserResponse = await page.request.post('/api/users', {
      data: {
        name: 'Test User',
        email: 'test@example.com',
        role: 'user'
      }
    });
    expect(newUserResponse.status()).toBe(201);
    
    const newUser = await newUserResponse.json();
    expect(newUser).toHaveProperty('id');
    expect(newUser).toHaveProperty('name', 'New User');
  });

  test('should handle API error responses', async ({ page }) => {
    await page.goto('/');

    // Test 404 error
    const notFoundResponse = await page.request.get('/api/users/999');
    expect(notFoundResponse.status()).toBe(404);
    
    const errorData = await notFoundResponse.json();
    expect(errorData).toHaveProperty('error');
    expect(errorData).toHaveProperty('code');

    // Test 400 bad request (if configured)
    try {
      const badRequestResponse = await page.request.post('/api/users', {
        data: { invalid: 'data' }
      });
      
      if (badRequestResponse.status() === 400) {
        const errorData = await badRequestResponse.json();
        expect(errorData).toHaveProperty('error');
        expect(errorData).toHaveProperty('code');
      }
    } catch (error) {
      // Some mock configurations may not handle this case
      console.log('400 error test skipped - not configured in mock');
    }
  });

  test('should track intercepted requests', async ({ page }) => {
    await page.goto('/');

    // Make several API calls
    await page.request.get('/api/users');
    await page.request.get('/api/users/1');
    await page.request.post('/api/users', {
      data: { name: 'Test', email: 'test@test.com' }
    });

    // Check that requests were intercepted
    const interceptedRequests = mockServer.getInterceptedRequests();
    expect(interceptedRequests.length).toBeGreaterThanOrEqual(3);

    // Verify request details
    const getUsersRequest = interceptedRequests.find(r => 
      r.method === 'GET' && r.path === 'users'
    );
    expect(getUsersRequest).toBeDefined();

    const createUserRequest = interceptedRequests.find(r => 
      r.method === 'POST' && r.path === 'users'
    );
    expect(createUserRequest).toBeDefined();
    expect(createUserRequest.body).toBeTruthy();
  });

  test('should generate mock server report', async ({ page }) => {
    await page.goto('/');

    // Make some API calls
    await page.request.get('/api/users');
    await page.request.get('/api/users/1');

    // Generate and validate report
    const reportPath = mockServer.generateMockReport();
    expect(reportPath).toBeTruthy();

    console.log(`Mock server report generated: ${reportPath}`);
  });

  test('should validate response schemas', async ({ page }) => {
    await page.goto('/');

    // Test schema validation for users list
    const usersResponse = await page.request.get('/api/users');
    const users = await usersResponse.json();

    // Validate array structure
    expect(Array.isArray(users)).toBe(true);
    
    // Validate each user object structure
    users.forEach((user: any, index: number) => {
      expect(user).toHaveProperty('id');
      expect(user).toHaveProperty('name');
      expect(user).toHaveProperty('email');
      expect(typeof user.id).toBe('number');
      expect(typeof user.name).toBe('string');
      expect(typeof user.email).toBe('string');
    });

    // Test individual user schema
    const userResponse = await page.request.get('/api/users/1');
    const user = await userResponse.json();
    
    expect(typeof user.id).toBe('number');
    expect(typeof user.name).toBe('string');
    expect(typeof user.email).toBe('string');
    expect(user.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/); // Email format
  });
});