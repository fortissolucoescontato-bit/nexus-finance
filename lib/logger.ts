/**
 * Utilitário de logging
 * 
 * Centraliza logs do sistema e permite controle de nível de log
 * baseado no ambiente (desenvolvimento vs produção)
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

/**
 * Formata mensagem de log com timestamp
 */
function formatMessage(level: LogLevel, message: string, data?: unknown): string {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
  
  if (data) {
    return `${prefix} ${message}\n${JSON.stringify(data, null, 2)}`;
  }
  
  return `${prefix} ${message}`;
}

/**
 * Logger para desenvolvimento e produção
 */
export const logger = {
  /**
   * Log de debug - apenas em desenvolvimento
   */
  debug(message: string, data?: unknown): void {
    if (isDevelopment) {
      console.debug(formatMessage('debug', message, data));
    }
  },

  /**
   * Log de informação
   */
  info(message: string, data?: unknown): void {
    if (isDevelopment) {
      console.info(formatMessage('info', message, data));
    } else if (isProduction) {
      // Em produção, pode enviar para serviço de logging (ex: Sentry, LogRocket)
      // Por enquanto, apenas ignora logs de info em produção
    }
  },

  /**
   * Log de aviso
   */
  warn(message: string, data?: unknown): void {
    console.warn(formatMessage('warn', message, data));
  },

  /**
   * Log de erro - sempre registrado
   */
  error(message: string, error?: unknown): void {
    const errorData = error instanceof Error 
      ? {
          message: error.message,
          stack: error.stack,
          name: error.name,
        }
      : error;
    
    console.error(formatMessage('error', message, errorData));
    
    // Em produção, pode enviar para serviço de monitoramento de erros
    // Exemplo: Sentry.captureException(error)
  },
};

