-- ============================================================================
-- MIGRAÇÃO: 012_add_default_categories.sql
-- DATA: 2025-01-XX
-- DESCRIÇÃO: Cria categorias pré-definidas para todas as organizações
--            e função para criar categorias padrão quando nova organização é criada
-- ============================================================================

-- ============================================================================
-- FUNÇÃO: create_default_categories
-- ============================================================================
-- Cria categorias padrão para uma organização
-- ============================================================================

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
    ON CONFLICT DO NOTHING; -- Evita duplicatas se já existirem

    -- Categorias de RECEITAS (income)
    INSERT INTO public.categories (organization_id, name, type, icon) VALUES
        (p_organization_id, 'Salário', 'income', 'dollar-sign'),
        (p_organization_id, 'Freelance', 'income', 'briefcase'),
        (p_organization_id, 'Investimentos', 'income', 'trending-up'),
        (p_organization_id, 'Vendas', 'income', 'shopping-cart'),
        (p_organization_id, 'Presentes', 'income', 'gift'),
        (p_organization_id, 'Outros', 'income', 'more-horizontal')
    ON CONFLICT DO NOTHING; -- Evita duplicatas se já existirem
END;
$$;

-- ============================================================================
-- PERMISSÕES
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.create_default_categories(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_default_categories(UUID) TO anon;

-- ============================================================================
-- TRIGGER: Cria categorias padrão quando organização é criada
-- ============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_organization()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Cria categorias padrão para a nova organização
    PERFORM public.create_default_categories(NEW.id);
    RETURN NEW;
END;
$$;

-- Remove trigger existente (se houver)
DROP TRIGGER IF EXISTS on_organization_created ON public.organizations;

-- Cria trigger que dispara após inserção de organização
CREATE TRIGGER on_organization_created
    AFTER INSERT ON public.organizations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_organization();

-- ============================================================================
-- CRIA CATEGORIAS PARA ORGANIZAÇÕES EXISTENTES
-- ============================================================================
-- Se você já tem organizações criadas, este bloco cria categorias para elas
-- ============================================================================

DO $$
DECLARE
    org_record RECORD;
BEGIN
    -- Para cada organização existente que não tem categorias
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
-- VERIFICAÇÃO
-- ============================================================================

-- Lista categorias criadas por organização
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
-- NOTAS
-- ============================================================================
-- - Categorias de despesas: 10 categorias padrão
-- - Categorias de receitas: 6 categorias padrão
-- - Total: 16 categorias por organização
-- - O trigger garante que novas organizações recebam categorias automaticamente
-- ============================================================================

