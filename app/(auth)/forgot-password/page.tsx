/**
 * Página de Recuperação de Senha
 * 
 * Permite que usuários solicitem um link de recuperação de senha por email
 */

import { forgotPassword } from './actions';
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
import { AlertCircle, Wallet, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Recuperar Senha',
  description: 'Recupere o acesso à sua conta do Nexus Finance',
  robots: {
    index: false,
    follow: false,
  },
};

interface ForgotPasswordPageProps {
  searchParams: Promise<{ error?: string; success?: string }>;
}

export default async function ForgotPasswordPage({ searchParams }: ForgotPasswordPageProps) {
  const params = await searchParams;
  const errorMessage = params.error;
  const successMessage = params.success;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-4">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 glass-effect">
        <CardHeader className="space-y-3 text-center pb-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Recuperar Senha
          </CardTitle>
          <CardDescription className="text-base text-gray-600 dark:text-gray-300">
            Digite seu email e enviaremos um link para redefinir sua senha
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Mensagem de sucesso */}
          {successMessage && (
            <div 
              className="mb-4 p-4 rounded-md bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3"
              role="alert"
              aria-live="polite"
            >
              <Mail className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mt-0.5" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-200">
                  {successMessage}
                </p>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                  Verifique sua caixa de entrada e spam. O link expira em 1 hora.
                </p>
              </div>
            </div>
          )}

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

          {/* Formulário de recuperação */}
          <form action={forgotPassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="seu@email.com"
                required
                autoComplete="email"
                className="w-full"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300" 
              size="lg"
            >
              <Mail className="h-4 w-4 mr-2" aria-hidden="true" />
              Enviar Link de Recuperação
            </Button>
          </form>

          {/* Links de navegação */}
          <div className="mt-6 space-y-3 text-center text-sm">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Voltar para Login
            </Link>
            <div>
              <span className="text-gray-600 dark:text-gray-400">
                Não tem conta?{' '}
              </span>
              <Link
                href="/register"
                className="text-primary hover:underline font-medium"
              >
                Cadastre-se
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

