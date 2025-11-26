-- ============================================================================
-- SOLUÇÃO DEFINITIVA: Função Stored Procedure para Criar Organização
-- ============================================================================
-- PROBLEMA: Mesmo com políticas RLS corretas, pode haver problemas de contexto
-- de autenticação em Server Actions do Next.js.
-- 
-- SOLUÇÃO: Criar uma função stored procedure com SECURITY DEFINER que
-- bypassa o RLS e cria a organização + membro em uma transação atômica.
-- ============================================================================

-- ============================================================================
-- PARTE 1: REMOVER FUNÇÃO EXISTENTE (SE HOUVER)
-- ============================================================================

DROP FUNCTION IF EXISTS public.create_personal_organization(UUID, TEXT);

-- ============================================================================
-- PARTE 2: CRIAR FUNÇÃO STORED PROCEDURE
-- ============================================================================

-- Função que cria uma organização personal e adiciona o usuário como owner
-- Usa SECURITY DEFINER para executar com privilégios do criador da função
-- Isso bypassa o RLS e permite a criação mesmo com políticas restritivas
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
    v_user_email TEXT;
    v_user_name TEXT;
BEGIN
    -- Validação de entrada
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'User ID não pode ser nulo';
    END IF;
    
    IF p_organization_name IS NULL OR LENGTH(TRIM(p_organization_name)) < 2 THEN
        RAISE EXCEPTION 'Nome da organização deve ter pelo menos 2 caracteres';
    END IF;
    
    -- Verifica se o usuário já tem uma organização
    IF EXISTS (
        SELECT 1 
        FROM public.organization_members 
        WHERE user_id = p_user_id 
        LIMIT 1
    ) THEN
        -- Retorna a organização existente
        SELECT organization_id INTO v_org_id
        FROM public.organization_members
        WHERE user_id = p_user_id
        LIMIT 1;
        
        RETURN v_org_id;
    END IF;
    
    -- Gera UUID para a organização
    v_org_id := uuid_generate_v4();
    
    -- Gera slug único baseado no nome
    -- Remove acentos e caracteres especiais, converte para lowercase
    v_slug := LOWER(REGEXP_REPLACE(
        REGEXP_REPLACE(
            TRIM(p_organization_name),
            '[^a-zA-Z0-9\s]+', '', 'g'  -- Remove caracteres especiais
        ),
        '\s+', '-', 'g'  -- Substitui espaços por hífen
    ));
    
    -- Remove hífens do início e fim
    v_slug := REGEXP_REPLACE(v_slug, '^-+|-+$', '', 'g');
    
    -- Adiciona sufixo único com parte do user_id
    v_slug := v_slug || '-' || SUBSTRING(p_user_id::TEXT, 1, 8);
    
    -- Garante que o perfil existe
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
    
    -- Cria a organização
    INSERT INTO public.organizations (id, name, type, slug)
    VALUES (v_org_id, TRIM(p_organization_name), 'personal', v_slug)
    ON CONFLICT (id) DO NOTHING;
    
    -- Se a organização já existir (conflito), busca o ID existente
    IF NOT FOUND THEN
        SELECT id INTO v_org_id
        FROM public.organizations
        WHERE slug = v_slug
        LIMIT 1;
    END IF;
    
    -- Adiciona o usuário como owner da organização
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (v_org_id, p_user_id, 'owner')
    ON CONFLICT (organization_id, user_id) DO NOTHING;
    
    RETURN v_org_id;
EXCEPTION
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

-- ============================================================================
-- ✅ PRONTO!
-- ============================================================================
-- 
-- Agora você pode usar esta função no código da aplicação ao invés de
-- fazer INSERT direto nas tabelas. A função:
-- 
-- 1. Bypassa RLS (usa SECURITY DEFINER)
-- 2. Cria organização + membro em uma transação atômica
-- 3. Valida entradas
-- 4. Verifica se já existe organização
-- 5. Garante que o perfil existe
-- 
-- Exemplo de uso no código:
-- SELECT create_personal_organization(auth.uid(), 'Minha Organização');
-- ============================================================================

