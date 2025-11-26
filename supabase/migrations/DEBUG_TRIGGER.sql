-- ============================================================================
-- DEBUG: Verificar Trigger e Função
-- ============================================================================
-- Execute este script para verificar se o trigger está funcionando
-- ============================================================================

-- 1. Verifica se o trigger existe
SELECT 
    'Trigger encontrado:' as status,
    tgname as nome_trigger,
    tgrelid::regclass as tabela,
    proname as nome_funcao
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'on_auth_user_created';

-- 2. Verifica se a função handle_new_user existe
SELECT 
    'Função encontrada:' as status,
    proname as nome_funcao,
    prokind as tipo,
    prosecdef as security_definer
FROM pg_proc
WHERE proname = 'handle_new_user';

-- 3. Verifica as políticas da tabela profiles
SELECT 
    'Políticas da tabela profiles:' as tipo,
    policyname as politica,
    cmd as comando,
    qual as condicao_using,
    with_check as condicao_check
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename = 'profiles';

-- 4. Verifica se há algum erro recente (se possível)
-- Nota: Isso pode não funcionar dependendo das configurações do Supabase
SELECT 
    'Últimos erros do banco (se disponível):' as info;

-- 5. Testa a função diretamente (simulação)
-- ATENÇÃO: Não execute isso em produção, apenas para debug
SELECT 
    'Para testar: Crie um usuário de teste no dashboard do Supabase Auth' as instrucao;

-- ============================================================================
-- POSSÍVEIS PROBLEMAS E SOLUÇÕES
-- ============================================================================
-- 
-- 1. Se o trigger não aparecer: Execute novamente o schema
-- 2. Se a função não tiver security_definer = true: A função precisa disso
-- 3. Se as políticas não permitirem INSERT: Verifique a política "System can insert profiles"
-- ============================================================================

