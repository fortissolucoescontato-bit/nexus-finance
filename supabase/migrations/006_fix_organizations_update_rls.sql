-- ============================================================================
-- CORREÇÃO: Política RLS para UPDATE em Organizations
-- ============================================================================
-- PROBLEMA: A política de UPDATE pode não estar funcionando corretamente
-- porque falta a cláusula WITH CHECK para UPDATE.
-- 
-- SOLUÇÃO: Recriar a política com USING e WITH CHECK para garantir
-- que tanto a verificação quanto a atualização funcionem corretamente.
-- ============================================================================

-- Remove a política antiga
DROP POLICY IF EXISTS "Owners can update organizations" ON public.organizations;

-- Cria a política completa com USING (para verificar linhas existentes) 
-- e WITH CHECK (para verificar linhas atualizadas)
CREATE POLICY "Owners can update organizations"
    ON public.organizations
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
            FROM public.organization_members
            WHERE organization_members.organization_id = organizations.id
            AND organization_members.user_id = auth.uid()
            AND organization_members.role = 'owner'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.organization_members
            WHERE organization_members.organization_id = organizations.id
            AND organization_members.user_id = auth.uid()
            AND organization_members.role = 'owner'
        )
    );

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

-- Lista todas as políticas de UPDATE para organizations
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'organizations' AND cmd = 'UPDATE';

