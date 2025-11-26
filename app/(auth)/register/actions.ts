'use server';

/**
 * Server Action para realizar registro de novos usuários
 * 
 * Esta Server Action:
 * 1. Valida os dados de entrada (nome, email e senha)
 * 2. Tenta criar o usuário no Supabase
 * 3. Salva o full_name nos metadados do usuário
 * 4. Redireciona para o dashboard em caso de sucesso
 * 5. Redireciona de volta para /register com erro em caso de falha
 * 
 * IMPORTANTE: Server Actions são a forma recomendada de fazer mutations no Next.js 15
 * Nunca use API Routes para operações simples de CRUD ou autenticação
 */

import { createServerActionClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { registerSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';

/**
 * Realiza o registro de um novo usuário usando nome, email e senha
 * 
 * @param formData - FormData contendo fullName, email e password do formulário
 * @returns Promise<void> - Redireciona automaticamente após registro
 */
export async function signup(formData: FormData): Promise<void> {
  try {
    // Extrai os dados do formulário
    const fullName = formData.get('fullName');
    const email = formData.get('email');
    const password = formData.get('password');

    // Validação com Zod
    const validationResult = registerSchema.safeParse({
      fullName: fullName || '',
      email: email || '',
      password: password || '',
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      redirect(`/register?error=${encodeURIComponent(firstError.message)}`);
      return;
    }

    const { fullName: validatedFullName, email: validatedEmail, password: validatedPassword } = validationResult.data;

    // Validação prévia das variáveis de ambiente do Supabase
    // Isso evita erros mais tarde e fornece mensagens de erro mais claras
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Variáveis de ambiente do Supabase não configuradas');
      redirect('/register?error=Configuração do servidor incorreta. Entre em contato com o suporte.');
    }

    // Cria o cliente Supabase para Server Actions
    // Este cliente gerencia os cookies de autenticação automaticamente
    const supabase = await createServerActionClient();

    // Tenta criar o usuário no Supabase
    // signUp é o método para criar novos usuários com email/senha
    // Os metadados são salvos automaticamente no campo user_metadata
    const signUpResult = await supabase.auth.signUp({
      email: validatedEmail, // Já validado e normalizado pelo Zod
      password: validatedPassword,
      options: {
        // Salva o nome completo nos metadados do usuário
        // Esses dados ficam disponíveis em user.user_metadata.full_name
        data: {
          full_name: validatedFullName, // Já validado e trimado pelo Zod
        },
        // Configuração de email (ajuste conforme sua configuração do Supabase)
        // Se emailRedirectTo não for fornecido, o Supabase usará a URL padrão
      },
    });

    // Extrai error e data do resultado
    const { error, data } = signUpResult;

    // Log do resultado para depuração (apenas em desenvolvimento)
    logger.debug('Resultado do signUp', {
      hasError: !!error,
      errorMessage: error?.message,
      hasUser: !!data?.user,
      userEmail: data?.user?.email,
    });

    // Verifica se houve erro no registro
    if (error) {
      // Log do erro
      logger.error('Erro no signUp do Supabase', {
        message: error.message,
        status: error.status,
        name: error.name,
      });
      
      // Tratamento específico para erro de banco de dados
      // Isso geralmente acontece se a tabela de perfis ou trigger não existirem
      const errorMessage = error.message || '';
      let userFriendlyMessage = error.message || 'Erro ao criar conta. Tente novamente.';
      
      // Verifica se é erro relacionado ao banco de dados
      if (
        errorMessage.includes('Database error') ||
        errorMessage.includes('saving new user') ||
        errorMessage.includes('permission denied') ||
        errorMessage.includes('relation') ||
        errorMessage.includes('does not exist')
      ) {
        userFriendlyMessage = 'Erro de configuração do banco de dados. Verifique se a tabela de perfis foi criada. Veja o arquivo supabase/README.md para instruções.';
        logger.error('ERRO CRÍTICO: A tabela de perfis pode não existir ou o trigger não está configurado corretamente.', {
          migrationFile: 'supabase/migrations/001_create_profiles_table.sql',
        });
      }
      
      // Erro de registro (email já existe, senha inválida, etc.)
      // Redireciona de volta para registro com mensagem de erro amigável
      redirect(`/register?error=${encodeURIComponent(userFriendlyMessage)}`);
    }

    // Verifica se o usuário foi criado com sucesso
    if (!data.user) {
      // Caso raro onde não há erro mas também não há usuário
      redirect('/register?error=Erro ao criar conta. Tente novamente.');
    }

    // Registro bem-sucedido!
    // Revalida o cache do Next.js para garantir que dados atualizados sejam buscados
    revalidatePath('/dashboard');
    
    // Redireciona para o dashboard
    // O middleware garantirá que o usuário tem acesso à rota protegida
    // Nota: Se o Supabase estiver configurado para exigir confirmação de email,
    // o usuário pode precisar confirmar o email antes de acessar o dashboard
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
    logger.error('Erro inesperado no registro', error);
    
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
      redirect('/register?error=Configuração do servidor incorreta. Entre em contato com o suporte.');
      return;
    }
    
    // Redireciona com mensagem de erro mais específica para o usuário
    // Limita o tamanho da mensagem para evitar URLs muito longas
    const safeMessage = errorMessage.length > 100 
      ? 'Erro ao processar a solicitação. Verifique os dados e tente novamente.'
      : errorMessage;
      
    redirect(`/register?error=${encodeURIComponent(safeMessage)}`);
  }
}

