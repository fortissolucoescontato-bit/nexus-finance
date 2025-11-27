-- ============================================================================
-- MIGRAÇÃO: 010_complete_categories_rls_policies.sql
-- DATA: 2025-01-XX
-- DESCRIÇÃO: Cria TODAS as políticas RLS necessárias para a tabela categories
--            Garante que SELECT, INSERT, UPDATE e DELETE estejam configurados
-- ============================================================================

-- ============================================================================
-- GARANTE QUE RLS ESTÁ HABILITADO
-- ============================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- REMOVE TODAS AS POLÍTICAS EXISTENTES (para recriar do zero)
-- ============================================================================

DROP POLICY IF EXISTS "Users can view categories of their organizations" ON public.categories;
DROP POLICY IF EXISTS "Members can create categories in their organizations" ON public.categories;
DROP POLICY IF EXISTS "Members can update categories of their organizations" ON public.categories;
DROP POLICY IF EXISTS "Members can delete categories of their organizations" ON public.categories;

-- ============================================================================
-- CRIA TODAS AS POLÍTICAS NECESSÁRIAS
-- ============================================================================

-- 1. SELECT: Usuários podem ver categorias das organizações das quais são membros
CREATE POLICY "Users can view categories of their organizations"
    ON public.categories
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.organization_members
            WHERE organization_members.organization_id = categories.organization_id
            AND organization_members.user_id = auth.uid()
        )
    );

-- 2. INSERT: Membros podem criar categorias em organizações das quais fazem parte
CREATE POLICY "Members can create categories in their organizations"
    ON public.categories
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.organization_members
            WHERE organization_members.organization_id = categories.organization_id
            AND organization_members.user_id = auth.uid()
        )
    );

-- 3. UPDATE: Membros podem atualizar categorias de organizações das quais fazem parte
CREATE POLICY "Members can update categories of their organizations"
    ON public.categories
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
            FROM public.organization_members
            WHERE organization_members.organization_id = categories.organization_id
            AND organization_members.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.organization_members
            WHERE organization_members.organization_id = categories.organization_id
            AND organization_members.user_id = auth.uid()
        )
    );

-- 4. DELETE: Membros podem deletar categorias de organizações das quais fazem parte
CREATE POLICY "Members can delete categories of their organizations"
    ON public.categories
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1
            FROM public.organization_members
            WHERE organization_members.organization_id = categories.organization_id
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
WHERE tablename = 'categories'
ORDER BY 
    CASE cmd
        WHEN 'SELECT' THEN 1
        WHEN 'INSERT' THEN 2
        WHEN 'UPDATE' THEN 3
        WHEN 'DELETE' THEN 4
    END;

-- Deve retornar 4 políticas:
-- 1. Users can view categories of their organizations (SELECT)
-- 2. Members can create categories in their organizations (INSERT)
-- 3. Members can update categories of their organizations (UPDATE)
-- 4. Members can delete categories of their organizations (DELETE)

