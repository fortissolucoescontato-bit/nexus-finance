-- ============================================================================
-- SCRIPT ÚNICO: FINALIZAR MVP
-- DATA: 2025-01-XX
-- DESCRIÇÃO: Executa todas as migrações necessárias para finalizar o MVP
--            Consolida: RLS policies + Categorias pré-definidas
-- ============================================================================
-- 
-- INSTRUÇÕES:
-- 1. Copie e cole todo este script no SQL Editor do Supabase
-- 2. Execute o script completo
-- 3. Verifique se todas as políticas foram criadas corretamente
-- ============================================================================

-- ============================================================================
-- PARTE 1: POLÍTICAS RLS PARA ACCOUNTS
-- ============================================================================

ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view accounts of their organizations" ON public.accounts;
DROP POLICY IF EXISTS "Members can create accounts in their organizations" ON public.accounts;
DROP POLICY IF EXISTS "Members can update accounts of their organizations" ON public.accounts;
DROP POLICY IF EXISTS "Members can delete accounts of their organizations" ON public.accounts;

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
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.organization_members
            WHERE organization_members.organization_id = accounts.organization_id
            AND organization_members.user_id = auth.uid()
        )
    );

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
-- PARTE 2: POLÍTICAS RLS PARA CATEGORIES
-- ============================================================================

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view categories of their organizations" ON public.categories;
DROP POLICY IF EXISTS "Members can create categories in their organizations" ON public.categories;
DROP POLICY IF EXISTS "Members can update categories of their organizations" ON public.categories;
DROP POLICY IF EXISTS "Members can delete categories of their organizations" ON public.categories;

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
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.organization_members
            WHERE organization_members.organization_id = categories.organization_id
            AND organization_members.user_id = auth.uid()
        )
    );

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
-- PARTE 3: POLÍTICAS RLS PARA TRANSACTIONS
-- ============================================================================

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view transactions of their organizations" ON public.transactions;
DROP POLICY IF EXISTS "Members can create transactions in their organizations" ON public.transactions;
DROP POLICY IF EXISTS "Members can update transactions of their organizations" ON public.transactions;
DROP POLICY IF EXISTS "Members can delete transactions of their organizations" ON public.transactions;

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
    )
    WITH CHECK (
        EXISTS (
            SELECT 1
            FROM public.organization_members
            WHERE organization_members.organization_id = transactions.organization_id
            AND organization_members.user_id = auth.uid()
        )
    );

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
-- PARTE 4: CATEGORIAS PRÉ-DEFINIDAS
-- ============================================================================

-- Função para criar categorias padrão
CREATE OR REPLACE FUNCTION public.create_default_categories(p_organization_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Categorias de DESPESAS (expense)
    INSERT INTO public.categories (organization_id, name, type, icon) VALUES
        (p_organization_id, 'Alimentação', 'expense', 'utensils'),
        (p_organization_id, 'Transporte', 'expense', 'car'),
        (p_organization_id, 'Moradia', 'expense', 'home'),
        (p_organization_id, 'Saúde', 'expense', 'heart'),
        (p_organization_id, 'Educação', 'expense', 'book'),
        (p_organization_id, 'Lazer', 'expense', 'gamepad-2'),
        (p_organization_id, 'Compras', 'expense', 'shopping-bag'),
        (p_organization_id, 'Contas e Serviços', 'expense', 'receipt'),
        (p_organization_id, 'Impostos', 'expense', 'file-text'),
        (p_organization_id, 'Outros', 'expense', 'more-horizontal')
    ON CONFLICT DO NOTHING;

    -- Categorias de RECEITAS (income)
    INSERT INTO public.categories (organization_id, name, type, icon) VALUES
        (p_organization_id, 'Salário', 'income', 'dollar-sign'),
        (p_organization_id, 'Freelance', 'income', 'briefcase'),
        (p_organization_id, 'Investimentos', 'income', 'trending-up'),
        (p_organization_id, 'Vendas', 'income', 'shopping-cart'),
        (p_organization_id, 'Presentes', 'income', 'gift'),
        (p_organization_id, 'Outros', 'income', 'more-horizontal')
    ON CONFLICT DO NOTHING;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_default_categories(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_default_categories(UUID) TO anon;

-- Trigger para criar categorias quando organização é criada
CREATE OR REPLACE FUNCTION public.handle_new_organization()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    PERFORM public.create_default_categories(NEW.id);
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_organization_created ON public.organizations;

CREATE TRIGGER on_organization_created
    AFTER INSERT ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_organization();

-- Cria categorias para organizações existentes
DO $$
DECLARE
    org_record RECORD;
BEGIN
    FOR org_record IN 
        SELECT id 
        FROM public.organizations
        WHERE id NOT IN (
            SELECT DISTINCT organization_id 
            FROM public.categories
        )
    LOOP
        PERFORM public.create_default_categories(org_record.id);
    END LOOP;
END $$;

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

-- Verifica políticas de accounts
SELECT 'ACCOUNTS' AS tabela, COUNT(*) AS total_politicas
FROM pg_policies
WHERE tablename = 'accounts';

-- Verifica políticas de categories
SELECT 'CATEGORIES' AS tabela, COUNT(*) AS total_politicas
FROM pg_policies
WHERE tablename = 'categories';

-- Verifica políticas de transactions
SELECT 'TRANSACTIONS' AS tabela, COUNT(*) AS total_politicas
FROM pg_policies
WHERE tablename = 'transactions';

-- Verifica categorias criadas por organização
SELECT 
    o.name AS organization_name,
    COUNT(c.id) AS total_categories,
    COUNT(CASE WHEN c.type = 'expense' THEN 1 END) AS expense_categories,
    COUNT(CASE WHEN c.type = 'income' THEN 1 END) AS income_categories
FROM public.organizations o
LEFT JOIN public.categories c ON c.organization_id = o.id
GROUP BY o.id, o.name
ORDER BY o.name;

-- ============================================================================
-- ✅ MVP FINALIZADO!
-- ============================================================================
-- 
-- Após executar este script, você deve ter:
-- - 4 políticas RLS em accounts (SELECT, INSERT, UPDATE, DELETE)
-- - 4 políticas RLS em categories (SELECT, INSERT, UPDATE, DELETE)
-- - 4 políticas RLS em transactions (SELECT, INSERT, UPDATE, DELETE)
-- - 16 categorias pré-definidas por organização (10 despesas + 6 receitas)
-- 
-- O MVP está 100% funcional! 🎉
-- ============================================================================

