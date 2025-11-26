# 🚀 Instruções Rápidas - Corrigir Erro RLS

## ⚡ Solução Rápida (2 passos)

### 1️⃣ Execute a Função Stored Procedure no Supabase

Acesse **Supabase Dashboard → SQL Editor** e execute:

```sql
-- Remove função existente
DROP FUNCTION IF EXISTS public.create_personal_organization(UUID, TEXT);

-- Cria função que bypassa RLS
CREATE OR REPLACE FUNCTION public.create_personal_organization(
    p_user_id UUID,
    p_organization_name TEXT
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_org_id UUID;
    v_slug TEXT;
BEGIN
    -- Validação
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'User ID não pode ser nulo';
    END IF;
    
    IF p_organization_name IS NULL OR LENGTH(TRIM(p_organization_name)) < 2 THEN
        RAISE EXCEPTION 'Nome da organização deve ter pelo menos 2 caracteres';
    END IF;
    
    -- Verifica se já tem organização
    IF EXISTS (
        SELECT 1 FROM public.organization_members 
        WHERE user_id = p_user_id LIMIT 1
    ) THEN
        SELECT organization_id INTO v_org_id
        FROM public.organization_members
        WHERE user_id = p_user_id LIMIT 1;
        RETURN v_org_id;
    END IF;
    
    -- Gera UUID e slug
    v_org_id := uuid_generate_v4();
    v_slug := LOWER(REGEXP_REPLACE(
        REGEXP_REPLACE(TRIM(p_organization_name), '[^a-zA-Z0-9\s]+', '', 'g'),
        '\s+', '-', 'g'
    ));
    v_slug := REGEXP_REPLACE(v_slug, '^-+|-+$', '', 'g') || '-' || SUBSTRING(p_user_id::TEXT, 1, 8);
    
    -- Garante perfil existe
    INSERT INTO public.profiles (id, full_name, email)
    SELECT 
        p_user_id,
        COALESCE(
            (SELECT raw_user_meta_data->>'full_name' FROM auth.users WHERE id = p_user_id),
            (SELECT email FROM auth.users WHERE id = p_user_id),
            'Usuário'
        ),
        COALESCE((SELECT email FROM auth.users WHERE id = p_user_id), '')
    ON CONFLICT (id) DO UPDATE
    SET 
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        email = COALESCE(EXCLUDED.email, profiles.email);
    
    -- Cria organização
    INSERT INTO public.organizations (id, name, type, slug)
    VALUES (v_org_id, TRIM(p_organization_name), 'personal', v_slug);
    
    -- Adiciona usuário como owner
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (v_org_id, p_user_id, 'owner')
    ON CONFLICT (organization_id, user_id) DO NOTHING;
    
    RETURN v_org_id;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Erro ao criar organização: %', SQLERRM;
END;
$$;

-- Permite execução
GRANT EXECUTE ON FUNCTION public.create_personal_organization(UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.create_personal_organization(UUID, TEXT) TO anon;
```

### 2️⃣ Teste na Aplicação

1. ✅ Volte para sua aplicação
2. ✅ Faça login (se necessário)
3. ✅ Tente criar uma organização

**Pronto! O código já foi atualizado para usar a função stored procedure.**

---

## 🔍 Se ainda não funcionar

### Verifique se a função foi criada:

```sql
SELECT proname, prosecdef 
FROM pg_proc 
WHERE proname = 'create_personal_organization';
```

Deve retornar 1 linha com `prosecdef = true`.

### Verifique se você está autenticado:

No console do navegador (F12), verifique se há erros. O erro deve ser diferente agora se a função não existir.

---

## 📝 O que mudou?

- ✅ **Código atualizado**: `app/(app)/dashboard/actions.ts` agora usa `.rpc()` ao invés de `.insert()`
- ✅ **Função criada**: Bypassa RLS usando `SECURITY DEFINER`
- ✅ **Transação atômica**: Cria organização + membro em uma única operação

---

**Arquivos criados:**
- `supabase/migrations/004_create_organization_function.sql` - Função stored procedure
- `SOLUCAO_ERRO_RLS_ORGANIZATIONS.md` - Guia completo

