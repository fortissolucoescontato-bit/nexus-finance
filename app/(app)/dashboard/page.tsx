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
import { LogOut, User, Wallet, Tag, Receipt } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Painel de controle do Nexus Finance',
};

// Lazy load dos componentes client para melhor performance
const CreatePersonalOrgButton = dynamic(() => import('./create-org-button').then(mod => ({ default: mod.CreatePersonalOrgButton })), {
  loading: () => <div className="h-10 w-full animate-pulse bg-gray-200 dark:bg-gray-700 rounded" />,
});

const EditOrgButton = dynamic(() => import('./edit-org-button').then(mod => ({ default: mod.EditOrgButton })), {
  loading: () => <div className="h-10 w-32 animate-pulse bg-gray-200 dark:bg-gray-700 rounded" />,
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

  // Busca estatísticas financeiras (apenas se tiver organização)
  let totalBalance = 0;
  let totalIncome = 0;
  let totalExpenses = 0;
  let accountsCount = 0;
  let transactionsCount = 0;

  if (personalOrg?.id) {
    const { data: accounts } = await supabase
      .from('accounts')
      .select('balance')
      .eq('organization_id', personalOrg.id);

    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount, type, status')
      .eq('organization_id', personalOrg.id)
      .eq('status', 'paid')
      .limit(100);

    // Calcula estatísticas
    totalBalance = accounts?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0;
    totalIncome = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
    totalExpenses = Math.abs(transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0) || 0);
    accountsCount = accounts?.length || 0;
    transactionsCount = transactions?.length || 0;
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header do Dashboard */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
              Bem-vindo de volta, <span className="font-semibold text-gray-900 dark:text-white">{userName.split(' ')[0]}</span>! 👋
            </p>
          </div>

          {/* Botão de Logout */}
          <form action={logout}>
            <Button 
              type="submit" 
              variant="outline" 
              size="sm"
              className="border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Sair da conta"
            >
              <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
              Sair
            </Button>
          </form>
        </div>

        {/* Cards de Estatísticas */}
        {personalOrg && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Saldo Total */}
            <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm font-medium mb-1">Saldo Total</p>
                    <p className="text-3xl font-bold">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(totalBalance / 100)}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                    <Wallet className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Receitas */}
            <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium mb-1">Receitas</p>
                    <p className="text-3xl font-bold">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(totalIncome / 100)}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                    <Receipt className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Despesas */}
            <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-red-500 to-rose-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-red-100 text-sm font-medium mb-1">Despesas</p>
                    <p className="text-3xl font-bold">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(totalExpenses / 100)}
                    </p>
                  </div>
                  <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                    <Tag className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contas */}
            <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100 text-sm font-medium mb-1">Contas</p>
                    <p className="text-3xl font-bold">{accountsCount}</p>
                    <p className="text-purple-100 text-xs mt-1">{transactionsCount} transações</p>
                  </div>
                  <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                    <Wallet className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Card de Informações do Usuário */}
        <Card className="card-hover shadow-lg border-0 glass-effect">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <User className="h-5 w-5" aria-hidden="true" />
              </div>
              Sua Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Nome</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {userName}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
                  {userEmail}
                </p>
              </div>
            </div>

            {personalOrg ? (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Organização</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {personalOrg.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {personalOrg.type === 'personal' ? 'Pessoal' : 'Empresarial'}
                    </p>
                  </div>
                  <EditOrgButton 
                    organizationId={personalOrg.id} 
                    currentName={personalOrg.name}
                  />
                </div>
              </div>
            ) : (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="p-5 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-800 dark:text-amber-200 font-semibold mb-2 flex items-center gap-2">
                    <span className="text-lg">🎯</span>
                    Configure sua organização
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mb-4">
                    Para começar a gerenciar suas finanças, crie sua organização personalizada.
                  </p>
                  <CreatePersonalOrgButton />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Card de Navegação Rápida */}
        <Card className="card-hover shadow-lg border-0 glass-effect">
          <CardHeader>
            <CardTitle className="text-2xl">Acesso Rápido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link href="/accounts">
                <Card className="card-hover border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                        <Wallet className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Contas</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Gerencie suas contas</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/categories">
                <Card className="card-hover border-2 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                        <Tag className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Categorias</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Organize receitas e despesas</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
              <Link href="/transactions">
                <Card className="card-hover border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white">
                        <Receipt className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">Transações</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Registre movimentações</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

