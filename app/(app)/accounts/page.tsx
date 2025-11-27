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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-slate-900 dark:to-indigo-950 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm" className="hover:bg-white/50 dark:hover:bg-gray-800/50" aria-label="Voltar ao dashboard">
                <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
                  <Wallet className="h-8 w-8" aria-hidden="true" />
                </div>
                Contas
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                Gerencie suas contas bancárias, dinheiro e cartões
              </p>
            </div>
          </div>
        </div>

        {/* Formulário de Criação */}
        <Card className="card-hover shadow-lg border-0 glass-effect">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                <Plus className="h-5 w-5" aria-hidden="true" />
              </div>
              Nova Conta
            </CardTitle>
            <CardDescription className="text-base">
              Adicione uma nova conta financeira à sua organização
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateAccountForm organizationId={organizationId} />
          </CardContent>
        </Card>

        {/* Lista de Contas */}
        <Card className="card-hover shadow-lg border-0 glass-effect">
          <CardHeader>
            <CardTitle className="text-2xl">Suas Contas</CardTitle>
            <CardDescription className="text-base">
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

