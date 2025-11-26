-- ============================================================================
-- Migração 002: Correção para Objetos Já Existentes
-- ============================================================================
-- Este script remove e recria objetos que podem já existir
-- para evitar conflitos ao executar o schema completo
-- ============================================================================
-- 
-- IMPORTANTE: Execute este script se receber erros de "already exists"
-- ao executar o schema completo.
-- ============================================================================

-- ============================================================================
-- REMOVE TRIGGERS EXISTENTES (se houver)
-- ============================================================================

-- Remove triggers de updated_at se existirem
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_organizations_updated_at ON public.organizations;
DROP TRIGGER IF EXISTS update_organization_members_updated_at ON public.organization_members;
DROP TRIGGER IF EXISTS update_accounts_updated_at ON public.accounts;
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;

-- Remove trigger de criação de usuário se existir
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ============================================================================
-- RECRIA TRIGGERS
-- ============================================================================

-- Recria triggers de updated_at
CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at
    BEFORE UPDATE ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organization_members_updated_at
    BEFORE UPDATE ON public.organization_members
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at
    BEFORE UPDATE ON public.accounts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Recria trigger de criação de usuário
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- VERIFICA SE FUNÇÕES EXISTEM E RECRIA
-- ============================================================================

-- Recria função update_updated_at_column (CREATE OR REPLACE já faz isso)
-- Não precisa fazer nada, o CREATE OR REPLACE já trata isso

-- Recria função handle_new_user (CREATE OR REPLACE já faz isso)
-- Não precisa fazer nada, o CREATE OR REPLACE já trata isso

-- ============================================================================
-- VERIFICA POLÍTICAS E RECRIA SE NECESSÁRIO
-- ============================================================================

-- Remove políticas antigas da tabela profiles (se tiverem nomes diferentes)
DROP POLICY IF EXISTS "Usuários podem ver seus próprios perfis" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios perfis" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Sistema pode inserir perfis" ON public.profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;

-- Recria políticas para profiles
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "System can insert profiles"
    ON public.profiles
    FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- FIM DA CORREÇÃO
-- ============================================================================
-- 
-- Após executar este script, o schema deve estar completo e sem conflitos.
-- ============================================================================

