/**
 * Página de Gestão de Categorias
 * 
 * Permite criar, visualizar, editar e deletar categorias de transações
 */

import { createServerComponentClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tag, Plus, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';
import { CategoriesList } from './categories-list';
import { CreateCategoryForm } from './create-category-form';

export const metadata: Metadata = {
  title: 'Categorias | Nexus Finance',
  description: 'Gerencie suas categorias de receitas e despesas',
};

export default async function CategoriesPage() {
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

  // Busca todas as categorias da organização
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name, type, icon, created_at, updated_at')
    .eq('organization_id', organizationId)
    .order('type', { ascending: true })
    .order('name', { ascending: true });

  if (categoriesError) {
    console.error('Erro ao buscar categorias:', categoriesError);
  }

  // Separa receitas e despesas
  const incomeCategories = categories?.filter((c) => c.type === 'income') || [];
  const expenseCategories = categories?.filter((c) => c.type === 'expense') || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 dark:from-gray-950 dark:via-slate-900 dark:to-emerald-950 p-4 md:p-8">
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
              <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg">
                  <Tag className="h-8 w-8" aria-hidden="true" />
                </div>
                Categorias
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-lg">
                Organize seus tipos de venda e gasto
              </p>
            </div>
          </div>
        </div>

        {/* Formulário de Criação */}
        <Card className="card-hover shadow-lg border-0 glass-effect">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-3 text-2xl">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                <Plus className="h-5 w-5" aria-hidden="true" />
              </div>
              Nova Categoria
            </CardTitle>
            <CardDescription className="text-base">
              Adicione uma nova categoria à sua organização
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateCategoryForm organizationId={organizationId} />
          </CardContent>
        </Card>

        {/* Lista de Categorias - Receitas */}
        <Card className="card-hover shadow-lg border-0 glass-effect border-l-4 border-l-emerald-500">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                <Tag className="h-5 w-5" />
              </div>
              Vendas/Entradas
            </CardTitle>
            <CardDescription className="text-base">
              {incomeCategories.length > 0
                ? `${incomeCategories.length} categoria${incomeCategories.length > 1 ? 's' : ''} de venda`
                : 'Nenhuma categoria de venda cadastrada'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoriesList 
              categories={incomeCategories} 
              organizationId={organizationId}
            />
          </CardContent>
        </Card>

        {/* Lista de Categorias - Despesas */}
        <Card className="card-hover shadow-lg border-0 glass-effect border-l-4 border-l-red-500">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 text-white">
                <Tag className="h-5 w-5" />
              </div>
              Gastos/Pagamentos
            </CardTitle>
            <CardDescription className="text-base">
              {expenseCategories.length > 0
                ? `${expenseCategories.length} categoria${expenseCategories.length > 1 ? 's' : ''} de gasto`
                : 'Nenhuma categoria de gasto cadastrada'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoriesList 
              categories={expenseCategories} 
              organizationId={organizationId}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

