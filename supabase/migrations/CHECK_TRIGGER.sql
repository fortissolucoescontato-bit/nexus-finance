-- ============================================================================
-- VERIFICAÇÃO RÁPIDA: Trigger e Função
-- ============================================================================

-- Verifica se o trigger existe
SELECT 
    'Trigger:' as tipo,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_trigger 
            WHERE tgname = 'on_auth_user_created'
        ) 
        THEN '✅ Trigger criado com sucesso'
        ELSE '❌ ERRO: Trigger não encontrado'
    END as status;

-- Verifica detalhes do trigger
SELECT 
    'Detalhes do Trigger:' as tipo,
    tgname as nome_trigger,
    tgrelid::regclass as tabela_alvo,
    proname as nome_funcao
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'on_auth_user_created';

-- Verifica a função
SELECT 
    'Função:' as tipo,
    proname as nome,
    prosecdef as security_definer,
    CASE 
        WHEN prosecdef THEN '✅ Tem privilégios elevados'
        ELSE '❌ Precisa de SECURITY DEFINER'
    END as status_privilegios
FROM pg_proc
WHERE proname = 'handle_new_user';

-- Verifica políticas de INSERT
SELECT 
    'Políticas de INSERT:' as tipo,
    tablename as tabela,
    policyname as politica,
    cmd as comando
FROM pg_policies
WHERE schemaname = 'public'
    AND cmd = 'INSERT'
    AND tablename IN ('profiles', 'organizations', 'organization_members')
ORDER BY tablename;

