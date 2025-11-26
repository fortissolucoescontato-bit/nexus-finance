-- ============================================================================
-- Nexus Finance - Schema Inicial Completo
-- ============================================================================
-- Este arquivo contém o DDL completo para o projeto de gestão financeira
-- multi-tenant, incluindo tabelas, RLS policies e triggers automáticos.
-- ============================================================================
-- 
-- IMPORTANTE: Este schema já foi executado no Supabase.
-- Mantido aqui apenas para referência e documentação.
-- ============================================================================

-- ============================================================================
-- EXTENSÕES
-- ============================================================================

-- Habilita UUID v4 para geração automática de IDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABELA: profiles
-- ============================================================================

-- Extensão da tabela auth.users do Supabase
-- Armazena informações adicionais do perfil do usuário
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    email TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comentários para documentação
COMMENT ON TABLE public.profiles IS 'Perfis de usuários - extensão da tabela auth.users';
COMMENT ON COLUMN public.profiles.id IS 'ID do usuário (FK para auth.users)';
COMMENT ON COLUMN public.profiles.full_name IS 'Nome completo do usuário';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL do avatar do usuário';
COMMENT ON COLUMN public.profiles.email IS 'Email do usuário (cópia para consultas rápidas)';

-- ============================================================================
-- TABELA: organizations
-- ============================================================================

-- Coração do sistema multi-tenant
-- Cada organização pode ser 'personal' (pessoal) ou 'business' (empresarial)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('personal', 'business')),
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comentários para documentação
COMMENT ON TABLE public.organizations IS 'Organizações - núcleo do sistema multi-tenant';
COMMENT ON COLUMN public.organizations.id IS 'ID único da organização';
COMMENT ON COLUMN public.organizations.name IS 'Nome da organização';
COMMENT ON COLUMN public.organizations.type IS 'Tipo: personal (pessoal) ou business (empresarial)';
COMMENT ON COLUMN public.organizations.slug IS 'Slug único para URLs amigáveis';

-- Índice para busca rápida por slug
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);

-- ============================================================================
-- TABELA: organization_members
-- ============================================================================

-- Relação muitos-para-muitos entre usuários e organizações
-- Define quem tem acesso a qual organização e com qual papel
CREATE TABLE IF NOT EXISTS public.organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'member')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Garante que um usuário não pode ter múltiplos registros na mesma organização
    UNIQUE(organization_id, user_id)
);

-- Comentários para documentação
COMMENT ON TABLE public.organization_members IS 'Membros de organizações - define acesso e permissões';
COMMENT ON COLUMN public.organization_members.organization_id IS 'ID da organização';
COMMENT ON COLUMN public.organization_members.user_id IS 'ID do usuário (FK para auth.users)';
COMMENT ON COLUMN public.organization_members.role IS 'Papel: owner (proprietário) ou member (membro)';

-- Índices para consultas rápidas
CREATE INDEX IF NOT EXISTS idx_organization_members_org_id ON public.organization_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id ON public.organization_members(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_members_org_user ON public.organization_members(organization_id, user_id);

-- ============================================================================
-- TABELA: accounts
-- ============================================================================

-- Contas bancárias, carteiras e cartões de crédito
-- Todos os valores monetários são armazenados em centavos (BIGINT)
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('bank', 'cash', 'credit')),
    balance BIGINT NOT NULL DEFAULT 0, -- Saldo em centavos
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comentários para documentação
COMMENT ON TABLE public.accounts IS 'Contas financeiras (bancárias, carteiras, cartões)';
COMMENT ON COLUMN public.accounts.organization_id IS 'ID da organização (multi-tenancy)';
COMMENT ON COLUMN public.accounts.name IS 'Nome da conta (ex: "Conta Corrente Nubank")';
COMMENT ON COLUMN public.accounts.type IS 'Tipo: bank (banco), cash (dinheiro), credit (crédito)';
COMMENT ON COLUMN public.accounts.balance IS 'Saldo atual em centavos (BIGINT para evitar problemas de precisão)';

-- Índice para consultas por organização
CREATE INDEX IF NOT EXISTS idx_accounts_organization_id ON public.accounts(organization_id);

-- ============================================================================
-- TABELA: categories
-- ============================================================================

-- Categorias de transações (receitas e despesas)
-- Cada categoria pertence a uma organização
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    icon TEXT, -- Nome do ícone (ex: "dollar-sign" do Lucide)
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comentários para documentação
COMMENT ON TABLE public.categories IS 'Categorias de transações financeiras';
COMMENT ON COLUMN public.categories.organization_id IS 'ID da organização (multi-tenancy)';
COMMENT ON COLUMN public.categories.name IS 'Nome da categoria (ex: "Alimentação", "Salário")';
COMMENT ON COLUMN public.categories.type IS 'Tipo: income (receita) ou expense (despesa)';
COMMENT ON COLUMN public.categories.icon IS 'Nome do ícone do Lucide React';

-- Índice para consultas por organização
CREATE INDEX IF NOT EXISTS idx_categories_organization_id ON public.categories(organization_id);

-- ============================================================================
-- TABELA: transactions
-- ============================================================================

-- Movimentações financeiras (receitas e despesas)
-- Todos os valores monetários são armazenados em centavos (BIGINT)
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    amount BIGINT NOT NULL, -- Valor em centavos (positivo para receitas, negativo para despesas)
    date DATE NOT NULL,
    description TEXT,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('pending', 'paid')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comentários para documentação
COMMENT ON TABLE public.transactions IS 'Transações financeiras (receitas e despesas)';
COMMENT ON COLUMN public.transactions.organization_id IS 'ID da organização (multi-tenancy)';
COMMENT ON COLUMN public.transactions.account_id IS 'ID da conta associada';
COMMENT ON COLUMN public.transactions.category_id IS 'ID da categoria (opcional)';
COMMENT ON COLUMN public.transactions.amount IS 'Valor em centavos (BIGINT para precisão)';
COMMENT ON COLUMN public.transactions.date IS 'Data da transação';
COMMENT ON COLUMN public.transactions.description IS 'Descrição da transação';
COMMENT ON COLUMN public.transactions.type IS 'Tipo: income (receita) ou expense (despesa)';
COMMENT ON COLUMN public.transactions.status IS 'Status: pending (pendente) ou paid (pago)';

-- Índices para consultas otimizadas
CREATE INDEX IF NOT EXISTS idx_transactions_organization_id ON public.transactions(organization_id);
CREATE INDEX IF NOT EXISTS idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_org_date ON public.transactions(organization_id, date DESC);

-- ============================================================================
-- FUNÇÃO: update_updated_at_column
-- ============================================================================

-- Função auxiliar para atualizar automaticamente a coluna updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS: updated_at automático
-- ============================================================================

-- Remove triggers existentes (caso já existam de execução anterior)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_organizations_updated_at ON public.organizations;
DROP TRIGGER IF EXISTS update_organization_members_updated_at ON public.organization_members;
DROP TRIGGER IF EXISTS update_accounts_updated_at ON public.accounts;
DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
DROP TRIGGER IF EXISTS update_transactions_updated_at ON public.transactions;

-- Atualiza automaticamente a coluna updated_at em todas as tabelas
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

-- ============================================================================
-- FUNÇÃO: handle_new_user
-- ============================================================================

-- Cria automaticamente um profile e uma organização "Personal" quando
-- um novo usuário se cadastra no auth.users
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
    
    -- Cria o perfil do usuário
    INSERT INTO public.profiles (id, full_name, email)
    VALUES (NEW.id, user_name, user_email);
    
    -- Cria uma organização "Personal" para o usuário
    new_org_id := uuid_generate_v4();
    INSERT INTO public.organizations (id, name, type, slug)
    VALUES (
        new_org_id,
        'Personal',
        'personal',
        'personal-' || NEW.id::TEXT
    );
    
    -- Adiciona o usuário como owner da organização "Personal"
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (new_org_id, NEW.id, 'owner');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGER: handle_new_user
-- ============================================================================

-- Remove trigger existente (caso já exista de execução anterior)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Dispara automaticamente após a criação de um novo usuário em auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Habilita RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLICIES: profiles
-- ============================================================================

-- Remove políticas antigas (caso existam com nomes diferentes)
DROP POLICY IF EXISTS "Usuários podem ver seus próprios perfis" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Usuários podem atualizar seus próprios perfis" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Sistema pode inserir perfis" ON public.profiles;
DROP POLICY IF EXISTS "System can insert profiles" ON public.profiles;

-- Usuários podem ver apenas seu próprio perfil
CREATE POLICY "Users can view own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Usuários podem atualizar apenas seu próprio perfil
CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- Sistema pode inserir perfis (usado pelo trigger)
CREATE POLICY "System can insert profiles"
    ON public.profiles
    FOR INSERT
    WITH CHECK (true);

-- ============================================================================
-- POLICIES: organizations
-- ============================================================================

-- Remove políticas antigas (caso já existam)
DROP POLICY IF EXISTS "Users can view organizations they belong to" ON public.organizations;
DROP POLICY IF EXISTS "Owners can update organizations" ON public.organizations;
DROP POLICY IF EXISTS "Owners can delete organizations" ON public.organizations;
DROP POLICY IF EXISTS "Authenticated users can create organizations" ON public.organizations;

-- Usuários podem ver apenas organizações das quais são membros
CREATE POLICY "Users can view organizations they belong to"
    ON public.organizations
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.organization_members
            WHERE organization_members.organization_id = organizations.id
            AND organization_members.user_id = auth.uid()
        )
    );

-- Apenas owners podem atualizar organizações
CREATE POLICY "Owners can update organizations"
    ON public.organizations
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
            FROM public.organization_members
            WHERE organization_members.organization_id = organizations.id
            AND organization_members.user_id = auth.uid()
            AND organization_members.role = 'owner'
        )
    );

-- Apenas owners podem deletar organizações
CREATE POLICY "Owners can delete organizations"
    ON public.organizations
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1
            FROM public.organization_members
            WHERE organization_members.organization_id = organizations.id
            AND organization_members.user_id = auth.uid()
            AND organization_members.role = 'owner'
        )
    );

-- Usuários autenticados podem criar organizações (serão adicionados como owner via código)
CREATE POLICY "Authenticated users can create organizations"
    ON public.organizations
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

-- ============================================================================
-- POLICIES: organization_members
-- ============================================================================

-- Remove políticas antigas (caso já existam)
DROP POLICY IF EXISTS "Users can view members of their organizations" ON public.organization_members;
DROP POLICY IF EXISTS "Owners can add members" ON public.organization_members;
DROP POLICY IF EXISTS "Owners can update members" ON public.organization_members;
DROP POLICY IF EXISTS "Owners can remove members" ON public.organization_members;

-- Usuários podem ver membros apenas das organizações das quais fazem parte
CREATE POLICY "Users can view members of their organizations"
    ON public.organization_members
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.organization_members om
            WHERE om.organization_id = organization_members.organization_id
            AND om.user_id = auth.uid()
        )
    );

-- Apenas owners podem adicionar novos membros
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

-- Apenas owners podem atualizar membros (mudar role, etc)
CREATE POLICY "Owners can update members"
    ON public.organization_members
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
            FROM public.organization_members om
            WHERE om.organization_id = organization_members.organization_id
            AND om.user_id = auth.uid()
            AND om.role = 'owner'
        )
    );

-- Apenas owners podem remover membros
CREATE POLICY "Owners can remove members"
    ON public.organization_members
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1
            FROM public.organization_members om
            WHERE om.organization_id = organization_members.organization_id
            AND om.user_id = auth.uid()
            AND om.role = 'owner'
        )
    );

-- ============================================================================
-- POLICIES: accounts
-- ============================================================================

-- Remove políticas antigas (caso já existam)
DROP POLICY IF EXISTS "Users can view accounts of their organizations" ON public.accounts;
DROP POLICY IF EXISTS "Members can create accounts in their organizations" ON public.accounts;
DROP POLICY IF EXISTS "Members can update accounts of their organizations" ON public.accounts;
DROP POLICY IF EXISTS "Members can delete accounts of their organizations" ON public.accounts;

-- Usuários podem ver contas apenas das organizações das quais são membros
CREATE POLICY "Users can view accounts of their organizations"
    ON public.accounts
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.organization_members
            WHERE organization_members.organization_id = accounts.organization_id
            AND organization_members.user_id = auth.uid()
        )
    );

-- Membros podem criar contas em organizações das quais fazem parte
CREATE POLICY "Members can create accounts in their organizations"
    ON public.accounts
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.organization_members
            WHERE organization_members.organization_id = accounts.organization_id
            AND organization_members.user_id = auth.uid()
        )
    );

-- Membros podem atualizar contas de organizações das quais fazem parte
CREATE POLICY "Members can update accounts of their organizations"
    ON public.accounts
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
            FROM public.organization_members
            WHERE organization_members.organization_id = accounts.organization_id
            AND organization_members.user_id = auth.uid()
        )
    );

-- Membros podem deletar contas de organizações das quais fazem parte
CREATE POLICY "Members can delete accounts of their organizations"
    ON public.accounts
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1
            FROM public.organization_members
            WHERE organization_members.organization_id = accounts.organization_id
            AND organization_members.user_id = auth.uid()
        )
    );

-- ============================================================================
-- POLICIES: categories
-- ============================================================================

-- Remove políticas antigas (caso já existam)
DROP POLICY IF EXISTS "Users can view categories of their organizations" ON public.categories;
DROP POLICY IF EXISTS "Members can create categories in their organizations" ON public.categories;
DROP POLICY IF EXISTS "Members can update categories of their organizations" ON public.categories;
DROP POLICY IF EXISTS "Members can delete categories of their organizations" ON public.categories;

-- Usuários podem ver categorias apenas das organizações das quais são membros
CREATE POLICY "Users can view categories of their organizations"
    ON public.categories
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.organization_members
            WHERE organization_members.organization_id = categories.organization_id
            AND organization_members.user_id = auth.uid()
        )
    );

-- Membros podem criar categorias em organizações das quais fazem parte
CREATE POLICY "Members can create categories in their organizations"
    ON public.categories
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.organization_members
            WHERE organization_members.organization_id = categories.organization_id
            AND organization_members.user_id = auth.uid()
        )
    );

-- Membros podem atualizar categorias de organizações das quais fazem parte
CREATE POLICY "Members can update categories of their organizations"
    ON public.categories
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
            FROM public.organization_members
            WHERE organization_members.organization_id = categories.organization_id
            AND organization_members.user_id = auth.uid()
        )
    );

-- Membros podem deletar categorias de organizações das quais fazem parte
CREATE POLICY "Members can delete categories of their organizations"
    ON public.categories
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1
            FROM public.organization_members
            WHERE organization_members.organization_id = categories.organization_id
            AND organization_members.user_id = auth.uid()
        )
    );

-- ============================================================================
-- POLICIES: transactions
-- ============================================================================

-- Remove políticas antigas (caso já existam)
DROP POLICY IF EXISTS "Users can view transactions of their organizations" ON public.transactions;
DROP POLICY IF EXISTS "Members can create transactions in their organizations" ON public.transactions;
DROP POLICY IF EXISTS "Members can update transactions of their organizations" ON public.transactions;
DROP POLICY IF EXISTS "Members can delete transactions of their organizations" ON public.transactions;

-- Usuários podem ver transações apenas das organizações das quais são membros
CREATE POLICY "Users can view transactions of their organizations"
    ON public.transactions
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1
            FROM public.organization_members
            WHERE organization_members.organization_id = transactions.organization_id
            AND organization_members.user_id = auth.uid()
        )
    );

-- Membros podem criar transações em organizações das quais fazem parte
CREATE POLICY "Members can create transactions in their organizations"
    ON public.transactions
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.organization_members
            WHERE organization_members.organization_id = transactions.organization_id
            AND organization_members.user_id = auth.uid()
        )
    );

-- Membros podem atualizar transações de organizações das quais fazem parte
CREATE POLICY "Members can update transactions of their organizations"
    ON public.transactions
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1
            FROM public.organization_members
            WHERE organization_members.organization_id = transactions.organization_id
            AND organization_members.user_id = auth.uid()
        )
    );

-- Membros podem deletar transações de organizações das quais fazem parte
CREATE POLICY "Members can delete transactions of their organizations"
    ON public.transactions
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1
            FROM public.organization_members
            WHERE organization_members.organization_id = transactions.organization_id
            AND organization_members.user_id = auth.uid()
        )
    );

-- ============================================================================
-- FIM DO SCHEMA
-- ============================================================================

