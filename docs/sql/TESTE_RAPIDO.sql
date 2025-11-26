-- ============================================================================
-- TESTE RÁPIDO: Verificar se tudo está OK
-- ============================================================================

-- 1. Função existe?
SELECT 
    'Função existe?' as pergunta,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ SIM'
        ELSE '❌ NÃO - Execute EXECUTAR_AGORA.sql'
    END as resposta
FROM pg_proc
WHERE proname = 'create_personal_organization';

-- 2. Políticas de INSERT removidas?
SELECT 
    'Políticas de INSERT removidas?' as pergunta,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ SIM'
        ELSE '❌ NÃO - Ainda existem ' || COUNT(*) || ' políticas'
    END as resposta
FROM pg_policies
WHERE tablename = 'organizations'
AND cmd = 'INSERT';

-- 3. Função tem SECURITY DEFINER?
SELECT 
    'Função tem SECURITY DEFINER?' as pergunta,
    CASE 
        WHEN prosecdef = true THEN '✅ SIM'
        ELSE '❌ NÃO'
    END as resposta
FROM pg_proc
WHERE proname = 'create_personal_organization';

-- ============================================================================
-- Se todas as respostas forem ✅, está tudo OK!
-- Agora teste criar uma organização na aplicação.
-- ============================================================================


