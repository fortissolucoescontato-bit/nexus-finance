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
import { Modal } from '@/components/ui/modal';
import { EditTransactionForm } from './edit-transaction-form';

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
  type: string;
}

interface Category {
  id: string;
  name: string;
  type: string;
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
  // Estado para controlar qual transação está sendo editada
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

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

  // Handler para abrir modal de edição
  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  // Handler para fechar modal após sucesso
  const handleEditSuccess = () => {
    setEditingTransaction(null);
    // Recarrega a página para mostrar as alterações
    window.location.reload();
  };

  // Handler para cancelar edição
  const handleEditCancel = () => {
    setEditingTransaction(null);
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
    <>
      {/* Modal de Edição */}
      {editingTransaction && (
        <Modal
          isOpen={!!editingTransaction}
          onClose={handleEditCancel}
          title="Editar Transação"
          description="Altere os dados da transação abaixo"
          size="lg"
        >
          <EditTransactionForm
            transaction={editingTransaction}
            accounts={accounts}
            categories={categories}
            onSuccess={handleEditSuccess}
            onCancel={handleEditCancel}
          />
        </Modal>
      )}

      {/* Lista de Transações */}
      <div className="space-y-4">
        {transactions.map((transaction) => {
        const isDeleting = deletingId === transaction.id;
        const isIncome = transaction.type === 'income';
        const isPending = transaction.status === 'pending';
        const accountName = transaction.accounts?.name || 'Conta não encontrada';
        const categoryName = transaction.categories?.name || 'Sem categoria';

        return (
          <Card key={transaction.id} className={`card-hover border-2 transition-all ${
            isIncome 
              ? 'hover:border-emerald-300 dark:hover:border-emerald-700 border-l-4 border-l-emerald-500' 
              : 'hover:border-red-300 dark:hover:border-red-700 border-l-4 border-l-red-500'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-3 rounded-xl text-white shadow-md ${
                    isIncome 
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600' 
                      : 'bg-gradient-to-br from-red-500 to-rose-600'
                  }`}>
                    {isIncome ? (
                      <ArrowUpCircle className="h-6 w-6" aria-hidden="true" />
                    ) : (
                      <ArrowDownCircle className="h-6 w-6" aria-hidden="true" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className={`text-2xl font-bold ${
                        isIncome 
                          ? 'text-emerald-600 dark:text-emerald-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {isIncome ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </h3>
                      {isPending && (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-md">
                          Pendente
                        </span>
                      )}
                    </div>
                    <p className="text-base font-medium text-gray-900 dark:text-white mb-1">
                      {transaction.description || 'Sem descrição'}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {accountName} • {categoryName} • {formatDate(transaction.date)}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {/* Botão de Editar */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(transaction)}
                    disabled={isDeleting}
                    aria-label={`Editar transação`}
                    className="hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  >
                    <Edit2 className="h-4 w-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  </Button>
                  {/* Botão de Deletar */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(transaction.id)}
                    disabled={isDeleting}
                    aria-label={`Deletar transação`}
                    className="hover:bg-red-50 dark:hover:bg-red-900/20"
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
    </>
  );
}


