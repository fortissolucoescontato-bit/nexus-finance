'use client';

/**
 * Error Boundary Component
 * 
 * Captura erros JavaScript em qualquer lugar da árvore de componentes filhos,
 * registra esses erros e exibe uma UI de fallback ao invés da árvore de componentes que quebrou.
 * 
 * IMPORTANTE: Error Boundaries não capturam erros em:
 * - Event handlers
 * - Código assíncrono (setTimeout, callbacks, etc)
 * - Durante renderização no servidor
 * - No próprio Error Boundary
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { logger } from '@/lib/logger';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorFallbackProps {
  error: Error | null;
  resetError: () => void;
}

/**
 * Componente de fallback padrão quando ocorre um erro
 */
function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Algo deu errado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Ocorreu um erro inesperado. Por favor, tente novamente.
          </p>
          
          {process.env.NODE_ENV === 'development' && error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-md border border-red-200 dark:border-red-800">
              <p className="text-xs font-mono text-red-800 dark:text-red-200 break-all">
                {error.message}
              </p>
              {error.stack && (
                <details className="mt-2">
                  <summary className="text-xs text-red-600 dark:text-red-400 cursor-pointer">
                    Stack trace
                  </summary>
                  <pre className="text-xs text-red-700 dark:text-red-300 mt-2 overflow-auto max-h-40">
                    {error.stack}
                  </pre>
                </details>
              )}
            </div>
          )}
          
          <div className="flex gap-2">
            <Button
              onClick={resetError}
              variant="default"
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
            <Button
              onClick={() => window.location.href = '/'}
              variant="outline"
              className="flex-1"
            >
              <Home className="h-4 w-4 mr-2" />
              Ir para Início
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Error Boundary Class Component
 * 
 * Nota: Error Boundaries devem ser class components no React
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Atualiza o state para que a próxima renderização mostre a UI de fallback
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log do erro para monitoramento
    logger.error('Error Boundary capturou um erro', {
      error: {
        message: error.message,
        stack: error.stack,
        name: error.name,
      },
      errorInfo: {
        componentStack: errorInfo.componentStack,
      },
    });

    this.setState({
      error,
      errorInfo,
    });

    // Aqui você pode enviar o erro para um serviço de monitoramento
    // Exemplo: Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

