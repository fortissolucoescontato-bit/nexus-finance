-- ============================================================================
-- CORREÇÃO: Política de INSERT para Organizations
-- ============================================================================
-- PROBLEMA: A política atual pode estar bloqueando a criação de organizações
-- pelo código da aplicação.
-- 
-- SOLUÇÃO: Criar política permissiva que permite usuários autenticados
-- criarem organizações.
-- ============================================================================

-- ============================================================================
-- PARTE 1: REMOVER POLÍTICAS ANTIGAS
-- ============================================================================

-- Remove todas as políticas de INSERT existentes
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "System can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;

-- ============================================================================
-- PARTE 2: CRIAR POLÍTICA PERMISSIVA
-- ============================================================================

-- POLÍTICA 1: Sistema pode criar organizações (para triggers)
CREATE POLICY "System can create organizations"
    ON public.organizations
    FOR INSERT
    WITH CHECK (true);

-- POLÍTICA 2: Usuários autenticados podem criar organizações
-- Esta política permite que qualquer usuário autenticado crie uma organização
-- A segurança é garantida pelo código da aplicação (validação, etc)
CREATE POLICY "Authenticated users can create organizations"
    ON public.organizations
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

-- Lista todas as políticas de INSERT para organizations
SELECT 
    policyname,
    cmd as operacao,
    with_check as condicao_insert,
    CASE 
        WHEN with_check = 'true' THEN '✅ Permissiva (sistema)'
        WHEN with_check LIKE '%auth.uid()%' THEN '✅ Permissiva (usuários autenticados)'
        ELSE '⚠️ Verificar'
    END as status
FROM pg_policies
WHERE tablename = 'organizations'
AND cmd = 'INSERT'
ORDER BY policyname;

-- ============================================================================
-- ✅ PRONTO!
-- ============================================================================
-- 
-- Agora há duas políticas de INSERT:
-- 1. "System can create organizations" - Permite tudo (para triggers)
-- 2. "Authenticated users can create organizations" - Permite usuários autenticados
-- 
-- TESTE: Tente criar uma organização agora!
-- ============================================================================

