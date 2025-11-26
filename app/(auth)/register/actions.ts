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
 * @param formData - FormData contendo full_name, email e password do formulário
 * @returns Promise<void> - Redireciona automaticamente após registro
 */
export async function signup(formData: FormData): Promise<void> {
  try {
    // Extrai os dados do formulário
    // FormData.get() retorna string | null, então precisamos validar
    const fullName = formData.get('full_name');
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

    // Cria o cliente Supabase para Server Actions
    // Este cliente gerencia os cookies de autenticação automaticamente
    const supabase = await createServerActionClient();

    // Tenta criar o usuário no Supabase
    // signUp é o método para criar novos usuários com email/senha
    // Os metadados são salvos automaticamente no campo user_metadata
    const { error, data } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(), // Normaliza o email (lowercase e trim)
      password: password,
      options: {
        // Salva o nome completo nos metadados do usuário
        // Esses dados ficam disponíveis em user.user_metadata.full_name
        data: {
          full_name: fullName.trim(), // Remove espaços extras e salva o nome
        },
      },
    });

    // Verifica se houve erro no registro
    if (error) {
      // Erro de registro (email já existe, senha inválida, etc.)
      // Redireciona de volta para registro com mensagem de erro amigável
      redirect(`/register?error=${encodeURIComponent(error.message || 'Erro ao criar conta. Tente novamente.')}`);
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
    // Tratamento de erro genérico para qualquer exceção não esperada
    // Log do erro seria feito aqui em produção
    console.error('Erro no registro:', error);
    
    // Redireciona com mensagem de erro genérica
    redirect('/register?error=Erro inesperado. Tente novamente.');
  }
}

