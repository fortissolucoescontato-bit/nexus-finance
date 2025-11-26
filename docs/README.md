# Documentação do Projeto

Esta pasta contém documentação e scripts auxiliares do projeto Nexus Finance.

## Estrutura

```
docs/
├── README.md                    # Este arquivo
├── *.md                         # Documentação do projeto
└── sql/                         # Scripts SQL auxiliares (não são migrações)
    └── *.sql                    # Scripts de teste, diagnóstico e correção
```

## Migrações SQL

As migrações oficiais do banco de dados estão em `supabase/migrations/` e seguem o padrão:
- `000_initial_schema.sql` - Schema inicial
- `001_*.sql`, `002_*.sql`, etc. - Migrações sequenciais

## Scripts SQL Auxiliares

Os arquivos em `docs/sql/` são scripts auxiliares para:
- Testes e diagnóstico
- Correções temporárias
- Verificações de schema
- Debugging

**⚠️ Importante:** Estes scripts NÃO são executados automaticamente pelo Supabase. Use-os apenas quando necessário.

## Documentação

Os arquivos `.md` nesta pasta contêm:
- Análises do projeto
- Guias de solução de problemas
- Instruções de deploy
- Estrutura do projeto

