-- ============================================================================
-- TESTE APÓS CORREÇÃO
-- ============================================================================
-- Execute este SQL para testar a função corrigida
-- ============================================================================

-- Teste: Criar organização
SELECT create_personal_organization(
    '618fce1f-056b-41fb-901b-c129282bd92b'::UUID,
    'Teste Organização Corrigida'
) as organizacao_id;

-- Verifica se foi criada
SELECT 
    o.id,
    o.name,
    o.type,
    o.slug,
    om.user_id,
    om.role
FROM public.organizations o
JOIN public.organization_members om ON om.organization_id = o.id
WHERE om.user_id = '618fce1f-056b-41fb-901b-c129282bd92b'::UUID
ORDER BY o.created_at DESC
LIMIT 1;

-- ============================================================================
-- Se funcionar, você verá a organização criada!
-- ============================================================================

