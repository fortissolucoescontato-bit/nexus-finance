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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        className={cn(
          'relative w-full bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border-0',
          'transform transition-all duration-300 ease-out scale-100',
          'max-h-[90vh] overflow-hidden flex flex-col',
          sizeClasses[size]
        )}
        onClick={(e) => e.stopPropagation()} // Previne fechamento ao clicar no conteúdo
      >
        {/* Header do Modal com gradiente */}
        <div className="relative flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white">
          <div className="flex-1 pr-4">
            <h2
              id="modal-title"
              className="text-2xl font-bold text-white mb-1"
            >
              {title}
            </h2>
            {description && (
              <p className="text-sm text-blue-100/90">
                {description}
              </p>
            )}
          </div>
          {/* Botão de fechar */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-9 w-9 p-0 rounded-full hover:bg-white/20 text-white hover:text-white transition-colors"
            aria-label="Fechar modal"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </div>

        {/* Conteúdo do Modal com scroll */}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

