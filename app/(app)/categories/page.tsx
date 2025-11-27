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
                <Tag className="h-8 w-8" aria-hidden="true" />
                Categorias
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gerencie suas categorias de receitas e despesas
              </p>
            </div>
          </div>
        </div>

        {/* Formulário de Criação */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" aria-hidden="true" />
              Nova Categoria
            </CardTitle>
            <CardDescription>
              Adicione uma nova categoria à sua organização
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CreateCategoryForm organizationId={organizationId} />
          </CardContent>
        </Card>

        {/* Lista de Categorias - Receitas */}
        <Card>
          <CardHeader>
            <CardTitle>Receitas</CardTitle>
            <CardDescription>
              {incomeCategories.length > 0
                ? `${incomeCategories.length} categoria${incomeCategories.length > 1 ? 's' : ''} de receita`
                : 'Nenhuma categoria de receita cadastrada'}
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
        <Card>
          <CardHeader>
            <CardTitle>Despesas</CardTitle>
            <CardDescription>
              {expenseCategories.length > 0
                ? `${expenseCategories.length} categoria${expenseCategories.length > 1 ? 's' : ''} de despesa`
                : 'Nenhuma categoria de despesa cadastrada'}
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

