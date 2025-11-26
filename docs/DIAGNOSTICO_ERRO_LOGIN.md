# 🔍 Diagnóstico: Erro "Erro inesperado. Tente novamente."

## 📋 O Que Foi Melhorado

O código de login foi atualizado para:
- ✅ Tratar corretamente os redirects do Next.js (evita erros falsos)
- ✅ Adicionar logs detalhados no console do servidor
- ✅ Detectar erros de confirmação de email
- ✅ Mostrar mensagens de erro mais específicas

## 🔍 Como Diagnosticar o Problema

### 1. Verificar Logs do Servidor

**No terminal onde o Next.js está rodando**, procure por mensagens como:

```
Resultado do login: { hasError: true, errorMessage: "...", ... }
Erro no login: ...
```

**O que procurar:**
- Se `hasError: true`, veja qual é o `errorMessage`
- Se `errorStatus` está presente, anote o código
- Se `userConfirmed: 'Não'`, o email não foi confirmado

### 2. Verificar Configuração de Email no Supabase

1. Acesse o **Supabase Dashboard**
2. Vá em **Authentication** → **Settings** → **Email Auth**
3. Verifique se **"Enable email confirmations"** está:
   - **Ativado**: Você precisa confirmar o email antes de fazer login
   - **Desativado**: Pode fazer login sem confirmar email

**Para teste rápido**, desative temporariamente a confirmação de email.

### 3. Verificar Variáveis de Ambiente

Certifique-se de que o arquivo `.env.local` contém:

```env
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
```

**Como verificar:**
- No terminal, execute: `echo $NEXT_PUBLIC_SUPABASE_URL` (Linux/Mac)
- Ou verifique o arquivo `.env.local` diretamente

### 4. Verificar Status do Usuário no Banco

Execute este SQL no Supabase:

```sql
SELECT 
    u.email,
    u.email_confirmed_at,
    u.created_at,
    CASE WHEN p.id IS NOT NULL THEN '✅' ELSE '❌' END as tem_perfil,
    CASE WHEN om.user_id IS NOT NULL THEN '✅' ELSE '❌' END as tem_organizacao
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
LEFT JOIN public.organization_members om ON u.id = om.user_id
WHERE u.email = 'lucasv.oliveira777@gmail.com';
```

**O que verificar:**
- `email_confirmed_at` deve ter uma data (se confirmação estiver ativada)
- `tem_perfil` deve ser ✅
- `tem_organizacao` deve ser ✅

### 5. Testar Login Novamente

Após verificar tudo acima:

1. **Limpe o cache do navegador** (Ctrl+Shift+Delete)
2. **Faça logout** (se estiver logado)
3. **Tente fazer login novamente**
4. **Observe o terminal do servidor** para ver os logs detalhados

## 🛠️ Possíveis Soluções

### Solução 1: Desativar Confirmação de Email (Desenvolvimento)

1. Supabase Dashboard → Authentication → Settings → Email Auth
2. Desative **"Enable email confirmations"**
3. Salve
4. Tente fazer login novamente

### Solução 2: Confirmar Email Manualmente

Se a confirmação estiver ativada:

1. Verifique sua caixa de entrada (e spam)
2. Clique no link de confirmação
3. Tente fazer login novamente

**Ou confirme manualmente no Supabase:**
1. Supabase Dashboard → Authentication → Users
2. Encontre seu usuário
3. Clique em "..." → "Send confirmation email"
4. Ou marque como "Email confirmed" manualmente

### Solução 3: Verificar Senha

Certifique-se de que está usando a senha correta:

- A senha que você usou ao criar a conta
- Se esqueceu, use "Reset password" no Supabase Dashboard

### Solução 4: Recriar Usuário (Último Recurso)

Se nada funcionar:

1. Delete o usuário no Supabase Dashboard
2. Crie uma nova conta
3. Execute o script `FIX_MISSING_DATA_AND_POLICIES.sql` se necessário

## 📊 Informações para Enviar

Se ainda não funcionar, me envie:

1. **Logs do servidor** (copie as mensagens do terminal)
2. **Resultado do SQL** acima (status do usuário)
3. **Configuração de email** (ativada/desativada)
4. **Mensagem de erro exata** que aparece na tela

## ✅ Próximos Passos

1. Verifique os logs do servidor primeiro
2. Tente desativar a confirmação de email temporariamente
3. Verifique o status do usuário no banco
4. Tente fazer login novamente
5. Se ainda não funcionar, me envie as informações acima

---

**Dica**: Os logs detalhados agora vão mostrar exatamente qual é o problema!

