'use client';

/**
 * Lista de transações com opções de editar e deletar
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, ArrowUpCircle, ArrowDownCircle, Receipt } from 'lucide-react';
import { deleteTransaction } from './actions';
import { LoadingSpinner } from '@/components/ui/loading';
import { logger } from '@/lib/logger';

interface Transaction {
  id: string;
  account_id: string;
  category_id: string | null;
  amount: number;
  date: string;
  description: string | null;
  type: 'income' | 'expense';
  status: 'pending' | 'paid';
  created_at: string;
  updated_at: string;
  accounts?: { id: string; name: string } | null;
  categories?: { id: string; name: string } | null;
}

interface Account {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface TransactionsListProps {
  transactions: Transaction[];
  organizationId: string;
  accounts: Account[];
  categories: Category[];
}

/**
 * Formata valor em centavos para exibição em reais
 */
function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(Math.abs(cents) / 100);
}

/**
 * Formata data para exibição
 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR');
}

export function TransactionsList({ 
  transactions, 
  organizationId,
  accounts,
  categories 
}: TransactionsListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (transactionId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta transação? Esta ação não pode ser desfeita.')) {
      return;
    }

    setDeletingId(transactionId);
    const result = await deleteTransaction(transactionId);

    if (result.success) {
      window.location.reload();
    } else {
      logger.error('Erro ao deletar transação', result.error);
      alert(result.error || 'Erro ao deletar transação');
      setDeletingId(null);
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="text-center py-12">
        <Receipt className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" aria-hidden="true" />
        <p className="text-gray-600 dark:text-gray-400">
          Nenhuma transação registrada ainda. Crie sua primeira transação acima!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((transaction) => {
        const isDeleting = deletingId === transaction.id;
        const isIncome = transaction.type === 'income';
        const isPending = transaction.status === 'pending';
        const accountName = transaction.accounts?.name || 'Conta não encontrada';
        const categoryName = transaction.categories?.name || 'Sem categoria';

        return (
          <Card key={transaction.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-2 rounded-lg ${isIncome ? 'bg-green-100 dark:bg-green-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
                    {isIncome ? (
                      <ArrowUpCircle className={`h-5 w-5 ${isIncome ? 'text-green-600 dark:text-green-400' : ''}`} aria-hidden="true" />
                    ) : (
                      <ArrowDownCircle className={`h-5 w-5 ${!isIncome ? 'text-red-600 dark:text-red-400' : ''}`} aria-hidden="true" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {formatCurrency(transaction.amount)}
                      </h3>
                      {isPending && (
                        <span className="px-2 py-1 text-xs rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200">
                          Pendente
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {transaction.description || 'Sem descrição'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {accountName} • {categoryName} • {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(transaction.id)}
                    disabled={isDeleting}
                    aria-label={`Deletar transação`}
                  >
                    {isDeleting ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden="true" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}


