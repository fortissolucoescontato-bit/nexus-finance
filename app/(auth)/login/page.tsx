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
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Entrar na sua conta
          </CardTitle>
          <CardDescription className="text-center">
            Digite seu email e senha para acessar o dashboard
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Exibe mensagem de erro se houver */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-md bg-destructive/10 border border-destructive/20 flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="h-4 w-4" />
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
            <Button type="submit" className="w-full" size="lg">
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

