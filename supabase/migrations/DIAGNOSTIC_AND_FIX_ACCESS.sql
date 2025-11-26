-- ============================================================================
-- DIAGNÓSTICO E CORREÇÃO: Problema de Acesso Após Criação de Conta
-- ============================================================================
-- Este script:
-- 1. Diagnostica se o perfil e organização foram criados corretamente
-- 2. Corrige políticas RLS que podem estar bloqueando acesso
-- 3. Garante que usuários possam ver seus próprios dados
-- ============================================================================

-- ============================================================================
-- PARTE 1: DIAGNÓSTICO
-- ============================================================================

-- Verifica se há usuários sem perfil
SELECT 
    'Usuários sem perfil' as diagnostico,
    COUNT(*) as quantidade
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;

-- Verifica se há usuários sem organização
SELECT 
    'Usuários sem organização' as diagnostico,
    COUNT(*) as quantidade
FROM auth.users u
LEFT JOIN public.organization_members om ON u.id = om.user_id
WHERE om.user_id IS NULL;

-- Verifica se há perfis sem organização
SELECT 
    'Perfis sem organização' as diagnostico,
    COUNT(*) as quantidade
FROM public.profiles p
LEFT JOIN public.organization_members om ON p.id = om.user_id
WHERE om.user_id IS NULL;

-- ============================================================================
-- PARTE 2: CORREÇÃO DE POLÍTICAS RLS
-- ============================================================================

-- PROBLEMA IDENTIFICADO:
-- A política "Users can view members of their organizations" pode não permitir
-- que um usuário veja seu próprio registro de membro quando ele é o único membro.
-- Vamos adicionar uma política que permite que usuários vejam seus próprios membros.

-- Remove política antiga se existir
DROP POLICY IF EXISTS "Users can view own membership" ON public.organization_members;

-- NOVA POLÍTICA: Usuários podem ver seus próprios registros de membro
-- Isso garante que um usuário sempre possa ver que é membro de uma organização
CREATE POLICY "Users can view own membership"
    ON public.organization_members
    FOR SELECT
    USING (user_id = auth.uid());

-- ============================================================================
-- PARTE 3: GARANTIR QUE O TRIGGER FUNCIONA
-- ============================================================================

-- Verifica se o trigger existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_trigger 
            WHERE tgname = 'on_auth_user_created'
        ) 
        THEN '✅ Trigger existe'
        ELSE '❌ ERRO: Trigger não encontrado'
    END as status_trigger;

-- Verifica se a função existe
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_proc 
            WHERE proname = 'handle_new_user'
        ) 
        THEN '✅ Função existe'
        ELSE '❌ ERRO: Função não encontrada'
    END as status_funcao;

-- ============================================================================
-- PARTE 4: CORREÇÃO MANUAL PARA USUÁRIOS EXISTENTES SEM DADOS
-- ============================================================================

-- IMPORTANTE: Execute esta parte apenas se o diagnóstico mostrar problemas
-- Descomente e ajuste o email do usuário se necessário

/*
-- Exemplo: Corrigir um usuário específico que não tem perfil/organização
-- Substitua 'usuario@email.com' pelo email do usuário com problema

DO $$
DECLARE
    user_id_var UUID;
    org_id_var UUID;
    user_email TEXT := 'usuario@email.com';
    user_name TEXT;
BEGIN
    -- Busca o ID do usuário pelo email
    SELECT id, raw_user_meta_data->>'full_name' INTO user_id_var, user_name
    FROM auth.users
    WHERE email = user_email;
    
    IF user_id_var IS NULL THEN
        RAISE EXCEPTION 'Usuário com email % não encontrado', user_email;
    END IF;
    
    -- Cria o perfil se não existir
    INSERT INTO public.profiles (id, full_name, email)
    VALUES (user_id_var, COALESCE(user_name, user_email), user_email)
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        email = EXCLUDED.email,
        updated_at = NOW();
    
    -- Cria a organização "Personal" se não existir
    SELECT id INTO org_id_var
    FROM public.organizations
    WHERE slug = 'personal-' || user_id_var::TEXT;
    
    IF org_id_var IS NULL THEN
        org_id_var := uuid_generate_v4();
        INSERT INTO public.organizations (id, name, type, slug)
        VALUES (org_id_var, 'Personal', 'personal', 'personal-' || user_id_var::TEXT);
    END IF;
    
    -- Adiciona o usuário como owner se não estiver
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (org_id_var, user_id_var, 'owner')
    ON CONFLICT (organization_id, user_id) DO UPDATE SET
        role = 'owner';
    
    RAISE NOTICE 'Usuário % corrigido com sucesso!', user_email;
END $$;
*/

-- ============================================================================
-- PARTE 5: VERIFICAÇÃO FINAL
-- ============================================================================

-- Lista todos os usuários e seus status
SELECT 
    u.email,
    CASE WHEN p.id IS NOT NULL THEN '✅' ELSE '❌' END as tem_perfil,
    CASE WHEN om.user_id IS NOT NULL THEN '✅' ELSE '❌' END as tem_organizacao,
    u.created_at as data_criacao
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.organization_members om ON u.id = om.user_id
ORDER BY u.created_at DESC
LIMIT 10;

-- ============================================================================
-- ✅ CONCLUSÃO
-- ============================================================================
-- 
-- Após executar este script:
-- 1. Verifique os resultados do diagnóstico
-- 2. Se houver usuários sem perfil/organização, execute a parte 4 (descomentada)
-- 3. Teste fazer login novamente
-- 
-- Se ainda não funcionar, verifique:
-- - Configuração de confirmação de email no Supabase Dashboard
-- - Logs do servidor para ver erros específicos
-- ============================================================================

