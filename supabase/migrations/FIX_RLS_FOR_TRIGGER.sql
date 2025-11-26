-- ============================================================================
-- CORREÇÃO CRÍTICA: Ajusta Políticas RLS para Permitir o Trigger
-- ============================================================================
-- O problema: Mesmo com SECURITY DEFINER, as políticas RLS ainda bloqueiam
-- a inserção quando o trigger tenta criar perfis/organizações.
-- 
-- SOLUÇÃO: Ajustar as políticas para permitir inserção pelo trigger
-- ============================================================================

-- ============================================================================
-- CORREÇÃO 1: Política de INSERT para profiles (JÁ DEVE EXISTIR)
-- ============================================================================

-- Garante que a política permite inserção sem restrições (usado pelo trigger)
DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;
CREATE POLICY "System can insert profiles"
    ON public.profiles
    FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- CORREÇÃO 2: Política de INSERT para organizations
-- ============================================================================

-- O trigger precisa criar organizações, então precisamos permitir isso
-- A política atual pode estar muito restritiva
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "System can create organizations" ON public.organizations;

-- Cria política que permite inserção (usado pelo trigger)
CREATE POLICY "System can create organizations"
    ON public.organizations
    FOR INSERT
    WITH CHECK (true);

-- Também mantém a política para usuários autenticados criarem organizações
CREATE POLICY "Authenticated users can create organizations"
    ON public.organizations
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- CORREÇÃO 3: Política de INSERT para organization_members
-- ============================================================================

-- O trigger precisa adicionar membros, mas a política atual exige ser owner
-- Isso cria um problema: o trigger não pode adicionar o primeiro membro
DROP POLICY IF EXISTS "Owners can add members" ON public.organization_members;
DROP POLICY IF EXISTS "System can add members" ON public.organization_members;

-- Política para o sistema (trigger) adicionar membros
CREATE POLICY "System can add members"
    ON public.organization_members
    FOR INSERT
    WITH CHECK (true);

-- Política para owners adicionarem membros (depois que já existem)
CREATE POLICY "Owners can add members"
    ON public.organization_members
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.organization_members om
            WHERE om.organization_id = organization_members.organization_id
            AND om.user_id = auth.uid()
            AND om.role = 'owner'
        )
    );

-- ============================================================================
-- ALTERNATIVA: Bypass RLS temporariamente na função
-- ============================================================================
-- Se as políticas acima não funcionarem, podemos modificar a função
-- para usar SET LOCAL row_security = off dentro da função.
-- Mas primeiro vamos tentar com as políticas ajustadas.
-- ============================================================================

-- Recria a função handle_new_user com tratamento de erro melhorado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_org_id UUID;
    user_email TEXT;
    user_name TEXT;
BEGIN
    -- Obtém email e nome do usuário recém-criado
    user_email := NEW.email;
    user_name := COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email);
    
    -- Desabilita RLS temporariamente para esta transação
    -- Isso permite que o trigger insira dados mesmo com RLS ativo
    PERFORM set_config('row_security', 'off', true);
    
    -- Cria o perfil do usuário
    INSERT INTO public.profiles (id, full_name, email)
    VALUES (NEW.id, user_name, user_email)
    ON CONFLICT (id) DO NOTHING;
    
    -- Cria uma organização "Personal" para o usuário
    new_org_id := uuid_generate_v4();
    INSERT INTO public.organizations (id, name, type, slug)
    VALUES (
        new_org_id,
        'Personal',
        'personal',
        'personal-' || NEW.id::TEXT
    )
    ON CONFLICT (id) DO NOTHING;
    
    -- Adiciona o usuário como owner da organização "Personal"
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (new_org_id, NEW.id, 'owner')
    ON CONFLICT (organization_id, user_id) DO NOTHING;
    
    -- Reabilita RLS para a próxima operação
    PERFORM set_config('row_security', 'on', true);
    
    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Em caso de erro, loga e re-lança
        -- Isso ajuda a identificar o problema
        RAISE EXCEPTION 'Erro ao criar perfil e organização: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- ============================================================================
-- VERIFICAÇÃO: Testa se tudo está correto
-- ============================================================================

-- Verifica se o trigger existe
SELECT 
    '✅ Trigger configurado' as status,
    tgname as nome
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created';

-- Verifica se a função foi atualizada
SELECT 
    '✅ Função atualizada' as status,
    proname as nome,
    prosecdef as security_definer
FROM pg_proc
WHERE proname = 'handle_new_user';

-- ============================================================================
-- ✅ PRONTO! 
-- ============================================================================
-- 
-- A função agora:
-- 1. Desabilita RLS temporariamente durante a execução
-- 2. Cria o perfil, organização e membro
-- 3. Reabilita RLS
-- 4. Tem tratamento de erro melhorado
-- 
-- Teste criar um usuário novamente!
-- ============================================================================

