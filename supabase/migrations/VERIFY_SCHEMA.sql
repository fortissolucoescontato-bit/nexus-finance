-- ============================================================================
-- SCRIPT DE VERIFICAÇÃO - Verifica se o Schema está Completo
-- ============================================================================
-- Execute este script para verificar se todas as tabelas, triggers e políticas
-- foram criadas corretamente.
-- ============================================================================

-- 1. Verifica se todas as tabelas existem
SELECT 
    'Tabelas criadas:' as tipo,
    table_name as nome
FROM information_schema.tables 
WHERE table_schema = 'public' 
    AND table_name IN ('profiles', 'organizations', 'organization_members', 'accounts', 'categories', 'transactions')
ORDER BY table_name;

-- 2. Verifica se os triggers existem
SELECT 
    'Triggers criados:' as tipo,
    tgname as nome,
    tgrelid::regclass as tabela
FROM pg_trigger 
WHERE tgname IN (
    'update_profiles_updated_at',
    'update_organizations_updated_at',
    'update_organization_members_updated_at',
    'update_accounts_updated_at',
    'update_categories_updated_at',
    'update_transactions_updated_at',
    'on_auth_user_created'
)
ORDER BY tgname;

-- 3. Verifica se as funções existem
SELECT 
    'Funções criadas:' as tipo,
    routine_name as nome
FROM information_schema.routines
WHERE routine_schema = 'public'
    AND routine_name IN ('update_updated_at_column', 'handle_new_user')
ORDER BY routine_name;

-- 4. Verifica se as políticas RLS existem
SELECT 
    'Políticas RLS:' as tipo,
    schemaname || '.' || tablename as tabela,
    policyname as politica
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 5. Conta total de políticas por tabela
SELECT 
    'Total de políticas por tabela:' as tipo,
    tablename as tabela,
    COUNT(*) as total_politicas
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- 6. Verifica se RLS está habilitado
SELECT 
    'RLS habilitado:' as tipo,
    tablename as tabela,
    rowsecurity as rls_ativo
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'organizations', 'organization_members', 'accounts', 'categories', 'transactions')
ORDER BY tablename;

-- ============================================================================
-- RESULTADO ESPERADO:
-- ============================================================================
-- ✅ 6 tabelas devem aparecer
-- ✅ 7 triggers devem aparecer
-- ✅ 2 funções devem aparecer
-- ✅ Múltiplas políticas RLS (pelo menos 1 por tabela)
-- ✅ RLS ativo (rowsecurity = true) em todas as tabelas
-- ============================================================================

