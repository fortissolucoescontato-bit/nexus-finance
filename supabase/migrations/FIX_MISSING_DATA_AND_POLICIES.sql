-- ============================================================================
-- CORREÇÃO COMPLETA: Dados Faltantes e Políticas RLS
-- ============================================================================
-- Este script corrige:
-- 1. Recria a política de SELECT para organizations que está faltando
-- 2. Cria perfil e organização para usuários que não têm
-- ============================================================================

-- ============================================================================
-- PARTE 1: CORRIGIR POLÍTICA DE ORGANIZATIONS
-- ============================================================================

-- Remove política antiga se existir (caso tenha sido removida acidentalmente)
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON public.organizations;

-- Recria a política de SELECT para organizations
-- Esta política permite que usuários vejam organizações das quais são membros
CREATE POLICY "Users can view organizations they belong to"
    ON public.organizations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.organization_members
            WHERE organization_members.organization_id = organizations.id
            AND organization_members.user_id = auth.uid()
        )
    );

-- ============================================================================
-- PARTE 2: CORRIGIR USUÁRIO SEM DADOS
-- ============================================================================

-- Corrige o usuário lucasv.oliveira777@gmail.com que não tem perfil/organização
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
        RAISE NOTICE 'Usuário com email % não encontrado. Pulando correção.', user_email;
        RETURN;
    END IF;
    
    RAISE NOTICE 'Corrigindo usuário: % (ID: %)', user_email, user_id_var;
    
    -- Cria o perfil se não existir
    INSERT INTO public.profiles (id, full_name, email)
    VALUES (user_id_var, COALESCE(user_name, user_email), user_email)
    ON CONFLICT (id) DO UPDATE SET
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        email = COALESCE(EXCLUDED.email, profiles.email),
        updated_at = NOW();
    
    RAISE NOTICE 'Perfil criado/atualizado para %', user_email;
    
    -- Verifica se já existe uma organização "Personal" para este usuário
    SELECT id INTO org_id_var
    FROM public.organizations
    WHERE slug = 'personal-' || user_id_var::TEXT;
    
    -- Se não existir, cria uma nova organização "Personal"
    IF org_id_var IS NULL THEN
        org_id_var := uuid_generate_v4();
        INSERT INTO public.organizations (id, name, type, slug)
        VALUES (org_id_var, 'Personal', 'personal', 'personal-' || user_id_var::TEXT)
        ON CONFLICT (id) DO NOTHING;
        
        RAISE NOTICE 'Organização "Personal" criada (ID: %)', org_id_var;
    ELSE
        RAISE NOTICE 'Organização "Personal" já existe (ID: %)', org_id_var;
    END IF;
    
    -- Adiciona o usuário como owner da organização se não estiver
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (org_id_var, user_id_var, 'owner')
    ON CONFLICT (organization_id, user_id) DO UPDATE SET
        role = 'owner';
    
    RAISE NOTICE 'Usuário adicionado como owner da organização';
    RAISE NOTICE '✅ Usuário % corrigido com sucesso!', user_email;
END $$;

-- ============================================================================
-- PARTE 3: CORRIGIR TODOS OS USUÁRIOS SEM DADOS (OPCIONAL)
-- ============================================================================

-- Se você quiser corrigir TODOS os usuários que não têm perfil/organização,
-- descomente o bloco abaixo:

/*
DO $$
DECLARE
    user_record RECORD;
    org_id_var UUID;
    user_name TEXT;
BEGIN
    -- Itera sobre todos os usuários que não têm perfil
    FOR user_record IN 
        SELECT u.id, u.email, u.raw_user_meta_data->>'full_name' as full_name
        FROM auth.users u
        LEFT JOIN public.profiles p ON u.id = p.id
        WHERE p.id IS NULL
    LOOP
        RAISE NOTICE 'Corrigindo usuário: % (ID: %)', user_record.email, user_record.id;
        
        -- Cria o perfil
        INSERT INTO public.profiles (id, full_name, email)
        VALUES (
            user_record.id, 
            COALESCE(user_record.full_name, user_record.email), 
            user_record.email
        )
        ON CONFLICT (id) DO NOTHING;
        
        -- Verifica se já existe organização
        SELECT id INTO org_id_var
        FROM public.organizations
        WHERE slug = 'personal-' || user_record.id::TEXT;
        
        -- Cria organização se não existir
        IF org_id_var IS NULL THEN
            org_id_var := uuid_generate_v4();
            INSERT INTO public.organizations (id, name, type, slug)
            VALUES (org_id_var, 'Personal', 'personal', 'personal-' || user_record.id::TEXT)
            ON CONFLICT (id) DO NOTHING;
        END IF;
        
        -- Adiciona como owner
        INSERT INTO public.organization_members (organization_id, user_id, role)
        VALUES (org_id_var, user_record.id, 'owner')
        ON CONFLICT (organization_id, user_id) DO NOTHING;
        
        RAISE NOTICE '✅ Usuário % corrigido', user_record.email;
    END LOOP;
    
    RAISE NOTICE '✅ Todos os usuários foram corrigidos!';
END $$;
*/

-- ============================================================================
-- PARTE 4: VERIFICAÇÃO
-- ============================================================================

-- Verifica se a política foi criada
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'organizations' 
            AND policyname = 'Users can view organizations they belong to'
        ) THEN '✅ Política organizations SELECT criada'
        ELSE '❌ ERRO: Política organizations SELECT não encontrada'
    END as status_policy;

-- Verifica o status do usuário corrigido
SELECT 
    u.email,
    CASE WHEN p.id IS NOT NULL THEN '✅' ELSE '❌' END as tem_perfil,
    CASE WHEN om.user_id IS NOT NULL THEN '✅' ELSE '❌' END as tem_organizacao,
    u.created_at as data_criacao
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.organization_members om ON u.id = om.user_id
WHERE u.email = 'lucasv.oliveira777@gmail.com';

-- ============================================================================
-- ✅ PRONTO!
-- ============================================================================
-- 
-- Após executar este script:
-- 1. A política de organizations foi recriada
-- 2. O usuário lucasv.oliveira777@gmail.com tem perfil e organização
-- 3. Tente fazer login novamente
-- 
-- Se quiser corrigir TODOS os usuários sem dados, descomente a PARTE 3
-- ============================================================================

