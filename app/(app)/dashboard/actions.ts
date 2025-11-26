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

    // Usa função stored procedure para criar organização
    // Isso bypassa RLS e cria organização + membro em uma transação atômica
    console.log('Tentando criar organização via RPC:', {
      userId: user.id,
      organizationName: trimmedName,
    });

    const { data: orgIdData, error: orgError } = await supabase
      .rpc('create_personal_organization', {
        p_user_id: user.id,
        p_organization_name: trimmedName,
      });

    console.log('Resultado do RPC:', {
      hasError: !!orgError,
      errorMessage: orgError?.message,
      errorCode: orgError?.code,
      errorDetails: orgError?.details,
      errorHint: orgError?.hint,
      data: orgIdData,
    });

    if (orgError) {
      console.error('Erro completo ao criar organização:', {
        message: orgError.message,
        code: orgError.code,
        details: orgError.details,
        hint: orgError.hint,
        status: orgError.status,
      });
      
      // Mensagem de erro mais específica
      let errorMessage = orgError.message || 'Erro ao criar organização';
      
      // Se a função não existir
      if (orgError.message?.includes('function') || orgError.code === '42883') {
        errorMessage = 'Função não encontrada. Execute a migração SQL no Supabase.';
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }

    // A função retorna o ID da organização criada (ou existente)
    const orgId = orgIdData;
    
    if (!orgId) {
      console.error('Organização criada mas ID não retornado');
      return {
        success: false,
        error: 'Erro ao obter ID da organização criada',
      };
    }

    console.log('Organização criada com sucesso:', { orgId });

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

/**
 * Atualiza o nome de uma organização
 * 
 * @param organizationId - ID da organização a ser atualizada
 * @param newName - Novo nome da organização
 * @returns Promise<{ success: boolean; error?: string }>
 */
export async function updateOrganization(
  organizationId: string,
  newName: string
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

    // Valida o novo nome
    const trimmedName = newName?.trim() || '';
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

    // Verifica se o usuário é owner da organização
    const { data: member, error: memberError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .eq('role', 'owner')
      .single();

    if (memberError || !member) {
      return {
        success: false,
        error: 'Você não tem permissão para editar esta organização',
      };
    }

    // Gera novo slug baseado no novo nome
    const slugBase = trimmedName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9]+/g, '-') // Substitui não-alfanuméricos por hífen
      .replace(/^-+|-+$/g, ''); // Remove hífens do início/fim
    
    const newSlug = `${slugBase}-${user.id.slice(0, 8)}`;

    // Atualiza a organização
    const { error: updateError } = await supabase
      .from('organizations')
      .update({
        name: trimmedName,
        slug: newSlug,
      })
      .eq('id', organizationId);

    if (updateError) {
      console.error('Erro ao atualizar organização:', updateError);
      return {
        success: false,
        error: updateError.message || 'Erro ao atualizar organização',
      };
    }

    // Revalida o cache do dashboard
    revalidatePath('/dashboard');

    return {
      success: true,
    };
  } catch (error) {
    console.error('Erro ao atualizar organização:', error);
    
    let errorMessage = 'Erro inesperado ao atualizar organização';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}
