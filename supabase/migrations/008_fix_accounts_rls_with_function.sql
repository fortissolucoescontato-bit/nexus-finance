-- ============================================================================
-- MIGRAÇÃO: 008_fix_accounts_rls_with_function.sql
-- DATA: 2025-01-XX
-- DESCRIÇÃO: Cria função auxiliar para criar contas que bypassa RLS temporariamente
--            e garante que a verificação de permissão seja feita corretamente.
-- ============================================================================

-- ============================================================================
-- FUNÇÃO AUXILIAR: create_account_safe
-- ============================================================================
-- Esta função verifica permissões antes de criar a conta
-- Usa SECURITY DEFINER para executar com privilégios elevados
-- ============================================================================

CREATE OR REPLACE FUNCTION public.create_account_safe(
    p_organization_id UUID,
    p_name TEXT,
    p_type TEXT,
    p_user_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_account_id UUID;
    v_is_member BOOLEAN;
BEGIN
    -- Verifica se o usuário é membro da organização
    SELECT EXISTS (
        SELECT 1
        FROM public.organization_members
        WHERE organization_id = p_organization_id
        AND user_id = p_user_id
    ) INTO v_is_member;

    IF NOT v_is_member THEN
        RAISE EXCEPTION 'Usuário não é membro desta organização';
    END IF;

    -- Cria a conta
    INSERT INTO public.accounts (
        organization_id,
        name,
        type,
        balance
    ) VALUES (
        p_organization_id,
        p_name,
        p_type,
        0
    ) RETURNING id INTO v_account_id;

    RETURN v_account_id;
END;
$$;

-- ============================================================================
-- GARANTE PERMISSÕES CORRETAS
-- ============================================================================

-- Permite que usuários autenticados executem a função
GRANT EXECUTE ON FUNCTION public.create_account_safe(UUID, TEXT, TEXT, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_account_safe(UUID, TEXT, TEXT, UUID) TO anon;

-- ============================================================================
-- COMENTÁRIO
-- ============================================================================

COMMENT ON FUNCTION public.create_account_safe IS 'Função auxiliar para criar contas com verificação de permissão. Usa SECURITY DEFINER para bypassar RLS temporariamente.';

-- ============================================================================
-- ALTERNATIVA: Se preferir corrigir apenas a política RLS
-- ============================================================================
-- Execute também a migração 007_fix_accounts_rls.sql
-- ============================================================================

