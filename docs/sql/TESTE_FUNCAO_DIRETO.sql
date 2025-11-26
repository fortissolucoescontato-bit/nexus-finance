-- ============================================================================
-- TESTE DIRETO DA FUNÇÃO
-- ============================================================================
-- Execute este SQL para testar se a função funciona diretamente no banco
-- Substitua pelo seu user_id: 618fce1f-056b-41fb-901b-c129282bd92b
-- ============================================================================

-- Teste 1: Verifica se você tem uma organização
SELECT 
    'Organizações existentes' as info,
    o.id,
    o.name,
    o.type,
    om.role
FROM public.organizations o
JOIN public.organization_members om ON om.organization_id = o.id
WHERE om.user_id = '618fce1f-056b-41fb-901b-c129282bd92b'::UUID;

-- Teste 2: Tenta criar organização diretamente (DESCOMENTE PARA TESTAR)
-- Se este teste funcionar, a função está OK e o problema é no código
-- Se não funcionar, a função precisa ser corrigida

/*
SELECT create_personal_organization(
    '618fce1f-056b-41fb-901b-c129282bd92b'::UUID,
    'Teste Organização'
) as organizacao_id;
*/

-- Teste 3: Verifica se a organização foi criada
-- Execute após o teste 2
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

