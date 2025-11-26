/**
 * Cliente Supabase para Server Components e Server Actions
 * 
 * Este arquivo fornece funções para criar clientes Supabase que funcionam
 * no servidor do Next.js (Server Components e Server Actions).
 * 
 * IMPORTANTE: Use estas funções apenas em Server Components ou Server Actions.
 * Para Client Components, use utils/supabase/client.ts
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

/**
 * Cria um cliente Supabase para uso em Server Components
 * 
 * Por que uma função separada para Server Components?
 * - Server Components não têm acesso direto a Request/Response
 * - Usa cookies() do Next.js para ler os cookies de sessão
 * - Garante que a sessão do usuário é preservada entre requisições
 * 
 * @returns {Promise<ReturnType<typeof createServerClient>>} Cliente Supabase configurado
 */
export async function createServerComponentClient() {
  // Obtém os cookies da requisição atual
  // No Next.js 15, cookies() é uma função assíncrona
  const cookieStore = await cookies();

  // Validação das variáveis de ambiente (segurança)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Variáveis de ambiente do Supabase não configuradas. ' +
      'Verifique NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local'
    );
  }

  // Cria o cliente Supabase configurado para o servidor
  // Este cliente lê e escreve cookies automaticamente
  // No Next.js 15, usamos getAll() e setAll() para melhor compatibilidade
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      // Obtém todos os cookies de uma vez (mais eficiente no Next.js 15)
      getAll() {
        return cookieStore.getAll();
      },
      // Define múltiplos cookies de uma vez
      // Ignoramos avisos de Server Components - o Next.js 15 gerencia isso automaticamente
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            // @ts-ignore - Next.js 15 permite set em Server Components quando necessário
            cookieStore.set(name, value, options);
          });
        } catch (error) {
          // Em Server Components, não podemos definir cookies diretamente
          // Isso é tratado pelo middleware quando necessário
        }
      },
    },
  });
}

/**
 * Cria um cliente Supabase para uso em Server Actions
 * 
 * Por que uma função separada para Server Actions?
 * - Server Actions recebem Request/Response diretamente
 * - Permite maior controle sobre os cookies
 * - Mais eficiente para operações de escrita (mutations)
 * 
 * @param {Request} request - Objeto Request da requisição HTTP
 * @returns {Promise<ReturnType<typeof createServerClient>>} Cliente Supabase configurado
 */
export async function createServerActionClient(request?: Request) {
  // Obtém os cookies da requisição atual
  const cookieStore = await cookies();

  // Validação das variáveis de ambiente (segurança)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Variáveis de ambiente do Supabase não configuradas. ' +
      'Verifique NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local'
    );
  }

  // Cria o cliente Supabase configurado para Server Actions
  // Server Actions podem definir cookies mais livremente que Server Components
  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      // Obtém todos os cookies de uma vez (mais eficiente no Next.js 15)
      getAll() {
        return cookieStore.getAll();
      },
      // Define múltiplos cookies de uma vez
      // Em Server Actions, podemos definir cookies diretamente
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            // @ts-ignore - Next.js 15 permite set em Server Actions
            cookieStore.set(name, value, options);
          });
        } catch (error) {
          // Em alguns casos, o Next.js pode lançar erro se já foi enviado
          // Mas geralmente funciona bem em Server Actions
        }
      },
    },
  });
}

