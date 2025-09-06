import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('Users API Tests @regression', () => {
  test('should get all users', async ({ usersAPI }) => {
    const response = await usersAPI.getAllUsers();
    
    expect(response.status()).toBe(200);
    
    const users = await response.json();
    expect(Array.isArray(users)).toBe(true);
    expect(users.length).toBeGreaterThan(0);
  });

  test('should get user by ID', async ({ usersAPI }) => {
    const response = await usersAPI.getUserById(1);
    
    expect(response.status()).toBe(200);
    
    const user = await response.json();
    expect(user.id).toBe(1);
    expect(user.name).toBeDefined();
    expect(user.email).toBeDefined();
  });

  test('should validate user schema', async ({ usersAPI }) => {
    const response = await usersAPI.getUserById(1);
    const schema = usersAPI.getUserSchema();
    
    expect(response.status()).toBe(200);
    
    const isValid = await usersAPI.validateSchema(response, schema);
    expect(isValid).toBe(true);
  });

  test('should create new user', async ({ usersAPI }) => {
    const newUser = {
      name: 'Test User',
      username: 'testuser',
      email: 'test@example.com'
    };
    
    const response = await usersAPI.createUser(newUser);
    
    expect(response.status()).toBe(201);
    
    const createdUser = await response.json();
    expect(createdUser.name).toBe(newUser.name);
    expect(createdUser.email).toBe(newUser.email);
  });

  test('should handle 404 for non-existent user', async ({ usersAPI }) => {
    const response = await usersAPI.getUserById(999);
    
    expect(response.status()).toBe(404);
  });
});