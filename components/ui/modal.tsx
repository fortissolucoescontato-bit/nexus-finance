'use client';

/**
 * Componente Modal/Dialog simples e reutilizável
 * 
 * Usado para exibir formulários e conteúdo em overlay
 */

import * as React from 'react';
import { X } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Componente Modal
 * 
 * Exibe um overlay com conteúdo centralizado
 * Fecha ao clicar fora ou no botão X
 */
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = 'md',
}: ModalProps) {
  // Não renderiza se não estiver aberto
  if (!isOpen) return null;

  // Tamanhos do modal
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  // Fecha ao clicar no overlay (backdrop)
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Só fecha se clicar diretamente no backdrop, não no conteúdo
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Previne fechamento ao pressionar ESC (pode adicionar depois se necessário)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={cn(
          'relative w-full bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-800',
          'transform transition-all duration-300 scale-100',
          sizeClasses[size]
        )}
        onClick={(e) => e.stopPropagation()} // Previne fechamento ao clicar no conteúdo
      >
        {/* Header do Modal */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex-1">
            <h2
              id="modal-title"
              className="text-2xl font-bold text-gray-900 dark:text-white"
            >
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                {description}
              </p>
            )}
          </div>
          {/* Botão de fechar */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="ml-4 h-8 w-8 p-0"
            aria-label="Fechar modal"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        {/* Conteúdo do Modal */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

