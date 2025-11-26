/**
 * Página Raiz (Home)
 * 
 * Esta página redireciona automaticamente:
 * - Usuários autenticados → /dashboard
 * - Usuários não autenticados → /login
 * 
 * O middleware também trata isso, mas esta página serve como fallback
 */

import { redirect } from 'next/navigation';
import { createServerComponentClient } from '@/utils/supabase/server';

/**
 * Componente da página raiz
 * 
 * Verifica se o usuário está autenticado e redireciona adequadamente
 */
export default async function HomePage(): Promise<never> {
  // Cria o cliente Supabase para verificar autenticação
  const supabase = await createServerComponentClient();

  // Busca os dados do usuário
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Se estiver autenticado, redireciona para dashboard
  if (user) {
    redirect('/dashboard');
  }

  // Se não estiver autenticado, redireciona para login
  redirect('/login');
}

