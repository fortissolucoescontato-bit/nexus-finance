-- ============================================================================
-- CORREÇÃO: Políticas RLS para Permitir Acesso aos Próprios Dados
-- ============================================================================
-- PROBLEMA: Usuários recém-criados podem não conseguir ver seus próprios
-- registros de membro de organização devido a políticas RLS muito restritivas.
-- 
-- SOLUÇÃO: Adicionar política que permite que usuários vejam seus próprios
-- registros de membro diretamente, sem depender de verificação circular.
-- ============================================================================

-- ============================================================================
-- CORREÇÃO 1: organization_members - Permitir ver próprio registro
-- ============================================================================

-- IMPORTANTE: Remove políticas antigas que podem causar conflitos
-- A política "Users can view members of their organizations" usa verificação
-- circular que pode não funcionar para novos usuários
DROP POLICY IF EXISTS "Users can view members of their organizations" ON public.organization_members;
DROP POLICY IF EXISTS "Users can view own membership" ON public.organization_members;

-- NOVA POLÍTICA: Usuários podem ver seus próprios registros de membro
-- Esta política é mais permissiva e garante que um usuário sempre possa
-- ver que é membro de uma organização, mesmo que seja o único membro
CREATE POLICY "Users can view own membership"
    ON public.organization_members
    FOR SELECT
    USING (user_id = auth.uid());

-- POLÍTICA ADICIONAL: Usuários podem ver membros das organizações das quais fazem parte
-- Esta política complementa a anterior, permitindo ver outros membros da mesma organização
-- Mas só funciona se o usuário já conseguir ver seu próprio registro (política acima)
CREATE POLICY "Users can view members of their organizations"
    ON public.organization_members
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.organization_members om
            WHERE om.organization_id = organization_members.organization_id
            AND om.user_id = auth.uid()
        )
    );

-- ============================================================================
-- CORREÇÃO 2: Garantir que políticas de INSERT permitam criação pelo trigger
-- ============================================================================

-- Verifica se a política permissiva para INSERT em organization_members existe
-- Se não existir, cria uma política que permite INSERT pelo sistema (trigger)
DROP POLICY IF EXISTS "System can add members" ON public.organization_members;

-- Política permissiva para INSERT (usada pelo trigger handle_new_user)
-- Esta política permite que o trigger adicione membros sem verificar se o
-- usuário já é membro (evita problema de ovo e galinha)
CREATE POLICY "System can add members"
    ON public.organization_members
    FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

-- Lista todas as políticas de organization_members para verificação
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
WHERE tablename = 'organization_members'
ORDER BY policyname;

-- ============================================================================
-- ✅ PRONTO!
-- ============================================================================
-- 
-- Após executar este script:
-- 1. As políticas RLS agora permitem que usuários vejam seus próprios membros
-- 2. O trigger pode criar membros sem problemas de RLS
-- 3. Teste fazer login novamente
-- 
-- Se ainda não funcionar:
-- 1. Execute o script DIAGNOSTIC_AND_FIX_ACCESS.sql para verificar dados
-- 2. Verifique se o email foi confirmado no Supabase Dashboard
-- 3. Verifique os logs do servidor para erros específicos
-- ============================================================================

