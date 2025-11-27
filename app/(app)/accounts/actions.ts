'use server';

/**
 * Server Actions para gestão de Contas
 * 
 * Implementa CRUD completo para contas financeiras (bancárias, dinheiro, cartões)
 */

import { createServerActionClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { createAccountSchema, updateAccountSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

/**
 * Cria uma nova conta
 * 
 * @param name - Nome da conta
 * @param type - Tipo: 'bank', 'cash' ou 'credit'
 * @param organizationId - ID da organização
 * @returns Promise<{ success: boolean; error?: string; data?: { id: string } }>
 */
export async function createAccount(
  name: string,
  type: 'bank' | 'cash' | 'credit',
  organizationId: string
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
    const validationResult = createAccountSchema.safeParse({
      name,
      type,
      organizationId,
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

    // Cria a conta
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .insert({
        name: validationResult.data.name,
        type: validationResult.data.type,
        organization_id: organizationId,
        balance: 0, // Saldo inicial sempre zero
      })
      .select('id')
      .single();

    if (accountError) {
      logger.error('Erro ao criar conta', accountError);
      return {
        success: false,
        error: accountError.message || 'Erro ao criar conta',
      };
    }

    logger.debug('Conta criada com sucesso', { accountId: account.id });

    // Revalida cache
    revalidatePath('/accounts');
    revalidatePath('/dashboard');

    return {
      success: true,
      data: { id: account.id },
    };
  } catch (error) {
    logger.error('Erro inesperado ao criar conta', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro inesperado ao criar conta',
    };
  }
}

/**
 * Atualiza uma conta existente
 * 
 * @param accountId - ID da conta
 * @param updates - Campos a atualizar
 * @returns Promise<{ success: boolean; error?: string }>
 */
export async function updateAccount(
  accountId: string,
  updates: { name?: string; type?: 'bank' | 'cash' | 'credit' }
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
    const validationResult = updateAccountSchema.safeParse({
      accountId,
      ...updates,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return {
        success: false,
        error: firstError.message,
      };
    }

    // Verifica se o usuário tem acesso à conta (via organização)
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('organization_id')
      .eq('id', accountId)
      .single();

    if (accountError || !account) {
      return {
        success: false,
        error: 'Conta não encontrada',
      };
    }

    // Verifica permissão na organização
    const { data: member, error: memberError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', account.organization_id)
      .eq('user_id', user.id)
      .single();

    if (memberError || !member) {
      return {
        success: false,
        error: 'Você não tem acesso a esta conta',
      };
    }

    // Atualiza a conta
    const updateData: { name?: string; type?: string } = {};
    if (validationResult.data.name !== undefined) {
      updateData.name = validationResult.data.name;
    }
    if (validationResult.data.type !== undefined) {
      updateData.type = validationResult.data.type;
    }

    const { error: updateError } = await supabase
      .from('accounts')
      .update(updateData)
      .eq('id', accountId);

    if (updateError) {
      logger.error('Erro ao atualizar conta', updateError);
      return {
        success: false,
        error: updateError.message || 'Erro ao atualizar conta',
      };
    }

    logger.debug('Conta atualizada com sucesso', { accountId });

    // Revalida cache
    revalidatePath('/accounts');
    revalidatePath('/dashboard');

    return {
      success: true,
    };
  } catch (error) {
    logger.error('Erro inesperado ao atualizar conta', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro inesperado ao atualizar conta',
    };
  }
}

/**
 * Deleta uma conta
 * 
 * @param accountId - ID da conta
 * @returns Promise<{ success: boolean; error?: string }>
 */
export async function deleteAccount(
  accountId: string
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

    // Verifica se o usuário tem acesso à conta (via organização)
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('organization_id')
      .eq('id', accountId)
      .single();

    if (accountError || !account) {
      return {
        success: false,
        error: 'Conta não encontrada',
      };
    }

    // Verifica permissão na organização (apenas owner pode deletar)
    const { data: member, error: memberError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', account.organization_id)
      .eq('user_id', user.id)
      .eq('role', 'owner')
      .single();

    if (memberError || !member) {
      return {
        success: false,
        error: 'Apenas o dono da organização pode deletar contas',
      };
    }

    // Deleta a conta
    const { error: deleteError } = await supabase
      .from('accounts')
      .delete()
      .eq('id', accountId);

    if (deleteError) {
      logger.error('Erro ao deletar conta', deleteError);
      return {
        success: false,
        error: deleteError.message || 'Erro ao deletar conta',
      };
    }

    logger.debug('Conta deletada com sucesso', { accountId });

    // Revalida cache
    revalidatePath('/accounts');
    revalidatePath('/dashboard');

    return {
      success: true,
    };
  } catch (error) {
    logger.error('Erro inesperado ao deletar conta', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro inesperado ao deletar conta',
    };
  }
}

