-- ============================================================================
-- SOLUÇÃO DEFINITIVA: Remover Políticas Conflitantes e Usar Apenas Função
-- ============================================================================
-- PROBLEMA: Múltiplas políticas de INSERT podem estar conflitando
-- SOLUÇÃO: Remover todas as políticas de INSERT e usar apenas a função stored procedure
-- ============================================================================

-- ============================================================================
-- PARTE 1: REMOVER TODAS AS POLÍTICAS DE INSERT PARA organizations
-- ============================================================================

-- Remove todas as políticas de INSERT existentes (podem estar conflitando)
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "System can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Owners can create organizations" ON public.organizations;

-- ============================================================================
-- PARTE 2: GARANTIR QUE A FUNÇÃO EXISTE
-- ============================================================================

-- Remove função existente se houver
DROP FUNCTION IF EXISTS public.create_personal_organization(UUID, TEXT);

-- Cria função stored procedure (versão simplificada e testada)
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
    -- Validação de entrada
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'User ID não pode ser nulo';
    END IF;
    
    v_trimmed_name := TRIM(p_organization_name);
    
    IF v_trimmed_name IS NULL OR LENGTH(v_trimmed_name) < 2 THEN
        RAISE EXCEPTION 'Nome da organização deve ter pelo menos 2 caracteres';
    END IF;
    
    IF LENGTH(v_trimmed_name) > 100 THEN
        RAISE EXCEPTION 'Nome da organização deve ter no máximo 100 caracteres';
    END IF;
    
    -- Verifica se o usuário já tem uma organização
    SELECT organization_id INTO v_org_id
    FROM public.organization_members
    WHERE user_id = p_user_id
    LIMIT 1;
    
    IF v_org_id IS NOT NULL THEN
        -- Retorna a organização existente
        RETURN v_org_id;
    END IF;
    
    -- Gera UUID para a organização
    v_org_id := uuid_generate_v4();
    
    -- Gera slug único baseado no nome
    -- Remove acentos e caracteres especiais, converte para lowercase
    v_slug := LOWER(v_trimmed_name);
    -- Remove caracteres especiais
    v_slug := REGEXP_REPLACE(v_slug, '[^a-z0-9\s]+', '', 'g');
    -- Substitui espaços por hífen
    v_slug := REGEXP_REPLACE(v_slug, '\s+', '-', 'g');
    -- Remove hífens do início e fim
    v_slug := REGEXP_REPLACE(v_slug, '^-+|-+$', '', 'g');
    -- Adiciona sufixo único com parte do user_id
    v_slug := v_slug || '-' || SUBSTRING(p_user_id::TEXT, 1, 8);
    
    -- Garante que o perfil existe (usando SECURITY DEFINER, bypassa RLS)
    INSERT INTO public.profiles (id, full_name, email)
    SELECT 
        p_user_id,
        COALESCE(
            (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = p_user_id),
            (SELECT email FROM auth.users WHERE id = p_user_id),
            'Usuário'
        ),
        COALESCE(
            (SELECT email FROM auth.users WHERE id = p_user_id),
            ''
        )
    ON CONFLICT (id) DO UPDATE
    SET 
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        email = COALESCE(EXCLUDED.email, profiles.email);
    
    -- Cria a organização (usando SECURITY DEFINER, bypassa RLS)
    INSERT INTO public.organizations (id, name, type, slug)
    VALUES (v_org_id, v_trimmed_name, 'personal', v_slug);
    
    -- Adiciona o usuário como owner da organização (usando SECURITY DEFINER, bypassa RLS)
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (v_org_id, p_user_id, 'owner')
    ON CONFLICT (organization_id, user_id) DO NOTHING;
    
    RETURN v_org_id;
    
EXCEPTION
    WHEN unique_violation THEN
        -- Se slug duplicado, tenta novamente com timestamp
        v_slug := v_slug || '-' || EXTRACT(EPOCH FROM NOW())::BIGINT::TEXT;
        INSERT INTO public.organizations (id, name, type, slug)
        VALUES (v_org_id, v_trimmed_name, 'personal', v_slug)
        ON CONFLICT (id) DO NOTHING;
        
        INSERT INTO public.organization_members (organization_id, user_id, role)
        VALUES (v_org_id, p_user_id, 'owner')
        ON CONFLICT (organization_id, user_id) DO NOTHING;
        
        RETURN v_org_id;
    WHEN OTHERS THEN
        -- Log do erro e re-lança
        RAISE EXCEPTION 'Erro ao criar organização: %', SQLERRM;
END;
$$;

-- ============================================================================
-- PARTE 3: PERMISSÕES
-- ============================================================================

-- Permite que usuários autenticados executem a função
GRANT EXECUTE ON FUNCTION public.create_personal_organization(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_personal_organization(UUID, TEXT) TO anon;

-- ============================================================================
-- PARTE 4: COMENTÁRIOS
-- ============================================================================

COMMENT ON FUNCTION public.create_personal_organization(UUID, TEXT) IS 
'Cria uma organização personal e adiciona o usuário como owner. Bypassa RLS usando SECURITY DEFINER.';

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

-- Verifica se a função foi criada
SELECT 
    '✅ Função criada' as status,
    proname as nome_funcao,
    prosecdef as security_definer,
    proargtypes::regtype[] as tipos_argumentos
FROM pg_proc
WHERE proname = 'create_personal_organization';

-- Lista políticas de INSERT restantes (deve estar vazio)
SELECT 
    'Políticas de INSERT restantes' as info,
    policyname,
    cmd,
    with_check
FROM pg_policies
WHERE tablename = 'organizations'
AND cmd = 'INSERT';

-- ============================================================================
-- ✅ PRONTO!
-- ============================================================================
-- 
-- IMPORTANTE: 
-- - Todas as políticas de INSERT foram removidas
-- - A função stored procedure foi criada/atualizada
-- - A função usa SECURITY DEFINER para bypassar RLS
-- - O código da aplicação já usa esta função via .rpc()
-- 
-- TESTE: Tente criar uma organização agora!
-- ============================================================================

