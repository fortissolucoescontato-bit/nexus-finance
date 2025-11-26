'use server';

/**
 * Server Action para realizar logout de usuários
 * 
 * Esta Server Action:
 * 1. Desconecta o usuário do Supabase
 * 2. Limpa os cookies de sessão
 * 3. Redireciona para a página de login
 * 
 * IMPORTANTE: Server Actions são a forma recomendada de fazer mutations no Next.js 15
 */

import { createServerActionClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

/**
 * Realiza o logout do usuário
 * 
 * @returns Promise<void> - Redireciona automaticamente para /login após logout
 */
export async function logout(): Promise<void> {
  try {
    // Cria o cliente Supabase para Server Actions
    // Este cliente gerencia os cookies de autenticação automaticamente
    const supabase = await createServerActionClient();

    // Desconecta o usuário do Supabase
    // Isso remove os tokens de autenticação e limpa a sessão
    const { error } = await supabase.auth.signOut();

    // Verifica se houve erro ao fazer logout
    if (error) {
      // Em caso de erro, ainda tentamos redirecionar
      // O middleware tratará a limpeza da sessão se necessário
      console.error('Erro ao fazer logout:', error);
    }

    // Revalida o cache do Next.js
    // Isso garante que dados protegidos não sejam servidos após logout
    revalidatePath('/');
    revalidatePath('/dashboard');
    revalidatePath('/login');

    // Redireciona para a página de login
    // O middleware garantirá que o usuário seja redirecionado se tentar acessar rotas protegidas
    redirect('/login');
  } catch (error) {
    // Tratamento de erro genérico
    console.error('Erro no logout:', error);
    
    // Mesmo em caso de erro, redireciona para login
    // A segurança do middleware ainda protegerá as rotas
    redirect('/login');
  }
}

