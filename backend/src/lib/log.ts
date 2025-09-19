// Basic logging utility - will be enhanced with structured logging
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogMeta {
  requestId?: string;
  tenantId?: string;
  component?: string;
  [key: string]: unknown;
}

export function log(level: LogLevel, message: string, meta?: LogMeta): void {
  const timestamp = new Date().toISOString();
  const logEntry = {
    ts: timestamp,
    level,
    msg: message,
    ...meta,
  };

  // For now, use console logging
  // In future tasks, this will be enhanced with structured JSON logging
  console.log(JSON.stringify(logEntry));
}

export const logger = {
  debug: (message: string, meta?: LogMeta) => log('debug', message, meta),
  info: (message: string, meta?: LogMeta) => log('info', message, meta),
  warn: (message: string, meta?: LogMeta) => log('warn', message, meta),
  error: (message: string, meta?: LogMeta) => log('error', message, meta),
};