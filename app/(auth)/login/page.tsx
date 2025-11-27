/**
 * Página de Login
 * 
 * Esta página permite que usuários façam login no sistema.
 * 
 * Características:
 * - UI moderna e responsiva usando componentes Shadcn
 * - Formulário que usa Server Actions para autenticação
 * - Exibe mensagens de erro vindas da URL (searchParams)
 * - Redirecionamento automático se o usuário já estiver logado (via middleware)
 */

import { login } from './actions';
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
import { AlertCircle, Wallet, Mail, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { MagicLinkForm } from './magic-link-form';

export const metadata: Metadata = {
  title: 'Login',
  description: 'Faça login na sua conta do Nexus Finance',
  robots: {
    index: false, // Página de login não deve ser indexada
    follow: false,
  },
};

/**
 * Props recebidas da URL (searchParams)
 * Usado para exibir mensagens de erro após tentativa de login falha
 */
interface LoginPageProps {
  searchParams: Promise<{ error?: string; success?: string }>;
}

/**
 * Componente da página de login
 * 
 * Esta é uma Server Component que busca os searchParams no servidor
 * e renderiza o formulário de login
 */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  // Resolve os searchParams (Next.js 15 usa Promise para searchParams)
  const params = await searchParams;
  
  // Extrai mensagens da URL
  const errorMessage = params.error;
  const successMessage = params.success;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 p-4">
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:20px_20px]" />
      <Card className="w-full max-w-md relative z-10 shadow-2xl border-0 glass-effect">
        <CardHeader className="space-y-3 text-center pb-8">
          <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Nexus Finance
          </CardTitle>
          <CardDescription className="text-base text-gray-600 dark:text-gray-300">
            Faça login para acessar sua conta
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Exibe mensagem de sucesso se houver */}
          {successMessage && (
            <div 
              className="mb-4 p-3 rounded-md bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 text-sm text-emerald-800 dark:text-emerald-200"
              role="alert"
              aria-live="polite"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Exibe mensagem de erro se houver */}
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

          {/* Formulário de login usando Server Action */}
          {/* O atributo action aponta para a Server Action 'login' */}
          <form action={login} className="space-y-4">
            {/* Campo de Email */}
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

            {/* Campo de Senha */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  Esqueci minha senha
                </Link>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full"
                minLength={6}
              />
            </div>

            {/* Botão de Submit */}
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300" 
              size="lg"
            >
              Entrar
            </Button>
          </form>

          {/* Divisor */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">
                Ou
              </span>
            </div>
          </div>

          {/* Link Mágico */}
          <MagicLinkForm />

          {/* Links de navegação */}
          <div className="mt-4 text-center text-sm">
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
        </CardContent>
      </Card>
    </div>
  );
}

