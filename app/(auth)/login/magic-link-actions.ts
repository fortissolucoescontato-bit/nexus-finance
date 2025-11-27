'use server';

/**
 * Server Action para enviar link mágico
 * 
 * Envia um email com link para login sem senha
 */

import { createServerActionClient } from '@/utils/supabase/server';
import { emailSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

/**
 * Envia link mágico para login sem senha
 * 
 * @param formData - FormData contendo email
 * @returns Promise<void>
 */
export async function sendMagicLink(formData: FormData): Promise<void> {
  const email = formData.get('email');

  // Validação com Zod
  const validationResult = emailSchema.safeParse(email || '');

  if (!validationResult.success) {
    const firstError = validationResult.error.errors[0];
    throw new Error(firstError.message);
  }

  const validatedEmail = validationResult.data;

  // Cria o cliente Supabase
  const supabase = await createServerActionClient();

  // Envia link mágico
  // O Supabase enviará um email com link para login direto
  const { error } = await supabase.auth.signInWithOtp({
    email: validatedEmail,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
    },
  });

  if (error) {
    logger.error('Erro ao enviar link mágico', error);
    throw new Error(error.message || 'Erro ao enviar link mágico');
  }

  logger.debug('Link mágico enviado', { email: validatedEmail });
}

