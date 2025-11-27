'use server';

/**
 * Server Actions para Configurações
 * 
 * Server Actions para atualizar informações do perfil do usuário.
 */

import { createServerActionClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { logger } from '@/lib/logger';
import { z } from 'zod';

/**
 * Schema de validação para atualização de perfil
 */
const updateProfileSchema = z.object({
  fullName: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  email: z.string().email('Email inválido').optional(),
});

/**
 * Atualiza o perfil do usuário
 * 
 * @param fullName - Nome completo do usuário
 * @returns Promise<{ success: boolean; error?: string }>
 */
export async function updateProfile(
  fullName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Cria o cliente Supabase para Server Actions
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

    // Valida o nome
    const validationResult = updateProfileSchema.safeParse({
      fullName: fullName || '',
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return {
        success: false,
        error: firstError.message,
      };
    }

    // Atualiza o perfil na tabela profiles
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        full_name: validationResult.data.fullName.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    if (updateError) {
      logger.error('Erro ao atualizar perfil', updateError);
      return {
        success: false,
        error: updateError.message || 'Erro ao atualizar perfil',
      };
    }

    logger.debug('Perfil atualizado com sucesso', { userId: user.id });

    // Revalida o cache para atualizar dados exibidos
    revalidatePath('/settings');
    revalidatePath('/dashboard');

    return {
      success: true,
    };
  } catch (error) {
    logger.error('Erro inesperado ao atualizar perfil', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro inesperado ao atualizar perfil',
    };
  }
}

/**
 * Atualiza o email do usuário (via Supabase Auth)
 * 
 * @param newEmail - Novo email do usuário
 * @returns Promise<{ success: boolean; error?: string }>
 */
export async function updateEmail(
  newEmail: string
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

    // Valida o email
    if (!z.string().email().safeParse(newEmail).success) {
      return {
        success: false,
        error: 'Email inválido',
      };
    }

    // Atualiza o email via Supabase Auth
    const { error: updateError } = await supabase.auth.updateUser({
      email: newEmail.trim(),
    });

    if (updateError) {
      logger.error('Erro ao atualizar email', updateError);
      return {
        success: false,
        error: updateError.message || 'Erro ao atualizar email',
      };
    }

    // Atualiza também na tabela profiles
    await supabase
      .from('profiles')
      .update({
        email: newEmail.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    logger.debug('Email atualizado com sucesso', { userId: user.id });

    revalidatePath('/settings');
    revalidatePath('/dashboard');

    return {
      success: true,
    };
  } catch (error) {
    logger.error('Erro inesperado ao atualizar email', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro inesperado ao atualizar email',
    };
  }
}

