/**
 * Cliente Supabase para Client Components
 * 
 * Este arquivo cria uma instância do cliente Supabase que funciona
 * em componentes React do lado do cliente (marcados com 'use client').
 * 
 * IMPORTANTE: Este cliente é usado apenas em Client Components.
 * Para Server Components e Server Actions, use utils/supabase/server.ts
 */

import { createBrowserClient } from '@supabase/ssr';

/**
 * Cria e retorna uma instância do cliente Supabase para uso no browser
 * 
 * Por que usar createBrowserClient do @supabase/ssr?
 * - Gerencia automaticamente os cookies de sessão
 * - Funciona corretamente com o App Router do Next.js 15
 * - Atualiza a sessão automaticamente quando necessário
 * 
 * @returns {ReturnType<typeof createBrowserClient>} Cliente Supabase configurado
 */
export function createClient() {
  // Validação das variáveis de ambiente (segurança)
  // Garante que as variáveis necessárias estão definidas
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Variáveis de ambiente do Supabase não configuradas. ' +
      'Verifique NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local'
    );
  }

  // Cria o cliente Supabase configurado para o browser
  // Este cliente gerencia automaticamente os cookies de autenticação
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

