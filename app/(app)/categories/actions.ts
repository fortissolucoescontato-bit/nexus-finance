'use server';

/**
 * Server Actions para gestão de Categorias
 * 
 * Implementa CRUD completo para categorias de transações (receitas e despesas)
 */

import { createServerActionClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { createCategorySchema, updateCategorySchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

/**
 * Cria uma nova categoria
 * 
 * @param name - Nome da categoria
 * @param type - Tipo: 'income' ou 'expense'
 * @param organizationId - ID da organização
 * @param icon - Nome do ícone (opcional)
 * @returns Promise<{ success: boolean; error?: string; data?: { id: string } }>
 */
export async function createCategory(
  name: string,
  type: 'income' | 'expense',
  organizationId: string,
  icon?: string
): Promise<{ success: boolean; error?: string; data?: { id: string } }> {
  try {
    const supabase = await createServerActionClient();

    // Verifica autenticação
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: 'Usuário não autenticado',
      };
    }

    // Valida entrada
    const validationResult = createCategorySchema.safeParse({
      name,
      type,
      organizationId,
      icon: icon || undefined,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return {
        success: false,
        error: firstError.message,
      };
    }

    // Verifica se o usuário tem acesso à organização
    const { data: member, error: memberError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .single();

    if (memberError || !member) {
      return {
        success: false,
        error: 'Você não tem acesso a esta organização',
      };
    }

    // Cria a categoria
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .insert({
        name: validationResult.data.name,
        type: validationResult.data.type,
        organization_id: organizationId,
        icon: validationResult.data.icon || null,
      })
      .select('id')
      .single();

    if (categoryError) {
      logger.error('Erro ao criar categoria', categoryError);
      return {
        success: false,
        error: categoryError.message || 'Erro ao criar categoria',
      };
    }

    logger.debug('Categoria criada com sucesso', { categoryId: category.id });

    // Revalida cache
    revalidatePath('/categories');
    revalidatePath('/dashboard');

    return {
      success: true,
      data: { id: category.id },
    };
  } catch (error) {
    logger.error('Erro inesperado ao criar categoria', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro inesperado ao criar categoria',
    };
  }
}

/**
 * Atualiza uma categoria existente
 * 
 * @param categoryId - ID da categoria
 * @param updates - Campos a atualizar
 * @returns Promise<{ success: boolean; error?: string }>
 */
export async function updateCategory(
  categoryId: string,
  updates: { name?: string; type?: 'income' | 'expense'; icon?: string | null }
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerActionClient();

    // Verifica autenticação
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: 'Usuário não autenticado',
      };
    }

    // Valida entrada
    const validationResult = updateCategorySchema.safeParse({
      categoryId,
      ...updates,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return {
        success: false,
        error: firstError.message,
      };
    }

    // Verifica se o usuário tem acesso à categoria (via organização)
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('organization_id')
      .eq('id', categoryId)
      .single();

    if (categoryError || !category) {
      return {
        success: false,
        error: 'Categoria não encontrada',
      };
    }

    // Verifica permissão na organização
    const { data: member, error: memberError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', category.organization_id)
      .eq('user_id', user.id)
      .single();

    if (memberError || !member) {
      return {
        success: false,
        error: 'Você não tem acesso a esta categoria',
      };
    }

    // Atualiza a categoria
    const updateData: { name?: string; type?: string; icon?: string | null } = {};
    if (validationResult.data.name !== undefined) {
      updateData.name = validationResult.data.name;
    }
    if (validationResult.data.type !== undefined) {
      updateData.type = validationResult.data.type;
    }
    if (validationResult.data.icon !== undefined) {
      updateData.icon = validationResult.data.icon;
    }

    const { error: updateError } = await supabase
      .from('categories')
      .update(updateData)
      .eq('id', categoryId);

    if (updateError) {
      logger.error('Erro ao atualizar categoria', updateError);
      return {
        success: false,
        error: updateError.message || 'Erro ao atualizar categoria',
      };
    }

    logger.debug('Categoria atualizada com sucesso', { categoryId });

    // Revalida cache
    revalidatePath('/categories');
    revalidatePath('/dashboard');

    return {
      success: true,
    };
  } catch (error) {
    logger.error('Erro inesperado ao atualizar categoria', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro inesperado ao atualizar categoria',
    };
  }
}

/**
 * Deleta uma categoria
 * 
 * @param categoryId - ID da categoria
 * @returns Promise<{ success: boolean; error?: string }>
 */
export async function deleteCategory(
  categoryId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createServerActionClient();

    // Verifica autenticação
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: 'Usuário não autenticado',
      };
    }

    // Verifica se o usuário tem acesso à categoria (via organização)
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('organization_id')
      .eq('id', categoryId)
      .single();

    if (categoryError || !category) {
      return {
        success: false,
        error: 'Categoria não encontrada',
      };
    }

    // Verifica permissão na organização (apenas owner pode deletar)
    const { data: member, error: memberError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', category.organization_id)
      .eq('user_id', user.id)
      .eq('role', 'owner')
      .single();

    if (memberError || !member) {
      return {
        success: false,
        error: 'Apenas o dono da organização pode deletar categorias',
      };
    }

    // Deleta a categoria
    const { error: deleteError } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (deleteError) {
      logger.error('Erro ao deletar categoria', deleteError);
      return {
        success: false,
        error: deleteError.message || 'Erro ao deletar categoria',
      };
    }

    logger.debug('Categoria deletada com sucesso', { categoryId });

    // Revalida cache
    revalidatePath('/categories');
    revalidatePath('/dashboard');

    return {
      success: true,
    };
  } catch (error) {
    logger.error('Erro inesperado ao deletar categoria', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro inesperado ao deletar categoria',
    };
  }
}

