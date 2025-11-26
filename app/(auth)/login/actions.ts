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

/**
 * Realiza o login do usuário usando email e senha
 * 
 * @param formData - FormData contendo email e password do formulário
 * @returns Promise<void> - Redireciona automaticamente após login
 */
export async function login(formData: FormData): Promise<void> {
  try {
    // Extrai os dados do formulário
    // FormData.get() retorna string | null, então precisamos validar
    const email = formData.get('email');
    const password = formData.get('password');

    // Validação básica (Confiança Zero - sempre validar entrada do usuário)
    // Aqui fazemos validação simples, mas em produção você pode usar Zod para validação mais robusta
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      // Email inválido - redireciona de volta para login com erro
      redirect('/login?error=Email inválido');
    }

    if (!password || typeof password !== 'string' || password.length < 6) {
      // Senha muito curta - redireciona de volta para login com erro
      redirect('/login?error=Senha deve ter pelo menos 6 caracteres');
    }

    // Cria o cliente Supabase para Server Actions
    // Este cliente gerencia os cookies de autenticação automaticamente
    const supabase = await createServerActionClient();

    // Tenta autenticar o usuário no Supabase
    // signInWithPassword é o método seguro para login com email/senha
    const { error, data } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(), // Normaliza o email (lowercase e trim)
      password: password,
    });

    // Verifica se houve erro na autenticação
    if (error) {
      // Erro de autenticação (credenciais inválidas, usuário não encontrado, etc.)
      // Redireciona de volta para login com mensagem de erro amigável
      redirect(`/login?error=${encodeURIComponent(error.message || 'Credenciais inválidas')}`);
    }

    // Verifica se a autenticação foi bem-sucedida
    if (!data.user) {
      // Caso raro onde não há erro mas também não há usuário
      redirect('/login?error=Erro ao fazer login. Tente novamente.');
    }

    // Login bem-sucedido!
    // Revalida o cache do Next.js para garantir que dados atualizados sejam buscados
    revalidatePath('/dashboard');
    
    // Redireciona para o dashboard
    // O middleware garantirá que o usuário tem acesso à rota protegida
    redirect('/dashboard');
  } catch (error) {
    // Tratamento de erro genérico para qualquer exceção não esperada
    // Log do erro seria feito aqui em produção
    console.error('Erro no login:', error);
    
    // Redireciona com mensagem de erro genérica
    redirect('/login?error=Erro inesperado. Tente novamente.');
  }
}

