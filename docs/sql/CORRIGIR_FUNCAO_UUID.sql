-- ============================================================================
-- CORREÇÃO: Função UUID
-- ============================================================================
-- PROBLEMA: uuid_generate_v4() não existe
-- SOLUÇÃO: Usar gen_random_uuid() (nativo PostgreSQL 13+) ou habilitar extensão
-- ============================================================================

-- Opção 1: Habilitar extensão uuid-ossp (se preferir usar uuid_generate_v4)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Opção 2: Atualizar função para usar gen_random_uuid() (nativo, mais moderno)
DROP FUNCTION IF EXISTS public.create_personal_organization(UUID, TEXT);

CREATE OR REPLACE FUNCTION public.create_personal_organization(
    p_user_id UUID,
    p_organization_name TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_org_id UUID;
    v_slug TEXT;
    v_trimmed_name TEXT;
BEGIN
    -- Validação
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'User ID não pode ser nulo';
    END IF;
    
    v_trimmed_name := TRIM(p_organization_name);
    
    IF v_trimmed_name IS NULL OR LENGTH(v_trimmed_name) < 2 THEN
        RAISE EXCEPTION 'Nome da organização deve ter pelo menos 2 caracteres';
    END IF;
    
    -- Verifica se já tem organização
    SELECT organization_id INTO v_org_id
    FROM public.organization_members
    WHERE user_id = p_user_id
    LIMIT 1;
    
    IF v_org_id IS NOT NULL THEN
        RETURN v_org_id;
    END IF;
    
    -- Gera UUID usando gen_random_uuid() (nativo PostgreSQL 13+)
    -- Se não funcionar, use: v_org_id := uuid_generate_v4();
    v_org_id := gen_random_uuid();
    
    -- Gera slug
    v_slug := LOWER(REGEXP_REPLACE(
        REGEXP_REPLACE(v_trimmed_name, '[^a-zA-Z0-9\s]+', '', 'g'),
        '\s+', '-', 'g'
    ));
    v_slug := REGEXP_REPLACE(v_slug, '^-+|-+$', '', 'g') || '-' || SUBSTRING(p_user_id::TEXT, 1, 8);
    
    -- DESABILITA RLS TEMPORARIAMENTE
    PERFORM set_config('row_security', 'off', true);
    
    -- Garante perfil existe
    INSERT INTO public.profiles (id, full_name, email)
    SELECT 
        p_user_id,
        COALESCE(
            (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = p_user_id),
            (SELECT email FROM auth.users WHERE id = p_user_id),
            'Usuário'
        ),
        COALESCE((SELECT email FROM auth.users WHERE id = p_user_id), '')
    ON CONFLICT (id) DO UPDATE
    SET 
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        email = COALESCE(EXCLUDED.email, profiles.email);
    
    -- Cria organização
    INSERT INTO public.organizations (id, name, type, slug)
    VALUES (v_org_id, v_trimmed_name, 'personal', v_slug);
    
    -- Adiciona usuário como owner
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (v_org_id, p_user_id, 'owner')
    ON CONFLICT (organization_id, user_id) DO NOTHING;
    
    -- REABILITA RLS
    PERFORM set_config('row_security', 'on', true);
    
    RETURN v_org_id;
    
EXCEPTION
    WHEN OTHERS THEN
        -- Reabilita RLS mesmo em caso de erro
        PERFORM set_config('row_security', 'on', true);
        -- Re-lança o erro
        RAISE EXCEPTION 'Erro ao criar organização: %', SQLERRM;
END;
$$;

-- Permissões
GRANT EXECUTE ON FUNCTION public.create_personal_organization(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_personal_organization(UUID, TEXT) TO anon;

-- Verificação
SELECT 
    '✅ Função corrigida com gen_random_uuid()' as status,
    proname,
    prosecdef
FROM pg_proc
WHERE proname = 'create_personal_organization';

-- ============================================================================
-- ✅ PRONTO!
-- ============================================================================
-- Agora a função usa gen_random_uuid() que é nativo do PostgreSQL
-- Se ainda der erro, a extensão uuid-ossp pode não estar disponível
-- Nesse caso, gen_random_uuid() deve funcionar
-- ============================================================================

