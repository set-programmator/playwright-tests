import { APIRequestContext, APIResponse } from '@playwright/test';
import { BaseAPI } from './base-api';

export class UsersAPI extends BaseAPI {
  constructor(request: APIRequestContext, baseURL: string = '') {
    super(request, baseURL);
  }

  async getAllUsers(): Promise<APIResponse> {
    return await this.get('/users');
  }

  async getUserById(id: number): Promise<APIResponse> {
    return await this.get(`/users/${id}`);
  }

  async createUser(userData: any): Promise<APIResponse> {
    return await this.post('/users', userData);
  }

  async updateUser(id: number, userData: any): Promise<APIResponse> {
    return await this.put(`/users/${id}`, userData);
  }

  async deleteUser(id: number): Promise<APIResponse> {
    return await this.delete(`/users/${id}`);
  }

  async getUserPosts(userId: number): Promise<APIResponse> {
    return await this.get(`/users/${userId}/posts`);
  }

  getUserSchema(): any {
    return {
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
            zipcode: { type: 'string' }
          }
        }
      },
      required: ['id', 'name', 'username', 'email']
    };
  }
}