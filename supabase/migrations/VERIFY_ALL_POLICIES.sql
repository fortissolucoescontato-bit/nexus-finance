-- ============================================================================
-- VERIFICAÇÃO COMPLETA: Todas as Políticas RLS
-- ============================================================================
-- Este script verifica todas as políticas RLS das tabelas críticas
-- para garantir que o acesso está funcionando corretamente
-- ============================================================================

-- ============================================================================
-- 1. POLÍTICAS: profiles
-- ============================================================================

SELECT 
    'profiles' as tabela,
    policyname,
    cmd as operacao,
    qual as condicao_select,
    with_check as condicao_insert_update
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY cmd, policyname;

-- ============================================================================
-- 2. POLÍTICAS: organizations
-- ============================================================================

SELECT 
    'organizations' as tabela,
    policyname,
    cmd as operacao,
    qual as condicao_select,
    with_check as condicao_insert_update
FROM pg_policies
WHERE tablename = 'organizations'
ORDER BY cmd, policyname;

-- ============================================================================
-- 3. POLÍTICAS: organization_members
-- ============================================================================

SELECT 
    'organization_members' as tabela,
    policyname,
    cmd as operacao,
    qual as condicao_select,
    with_check as condicao_insert_update
FROM pg_policies
WHERE tablename = 'organization_members'
ORDER BY cmd, policyname;

-- ============================================================================
-- 4. VERIFICAÇÃO: Políticas Críticas que DEVEM Existir
-- ============================================================================

-- Verifica se as políticas críticas existem
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'profiles' 
            AND policyname = 'Users can view own profile'
        ) THEN '✅ Política profiles SELECT existe'
        ELSE '❌ ERRO: Política profiles SELECT não encontrada'
    END as status_profiles_select;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'profiles' 
            AND policyname = 'System can insert profiles'
        ) THEN '✅ Política profiles INSERT existe'
        ELSE '❌ ERRO: Política profiles INSERT não encontrada'
    END as status_profiles_insert;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'organization_members' 
            AND policyname = 'Users can view own membership'
        ) THEN '✅ Política organization_members SELECT (próprio) existe'
        ELSE '❌ ERRO: Política organization_members SELECT (próprio) não encontrada'
    END as status_members_select_own;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'organization_members' 
            AND policyname = 'System can add members'
        ) THEN '✅ Política organization_members INSERT (sistema) existe'
        ELSE '❌ ERRO: Política organization_members INSERT (sistema) não encontrada'
    END as status_members_insert_system;

SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'organizations' 
            AND policyname = 'Users can view organizations they belong to'
        ) THEN '✅ Política organizations SELECT existe'
        ELSE '❌ ERRO: Política organizations SELECT não encontrada'
    END as status_orgs_select;

-- ============================================================================
-- 5. TESTE DE ACESSO (Simulação)
-- ============================================================================
-- NOTA: Este teste só funciona se você estiver autenticado
-- Execute enquanto estiver logado como um usuário de teste

-- Verifica se o usuário atual pode ver seu próprio perfil
-- (Só funciona se você estiver autenticado)
DO $$
DECLARE
    current_user_id UUID;
    profile_count INT;
    members_count INT;
    orgs_count INT;
BEGIN
    -- Tenta obter o ID do usuário atual
    current_user_id := auth.uid();
    
    IF current_user_id IS NULL THEN
        RAISE NOTICE '⚠️ Nenhum usuário autenticado. Execute este script enquanto estiver logado.';
        RETURN;
    END IF;
    
    -- Conta quantos perfis o usuário pode ver
    SELECT COUNT(*) INTO profile_count
    FROM public.profiles
    WHERE id = current_user_id;
    
    -- Conta quantos membros o usuário pode ver
    SELECT COUNT(*) INTO members_count
    FROM public.organization_members
    WHERE user_id = current_user_id;
    
    -- Conta quantas organizações o usuário pode ver
    SELECT COUNT(*) INTO orgs_count
    FROM public.organizations
    WHERE EXISTS (
        SELECT 1
        FROM public.organization_members
        WHERE organization_members.organization_id = organizations.id
        AND organization_members.user_id = current_user_id
    );
    
    RAISE NOTICE '📊 Resultados do Teste de Acesso:';
    RAISE NOTICE '   User ID: %', current_user_id;
    RAISE NOTICE '   Perfis visíveis: %', profile_count;
    RAISE NOTICE '   Membros visíveis: %', members_count;
    RAISE NOTICE '   Organizações visíveis: %', orgs_count;
    
    IF profile_count = 0 THEN
        RAISE WARNING '⚠️ Usuário não consegue ver seu próprio perfil!';
    END IF;
    
    IF members_count = 0 THEN
        RAISE WARNING '⚠️ Usuário não consegue ver seus próprios membros!';
    END IF;
    
    IF orgs_count = 0 THEN
        RAISE WARNING '⚠️ Usuário não consegue ver suas organizações!';
    END IF;
    
    IF profile_count > 0 AND members_count > 0 AND orgs_count > 0 THEN
        RAISE NOTICE '✅ Tudo funcionando corretamente!';
    END IF;
END $$;

-- ============================================================================
-- ✅ CONCLUSÃO
-- ============================================================================
-- 
-- Analise os resultados acima:
-- 1. Verifique se todas as políticas críticas existem (devem mostrar ✅)
-- 2. Se alguma política estiver faltando, execute o script FIX_RLS_USER_ACCESS.sql
-- 3. O teste de acesso mostra se você consegue ver seus próprios dados
-- 
-- Se o teste mostrar problemas, execute o script DIAGNOSTIC_AND_FIX_ACCESS.sql
-- ============================================================================

