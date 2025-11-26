/**
 * Página do Dashboard (Protegida)
 * 
 * Esta página só pode ser acessada por usuários autenticados.
 * O middleware redireciona automaticamente usuários não autenticados para /login.
 * 
 * Características:
 * - Busca dados do usuário no servidor (Server Component)
 * - Exibe informações do usuário autenticado
 * - Botão de logout que usa Server Action
 */

import { createServerComponentClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { logout } from './actions';
import { LogOut, User } from 'lucide-react';

/**
 * Componente da página do dashboard
 * 
 * Esta é uma Server Component que:
 * 1. Busca os dados do usuário no servidor
 * 2. Verifica se o usuário está autenticado
 * 3. Renderiza o dashboard com as informações do usuário
 */
export default async function DashboardPage() {
  // Cria o cliente Supabase para Server Components
  // Este cliente acessa os cookies da sessão automaticamente
  const supabase = await createServerComponentClient();

  // Busca os dados do usuário autenticado
  // auth.getUser() verifica o token JWT e retorna os dados do usuário
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  // Se houver erro ao buscar o usuário ou se o usuário não existir,
  // redireciona para login (camada extra de segurança)
  // Nota: O middleware já deveria ter feito isso, mas esta é uma verificação dupla
  if (error || !user) {
    redirect('/login');
  }

  // Extrai o email do usuário para exibir na tela
  // O email está disponível em user.email
  const userEmail = user.email || 'Usuário';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header do Dashboard */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Área protegida do sistema
            </p>
          </div>

          {/* Botão de Logout */}
          {/* Usa um formulário simples para chamar a Server Action */}
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm">
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </form>
        </div>

        {/* Card de Boas-vindas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Bem-vindo ao Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Você está logado como:
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {userEmail}
              </p>
            </div>

            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                ID do usuário:
              </p>
              <p className="text-xs font-mono text-gray-500 dark:text-gray-500 mt-1 break-all">
                {user.id}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card de Informações */}
        <Card>
          <CardHeader>
            <CardTitle>Informações do Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Esta é uma página protegida. Apenas usuários autenticados podem
              acessar este conteúdo.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              O middleware do Next.js está protegendo esta rota automaticamente.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

