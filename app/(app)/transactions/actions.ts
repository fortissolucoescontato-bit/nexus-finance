'use server';

/**
 * Server Actions para gestão de Transações
 * 
 * Implementa CRUD completo para transações financeiras (receitas e despesas)
 */

import { createServerActionClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { createTransactionSchema, updateTransactionSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

/**
 * Cria uma nova transação
 * 
 * @param accountId - ID da conta
 * @param categoryId - ID da categoria (opcional)
 * @param amount - Valor em centavos (positivo para receitas, negativo para despesas)
 * @param date - Data da transação (YYYY-MM-DD)
 * @param description - Descrição (opcional)
 * @param type - Tipo: 'income' ou 'expense'
 * @param status - Status: 'pending' ou 'paid' (padrão: 'paid')
 * @param organizationId - ID da organização
 * @returns Promise<{ success: boolean; error?: string; data?: { id: string } }>
 */
export async function createTransaction(
  accountId: string,
  categoryId: string | undefined,
  amount: number,
  date: string,
  description: string | undefined,
  type: 'income' | 'expense',
  status: 'pending' | 'paid',
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

    // Garante que o valor está no formato correto (centavos)
    // Se for receita, valor positivo; se for despesa, valor negativo
    const amountInCents = type === 'income' ? Math.abs(amount) : -Math.abs(amount);

    // Valida entrada
    const validationResult = createTransactionSchema.safeParse({
      accountId,
      categoryId: categoryId || undefined,
      amount: amountInCents,
      date,
      description: description || undefined,
      type,
      status: status || 'paid',
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

    // Verifica se a conta pertence à organização
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id, organization_id, balance')
      .eq('id', accountId)
      .eq('organization_id', organizationId)
      .single();

    if (accountError || !account) {
      return {
        success: false,
        error: 'Conta não encontrada ou não pertence à organização',
      };
    }

    // Cria a transação
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        account_id: accountId,
        category_id: categoryId || null,
        amount: amountInCents,
        date: validationResult.data.date,
        description: validationResult.data.description || null,
        type: validationResult.data.type,
        status: validationResult.data.status,
        organization_id: organizationId,
      })
      .select('id')
      .single();

    if (transactionError) {
      logger.error('Erro ao criar transação', transactionError);
      return {
        success: false,
        error: transactionError.message || 'Erro ao criar transação',
      };
    }

    // Se a transação está paga, atualiza o saldo da conta
    if (status === 'paid') {
      const newBalance = account.balance + amountInCents;
      const { error: updateBalanceError } = await supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('id', accountId);

      if (updateBalanceError) {
        logger.error('Erro ao atualizar saldo da conta', updateBalanceError);
        // Não falha a criação da transação, apenas loga o erro
      }
    }

    logger.debug('Transação criada com sucesso', { transactionId: transaction.id });

    // Revalida cache
    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    revalidatePath('/accounts');

    return {
      success: true,
      data: { id: transaction.id },
    };
  } catch (error) {
    logger.error('Erro inesperado ao criar transação', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro inesperado ao criar transação',
    };
  }
}

/**
 * Atualiza uma transação existente
 * 
 * @param transactionId - ID da transação
 * @param updates - Campos a atualizar
 * @returns Promise<{ success: boolean; error?: string }>
 */
export async function updateTransaction(
  transactionId: string,
  updates: {
    accountId?: string;
    categoryId?: string | null;
    amount?: number;
    date?: string;
    description?: string | null;
    type?: 'income' | 'expense';
    status?: 'pending' | 'paid';
  }
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

    // Busca a transação atual para obter o valor antigo
    const { data: currentTransaction, error: fetchError } = await supabase
      .from('transactions')
      .select('account_id, amount, status, organization_id, type')
      .eq('id', transactionId)
      .single();

    if (fetchError || !currentTransaction) {
      return {
        success: false,
        error: 'Transação não encontrada',
      };
    }

    // Verifica permissão na organização
    const { data: member, error: memberError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', currentTransaction.organization_id)
      .eq('user_id', user.id)
      .single();

    if (memberError || !member) {
      return {
        success: false,
        error: 'Você não tem acesso a esta transação',
      };
    }

    // Prepara dados para atualização
    const updateData: any = {};
    if (updates.accountId !== undefined) updateData.account_id = updates.accountId;
    if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
    if (updates.date !== undefined) updateData.date = updates.date;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.status !== undefined) updateData.status = updates.status;

    // Se o valor mudou, ajusta para centavos
    if (updates.amount !== undefined) {
      const type = updates.type || currentTransaction.type;
      updateData.amount = type === 'income' ? Math.abs(updates.amount) : -Math.abs(updates.amount);
    }

    // Valida entrada
    const validationResult = updateTransactionSchema.safeParse({
      transactionId,
      ...updateData,
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return {
        success: false,
        error: firstError.message,
      };
    }

    // Atualiza a transação
    const { error: updateError } = await supabase
      .from('transactions')
      .update(updateData)
      .eq('id', transactionId);

    if (updateError) {
      logger.error('Erro ao atualizar transação', updateError);
      return {
        success: false,
        error: updateError.message || 'Erro ao atualizar transação',
      };
    }

    // TODO: Atualizar saldo da conta se necessário (lógica complexa de reverter e aplicar novo valor)

    logger.debug('Transação atualizada com sucesso', { transactionId });

    // Revalida cache
    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    revalidatePath('/accounts');

    return {
      success: true,
    };
  } catch (error) {
    logger.error('Erro inesperado ao atualizar transação', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro inesperado ao atualizar transação',
    };
  }
}

/**
 * Deleta uma transação
 * 
 * @param transactionId - ID da transação
 * @returns Promise<{ success: boolean; error?: string }>
 */
export async function deleteTransaction(
  transactionId: string
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

    // Busca a transação para obter informações da conta
    const { data: transaction, error: fetchError } = await supabase
      .from('transactions')
      .select('account_id, amount, status, organization_id')
      .eq('id', transactionId)
      .single();

    if (fetchError || !transaction) {
      return {
        success: false,
        error: 'Transação não encontrada',
      };
    }

    // Verifica permissão na organização
    const { data: member, error: memberError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', transaction.organization_id)
      .eq('user_id', user.id)
      .single();

    if (memberError || !member) {
      return {
        success: false,
        error: 'Você não tem acesso a esta transação',
      };
    }

    // Se a transação estava paga, reverte o saldo da conta
    if (transaction.status === 'paid') {
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('balance')
        .eq('id', transaction.account_id)
        .single();

      if (!accountError && account) {
        const newBalance = account.balance - transaction.amount; // Reverte o valor
        await supabase
          .from('accounts')
          .update({ balance: newBalance })
          .eq('id', transaction.account_id);
      }
    }

    // Deleta a transação
    const { error: deleteError } = await supabase
      .from('transactions')
      .delete()
      .eq('id', transactionId);

    if (deleteError) {
      logger.error('Erro ao deletar transação', deleteError);
      return {
        success: false,
        error: deleteError.message || 'Erro ao deletar transação',
      };
    }

    logger.debug('Transação deletada com sucesso', { transactionId });

    // Revalida cache
    revalidatePath('/transactions');
    revalidatePath('/dashboard');
    revalidatePath('/accounts');

    return {
      success: true,
    };
  } catch (error) {
    logger.error('Erro inesperado ao deletar transação', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro inesperado ao deletar transação',
    };
  }
}

