'use client';

/**
 * Formulário para atualizar o perfil do usuário
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateProfile } from './actions';
import { LoadingSpinner } from '@/components/ui/loading';
import { Save, CheckCircle2, AlertCircle } from 'lucide-react';

interface UpdateProfileFormProps {
  currentName: string;
}

export function UpdateProfileForm({ currentName }: UpdateProfileFormProps) {
  const router = useRouter();
  const [name, setName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await updateProfile(name);

      if (result.success) {
        setMessage({ type: 'success', text: 'Perfil atualizado com sucesso!' });
        // Atualiza a página após um breve delay para mostrar a mensagem
        setTimeout(() => {
          router.refresh();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: result.error || 'Erro ao atualizar perfil' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro inesperado ao atualizar perfil' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">Nome Completo</Label>
        <Input
          id="fullName"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Seu nome completo"
          required
          minLength={1}
          maxLength={100}
          disabled={isLoading}
          className="w-full"
        />
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            message.type === 'success'
              ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : (
            <AlertCircle className="h-4 w-4" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      <Button
        type="submit"
        disabled={isLoading || name.trim() === currentName.trim()}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white"
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" />
            Salvando...
          </>
        ) : (
          <>
            <Save className="h-4 w-4 mr-2" />
            Salvar Alterações
          </>
        )}
      </Button>
    </form>
  );
}

