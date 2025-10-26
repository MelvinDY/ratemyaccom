/**
 * Centralized error logging utility
 * In production, this should integrate with services like Sentry, LogRocket, etc.
 */

interface ErrorLog {
  timestamp: Date;
  error: Error;
  context?: Record<string, unknown>;
  severity: 'low' | 'medium' | 'high' | 'critical';
  userId?: string;
  url?: string;
}

class ErrorLogger {
  private logs: ErrorLog[] = [];

  /**
   * Log an error with context
   */
  log(
    error: Error,
    severity: ErrorLog['severity'] = 'medium',
    context?: Record<string, unknown>
  ): void {
    const errorLog: ErrorLog = {
      timestamp: new Date(),
      error,
      context,
      severity,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
    };

    this.logs.push(errorLog);

    // Console logging based on severity
    switch (severity) {
      case 'critical':
      case 'high':
        console.error('[ERROR]', error, context);
        break;
      case 'medium':
        console.warn('[WARNING]', error, context);
        break;
      case 'low':
        console.warn('[INFO]', error, context);
        break;
    }

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      this.sendToService(errorLog);
    }
  }

  /**
   * Send error to external service (implement based on your service)
   */
  private sendToService(_errorLog: ErrorLog): void {
    // Example: Sentry integration
    // Sentry.captureException(errorLog.error, {
    //   level: errorLog.severity,
    //   extra: errorLog.context,
    // });
    // Example: Custom API endpoint
    // fetch('/api/errors', {
    //   method: 'POST',
    //   body: JSON.stringify(errorLog),
    // }).catch(console.error);
  }

  /**
   * Get all logged errors (for debugging)
   */
  getLogs(): ErrorLog[] {
    return this.logs;
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
  }
}

// Singleton instance
export const errorLogger = new ErrorLogger();

/**
 * Helper functions for common error scenarios
 */

export const logApiError = (error: Error, endpoint: string) => {
  errorLogger.log(error, 'high', { endpoint, type: 'api_error' });
};

export const logValidationError = (error: Error, formName: string) => {
  errorLogger.log(error, 'low', { formName, type: 'validation_error' });
};

export const logAuthError = (error: Error) => {
  errorLogger.log(error, 'high', { type: 'auth_error' });
};

export const logNetworkError = (error: Error) => {
  errorLogger.log(error, 'medium', { type: 'network_error' });
};

export const logCriticalError = (error: Error, context?: Record<string, unknown>) => {
  errorLogger.log(error, 'critical', { ...context, type: 'critical_error' });
};
