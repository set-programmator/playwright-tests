export class Logger {
  private static instance: Logger;
  private timestampCache: string = '';
  private lastTimestampUpdate: number = 0;
  private readonly TIMESTAMP_CACHE_MS = 1000; // Cache for 1 second

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private getTimestamp(): string {
    const now = Date.now();
    if (now - this.lastTimestampUpdate > this.TIMESTAMP_CACHE_MS) {
      this.timestampCache = new Date(now).toISOString();
      this.lastTimestampUpdate = now;
    }
    return this.timestampCache;
  }

  private sanitizeInput(input: any): string {
    if (typeof input === 'string') {
      return input.replace(/[\r\n]/g, ' ');
    }
    try {
      return JSON.stringify(input).replace(/[\r\n]/g, ' ');
    } catch {
      return '[Object]';
    }
  }

  info(message: string, data?: any): void {
    const sanitizedMessage = this.sanitizeInput(message);
    const sanitizedData = data ? this.sanitizeInput(data) : '';
    console.log(`[${this.getTimestamp()}] ℹ️  INFO: ${sanitizedMessage}`, sanitizedData);
  }

  error(message: string, error?: any): void {
    const sanitizedMessage = this.sanitizeInput(message);
    const sanitizedError = error ? this.sanitizeInput(error) : '';
    console.error(`[${this.getTimestamp()}] ❌ ERROR: ${sanitizedMessage}`, sanitizedError);
  }

  warn(message: string, data?: any): void {
    const sanitizedMessage = this.sanitizeInput(message);
    const sanitizedData = data ? this.sanitizeInput(data) : '';
    console.warn(`[${this.getTimestamp()}] ⚠️  WARN: ${sanitizedMessage}`, sanitizedData);
  }

  debug(message: string, data?: any): void {
    if (process.env.DEBUG === 'true') {
      const sanitizedMessage = this.sanitizeInput(message);
      const sanitizedData = data ? this.sanitizeInput(data) : '';
      console.debug(`[${this.getTimestamp()}] 🐛 DEBUG: ${sanitizedMessage}`, sanitizedData);
    }
  }

  success(message: string, data?: any): void {
    const sanitizedMessage = this.sanitizeInput(message);
    const sanitizedData = data ? this.sanitizeInput(data) : '';
    console.log(`[${this.getTimestamp()}] ✅ SUCCESS: ${sanitizedMessage}`, sanitizedData);
  }
}
