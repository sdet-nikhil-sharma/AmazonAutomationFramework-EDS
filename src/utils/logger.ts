/**
 * Logger utility for test execution logging
 * Helps with debugging parallel test execution
 */
export class Logger {
  private static readonly COLORS = {
    RESET: '\x1b[0m',
    BRIGHT: '\x1b[1m',
    RED: '\x1b[31m',
    GREEN: '\x1b[32m',
    YELLOW: '\x1b[33m',
    BLUE: '\x1b[34m',
    CYAN: '\x1b[36m',
  };

  /**
   * Log info message
   */
  static info(message: string) {
    console.log(
      `${this.COLORS.CYAN}[INFO]${this.COLORS.RESET} ${message}`
    );
  }

  /**
   * Log success message
   */
  static success(message: string) {
    console.log(
      `${this.COLORS.GREEN}[SUCCESS]${this.COLORS.RESET} ${message}`
    );
  }

  /**
   * Log warn message
   */
  static warn(message: string) {
    console.log(
      `${this.COLORS.YELLOW}[WARN]${this.COLORS.RESET} ${message}`
    );
  }

  /**
   * Log error message
   */
  static error(message: string) {
    console.log(
      `${this.COLORS.RED}[ERROR]${this.COLORS.RESET} ${message}`
    );
  }

  /**
   * Log section header
   */
  static section(title: string) {
    console.log(
      `\n${this.COLORS.BRIGHT}${this.COLORS.BLUE}=== ${title} ===${this.COLORS.RESET}\n`
    );
  }

  /**
   * Log with timestamp
   */
  static log(message: string, level: 'info' | 'success' | 'warn' | 'error' = 'info') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    
    switch (level) {
      case 'success':
        this.success(logMessage);
        break;
      case 'warn':
        this.warn(logMessage);
        break;
      case 'error':
        this.error(logMessage);
        break;
      case 'info':
      default:
        this.info(logMessage);
        break;
    }
  }
}
