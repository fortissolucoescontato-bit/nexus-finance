-- ============================================================================
-- VERIFICAÇÃO COMPLETA DO SETUP
-- ============================================================================

-- 1. Verifica se o trigger existe
SELECT 
    'Status do Trigger:' as verificação,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_trigger 
            WHERE tgname = 'on_auth_user_created'
        ) 
        THEN '✅ Trigger CRIADO e ATIVO'
        ELSE '❌ ERRO: Trigger NÃO encontrado'
    END as status;

-- 2. Verifica detalhes completos do trigger
SELECT 
    'Detalhes do Trigger:' as tipo,
    tgname as nome,
    tgrelid::regclass as tabela,
    CASE 
        WHEN tgenabled = 'O' THEN '✅ Ativo'
        WHEN tgenabled = 'D' THEN '❌ Desabilitado'
        ELSE '⚠️ Estado desconhecido: ' || tgenabled::text
    END as estado,
    proname as função_executada
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'on_auth_user_created';

-- 3. Resumo final
SELECT 
    '📊 RESUMO FINAL' as categoria,
    'Verifique todos os itens acima' as status;

