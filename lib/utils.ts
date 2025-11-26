import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Função utilitária para combinar classes CSS com Tailwind
 * 
 * Por que usar esta função?
 * - Permite combinar classes do Tailwind de forma segura
 * - Resolve conflitos entre classes condicionais
 * - Usa clsx para condicionais e twMerge para mesclar classes do Tailwind
 * 
 * @param inputs - Classes CSS para combinar
 * @returns String com classes combinadas
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

