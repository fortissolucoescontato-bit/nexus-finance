/**
 * Página de Gestão de Transações
 * 
 * Permite criar, visualizar, editar e deletar transações financeiras
 */

import { createServerComponentClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Receipt, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { TransactionsList } from './transactions-list';
import { CreateTransactionForm } from './create-transaction-form';

export const metadata: Metadata = {
  title: 'Transações | Nexus Finance',
  description: 'Gerencie suas transações financeiras',
};

export default async function TransactionsPage() {
  const supabase = await createServerComponentClient();

  // Verifica autenticação
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect('/login');
  }

  // Busca a organização do usuário
  const { data: membersData } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .limit(1)
    .maybeSingle();

  if (!membersData?.organization_id) {
    redirect('/dashboard');
  }

  const organizationId = membersData.organization_id;

  // Busca todas as contas para o formulário
  const { data: accounts } = await supabase
    .from('accounts')
    .select('id, name, type')
    .eq('organization_id', organizationId)
    .order('name', { ascending: true });

  // Busca todas as categorias para o formulário
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, type')
    .eq('organization_id', organizationId)
    .order('type', { ascending: true })
    .order('name', { ascending: true });

  // Busca todas as transações da organização
  const { data: transactions, error: transactionsError } = await supabase
    .from('transactions')
    .select(`
      id,
      account_id,
      category_id,
      amount,
      date,
      description,
      type,
      status,
      created_at,
      updated_at,
      accounts:account_id (id, name),
      categories:category_id (id, name)
    `)
    .eq('organization_id', organizationId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(100); // Limita a 100 transações mais recentes

  if (transactionsError) {
    console.error('Erro ao buscar transações:', transactionsError);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" aria-label="Voltar ao dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Receipt className="h-8 w-8" aria-hidden="true" />
                Transações
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gerencie suas receitas e despesas
              </p>
            </div>
          </div>
        </div>

        {/* Formulário de Criação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" aria-hidden="true" />
              Nova Transação
            </CardTitle>
            <CardDescription>
              Adicione uma nova transação financeira
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateTransactionForm 
              organizationId={organizationId}
              accounts={accounts || []}
              categories={categories || []}
            />
          </CardContent>
        </Card>

        {/* Lista de Transações */}
        <Card>
          <CardHeader>
            <CardTitle>Suas Transações</CardTitle>
            <CardDescription>
              {transactions && transactions.length > 0
                ? `${transactions.length} transação${transactions.length > 1 ? 'ões' : ''} registrada${transactions.length > 1 ? 's' : ''}`
                : 'Nenhuma transação registrada ainda'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TransactionsList 
              transactions={transactions || []} 
              organizationId={organizationId}
              accounts={accounts || []}
              categories={categories || []}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

