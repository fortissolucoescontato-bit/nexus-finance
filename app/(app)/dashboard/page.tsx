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
import { Wallet, Tag, Receipt, TrendingUp, TrendingDown, ArrowRight, MessageCircle, ShoppingBag, DollarSign } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { OnboardingWrapper } from './onboarding-wrapper';

export const metadata: Metadata = {
  title: 'Resumo do Negócio',
  description: 'Resumo financeiro do seu negócio',
};


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

  // Cria dados padrão se necessário (seed data)
  // Isso garante que novos usuários tenham categorias e contas padrão
  let isNewUser = false;
  if (personalOrg?.id) {
    // Verifica se já existem categorias (para detectar novo usuário)
    const { data: existingCategories } = await supabase
      .from('categories')
      .select('id')
      .eq('organization_id', personalOrg.id)
      .limit(1);

    // Se não tem categorias, é um novo usuário
    isNewUser = !existingCategories || existingCategories.length === 0;

    // Importa a função dinamicamente para evitar problemas de importação circular
    const { createDefaultData } = await import('./actions');
    await createDefaultData(personalOrg.id);
  }

  // Busca estatísticas financeiras (apenas se tiver organização)
  let totalPendingIncome = 0; // Total a Receber (Fiado)
  let totalCashBalance = 0; // Dinheiro no Bolso (cash + bank)
  let monthlyProfit = 0; // Lucro do Mês (Receitas Pagas - Despesas Pagas)
  let recentTransactions: any[] = [];

  if (personalOrg?.id) {
    // Busca contas para calcular "Dinheiro no Bolso"
    const { data: accounts } = await supabase
      .from('accounts')
      .select('balance, type')
      .eq('organization_id', personalOrg.id)
      .in('type', ['cash', 'bank']); // Apenas dinheiro e banco

    // Calcula "Dinheiro no Bolso" (soma de cash + bank)
    totalCashBalance = accounts?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0;

    // Busca transações pendentes (FIADO - A Receber)
    const { data: pendingTransactions } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('organization_id', personalOrg.id)
      .eq('status', 'pending')
      .eq('type', 'income'); // Apenas receitas pendentes

    // Calcula "Total a Receber (Fiado)"
    totalPendingIncome = pendingTransactions?.reduce((sum, t) => sum + Math.abs(t.amount || 0), 0) || 0;

    // Busca transações pagas do mês atual para calcular lucro
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const { data: paidTransactions } = await supabase
      .from('transactions')
      .select('amount, type')
      .eq('organization_id', personalOrg.id)
      .eq('status', 'paid')
      .gte('date', firstDayOfMonth.toISOString().split('T')[0])
      .lte('date', lastDayOfMonth.toISOString().split('T')[0]);

    // Calcula "Lucro do Mês" (Receitas Pagas - Despesas Pagas)
    const totalIncomePaid = paidTransactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + Math.abs(t.amount || 0), 0) || 0;
    const totalExpensesPaid = paidTransactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + Math.abs(t.amount || 0), 0) || 0;
    monthlyProfit = totalIncomePaid - totalExpensesPaid;

    // Busca transações recentes para exibir no dashboard
    const { data: recentTransactionsData } = await supabase
      .from('transactions')
      .select(`
        id,
        amount,
        date,
        description,
        type,
        status,
        accounts:account_id (name),
        categories:category_id (name)
      `)
      .eq('organization_id', personalOrg.id)
      .order('date', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(5);

    // Processa transações recentes
    recentTransactions = (recentTransactionsData || []).map((t: any) => ({
      ...t,
      accounts: Array.isArray(t.accounts) ? t.accounts[0] : t.accounts,
      categories: Array.isArray(t.categories) ? t.categories[0] : t.categories,
    }));

    // Calcula estatísticas
    totalBalance = accounts?.reduce((sum, acc) => sum + (acc.balance || 0), 0) || 0;
    totalIncome = transactions?.filter(t => t.type === 'income').reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
    totalExpenses = Math.abs(transactions?.filter(t => t.type === 'expense').reduce((sum, t) => sum + (t.amount || 0), 0) || 0);
    accountsCount = accounts?.length || 0;
    categoriesCount = categories?.length || 0;
    transactionsCount = transactions?.length || 0;
  }
  
  return (
    <>
      {/* Onboarding Modal para novos usuários */}
      <OnboardingWrapper isNewUser={isNewUser} />
      
      <div className="min-h-screen p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-8">
        {/* ========== HEADER DO DASHBOARD ========== */}
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Resumo do Negócio
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
            Olá, <span className="font-semibold text-gray-900 dark:text-white">{userName.split(' ')[0]}</span>! Veja como está seu negócio hoje 👋
          </p>
        </div>

        {/* ========== SEÇÃO: RESUMO DO NEGÓCIO ========== */}
        {personalOrg && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Resumo do Negócio</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Total a Receber (Fiado) - DESTAQUE */}
            <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-orange-500 to-red-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-100 text-sm font-medium mb-1">Total a Receber (Fiado)</p>
                    <p className="text-3xl font-bold">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(totalPendingIncome / 100)}
                    </p>
                    <p className="text-orange-100 text-xs mt-2">Clientes que ainda não pagaram</p>
                  </div>
                  <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                    <MessageCircle className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 2: Dinheiro no Bolso */}
            <Card className="card-hover border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-emerald-100 text-sm font-medium mb-1">Dinheiro no Bolso</p>
                    <p className="text-3xl font-bold">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(totalCashBalance / 100)}
                    </p>
                    <p className="text-emerald-100 text-xs mt-2">Carteira + Conta Bancária</p>
                  </div>
                  <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                    <DollarSign className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Lucro do Mês */}
            <Card className={`card-hover border-0 shadow-lg text-white ${
              monthlyProfit >= 0 
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600' 
                : 'bg-gradient-to-br from-red-500 to-rose-600'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/90 text-sm font-medium mb-1">Lucro do Mês</p>
                    <p className="text-3xl font-bold">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                      }).format(monthlyProfit / 100)}
                    </p>
                    <p className="text-white/80 text-xs mt-2">Vendas - Gastos (este mês)</p>
                  </div>
                  <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                </div>
              </CardContent>
            </Card>
            </div>
          </div>
        )}

        {/* ========== SEÇÃO: VENDAS E GASTOS RECENTES ========== */}
        {personalOrg && recentTransactions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Vendas e Gastos Recentes</h2>
              <Link href="/transactions">
                <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400">
                  Ver Todas
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
            <Card className="card-hover shadow-lg border-0 glass-effect">
              <CardContent className="p-6">
                <div className="space-y-3">
                  {recentTransactions.map((transaction: any) => {
                    const isIncome = transaction.type === 'income';
                    const accountName = transaction.accounts?.name || 'Conta não encontrada';
                    const categoryName = transaction.categories?.name || 'Sem categoria';
                    const date = new Date(transaction.date).toLocaleDateString('pt-BR');
                    
                    return (
                      <div 
                        key={transaction.id} 
                        className="flex items-center justify-between p-4 rounded-lg border-2 border-gray-100 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`p-2 rounded-lg ${
                            isIncome 
                              ? 'bg-emerald-100 dark:bg-emerald-900/30' 
                              : 'bg-red-100 dark:bg-red-900/30'
                          }`}>
                            {isIncome ? (
                              <TrendingUp className={`h-5 w-5 ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`} />
                            ) : (
                              <TrendingDown className={`h-5 w-5 ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`} />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {transaction.description || 'Sem descrição'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {accountName} • {categoryName} • {date}
                            </p>
                          </div>
                          <p className={`text-lg font-bold ${
                            isIncome 
                              ? 'text-emerald-600 dark:text-emerald-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {isIncome ? '+' : '-'}{new Intl.NumberFormat('pt-BR', {
                              style: 'currency',
                              currency: 'BRL',
                            }).format(Math.abs(transaction.amount) / 100)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}


      </div>
    </div>
    </>
  );
}

