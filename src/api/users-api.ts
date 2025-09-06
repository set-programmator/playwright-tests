import { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseAPI } from './base-api';

interface UserData {
  id?: number;
  name: string;
  username: string;
  email: string;
  address?: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
  };
}

interface SchemaProperty {
  type: string;
  format?: string;
  properties?: Record<string, SchemaProperty>;
}

interface UserSchema {
  type: string;
  properties: Record<string, SchemaProperty>;
  required: string[];
}

export class UsersAPI extends BaseAPI {
  private static readonly USER_SCHEMA: UserSchema = {
    type: 'object',
    properties: {
      id: { type: 'number' },
      name: { type: 'string' },
      username: { type: 'string' },
      email: { type: 'string', format: 'email' },
      address: {
        type: 'object',
        properties: {
          street: { type: 'string' },
          suite: { type: 'string' },
          city: { type: 'string' },
          zipcode: { type: 'string' },
        },
      },
    },
    required: ['id', 'name', 'username', 'email'],
  };
  constructor(request: APIRequestContext, baseURL: string = '') {
    super(request, baseURL);
  }

  async getAllUsers(): Promise<APIResponse> {
    return await this.get('/users');
  }

  private validateId(id: number): number {
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId <= 0) {
      throw new Error('Invalid user ID: must be a positive integer');
    }
    return numId;
  }

  private sanitizeUserData(userData: Partial<UserData>): Partial<UserData> {
    const sanitized: Partial<UserData> = {};

    if (userData.name && typeof userData.name === 'string') {
      sanitized.name = userData.name.trim();
    }
    if (userData.username && typeof userData.username === 'string') {
      sanitized.username = userData.username.trim();
    }
    if (userData.email && typeof userData.email === 'string') {
      sanitized.email = userData.email.trim();
    }
    if (userData.address && typeof userData.address === 'object') {
      sanitized.address = {
        street: String(userData.address.street || '').trim(),
        suite: String(userData.address.suite || '').trim(),
        city: String(userData.address.city || '').trim(),
        zipcode: String(userData.address.zipcode || '').trim(),
      };
    }

    return sanitized;
  }

  async getUserById(id: number): Promise<APIResponse> {
    const validId = this.validateId(id);
    return this.get(`/users/${validId}`);
  }

  async createUser(userData: Partial<UserData>): Promise<APIResponse> {
    const sanitizedData = this.sanitizeUserData(userData);
    return this.post('/users', sanitizedData);
  }

  async updateUser(id: number, userData: Partial<UserData>): Promise<APIResponse> {
    const validId = this.validateId(id);
    const sanitizedData = this.sanitizeUserData(userData);
    return this.put(`/users/${validId}`, sanitizedData);
  }

  async deleteUser(id: number): Promise<APIResponse> {
    const validId = this.validateId(id);
    return this.delete(`/users/${validId}`);
  }

  async getUserPosts(userId: number): Promise<APIResponse> {
    const validId = this.validateId(userId);
    return this.get(`/users/${validId}/posts`);
  }

  getUserSchema(): UserSchema {
    return UsersAPI.USER_SCHEMA;
  }
}
