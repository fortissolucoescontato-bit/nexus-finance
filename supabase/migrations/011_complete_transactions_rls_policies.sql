-- ============================================================================
-- MIGRAÇÃO: 011_complete_transactions_rls_policies.sql
-- DATA: 2025-01-XX
-- DESCRIÇÃO: Cria TODAS as políticas RLS necessárias para a tabela transactions
--            Garante que SELECT, INSERT, UPDATE e DELETE estejam configurados
-- ============================================================================

-- ============================================================================
-- GARANTE QUE RLS ESTÁ HABILITADO
-- ============================================================================

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- REMOVE TODAS AS POLÍTICAS EXISTENTES (para recriar do zero)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view transactions of their organizations" ON public.transactions;
DROP POLICY IF EXISTS "Members can create transactions in their organizations" ON public.transactions;
DROP POLICY IF EXISTS "Members can update transactions of their organizations" ON public.transactions;
DROP POLICY IF EXISTS "Members can delete transactions of their organizations" ON public.transactions;

-- ============================================================================
-- CRIA TODAS AS POLÍTICAS NECESSÁRIAS
-- ============================================================================

-- 1. SELECT: Usuários podem ver transações das organizações das quais são membros
CREATE POLICY "Users can view transactions of their organizations"
    ON public.transactions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.organization_members
            WHERE organization_members.organization_id = transactions.organization_id
            AND organization_members.user_id = auth.uid()
        )
    );

-- 2. INSERT: Membros podem criar transações em organizações das quais fazem parte
CREATE POLICY "Members can create transactions in their organizations"
    ON public.transactions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.organization_members
            WHERE organization_members.organization_id = transactions.organization_id
            AND organization_members.user_id = auth.uid()
        )
    );

-- 3. UPDATE: Membros podem atualizar transações de organizações das quais fazem parte
CREATE POLICY "Members can update transactions of their organizations"
    ON public.transactions
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
            FROM public.organization_members
            WHERE organization_members.organization_id = transactions.organization_id
            AND organization_members.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.organization_members
            WHERE organization_members.organization_id = transactions.organization_id
            AND organization_members.user_id = auth.uid()
        )
    );

-- 4. DELETE: Membros podem deletar transações de organizações das quais fazem parte
CREATE POLICY "Members can delete transactions of their organizations"
    ON public.transactions
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1
            FROM public.organization_members
            WHERE organization_members.organization_id = transactions.organization_id
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
WHERE tablename = 'transactions'
ORDER BY 
    CASE cmd
        WHEN 'SELECT' THEN 1
        WHEN 'INSERT' THEN 2
        WHEN 'UPDATE' THEN 3
        WHEN 'DELETE' THEN 4
    END;

-- Deve retornar 4 políticas:
-- 1. Users can view transactions of their organizations (SELECT)
-- 2. Members can create transactions in their organizations (INSERT)
-- 3. Members can update transactions of their organizations (UPDATE)
-- 4. Members can delete transactions of their organizations (DELETE)

