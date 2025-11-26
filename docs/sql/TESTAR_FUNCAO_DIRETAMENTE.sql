-- ============================================================================
-- TESTE DIRETO DA FUNÇÃO
-- ============================================================================
-- Execute este SQL para testar a função diretamente no banco
-- Substitua 'SEU_USER_ID' pelo ID do seu usuário (618fce1f-056b-41fb-901b-c129282bd92b)
-- ============================================================================

-- Teste 1: Verifica se a função existe e tem permissões
SELECT 
    proname,
    prosecdef,
    proargtypes::regtype[] as argumentos,
    prorettype::regtype as retorno
FROM pg_proc
WHERE proname = 'create_personal_organization';

-- Teste 2: Verifica permissões
SELECT 
    grantee,
    privilege_type
FROM information_schema.routine_privileges
WHERE routine_name = 'create_personal_organization'
AND routine_schema = 'public';

-- Teste 3: Testa a função diretamente (substitua pelo seu user_id)
-- DESCOMENTE E EXECUTE:
/*
SELECT create_personal_organization(
    '618fce1f-056b-41fb-901b-c129282bd92b'::UUID,
    'Teste Organização'
) as organizacao_id;
*/

-- Teste 4: Verifica se a organização foi criada
-- Execute após o teste 3:
/*
SELECT 
    o.id,
    o.name,
    o.type,
    o.slug,
    om.user_id,
    om.role
FROM public.organizations o
JOIN public.organization_members om ON om.organization_id = o.id
WHERE om.user_id = '618fce1f-056b-41fb-901b-c129282bd92b'::UUID;
*/

-- ============================================================================
-- DIAGNÓSTICO: Verifica se há problemas com RLS na função
-- ============================================================================

-- Verifica se RLS está habilitado nas tabelas
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_habilitado
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('organizations', 'organization_members', 'profiles')
ORDER BY tablename;

-- ============================================================================
-- SOLUÇÃO ALTERNATIVA: Desabilitar RLS temporariamente na função
-- ============================================================================

-- Se o teste acima falhar, podemos modificar a função para desabilitar RLS
-- durante a execução. Mas primeiro vamos testar se a função atual funciona.


