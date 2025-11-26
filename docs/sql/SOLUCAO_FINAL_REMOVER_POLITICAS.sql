-- ============================================================================
-- SOLUÇÃO FINAL: Remover Políticas Conflitantes
-- ============================================================================
-- PROBLEMA: Duas políticas de INSERT podem estar conflitando
-- SOLUÇÃO: Remover TODAS as políticas de INSERT e usar apenas a função stored procedure
-- ============================================================================

-- ============================================================================
-- PASSO 1: REMOVER TODAS AS POLÍTICAS DE INSERT
-- ============================================================================

-- Remove todas as políticas de INSERT existentes
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "System can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Owners can create organizations" ON public.organizations;

-- ============================================================================
-- PASSO 2: VERIFICAR SE A FUNÇÃO EXISTE
-- ============================================================================

-- Verifica se a função foi criada
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Função existe'
        ELSE '❌ Função NÃO existe - Execute a migração 004_create_organization_function.sql primeiro!'
    END as status_funcao,
    proname as nome_funcao,
    prosecdef as security_definer
FROM pg_proc
WHERE proname = 'create_personal_organization';

-- ============================================================================
-- PASSO 3: VERIFICAR POLÍTICAS RESTANTES
-- ============================================================================

-- Lista políticas de INSERT restantes (deve estar vazio após remover)
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
-- - O código DEVE usar a função stored procedure via .rpc()
-- - Se a função não existir, execute: supabase/migrations/004_create_organization_function.sql
-- 
-- TESTE: Tente criar uma organização agora!
-- ============================================================================

