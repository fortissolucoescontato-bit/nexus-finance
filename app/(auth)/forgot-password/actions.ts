'use server';

/**
 * Server Action para recuperação de senha
 * 
 * Envia um email com link mágico para redefinir a senha
 */

import { createServerActionClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { emailSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

/**
 * Envia email de recuperação de senha
 * 
 * @param formData - FormData contendo email
 * @returns Promise<void> - Redireciona com mensagem de sucesso ou erro
 */
export async function forgotPassword(formData: FormData): Promise<void> {
  try {
    const email = formData.get('email');

    // Validação com Zod
    const validationResult = emailSchema.safeParse(email || '');

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      redirect(`/forgot-password?error=${encodeURIComponent(firstError.message)}`);
      return;
    }

    const validatedEmail = validationResult.data;

    // Cria o cliente Supabase
    const supabase = await createServerActionClient();

    // Envia email de recuperação de senha
    // O Supabase enviará um email com link para redefinir a senha
    const { error } = await supabase.auth.resetPasswordForEmail(validatedEmail, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password`,
    });

    if (error) {
      logger.error('Erro ao enviar email de recuperação', error);
      
      // Não revela se o email existe ou não por segurança
      // Sempre mostra mensagem de sucesso para não expor informações
      redirect('/forgot-password?success=Se o email estiver cadastrado, você receberá um link de recuperação em breve.');
      return;
    }

    // Sucesso - sempre mostra mensagem genérica por segurança
    logger.debug('Email de recuperação enviado', { email: validatedEmail });
    redirect('/forgot-password?success=Se o email estiver cadastrado, você receberá um link de recuperação em breve.');
  } catch (error) {
    logger.error('Erro inesperado ao enviar email de recuperação', error);
    
    // Verifica se é um redirect
    if (
      error &&
      typeof error === 'object' &&
      'digest' in error &&
      typeof error.digest === 'string' &&
      error.digest.includes('NEXT_REDIRECT')
    ) {
      throw error;
    }
    
    redirect('/forgot-password?success=Se o email estiver cadastrado, você receberá um link de recuperação em breve.');
  }
}

