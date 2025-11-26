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
import { createOrganizationSchema, updateOrganizationSchema } from '@/lib/validations';
import { logger } from '@/lib/logger';
import { generateSlug } from '@/lib/slug';

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
    logger.error('Erro no logout', error);
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

    // Valida o nome da organização com Zod
    const validationResult = createOrganizationSchema.safeParse({
      organizationName: organizationName || '',
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return {
        success: false,
        error: firstError.message,
      };
    }

    const { organizationName: trimmedName } = validationResult.data;

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
      logger.error('Erro ao criar/atualizar perfil', profileError);
      // Continua mesmo se houver erro no perfil
    }

    // Cria a organização com o nome escolhido pelo usuário
    // Gera um UUID v4 usando a API nativa do Node.js
    // No Node.js 18+ e Next.js 15, crypto.randomUUID() está disponível globalmente
    const orgId = crypto.randomUUID();
    
    // Gera um slug único baseado no nome e ID do usuário
    const slug = generateSlug(trimmedName, user.id);
    
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
      logger.error('Erro ao criar organização', orgError);
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
      logger.error('Erro ao adicionar membro', memberError);
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
    logger.error('Erro inesperado ao criar organização', error);
    
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

    // Valida o novo nome com Zod
    const validationResult = updateOrganizationSchema.safeParse({
      organizationId,
      newName: newName || '',
    });

    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0];
      return {
        success: false,
        error: firstError.message,
      };
    }

    const { newName: trimmedName } = validationResult.data;

    // Verifica se o usuário é owner da organização
    const { data: member, error: memberError } = await supabase
      .from('organization_members')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('user_id', user.id)
      .eq('role', 'owner')
      .single();

    if (memberError || !member) {
      logger.error('Erro ao verificar permissão', {
        memberError,
        member,
        userId: user.id,
        organizationId,
      });
      return {
        success: false,
        error: 'Você não tem permissão para editar esta organização',
      };
    }

    logger.debug('Permissão verificada. Atualizando organização', {
      organizationId,
      newName: trimmedName,
      userId: user.id,
    });

    // Gera novo slug baseado no novo nome
    const newSlug = generateSlug(trimmedName, user.id);

    // Atualiza a organização
    const { data: updatedOrg, error: updateError } = await supabase
      .from('organizations')
      .update({
        name: trimmedName,
        slug: newSlug,
      })
      .eq('id', organizationId)
      .select()
      .single();

    if (updateError) {
      logger.error('Erro ao atualizar organização', {
        error: updateError,
        message: updateError.message,
        code: updateError.code,
        details: updateError.details,
        hint: updateError.hint,
        organizationId,
        userId: user.id,
      });
      
      // Mensagem de erro mais específica
      let errorMessage = 'Erro ao atualizar organização';
      if (updateError.message?.includes('row-level security') || updateError.code === '42501') {
        errorMessage = 'Permissão negada. Verifique se você é owner da organização.';
      } else if (updateError.message) {
        errorMessage = updateError.message;
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }

    logger.debug('Organização atualizada com sucesso', updatedOrg);

    // Revalida o cache do dashboard
    revalidatePath('/dashboard');

    return {
      success: true,
    };
  } catch (error) {
    logger.error('Erro inesperado ao atualizar organização', error);
    
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
