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
import { logout, createPersonalOrganization } from './actions';
import { LogOut, User } from 'lucide-react';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Painel de controle do Nexus Finance',
};

// Lazy load dos componentes client para melhor performance
const CreatePersonalOrgButton = dynamic(() => import('./create-org-button').then(mod => ({ default: mod.CreatePersonalOrgButton })), {
  loading: () => <div className="h-10 w-full animate-pulse bg-gray-200 dark:bg-gray-700 rounded" />,
  ssr: false,
});

const EditOrgButton = dynamic(() => import('./edit-org-button').then(mod => ({ default: mod.EditOrgButton })), {
  loading: () => <div className="h-10 w-32 animate-pulse bg-gray-200 dark:bg-gray-700 rounded" />,
  ssr: false,
});

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

  // Busca o perfil do usuário na tabela profiles
  // Isso nos dá acesso ao full_name e outras informações adicionais
  // Usamos try/catch e verificação manual ao invés de .single() para evitar erros
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', user.id)
    .maybeSingle(); // maybeSingle() retorna null se não encontrar, ao invés de lançar erro

  // Log de erro do perfil para depuração (visível no console do servidor)
  if (profileError) {
    // Usar logger quando disponível, por enquanto console.error
    // logger.error('Erro ao buscar perfil do usuário', profileError);
  }

  // Busca a organização "Personal" do usuário
  // Todo usuário tem uma organização personal criada automaticamente
  // Primeiro busca os membros, depois busca a organização
  const { data: membersData, error: membersError } = await supabase
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .limit(1);

  // Log de erro dos membros para depuração
  if (membersError) {
    // Usar logger quando disponível, por enquanto console.error
    // logger.error('Erro ao buscar membros da organização', membersError);
  }

  // Pega o primeiro membro (se existir)
  const members = membersData && membersData.length > 0 ? membersData[0] : null;

  // Se encontrou um membro, busca a organização
  let personalOrg = null;
  if (members?.organization_id) {
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .select('id, name, type, slug')
      .eq('id', members.organization_id)
      .maybeSingle(); // maybeSingle() retorna null se não encontrar
    
    // Log de erro da organização para depuração
    if (orgError) {
      // Usar logger quando disponível, por enquanto console.error
      // logger.error('Erro ao buscar organização', orgError);
    }
    
    personalOrg = org;
  }

  // Extrai o nome do perfil ou usa o email como fallback
  const userName = profile?.full_name || user.email || 'Usuário';
  const userEmail = profile?.email || user.email || 'Usuário';
  
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
            <Button 
              type="submit" 
              variant="outline" 
              size="sm"
              aria-label="Sair da conta"
            >
              <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
              Sair
            </Button>
          </form>
        </div>

        {/* Card de Boas-vindas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" aria-hidden="true" />
              Bem-vindo ao Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Você está logado como:
              </p>
              <p className="text-lg font-semibold text-gray-900 dark:text-white mt-1">
                {userName}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                {userEmail}
              </p>
            </div>

            {personalOrg ? (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Organização Ativa:
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-white mt-1">
                  {personalOrg.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Tipo: {personalOrg.type === 'personal' ? 'Pessoal' : 'Empresarial'}
                </p>
                <EditOrgButton 
                  organizationId={personalOrg.id} 
                  currentName={personalOrg.name}
                />
              </div>
            ) : (
              <div className="pt-4 border-t">
                <div className="p-4 rounded-md bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-800 dark:text-amber-200 font-medium mb-2">
                    ⚠️ Organização ainda não foi criada
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mb-3">
                    Para começar a usar o sistema, você precisa criar sua organização. 
                    Escolha um nome personalizado para sua organização.
                  </p>
                  <CreatePersonalOrgButton />
                </div>
              </div>
            )}

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

