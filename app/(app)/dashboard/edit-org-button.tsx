'use client';

/**
 * Componente para editar nome da organização
 * 
 * Permite ao usuário editar o nome da organização através de uma Server Action.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateOrganization } from './actions';
import { Loader2, Edit2, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface EditOrgButtonProps {
  organizationId: string;
  currentName: string;
}

export function EditOrgButton({ organizationId, currentName }: EditOrgButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState(currentName);
  const [showForm, setShowForm] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validação básica no cliente
    const trimmedName = organizationName.trim();
    if (trimmedName.length < 2) {
      setError('O nome deve ter pelo menos 2 caracteres');
      setIsLoading(false);
      return;
    }

    if (trimmedName.length > 100) {
      setError('O nome deve ter no máximo 100 caracteres');
      setIsLoading(false);
      return;
    }

    // Se o nome não mudou, apenas fecha o formulário
    if (trimmedName === currentName) {
      setShowForm(false);
      setIsLoading(false);
      return;
    }

    try {
      // Chama a Server Action para atualizar a organização
      const result = await updateOrganization(organizationId, trimmedName);

      if (result.success) {
        // Atualiza o estado local com o novo nome
        setOrganizationName(trimmedName);
        // Recarrega a página para mostrar o nome atualizado
        router.refresh();
        // Aguarda um pouco antes de fechar o formulário para garantir que a atualização foi vista
        setTimeout(() => {
          setShowForm(false);
        }, 500);
      } else {
        // Mostra mensagem de erro
        const errorMsg = result.error || 'Erro ao atualizar organização';
        console.error('Erro ao atualizar:', errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      // Tratamento de erro genérico
      console.error('Erro ao atualizar organização:', err);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  // Se o formulário não estiver visível, mostra o botão para editar
  if (!showForm) {
    return (
      <Button
        onClick={() => setShowForm(true)}
        variant="outline"
        size="sm"
        className="mt-2"
      >
        <Edit2 className="h-4 w-4 mr-2" />
        Editar Nome
      </Button>
    );
  }

  // Mostra o formulário de edição
  return (
    <form onSubmit={handleSubmit} className="space-y-3 mt-2">
      <div className="space-y-2">
        <Label htmlFor="editOrgName" className="text-sm font-medium">
          Novo Nome da Organização
        </Label>
        <Input
          id="editOrgName"
          type="text"
          placeholder="Nome da organização"
          value={organizationName}
          onChange={(e) => {
            setOrganizationName(e.target.value);
            setError(null); // Limpa erro ao digitar
          }}
          disabled={isLoading}
          required
          minLength={2}
          maxLength={100}
          autoFocus
          className="w-full"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Escolha um novo nome para sua organização (mínimo 2 caracteres)
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isLoading || organizationName.trim().length < 2 || organizationName.trim() === currentName}
          className="flex-1"
          size="sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Salvar
            </>
          )}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setShowForm(false);
            setOrganizationName(currentName); // Restaura nome original
            setError(null);
          }}
          disabled={isLoading}
          size="sm"
        >
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
      </div>
      
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-2">
          {error}
        </p>
      )}
    </form>
  );
}


