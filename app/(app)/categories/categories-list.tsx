'use client';

/**
 * Lista de categorias com opções de editar e deletar
 */

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2, Tag } from 'lucide-react';
import { updateCategory, deleteCategory } from './actions';
import { LoadingSpinner } from '@/components/ui/loading';
import { logger } from '@/lib/logger';

interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string | null;
  created_at: string;
  updated_at: string;
}

interface CategoriesListProps {
  categories: Category[];
  organizationId: string;
}

export function CategoriesList({ categories, organizationId }: CategoriesListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editType, setEditType] = useState<'income' | 'expense'>('expense');
  const [editIcon, setEditIcon] = useState('');

  const handleEdit = (category: Category) => {
    setEditingId(category.id);
    setEditName(category.name);
    setEditType(category.type);
    setEditIcon(category.icon || '');
  };

  const handleSave = async (categoryId: string) => {
    const result = await updateCategory(categoryId, {
      name: editName.trim(),
      type: editType,
      icon: editIcon.trim() || null,
    });

    if (result.success) {
      setEditingId(null);
      window.location.reload();
    } else {
      logger.error('Erro ao atualizar categoria', result.error);
      alert(result.error || 'Erro ao atualizar categoria');
    }
  };

  const handleDelete = async (categoryId: string) => {
    if (!confirm('Tem certeza que deseja deletar esta categoria? Esta ação não pode ser desfeita.')) {
      return;
    }

    setDeletingId(categoryId);
    const result = await deleteCategory(categoryId);

    if (result.success) {
      window.location.reload();
    } else {
      logger.error('Erro ao deletar categoria', result.error);
      alert(result.error || 'Erro ao deletar categoria');
      setDeletingId(null);
    }
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-12">
        <Tag className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" aria-hidden="true" />
        <p className="text-gray-600 dark:text-gray-400">
          Nenhuma categoria cadastrada ainda. Crie sua primeira categoria acima!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const isEditing = editingId === category.id;
        const isDeleting = deletingId === category.id;

        return (
          <Card key={category.id}>
            <CardContent className="p-4">
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
                      onChange={(e) => setEditType(e.target.value as 'income' | 'expense')}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="expense">Despesa</option>
                      <option value="income">Receita</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Ícone (opcional)</label>
                    <input
                      type="text"
                      value={editIcon}
                      onChange={(e) => setEditIcon(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      placeholder="Ex: dollar-sign"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleSave(category.id)}
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
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Tag className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {category.type === 'income' ? 'Receita' : 'Despesa'}
                        {category.icon && ` • Ícone: ${category.icon}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(category)}
                      aria-label={`Editar categoria ${category.name}`}
                    >
                      <Edit2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(category.id)}
                      disabled={isDeleting}
                      aria-label={`Deletar categoria ${category.name}`}
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

