'use client';

/**
 * Formulário para atualizar o email do usuário
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { updateEmail } from './actions';
import { LoadingSpinner } from '@/components/ui/loading';
import { Mail, CheckCircle2, AlertCircle } from 'lucide-react';

interface UpdateEmailFormProps {
  currentEmail: string;
}

export function UpdateEmailForm({ currentEmail }: UpdateEmailFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState(currentEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const result = await updateEmail(email);

      if (result.success) {
        setMessage({ 
          type: 'success', 
          text: 'Email atualizado com sucesso! Verifique sua caixa de entrada para confirmar o novo email.' 
        });
        // Atualiza a página após um breve delay
        setTimeout(() => {
          router.refresh();
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Erro ao atualizar email' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro inesperado ao atualizar email' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          required
          disabled={isLoading}
          className="w-full"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Você receberá um email de confirmação ao alterar seu endereço de email.
        </p>
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
        disabled={isLoading || email.trim() === currentEmail.trim()}
        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
      >
        {isLoading ? (
          <>
            <LoadingSpinner size="sm" />
            Atualizando...
          </>
        ) : (
          <>
            <Mail className="h-4 w-4 mr-2" />
            Atualizar Email
          </>
        )}
      </Button>
    </form>
  );
}

