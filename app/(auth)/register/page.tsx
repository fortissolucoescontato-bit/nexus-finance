/**
 * Página de Registro
 * 
 * Esta página permite que novos usuários criem uma conta no sistema.
 * 
 * Características:
 * - UI moderna e responsiva usando componentes Shadcn
 * - Formulário que usa Server Actions para registro
 * - Exibe mensagens de erro vindas da URL (searchParams)
 * - Redirecionamento automático se o usuário já estiver logado (via middleware)
 */

import { signup } from './actions';
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
 * Usado para exibir mensagens de erro após tentativa de registro falha
 */
interface RegisterPageProps {
  searchParams: Promise<{ error?: string }>;
}

/**
 * Componente da página de registro
 * 
 * Esta é uma Server Component que busca os searchParams no servidor
 * e renderiza o formulário de registro
 */
export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  // Resolve os searchParams (Next.js 15 usa Promise para searchParams)
  const params = await searchParams;
  
  // Extrai a mensagem de erro da URL, se existir
  const errorMessage = params.error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Criar nova conta
          </CardTitle>
          <CardDescription className="text-center">
            Preencha os dados abaixo para criar sua conta
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

          {/* Formulário de registro usando Server Action */}
          {/* O atributo action aponta para a Server Action 'signup' */}
          <form action={signup} className="space-y-4">
            {/* Campo de Nome Completo */}
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="João Silva"
                required
                autoComplete="name"
                className="w-full"
                minLength={2}
              />
            </div>

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
                autoComplete="new-password"
                className="w-full"
                minLength={6}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                A senha deve ter pelo menos 6 caracteres
              </p>
            </div>

            {/* Botão de Submit */}
            <Button type="submit" className="w-full" size="lg">
              Criar conta
            </Button>
          </form>

          {/* Link para página de login */}
          <div className="mt-4 text-center text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              Já tem uma conta?{' '}
            </span>
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Entrar
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

