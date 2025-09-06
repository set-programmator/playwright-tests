import { APIRequestContext, APIResponse } from '@playwright/test';
import { Logger } from '../utils/logger';

export class BaseAPI {
  protected request: APIRequestContext;
  protected logger: Logger;
  protected baseURL: string;

  constructor(request: APIRequestContext, baseURL: string = '') {
    this.request = request;
    this.logger = new Logger();
    this.baseURL = baseURL;
  }

  async get(endpoint: string, options?: any): Promise<APIResponse> {
    this.logger.info(`GET request to: ${endpoint}`);
    const response = await this.request.get(`${this.baseURL}${endpoint}`, options);
    await this.logResponse(response);
    return response;
  }

  async post(endpoint: string, data?: any, options?: any): Promise<APIResponse> {
    this.logger.info(`POST request to: ${endpoint}`);
    const response = await this.request.post(`${this.baseURL}${endpoint}`, {
      data,
      ...options
    });
    await this.logResponse(response);
    return response;
  }

  async put(endpoint: string, data?: any, options?: any): Promise<APIResponse> {
    this.logger.info(`PUT request to: ${endpoint}`);
    const response = await this.request.put(`${this.baseURL}${endpoint}`, {
      data,
      ...options
    });
    await this.logResponse(response);
    return response;
  }

  async delete(endpoint: string, options?: any): Promise<APIResponse> {
    this.logger.info(`DELETE request to: ${endpoint}`);
    const response = await this.request.delete(`${this.baseURL}${endpoint}`, options);
    await this.logResponse(response);
    return response;
  }

  async patch(endpoint: string, data?: any, options?: any): Promise<APIResponse> {
    this.logger.info(`PATCH request to: ${endpoint}`);
    const response = await this.request.patch(`${this.baseURL}${endpoint}`, {
      data,
      ...options
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