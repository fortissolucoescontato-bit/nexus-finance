-- ============================================================================
-- VERIFICAÇÃO COMPLETA: Função e Permissões
-- ============================================================================
-- Execute este SQL para verificar se tudo está configurado corretamente
-- ============================================================================

-- ============================================================================
-- 1. Verifica se a função existe
-- ============================================================================
SELECT 
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ Função EXISTE'
        ELSE '❌ Função NÃO EXISTE - Execute EXECUTAR_AGORA.sql novamente!'
    END as status_funcao,
    proname as nome_funcao,
    prosecdef as security_definer,
    proargtypes::regtype[] as tipos_argumentos
FROM pg_proc
WHERE proname = 'create_personal_organization';

-- ============================================================================
-- 2. Verifica permissões da função
-- ============================================================================
SELECT 
    'Permissões da função' as info,
    grantee as role,
    privilege_type as permissao
FROM information_schema.routine_privileges
WHERE routine_name = 'create_personal_organization'
AND routine_schema = 'public'
ORDER BY grantee;

-- ============================================================================
-- 3. Verifica políticas de INSERT (deve estar vazio)
-- ============================================================================
SELECT 
    'Políticas de INSERT' as info,
    COUNT(*) as total,
    CASE 
        WHEN COUNT(*) = 0 THEN '✅ Correto - Nenhuma política de INSERT'
        ELSE '⚠️ Ainda existem políticas de INSERT'
    END as status
FROM pg_policies
WHERE tablename = 'organizations'
AND cmd = 'INSERT';

-- ============================================================================
-- 4. Lista todas as políticas da tabela organizations
-- ============================================================================
SELECT 
    'Todas as políticas' as info,
    policyname as nome,
    cmd as comando,
    CASE 
        WHEN cmd = 'INSERT' THEN '⚠️ Deve ser removida'
        ELSE '✅ OK'
    END as status
FROM pg_policies
WHERE tablename = 'organizations'
ORDER BY cmd, policyname;

-- ============================================================================
-- 5. Teste rápido (opcional - descomente para testar)
-- ============================================================================
-- Descomente as linhas abaixo para testar a função com seu user_id
-- Substitua 'SEU_USER_ID_AQUI' pelo ID do seu usuário

/*
SELECT create_personal_organization(
    'SEU_USER_ID_AQUI'::UUID,
    'Teste Organização'
) as organizacao_criada;
*/

-- ============================================================================
-- ✅ Se tudo estiver OK:
-- ============================================================================
-- 1. Função existe com security_definer = true
-- 2. Permissões para 'authenticated' e 'anon'
-- 3. Total de políticas de INSERT = 0
-- 4. Apenas políticas de SELECT, UPDATE, DELETE devem existir
-- ============================================================================


