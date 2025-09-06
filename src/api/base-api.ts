import { APIRequestContext, APIResponse } from '@playwright/test';
import { Logger } from '../utils/logger';
import * as path from 'path';

export class BaseAPI {
  protected request: APIRequestContext;
  protected logger: Logger;
  protected baseURL: string;
  private allowedHosts: string[];

  constructor(request: APIRequestContext, baseURL: string = '', allowedHosts: string[] = []) {
    this.request = request;
    this.logger = new Logger();
    this.baseURL = baseURL;
    this.allowedHosts = allowedHosts.length > 0 ? allowedHosts : [new URL(baseURL).hostname];
  }

  private validateEndpoint(endpoint: string): string {
    // Validate endpoint doesn't contain absolute URLs or protocol schemes
    if (endpoint.includes('://') || endpoint.startsWith('//')) {
      throw new Error('Absolute URLs not allowed in endpoints');
    }

    // Check for path traversal sequences
    if (endpoint.includes('..')) {
      throw new Error('Path traversal sequences not allowed');
    }

    // Remove double slashes and ensure proper format
    const cleaned = endpoint.replace(/\/\//g, '/').replace(/^\/+/, '/');

    return cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
  }

  async get(endpoint: string, options?: any): Promise<APIResponse> {
    const validEndpoint = this.validateEndpoint(endpoint);
    this.logger.info(`GET request to: ${validEndpoint}`);
    const response = await this.request.get(`${this.baseURL}${validEndpoint}`, { ...options });
    await this.logResponse(response);
    return response;
  }

  async post(endpoint: string, data?: any, options?: any): Promise<APIResponse> {
    const validEndpoint = this.validateEndpoint(endpoint);
    this.logger.info(`POST request to: ${validEndpoint}`);
    const response = await this.request.post(`${this.baseURL}${validEndpoint}`, {
      data,
      ...options,
    });
    await this.logResponse(response);
    return response;
  }

  async put(endpoint: string, data?: any, options?: any): Promise<APIResponse> {
    const validEndpoint = this.validateEndpoint(endpoint);
    this.logger.info(`PUT request to: ${validEndpoint}`);
    const response = await this.request.put(`${this.baseURL}${validEndpoint}`, {
      data,
      ...options,
    });
    await this.logResponse(response);
    return response;
  }

  async delete(endpoint: string, options?: any): Promise<APIResponse> {
    const validEndpoint = this.validateEndpoint(endpoint);
    this.logger.info(`DELETE request to: ${validEndpoint}`);
    const response = await this.request.delete(`${this.baseURL}${validEndpoint}`, { ...options });
    await this.logResponse(response);
    return response;
  }

  async patch(endpoint: string, data?: any, options?: any): Promise<APIResponse> {
    const validEndpoint = this.validateEndpoint(endpoint);
    this.logger.info(`PATCH request to: ${validEndpoint}`);
    const response = await this.request.patch(`${this.baseURL}${validEndpoint}`, {
      data,
      ...options,
    });
    await this.logResponse(response);
    return response;
  }

  private async logResponse(response: APIResponse): Promise<void> {
    const status = response.status();
    const url = response.url();

    if (status >= 200 && status < 300) {
      this.logger.success(`Response ${status} from ${url}`);
    } else {
      this.logger.error(`Response ${status} from ${url}`);
    }
  }

  async validateSchema(response: APIResponse, schema: any): Promise<boolean> {
    try {
      // amazonq-ignore-next-line
      const Ajv = require('ajv');
      const ajv = new Ajv();
      const validate = ajv.compile(schema);
      const data = await response.json();
      const valid = validate(data);

      if (!valid) {
        this.logger.error('Schema validation failed', validate.errors);
        return false;
      }

      this.logger.success('Schema validation passed');
      return true;
    } catch (error) {
      this.logger.error('Schema validation error', error);
      return false;
    }
  }
}
