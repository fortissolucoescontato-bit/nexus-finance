-- ============================================================================
-- CORREÇÃO RÁPIDA: Criar Organização para Usuário Logado
-- ============================================================================
-- Execute este script para criar a organização "Personal" para o usuário
-- lucasv.oliveira777@gmail.com
-- ============================================================================

DO $$
DECLARE
    user_id_var UUID;
    org_id_var UUID;
    user_email TEXT := 'lucasv.oliveira777@gmail.com';
    user_name TEXT;
BEGIN
    -- Busca o ID do usuário pelo email
    SELECT id, raw_user_meta_data->>'full_name' INTO user_id_var, user_name
    FROM auth.users
    WHERE email = user_email;
    
    IF user_id_var IS NULL THEN
        RAISE EXCEPTION 'Usuário com email % não encontrado', user_email;
    END IF;
    
    RAISE NOTICE 'Corrigindo usuário: % (ID: %)', user_email, user_id_var;
    
    -- Garante que o perfil existe
    INSERT INTO public.profiles (id, full_name, email)
    VALUES (user_id_var, COALESCE(user_name, user_email), user_email)
    ON CONFLICT (id) DO UPDATE SET
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        email = COALESCE(EXCLUDED.email, profiles.email),
        updated_at = NOW();
    
    RAISE NOTICE '✅ Perfil verificado/criado';
    
    -- Verifica se já existe uma organização "Personal" para este usuário
    SELECT id INTO org_id_var
    FROM public.organizations
    WHERE slug = 'personal-' || user_id_var::TEXT;
    
    -- Se não existir, cria uma nova organização "Personal"
    IF org_id_var IS NULL THEN
        org_id_var := uuid_generate_v4();
        INSERT INTO public.organizations (id, name, type, slug)
        VALUES (org_id_var, 'Personal', 'personal', 'personal-' || user_id_var::TEXT);
        
        RAISE NOTICE '✅ Organização "Personal" criada (ID: %)', org_id_var;
    ELSE
        RAISE NOTICE 'ℹ️ Organização "Personal" já existe (ID: %)', org_id_var;
    END IF;
    
    -- Adiciona o usuário como owner da organização se não estiver
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (org_id_var, user_id_var, 'owner')
    ON CONFLICT (organization_id, user_id) DO UPDATE SET
        role = 'owner';
    
    RAISE NOTICE '✅ Usuário adicionado como owner da organização';
    RAISE NOTICE '';
    RAISE NOTICE '🎉 Usuário % corrigido com sucesso!', user_email;
    RAISE NOTICE '   Recarregue a página do dashboard para ver a organização.';
END $$;

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

SELECT 
    u.email,
    CASE WHEN p.id IS NOT NULL THEN '✅' ELSE '❌' END as tem_perfil,
    CASE WHEN om.user_id IS NOT NULL THEN '✅' ELSE '❌' END as tem_organizacao,
    o.name as nome_organizacao,
    om.role as papel
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.organization_members om ON u.id = om.user_id
LEFT JOIN public.organizations o ON om.organization_id = o.id
WHERE u.email = 'lucasv.oliveira777@gmail.com';

-- ============================================================================
-- ✅ PRONTO!
-- ============================================================================
-- 
-- Após executar este script:
-- 1. A organização "Personal" foi criada
-- 2. O usuário foi adicionado como owner
-- 3. Recarregue a página do dashboard (F5) para ver a organização
-- ============================================================================

