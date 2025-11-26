-- ============================================================================
-- CORREÇÃO: Remove Todas as Políticas Antigas Antes de Recriar
-- ============================================================================
-- Execute este script se receber erro "policy already exists"
-- ============================================================================

-- Remove TODAS as políticas de profiles
DROP POLICY IF EXISTS "Usuários podem ver seus próprios perfis" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios perfis" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Sistema pode inserir perfis" ON public.profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;

-- Remove TODAS as políticas de organizations
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON public.organizations;
DROP POLICY IF EXISTS "Owners can update organizations" ON public.organizations;
DROP POLICY IF EXISTS "Owners can delete organizations" ON public.organizations;
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;

-- Remove TODAS as políticas de organization_members
DROP POLICY IF EXISTS "Users can view members of their organizations" ON public.organization_members;
DROP POLICY IF EXISTS "Owners can add members" ON public.organization_members;
DROP POLICY IF EXISTS "Owners can update members" ON public.organization_members;
DROP POLICY IF EXISTS "Owners can remove members" ON public.organization_members;

-- Remove TODAS as políticas de accounts
DROP POLICY IF EXISTS "Users can view accounts of their organizations" ON public.accounts;
DROP POLICY IF EXISTS "Members can create accounts in their organizations" ON public.accounts;
DROP POLICY IF EXISTS "Members can update accounts of their organizations" ON public.accounts;
DROP POLICY IF EXISTS "Members can delete accounts of their organizations" ON public.accounts;

-- Remove TODAS as políticas de categories
DROP POLICY IF EXISTS "Users can view categories of their organizations" ON public.categories;
DROP POLICY IF EXISTS "Members can create categories in their organizations" ON public.categories;
DROP POLICY IF EXISTS "Members can update categories of their organizations" ON public.categories;
DROP POLICY IF EXISTS "Members can delete categories of their organizations" ON public.categories;

-- Remove TODAS as políticas de transactions
DROP POLICY IF EXISTS "Users can view transactions of their organizations" ON public.transactions;
DROP POLICY IF EXISTS "Members can create transactions in their organizations" ON public.transactions;
DROP POLICY IF EXISTS "Members can update transactions of their organizations" ON public.transactions;
DROP POLICY IF EXISTS "Members can delete transactions of their organizations" ON public.transactions;

-- ============================================================================
-- ✅ PRONTO! Todas as políticas foram removidas.
-- ============================================================================
-- 
-- Agora você pode executar o 000_initial_schema.sql novamente sem erros.
-- ============================================================================

