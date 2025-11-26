/**
 * Componentes de Loading State
 * 
 * Componentes reutilizáveis para exibir estados de carregamento
 * consistentes em toda a aplicação
 */

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Spinner de carregamento simples
 */
export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <Loader2
      className={cn('animate-spin text-gray-600 dark:text-gray-400', sizeClasses[size], className)}
      aria-label="Carregando..."
    />
  );
}

interface LoadingButtonProps {
  isLoading: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Botão com estado de carregamento
 */
export function LoadingButton({ isLoading, children, className }: LoadingButtonProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      {isLoading && <LoadingSpinner size="sm" />}
      {children}
    </div>
  );
}

interface LoadingCardProps {
  message?: string;
  className?: string;
}

/**
 * Card de carregamento para substituir conteúdo enquanto carrega
 */
export function LoadingCard({ message = 'Carregando...', className }: LoadingCardProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center p-8', className)}>
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  );
}

interface LoadingPageProps {
  message?: string;
}

/**
 * Página completa de carregamento
 */
export function LoadingPage({ message = 'Carregando...' }: LoadingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">{message}</p>
      </div>
    </div>
  );
}

