-- =====================================================
-- Migração 001: Criar tabela de perfis de usuário
-- =====================================================
-- Esta migração cria a tabela de perfis de usuário e um trigger
-- que automaticamente cria um perfil quando um novo usuário é criado.
--
-- IMPORTANTE: Execute este script no SQL Editor do Supabase
-- antes de permitir que usuários se cadastrem.
-- =====================================================

-- 1. Cria a tabela de perfis de usuário
-- Esta tabela armazena informações adicionais do usuário
-- além dos dados básicos armazenados no auth.users
CREATE TABLE IF NOT EXISTS public.profiles (
  -- ID do perfil (mesmo ID do usuário em auth.users)
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Nome completo do usuário (sincronizado com user_metadata)
  full_name TEXT,
  
  -- Email do usuário (sincronizado com auth.users para acesso rápido)
  email TEXT,
  
  -- ID da organização à qual o usuário pertence (multi-tenancy)
  -- Por enquanto pode ser NULL, mas no futuro será obrigatório
  organization_id UUID,
  
  -- Data de criação do perfil
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  
  -- Data da última atualização
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. Cria índice para melhorar performance de consultas por organização
CREATE INDEX IF NOT EXISTS idx_profiles_organization_id ON public.profiles(organization_id);

-- 3. Cria índice para melhorar performance de consultas por email
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 4. Habilita Row Level Security (RLS) na tabela
-- RLS é essencial para multi-tenancy e segurança
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 5. Cria políticas RLS (Row Level Security)
-- Políticas permitem que usuários vejam e editem apenas seus próprios perfis

-- Política: Usuários podem ver apenas seus próprios perfis
CREATE POLICY "Usuários podem ver seus próprios perfis"
  ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Política: Usuários podem atualizar apenas seus próprios perfis
CREATE POLICY "Usuários podem atualizar seus próprios perfis"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Política: Sistema pode inserir novos perfis (usado pelo trigger)
-- Esta política permite que o trigger crie perfis automaticamente
CREATE POLICY "Sistema pode inserir perfis"
  ON public.profiles
  FOR INSERT
  WITH CHECK (true);

-- 6. Cria função para atualizar automaticamente o campo updated_at
-- Esta função é chamada sempre que um perfil é atualizado
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualiza o campo updated_at com a data/hora atual
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Cria trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 8. Cria função que será executada quando um novo usuário for criado
-- Esta função cria automaticamente um perfil para o novo usuário
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Insere um novo perfil na tabela profiles quando um usuário é criado
  -- Os dados são extraídos do NEW record (novo usuário em auth.users)
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,                                                    -- ID do usuário
    NEW.raw_user_meta_data->>'full_name',                      -- Nome completo dos metadados
    NEW.email                                                  -- Email do usuário
  )
  ON CONFLICT (id) DO UPDATE SET
    -- Se o perfil já existir (caso raro), atualiza com os dados mais recentes
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- SECURITY DEFINER permite que a função execute com privilégios elevados
-- necessários para inserir na tabela profiles

-- 9. Cria trigger que chama a função handle_new_user quando um usuário é criado
-- Este trigger é executado automaticamente após INSERT na tabela auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================
-- 
-- Após executar este script:
-- 1. Verifique se a tabela foi criada: SELECT * FROM public.profiles;
-- 2. Teste criando um usuário no dashboard do Supabase
-- 3. Verifique se o perfil foi criado automaticamente
-- =====================================================

