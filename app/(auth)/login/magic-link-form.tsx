'use client';

/**
 * Formulário de Link Mágico
 * 
 * Permite login sem senha através de link enviado por email
 */

import { useState } from 'react';
import { sendMagicLink } from './magic-link-actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Sparkles } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading';

export function MagicLinkForm() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const formData = new FormData();
      formData.append('email', email);
      
      await sendMagicLink(formData);
      
      setSuccess(true);
      setEmail('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar link mágico';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
        <div className="flex items-start gap-3">
          <Mail className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
              Link mágico enviado!
            </p>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
              Verifique sua caixa de entrada e clique no link para fazer login.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="magic-email" className="text-sm">
          Entrar com Link Mágico
        </Label>
        <div className="flex gap-2">
          <Input
            id="magic-email"
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={isLoading || !email}
            variant="outline"
            className="whitespace-nowrap"
          >
            {isLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Enviar Link
              </>
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-2 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-xs text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}
    </form>
  );
}

