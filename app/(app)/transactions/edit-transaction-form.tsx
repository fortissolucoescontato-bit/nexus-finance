'use client';

/**
 * Formulário para editar transação existente
 * 
 * Similar ao CreateTransactionForm, mas pré-preenche os campos
 * com os dados da transação atual
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateTransaction } from './actions';
import { LoadingSpinner } from '@/components/ui/loading';
import { logger } from '@/lib/logger';
import { Save } from 'lucide-react';

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

interface Transaction {
  id: string;
  account_id: string;
  category_id: string | null;
  amount: number;
  date: string;
  description: string | null;
  type: 'income' | 'expense';
  status: 'pending' | 'paid';
}

interface EditTransactionFormProps {
  transaction: Transaction;
  accounts: Account[];
  categories: Category[];
  onSuccess: () => void;
  onCancel: () => void;
}

export function EditTransactionForm({
  transaction,
  accounts,
  categories,
  onSuccess,
  onCancel,
}: EditTransactionFormProps) {
  // Estados do formulário - inicializados com os valores da transação
  const [accountId, setAccountId] = useState(transaction.account_id);
  const [categoryId, setCategoryId] = useState(transaction.category_id || '');
  // Converte valor de centavos para reais (valor absoluto para exibição)
  const [amount, setAmount] = useState((Math.abs(transaction.amount) / 100).toFixed(2));
  const [date, setDate] = useState(transaction.date);
  const [description, setDescription] = useState(transaction.description || '');
  const [type, setType] = useState<'income' | 'expense'>(transaction.type);
  const [status, setStatus] = useState<'pending' | 'paid'>(transaction.status);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Atualiza categoria quando o tipo muda (para filtrar categorias)
  useEffect(() => {
    // Se a categoria atual não é do tipo selecionado, limpa a seleção
    const currentCategory = categories.find(c => c.id === categoryId);
    if (currentCategory && currentCategory.type !== type) {
      setCategoryId('');
    }
  }, [type, categoryId, categories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Converte valor de reais para centavos
      const amountInCents = Math.round(parseFloat(amount) * 100);

      if (isNaN(amountInCents) || amountInCents <= 0) {
        setError('Valor inválido');
        setIsLoading(false);
        return;
      }

      // Prepara os dados de atualização
      // Só envia campos que mudaram ou todos para garantir atualização completa
      const updates: {
        accountId?: string;
        categoryId?: string | null;
        amount?: number;
        date?: string;
        description?: string | null;
        type?: 'income' | 'expense';
        status?: 'pending' | 'paid';
      } = {};

      // Só adiciona campos que mudaram (ou todos para garantir)
      if (accountId !== transaction.account_id) updates.accountId = accountId;
      if (categoryId !== (transaction.category_id || '')) {
        updates.categoryId = categoryId || null;
      }
      if (amountInCents !== Math.abs(transaction.amount)) updates.amount = amountInCents;
      if (date !== transaction.date) updates.date = date;
      if (description !== (transaction.description || '')) {
        updates.description = description.trim() || null;
      }
      if (type !== transaction.type) updates.type = type;
      if (status !== transaction.status) updates.status = status;

      // Chama a Server Action para atualizar
      const result = await updateTransaction(transaction.id, updates);

      if (result.success) {
        // Sucesso - fecha o modal e recarrega
        onSuccess();
      } else {
        // Erro - exibe mensagem
        setError(result.error || 'Erro ao atualizar transação');
        logger.error('Erro ao atualizar transação', result.error);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro inesperado';
      setError(errorMessage);
      logger.error('Erro inesperado ao atualizar transação', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtra categorias por tipo selecionado
  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-transaction-type">Tipo</Label>
          <select
            id="edit-transaction-type"
            value={type}
            onChange={(e) => {
              setType(e.target.value as 'income' | 'expense');
              setCategoryId(''); // Reseta categoria ao mudar tipo
            }}
            disabled={isLoading}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
            aria-label="Tipo de transação"
          >
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="edit-transaction-account">Conta</Label>
          <select
            id="edit-transaction-account"
            value={accountId}
            onChange={(e) => setAccountId(e.target.value)}
            disabled={isLoading || accounts.length === 0}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            required
            aria-label="Conta"
          >
            <option value="">Selecione uma conta</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-transaction-category">Categoria (opcional)</Label>
          <select
            id="edit-transaction-category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={isLoading || filteredCategories.length === 0}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
          <Label htmlFor="edit-transaction-status">Status</Label>
          <select
            id="edit-transaction-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as 'pending' | 'paid')}
            disabled={isLoading}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Status"
          >
            <option value="paid">Pago</option>
            <option value="pending">Pendente</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="edit-transaction-amount">Valor (R$)</Label>
          <Input
            id="edit-transaction-amount"
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
          <Label htmlFor="edit-transaction-date">Data</Label>
          <Input
            id="edit-transaction-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            disabled={isLoading}
            aria-label="Data da transação"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-transaction-description">Descrição (opcional)</Label>
        <Input
          id="edit-transaction-description"
          type="text"
          placeholder="Ex: Compra no supermercado"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
          disabled={isLoading}
          aria-label="Descrição da transação"
        />
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="p-3 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Botões de ação */}
      <div className="flex gap-3 justify-end pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading || !accountId || !amount}>
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" aria-hidden="true" />
              Salvar Alterações
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

