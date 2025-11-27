# Migrações do Banco de Dados

Esta pasta contém as migrações oficiais do banco de dados Supabase.

## Estrutura de Nomenclatura

As migrações seguem o padrão: `NNN_descricao.sql`

- `NNN` - Número sequencial (000, 001, 002, ...)
- `descricao` - Descrição em snake_case

## Ordem de Execução

### Para novos projetos:
1. Execute `000_initial_schema.sql` - Schema inicial completo
2. Execute `999_FINALIZAR_MVP.sql` - Políticas RLS e categorias pré-definidas

### Para projetos existentes:
Execute apenas `999_FINALIZAR_MVP.sql` - Ele consolida todas as correções necessárias.

## Arquivos Principais

- `000_initial_schema.sql` - Schema inicial completo (tabelas, triggers, funções básicas)
- `006_fix_organizations_update_rls.sql` - Correção RLS para UPDATE de organizações
- `999_FINALIZAR_MVP.sql` - **Script único para finalizar MVP** (execute este!)

## Scripts Auxiliares

Scripts de teste, diagnóstico e correção manual estão em `docs/sql/`.

## Como Adicionar Nova Migração

1. Crie um arquivo com o próximo número sequencial
2. Use snake_case para o nome
3. Adicione comentários explicando o que a migração faz
4. Teste localmente antes de fazer commit

Exemplo: `013_add_new_feature.sql`

