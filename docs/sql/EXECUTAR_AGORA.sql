-- ============================================================================
-- 🚨 EXECUTE ESTE SQL NO SUPABASE AGORA!
-- ============================================================================
-- Este script remove as políticas conflitantes e garante que a função existe
-- ============================================================================

-- ============================================================================
-- PASSO 1: REMOVER POLÍTICAS DE INSERT CONFLITANTES
-- ============================================================================

DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "System can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Owners can create organizations" ON public.organizations;

-- ============================================================================
-- PASSO 2: CRIAR/ATUALIZAR FUNÇÃO STORED PROCEDURE
-- ============================================================================

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
    
    -- Gera UUID e slug
    v_org_id := uuid_generate_v4();
    v_slug := LOWER(REGEXP_REPLACE(
        REGEXP_REPLACE(v_trimmed_name, '[^a-zA-Z0-9\s]+', '', 'g'),
        '\s+', '-', 'g'
    ));
    v_slug := REGEXP_REPLACE(v_slug, '^-+|-+$', '', 'g') || '-' || SUBSTRING(p_user_id::TEXT, 1, 8);
    
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
    
    -- Cria organização (bypassa RLS com SECURITY DEFINER)
    INSERT INTO public.organizations (id, name, type, slug)
    VALUES (v_org_id, v_trimmed_name, 'personal', v_slug);
    
    -- Adiciona usuário como owner (bypassa RLS com SECURITY DEFINER)
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (v_org_id, p_user_id, 'owner')
    ON CONFLICT (organization_id, user_id) DO NOTHING;
    
    RETURN v_org_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erro ao criar organização: %', SQLERRM;
END;
$$;

-- ============================================================================
-- PASSO 3: PERMISSÕES
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.create_personal_organization(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_personal_organization(UUID, TEXT) TO anon;

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

-- Verifica função
SELECT 
    '✅ Função criada' as status,
    proname as nome,
    prosecdef as security_definer
FROM pg_proc
WHERE proname = 'create_personal_organization';

-- Verifica políticas de INSERT (deve estar vazio)
SELECT 
    'Políticas de INSERT' as info,
    COUNT(*) as total
FROM pg_policies
WHERE tablename = 'organizations'
AND cmd = 'INSERT';

-- ============================================================================
-- ✅ PRONTO! Agora teste criar uma organização na aplicação!
-- ============================================================================

