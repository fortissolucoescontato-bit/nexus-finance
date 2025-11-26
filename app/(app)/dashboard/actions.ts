'use server';

/**
 * Server Actions para o Dashboard
 * 
 * Estas Server Actions são usadas para operações do dashboard,
 * como logout e criação de organização.
 */

import { createServerActionClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

/**
 * Realiza o logout do usuário
 * 
 * Limpa a sessão do Supabase e redireciona para a página de login
 */
export async function logout(): Promise<void> {
  try {
    // Cria o cliente Supabase para Server Actions
    const supabase = await createServerActionClient();

    // Realiza o logout no Supabase
    // Isso limpa os cookies de autenticação automaticamente
    await supabase.auth.signOut();

    // Revalida o cache do Next.js
    // Isso garante que dados atualizados sejam buscados na próxima requisição
    revalidatePath('/');
    revalidatePath('/login');
    revalidatePath('/dashboard');

    // Redireciona para a página de login
    redirect('/login');
  } catch (error) {
    // Em caso de erro, ainda tenta redirecionar para login
    // O usuário pode estar deslogado mesmo se houver erro
    console.error('Erro no logout:', error);
    redirect('/login');
  }
}

/**
 * Cria uma organização para o usuário atual
 * 
 * Esta função é chamada quando o usuário acessa o dashboard
 * e não tem uma organização. Cria a organização com o nome escolhido
 * e adiciona o usuário como owner.
 * 
 * @param organizationName - Nome da organização escolhido pelo usuário
 * @returns Promise<{ success: boolean; error?: string }>
 */
export async function createPersonalOrganization(
  organizationName: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Cria o cliente Supabase para Server Actions
    const supabase = await createServerActionClient();

    // Busca o usuário atual
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    // Verifica se o usuário está autenticado
    if (userError || !user) {
      return {
        success: false,
        error: 'Usuário não autenticado',
      };
    }

    // Valida o nome da organização
    const trimmedName = organizationName?.trim() || '';
    if (trimmedName.length < 2) {
      return {
        success: false,
        error: 'O nome da organização deve ter pelo menos 2 caracteres',
      };
    }
    if (trimmedName.length > 100) {
      return {
        success: false,
        error: 'O nome da organização deve ter no máximo 100 caracteres',
      };
    }

    // Verifica se o usuário já tem uma organização
    const { data: existingMembers } = await supabase
      .from('organization_members')
      .select('organization_id')
      .eq('user_id', user.id)
      .limit(1);

    // Se já tiver organização, retorna sucesso (não precisa criar)
    if (existingMembers && existingMembers.length > 0) {
      return {
        success: true,
      };
    }

    // Garante que o perfil existe
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email || 'Usuário',
        email: user.email || '',
      }, {
        onConflict: 'id',
      });

    if (profileError) {
      console.error('Erro ao criar/atualizar perfil:', profileError);
      // Continua mesmo se houver erro no perfil
    }

    // Cria a organização com o nome escolhido pelo usuário
    // Gera um UUID v4 usando a API nativa do Node.js
    // No Node.js 18+ e Next.js 15, crypto.randomUUID() está disponível globalmente
    const orgId = crypto.randomUUID();
    
    // Gera um slug único baseado no nome e ID do usuário
    // Remove caracteres especiais e espaços, converte para lowercase
    const slugBase = trimmedName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9]+/g, '-') // Substitui não-alfanuméricos por hífen
      .replace(/^-+|-+$/g, ''); // Remove hífens do início/fim
    
    const slug = `${slugBase}-${user.id.slice(0, 8)}`;
    
    const { data: org, error: orgError } = await supabase
      .from('organizations')
      .insert({
        id: orgId,
        name: trimmedName,
        type: 'personal',
        slug: slug,
      })
      .select()
      .single();

    if (orgError) {
      console.error('Erro ao criar organização:', orgError);
      return {
        success: false,
        error: orgError.message || 'Erro ao criar organização',
      };
    }

    // Adiciona o usuário como owner da organização
    const { error: memberError } = await supabase
      .from('organization_members')
      .insert({
        organization_id: orgId,
        user_id: user.id,
        role: 'owner',
      });

    if (memberError) {
      console.error('Erro ao adicionar membro:', memberError);
      return {
        success: false,
        error: memberError.message || 'Erro ao adicionar membro à organização',
      };
    }

    // Revalida o cache do dashboard para mostrar a organização
    revalidatePath('/dashboard');

    return {
      success: true,
    };
  } catch (error) {
    // Tratamento de erro genérico
    console.error('Erro ao criar organização:', error);
    
    let errorMessage = 'Erro inesperado ao criar organização';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}
