'use client';

/**
 * Lista de contas com opções de editar e deletar
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Wallet, CreditCard, Banknote } from 'lucide-react';
import { updateAccount, deleteAccount } from './actions';
import { LoadingSpinner } from '@/components/ui/loading';
import { logger } from '@/lib/logger';

interface Account {
  id: string;
  name: string;
  type: 'bank' | 'cash' | 'credit';
  balance: number;
  created_at: string;
  updated_at: string;
}

interface AccountsListProps {
  accounts: Account[];
  organizationId: string;
}

/**
 * Formata valor em centavos para exibição em reais
 */
function formatCurrency(cents: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

/**
 * Retorna o ícone e label do tipo de conta
 */
function getAccountTypeInfo(type: 'bank' | 'cash' | 'credit') {
  switch (type) {
    case 'bank':
      return { icon: Wallet, label: 'Conta Bancária' };
    case 'cash':
      return { icon: Banknote, label: 'Carteira/Dinheiro' };
    case 'credit':
      return { icon: CreditCard, label: 'Caderno de Fiado' };
  }
}

export function AccountsList({ accounts, organizationId }: AccountsListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<'bank' | 'cash' | 'credit'>('bank');

  const handleEdit = (account: Account) => {
    setEditingId(account.id);
    setEditName(account.name);
    setEditType(account.type);
  };

  const handleSave = async (accountId: string) => {
    const result = await updateAccount(accountId, {
      name: editName.trim(),
      type: editType,
    });

    if (result.success) {
      setEditingId(null);
      window.location.reload();
    } else {
      logger.error('Erro ao atualizar conta', result.error);
      alert(result.error || 'Erro ao atualizar conta');
    }
  };

  const handleDelete = async (accountId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta conta? Esta ação não pode ser desfeita.')) {
      return;
    }

    setDeletingId(accountId);
    const result = await deleteAccount(accountId);

    if (result.success) {
      window.location.reload();
    } else {
      logger.error('Erro ao deletar conta', result.error);
      alert(result.error || 'Erro ao deletar conta');
      setDeletingId(null);
    }
  };

  if (accounts.length === 0) {
    return (
      <div className="text-center py-12">
        <Wallet className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" aria-hidden="true" />
        <p className="text-gray-600 dark:text-gray-400">
          Nenhum caixa cadastrado ainda. Crie seu primeiro caixa acima!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {accounts.map((account) => {
        const isEditing = editingId === account.id;
        const isDeleting = deletingId === account.id;
        const TypeIcon = getAccountTypeInfo(account.type).icon;
        const typeLabel = getAccountTypeInfo(account.type).label;

        return (
          <Card key={account.id} className="card-hover border-2 hover:border-blue-300 dark:hover:border-blue-700 transition-all">
            <CardContent className="p-6">
              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      autoFocus
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tipo</label>
                    <select
                      value={editType}
                      onChange={(e) => setEditType(e.target.value as 'bank' | 'cash' | 'credit')}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="cash">Carteira/Dinheiro</option>
                      <option value="bank">Conta Bancária</option>
                      <option value="credit">Caderno de Fiado</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSave(account.id)}
                      disabled={!editName.trim()}
                    >
                      Salvar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingId(null)}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-md">
                      <TypeIcon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {account.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                        {typeLabel}
                      </p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {formatCurrency(account.balance)}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(account)}
                      aria-label={`Editar conta ${account.name}`}
                    >
                      <Edit2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(account.id)}
                      disabled={isDeleting}
                      aria-label={`Deletar conta ${account.name}`}
                    >
                      {isDeleting ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" aria-hidden="true" />
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

