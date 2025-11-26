'use server';

/**
 * Server Action para realizar login de usuários
 * 
 * Esta Server Action:
 * 1. Valida os dados de entrada (email e senha)
 * 2. Tenta autenticar o usuário no Supabase
 * 3. Redireciona para o dashboard em caso de sucesso
 * 4. Redireciona de volta para /login com erro em caso de falha
 * 
 * IMPORTANTE: Server Actions são a forma recomendada de fazer mutations no Next.js 15
 * Nunca use API Routes para operações simples de CRUD ou autenticação
 */

import { createServerActionClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { loginSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

/**
 * Realiza o login do usuário usando email e senha
 * 
 * @param formData - FormData contendo email e password do formulário
 * @returns Promise<void> - Redireciona automaticamente após login
 */
export async function login(formData: FormData): Promise<void> {
  try {
    // Extrai os dados do formulário
    const email = formData.get('email');
    const password = formData.get('password');

    // Validação com Zod
    const validationResult = loginSchema.safeParse({
      email: email || '',
      password: password || '',
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      redirect(`/login?error=${encodeURIComponent(firstError.message)}`);
      return;
    }

    const { email: validatedEmail, password: validatedPassword } = validationResult.data;

    // Cria o cliente Supabase para Server Actions
    // Este cliente gerencia os cookies de autenticação automaticamente
    const supabase = await createServerActionClient();

    // Tenta autenticar o usuário no Supabase
    // signInWithPassword é o método seguro para login com email/senha
    const { error, data } = await supabase.auth.signInWithPassword({
      email: validatedEmail, // Já validado e normalizado pelo Zod
      password: validatedPassword,
    });

    // Log detalhado para depuração (apenas em desenvolvimento)
    logger.debug('Resultado do login', {
      hasError: !!error,
      errorMessage: error?.message,
      errorStatus: error?.status,
      hasUser: !!data?.user,
      userEmail: data?.user?.email,
      userConfirmed: data?.user?.email_confirmed_at ? 'Sim' : 'Não',
    });

    // Verifica se houve erro na autenticação
    if (error) {
      // Log do erro
      logger.error('Erro no login do Supabase', {
        message: error.message,
        status: error.status,
        name: error.name,
      });
      
      // Tratamento específico para erro de email não confirmado
      if (
        error.message?.includes('Email not confirmed') ||
        error.message?.includes('email not confirmed') ||
        error.status === 400
      ) {
        redirect('/login?error=Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada.');
        return;
      }
      
      // Erro de autenticação (credenciais inválidas, usuário não encontrado, etc.)
      // Redireciona de volta para login com mensagem de erro amigável
      redirect(`/login?error=${encodeURIComponent(error.message || 'Credenciais inválidas')}`);
      return;
    }

    // Verifica se a autenticação foi bem-sucedida
    if (!data.user) {
      // Caso raro onde não há erro mas também não há usuário
      logger.error('Login sem erro mas sem usuário retornado');
      redirect('/login?error=Erro ao fazer login. Tente novamente.');
      return;
    }
    
    // Verifica se o email foi confirmado (se a confirmação estiver habilitada)
    // Nota: Em desenvolvimento, você pode desativar a confirmação de email
    if (!data.user.email_confirmed_at) {
      logger.warn('Usuário tentou fazer login mas email não foi confirmado', {
        email: data.user.email,
      });
      // Não bloqueia o login, mas registra o aviso
      // Se você quiser bloquear, descomente a linha abaixo:
      // redirect('/login?error=Por favor, confirme seu email antes de fazer login.');
    }

    // Login bem-sucedido!
    // Revalida o cache do Next.js para garantir que dados atualizados sejam buscados
    revalidatePath('/dashboard');
    
    // Redireciona para o dashboard
    // O middleware garantirá que o usuário tem acesso à rota protegida
    redirect('/dashboard');
  } catch (error) {
    // Verifica se o erro é um redirect do Next.js
    // redirect() lança uma exceção especial (NEXT_REDIRECT) que não deve ser tratada como erro
    // Se for um redirect, re-lança o erro para que o Next.js processe corretamente
    if (
      error &&
      typeof error === 'object' &&
      'digest' in error &&
      typeof error.digest === 'string' &&
      error.digest.includes('NEXT_REDIRECT')
    ) {
      // Erro do tipo NEXT_REDIRECT - re-lança para que o Next.js processe o redirect
      throw error;
    }
    
    // Tratamento de erro genérico para qualquer exceção não esperada
    logger.error('Erro inesperado no login', error);
    
    // Extrai mensagem de erro mais específica se possível
    let errorMessage = 'Erro inesperado. Tente novamente.';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (error && typeof error === 'object' && 'message' in error) {
      errorMessage = String(error.message);
    }
    
    // Verifica se o erro é relacionado a variáveis de ambiente do Supabase
    if (
      errorMessage.includes('Variáveis de ambiente') ||
      errorMessage.includes('NEXT_PUBLIC_SUPABASE') ||
      errorMessage.includes('Supabase')
    ) {
      redirect('/login?error=Configuração do servidor incorreta. Entre em contato com o suporte.');
      return;
    }
    
    // Verifica se é erro de confirmação de email
    if (
      errorMessage.includes('Email not confirmed') ||
      errorMessage.includes('email not confirmed') ||
      errorMessage.includes('confirmation')
    ) {
      redirect('/login?error=Por favor, confirme seu email antes de fazer login. Verifique sua caixa de entrada.');
      return;
    }
    
    // Redireciona com mensagem de erro mais específica para o usuário
    // Limita o tamanho da mensagem para evitar URLs muito longas
    const safeMessage = errorMessage.length > 100 
      ? 'Erro ao processar a solicitação. Verifique os dados e tente novamente.'
      : errorMessage;
      
    redirect(`/login?error=${encodeURIComponent(safeMessage)}`);
  }
}

