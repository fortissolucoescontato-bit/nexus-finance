'use client';

/**
 * Formulário para criar organização personal
 * 
 * Este é um Client Component que permite ao usuário escolher
 * o nome da organização e criar através de uma Server Action.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createPersonalOrganization } from './actions';
import { Loader2, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CreatePersonalOrgButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState('');
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

    try {
      // Chama a Server Action para criar a organização
      const result = await createPersonalOrganization(trimmedName);

      if (result.success) {
        // Recarrega a página para mostrar a organização criada
        router.refresh();
      } else {
        // Mostra mensagem de erro
        setError(result.error || 'Erro ao criar organização');
      }
    } catch (err) {
      // Tratamento de erro genérico
      console.error('Erro ao criar organização:', err);
      setError('Erro inesperado. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  }

  // Se o formulário não estiver visível, mostra o botão para abrir
  if (!showForm) {
    return (
      <Button
        onClick={() => setShowForm(true)}
        className="w-full sm:w-auto"
        size="sm"
      >
        <Building2 className="h-4 w-4 mr-2" />
        Criar Minha Organização
      </Button>
    );
  }

  // Mostra o formulário
  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="orgName" className="text-sm font-medium">
          Nome da Organização
        </Label>
        <Input
          id="orgName"
          type="text"
          placeholder="Ex: Minha Empresa, Casa, Pessoal..."
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
          Escolha um nome para sua organização (mínimo 2 caracteres)
        </p>
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={isLoading || organizationName.trim().length < 2}
          className="flex-1"
          size="sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Criando...
            </>
          ) : (
            <>
              <Building2 className="h-4 w-4 mr-2" />
              Criar Organização
            </>
          )}
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setShowForm(false);
            setOrganizationName('');
            setError(null);
          }}
          disabled={isLoading}
          size="sm"
        >
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
