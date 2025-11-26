'use client';

/**
 * Botão para criar organização personal
 * 
 * Este é um Client Component que chama a Server Action
 * para criar a organização do usuário.
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { createPersonalOrganization } from './actions';
import { Loader2, Building2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CreatePersonalOrgButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleCreate() {
    setIsLoading(true);
    setError(null);

    try {
      // Chama a Server Action para criar a organização
      const result = await createPersonalOrganization();

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

  return (
    <div className="space-y-2">
      <Button
        onClick={handleCreate}
        disabled={isLoading}
        className="w-full sm:w-auto"
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
            Criar Minha Organização
          </>
        )}
      </Button>
      
      {error && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-2">
          {error}
        </p>
      )}
    </div>
  );
}

