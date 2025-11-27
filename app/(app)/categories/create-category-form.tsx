'use client';

/**
 * Formulário para criar nova categoria
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createCategory } from './actions';
import { LoadingSpinner } from '@/components/ui/loading';
import { logger } from '@/lib/logger';

interface CreateCategoryFormProps {
  organizationId: string;
}

export function CreateCategoryForm({ organizationId }: CreateCategoryFormProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [icon, setIcon] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await createCategory(
        name.trim(),
        type,
        organizationId,
        icon.trim() || undefined
      );

      if (result.success) {
        setSuccess(true);
        setName('');
        setType('expense');
        setIcon('');
        // Recarrega a página para mostrar a nova categoria
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setError(result.error || 'Erro ao criar categoria');
        logger.error('Erro ao criar categoria', result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado';
      setError(errorMessage);
      logger.error('Erro inesperado ao criar categoria', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="category-name">Nome da Categoria</Label>
        <Input
          id="category-name"
          type="text"
          placeholder="Ex: Alimentação, Salário, etc."
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          maxLength={100}
          disabled={isLoading}
          aria-label="Nome da categoria"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category-type">Tipo</Label>
        <select
          id="category-type"
          value={type}
          onChange={(e) => setType(e.target.value as 'income' | 'expense')}
          disabled={isLoading}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Tipo de categoria"
        >
          <option value="expense">Despesa</option>
          <option value="income">Receita</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="category-icon">Ícone (opcional)</Label>
        <Input
          id="category-icon"
          type="text"
          placeholder="Ex: dollar-sign, shopping-cart (nome do ícone Lucide)"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          maxLength={50}
          disabled={isLoading}
          aria-label="Nome do ícone"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Nome do ícone do Lucide React (opcional)
        </p>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-800 dark:text-green-200">
            Categoria criada com sucesso!
          </p>
        </div>
      )}

      <Button type="submit" disabled={isLoading || !name.trim()}>
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            Criando...
          </>
        ) : (
          <>
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            Criar Categoria
          </>
        )}
      </Button>
    </form>
  );
}

