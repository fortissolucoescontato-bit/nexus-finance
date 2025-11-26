# Migrações do Banco de Dados

Esta pasta contém as migrações oficiais do banco de dados Supabase.

## Estrutura de Nomenclatura

As migrações seguem o padrão: `NNN_descricao.sql`

- `NNN` - Número sequencial (000, 001, 002, ...)
- `descricao` - Descrição em snake_case

## Ordem de Execução

As migrações são executadas em ordem numérica pelo Supabase:

1. `000_initial_schema.sql` - Schema inicial completo
2. `001_create_profiles_table.sql` - Tabela de perfis
3. `002_fix_existing_objects.sql` - Correções de objetos existentes
4. `003_fix_organizations_insert_rls.sql` - Correção RLS para INSERT
5. `004_create_organization_function.sql` - Função para criar organização
6. `005_fix_rls_final_definitive.sql` - Correção final de RLS
7. `006_fix_organizations_update_rls.sql` - Correção RLS para UPDATE

## Scripts Auxiliares

Scripts de teste, diagnóstico e correção manual estão em `docs/sql/`.

## Como Adicionar Nova Migração

1. Crie um arquivo com o próximo número sequencial
2. Use snake_case para o nome
3. Adicione comentários explicando o que a migração faz
4. Teste localmente antes de fazer commit

Exemplo: `007_add_transactions_table.sql`

