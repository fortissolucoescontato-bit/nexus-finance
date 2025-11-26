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

/**
 * Realiza o registro de um novo usuário usando nome, email e senha
 * 
 * @param formData - FormData contendo fullName, email e password do formulário
 * @returns Promise<void> - Redireciona automaticamente após registro
 */
export async function signup(formData: FormData): Promise<void> {
  try {
    // Extrai os dados do formulário
    // FormData.get() retorna string | null, então precisamos validar
    const fullName = formData.get('fullName');
    const email = formData.get('email');
    const password = formData.get('password');

    // Validação básica (Confiança Zero - sempre validar entrada do usuário)
    // Validação do nome completo
    if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
      // Nome muito curto - redireciona de volta para registro com erro
      redirect('/register?error=Nome deve ter pelo menos 2 caracteres');
    }

    // Validação do email
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      // Email inválido - redireciona de volta para registro com erro
      redirect('/register?error=Email inválido');
    }

    // Validação da senha
    if (!password || typeof password !== 'string' || password.length < 6) {
      // Senha muito curta - redireciona de volta para registro com erro
      redirect('/register?error=Senha deve ter pelo menos 6 caracteres');
    }

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
      email: email.trim().toLowerCase(), // Normaliza o email (lowercase e trim)
      password: password,
      options: {
        // Salva o nome completo nos metadados do usuário
        // Esses dados ficam disponíveis em user.user_metadata.full_name
        data: {
          full_name: fullName.trim(), // Remove espaços extras e salva o nome
        },
        // Configuração de email (ajuste conforme sua configuração do Supabase)
        // Se emailRedirectTo não for fornecido, o Supabase usará a URL padrão
      },
    });

    // Extrai error e data do resultado
    const { error, data } = signUpResult;

    // Log do resultado para depuração (remove em produção se necessário)
    console.log('Resultado do signUp:', {
      hasError: !!error,
      errorMessage: error?.message,
      hasUser: !!data?.user,
      userEmail: data?.user?.email,
    });

    // Verifica se houve erro no registro
    if (error) {
      // Log do erro para depuração
      console.error('Erro no signUp do Supabase:', {
        message: error.message,
        status: error.status,
        name: error.name,
      });
      
      // Erro de registro (email já existe, senha inválida, etc.)
      // Redireciona de volta para registro com mensagem de erro amigável
      const errorMsg = error.message || 'Erro ao criar conta. Tente novamente.';
      redirect(`/register?error=${encodeURIComponent(errorMsg)}`);
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
    // Log detalhado do erro para depuração (visível no console do servidor)
    console.error('Erro no registro:', error);
    console.error('Tipo do erro:', typeof error);
    console.error('Erro completo:', JSON.stringify(error, null, 2));
    
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

