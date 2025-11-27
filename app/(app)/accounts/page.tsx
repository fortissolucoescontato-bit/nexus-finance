/**
 * Página de Gestão de Contas
 * 
 * Permite criar, visualizar, editar e deletar contas financeiras
 */

import { createServerComponentClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import dynamic from 'next/dynamic';
import { AccountsList } from './accounts-list';
import { CreateAccountForm } from './create-account-form';

export const metadata: Metadata = {
  title: 'Contas | Nexus Finance',
  description: 'Gerencie suas contas financeiras',
};

export default async function AccountsPage() {
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

  // Busca todas as contas da organização
  const { data: accounts, error: accountsError } = await supabase
    .from('accounts')
    .select('id, name, type, balance, created_at, updated_at')
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false });

  if (accountsError) {
    console.error('Erro ao buscar contas:', accountsError);
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
                <Wallet className="h-8 w-8" aria-hidden="true" />
                Contas
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gerencie suas contas bancárias, dinheiro e cartões
              </p>
            </div>
          </div>
        </div>

        {/* Formulário de Criação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" aria-hidden="true" />
              Nova Conta
            </CardTitle>
            <CardDescription>
              Adicione uma nova conta financeira à sua organização
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateAccountForm organizationId={organizationId} />
          </CardContent>
        </Card>

        {/* Lista de Contas */}
        <Card>
          <CardHeader>
            <CardTitle>Suas Contas</CardTitle>
            <CardDescription>
              {accounts && accounts.length > 0
                ? `${accounts.length} conta${accounts.length > 1 ? 's' : ''} cadastrada${accounts.length > 1 ? 's' : ''}`
                : 'Nenhuma conta cadastrada ainda'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AccountsList 
              accounts={accounts || []} 
              organizationId={organizationId}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

