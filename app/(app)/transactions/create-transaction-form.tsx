'use client';

/**
 * Formulário para criar nova transação
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createTransaction } from './actions';
import { LoadingSpinner } from '@/components/ui/loading';
import { logger } from '@/lib/logger';
import { Plus } from 'lucide-react';

interface Account {
  id: string;
  name: string;
  type: string;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

interface CreateTransactionFormProps {
  organizationId: string;
  accounts: Account[];
  categories: Category[];
}

export function CreateTransactionForm({ 
  organizationId, 
  accounts, 
  categories 
}: CreateTransactionFormProps) {
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [status, setStatus] = useState<'pending' | 'paid'>('paid');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      // Converte valor de reais para centavos
      const amountInCents = Math.round(parseFloat(amount) * 100);

      if (isNaN(amountInCents) || amountInCents <= 0) {
        setError('Valor inválido');
        setIsLoading(false);
        return;
      }

      const result = await createTransaction(
        accountId,
        categoryId || undefined,
        amountInCents,
        date,
        description.trim() || undefined,
        type,
        status,
        organizationId
      );

      if (result.success) {
        setSuccess(true);
        setAccountId('');
        setCategoryId('');
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setDescription('');
        setType('expense');
        setStatus('paid');
        // Recarrega a página para mostrar a nova transação
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        setError(result.error || 'Erro ao criar transação');
        logger.error('Erro ao criar transação', result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado';
      setError(errorMessage);
      logger.error('Erro inesperado ao criar transação', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtra categorias por tipo
  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Campo Nome do Cliente em Destaque */}
      <div className="space-y-2">
        <Label htmlFor="transaction-description" className="text-base font-semibold">
          Nome do Cliente ou Descrição
        </Label>
        <Input
          id="transaction-description"
          type="text"
          placeholder="Ex: Maria Silva, João, Venda de produtos..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          disabled={isLoading}
          aria-label="Nome do cliente ou descrição"
          className="text-base"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Digite o nome da cliente ou uma descrição da venda/gasto
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="transaction-type">Tipo</Label>
          <select
            id="transaction-type"
            value={type}
            onChange={(e) => {
              setType(e.target.value as 'income' | 'expense');
              setCategoryId(''); // Reseta categoria ao mudar tipo
            }}
            disabled={isLoading}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            required
            aria-label="Tipo de transação"
          >
            <option value="income">Venda/Entrada</option>
            <option value="expense">Gasto/Pagamento</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="transaction-account">Caixa</Label>
          <select
            id="transaction-account"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            disabled={isLoading || accounts.length === 0}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            required
            aria-label="Caixa"
          >
            <option value="">Selecione um caixa</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
          {accounts.length === 0 && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              Crie um caixa primeiro em <a href="/accounts" className="underline">Meus Caixas</a>
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="transaction-category">Categoria (opcional)</Label>
          <select
            id="transaction-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={isLoading || filteredCategories.length === 0}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            aria-label="Categoria"
          >
            <option value="">Sem categoria</option>
            {filteredCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="transaction-status">Status</Label>
          <select
            id="transaction-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'pending' | 'paid')}
            disabled={isLoading}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            aria-label="Status"
          >
            <option value="paid">Pago/Recebido</option>
            <option value="pending">Fiado/Pendente</option>
          </select>
          {type === 'income' && status === 'pending' && (
            <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">
              ⚠️ Esta venda ficará como FIADO (a receber)
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="transaction-amount">Valor (R$)</Label>
          <Input
            id="transaction-amount"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            disabled={isLoading}
            aria-label="Valor da transação"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="transaction-date">Data</Label>
          <Input
            id="transaction-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            disabled={isLoading}
            aria-label="Data da transação"
          />
        </div>
      </div>


      {error && (
        <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-md bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <p className="text-sm text-green-800 dark:text-green-200">
            {type === 'income' ? 'Venda registrada com sucesso!' : 'Gasto registrado com sucesso!'}
          </p>
        </div>
      )}

      <Button type="submit" disabled={isLoading || !accountId || !amount}>
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" className="mr-2" />
            Criando...
          </>
        ) : (
          <>
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            {type === 'income' ? 'Registrar Venda' : 'Registrar Gasto'}
          </>
        )}
      </Button>
    </form>
  );
}

