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
import { AlertCircle, Wallet } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

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
  searchParams: Promise<{ error?: string }>;
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
  
  // Extrai a mensagem de erro da URL, se existir
  const errorMessage = params.error;

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
              <Label htmlFor="password">Senha</Label>
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

          {/* Link para página de registro */}
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

