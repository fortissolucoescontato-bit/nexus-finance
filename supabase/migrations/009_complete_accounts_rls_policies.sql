-- ============================================================================
-- MIGRAÇÃO: 009_complete_accounts_rls_policies.sql
-- DATA: 2025-01-XX
-- DESCRIÇÃO: Cria TODAS as políticas RLS necessárias para a tabela accounts
--            Garante que SELECT, INSERT, UPDATE e DELETE estejam configurados
-- ============================================================================

-- ============================================================================
-- GARANTE QUE RLS ESTÁ HABILITADO
-- ============================================================================

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- REMOVE TODAS AS POLÍTICAS EXISTENTES (para recriar do zero)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view accounts of their organizations" ON public.accounts;
DROP POLICY IF EXISTS "Members can create accounts in their organizations" ON public.accounts;
DROP POLICY IF EXISTS "Members can update accounts of their organizations" ON public.accounts;
DROP POLICY IF EXISTS "Members can delete accounts of their organizations" ON public.accounts;

-- ============================================================================
-- CRIA TODAS AS POLÍTICAS NECESSÁRIAS
-- ============================================================================

-- 1. SELECT: Usuários podem ver contas das organizações das quais são membros
CREATE POLICY "Users can view accounts of their organizations"
    ON public.accounts
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.organization_members
            WHERE organization_members.organization_id = accounts.organization_id
            AND organization_members.user_id = auth.uid()
        )
    );

-- 2. INSERT: Membros podem criar contas em organizações das quais fazem parte
CREATE POLICY "Members can create accounts in their organizations"
    ON public.accounts
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.organization_members
            WHERE organization_members.organization_id = accounts.organization_id
            AND organization_members.user_id = auth.uid()
        )
    );

-- 3. UPDATE: Membros podem atualizar contas de organizações das quais fazem parte
CREATE POLICY "Members can update accounts of their organizations"
    ON public.accounts
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
            FROM public.organization_members
            WHERE organization_members.organization_id = accounts.organization_id
            AND organization_members.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.organization_members
            WHERE organization_members.organization_id = accounts.organization_id
            AND organization_members.user_id = auth.uid()
        )
    );

-- 4. DELETE: Membros podem deletar contas de organizações das quais fazem parte
CREATE POLICY "Members can delete accounts of their organizations"
    ON public.accounts
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1
            FROM public.organization_members
            WHERE organization_members.organization_id = accounts.organization_id
            AND organization_members.user_id = auth.uid()
        )
    );

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

-- Lista todas as políticas criadas
SELECT
    polname AS policy_name,
    cmd AS command,
    permissive,
    roles
FROM pg_policies
WHERE tablename = 'accounts'
ORDER BY 
    CASE cmd
        WHEN 'SELECT' THEN 1
        WHEN 'INSERT' THEN 2
        WHEN 'UPDATE' THEN 3
        WHEN 'DELETE' THEN 4
    END;

-- Deve retornar 4 políticas:
-- 1. Users can view accounts of their organizations (SELECT)
-- 2. Members can create accounts in their organizations (INSERT)
-- 3. Members can update accounts of their organizations (UPDATE)
-- 4. Members can delete accounts of their organizations (DELETE)

-- ============================================================================
-- NOTAS
-- ============================================================================
-- Se ainda houver erro após executar esta migração:
-- 1. Verifique se auth.uid() retorna o ID do usuário (execute: SELECT auth.uid();)
-- 2. Verifique se o usuário está em organization_members:
--    SELECT * FROM organization_members WHERE user_id = auth.uid();
-- 3. Verifique se o organization_id na inserção corresponde ao do usuário
-- ============================================================================

