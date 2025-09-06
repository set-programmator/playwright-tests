export class Logger {
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  info(message: string, data?: any): void {
    console.log(`[${this.getTimestamp()}] ℹ️  INFO: ${message}`, data || '');
  }

  error(message: string, error?: any): void {
    console.error(`[${this.getTimestamp()}] ❌ ERROR: ${message}`, error || '');
  }

  warn(message: string, data?: any): void {
    console.warn(`[${this.getTimestamp()}] ⚠️  WARN: ${message}`, data || '');
  }

  debug(message: string, data?: any): void {
    if (process.env.DEBUG) {
      console.debug(`[${this.getTimestamp()}] 🐛 DEBUG: ${message}`, data || '');
    }
  }

  success(message: string, data?: any): void {
    console.log(`[${this.getTimestamp()}] ✅ SUCCESS: ${message}`, data || '');
  }
}