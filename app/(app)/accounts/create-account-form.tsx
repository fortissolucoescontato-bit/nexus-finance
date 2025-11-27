'use client';

/**
 * Formulário para criar nova conta
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createAccount } from './actions';
import { LoadingSpinner } from '@/components/ui/loading';
import { logger } from '@/lib/logger';

interface CreateAccountFormProps {
  organizationId: string;
}

export function CreateAccountForm({ organizationId }: CreateAccountFormProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'bank' | 'cash' | 'credit'>('bank');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const result = await createAccount(name.trim(), type, organizationId);

      if (result.success) {
        setSuccess(true);
        setName('');
        setType('bank');
        // Recarrega a página para mostrar a nova conta
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setError(result.error || 'Erro ao criar conta');
        logger.error('Erro ao criar conta', result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado';
      setError(errorMessage);
      logger.error('Erro inesperado ao criar conta', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="account-name">Nome da Conta</Label>
        <Input
          id="account-name"
          type="text"
          placeholder="Ex: Conta Corrente Nubank"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          minLength={2}
          maxLength={100}
          disabled={isLoading}
          aria-label="Nome da conta"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="account-type">Tipo de Conta</Label>
        <select
          id="account-type"
          value={type}
          onChange={(e) => setType(e.target.value as 'bank' | 'cash' | 'credit')}
          disabled={isLoading}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="Tipo de conta"
        >
          <option value="bank">Banco</option>
          <option value="cash">Dinheiro</option>
          <option value="credit">Cartão de Crédito</option>
        </select>
      </div>

      {error && (
        <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-800 dark:text-green-200">
            Conta criada com sucesso!
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
            Criar Conta
          </>
        )}
      </Button>
    </form>
  );
}

