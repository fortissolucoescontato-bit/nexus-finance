# 📦 Configuração do Banco de Dados Supabase

Este diretório contém as migrações SQL necessárias para configurar o banco de dados do projeto.

## ✅ Status Atual

**O schema completo já foi executado no Supabase!** 🎉

O arquivo `supabase/migrations/000_initial_schema.sql` contém todo o schema que foi executado, incluindo:

- ✅ Tabela `profiles` - Perfis de usuários
- ✅ Tabela `organizations` - Organizações (multi-tenancy)
- ✅ Tabela `organization_members` - Relação usuários ↔ organizações
- ✅ Tabela `accounts` - Contas financeiras (bancos, carteiras, cartões)
- ✅ Tabela `categories` - Categorias de transações
- ✅ Tabela `transactions` - Transações financeiras
- ✅ Triggers automáticos (cria perfil e organização ao cadastrar usuário)
- ✅ Políticas RLS (Row Level Security) completas
- ✅ Índices para performance

## 📋 Estrutura do Banco de Dados

### Tabelas Principais

1. **`profiles`**: Perfis de usuários
   - Extensão da tabela `auth.users`
   - Armazena `full_name`, `avatar_url`, `email`

2. **`organizations`**: Organizações (multi-tenancy)
   - Cada usuário recebe automaticamente uma organização "Personal"
   - Tipo: `personal` ou `business`
   - Slug único para URLs amigáveis

3. **`organization_members`**: Relação usuários ↔ organizações
   - Define quem tem acesso a qual organização
   - Papéis: `owner` ou `member`

4. **`accounts`**: Contas financeiras
   - Tipos: `bank`, `cash`, `credit`
   - Saldo armazenado em centavos (BIGINT)

5. **`categories`**: Categorias de transações
   - Tipos: `income` (receita) ou `expense` (despesa)
   - Ícone do Lucide React

6. **`transactions`**: Transações financeiras
   - Valores em centavos (BIGINT)
   - Status: `pending` ou `paid`
   - Relacionada com conta, categoria e organização

### Funcionalidades Automáticas

**Trigger `on_auth_user_created`**:
- Quando um usuário se cadastra, automaticamente:
  1. Cria um perfil na tabela `profiles`
  2. Cria uma organização "Personal"
  3. Adiciona o usuário como `owner` da organização

## 🔍 Verificações

Para verificar se tudo está funcionando, execute no SQL Editor:

```sql
-- Verificar se as tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Verificar perfis criados
SELECT * FROM public.profiles;

-- Verificar organizações criadas
SELECT * FROM public.organizations;

-- Verificar membros
SELECT * FROM public.organization_members;
```

## 🔒 Segurança (RLS)

As políticas RLS garantem que:
- ✅ Usuários só podem ver seus próprios perfis
- ✅ Usuários só podem atualizar seus próprios perfis
- ✅ O sistema pode criar perfis automaticamente (via trigger)

## ⚠️ Problemas Comuns

### Erro: "Database error saving new user"

**Causa:** A tabela `profiles` ou o trigger não foram criados.

**Solução:**
1. Verifique se executou a migração SQL
2. Verifique se a tabela existe: `SELECT * FROM public.profiles;`
3. Verifique se o trigger existe:
   ```sql
   SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
   ```

### Erro: "permission denied for table profiles"

**Causa:** As políticas RLS estão bloqueando a inserção.

**Solução:**
1. Verifique se as políticas foram criadas:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'profiles';
   ```
2. Execute novamente a parte das políticas da migração

## 📚 Próximos Passos

Após configurar o banco de dados:

1. ✅ Execute a migração
2. ✅ Teste criando um usuário
3. ✅ Verifique se o perfil foi criado automaticamente
4. 📝 Configure outras tabelas conforme necessário (organizations, transactions, etc.)

## 🔗 Links Úteis

- [Documentação do Supabase](https://supabase.com/docs)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- [Triggers no PostgreSQL](https://www.postgresql.org/docs/current/triggers.html)

