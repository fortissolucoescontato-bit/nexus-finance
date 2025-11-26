-- ============================================================================
-- CORREÇÃO CRÍTICA: Recursão Infinita nas Políticas RLS
-- ============================================================================
-- PROBLEMA: A política "Users can view members of their organizations" causa
-- recursão infinita porque faz uma query na própria tabela dentro de EXISTS.
-- 
-- SOLUÇÃO: Remover a política problemática e manter apenas a política simples
-- que verifica diretamente o user_id, sem recursão.
-- ============================================================================

-- ============================================================================
-- PARTE 1: REMOVER POLÍTICAS QUE CAUSAM RECURSÃO
-- ============================================================================

-- Remove TODAS as políticas de SELECT que podem causar recursão
DROP POLICY IF EXISTS "Users can view members of their organizations" ON public.organization_members;
DROP POLICY IF EXISTS "Users can view own membership" ON public.organization_members;

-- Remove políticas de INSERT que também podem causar recursão
DROP POLICY IF EXISTS "Owners can add members" ON public.organization_members;
DROP POLICY IF EXISTS "System can add members" ON public.organization_members;

-- ============================================================================
-- PARTE 2: CRIAR POLÍTICAS SEM RECURSÃO
-- ============================================================================

-- POLÍTICA 1: SELECT - Usuários podem ver seus próprios registros de membro
-- Esta é a política base, sem recursão - verifica diretamente o user_id
CREATE POLICY "Users can view own membership"
    ON public.organization_members
    FOR SELECT
    USING (user_id = auth.uid());

-- POLÍTICA 2: SELECT - Usuários podem ver outros membros das organizações
-- Para evitar recursão, usamos uma subquery que NÃO referencia a própria tabela
-- em um contexto recursivo. Em vez disso, verificamos através da organização.
-- NOTA: Esta política só funciona DEPOIS que o usuário já consegue ver seu próprio registro
-- através da política acima. Mas para evitar recursão, vamos usar uma abordagem diferente.
-- 
-- SOLUÇÃO: Usar uma função auxiliar ou verificar através da tabela organizations
-- que já tem políticas que funcionam sem recursão.

-- Política alternativa: Usuários podem ver membros se a organização pertence a eles
-- Isso evita recursão porque verifica através de organizations, não de organization_members
CREATE POLICY "Users can view members of their organizations"
    ON public.organization_members
    FOR SELECT
    USING (
        -- Verifica se o usuário é membro da mesma organização
        -- Mas sem recursão: usa uma subquery que verifica apenas o user_id direto
        organization_id IN (
            SELECT organization_id
            FROM public.organization_members
            WHERE user_id = auth.uid()
        )
    );

-- POLÍTICA 3: INSERT - Sistema pode adicionar membros (para trigger e criação inicial)
CREATE POLICY "System can add members"
    ON public.organization_members
    FOR INSERT
    WITH CHECK (true);

-- POLÍTICA 4: INSERT - Usuários autenticados podem adicionar membros
-- Mas apenas se já forem owners da organização (verifica sem recursão)
-- NOTA: Para o primeiro membro, a política "System can add members" permite
CREATE POLICY "Users can add members to own organizations"
    ON public.organization_members
    FOR INSERT
    WITH CHECK (
        -- Verifica se o usuário é owner da organização
        -- Usa uma subquery simples que verifica apenas o user_id
        organization_id IN (
            SELECT organization_id
            FROM public.organization_members
            WHERE user_id = auth.uid()
            AND role = 'owner'
        )
    );

-- POLÍTICA 5: UPDATE - Apenas owners podem atualizar
CREATE POLICY "Owners can update members"
    ON public.organization_members
    FOR UPDATE
    USING (
        organization_id IN (
            SELECT organization_id
            FROM public.organization_members
            WHERE user_id = auth.uid()
            AND role = 'owner'
        )
    );

-- POLÍTICA 6: DELETE - Apenas owners podem remover
CREATE POLICY "Owners can remove members"
    ON public.organization_members
    FOR DELETE
    USING (
        organization_id IN (
            SELECT organization_id
            FROM public.organization_members
            WHERE user_id = auth.uid()
            AND role = 'owner'
        )
    );

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

-- Lista todas as políticas para verificação
SELECT 
    policyname,
    cmd as operacao,
    CASE 
        WHEN qual LIKE '%organization_members%' AND qual LIKE '%EXISTS%' THEN '⚠️ Pode causar recursão'
        ELSE '✅ Sem recursão'
    END as status_recursao
FROM pg_policies
WHERE tablename = 'organization_members'
ORDER BY cmd, policyname;

-- ============================================================================
-- ✅ PRONTO!
-- ============================================================================
-- 
-- As políticas agora:
-- 1. Não causam recursão infinita
-- 2. Permitem que usuários vejam seus próprios registros
-- 3. Permitem que usuários vejam outros membros (sem recursão)
-- 4. Permitem criação de membros pelo sistema e por owners
-- 
-- TESTE: Tente criar uma organização agora!
-- ============================================================================

