-- ============================================================================
-- CORREÇÃO DEFINITIVA: Política RLS para INSERT em Organizations
-- ============================================================================
-- PROBLEMA: "new row violates row-level security policy for table 'organizations'"
-- 
-- CAUSA: A política atual usa auth.role() = 'authenticated' que pode não
-- funcionar corretamente em todos os contextos do Supabase.
-- 
-- SOLUÇÃO: Usar auth.uid() IS NOT NULL que é mais confiável e direto.
-- ============================================================================

-- ============================================================================
-- PARTE 1: REMOVER TODAS AS POLÍTICAS DE INSERT EXISTENTES
-- ============================================================================

-- Remove todas as políticas de INSERT para organizations (evita conflitos)
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "System can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Owners can create organizations" ON public.organizations;

-- ============================================================================
-- PARTE 2: CRIAR POLÍTICA CORRIGIDA
-- ============================================================================

-- Política para usuários autenticados criarem organizações
-- Usa auth.uid() IS NOT NULL ao invés de auth.role() = 'authenticated'
-- Isso é mais confiável e funciona corretamente com o Supabase SSR
CREATE POLICY "Authenticated users can create organizations"
    ON public.organizations
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- PARTE 3: CORRIGIR POLÍTICA DE INSERT PARA organization_members
-- ============================================================================

-- PROBLEMA: A política atual "Owners can add members" exige que você já seja
-- owner para adicionar membros. Mas quando você cria uma organização, você
-- ainda não é membro dela, então não pode adicionar a si mesmo como owner!
-- 
-- SOLUÇÃO: Adicionar política que permite usuários adicionarem a si mesmos
-- como owner quando criam uma nova organização.

-- Remove políticas antigas de INSERT
DROP POLICY IF EXISTS "Owners can add members" ON public.organization_members;
DROP POLICY IF EXISTS "Users can add themselves as owner" ON public.organization_members;
DROP POLICY IF EXISTS "System can add members" ON public.organization_members;

-- POLÍTICA 1: Permite usuários adicionarem a si mesmos como owner
-- (Necessário quando criam uma nova organização)
CREATE POLICY "Users can add themselves as owner"
    ON public.organization_members
    FOR INSERT
    WITH CHECK (
        -- Permite se o usuário está adicionando a si mesmo como owner
        user_id = auth.uid() AND role = 'owner'
    );

-- POLÍTICA 2: Permite owners adicionarem outros membros
-- (Para adicionar membros depois que a organização já existe)
CREATE POLICY "Owners can add members"
    ON public.organization_members
    FOR INSERT
    WITH CHECK (
        -- Permite se já é owner da organização
        EXISTS (
            SELECT 1
            FROM public.organization_members om
            WHERE om.organization_id = organization_members.organization_id
            AND om.user_id = auth.uid()
            AND om.role = 'owner'
        )
    );

-- ============================================================================
-- VERIFICAÇÃO: Lista todas as políticas de INSERT
-- ============================================================================

-- Verifica políticas de organizations
SELECT 
    'organizations' as tabela,
    policyname as nome_politica,
    cmd as operacao,
    with_check as condicao,
    CASE 
        WHEN with_check LIKE '%auth.uid()%' THEN '✅ CORRETO'
        WHEN with_check = 'true' THEN '⚠️ Muito permissiva'
        ELSE '❌ VERIFICAR'
    END as status
FROM pg_policies
WHERE tablename = 'organizations'
AND cmd = 'INSERT'
ORDER BY policyname;

-- Verifica políticas de organization_members
SELECT 
    'organization_members' as tabela,
    policyname as nome_politica,
    cmd as operacao,
    with_check as condicao,
    CASE 
        WHEN with_check LIKE '%auth.uid()%' THEN '✅ CORRETO'
        WHEN with_check = 'true' THEN '⚠️ Muito permissiva'
        ELSE '❌ VERIFICAR'
    END as status
FROM pg_policies
WHERE tablename = 'organization_members'
AND cmd = 'INSERT'
ORDER BY policyname;

-- ============================================================================
-- ✅ PRONTO!
-- ============================================================================
-- 
-- Agora a política de INSERT para organizations:
-- - Usa auth.uid() IS NOT NULL (mais confiável)
-- - Permite qualquer usuário autenticado criar uma organização
-- 
-- E a política para organization_members:
-- - Permite usuários adicionarem a si mesmos como owner
-- - Permite owners adicionarem outros membros
-- 
-- TESTE: Tente criar uma organização agora através do dashboard!
-- ============================================================================

