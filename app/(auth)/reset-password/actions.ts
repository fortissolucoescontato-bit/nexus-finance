'use server';

/**
 * Server Action para redefinir senha
 * 
 * Atualiza a senha do usuário após validação do código do email
 */

import { createServerActionClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { passwordSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

/**
 * Redefine a senha do usuário
 * 
 * @param formData - FormData contendo password, confirmPassword e code
 * @returns Promise<void> - Redireciona com mensagem de sucesso ou erro
 */
export async function resetPassword(formData: FormData): Promise<void> {
  try {
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const code = formData.get('code');

    // Valida código
    if (!code || typeof code !== 'string') {
      redirect('/reset-password?error=Código de recuperação inválido');
      return;
    }

    // Valida senha
    const passwordValidation = passwordSchema.safeParse(password || '');

    if (!passwordValidation.success) {
      const firstError = passwordValidation.error.errors[0];
      redirect(`/reset-password?error=${encodeURIComponent(firstError.message)}&code=${code}`);
      return;
    }

    // Verifica se as senhas coincidem
    if (password !== confirmPassword) {
      redirect(`/reset-password?error=${encodeURIComponent('As senhas não coincidem')}&code=${code}`);
      return;
    }

    const validatedPassword = passwordValidation.data;

    // Cria o cliente Supabase
    const supabase = await createServerActionClient();

    // Atualiza a senha usando o código do email
    // O código vem do link do email de recuperação
    const { error } = await supabase.auth.updateUser({
      password: validatedPassword,
    });

    if (error) {
      logger.error('Erro ao redefinir senha', error);
      redirect(`/reset-password?error=${encodeURIComponent(error.message || 'Erro ao redefinir senha')}&code=${code}`);
      return;
    }

    // Sucesso - redireciona para login com mensagem de sucesso
    logger.debug('Senha redefinida com sucesso');
    redirect('/login?success=Senha redefinida com sucesso! Faça login com sua nova senha.');
  } catch (error) {
    logger.error('Erro inesperado ao redefinir senha', error);
    
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
    
    const code = formData.get('code');
    redirect(`/reset-password?error=${encodeURIComponent('Erro inesperado. Tente novamente.')}&code=${code || ''}`);
  }
}

