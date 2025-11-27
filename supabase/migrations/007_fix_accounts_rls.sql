-- ============================================================================
-- MIGRAÇÃO: 007_fix_accounts_rls.sql
-- DATA: 2025-01-XX
-- DESCRIÇÃO: Garante que as políticas RLS para 'accounts' estão corretas
--            e permitem que membros da organização criem contas.
-- ============================================================================

-- ============================================================================
-- GARANTE QUE RLS ESTÁ HABILITADO
-- ============================================================================

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- REMOVE POLÍTICAS ANTIGAS (se existirem)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view accounts of their organizations" ON public.accounts;
DROP POLICY IF EXISTS "Members can create accounts in their organizations" ON public.accounts;
DROP POLICY IF EXISTS "Members can update accounts of their organizations" ON public.accounts;
DROP POLICY IF EXISTS "Members can delete accounts of their organizations" ON public.accounts;

-- ============================================================================
-- POLÍTICAS: accounts
-- ============================================================================

-- Usuários podem ver contas apenas das organizações das quais são membros
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

-- Membros podem criar contas em organizações das quais fazem parte
-- IMPORTANTE: WITH CHECK verifica o organization_id que está sendo inserido
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

-- Membros podem atualizar contas de organizações das quais fazem parte
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

-- Membros podem deletar contas de organizações das quais fazem parte
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

-- Lista todas as políticas para a tabela accounts
SELECT
    polname AS policy_name,
    permissive,
    roles,
    cmd AS command,
    qual AS using_expression,
    with_check AS with_check_expression
FROM pg_policies
WHERE tablename = 'accounts'
ORDER BY cmd, polname;

-- Verifica se RLS está habilitado
SELECT 
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'accounts';

-- ============================================================================
-- NOTAS
-- ============================================================================
-- Se ainda houver erro após executar esta migração:
-- 1. Verifique se o usuário está autenticado (auth.uid() não é NULL)
-- 2. Verifique se o usuário é membro da organização (existe em organization_members)
-- 3. Verifique se o organization_id na inserção corresponde à organização do usuário
-- ============================================================================

