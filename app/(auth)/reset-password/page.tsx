/**
 * Página de Redefinição de Senha
 * 
 * Permite que usuários redefinam sua senha após clicar no link do email
 */

import { resetPassword } from './actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AlertCircle, Wallet, Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Redefinir Senha',
  description: 'Defina uma nova senha para sua conta',
  robots: {
    index: false,
    follow: false,
  },
};

interface ResetPasswordPageProps {
  searchParams: Promise<{ error?: string; code?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const params = await searchParams;
  const errorMessage = params.error;
  const code = params.code;

  // Se não tiver código, redireciona para login
  if (!code) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-4">
        <Card className="w-full max-w-md shadow-2xl border-0 glass-effect">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Link Inválido</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              O link de recuperação é inválido ou expirou.
            </p>
            <Link href="/forgot-password">
              <Button className="w-full">
                Solicitar Novo Link
              </Button>
            </Link>
            <Link href="/login" className="block mt-4 text-sm text-primary hover:underline">
              Voltar para Login
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-4">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 glass-effect">
        <CardHeader className="space-y-3 text-center pb-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Redefinir Senha
          </CardTitle>
          <CardDescription className="text-base text-gray-600 dark:text-gray-300">
            Digite sua nova senha abaixo
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Mensagem de erro */}
          {errorMessage && (
            <div 
              className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-sm text-destructive"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle className="h-4 w-4" aria-hidden="true" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Formulário de redefinição */}
          <form action={resetPassword} className="space-y-4">
            <input type="hidden" name="code" value={code} />
            
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="new-password"
                className="w-full"
                minLength={6}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Mínimo de 6 caracteres
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="new-password"
                className="w-full"
                minLength={6}
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300" 
              size="lg"
            >
              <Lock className="h-4 w-4 mr-2" aria-hidden="true" />
              Redefinir Senha
            </Button>
          </form>

          {/* Link de volta */}
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-primary hover:underline font-medium"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Voltar para Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

