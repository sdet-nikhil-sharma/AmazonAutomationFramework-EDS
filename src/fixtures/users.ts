/**
 * Mock test users for automation testing
 * Using mock credentials to avoid real Amazon account access
 */

export interface TestUser {
  email: string;
  password: string;
  name?: string;
}

export const testUsers = {
  standard: {
    email: process.env.MOCK_EMAIL || 'nikhilsharma.sharma48@gmail.com',
    password: process.env.MOCK_PASSWORD || 'NikAma@98',
    name: 'Test User',
  } as TestUser,
  
  admin: {
    email: 'admin@mock.com',
    password: 'AdminPass123!',
    name: 'Admin User',
  } as TestUser,
};

/**
 * User factory for creating custom user objects
 */
export class UserFactory {
  static createUser(overrides: Partial<TestUser> = {}): TestUser {
    return {
      ...testUsers.standard,
      ...overrides,
    };
  }
}
